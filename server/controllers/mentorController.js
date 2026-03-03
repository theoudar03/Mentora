const Assessment = require('../models/Assessment');
const Student = require('../models/Student');

exports.getMentorDashboard = async (req, res) => {
  try {
    // 1. Fetch Students efficiently (lean execution) for the mentor's department only
    const query = req.user.role === 'welfare' ? {} : { department: req.user.department };
    const students = await Student.find(query, 'name department').lean().exec();
    
    // 2. Map student ID lookup dictionary (O(1) access)
    const studentMap = {};
    students.forEach(s => {
      studentMap[s._id.toString()] = {
        name: s.name,
        department: s.department
      };
    });

    // 3. Fetch all assessments quickly
    const allAssessments = await Assessment.find({}, 'student_id Mental_health_Risk_Status created_at time_taken_to_attend_survey')
      .sort({ created_at: 1 }) // Crucial to ensure "latest" maps at the end correctly
      .lean()
      .exec();

    // 4. Extract latest assessment per student manually (O(N) iteration instead of slow DB aggregations)
    const latestAssessmentsMap = {};
    allAssessments.forEach(a => {
      latestAssessmentsMap[a.student_id.toString()] = a;
    });

    let highRisk = 0, mediumRisk = 0, stable = 0;
    const studentsFormatted = [];
    const alerts = [];

    // 5. Build presentation payload without heavy nested lookups
    students.forEach(s => {
      const sId = s._id.toString();
      const latestAssessment = latestAssessmentsMap[sId];
      const score = latestAssessment ? latestAssessment.Mental_health_Risk_Status : 0;
      
      let riskLevel = 'Stable';
      if (score > 65) {
        highRisk++;
        riskLevel = 'High';
        alerts.push({
          id: sId + '_alert',
          type: 'High',
          message: `${s.name} flagged as High Risk`,
          timestamp: latestAssessment.created_at
        });
      } else if (score >= 36) {
        mediumRisk++;
        riskLevel = 'Medium';
      } else {
        stable++;
        riskLevel = 'Low';
      }

      studentsFormatted.push({
        id: sId,
        name: s.name,
        department: s.department,
        surveyScore: score,
        riskLevel: riskLevel,
        lastCheckIn: latestAssessment ? latestAssessment.created_at : null,
        timeTaken: latestAssessment ? latestAssessment.time_taken_to_attend_survey : 0
      });
    });

    // 6. Rapid Trends (group by week) using isolated lightweight execution
    const trends = await Assessment.aggregate([
      {
        $group: {
          _id: { $week: "$created_at" },
          avgScore: { $avg: "$Mental_health_Risk_Status" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const trendData = trends.map((t, idx) => ({
      week: `Week ${idx + 1}`,
      avgScore: Math.round(t.avgScore)
    }));
    
    // Sort alerts by date desc
    alerts.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Ensure trend data is not empty for UI
    if (trendData.length === 0) {
      trendData.push({ week: 'Week 1', avgScore: 50 });
    }

    res.status(200).json({
      riskSummary: {
        highRisk,
        mediumRisk,
        stable,
        trends: {
          highRisk: "+0%", // Base mock comparison
          mediumRisk: "-0%",
          stable: "+0%"
        }
      },
      students: studentsFormatted,
      alerts: alerts.slice(0, 5), // top 5
      trendData: trendData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error loading mentor dashboard', error: error.message });
  }
};

exports.getStudentDetails = async (req, res) => {
  try {
    const studentId = req.params.id;

    const studentBio = await Student.findById(studentId, 'name age gender department year_of_study cgpa').lean().exec();
    if (!studentBio) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Fetch the assessments sorted by newest first rapidly grabbing only necessary fields
    const assessments = await Assessment.find({ student_id: studentId }, 'Mental_health_Risk_Status created_at academic_pressure_score sleep_quality_score campus_belonging_score perceived_stress_score loneliness_score family_support_score screen_time_score other_discomfort time_taken_to_attend_survey')
      .sort({ created_at: -1 })
      .lean()
      .exec();

    const latestAssessment = assessments[0] || null;

    // Build risk history for the last 4 weeks chart
    const riskHistory = assessments.slice(0, 4).reverse().map((a, i) => ({
      week: `Week ${i + 1}`,
      score: a.Mental_health_Risk_Status
    }));

    // Soft AI Mock Insight based on current data
    let aiInsight = "Student metrics appear stable.";
    if (latestAssessment) {
      if (latestAssessment.Mental_health_Risk_Status > 65) {
        aiInsight = `Critical high stress flags identified. Heavy impacts in academic pressure (${latestAssessment.academic_pressure_score}/5) and sleep degradation (${latestAssessment.sleep_quality_score}/5). Active intervention highly recommended.`;
      } else if (latestAssessment.Mental_health_Risk_Status >= 36) {
        aiInsight = `Moderate stress indicated. Recommend reaching out casually regarding campus belonging (${latestAssessment.campus_belonging_score}/5).`;
      }
    }

    res.status(200).json({
      bio: {
        name: studentBio.name,
        age: studentBio.age,
        gender: studentBio.gender,
        department: studentBio.department,
        year_of_study: studentBio.year_of_study,
        cgpa: studentBio.cgpa
      },
      latestAssessment: latestAssessment,
      riskHistory: riskHistory.length > 0 ? riskHistory : [{ week: 'W1', score: 0 }],
      aiInsight: aiInsight
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching detailed student profile', error: error.message });
  }
};
