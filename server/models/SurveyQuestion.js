const mongoose = require('mongoose');

const surveyQuestionSchema = new mongoose.Schema({
  question:     { type: String },               // used by full_seed.js
  question_text:{ type: String },               // legacy field name
  factor:       { type: String },               // e.g. 'academic_pressure_score'
  category:     { type: String },               // legacy
  options:      { type: mongoose.Schema.Types.Mixed },  // array of strings or {label,value}
  order_index:  { type: Number, required: true },
  is_active:    { type: Boolean, default: true },
  created_at:   { type: Date, default: Date.now }
}, { strict: false }); // allow whichever shape was inserted

module.exports = mongoose.model('SurveyQuestion', surveyQuestionSchema);
