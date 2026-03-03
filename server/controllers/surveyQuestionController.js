const SurveyQuestion = require('../models/SurveyQuestion');

exports.getQuestions = async (req, res) => {
  try {
    const questions = await SurveyQuestion.find({ is_active: true }).sort('order_index').lean().exec();
    
    // Normalize options from string arrays to { label, value } if needed
    const normalizedQuestions = questions.map(q => {
      if (Array.isArray(q.options) && q.options.length > 0 && typeof q.options[0] === 'string') {
        const sortedOptions = q.options.map((opt, idx) => ({
          label: opt,
          value: idx + 1
        }));
        return { ...q, options: sortedOptions };
      }
      return q;
    });

    res.status(200).json(normalizedQuestions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching survey questions', error: error.message });
  }
};
