const express = require('express');
const { getMe } = require('../controllers/studentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, authorizeRoles('student'), getMe);

module.exports = router;
