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
  const [weekNumber, setWeekNumber] = useState(null);
  const [answers, setAnswers] = useState({});
  const [otherDiscomfort, setOtherDiscomfort] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [riskScore, setRiskScore] = useState(null);
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
        // Since we upgraded to dynamic weekly API, the response has a `questions` array.
        setQuestions(res.data.questions || res.data);
        if (res.data.week_number) setWeekNumber(res.data.week_number);
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
      [questionId]: Number(value)
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
    const keys = Object.keys(currentAnswers);
    if (keys.length !== 10) {
      setError("Please answer all 10 questions before submitting.");
      return;
    }

    const values = Object.values(currentAnswers);
    if (values.some(v => isNaN(v) || v < 0 || v > 4)) {
      setError("Invalid answer value detected. Please refresh and try again.");
      return;
    }

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
      
      const result = await submitAssessment(payload);
      setRiskScore(result.data?.riskScore ?? null);
      setAnswers({}); // clear state completely upon success
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
          <p className="text-slate-400 font-medium">Loading secure session...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in duration-700">
        <div className="max-w-md w-full bg-white rounded-[2rem] border border-emerald-100 shadow-[0_8px_30px_rgb(16,185,129,0.12)] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mt-20 z-0"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl font-bold shadow-sm ring-4 ring-white">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-3">Check-in Complete</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Your wellbeing insights have been securely updated. Thank you for taking the time to share how you're doing.
            </p>
            <button 
              onClick={() => navigate('/student')}
              className="bg-slate-900 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-slate-800 transition-colors shadow-sm w-full"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">Ready to begin?</h1>
            <div className="bg-amber-50 rounded-2xl p-5 text-amber-800 text-sm mb-8 text-left border border-amber-100/60">
              <p className="font-semibold mb-2 text-amber-900">Session Rules:</p>
              <ul className="list-disc pl-5 space-y-1.5 opacity-90">
                <li>This assessment is timed (120 seconds).</li>
                <li>Once started, it cannot be paused.</li>
                <li>Do not refresh or click back during the session.</li>
              </ul>
            </div>
            <button 
              onClick={handleStart}
              className="w-full bg-indigo-600 text-white rounded-xl px-6 py-4 font-semibold hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] text-lg tracking-wide"
            >
              Start Session
            </button>
          </div>
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
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Weekly Wellbeing Check-In
            </h1>
            {weekNumber !== null && (
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-200">
                Week {weekNumber}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            This short check-in helps mentors understand overall student wellbeing trends.
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
              questionText={q.question || q.question_text || `Question ${index + 1}`}
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
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Calculating Risk...
              </span>
            ) : 'Submit Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveySession;
