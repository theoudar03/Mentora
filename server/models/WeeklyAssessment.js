const mongoose = require('mongoose');

const weeklyAssessmentSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  id_num: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  week_number: {
    type: Number,
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true
  },
  academic_pressure_score: { type: Number, required: true },
  anxiety_score: { type: Number, required: true },
  family_support_score: { type: Number, required: true },
  loneliness_score: { type: Number, required: true },
  sleep_quality_score: { type: Number, required: true },
  campus_belonging_score: { type: Number, required: true },
  perceived_stress_score: { type: Number, required: true },
  cgpa_score: { type: Number, required: true },
  attendance_score: { type: Number, required: true },
  fee_payment_score: { type: Number, required: true },
  Mental_health_Risk_Status: { type: Number, required: true },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WeeklyAssessment', weeklyAssessmentSchema);
