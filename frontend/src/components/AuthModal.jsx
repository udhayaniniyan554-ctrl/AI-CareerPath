import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, Zap, Shield } from 'lucide-react';

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
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101010] rounded-3xl max-w-md w-full border border-[#292929] shadow-2xl p-7 relative animate-fadeIn text-[#F5F5F5]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1C] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold mx-auto shadow-md">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {mode === 'login' ? 'Sign in to NEXUS AI' : 'Create User Account'}
          </h2>
          <p className="text-xs text-[#A1A1AA]">
            {mode === 'login' 
              ? 'Access your personalized adaptive learning roadmap' 
              : 'Join the autonomous AI-powered learning ecosystem'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#D4D4D8] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#151515] border border-[#292929] text-xs text-white placeholder-[#71717A] focus:border-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#D4D4D8] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institution.edu"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#151515] border border-[#292929] text-xs text-white placeholder-[#71717A] focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D4D4D8] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#151515] border border-[#292929] text-xs text-white placeholder-[#71717A] focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#D4D4D8] mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#151515] border border-[#292929] text-xs text-white focus:border-white focus:outline-none"
              >
                <option value="student">Student / Learner</option>
                <option value="admin">Platform Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#E0E0E0] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-5 text-xs text-[#A1A1AA]">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="text-white font-semibold underline hover:text-[#D4D4D8]"
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
                className="text-white font-semibold underline hover:text-[#D4D4D8]"
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
