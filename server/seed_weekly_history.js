require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const WeeklyAssessment = require('./models/WeeklyAssessment');
const axios = require('axios');

const normalize = (val) => {
  return Number(val) || 0;
};

const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function seedHistory() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');

    await WeeklyAssessment.deleteMany({});
    console.log('Cleared existing weekly assessments.');

    const students = await Student.find({}).lean();
    console.log(`Found ${students.length} students. Generating 10 weeks of history for each.`);

    let insertedCount = 0;

    for (const student of students) {
      for (let week = 1; week <= 10; week++) {
        const factors = {
          academic_pressure_score: getRandom(2, 5),
          anxiety_score: getRandom(2, 5),
          family_support_score: getRandom(1, 4),
          loneliness_score: getRandom(1, 4),
          sleep_quality_score: getRandom(2, 5),
          campus_belonging_score: getRandom(2, 5),
          perceived_stress_score: getRandom(1, 5),
          cgpa_score: normalize(student.cgpa_score) || 7.5,
          attendance_score: normalize(student.attendance_score) || 80,
          fee_payment_score: normalize(student.fee_paid_late) || 0
        };

        const payload = {
          ...factors,
          screen_time_score: 3 // required for model
        };

        let riskScore = 0;
        try {
          const mlEndpoint = process.env.ML_PREDICT_URL || 'http://localhost:8000/predict-risk';
          const { data } = await axios.post(mlEndpoint, payload, { timeout: 10000 });
          riskScore = data.risk_score;
        } catch (err) {
          console.error(`ML API Error for Student ${student.id_num} Week ${week}:`, err.message);
          riskScore = 50; // Fallback
        }

        // Spread timestamps across the past 10 weeks
        // Week 1 = 10 weeks ago, Week 10 = 1 week ago
        const weeksAgo = 11 - week; 
        const created_at = new Date();
        created_at.setDate(created_at.getDate() - (weeksAgo * 7));

        await WeeklyAssessment.create({
          student_id: student._id,
          id_num: student.id_num,
          department: student.department,
          week_number: week,
          year: new Date().getFullYear(),
          ...factors,
          Mental_health_Risk_Status: parseFloat(Number(riskScore).toFixed(2)),
          created_at
        });

        insertedCount++;
      }
      console.log(`✅ Seeded 10 weeks for student ${student.id_num}`);
    }

    console.log(`Seed complete! Total historical records inserted: ${insertedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedHistory();
