import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, GraduationCap, Users, UserCircle, Shield, ArrowLeft, Phone, CheckCircle } from 'lucide-react';

const ROLES = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    color: '#ff6b9d',
    bg: '#fff0f5',
    description: 'Access assignments, grades, attendance & AI tutor',
  },
  {
    id: 'teacher',
    label: 'Teacher',
    icon: UserCircle,
    color: '#a855f7',
    bg: '#faf0ff',
    description: 'Manage classes, grade submissions & track progress',
  },
  {
    id: 'parent',
    label: 'Parent',
    icon: Users,
    color: '#3b82f6',
    bg: '#eff6ff',
    description: "Monitor your child's academic performance",
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    color: '#10b981',
    bg: '#f0fdf4',
    description: 'Full school management and oversight',
  },
];

export const Signup = ({ onSignup, onSwitch }) => {
  const [step, setStep] = useState(1); // 1=role, 2=details, 3=done
  const [selectedRole, setSelectedRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Student-specific
    grade: '',
    section: '',
    // Teacher-specific
    department: '',
    // Parent-specific
    childName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedRoleConfig = ROLES.find(r => r.id === selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: selectedRole,
        phone: formData.phone,
        ...(selectedRole === 'student' && { grade: formData.grade, section: formData.section }),
        ...(selectedRole === 'teacher' && { department: formData.department }),
        ...(selectedRole === 'parent' && { childName: formData.childName }),
      };

      const result = await onSignup(payload);
      if (result?.success) {
        setStep(3);
      } else {
        setError(result?.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px]"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 mb-4">
            <span className="text-slate-900 font-bold text-lg">C</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
          <p className="text-sm text-slate-500 mt-1">Join Cornerstone SchoolSync</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
              s === step ? 'w-8 bg-slate-900' : s < step ? 'w-4 bg-slate-400' : 'w-4 bg-slate-200'
            }`} />
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <AnimatePresence mode="wait">

            {/* Step 1: Role Selection */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-sm font-semibold text-slate-600 mb-4">I am a...</h3>
                <div className="space-y-2.5 mb-6">
                  {ROLES.map(role => (
                    <motion.button
                      key={role.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedRole(role.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left"
                      style={{
                        borderColor: selectedRole === role.id ? role.color : '#e2e8f0',
                        background: selectedRole === role.id ? role.bg : '#f8fafc',
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: selectedRole === role.id ? role.color + '20' : '#f1f5f9' }}>
                        <role.icon size={20} style={{ color: selectedRole === role.id ? role.color : '#94a3b8' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{role.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{role.description}</p>
                      </div>
                      {selectedRole === role.id && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: role.color }}>
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-sm hover:bg-slate-800 transition-all"
                >
                  Continue as {selectedRoleConfig?.label}
                  <ArrowRight size={15} />
                </button>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit} className="space-y-4"
              >
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors">
                  <ArrowLeft size={14} />
                  Change role
                </button>

                {/* Role badge */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border mb-2"
                  style={{ borderColor: selectedRoleConfig?.color + '40', background: selectedRoleConfig?.bg }}>
                  <selectedRoleConfig.icon size={14} style={{ color: selectedRoleConfig?.color }} />
                  <span className="text-xs font-semibold" style={{ color: selectedRoleConfig?.color }}>
                    Signing up as {selectedRoleConfig?.label}
                  </span>
                </div>

                {/* Common fields */}
                {[
                  { label: 'Full Name', key: 'name', type: 'text', icon: User, placeholder: 'John Doe', required: true },
                  { label: 'Email Address', key: 'email', type: 'email', icon: Mail, placeholder: 'you@schoolsync.edu', required: true },
                  { label: 'Phone (optional)', key: 'phone', type: 'tel', icon: Phone, placeholder: '+91 98765 43210', required: false },
                ].map(({ label, key, type, icon: Icon, placeholder, required }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">{label}</label>
                    <div className="relative">
                      <input type={type} value={formData[key]} onChange={e => update(key, e.target.value)}
                        placeholder={placeholder} required={required}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                ))}

                {/* Role-specific fields */}
                {selectedRole === 'student' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 ml-1">Grade</label>
                      <select value={formData.grade} onChange={e => update('grade', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                        <option value="">Select</option>
                        {['6','7','8','9','10','11','12'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 ml-1">Section</label>
                      <select value={formData.section} onChange={e => update('section', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                        <option value="">Select</option>
                        {['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {selectedRole === 'teacher' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Department / Subject</label>
                    <input type="text" value={formData.department} onChange={e => update('department', e.target.value)}
                      placeholder="e.g. Mathematics"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                  </div>
                )}

                {selectedRole === 'parent' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Child's Name</label>
                    <input type="text" value={formData.childName} onChange={e => update('childName', e.target.value)}
                      placeholder="Your child's full name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                  </div>
                )}

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 ml-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formData.password}
                      onChange={e => update('password', e.target.value)}
                      placeholder="Min. 6 characters" required minLength={6}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 ml-1">Confirm Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formData.confirmPassword}
                      onChange={e => update('confirmPassword', e.target.value)}
                      placeholder="Repeat password" required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-sm hover:bg-slate-800 transition-all disabled:opacity-70 shadow-lg shadow-slate-900/10">
                  {loading ? (
                    <div className="flex gap-1">
                      {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
                    </div>
                  ) : (
                    <><span>Create Account</span><ArrowRight size={15} /></>
                  )}
                </button>
              </motion.form>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle size={32} className="text-green-600" />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Account created!</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Welcome to Cornerstone SchoolSync, {formData.name.split(' ')[0]}!
                </p>
                <p className="text-xs text-slate-400">Redirecting to your dashboard...</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 3 && (
          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <button onClick={onSwitch} className="text-slate-900 font-semibold hover:underline underline-offset-4 transition-all">
              Sign in
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
};
