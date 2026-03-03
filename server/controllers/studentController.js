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

    // Enforce 14-day rule
    const now = new Date();
    const lastChanged = user.last_password_change || user.created_at;
    const daysDifference = (now - lastChanged) / (1000 * 60 * 60 * 24);

    if (daysDifference < 14) {
      const remainingDays = Math.ceil(14 - daysDifference);
      return res.status(403).json({
        message: `Password can only be changed after ${remainingDays} day(s).`
      });
    }

    user.password = newPassword; // Gets hashed in pre-save hook
    user.last_password_change = now;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

exports.getPasswordStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'User profile not found' });

    const now = new Date();
    const lastChanged = user.last_password_change || user.created_at;
    const daysDifference = (now - lastChanged) / (1000 * 60 * 60 * 24);

    let canChange = true;
    let remainingDays = 0;
    let nextEligibleDate = now;

    if (daysDifference < 14) {
      canChange = false;
      remainingDays = Math.ceil(14 - daysDifference);
      nextEligibleDate = new Date(lastChanged.getTime() + (14 * 24 * 60 * 60 * 1000));
    }

    res.status(200).json({
      canChange,
      remainingDays,
      nextEligibleDate: nextEligibleDate.toISOString().split('T')[0],
      lastChangedAt: lastChanged.toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching password status', error: error.message });
  }
};
