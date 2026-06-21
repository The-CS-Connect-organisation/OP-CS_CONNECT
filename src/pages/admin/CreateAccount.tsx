import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  UserPlus, CheckCircle2, Loader2,
  User, Mail, Lock, Shield, GraduationCap, BookOpen
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' },
  { value: 'parent', label: 'Parent' },
  { value: 'driver', label: 'Driver' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'librarian', label: 'Librarian' },
  { value: 'manager', label: 'Manager' },
]

const classOptions = ['1-A', '1-B', '2-A', '2-B', '3-A', '3-B', '4-A', '4-B', '5-A', '5-B', '6-A', '6-B', '7-A', '7-B', '8-A', '8-B', '9-A', '9-B', '10-A', '10-B', '11-A', '11-B', '12-A', '12-B']

const subjectOptions = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Geography', 'Art', 'Physical Education', 'Economics', 'Accounting']

export default function CreateAccount() {
  const { user } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    class: '',
    subjects: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setSuccess(false)
    setError('')
  }

  const toggleSubject = (subject: string) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const data: any = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      }
      if (form.role === 'student' && form.class) {
        data.class = form.class
      }
      if (form.role === 'teacher' && form.subjects.length > 0) {
        data.subjects = form.subjects
      }
      await api.createUser(data)
      setSuccess(true)
      setForm({ name: '', email: '', password: '', role: 'student', class: '', subjects: [] })
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-2xl">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-muted-foreground text-sm mt-1">Add a new user to the system</p>
      </motion.div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="nova-card p-4 border-l-4 border-l-emerald-500"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-700">Account created successfully</p>
              <p className="text-xs text-emerald-600 mt-0.5">The new user can now log in with their credentials</p>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="nova-card p-4 border-l-4 border-l-red-500"
        >
          <p className="text-sm font-medium text-red-700">{error}</p>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <form onSubmit={handleSubmit} className="nova-card p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
                placeholder="Enter full name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => updateField('email', e.target.value)}
                placeholder="user@school.edu"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => updateField('password', e.target.value)}
              placeholder="Minimum 6 characters"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              Role
            </label>
            <select
              value={form.role}
              onChange={e => updateField('role', e.target.value)}
              className="input-field"
            >
              {roleOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {form.role === 'student' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                Class
              </label>
              <select
                value={form.class}
                onChange={e => updateField('class', e.target.value)}
                className="input-field"
              >
                <option value="">Select class</option>
                {classOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </motion.div>
          )}

          {form.role === 'teacher' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                Subjects
              </label>
              <div className="flex flex-wrap gap-2">
                {subjectOptions.map(subject => {
                  const selected = form.subjects.includes(subject)
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selected
                          ? 'badge-pink'
                          : 'badge-default hover:bg-black-06'
                      }`}
                    >
                      {subject}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
