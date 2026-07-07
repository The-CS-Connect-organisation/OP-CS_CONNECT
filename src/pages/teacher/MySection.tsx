import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import {
  Users,
  Search,
  X,
  Edit3,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  HeartPulse,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Save,
  RefreshCw,
  Star,
} from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  role: string
  class: string
  sectionId?: string
  admissionNo?: string
  rollNo?: string
  avatar?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  attendancePercent?: number | null
  overallGrade?: number | null
  status?: string
  address?: string
  fatherName?: string
  motherName?: string
}

const EMPTY_STUDENT_FORM = {
  name: '',
  email: '',
  password: 'demo1234',
  role: 'student',
  class: '',
  admissionNo: '',
  rollNo: '',
  phone: '',
  dateOfBirth: '',
  gender: 'MALE',
  bloodGroup: '',
  address: '',
  fatherName: '',
  motherName: '',
  status: 'active',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function TeacherMySection() {
  const { user } = useAuthStore()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [form, setForm] = useState(EMPTY_STUDENT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [selectedGender, setSelectedGender] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'rollNo' | 'attendance'>('name')

  const teacherClass = user?.class || ''
  const teacherName = user?.name || 'Teacher'

  const fetchStudents = useCallback(async () => {
    if (!teacherClass) return
    try {
      setLoading(true)
      setError('')
      const data = await api.getStudents(teacherClass)
      setStudents(Array.isArray(data) ? data.map((s: any) => ({
        ...s,
        attendancePercent: s.attendancePercent ?? null,
        overallGrade: s.overallGrade ?? null,
      })) : [])
    } catch (err: any) {
      console.error('Failed to fetch students:', err)
      setError(err?.message || 'Failed to load students')
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [teacherClass])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = !searchQuery || 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGender = selectedGender === 'all' || s.gender === selectedGender
      return matchesSearch && matchesGender
    }).sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
      if (sortBy === 'rollNo') return ((a.rollNo || '').localeCompare(b.rollNo || ''))
      if (sortBy === 'attendance') return ((b.attendancePercent || 0) - (a.attendancePercent || 0))
      return 0
    })
  }, [students, searchQuery, selectedGender, sortBy])

  const stats = useMemo(() => {
    const total = students.length
    const active = students.filter(s => s.status !== 'inactive').length
    const highPerformers = students.filter(s => (s.overallGrade || 0) >= 85).length
    const avgAttendance = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + (s.attendancePercent || 0), 0) / students.length)
      : 0
    return { total, active, highPerformers, avgAttendance }
  }, [students])

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function resetForm() {
    setForm({ ...EMPTY_STUDENT_FORM, class: teacherClass })
    setError('')
  }

  function openAddForm() {
    resetForm()
    setEditingStudent(null)
    setShowAddForm(true)
    setError('')
  }

  function openEditForm(student: Student) {
    setForm({
      name: student.name || '',
      email: student.email || '',
      password: '',
      role: 'student',
      class: student.class || teacherClass,
      admissionNo: student.admissionNo || '',
      rollNo: student.rollNo || '',
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth || '',
      gender: student.gender || 'MALE',
      bloodGroup: student.bloodGroup || '',
      address: (student as any).address || '',
      fatherName: (student as any).fatherName || '',
      motherName: (student as any).motherName || '',
      status: student.status || 'active',
    })
    setEditingStudent(student)
    setShowAddForm(true)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccessMsg('')
    try {
      if (editingStudent) {
        await api.updateUser(editingStudent.id, form)
        setSuccessMsg(`Updated ${form.name} successfully!`)
      } else {
        await api.createUser(form)
        setSuccessMsg(`Added ${form.name} successfully!`)
        resetForm()
      }
      await fetchStudents()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      setError(err?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(studentId: string) {
    try {
      setError('')
      setSuccessMsg('')
      await api.deleteUser(studentId)
      setSuccessMsg('Student removed successfully!')
      await fetchStudents()
      setDeleteConfirmId(null)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      setError(err?.message || 'Failed to delete student')
    }
  }

  const genderBreakdown = useMemo(() => {
    const male = students.filter(s => s.gender === 'MALE').length
    const female = students.filter(s => s.gender === 'FEMALE').length
    const other = students.filter(s => s.gender === 'OTHER' || !s.gender).length
    return { male, female, other }
  }, [students])

  function getGradeBadge(grade: number | null | undefined) {
    if (!grade) return null
    if (grade >= 90) return { label: 'A+', color: 'text-emerald-500', variant: 'success' as const }
    if (grade >= 80) return { label: 'A', color: 'text-emerald-400', variant: 'success' as const }
    if (grade >= 70) return { label: 'B+', color: 'text-amber-500', variant: 'warning' as const }
    if (grade >= 60) return { label: 'B', color: 'text-amber-400', variant: 'warning' as const }
    return { label: 'C', color: 'text-red-500', variant: 'destructive' as const }
  }

  function getAttendanceIcon(pct: number | null | undefined) {
    if (!pct) return <Minus className="w-4 h-4 text-muted-foreground" />
    if (pct >= 90) return <TrendingUp className="w-4 h-4 text-emerald-500" />
    if (pct >= 75) return <Minus className="w-4 h-4 text-amber-500" />
    return <TrendingDown className="w-4 h-4 text-red-500" />
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Section</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {teacherName} • Class {teacherClass || 'Not assigned'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchStudents}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddForm}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </motion.button>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{successMsg}</p>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.total, color: 'from-blue-500 to-blue-600', icon: Users },
          { label: 'Active', value: stats.active, color: 'from-emerald-500 to-green-500', icon: CheckCircle2 },
          { label: 'High Performers', value: stats.highPerformers, color: 'from-amber-500 to-orange-500', icon: Star },
          { label: 'Avg Attendance', value: `${stats.avgAttendance}%`, color: 'from-purple-500 to-violet-500', icon: TrendingUp },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 overflow-hidden" glow>
            <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Gender & Sort Row */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="font-medium text-foreground">{students.length}</span> students
            <span className="hidden sm:inline">
              • <span className="text-blue-500">{genderBreakdown.male}M</span> • <span className="text-pink-500">{genderBreakdown.female}F</span>
            </span>
          </div>
          <div className="flex gap-1.5">
            {['all', 'MALE', 'FEMALE'].map(g => (
              <button
                key={g}
                onClick={() => setSelectedGender(g)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedGender === g
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {g === 'all' ? 'All' : g === 'MALE' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Sort by:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="text-xs border rounded-lg px-2 py-1.5 bg-background"
          >
            <option value="name">Name</option>
            <option value="rollNo">Roll No</option>
            <option value="attendance">Attendance</option>
          </select>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students by name, admission no, email, or roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
          />
        </div>
      </motion.div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => { if (!submitting) { setShowAddForm(false); setEditingStudent(null); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                    {editingStudent ? <Edit3 className="w-4 h-4 text-white" /> : <UserPlus className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {editingStudent ? 'Edit Student' : 'Add New Student'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {editingStudent ? `Editing ${editingStudent.name}` : `Add to Class ${teacherClass}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowAddForm(false); setEditingStudent(null); }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input required name="name" value={form.name} onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input required type="email" name="email" value={form.email} onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all" />
                  </div>
                  {!editingStudent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input required name="password" value={form.password} onChange={handleFormChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admission No</label>
                    <input name="admissionNo" value={form.admissionNo} onChange={handleFormChange} placeholder="ADM-2026-XXX"
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll No</label>
                    <input name="rollNo" value={form.rollNo} onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="+91-XXXXXXXXXX"
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                    <input name="bloodGroup" value={form.bloodGroup} onChange={handleFormChange} placeholder="O+"
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select name="status" value={form.status} onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <input name="address" value={form.address} onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Father's Name</label>
                    <input name="fatherName" value={form.fatherName} onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mother's Name</label>
                    <input name="motherName" value={form.motherName} onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setEditingStudent(null); }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4" /> {editingStudent ? 'Update Student' : 'Add Student'}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Remove Student?</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  This will permanently remove this student from the system. This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirmId)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student List */}
      <motion.div variants={itemVariants}>
        {loading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="w-10 h-10 mx-auto mb-4 text-orange-500 animate-spin" />
              <p className="text-muted-foreground text-lg font-medium">Loading students...</p>
            </CardContent>
          </Card>
        ) : filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground text-lg font-medium">
                {students.length === 0 ? 'No students in your section yet' : 'No matching students'}
              </p>
              <p className="text-muted-foreground/60 text-sm mt-1">
                {students.length === 0
                  ? 'Click "Add Student" to add your first student'
                  : 'Try adjusting your search or filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredStudents.map((student, idx) => {
                const gradeBadge = getGradeBadge(student.overallGrade)
                return (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: idx * 0.02 }}
                  >
                    <Card glow className="hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-300 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {student.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                      {student.name || 'Unknown'}
                                    </h3>
                                    {student.rollNo && (
                                      <span className="text-xs text-muted-foreground font-mono">
                                        #{student.rollNo}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {student.email}
                                    </span>
                                    {student.admissionNo && (
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {student.admissionNo}
                                      </span>
                                    )}
                                    {student.phone && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {student.phone}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Grade Badge */}
                                  {gradeBadge && (
                                    <Badge variant={gradeBadge.variant} className="text-[10px]">
                                      {gradeBadge.label}
                                    </Badge>
                                  )}

                                  {/* Status */}
                                  <Badge
                                    variant={student.status === 'active' ? 'success' : 'secondary'}
                                    className="text-[10px]"
                                  >
                                    {student.status || 'active'}
                                  </Badge>

                                  {/* Actions */}
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => openEditForm(student)}
                                      className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 transition-colors"
                                      title="Edit"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(student.id)}
                                      className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                                      title="Remove"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Details row */}
                              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${student.gender === 'MALE' ? 'bg-blue-400' : student.gender === 'FEMALE' ? 'bg-pink-400' : 'bg-gray-400'}`} />
                                  {student.gender === 'MALE' ? 'Male' : student.gender === 'FEMALE' ? 'Female' : 'Other'}
                                </span>

                                {student.dateOfBirth && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(student.dateOfBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                )}

                                {student.bloodGroup && (
                                  <span className="flex items-center gap-1">
                                    <HeartPulse className="w-3.5 h-3.5" />
                                    {student.bloodGroup}
                                  </span>
                                )}

                                <span className="flex items-center gap-1">
                                  {getAttendanceIcon(student.attendancePercent)}
                                  Attendance: {student.attendancePercent ?? 'N/A'}%
                                </span>

                                {student.overallGrade && (
                                  <span className="flex items-center gap-1 text-emerald-500 font-medium">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    Grade: {student.overallGrade}%
                                  </span>
                                )}
                              </div>

                              {/* Parent info */}
                              {((student as any).fatherName || (student as any).motherName) && (
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/70">
                                  {(student as any).fatherName && (
                                    <span>Father: {(student as any).fatherName}</span>
                                  )}
                                  {(student as any).motherName && (
                                    <span>Mother: {(student as any).motherName}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
