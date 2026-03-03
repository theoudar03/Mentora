const mongoose = require('mongoose');

const surveyQuestionSchema = new mongoose.Schema({
  question_text: { type: String, required: true },
  category: { type: String, required: true },
  options: [{
    label: { type: String, required: true },
    value: { type: Number, required: true }
  }],
  order_index: { type: Number, required: true },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SurveyQuestion', surveyQuestionSchema);
