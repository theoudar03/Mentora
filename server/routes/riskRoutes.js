const express = require('express');
const { getRiskProfile, updateRiskProfile } = require('../controllers/riskController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getRiskProfile)
  .put(protect, authorize('welfare'), updateRiskProfile);

module.exports = router;
