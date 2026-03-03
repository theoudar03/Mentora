const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  student_id:              { type: mongoose.Schema.Types.ObjectId, required: true },
  student_id_num:          { type: String },  // human-readable reference

  // ── 7 Survey-derived factors (numeric for ML)
  academic_pressure_score: { type: Number, required: true },
  anxiety_score:           { type: Number, required: true },
  family_support_score:    { type: Number, required: true },
  loneliness_score:        { type: Number, required: true },
  sleep_quality_score:     { type: Number, required: true },
  campus_belonging_score:  { type: Number, required: true },
  perceived_stress_score:  { type: Number, required: true },

  // ── Academic fields (from student document at time of submission)
  cgpa_score:              { type: Number, required: true },
  attendance_score:        { type: Number, required: true },
  fee_payment_score:       { type: Number, required: true }, // fee_paid_late → normalized

  // ── ML Output
  Mental_health_Risk_Status: { type: Number, required: true },

  // ── Meta
  other_discomfort:            { type: String, default: '' },
  time_taken_to_attend_survey: { type: Number, default: 120 },
  created_at:                  { type: Date, default: Date.now }
});

assessmentSchema.index({ student_id: 1, created_at: -1 });
assessmentSchema.index({ created_at: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
