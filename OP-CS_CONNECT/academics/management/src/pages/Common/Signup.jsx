import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, GraduationCap, Users, UserCircle, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'teacher', label: 'Teacher', icon: UserCircle },
  { id: 'admin', label: 'Admin', icon: Shield },
  { id: 'parent', label: 'Parent', icon: Users },
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
    const result = await Promise.resolve(onSignup(formData));
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#ffffff' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 nova-dot-grid opacity-20" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.02), transparent 60%)', filter: 'blur(80px)' }}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md z-10">
        <div className="nova-card p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white">
              <span className="text-black font-bold text-xl">C</span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Create your account</h2>
            <p className="text-sm mt-1 text-zinc-600">Join Cornerstone SchoolSync</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-4">Select your role</h3>
                <div className="space-y-2.5 mb-6">
                  {roles.map(role => (
                    <motion.button key={role.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      onClick={() => { setFormData(d => ({ ...d, role: role.id })); setStep(2); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer border"
                      style={{
                        borderColor: formData.role === role.id ? 'rgba(255,255,255,0.2)' : 'var(--border-default)',
                        background: formData.role === role.id ? 'rgba(255,255,255,0.04)' : 'var(--bg-elevated)',
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06]">
                        <role.icon size={20} className={formData.role === role.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'} />
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">{role.label}</span>
                    </motion.button>
                  ))}
                </div>
                <p className="text-center text-sm text-zinc-600">
                  Already have an account?{' '}
                  <button onClick={onSwitch} className="font-medium hover:underline text-[var(--text-primary)]">Sign in</button>
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.form key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                onSubmit={handleSubmit} className="space-y-5"
              >
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm font-medium mb-2 hover:underline text-[var(--text-muted)]">
                  <ArrowLeft size={14} /> Back
                </button>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-muted)]">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type="text" value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                      className="input-field pl-11" placeholder="John Doe" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-muted)]">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type="email" value={formData.email} onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                      className="input-field pl-11" placeholder="you@schoolsync.edu" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-muted)]">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type={showPassword ? 'text' : 'password'} value={formData.password}
                      onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                      className="input-field pl-11 pr-11" placeholder="••••••••" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm font-medium text-red-400">⚠ {error}</p>}

                <Button type="submit" variant="primary" className="w-full" disabled={loading} icon={loading ? null : ArrowRight}>
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

