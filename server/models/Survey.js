const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [{
    questionId: String,
    answerText: String,
    score: Number
  }],
  survey_score: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

const Survey = mongoose.model('Survey', surveySchema);
module.exports = Survey;
