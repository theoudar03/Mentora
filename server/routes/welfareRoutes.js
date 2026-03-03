const express = require('express');
const { getWelfareDashboard } = require('../controllers/welfareController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorizeRoles('welfare'), getWelfareDashboard);

module.exports = router;
