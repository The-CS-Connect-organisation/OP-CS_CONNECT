import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  UserPlus, CheckCircle2, Loader2,
  User, Mail, Lock, Shield, GraduationCap, BookOpen,
  Users, FileText, Globe
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
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

const subjectOptions = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Geography', 'Civics', 'Art', 'Physical Education', 'Economics', 'Accounting']

const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function CreateAccount() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    class: '', subjects: [] as string[],
    parentType: '',
    // --- Student-specific fields ---
    rollNo: '', admissionNo: '', phone: '', address: '',
    dateOfBirth: '', bloodGroup: '', aadharNo: '', penNo: '', apaarId: '',
    religion: '', nationality: 'Indian', schoolHouse: '', houseLocation: '',
    fatherName: '', fatherPhone: '', motherName: '', motherPhone: '',
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
      const data: Record<string, any> = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      }
      if (form.role === 'student') {
        data.class = form.class
        data.rollNo = form.rollNo
        data.admissionNo = form.admissionNo
        data.phone = form.phone
        data.address = form.address
        data.dateOfBirth = form.dateOfBirth
        data.bloodGroup = form.bloodGroup
        data.aadharNo = form.aadharNo
        data.penNo = form.penNo
        data.apaarId = form.apaarId
        data.religion = form.religion
        data.nationality = form.nationality
        data.schoolHouse = form.schoolHouse
        data.houseLocation = form.houseLocation
        data.fatherName = form.fatherName
        data.fatherPhone = form.fatherPhone
        data.motherName = form.motherName
        data.motherPhone = form.motherPhone
      }
      if (form.role === 'teacher') {
        data.class = form.class
        if (form.subjects.length > 0) data.subjects = form.subjects
      }
      if (form.role === 'parent') {
        data.parentType = form.parentType
        data.phone = form.phone
      }
      await api.createUser(data)
      setSuccess(true)
      setForm({ name: '', email: '', password: '', role: 'student', class: '', subjects: [], parentType: '', rollNo: '', admissionNo: '', phone: '', address: '', dateOfBirth: '', bloodGroup: '', aadharNo: '', penNo: '', apaarId: '', religion: '', nationality: 'Indian', schoolHouse: '', houseLocation: '', fatherName: '', fatherPhone: '', motherName: '', motherPhone: '' })
      setTimeout(() => { navigate('/admin/users') }, 1500)
    } catch (err: any) {
      console.error('[CreateAccount]', err)
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const renderStudentFields = () => (
    <motion.div key="student-fields" variants={itemVariants} className="space-y-5">
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><GraduationCap className="w-4 h-4 text-muted-foreground" />Academic Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Class / Section</label>
            <input type="text" value={form.class} onChange={e => updateField('class', e.target.value)} placeholder="e.g. 10-A" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Roll No</label>
            <input type="text" value={form.rollNo} onChange={e => updateField('rollNo', e.target.value)} placeholder="e.g. 1001" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Admission No</label>
            <input type="text" value={form.admissionNo} onChange={e => updateField('admissionNo', e.target.value)} placeholder="e.g. ADM-2024-001" className="input-field" />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><User className="w-4 h-4 text-muted-foreground" />Personal Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
            <input type="date" value={form.dateOfBirth} onChange={e => updateField('dateOfBirth', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Blood Group</label>
            <select value={form.bloodGroup} onChange={e => updateField('bloodGroup', e.target.value)} className="input-field">
              <option value="">Select</option>
              {bloodGroupOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+91-9876543210" className="input-field" />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1.5">Address</label>
          <input type="text" value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="Full address" className="input-field" />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-muted-foreground" />Identity Documents</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Aadhar No</label>
            <input type="text" value={form.aadharNo} onChange={e => updateField('aadharNo', e.target.value)} placeholder="1234-5678-9012" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">PEN No</label>
            <input type="text" value={form.penNo} onChange={e => updateField('penNo', e.target.value)} placeholder="PEN-001" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">APAAR ID</label>
            <input type="text" value={form.apaarId} onChange={e => updateField('apaarId', e.target.value)} placeholder="APAAR-001" className="input-field" />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Globe className="w-4 h-4 text-muted-foreground" />Demographics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Religion</label>
            <input type="text" value={form.religion} onChange={e => updateField('religion', e.target.value)} placeholder="e.g. Hindu" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Nationality</label>
            <input type="text" value={form.nationality} onChange={e => updateField('nationality', e.target.value)} placeholder="Indian" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">School House</label>
            <input type="text" value={form.schoolHouse} onChange={e => updateField('schoolHouse', e.target.value)} placeholder="e.g. Blue House, Phoenix, or anything" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">House Location</label>
            <input type="text" value={form.houseLocation} onChange={e => updateField('houseLocation', e.target.value)} placeholder="e.g. Delhi NCR" className="input-field" />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-muted-foreground" />Parent / Guardian Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Father's Name</label>
            <input type="text" value={form.fatherName} onChange={e => updateField('fatherName', e.target.value)} placeholder="Father's full name" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Father's Phone</label>
            <input type="tel" value={form.fatherPhone} onChange={e => updateField('fatherPhone', e.target.value)} placeholder="+91-9876543211" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Mother's Name</label>
            <input type="text" value={form.motherName} onChange={e => updateField('motherName', e.target.value)} placeholder="Mother's full name" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Mother's Phone</label>
            <input type="tel" value={form.motherPhone} onChange={e => updateField('motherPhone', e.target.value)} placeholder="+91-9876543212" className="input-field" />
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderTeacherFields = () => (
    <motion.div key="teacher-fields" variants={itemVariants} className="space-y-4 border-t pt-4">
      <div>
        <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
          Assigned Class / Section
        </label>
        <input type="text" value={form.class} onChange={e => updateField('class', e.target.value)} placeholder="e.g. 10-A" className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
          Subjects
        </label>
        <div className="flex flex-wrap gap-2">
          {subjectOptions.map(subject => {
            const selected = form.subjects.includes(subject)
            return (
              <button key={subject} type="button" onClick={() => toggleSubject(subject)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selected ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-transparent hover:bg-muted/80'}`}>
                {subject}
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )

  const renderOtherFields = () => (
    <motion.div key="other-fields" variants={itemVariants} className="border-t pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
            Class / Section (if applicable)
          </label>
          <input type="text" value={form.class} onChange={e => updateField('class', e.target.value)} placeholder="Optional - type anything" className="input-field" />
        </div>
      </div>
    </motion.div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-muted-foreground text-sm mt-1">Add a new user to the system</p>
      </motion.div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="nova-card p-4 border-l-4 border-l-emerald-500">
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
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="nova-card p-4 border-l-4 border-l-red-500">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <form onSubmit={handleSubmit} className="nova-card p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />Full Name
              </label>
              <input type="text" required value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Enter full name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />Email Address
              </label>
              <input type="email" required value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="user@school.edu" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />Password
            </label>
            <input type="password" required value={form.password} onChange={e => updateField('password', e.target.value)} placeholder="Minimum 6 characters" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />Role
            </label>
            <select value={form.role} onChange={e => updateField('role', e.target.value)} className="input-field">
              {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          {form.role === 'parent' && (
            <motion.div key="parent-fields" variants={itemVariants} className="border-t pt-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-muted-foreground" />Parent Type
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Specify whether this is a father or mother account.</p>
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <button type="button" onClick={() => updateField('parentType', 'father')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.parentType === 'father' ? 'border-orange-500 bg-orange-500/5' : 'border-border hover:border-orange-500/30'}`}>
                  <User className={`w-8 h-8 ${form.parentType === 'father' ? 'text-orange-500' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${form.parentType === 'father' ? 'text-orange-600' : 'text-muted-foreground'}`}>Father</span>
                </button>
                <button type="button" onClick={() => updateField('parentType', 'mother')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.parentType === 'mother' ? 'border-orange-500 bg-orange-500/5' : 'border-border hover:border-orange-500/30'}`}>
                  <User className={`w-8 h-8 ${form.parentType === 'mother' ? 'text-orange-500' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${form.parentType === 'mother' ? 'text-orange-600' : 'text-muted-foreground'}`}>Mother</span>
                </button>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1.5"><User className="w-3.5 h-3.5 inline mr-1" />Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Enter phone number" className="input-field max-w-xs" />
              </div>
            </motion.div>
          )}
          {form.role === 'student' && renderStudentFields()}
          {form.role === 'teacher' && renderTeacherFields()}
          {form.role !== 'student' && form.role !== 'teacher' && form.role !== 'parent' && renderOtherFields()}

          <div className="pt-2">
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
