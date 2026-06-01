import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import {
  GraduationCap, Loader2, Save, CheckCircle2, AlertCircle,
  BookOpen, Users, ChevronRight, Search
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const GRADE_OPTIONS = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F']

export default function EnterGrades() {
  const { user } = useAuthStore()
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [gradeData, setGradeData] = useState<Record<string, { marks: string; grade: string }>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!user?.id) return
    loadClasses()
  }, [user?.id])

  const loadClasses = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const [classesRes, subjectsRes] = await Promise.all([
        api.getTeacherClasses(user.id),
        api.getSubjects(),
      ])
      setClasses(Array.isArray(classesRes?.classes) ? classesRes.classes : [])
      setSubjects(Array.isArray(subjectsRes) ? subjectsRes : [])
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedClass) return
    loadStudents()
  }, [selectedClass])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const studentsRes = await api.getStudents(selectedClass)
      const studentList = Array.isArray(studentsRes) ? studentsRes : []
      setStudents(studentList)
      const initialGrades: Record<string, { marks: string; grade: string }> = {}
      studentList.forEach((s: any) => {
        initialGrades[s.id] = { marks: s.marks?.toString() || '', grade: s.grade || '' }
      })
      setGradeData(initialGrades)
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGrades = async () => {
    if (!selectedClass || !selectedSubject) return
    try {
      setSaving(true)
      const gradesToSubmit = Object.entries(gradeData)
        .filter(([_, data]) => data.marks && data.grade)
        .map(([studentId, data]) => ({
          studentId,
          subjectId: selectedSubject,
          class: selectedClass,
          marks: parseInt(data.marks),
          grade: data.grade,
        }))

      if (gradesToSubmit.length === 0) return

      await api.enterGrades({ grades: gradesToSubmit })
      setSuccessMsg('Grades saved successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter((s: any) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200 inline-block mb-2">
          Teaching
        </div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <GraduationCap className="text-orange-500" size={32} />
          Enter Grades
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Record student grades for your classes</p>
      </motion.div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">{successMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Class</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select class</option>
                    {classes.map((c: any) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {selectedClass && selectedSubject && (
        <>
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">{filteredStudents.length} students</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <Button
                onClick={handleSaveGrades}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save All Grades
              </Button>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <motion.div variants={itemVariants} className="grid gap-3">
              {filteredStudents.length === 0 ? (
                <Card className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No students found</h3>
                  <p className="text-sm text-muted-foreground mt-1">No students match your search</p>
                </Card>
              ) : (
                filteredStudents.map((student) => {
                  const data = gradeData[student.id] || { marks: '', grade: '' }
                  return (
                    <motion.div key={student.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="p-4">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                            {student.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold">{student.name}</h4>
                            <p className="text-xs text-muted-foreground">Roll: {student.rollNo || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Marks</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0-100"
                                value={data.marks}
                                onChange={(e) =>
                                  setGradeData((prev) => ({
                                    ...prev,
                                    [student.id]: { ...prev[student.id], marks: e.target.value },
                                  }))
                                }
                                className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Grade</label>
                              <select
                                value={data.grade}
                                onChange={(e) =>
                                  setGradeData((prev) => ({
                                    ...prev,
                                    [student.id]: { ...prev[student.id], grade: e.target.value },
                                  }))
                                }
                                className="w-20 bg-background border border-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-purple-500"
                              >
                                <option value="">-</option>
                                {GRADE_OPTIONS.map((g) => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}