import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { checkWeeklyStatus } from '../../api/assessmentApi';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const res = await checkWeeklyStatus();
        setStatus(res.data);
      } catch (err) {
        console.error('Failed to load status', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'Student'}</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Weekly Wellbeing Check-In</h2>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded-xl w-48"></div>
          </div>
        ) : status?.alreadySubmitted ? (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                ✓
              </span>
              <p className="font-medium text-gray-800">You have completed this week's assessment.</p>
            </div>
            <p className="text-gray-500 text-sm ml-11">
              Next assessment available on: <span className="font-semibold">{status.nextAvailableDate}</span>
            </p>
            <button 
              disabled 
              className="mt-6 bg-gray-300 text-white font-medium px-6 py-3 rounded-xl cursor-not-allowed opacity-80"
            >
              Assessment Completed
            </button>
          </div>
        ) : (
          <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100">
            <h3 className="text-indigo-900 font-medium mb-2">Your check-in is ready!</h3>
            <p className="text-indigo-700/80 text-sm mb-6 max-w-md">
              Please take 2 minutes to complete your weekly assessment. This is a timed session (120 seconds).
            </p>
            <button 
              onClick={() => navigate('/student/session')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl shadow-sm transition-colors"
            >
              Start Assessment Now
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-2">Resources</h3>
          <p className="text-sm text-gray-500 mb-4">Access campus wellbeing links.</p>
          <div className="h-24 bg-gray-50 rounded flex items-center justify-center border border-dashed border-gray-200 text-gray-400 text-sm">
            Coming Soon
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-2">History</h3>
          <p className="text-sm text-gray-500 mb-4">View your past submissions.</p>
          <div className="h-24 bg-gray-50 rounded flex items-center justify-center border border-dashed border-gray-200 text-gray-400 text-sm">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
