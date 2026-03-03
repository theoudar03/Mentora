const express = require('express');
const { getAssessments, checkWeek, submitAssessment } = require('../controllers/assessmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorizeRoles('mentor', 'welfare'), getAssessments);
router.get('/check-week', protect, authorizeRoles('student'), checkWeek);
router.post('/submit', protect, authorizeRoles('student'), submitAssessment);

module.exports = router;
