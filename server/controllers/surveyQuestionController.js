const SurveyQuestion = require('../models/SurveyQuestion');

exports.getQuestions = async (req, res) => {
  try {
    const questions = await SurveyQuestion.find({ is_active: true }).sort('order_index').lean().exec();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching survey questions', error: error.message });
  }
};
