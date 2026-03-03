const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  department: { type: String, required: true },
  year_of_study: { type: Number, required: true },
  cgpa: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
