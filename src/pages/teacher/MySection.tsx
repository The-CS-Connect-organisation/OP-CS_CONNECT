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
  UserPlus,
  Mail,
  Phone,
  Calendar,
  HeartPulse,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Star,
  UserCheck,
  UserX,
  GraduationCap,
  Check,
  Clock,
  Save,
  Pencil,
  CalendarDays,
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
  const [section, setSection] = useState<any>(null)
  const [members, setMembers] = useState<Student[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGender, setSelectedGender] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'rollNo' | 'attendance'>('rollNo')
  const [showManageModal, setShowManageModal] = useState(false)
  const [manageSearch, setManageSearch] = useState('')
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Attendance marking state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, string>>({})
  const [attendanceSaving, setAttendanceSaving] = useState(false)

  // Roll number editing state
  const [editingRollNo, setEditingRollNo] = useState<string | null>(null)
  const [rollNoValues, setRollNoValues] = useState<Record<string, string>>({})
  const [rollSaving, setRollSaving] = useState<string | null>(null)

  const teacherId = user?.id || ''

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [sectionData, studentsData] = await Promise.all([
        api.getMySection(teacherId).catch(() => null),
        api.getUsers({ role: 'student' }),
      ])
      setSection(sectionData)
      setAllStudents(Array.isArray(studentsData) ? studentsData : [])

      const allStudents = Array.isArray(studentsData) ? studentsData : []
      if (sectionData) {
        const membersData = await api.getSectionMembers(sectionData.id).catch(() => [])
        setMembers(Array.isArray(membersData) ? membersData.map((s: any) => ({
          ...s,
          attendancePercent: s.attendancePercent ?? null,
          overallGrade: s.overallGrade ?? null,
        })) : [])
      } else if (user?.class) {
        const teacherClasses: string[] = Array.isArray((user as any).classes) ? (user as any).classes : [user.class].filter(Boolean)
        const classStudents = allStudents.filter((s: any) =>
          teacherClasses.some((c: string) => s.class === c)
        ).map((s: any) => ({
          ...s,
          attendancePercent: s.attendancePercent ?? null,
          overallGrade: s.overallGrade ?? null,
        }))
        setMembers(classStudents)
        setSection({ name: teacherClasses.join(', ') })
      } else {
        setMembers([])
      }
    } catch (err: any) {
      console.error('Failed to fetch section data:', err)
      setError(err?.message || 'Failed to load section data')
    } finally {
      setLoading(false)
    }
  }, [teacherId, user?.class])

  // Load attendance for the selected date
  const loadAttendanceForDate = useCallback(async (date: string, classSection: any) => {
    if (!classSection?.name) return
    try {
      const res = await api.getClassAttendance(classSection.name, date)
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []
      const marks: Record<string, string> = {}
      data.forEach((s: any) => {
        marks[s.id] = s.status && s.status !== 'unmarked' ? s.status : 'present'
      })
      setAttendanceMarks(marks)
    } catch {
      // If no attendance exists for this date, default to 'present' for all
      const marks: Record<string, string> = {}
      members.forEach(m => { marks[m.id] = 'present' })
      setAttendanceMarks(marks)
    }
  }, [members])

  // Load attendance when date or section changes
  useEffect(() => {
    if (section) {
      loadAttendanceForDate(attendanceDate, section)
    }
  }, [attendanceDate, section, loadAttendanceForDate])

  // Save attendance
  const handleSaveAttendance = async () => {
    if (!section) return
    setAttendanceSaving(true)
    try {
      const entries = members.map(m => ({
        studentId: m.id,
        status: attendanceMarks[m.id] || 'present',
      }))
      await api.markAttendance({ class: section.name, date: attendanceDate, entries })
      setSuccessMsg(`Attendance saved for ${section.name} on ${attendanceDate}`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      setError(err?.message || 'Failed to save attendance')
    } finally {
      setAttendanceSaving(false)
    }
  }

  // Mark all students with a status
  const handleMarkAll = (status: string) => {
    const newMarks: Record<string, string> = {}
    members.forEach(m => { newMarks[m.id] = status })
    setAttendanceMarks(newMarks)
  }

  // Save roll number
  const handleRollNoSave = async (studentId: string) => {
    const newRollNo = rollNoValues[studentId]
    if (!newRollNo || newRollNo.trim() === '') return
    setRollSaving(studentId)
    try {
      await api.updateUser(studentId, { rollNo: newRollNo.trim() })
      setMembers(prev => prev.map(m => m.id === studentId ? { ...m, rollNo: newRollNo.trim() } : m))
      setEditingRollNo(null)
      // Auto-sort by roll number after updating
      setSortBy('rollNo')
      setSuccessMsg('Roll number updated')
      setTimeout(() => setSuccessMsg(''), 2000)
    } catch (err: any) {
      setError(err?.message || 'Failed to update roll number')
    } finally {
      setRollSaving(null)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const memberIds = useMemo(() => new Set(members.map(m => m.id)), [members])

  const filteredStudents = useMemo(() => {
    return members.filter(s => {
      const matchesSearch = !searchQuery ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGender = selectedGender === 'all' || s.gender?.toUpperCase() === selectedGender
      return matchesSearch && matchesGender
    }).sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
      if (sortBy === 'rollNo') return ((a.rollNo || '').localeCompare(b.rollNo || ''))
      if (sortBy === 'attendance') return ((b.attendancePercent || 0) - (a.attendancePercent || 0))
      return 0
    })
  }, [members, searchQuery, selectedGender, sortBy])

  const stats = useMemo(() => {
    const total = members.length
    const active = members.filter(s => s.status !== 'inactive').length
    const highPerformers = members.filter(s => (s.overallGrade || 0) >= 85).length
    const avgAttendance = members.length > 0
      ? Math.round(members.reduce((sum, s) => sum + (s.attendancePercent || 0), 0) / members.length)
      : 0
    return { total, active, highPerformers, avgAttendance }
  }, [members])

  const filteredAllStudents = useMemo(() => {
    const query = manageSearch.toLowerCase()
    return allStudents.filter(s =>
      !query || s.name?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.class?.toLowerCase().includes(query)
    )
  }, [allStudents, manageSearch])

  const genderBreakdown = useMemo(() => {
    const male = members.filter(s => s.gender === 'MALE').length
    const female = members.filter(s => s.gender === 'FEMALE').length
    const other = members.filter(s => s.gender === 'OTHER' || !s.gender).length
    return { male, female, other }
  }, [members])

  async function toggleMember(studentId: string) {
    if (!section) return
    setSubmitting(studentId)
    try {
      if (memberIds.has(studentId)) {
        await api.removeSectionMember(section.id, studentId)
        setMembers(prev => prev.filter(m => m.id !== studentId))
      } else {
        await api.addSectionMember(section.id, studentId)
        const student = allStudents.find(s => s.id === studentId)
        if (student) setMembers(prev => [...prev, { ...student, attendancePercent: null, overallGrade: null }])
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update member')
    } finally {
      setSubmitting(null)
    }
  }

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
                {user?.name || 'Teacher'} {section ? `• ${section.name}` : ''}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchAll}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
          {section?.id && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowManageModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Manage Members
            </motion.button>
          )}

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
          { label: 'Total Members', value: stats.total, color: 'from-blue-500 to-blue-600', icon: Users },
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

      {/* No section assigned */}
      {!loading && !section && (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground text-lg font-medium">No section assigned</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Ask an admin to assign you a section in the classroom settings
            </p>
          </CardContent>
        </Card>
      )}

      {section && (
        <>
          {/* Gender & Sort Row */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="font-medium text-foreground">{members.length}</span> members
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
                placeholder="Search members by name, admission no, email, or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
              />
            </div>
          </motion.div>

          {/* Attendance Toolbar */}
          <motion.div variants={itemVariants}>
            <Card className="border border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-900/10">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Mark Attendance</span>
                  </div>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleMarkAll('present')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                    >
                      <Check className="w-3 h-3 inline mr-1" />All Present
                    </button>
                    <button
                      onClick={() => handleMarkAll('late')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                    >
                      <Clock className="w-3 h-3 inline mr-1" />All Late
                    </button>
                    <button
                      onClick={() => handleMarkAll('absent')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                    >
                      <X className="w-3 h-3 inline mr-1" />All Absent
                    </button>
                  </div>
                  <div className="flex-1" />
                  <button
                    onClick={handleSaveAttendance}
                    disabled={attendanceSaving}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition-all disabled:opacity-50"
                  >
                    {attendanceSaving ? (
                      <><Loader2 className="w-3 h-3 animate-spin inline mr-1" />Saving...</>
                    ) : (
                      <><Save className="w-3 h-3 inline mr-1" />Save Attendance</>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Student List */}
          <motion.div variants={itemVariants}>
            {loading ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Loader2 className="w-10 h-10 mx-auto mb-4 text-orange-500 animate-spin" />
                  <p className="text-muted-foreground text-lg font-medium">Loading members...</p>
                </CardContent>
              </Card>
            ) : members.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Users className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-lg font-medium">No members yet</p>
                  <p className="text-muted-foreground/60 text-sm mt-1">
                    Click "Manage Members" to add students to your section
                  </p>
                </CardContent>
              </Card>
            ) : filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Users className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-lg font-medium">No matching members</p>
                  <p className="text-muted-foreground/60 text-sm mt-1">
                    Try adjusting your search or filters
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
                                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                        {student.name || 'Unknown'}
                                      </h3>
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
                                      {gradeBadge && (
                                        <Badge variant={gradeBadge.variant} className="text-[10px]">
                                          {gradeBadge.label}
                                        </Badge>
                                      )}
                                      <Badge
                                        variant={student.status === 'active' ? 'success' : 'secondary'}
                                        className="text-[10px]"
                                      >
                                        {student.status || 'active'}
                                      </Badge>
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

                                    {/* Roll Number Box - Click to edit */}
                                    <span className="flex items-center gap-1">
                                      {editingRollNo === student.id ? (
                                        <div className="flex items-center gap-0.5 bg-background border border-orange-300 rounded-md px-1.5 py-0.5">
                                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mr-0.5">No:</span>
                                          <input
                                            type="text"
                                            value={rollNoValues[student.id] || student.rollNo || ''}
                                            onChange={(e) => setRollNoValues(prev => ({ ...prev, [student.id]: e.target.value }))}
                                            className="w-12 text-xs text-center bg-transparent focus:outline-none font-mono"
                                            autoFocus
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleRollNoSave(student.id)
                                              if (e.key === 'Escape') setEditingRollNo(null)
                                            }}
                                          />
                                          <button
                                            onClick={() => handleRollNoSave(student.id)}
                                            disabled={rollSaving === student.id}
                                            className="p-0.5 rounded text-emerald-500 hover:bg-emerald-50"
                                          >
                                            {rollSaving === student.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Check className="w-2.5 h-2.5" />}
                                          </button>
                                          <button
                                            onClick={() => setEditingRollNo(null)}
                                            className="p-0.5 rounded text-muted-foreground hover:bg-accent"
                                          >
                                            <X className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setEditingRollNo(student.id)
                                            setRollNoValues(prev => ({ ...prev, [student.id]: student.rollNo || '' }))
                                          }}
                                          className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-muted/30 hover:bg-muted hover:border-orange-300 transition-all group text-xs font-mono"
                                        >
                                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">No:</span>
                                          <span className="font-medium">{student.rollNo || '—'}</span>
                                          <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                        </button>
                                      )}
                                    </span>

                                    {/* Attendance Status Buttons */}
                                    <span className="flex items-center gap-1.5 ml-3 pl-3 border-l border-border">
                                      {[
                                        { key: 'present', icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                                        { key: 'late', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
                                        { key: 'absent', icon: X, color: 'text-rose-600', bg: 'bg-rose-100' },
                                      ].map(({ key, icon: Icon, color, bg }) => {
                                        const isActive = attendanceMarks[student.id] === key
                                        return (
                                          <button
                                            key={key}
                                            onClick={() => setAttendanceMarks(prev => ({ ...prev, [student.id]: key }))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                              isActive
                                                ? `${bg} ${color} shadow-sm scale-105`
                                                : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent'
                                            }`}
                                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                                          >
                                            <Icon className="w-4 h-4 mr-1 inline" />
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                          </button>
                                        )
                                      })}
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
        </>
      )}

      {/* Manage Members Modal */}
      <AnimatePresence>
        {showManageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowManageModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                    <UserPlus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Manage Section Members
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {section ? `${section.name} — ${members.length} member${members.length !== 1 ? 's' : ''}` : 'No section'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowManageModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search all students by name, email, or class..."
                    value={manageSearch}
                    onChange={(e) => setManageSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Click a student to {memberIds.size > 0 ? 'add or remove' : 'add'} them. Already-added students are grayed out.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {allStudents.length === 0 ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 text-orange-500 animate-spin" />
                    <p className="text-muted-foreground">Loading students...</p>
                  </div>
                ) : filteredAllStudents.length === 0 ? (
                  <div className="py-12 text-center">
                    <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">No students match your search</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAllStudents.map((student) => {
                      const isMember = memberIds.has(student.id)
                      const isSubmitting = submitting === student.id
                      return (
                        <motion.div
                          key={student.id}
                          layout
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <button
                            onClick={() => toggleMember(student.id)}
                            disabled={isSubmitting}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                              isMember
                                ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
                                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-sm cursor-pointer'
                            }`}
                          >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {student.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium truncate ${isMember ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                  {student.name || 'Unknown'}
                                </span>
                                {student.class && (
                                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isMember ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>
                                    {student.class}
                                  </span>
                                )}
                              </div>
                              <div className={`text-xs mt-0.5 ${isMember ? 'text-gray-400 dark:text-gray-500' : 'text-muted-foreground'}`}>
                                {student.email}
                              </div>
                            </div>
                            <div className="shrink-0">
                              {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                              ) : isMember ? (
                                <div className="flex items-center gap-1.5">
                                  <UserCheck className="w-5 h-5 text-emerald-500" />
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Added</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <UserPlus className="w-5 h-5 text-orange-500" />
                                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Add</span>
                                </div>
                              )}
                            </div>
                          </button>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                <span className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{memberIds.size}</strong> member{memberIds.size !== 1 ? 's' : ''} in section
                </span>
                <button
                  onClick={() => setShowManageModal(false)}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
