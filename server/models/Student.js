const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  id_num:                  { type: String, required: true },
  name:                    { type: String, required: true },
  password:                { type: String },
  role:                    { type: String, default: 'student' },
  department:              { type: String, required: true },

  // ── 7 Psychological factors (stored as strings, rewritten after each survey)
  academic_pressure_score: { type: String, default: '3' },
  anxiety_score:           { type: String, default: '3' },
  family_support_score:    { type: String, default: '3' },
  loneliness_score:        { type: String, default: '3' },
  sleep_quality_score:     { type: String, default: '3' },
  campus_belonging_score:  { type: String, default: '3' },
  perceived_stress_score:  { type: String, default: '3' },

  // ── Academic fields (static, never overwritten by survey)
  cgpa_score:              { type: String, default: '7.5' },
  attendance_score:        { type: String, default: '80' },
  fee_paid_late:           { type: String, default: '0' },

  // ── ML Output (written after each survey submission)
  Mental_health_Risk_Status: { type: Number, default: null },

  created_at: { type: Date, default: Date.now }
}, { strict: false }); // strict:false allows extra fields from old docs without errors

module.exports = mongoose.model('Student', studentSchema);
