import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { loginUser, getMe } from '../api/authApi';
import { Eye, EyeOff, Loader2, AlertCircle, UserX, KeyRound, ServerCrash } from 'lucide-react';

const Login = () => {
  const [id_num, setIdNum] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (!id_num || !password) {
        throw new Error('Please fill in all fields');
      }

      await loginUser({ id_num, password });
      
      // Fetch fresh DB data to ensure role is completely synchronized
      const meResponse = await getMe();
      login(meResponse.data);
      
      const { role } = meResponse.data;
      if (role === 'student') navigate('/student');
      else if (role === 'mentor') navigate('/mentor');
      else if (role === 'welfare') navigate('/welfare');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const getErrorVisual = (errorMsg) => {
    if (!errorMsg) return null;
    
    if (errorMsg.toLowerCase().includes('wrong user id') || errorMsg.toLowerCase().includes('user not found')) {
      return {
        icon: <UserX className="w-6 h-6" />,
        title: 'Account Not Found',
        message: 'The User ID you entered doesn\'t belong to an account. Please check your ID and try again.',
        color: 'rose',
        field: 'id'
      };
    }
    
    if (errorMsg.toLowerCase().includes('wrong password') || errorMsg.toLowerCase().includes('invalid password')) {
      return {
        icon: <KeyRound className="w-6 h-6" />,
        title: 'Incorrect Password',
        message: 'The password you entered is incorrect. Please try again.',
        color: 'orange',
        field: 'password'
      };
    }
    
    if (errorMsg.toLowerCase().includes('server') || errorMsg.toLowerCase().includes('network')) {
      return {
        icon: <ServerCrash className="w-6 h-6" />,
        title: 'Connection Error',
        message: 'We are unable to connect to our servers right now. Please try again later.',
        color: 'red',
        field: 'none'
      };
    }
    
    return {
      icon: <AlertCircle className="w-6 h-6" />,
      title: 'Sign In Error',
      message: errorMsg,
      color: 'rose',
      field: 'all'
    };
  };

  const errorVisual = getErrorVisual(error);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <div className="hidden lg:flex lg:flex-1 bg-indigo-600 relative overflow-hidden items-center justify-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/50 to-indigo-900/80"></div>
        <div className="absolute w-96 h-96 bg-white/10 blur-3xl rounded-full top-20 left-20"></div>
        <div className="absolute w-[30rem] h-[30rem] bg-indigo-400/20 blur-3xl rounded-full bottom-0 right-0"></div>
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-xl">
            <span className="text-3xl font-bold text-indigo-600 leading-none">M</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 tracking-tight leading-tight">Elevating campus student wellbeing.</h1>
          <p className="text-indigo-100 text-lg font-medium leading-relaxed opacity-90">
            A secure AI-driven behavioral monitoring platform built for modern educational ecosystems.
          </p>
        </div>
      </div>
      
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 md:p-24 relative">
        <div className="w-full max-w-md bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 lg:hidden shadow-lg">
              <span className="text-2xl font-bold text-white leading-none">M</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please enter your secure credentials</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Conditional Error Display */}
            {errorVisual && (
              <div className={`p-4 rounded-xl border flex gap-3.5 items-start shadow-sm animate-in zoom-in-95 duration-300 ${
                errorVisual.color === 'orange' ? 'bg-orange-50/80 border-orange-200/80 text-orange-900' :
                errorVisual.color === 'red' ? 'bg-red-50/80 border-red-200/80 text-red-900' :
                'bg-rose-50/80 border-rose-200/80 text-rose-900'
              }`}>
                <div className={`mt-0.5 p-1.5 rounded-lg ${
                  errorVisual.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                  errorVisual.color === 'red' ? 'bg-red-100 text-red-600' :
                  'bg-rose-100 text-rose-600'
                }`}>
                  {errorVisual.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold tracking-tight">
                    {errorVisual.title}
                  </h3>
                  <p className={`text-[13px] mt-1 font-medium ${
                    errorVisual.color === 'orange' ? 'text-orange-800/90' :
                    errorVisual.color === 'red' ? 'text-red-800/90' :
                    'text-rose-800/90'
                  }`}>
                    {errorVisual.message}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ID Number</label>
              <input
                type="text"
                value={id_num}
                onChange={(e) => {
                  setIdNum(e.target.value);
                  setError(null);
                }}
                className={`w-full px-4 py-3 bg-slate-50 border ${
                  (errorVisual?.field === 'id' || errorVisual?.field === 'all') 
                    ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30' 
                    : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                } rounded-xl focus:bg-white focus:ring-2 transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                placeholder="0000"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className={`w-full pl-4 pr-12 py-3 bg-slate-50 border ${
                    (errorVisual?.field === 'password' || errorVisual?.field === 'all') 
                      ? 'border-orange-400 focus:ring-orange-500 focus:border-orange-500 bg-orange-50/30' 
                      : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                  } rounded-xl focus:bg-white focus:ring-2 transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : 'Sign In To Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
