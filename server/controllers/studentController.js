const Student = require('../models/Student');

exports.getMe = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.user.ref_id });
    if (!student) return res.status(404).json({ message: 'Student details not found' });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
};
