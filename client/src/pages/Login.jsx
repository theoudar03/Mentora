import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';

const Login = () => {
  const [id_num, setIdNum] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await loginUser({ id_num, password });
      login(response.data);
      if (response.data.role === 'student') navigate('/student');
      else if (response.data.role === 'mentor') navigate('/mentor');
      else if (response.data.role === 'welfare') navigate('/welfare');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600 mb-1">Mentora</h1>
          <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-2">Mental Health + Mentor</p>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
            <input
              type="text"
              value={id_num}
              onChange={(e) => setIdNum(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Credentials reference */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-xs text-gray-600">
          <p className="font-semibold text-indigo-700 mb-2">🔑 Demo Credentials</p>
          <div className="space-y-1">
            <p><span className="font-medium">Welfare:</span> ADMIN001 / ADMIN001</p>
            <p><span className="font-medium">Mentor:</span> MTR2f5c / MTR2f5c</p>
            <p><span className="font-medium">Student:</span> STU2f30 / STU2f30</p>
          </div>
          <p className="mt-2 text-gray-400">Password = ID Number for all accounts</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
