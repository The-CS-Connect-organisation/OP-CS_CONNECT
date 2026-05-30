
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, type UserRole } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  GraduationCap, BookOpen, Users, Shield, MapPin, Bus,
  Sparkles, ArrowRight, Eye, EyeOff, Mail, Lock,
  ChevronRight, Star, Zap, Brain, Globe, Loader2
} from 'lucide-react'

const roles: Array<{
  role: UserRole
  label: string
  icon: React.ElementType
  gradient: string
  bgGradient: string
  description: string
  email: string
}> = [
  { role: 'student', label: 'Student', icon: BookOpen, gradient: 'from-orange-500 to-amber-500', bgGradient: 'from-orange-500/20 to-amber-500/20', description: 'Grades, assignments & AI study tools', email: 'aarav@eduvault.ai' },
  { role: 'student', label: 'Student 2', icon: BookOpen, gradient: 'from-orange-400 to-yellow-500', bgGradient: 'from-orange-400/20 to-yellow-500/20', description: 'Priya Patel - 10-A', email: 'priya@eduvault.ai' },
  { role: 'teacher', label: 'Teacher', icon: Users, gradient: 'from-amber-600 to-orange-600', bgGradient: 'from-amber-500/20 to-orange-500/20', description: 'Math, Physics, CS', email: 'rajesh@eduvault.ai' },
  { role: 'teacher', label: 'Teacher 2', icon: Users, gradient: 'from-yellow-600 to-amber-600', bgGradient: 'from-yellow-500/20 to-amber-500/20', description: 'Chemistry, Biology, English', email: 'sunita@eduvault.ai' },
  { role: 'admin', label: 'Admin', icon: Shield, gradient: 'from-orange-700 to-red-600', bgGradient: 'from-orange-700/20 to-red-500/20', description: 'Full school administration', email: 'meera@eduvault.ai' },
  { role: 'coordinator', label: 'Coordinator', icon: Globe, gradient: 'from-amber-500 to-orange-500', bgGradient: 'from-amber-500/20 to-orange-500/20', description: 'Multi-school oversight', email: 'vikram@eduvault.ai' },
  { role: 'driver', label: 'Driver', icon: Bus, gradient: 'from-orange-600 to-yellow-600', bgGradient: 'from-orange-600/20 to-yellow-500/20', description: 'Route management', email: 'raju@eduvault.ai' },
  { role: 'manager', label: 'Manager', icon: Shield, gradient: 'from-orange-600 to-amber-600', bgGradient: 'from-orange-600/20 to-red-500/20', description: 'Full operations control', email: 'manager@eduvault.ai' },
]

// Rotating 3D logo from Awwards-gaming-site style
function RotatingLogo({ icon: Icon, className }: { icon: React.ElementType; className?: string }) {
  return (
    <motion.div
      className={cn("relative", className)}
      animate={{ rotateY: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      style={{ perspective: 800, transformStyle: 'preserve-3d' }}
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-orange-500/30"
        style={{ transformStyle: 'preserve-3d' }}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </motion.div>
  )
}

export default function Login() {
  const { loginWithCredentials } = useAuthStore()
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('demo1234')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleSelect = (idx: number) => {
    setSelectedRole(idx)
    setEmail(roles[idx].email)
    setPassword('demo1234')
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    // Force rebuild
    e.preventDefault()
    if (selectedRole === null) return
    setIsLoading(true)
    setError('')
    try {
      await loginWithCredentials(email, password)
    } catch (err: any) {
      setError(err.message || 'Login failed. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Awwards-style animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/8 rounded-full filter blur-[150px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/8 rounded-full filter blur-[128px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.1, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-orange-600/5 rounded-full filter blur-[96px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Rotating logos - Awwards style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[BookOpen, GraduationCap, Shield, Users, Globe, Bus, Brain, Sparkles, Zap, Star].map((Icon, i) => {
          const angle = (i / 10) * Math.PI * 2
          const radius = 35
          const x = 50 + radius * Math.cos(angle)
          const y = 50 + radius * Math.sin(angle)
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${x}%`, top: `${y}%` }}
              animate={{
                rotateY: 360,
                rotateX: [0, 360],
                opacity: [0.05, 0.12, 0.05],
              }}
              transition={{
                rotateY: { duration: 10 + i * 2, repeat: Infinity, ease: "linear" },
                rotateX: { duration: 15 + i, repeat: Infinity, ease: "linear" },
                opacity: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center backdrop-blur-sm">
                <Icon className="w-6 h-6 text-orange-500/30" />
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8">
        {/* Logo & Header - Awwards style */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6 backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-orange-400">AI-Powered Learning Platform</span>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-black tracking-tighter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Cornerstone
            </span>
          </motion.h1>
          <motion.p
            className="text-white/40 mt-4 text-lg max-w-lg mx-auto font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Cornerstone International School — powered by AI
          </motion.p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {[
              { icon: Brain, label: 'AI Grading' },
              { icon: Zap, label: 'Real-time' },
              { icon: Star, label: 'Smart Analytics' },
              { icon: Sparkles, label: 'AI Study Plans' },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/40 backdrop-blur-sm"
              >
                <feature.icon className="w-3.5 h-3.5 text-orange-500/60" />
                {feature.label}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Role Selection - Glassmorphic cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8"
        >
          {roles.map((r, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.06, ease: [0.2, 0.65, 0.3, 0.9] }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleRoleSelect(i)}
              className={cn(
                "relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-300 overflow-hidden group backdrop-blur-xl",
                selectedRole === i
                  ? "border-orange-500/50 bg-orange-500/10 shadow-lg shadow-orange-500/10"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-orange-500/20 hover:bg-white/[0.04]"
              )}
            >
              {/* Gradient background on hover */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                r.bgGradient
              )} />

              <div className={cn(
                "relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                r.gradient
              )}>
                <r.icon className="w-5 h-5 text-white" />
              </div>
              <div className="relative z-10 text-center">
                <p className="font-semibold text-xs text-white/90">{r.label}</p>
                <p className="text-[9px] text-white/30 mt-0.5 hidden md:block">{r.description}</p>
              </div>

              {selectedRole === i && (
                <motion.div
                  layoutId="selectedRole"
                  className="absolute inset-0 border-2 border-orange-500/50 rounded-2xl"
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Login Form - Glassmorphic */}
        <AnimatePresence>
          {selectedRole !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="max-w-md mx-auto"
            >
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                      roles[selectedRole].gradient
                    )}>
                      {React.createElement(roles[selectedRole].icon, { className: "w-5 h-5 text-white" })}
                    </div>
                    <div>
                      <p className="font-semibold text-white/90">Sign in as {roles[selectedRole].label}</p>
                      <p className="text-xs text-white/30">Password: demo1234</p>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/30 transition-all placeholder:text-white/20"
                        placeholder="Email"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/30 transition-all placeholder:text-white/20"
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20",
                      "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400",
                      isLoading && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Enter Cornerstone
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-white/20 mt-8"
        >
          Powered by Gemini AI • Cerebras • Built with ❤️
        </motion.p>
      </div>
    </div>
  )
}