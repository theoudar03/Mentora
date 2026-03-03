import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { checkWeeklyStatus } from '../../api/assessmentApi';
import { changePassword, getPasswordStatus } from '../../api/studentApi';
import { Eye, EyeOff, Loader2, ShieldCheck, Clock } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [isSubmittingPw, setIsSubmittingPw] = useState(false);
  const [pwStatus, setPwStatus] = useState(null);
  const [isLoadingPw, setIsLoadingPw] = useState(true);

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
      // Refresh status to immediately lock down
      fetchPwStatus();
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
    fetchPwStatus();
  }, []);

  const fetchPwStatus = async () => {
    try {
      setIsLoadingPw(true);
      const res = await getPasswordStatus();
      setPwStatus(res.data);
    } catch (err) {
      console.error('Failed to load password status', err);
    } finally {
      setIsLoadingPw(false);
    }
  };

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
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-full bg-slate-900"></div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-slate-700" />
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Account Security</h3>
            </div>
            <p className="text-slate-500 text-sm">Manage your secure credentials.</p>
          </div>
          
          {isLoadingPw ? (
            <div className="h-8 w-32 bg-slate-100 animate-pulse rounded-full"></div>
          ) : pwStatus?.canChange ? (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Eligible to change
            </div>
          ) : (
            <div className="bg-amber-50 text-amber-700 border border-amber-200/60 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 shadow-sm">
              <Clock className="w-4 h-4" />
              Available in {pwStatus?.remainingDays} days
            </div>
          )}
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100 flex items-center justify-between text-sm">
          <div className="text-slate-600">
            <span className="font-semibold text-slate-800">Last changed:</span> {pwStatus?.lastChangedAt || 'Recently'}
          </div>
          <div className="text-slate-600">
            <span className="font-semibold text-slate-800">Next eligible:</span> {pwStatus?.nextEligibleDate || 'Calculating...'}
          </div>
        </div>
        
        {pwError && <div className="mb-6 text-sm text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100 font-medium animate-in fade-in zoom-in-95">{pwError}</div>}
        {pwSuccess && <div className="mb-6 text-sm text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100 font-medium animate-in fade-in zoom-in-95">{pwSuccess}</div>}
        
        {!pwStatus?.canChange && !isLoadingPw ? (
          <div className="max-w-md bg-white border border-slate-200 p-6 rounded-xl text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Password Locked</h4>
            <p className="text-sm text-slate-500">
              For security reasons, your password can only be updated once every 14 days. Please check back later.
            </p>
            <button disabled className="mt-6 w-full py-3 px-4 rounded-xl font-semibold bg-slate-100 text-slate-400 cursor-not-allowed">
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Password</label>
              <div className="relative">
                <input 
                  type={showCurrentPassword ? "text" : "password"} 
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <button 
                  type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  required
                  minLength="6"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <button 
                  type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2 flex gap-1 h-1.5">
                  <div className={`flex-1 rounded-full transition-all ${newPassword.length > 0 ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                  <div className={`flex-1 rounded-full transition-all ${newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                  <div className={`flex-1 rounded-full transition-all ${(newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <button 
                  type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmittingPw || isLoadingPw}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] flex items-center justify-center gap-2 ${isSubmittingPw || isLoadingPw ? 'opacity-70 bg-slate-800 cursor-wait' : 'bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5'}`}
            >
              {isSubmittingPw ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
              ) : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
