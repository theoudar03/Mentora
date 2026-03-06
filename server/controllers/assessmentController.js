const Assessment   = require('../models/Assessment');
const WeeklyAssessment = require('../models/WeeklyAssessment');
const Student      = require('../models/Student');
const SurveyQ      = require('../models/SurveyQuestion');
const { predictRisk } = require('../services/mlService');
const { getWeekNumber } = require('../utils/getCurrentWeek');

// ─── Factor extraction — all logic server-side, never exposed to frontend ─────
function computeFactors(values) {
  if (values.length !== 10) throw new Error('Exactly 10 answer values required.');
  // Survey options are 0–4 (Never→Always). Normalize to 1–5 for ML model compatibility.
  const v = values.map(x => x + 1);
  return {
    academic_pressure_score: Math.round((v[0] + v[1]) / 2),
    anxiety_score:           Math.round((v[2] + v[3]) / 2),
    family_support_score:    Math.round((v[4] + v[5]) / 2),
    loneliness_score:        v[6],
    sleep_quality_score:     v[7],
    campus_belonging_score:  v[8],
    perceived_stress_score:  v[9],
  };
}

// ─── GET /api/assessments/check-week ─────────────────────────────────────────
exports.checkWeek = async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const existing = await Assessment.findOne({
      student_id: req.user.ref_id,
      created_at: { $gte: startOfWeek }
    }).select('_id').lean().exec();

    const nextAvailableDate = new Date(startOfWeek);
    nextAvailableDate.setDate(nextAvailableDate.getDate() + 7);

    res.status(200).json({
      alreadySubmitted: !!existing,
      nextAvailableDate: nextAvailableDate.toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error checking weekly status', error: error.message });
  }
};

// ─── POST /api/assessments/submit ─────────────────────────────────────────────
// Full pipeline: Survey → Factor Extraction → Student Rewrite → ML → DB
exports.submitAssessment = async (req, res) => {
  try {
    // ── 1. Weekly duplicate check ──────────────────────────────────────────
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const existing = await Assessment.findOne({
      student_id: req.user.ref_id,
      created_at: { $gte: startOfWeek }
    }).select('_id').lean().exec();

    if (existing) {
      return res.status(403).json({ message: "You have already completed this week's assessment." });
    }

    // ── 2. Validate payload ────────────────────────────────────────────────
    const { answers, other_discomfort, time_taken_to_attend_survey } = req.body;

    if (!Array.isArray(answers) || answers.length !== 10) {
      return res.status(400).json({
        message: `Expected exactly 10 answers. Received ${answers?.length ?? 0}.`
      });
    }

    // ── 3. Fetch the current week's active survey questions ──────────────
    // Must match the same set the student was shown (weekly rotation)
    const weekNumber = getWeekNumber();
    const surveySet = (weekNumber % 5) + 1;

    const questions = await SurveyQ
      .find({ is_active: true, survey_set: surveySet })
      .sort({ order_index: 1 })
      .lean()
      .exec();

    if (questions.length !== 10) {
      return res.status(500).json({
        message: `Survey config error: expected 10 active questions for set ${surveySet}, found ${questions.length}. Please run the seed script.`
      });
    }

    // ── 4. Map answers by question order_index ────────────────────────────
    // Frontend sends { questionId, value } — build position lookup from DB order
    const qPositionMap = {};
    questions.forEach((q, idx) => {
      qPositionMap[String(q._id)] = idx;
    });

    // Sort answers by their question's order_index
    const sortedAnswers = [...answers].sort((a, b) => {
      const aId = a.questionId || a.question_id;
      const bId = b.questionId || b.question_id;
      return (qPositionMap[aId] ?? 99) - (qPositionMap[bId] ?? 99);
    });

    // Extract and validate numeric values (0–4, matching seed data options)
    for (let i = 0; i < sortedAnswers.length; i++) {
      const a = sortedAnswers[i];
      const v = Number(a.value);
      if (isNaN(v) || v < 0 || v > 4) {
        return res.status(400).json({ message: `Answer #${i + 1} value "${a.value}" is invalid. Must be 0–4.` });
      }
    }
    const values = sortedAnswers.map(a => Number(a.value));

    // ── 5. Compute 7 psychological factors (server-side only) ─────────────
    const factors = computeFactors(values);

    // ── 6A. Rewrite ONLY the 7 factor fields in student document ─────────
    await Student.updateOne(
      { _id: req.user.ref_id },
      {
        $set: {
          academic_pressure_score: String(factors.academic_pressure_score),
          anxiety_score:           String(factors.anxiety_score),
          family_support_score:    String(factors.family_support_score),
          loneliness_score:        String(factors.loneliness_score),
          sleep_quality_score:     String(factors.sleep_quality_score),
          campus_belonging_score:  String(factors.campus_belonging_score),
          perceived_stress_score:  String(factors.perceived_stress_score),
        }
      }
    );
    console.log(`✅ Student ${req.user.id_num || req.user.ref_id} factors updated.`);

    // ── 6B. Re-fetch updated student — DB is the SINGLE SOURCE OF TRUTH ──
    const student = await Student.findById(req.user.ref_id).lean().exec();
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found after update.' });
    }

    // ── 7. Build ML payload from fresh student document ───────────────────
    // fee_paid_late (0–30 days) → fee_payment_score (1–5)
    const feePaidLate = Number(student.fee_paid_late) || 0;
    const fee_payment_score = Math.max(1, Math.min(5,
      5 - Math.round((feePaidLate / 30) * 4)
    ));

    const mlPayload = {
      family_support_score:    Number(student.family_support_score),
      fee_payment_score:       fee_payment_score,
      perceived_stress_score:  Number(student.perceived_stress_score),
      anxiety_score:           Number(student.anxiety_score),
      sleep_quality_score:     Number(student.sleep_quality_score),
      loneliness_score:        Number(student.loneliness_score),
      academic_pressure_score: Number(student.academic_pressure_score),
      screen_time_score:       3,   // not collected; neutral default
      campus_belonging_score:  Number(student.campus_belonging_score),
      cgpa_score:              Number(student.cgpa_score)       || 7.5,
      attendance_score:        Number(student.attendance_score) || 80,
    };

    console.log(`📊 Requesting ML prediction for student ${student.id_num}...`);

    // ── 8. Call FastAPI ML service ─────────────────────────────────────────
    let riskScore;
    try {
      riskScore = await predictRisk(mlPayload);
      // Clamp to 0–100 range
      riskScore = Math.max(0, Math.min(100, Number(riskScore)));
      console.log(`🎯 Risk score received: ${riskScore.toFixed(2)}`);
    } catch (mlErr) {
      console.error('❌ ML service failed:', mlErr.message);
      return res.status(503).json({
        message: 'Risk prediction service unavailable. Survey factors saved. Please try again shortly.',
        factorsSaved: true
      });
    }

    // ── 9. Write risk score back into student document ────────────────────
    await Student.updateOne(
      { _id: student._id },
      { $set: { Mental_health_Risk_Status: parseFloat(riskScore.toFixed(2)) } }
    );
    console.log(`✅ Student ${student.id_num} Mental_health_Risk_Status updated: ${riskScore.toFixed(2)}`);
    console.log(`Risk updated for student: ${student.id_num}`);

    // ── 10. Save full assessment record ───────────────────────────────────
    await Assessment.create({
      student_id:              student._id,
      student_id_num:          student.id_num,
      academic_pressure_score: Number(student.academic_pressure_score),
      anxiety_score:           Number(student.anxiety_score),
      family_support_score:    Number(student.family_support_score),
      loneliness_score:        Number(student.loneliness_score),
      sleep_quality_score:     Number(student.sleep_quality_score),
      campus_belonging_score:  Number(student.campus_belonging_score),
      perceived_stress_score:  Number(student.perceived_stress_score),
      cgpa_score:              mlPayload.cgpa_score,
      attendance_score:        mlPayload.attendance_score,
      fee_payment_score:       fee_payment_score,
      Mental_health_Risk_Status: parseFloat(riskScore.toFixed(2)),
      other_discomfort:            other_discomfort || '',
      time_taken_to_attend_survey: time_taken_to_attend_survey || 120,
    });

    const previousWeeksCount = await WeeklyAssessment.countDocuments({ student_id: student._id });
    const currentWeek = previousWeeksCount + 1;

    await WeeklyAssessment.create({
      student_id: student._id,
      id_num: student.id_num,
      department: student.department,
      week_number: currentWeek,
      year: new Date().getFullYear(),
      academic_pressure_score: Number(student.academic_pressure_score),
      anxiety_score:           Number(student.anxiety_score),
      family_support_score:    Number(student.family_support_score),
      loneliness_score:        Number(student.loneliness_score),
      sleep_quality_score:     Number(student.sleep_quality_score),
      campus_belonging_score:  Number(student.campus_belonging_score),
      perceived_stress_score:  Number(student.perceived_stress_score),
      cgpa_score:              mlPayload.cgpa_score,
      attendance_score:        mlPayload.attendance_score,
      fee_payment_score:       fee_payment_score,
      Mental_health_Risk_Status: parseFloat(riskScore.toFixed(2))
    });

    return res.status(201).json({
      message: 'Assessment completed successfully.'
    });

  } catch (error) {
    console.error('❌ Assessment submission error:', error.message);
    res.status(500).json({ message: error.message || 'Error submitting assessment' });
  }
};

// ─── GET /api/assessments (mentor/welfare) ────────────────────────────────────
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: { path: '$student', preserveNullAndEmpty: false } },
      {
        $project: {
          student_name:              '$student.name',
          student_id_num:            '$student.id_num',
          department:                '$student.department',
          cgpa_score:                1,
          attendance_score:          1,
          academic_pressure_score:   1,
          anxiety_score:             1,
          sleep_quality_score:       1,
          Mental_health_Risk_Status: 1,
          submission_timestamp:      '$created_at'
        }
      },
      { $sort: { submission_timestamp: -1 } }
    ]);
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assessments', error: error.message });
  }
};
