import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import {
  UserPlus, Loader2,
  User, Mail, Lock, Shield, GraduationCap, BookOpen,
  Users, Globe
} from 'lucide-react'

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'parent', label: 'Parent' },
]

const subjectOptions = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Geography', 'Art']

const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function Signup() {
  const navigate = useNavigate()
  const signupWithCredentials = useAuthStore(s => s.signupWithCredentials)
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    class: '', subjects: [] as string[],
    parentType: '',
    rollNo: '', admissionNo: '', phone: '', dateOfBirth: '',
    bloodGroup: '', aadharNo: '', religion: '', nationality: 'Indian',
    schoolHouse: '', fatherName: '', fatherPhone: '', motherName: '', motherPhone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
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
    try {
      const user = await signupWithCredentials(form)
      if (form.role === 'parent' && form.phone && form.parentType) {
        api.autoLinkParent(user.id, form.phone, form.parentType).catch(() => {})
      }
      navigate(`/${form.role}/dashboard`)
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join EduVault ERP</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1"><User className="w-3.5 h-3.5 inline mr-1" />Full Name</label>
              <input type="text" required value={form.name} onChange={e => update('name', e.target.value)} placeholder="Enter full name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1"><Mail className="w-3.5 h-3.5 inline mr-1" />Email</label>
              <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@school.edu" className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1"><Lock className="w-3.5 h-3.5 inline mr-1" />Password</label>
              <input type="password" required minLength={6} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 6 characters" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1"><Shield className="w-3.5 h-3.5 inline mr-1" />I am a</label>
              <select value={form.role} onChange={e => update('role', e.target.value)} className="input-field">
                {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {form.role === 'student' && (
            <>
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><GraduationCap className="w-4 h-4" />Academic Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Class / Section</label>
                    <input type="text" value={form.class} onChange={e => update('class', e.target.value)} placeholder="e.g. 10-A" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Roll No</label>
                    <input type="text" value={form.rollNo} onChange={e => update('rollNo', e.target.value)} placeholder="Optional" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Admission No</label>
                    <input type="text" value={form.admissionNo} onChange={e => update('admissionNo', e.target.value)} placeholder="Optional" className="input-field" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><User className="w-4 h-4" />Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                    <input type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Blood Group</label>
                    <select value={form.bloodGroup} onChange={e => update('bloodGroup', e.target.value)} className="input-field">
                      <option value="">Select</option>
                      {bloodGroupOptions.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="Optional" className="input-field" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Globe className="w-4 h-4" />Additional Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Religion</label>
                    <input type="text" value={form.religion} onChange={e => update('religion', e.target.value)} placeholder="Optional" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nationality</label>
                    <input type="text" value={form.nationality} onChange={e => update('nationality', e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">School House</label>
                    <input type="text" value={form.schoolHouse} onChange={e => update('schoolHouse', e.target.value)} placeholder="e.g. Blue House, Phoenix, or anything" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Aadhar No</label>
                    <input type="text" value={form.aadharNo} onChange={e => update('aadharNo', e.target.value)} placeholder="Optional" className="input-field" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Users className="w-4 h-4" />Parent Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Father's Name</label>
                    <input type="text" value={form.fatherName} onChange={e => update('fatherName', e.target.value)} placeholder="Optional" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Father's Phone</label>
                    <input type="tel" value={form.fatherPhone} onChange={e => update('fatherPhone', e.target.value)} placeholder="Optional" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mother's Name</label>
                    <input type="text" value={form.motherName} onChange={e => update('motherName', e.target.value)} placeholder="Optional" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mother's Phone</label>
                    <input type="tel" value={form.motherPhone} onChange={e => update('motherPhone', e.target.value)} placeholder="Optional" className="input-field" />
                  </div>
                </div>
              </div>
            </>
          )}

          {form.role === 'teacher' && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1"><GraduationCap className="w-3.5 h-3.5 inline mr-1" />Class / Section</label>
                  <input type="text" value={form.class} onChange={e => update('class', e.target.value)} placeholder="e.g. 10-A" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2"><BookOpen className="w-3.5 h-3.5 inline mr-1" />Subjects</label>
                  <div className="flex flex-wrap gap-1.5">
                    {subjectOptions.map(subject => {
                      const selected = form.subjects.includes(subject)
                      return (
                        <button key={subject} type="button" onClick={() => toggleSubject(subject)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${selected ? 'badge-pink' : 'badge-default'}`}>
                          {subject}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {form.role === 'parent' && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Users className="w-4 h-4" />Parent Type</h3>
              <p className="text-xs text-muted-foreground mb-3">Select your relationship to the child.</p>
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <button type="button" onClick={() => update('parentType', 'father')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.parentType === 'father' ? 'border-orange-500 bg-orange-500/5' : 'border-border hover:border-orange-500/30'}`}>
                  <User className={`w-8 h-8 ${form.parentType === 'father' ? 'text-orange-500' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${form.parentType === 'father' ? 'text-orange-600' : 'text-muted-foreground'}`}>Father</span>
                </button>
                <button type="button" onClick={() => update('parentType', 'mother')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.parentType === 'mother' ? 'border-orange-500 bg-orange-500/5' : 'border-border hover:border-orange-500/30'}`}>
                  <User className={`w-8 h-8 ${form.parentType === 'mother' ? 'text-orange-500' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${form.parentType === 'mother' ? 'text-orange-600' : 'text-muted-foreground'}`}>Mother</span>
                </button>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1"><User className="w-3.5 h-3.5 inline mr-1" />Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="Enter phone number" className="input-field max-w-xs" />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><UserPlus className="w-4 h-4" /> Create Account</>}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-orange-600 hover:underline">Log in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}