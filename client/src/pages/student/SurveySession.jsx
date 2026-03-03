import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSurveyQuestions } from '../../api/surveyApi';
import { submitAssessment } from '../../api/assessmentApi';
import QuestionCard from '../../components/survey/QuestionCard';
import ProgressIndicator from '../../components/survey/ProgressIndicator';

const SurveySession = () => {
  const navigate = useNavigate();
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [otherDiscomfort, setOtherDiscomfort] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(120);
  const [startTime, setStartTime] = useState(null);
  
  // Use a ref to access the latest answers/state inside the timer interval without re-running effect
  const answersRef = useRef(answers);
  const isSubmittingRef = useRef(isSubmitting);
  const otherDiscomfortRef = useRef(otherDiscomfort);
  
  useEffect(() => {
    answersRef.current = answers;
    isSubmittingRef.current = isSubmitting;
    otherDiscomfortRef.current = otherDiscomfort;
  }, [answers, isSubmitting, otherDiscomfort]);

  useEffect(() => {
    // Prevent accidental navigation
    const handleBeforeUnload = (e) => {
      if (hasStarted && !isSuccess) {
        e.preventDefault();
        e.returnValue = "Assessment in progress.";
        return "Assessment in progress.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasStarted, isSuccess]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const res = await fetchSurveyQuestions();
        setQuestions(res.data);
      } catch (err) {
        setError('Failed to load questions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  useEffect(() => {
    if (!hasStarted || isSuccess) return;

    if (timeLeft <= 0) {
      if (!isSubmittingRef.current) {
        handleAutoSubmit();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, hasStarted, isSuccess]);

  const handleStart = () => {
    setHasStarted(true);
    setStartTime(Date.now());
  };

  const handleSelect = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleAutoSubmit = async () => {
    // Called when timer reaches 0
    await submitFinal(answersRef.current, otherDiscomfortRef.current, 120);
  };

  const handleManualSubmit = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    await submitFinal(answers, otherDiscomfort, timeTaken);
  };

  const submitFinal = async (currentAnswers, currentOtherDiscomfort, timeTaken) => {
    setIsSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(currentAnswers).map(([questionId, value]) => ({
          questionId,
          value
        })),
        other_discomfort: currentOtherDiscomfort,
        time_taken_to_attend_survey: timeTaken
      };
      
      await submitAssessment(payload);
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <p className="text-gray-400">Loading secure session...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Assessment Completed</h2>
          <p className="text-gray-600 mb-6">
            Your responses have been securely recorded.
          </p>
          <button 
            onClick={() => navigate('/student')}
            className="text-indigo-600 font-medium hover:text-indigo-800 hover:underline"
          >
            Return to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-indigo-100 shadow-sm p-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ready to begin?</h1>
          <div className="bg-amber-50 rounded-xl p-4 text-amber-800 text-sm mb-8 text-left border border-amber-100">
            <p className="font-semibold mb-1">⚠️ Important Rules:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>This assessment is timed (120 seconds).</li>
              <li>Once started, it cannot be paused.</li>
              <li>Do not refresh or click back during the session.</li>
            </ul>
          </div>
          <button 
            onClick={handleStart}
            className="w-full bg-indigo-600 text-white rounded-xl px-6 py-4 font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            Start Check-In
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length && questions.length > 0;
  
  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isLowTime = timeLeft <= 10;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Weekly Wellbeing Check-In
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Stay focused. Your responses help us support you.
          </p>
        </div>
        
        {/* Timer UI */}
        <div className={`
          flex flex-col items-end px-4 py-2 rounded-xl border-2 transition-all
          ${isLowTime ? 'border-red-500 bg-red-50 animate-pulse' : 'border-gray-200 bg-white'}
        `}>
          <span className={`text-2xl font-bold font-mono ${isLowTime ? 'text-red-600' : 'text-gray-800'}`}>
            {formatTime(timeLeft)}
          </span>
          {isLowTime && (
            <span className="text-xs text-red-600 font-bold tracking-wide uppercase">
              ⚠️ 10 secs remaining
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto pb-20">
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm">
            {error}
          </div>
        )}

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

          {/* Any other discomfort input */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex flex-col mb-4">
              <span className="text-sm font-semibold text-indigo-500 mb-2 uppercase tracking-wide">
                Final Feedback
              </span>
              <h3 className="text-xl font-medium text-gray-800 leading-snug">
                Any other discomfort you have faced? (Optional)
              </h3>
            </div>
            <textarea
              className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-gray-700 resize-none"
              placeholder="Type here..."
              value={otherDiscomfort}
              onChange={(e) => setOtherDiscomfort(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            disabled={!isComplete || isSubmitting}
            onClick={handleManualSubmit}
            className={`
              flex items-center justify-center font-medium
              rounded-xl px-8 py-3.5 transition-all
              ${
                !isComplete
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-transparent'
                  : isSubmitting
                    ? 'bg-indigo-400 text-white cursor-wait'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:-translate-y-0.5'
              }
            `}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveySession;
