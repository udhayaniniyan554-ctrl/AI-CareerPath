import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, Sparkles, Shield } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(fullName.trim(), email.trim(), password, role);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06060C]/80 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-[#0D0F22]/95 rounded-3xl max-w-md w-full border border-violet-500/30 shadow-[0_0_50px_rgba(139,92,246,0.25)] p-7 relative animate-fadeIn text-[#F1F5F9]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-[#94A3B8] hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white flex items-center justify-center font-bold mx-auto shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-display">
            {mode === 'login' ? 'Sign In to ORBIT AI' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-[#94A3B8]">
            {mode === 'login' 
              ? 'Access your personalized learning roadmap and skill universe' 
              : 'Initialize your authentic career intelligence profile'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14162E] border border-[#23274D] text-xs text-white placeholder-[#64748B] focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your university or personal email"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14162E] border border-[#23274D] text-xs text-white placeholder-[#64748B] focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14162E] border border-[#23274D] text-xs text-white placeholder-[#64748B] focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#14162E] border border-[#23274D] text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="student">Student / Learner</option>
                <option value="admin">Platform Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold hover:from-blue-500 hover:to-violet-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.35)] disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-5 text-xs text-[#94A3B8]">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="text-violet-400 font-semibold underline hover:text-violet-300"
              >
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button 
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-violet-400 font-semibold underline hover:text-violet-300"
              >
                Sign in
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
