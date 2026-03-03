const express = require('express');
const { getQuestions } = require('../controllers/surveyQuestionController');

const router = express.Router();

// Public route for fetching active survey questions
router.get('/questions', getQuestions);

module.exports = router;
