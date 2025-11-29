import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthFormProps {
  onLoginSuccess: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await authService.login(formData.email, formData.password);
      } else {
        response = await authService.register(formData.username, formData.email, formData.password);
      }
      
      // Store auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      onLoginSuccess(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-8 border border-white/60">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 text-white">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 8m0 0a8 8 0 00-8 8c0 2.472.345 4.865.99 7.131M15.171 17a3.001 3.001 0 01-2.083-2.912" />
             </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {isLogin ? 'Enter your credentials to access your journal.' : 'Start your learning journey today.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 bg-gray-50 border-0 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200"
                placeholder="johndoe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 bg-gray-50 border-0 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 bg-gray-50 border-0 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gray-900 text-white font-semibold shadow-xl shadow-blue-500/10 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;