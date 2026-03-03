const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  phone: { type: String, required: true },
  assigned_student_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

module.exports = mongoose.model('Mentor', mentorSchema);
