const express = require('express');
const { predictRisk } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Placeholder route for external ML API
router.post('/predict-risk', protect, predictRisk);

module.exports = router;
