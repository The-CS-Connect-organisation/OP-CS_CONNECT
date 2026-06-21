import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import {
  FileCheck, Loader2, ChevronRight, Star, MessageSquare,
  Save, ArrowLeft, CheckCircle2, AlertTriangle, BookOpen, Calendar
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function GradeSubmissions() {
  const { user } = useAuthStore()
  const [assignments, setAssignments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null)
  const [gradingData, setGradingData] = useState<Record<string, { marks: string; feedback: string }>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    loadData()
  }, [user?.id])

  const loadData = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const [assignRes, studentsRes] = await Promise.all([
        api.getAssignments({ teacherId: user.id }),
        api.getStudents(),
      ])
      setAssignments(Array.isArray(assignRes) ? assignRes : [])
      setStudents(Array.isArray(studentsRes) ? studentsRes : [])
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAssignment = async (assignment: any) => {
    setSelectedAssignment(assignment)
    try {
      const studentsRes = assignment.class ? await api.getStudents(assignment.class) : await api.getStudents()
      setStudents(Array.isArray(studentsRes) ? studentsRes : [])
    } catch {
      // error
    }
  }

  const handleSaveGrade = async (studentId: string) => {
    const data = gradingData[studentId]
    if (!data || !selectedAssignment || !data.marks) return
    try {
      setSaving(true)
      await api.gradeAssignment(selectedAssignment.id, {
        studentId,
        marks: parseInt(data.marks),
        feedback: data.feedback,
      })
      setSavedId(studentId)
      setTimeout(() => setSavedId(null), 3000)
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  const getGradeFromMarks = (marks: number, totalMarks: number = 100) => {
    const percent = (marks / totalMarks) * 100
    if (percent >= 90) return 'A+'
    if (percent >= 80) return 'A'
    if (percent >= 70) return 'B+'
    if (percent >= 60) return 'B'
    if (percent >= 50) return 'C'
    return 'D'
  }

  const getSubmissionForStudent = (studentId: string) => {
    return selectedAssignment?.submissions?.find((s: any) => s.studentId === studentId)
  }

  if (!selectedAssignment) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200 inline-block mb-2">
            Teaching
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileCheck className="text-orange-500" size={32} />
            Grade Submissions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Review and grade student submissions</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <motion.div variants={itemVariants} className="grid gap-4">
            {assignments.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No assignments found</h3>
                <p className="text-sm text-muted-foreground mt-1">Create assignments to start receiving submissions</p>
              </Card>
            ) : (
              assignments.map((assignment) => {
                const totalSubs = assignment.submissions?.length || 0
                const gradedSubs = assignment.submissions?.filter((s: any) => s.marks !== undefined).length || 0
                const pendingSubs = totalSubs - gradedSubs

                return (
                  <motion.div key={assignment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="p-5 hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleSelectAssignment(assignment)}>
                      <div className="flex flex-wrap items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold group-hover:text-orange-500 transition-colors">{assignment.title}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="text-[10px]">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {assignment.class}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {assignment.dueDate}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-bold">{gradedSubs}</span>
                            <span className="text-xs text-muted-foreground">/ {totalSubs} graded</span>
                          </div>
                          {pendingSubs > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              <span className="text-xs text-amber-600">{pendingSubs} pending</span>
                            </div>
                          )}
                          <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto mt-1 group-hover:text-orange-500 transition-colors" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-accent rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all"
                            style={{ width: `${totalSubs > 0 ? (gradedSubs / totalSubs) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}
      </motion.div>
    )
  }

  const assignmentSubmissions = selectedAssignment.submissions || []

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Button variant="ghost" size="sm" onClick={() => setSelectedAssignment(null)} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to assignments
        </Button>
        <h1 className="text-2xl font-bold">{selectedAssignment.title}</h1>
        <div className="flex items-center gap-3 mt-1">
          <Badge variant="outline" className="text-[10px]">{selectedAssignment.class}</Badge>
          <span className="text-sm text-muted-foreground">Due: {selectedAssignment.dueDate}</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {savedId && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Grade saved successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="space-y-4">
        {students.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No students found</h3>
            <p className="text-sm text-muted-foreground mt-1">No students are enrolled in this class</p>
          </Card>
        ) : (
          students.map((student) => {
            const submission = getSubmissionForStudent(student.id)
            const isSubmitted = !!submission
            const isGraded = submission?.marks !== undefined
            const gradeData = gradingData[student.id] || {
              marks: submission?.marks?.toString() || '',
              feedback: submission?.feedback || '',
            }

            return (
              <motion.div key={student.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                      {student.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{student.name}</h4>
                        {isGraded && <Badge variant="success" className="text-[10px]">Graded</Badge>}
                        {isSubmitted && !isGraded && <Badge variant="info" className="text-[10px]">Submitted</Badge>}
                        {!isSubmitted && <Badge variant="outline" className="text-[10px] text-muted-foreground">Not Submitted</Badge>}
                      </div>

                      {isSubmitted && submission.content && (
                        <div className="mt-2 p-3 bg-accent/50 rounded-lg">
                          <p className="text-sm">{submission.content}</p>
                        </div>
                      )}

                      {isSubmitted && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Marks</label>
                            <input
                              type="number"
                              min="0"
                              max={selectedAssignment.totalMarks || 100}
                              placeholder="Enter marks"
                              value={gradeData.marks}
                              onChange={(e) =>
                                setGradingData((prev) => ({
                                  ...prev,
                                  [student.id]: { ...prev[student.id], marks: e.target.value },
                                }))
                              }
                              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                            />
                            {gradeData.marks && (
                              <span className="text-xs text-muted-foreground">
                                Grade: {getGradeFromMarks(parseInt(gradeData.marks), selectedAssignment.totalMarks || 100)}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Feedback</label>
                            <textarea
                              placeholder="Write feedback..."
                              value={gradeData.feedback}
                              onChange={(e) =>
                                setGradingData((prev) => ({
                                  ...prev,
                                  [student.id]: { ...prev[student.id], feedback: e.target.value },
                                }))
                              }
                              rows={2}
                              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none"
                            />
                          </div>
                        </div>
                      )}

                      {isSubmitted && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleSaveGrade(student.id)}
                            disabled={saving || !gradeData.marks}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                            Save Grade
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </motion.div>
    </motion.div>
  )
}