import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { fetchSurveyQuestions } from '../../api/surveyApi';
import QuestionCard from './QuestionCard';
import ProgressIndicator from './ProgressIndicator';
import SubmitSection from './SubmitSection';

const SurveyContainer = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      // Explicitly fetching from backend as requested
      const response = await fetchSurveyQuestions();
      setQuestions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load weekly check-in. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value
        }))
      };

      await apiClient.post('/surveys/submit', payload);
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong submitting your check-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded w-full mb-8"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-48">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(j => (
                <div key={j} className="h-12 bg-gray-100 rounded-xl flex-1"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank you for checking in.</h2>
        <p className="text-gray-600 mb-6">
          Your wellbeing status has been updated. We are always here to support you.
        </p>
        <button 
          onClick={() => window.location.href = '/student'}
          className="text-indigo-600 font-medium hover:text-indigo-800 hover:underline"
        >
          Return to Dashboard →
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length && questions.length > 0;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {!error && (
        <>
          <ProgressIndicator current={answeredCount} total={questions.length} />
          
          <div className="space-y-6">
            {questions.map((q, index) => (
              <QuestionCard
                key={q._id}
                index={index}
                questionId={q._id}
                questionText={q.question_text}
                options={q.options}
                selectedValue={answers[q._id]}
                onSelect={handleSelect}
              />
            ))}
          </div>

          <SubmitSection 
            isComplete={isComplete} 
            isSubmitting={isSubmitting} 
            onSubmit={handleSubmit} 
          />
        </>
      )}
    </div>
  );
};

export default SurveyContainer;
