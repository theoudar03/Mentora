const express = require('express');
const { getQuestions, getWeeklySurvey } = require('../controllers/surveyQuestionController');

const router = express.Router();

// Public route for fetching active survey questions
router.get('/questions', getQuestions);
router.get('/weekly', getWeeklySurvey);

module.exports = router;
