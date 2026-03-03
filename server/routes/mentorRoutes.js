const express = require('express');
const { getMentorDashboard, getStudentDetails } = require('../controllers/mentorController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorizeRoles('mentor', 'welfare'), getMentorDashboard);
router.get('/student/:id', protect, authorizeRoles('mentor', 'welfare'), getStudentDetails);

module.exports = router;
