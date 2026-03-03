const mongoose = require('mongoose');

const mentalHealthRiskSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mh_risk_score: {
    type: Number,
    required: true,
  },
  risk_level: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Critical'],
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const MentalHealthRisk = mongoose.model('MentalHealthRisk', mentalHealthRiskSchema);
module.exports = MentalHealthRisk;
