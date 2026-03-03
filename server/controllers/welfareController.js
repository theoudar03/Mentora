const Assessment = require('../models/Assessment');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');

exports.getWelfareDashboard = async (req, res) => {
  try {
    const students = await Student.find({}, 'name department').lean().exec();
    const studentsMap = {};
    students.forEach(s => { studentsMap[s._id.toString()] = s; });

    const allAssessments = await Assessment.find({}, 'student_id Mental_health_Risk_Status created_at time_taken_to_attend_survey')
      .sort({ created_at: 1 }).lean().exec();

    // Extract Latest assessments
    const latestAssessmentsMap = {};
    allAssessments.forEach(a => {
      latestAssessmentsMap[a.student_id.toString()] = a;
    });

    const mentors = await Mentor.find({}, 'name assigned_student_ids').lean().exec();
    const mentorMap = {}; 
    mentors.forEach(m => {
      if (m.assigned_student_ids) {
        m.assigned_student_ids.forEach(sid => {
          mentorMap[sid.toString()] = m.name;
        });
      }
    });

    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;

    const deptScores = {};
    const deptCounts = {};
    const highRiskStudents = [];
    const alerts = [];

    students.forEach(s => {
      const sId = s._id.toString();
      const latestAssessment = latestAssessmentsMap[sId];
      if (!latestAssessment) return;

      const score = latestAssessment.Mental_health_Risk_Status;
      
      if (score > 65) {
        highRiskCount++;
        highRiskStudents.push({
          id: sId,
          name: s.name,
          department: s.department,
          riskScore: score,
          timeTaken: latestAssessment.time_taken_to_attend_survey,
          mentor: mentorMap[sId] || "Unassigned"
        });
        
        alerts.push({
           id: "alert_" + sId,
           type: "High",
           message: `${s.name} from ${s.department} detected with critical stress markers.`,
           time: "Just now" 
        });
      } else if (score >= 36) {
        mediumRiskCount++;
      } else {
        lowRiskCount++;
      }

      if (!deptScores[s.department]) {
        deptScores[s.department] = 0;
        deptCounts[s.department] = 0;
      }
      deptScores[s.department] += score;
      deptCounts[s.department]++;
    });

    const departmentStress = Object.keys(deptScores).map(dept => ({
      name: dept,
      score: Math.round(deptScores[dept] / deptCounts[dept])
    }));

    // Soft AI Mock Insight based on current institutional data
    let aiInsight = "Campus metrics appear stable.";
    if (departmentStress.length > 0) {
      const highestStressDept = [...departmentStress].sort((a,b) => b.score - a.score)[0];
      if (highestStressDept.score > 50) {
        aiInsight = `AI Insight: ${highestStressDept.name} department stress is critically high (${highestStressDept.score}/100 average). Immediate structural intervention recommended.`;
      } else {
        aiInsight = `AI Insight: Campus wellbeing is balanced. ${highestStressDept.name} shows slightly elevated metrics.`;
      }
    }

    res.status(200).json({
      summary: {
        totalMonitored: students.length,
        highRisk: highRiskCount,
        mediumRisk: mediumRiskCount,
        weeklyImprovement: "+5%"
      },
      departmentStress,
      riskDistribution: [
        { name: "High Risk", value: highRiskCount, color: "#ef4444" },
        { name: "Medium Risk", value: mediumRiskCount, color: "#facc15" },
        { name: "Low Risk", value: lowRiskCount, color: "#6366f1" }
      ],
      highRiskStudents: highRiskStudents.sort((a,b) => b.riskScore - a.riskScore).slice(0, 10),
      alerts: alerts.slice(0, 5),
      aiInsight
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching welfare dashboard', error: error.message });
  }
};
