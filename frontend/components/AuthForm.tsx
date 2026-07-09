import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, User, LogIn, UserPlus, AlertCircle, X, ArrowLeft } from 'lucide-react';

interface AuthFormProps {
  onSubmit: (
    mode: 'login' | 'signup' | 'forgot',
    data: { email: string; password?: string; displayName?: string }
  ) => Promise<void>;
  onClose?: () => void;
  isMockMode?: boolean;
}

export default function AuthForm({ onSubmit, onClose, isMockMode = false }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (activeTab !== 'forgot' && !password.trim()) {
      setError('Please enter your password.');
      return;
    }

    if (activeTab === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    try {
      setIsLoading(true);
      await onSubmit(activeTab, {
        email: email.trim(),
        password: activeTab !== 'forgot' ? password : undefined,
        displayName: activeTab === 'signup' ? fullName.trim() : undefined,
      });
      if (activeTab === 'forgot') {
        // Go back to login after sending reset mail
        setActiveTab('login');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 relative overflow-hidden">
      {/* Decorative backdrop aura */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Close button if onClose is provided */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer transition z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-2 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-200">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Safe<span className="text-violet-600">Her</span> Sentinel Hub
        </h2>
        <p className="text-xs text-slate-400 font-medium px-4">
          {activeTab === 'login' 
            ? 'Sign in to access your secure safety grid' 
            : activeTab === 'signup'
            ? 'Create an encrypted account to protect your journeys'
            : 'Enter your registered email to receive a recovery link'}
        </p>
      </div>

      {/* Mock Mode Alert */}
      {isMockMode && (
        <div className="mb-5 p-3 rounded-2xl border border-amber-100 bg-amber-50/50 text-[10px] sm:text-xs text-amber-800 flex items-start gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Demo Mode Active</span>: Firebase keys are missing in `.env.local`. Enter any credentials to simulate auth operations.
          </div>
        </div>
      )}

      {/* Tabs - Hidden in forgot password view */}
      {activeTab !== 'forgot' && (
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-violet-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white text-violet-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3 rounded-2xl border border-rose-100 bg-rose-50/80 text-xs text-rose-800 flex items-start gap-2 font-medium"
        >
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'signup' && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aria Sharma"
                disabled={isLoading}
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium text-slate-800 transition disabled:opacity-60"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aria@safeher-grid.org"
              disabled={isLoading}
              className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium text-slate-800 transition disabled:opacity-60"
            />
          </div>
        </div>

        {activeTab !== 'forgot' && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
              {activeTab === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setError(null);
                  }}
                  className="text-[10px] text-violet-600 font-bold hover:underline cursor-pointer focus:outline-none"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium text-slate-800 transition disabled:opacity-60"
              />
            </div>
          </div>
        )}

        {activeTab === 'signup' && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium text-slate-800 transition disabled:opacity-60"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl text-xs shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {activeTab === 'login' 
                ? 'Authenticating Securely...' 
                : activeTab === 'signup'
                ? 'Registering Credentials...'
                : 'Sending Recovery Link...'}
            </>
          ) : (
            <>
              {activeTab === 'login' 
                ? 'Confirm Sign In' 
                : activeTab === 'signup'
                ? 'Register Secure Account'
                : 'Send Recovery Email'}
            </>
          )}
        </button>

        {activeTab === 'forgot' && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            disabled={isLoading}
            className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </button>
        )}
      </form>
    </div>
  );
}
