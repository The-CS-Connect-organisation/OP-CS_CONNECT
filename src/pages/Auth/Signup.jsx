import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, BookOpen, GraduationCap, Users, UserCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'from-blue-500 to-cyan-500' },
  { id: 'teacher', label: 'Teacher', icon: UserCircle, color: 'from-purple-500 to-pink-500' },
  { id: 'admin', label: 'Admin', icon: Users, color: 'from-amber-500 to-orange-500' },
];

export const Signup = ({ onSignup, onSwitch }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const result = onSignup(formData);
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-primary-950 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -top-20 -right-20 w-96 h-96 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-3xl" />
        <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-200/30 dark:bg-primary-800/20 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-card p-8 md:p-10">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
              <BookOpen size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">SchoolSync</h1>
              <p className="text-xs text-gray-400">Create your account</p>
            </div>
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Select your role</h3>
              <div className="space-y-3 mb-6">
                {roles.map(role => (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setFormData(d => ({ ...d, role: role.id })); setStep(2); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      formData.role === role.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center text-white`}>
                      <role.icon size={20} />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">{role.label}</span>
                  </motion.button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button onClick={onSwitch} className="text-primary-500 hover:text-primary-600 font-medium">Sign In</button>
              </p>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmit} className="space-y-5">
              <button type="button" onClick={() => setStep(1)} className="text-sm text-primary-500 hover:text-primary-600 mb-2">← Back</button>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                    className="input-field pl-10" placeholder="John Doe" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={formData.email} onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                    className="input-field pl-10" placeholder="you@schoolsync.edu" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={formData.password}
                    onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                    className="input-field pl-10 pr-10" placeholder="••••••••" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">⚠️ {error}</p>}

              <Button type="submit" variant="primary" className="w-full" disabled={loading} icon={loading ? null : ArrowRight}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
