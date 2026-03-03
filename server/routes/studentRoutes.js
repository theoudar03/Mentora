const express = require('express');
const { getMe, changePassword, getPasswordStatus } = require('../controllers/studentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, authorizeRoles('student'), getMe);
router.get('/password-status', protect, authorizeRoles('student'), getPasswordStatus);
router.patch('/change-password', protect, authorizeRoles('student'), changePassword);

module.exports = router;
