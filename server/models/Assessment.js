const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  cgpa_score: { type: Number, required: true },
  attendance_score: { type: Number, required: true },
  family_support_score: { type: Number, required: true },
  fee_payment_score: { type: Number, required: true },
  perceived_stress_score: { type: Number, required: true },
  anxiety_score: { type: Number, required: true },
  sleep_quality_score: { type: Number, required: true },
  loneliness_score: { type: Number, required: true },
  academic_pressure_score: { type: Number, required: true },
  screen_time_score: { type: Number, required: true },
  campus_belonging_score: { type: Number, required: true },
  other_discomfort: { type: String, default: '' },
  time_taken_to_attend_survey: { type: Number, required: true },
  Mental_health_Risk_Status: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

// Create compound index for the most common querying patterns (Lookups and Sorting)
assessmentSchema.index({ student_id: 1, created_at: -1 });
assessmentSchema.index({ created_at: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
