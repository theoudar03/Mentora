const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getMe = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.user.ref_id })
      .select('-Mental_health_Risk_Status')
      .lean();
    if (!student) return res.status(404).json({ message: 'Student details not found' });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User profile not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect current password' });

    user.password = newPassword; // Gets hashed in pre-save hook
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};
