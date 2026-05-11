import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, KeyRound, Lock, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

export const ForgotPassword = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (res?.success) {
        setUserId(res.user_id || '');
        setStep(2);
      }
    } catch (err) {
      setError(err?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ userId, otp }),
      });
      if (res?.success) {
        setResetToken(res.resetToken);
        setStep(3);
      }
    } catch (err) {
      setError(err?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ resetToken, newPassword }),
      });
      if (res?.success) setStep(4);
    } catch (err) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        {step < 4 && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to login
          </button>
        )}

        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Mail size={22} className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Forgot password?</h2>
                  <p className="text-sm text-slate-500 mt-1">Enter your email to receive a reset code</p>
                </div>
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@schoolsync.edu"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-sm hover:bg-slate-800 transition-all disabled:opacity-70">
                    {loading ? 'Sending...' : <><span>Send Reset Code</span><ArrowRight size={15} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-4">
                    <KeyRound size={22} className="text-violet-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Enter reset code</h2>
                  <p className="text-sm text-slate-500 mt-1">Check your email for the 6-digit code</p>
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">6-Digit Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-center text-2xl font-mono font-bold tracking-[0.5em] focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
                    />
                  </div>
                  {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}
                  <button type="submit" disabled={loading || otp.length < 6}
                    className="w-full h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-sm hover:bg-slate-800 transition-all disabled:opacity-70">
                    {loading ? 'Verifying...' : <><span>Verify Code</span><ArrowRight size={15} /></>}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors">
                    Didn't receive it? Try again
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
                    <Lock size={22} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">New password</h2>
                  <p className="text-sm text-slate-500 mt-1">Choose a strong password</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                        minLength={6}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-sm font-medium focus:outline-none focus:border-green-500 focus:bg-white transition-all"
                      />
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-green-500 focus:bg-white transition-all"
                      />
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full h-11 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-sm hover:bg-green-700 transition-all disabled:opacity-70">
                    {loading ? 'Resetting...' : <><span>Reset Password</span><ArrowRight size={15} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle size={32} className="text-green-600" />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Password reset!</h2>
                <p className="text-sm text-slate-500 mb-6">Your password has been updated. You can now sign in.</p>
                <button
                  onClick={onBack}
                  className="w-full h-11 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all"
                >
                  Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
