import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { checkWeeklyStatus } from '../../api/assessmentApi';
import { changePassword } from '../../api/studentApi';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [isSubmittingPw, setIsSubmittingPw] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (newPassword !== confirmPassword) {
      return setPwError('New passwords do not match.');
    }
    if (newPassword.length < 6) {
      return setPwError('Password must be at least 6 characters.');
    }
    setIsSubmittingPw(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPwSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.response?.data?.message || 'Error changing password.');
    } finally {
      setIsSubmittingPw(false);
    }
  };

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Personal Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-200 z-10">
          {user?.name?.charAt(0) || 'S'}
        </div>
        <div className="z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Welcome back, {user?.name || 'Student'}</h1>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold tracking-wide uppercase">
              {user?.department || 'Department'}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Status
            </span>
          </div>
        </div>
      </div>
      
      {/* Survey CTA Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Weekly Check-in</h2>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4 flex flex-col items-center py-6">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-12 bg-slate-200 rounded-xl w-48 mt-4"></div>
            </div>
          ) : status?.alreadySubmitted ? (
            <div className="py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
                ✓
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">You're all caught up!</h3>
              <p className="text-slate-500 text-sm mb-6">
                Next assessment available on: <span className="font-semibold text-slate-700">{status.nextAvailableDate}</span>
              </p>
              <button disabled className="bg-slate-100 text-slate-400 font-medium px-8 py-3 rounded-xl cursor-not-allowed border border-slate-200">
                Assessment Completed
              </button>
            </div>
          ) : (
            <div className="py-2">
              <p className="text-slate-500 text-base mb-8">
                Take a quick 2-minute check-in. Your insights help us provide better support and resources for your wellbeing.
              </p>
              <button 
                onClick={() => navigate('/student/session')}
                className="bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto text-lg"
              >
                Start Assessment Now
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-slate-800 mb-1">Resources</h3>
          <p className="text-sm text-slate-500 mb-4">Access campus wellbeing links.</p>
          <div className="h-24 bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-300 text-slate-400 text-sm font-medium">
            Coming Soon
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-slate-800 mb-1">History</h3>
          <p className="text-sm text-slate-500 mb-4">View your past submissions.</p>
          <div className="h-24 bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-300 text-slate-400 text-sm font-medium">
            Coming Soon
          </div>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-1">Settings</h3>
        <p className="text-slate-500 text-sm mb-6">Update your account security parameters.</p>
        
        {pwError && <div className="mb-6 text-sm text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100 font-medium">{pwError}</div>}
        {pwSuccess && <div className="mb-6 text-sm text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100 font-medium">{pwSuccess}</div>}
        
        <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Password</label>
            <input 
              type="password" 
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
            <input 
              type="password" 
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmittingPw}
            className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-all ${isSubmittingPw ? 'bg-indigo-400 cursor-wait' : 'bg-slate-900 hover:bg-slate-800 shadow-sm'}`}
          >
            {isSubmittingPw ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentDashboard;
