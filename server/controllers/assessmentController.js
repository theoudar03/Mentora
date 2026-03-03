const Assessment = require('../models/Assessment');
const { predictRisk } = require('../services/mlService');

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
      { $unwind: '$student' },
      {
        $project: {
          student_name: '$student.name',
          department: '$student.department',
          cgpa_score: 1,
          attendance_score: 1,
          Mental_health_Risk_Status: 1,
          submission_timestamp: '$created_at'
        }
      }
    ]);
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assessments', error: error.message });
  }
};

exports.checkWeek = async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0,0,0,0);

    const existing = await Assessment.findOne({
      student_id: req.user.id,
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

exports.submitAssessment = async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0,0,0,0);

    const existing = await Assessment.findOne({
      student_id: req.user.id,
      created_at: { $gte: startOfWeek }
    }).select('_id').lean().exec();

    if (existing) {
      return res.status(403).json({ message: "You have already completed this week's assessment." });
    }

    const { answers, other_discomfort, time_taken_to_attend_survey } = req.body;
    
    // Construct default features exactly aligned with ML model requirements
    const cgpa_score = 8.0; 
    const attendance_score = 85.0;
    const family_support_score = 3.0; 
    const fee_payment_score = 5.0;
    const perceived_stress_score = 3.0;
    const anxiety_score = 3.0;
    const sleep_quality_score = 3.0;
    const loneliness_score = 3.0;
    const academic_pressure_score = 3.0;
    const screen_time_score = 3.0;
    const campus_belonging_score = 3.0;

    // Await live Python ML Service prediction 
    const riskScore = await predictRisk({
      cgpa_score,
      attendance_score,
      family_support_score,
      fee_payment_score,
      perceived_stress_score,
      anxiety_score,
      sleep_quality_score,
      loneliness_score,
      academic_pressure_score,
      screen_time_score,
      campus_belonging_score
    });

    const newAssessment = new Assessment({
      student_id: req.user.id,
      cgpa_score,
      attendance_score,
      family_support_score, 
      fee_payment_score,
      perceived_stress_score,
      anxiety_score,
      sleep_quality_score,
      loneliness_score,
      academic_pressure_score,
      screen_time_score,
      campus_belonging_score,
      other_discomfort: other_discomfort || '',
      time_taken_to_attend_survey: time_taken_to_attend_survey || 120,
      Mental_health_Risk_Status: riskScore
    });

    await newAssessment.save();
    res.status(201).json({ message: 'Assessment submitted successfully.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting assessment', error: error.message });
  }
};
