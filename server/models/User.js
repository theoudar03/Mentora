const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  id_num: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["student", "mentor", "welfare"],
    required: true
  },
  department: String,
  ref_id: String, // links to student/mentor/welfare collection
  created_at: { type: Date, default: Date.now },
  password_last_changed_at: { type: Date, default: null }
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
