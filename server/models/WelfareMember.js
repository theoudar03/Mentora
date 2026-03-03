const mongoose = require('mongoose');

const welfareMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  priority_access: { type: Boolean, default: true },
  status: { type: String, default: 'active' },
  assigned_student_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

module.exports = mongoose.model('WelfareMember', welfareMemberSchema);
