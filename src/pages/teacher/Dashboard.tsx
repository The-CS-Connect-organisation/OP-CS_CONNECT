
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AIChatPanel from '@/components/ai/AIChatPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { cn, normalizeAcademicPercentage, formatPercentage } from '@/lib/utils'
import {
  Users, ClipboardList, BarChart3, UserCheck, Sparkles,
  TrendingUp, Brain, FileText, Clock, CheckCircle2,
  AlertCircle, GraduationCap, MessageSquare, Calendar,
  BookOpen, Target, Zap, PenTool
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins} hour${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function TeacherDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [showAI, setShowAI] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('10-A')
  const [students, setStudents] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [classPerformance, setClassPerformance] = useState<any[]>([])
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState<any[]>([])
  const [gradingQueue, setGradingQueue] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      return
    }

    const loadTeacherClasses = async () => {
      try {
        setIsLoading(true)
        const teacherClasses = await api.getTeacherClasses(user.id)
        const classList = Array.isArray(teacherClasses) ? teacherClasses : []
        setClasses(classList)
        if (classList.length > 0 && !classList.find((cls) => cls.name === selectedClass)) {
          setSelectedClass(classList[0].name || classList[0])
        }
      } catch (error) {
        console.error('Unable to load teacher classes', error)
        setClasses([])
      } finally {
        setIsLoading(false)
      }
    }

    loadTeacherClasses()
  }, [user?.id])

  useEffect(() => {
    if (!selectedClass) {
      return
    }

    const loadClassData = async () => {
      try {
        setIsLoading(true)
        const [studentResults, assignmentResults, attendanceResults, analyticsResults] = await Promise.all([
          api.getStudents(selectedClass).catch(() => null),
          api.getAssignments({ class: selectedClass }).catch(() => null),
          api.getAttendance({ class: selectedClass }).catch(() => null),
          api.getClassAnalytics(selectedClass).catch(() => null),
        ])

        if (Array.isArray(studentResults) && studentResults.length > 0) {
          setStudents(studentResults)
        } else if (!studentResults) {
          setStudents([
            { id: '1', name: 'Aarav Sharma', rollNo: '1', gpa: 85, attendance: 92, avatar: '' },
            { id: '2', name: 'Priya Patel', rollNo: '2', gpa: 89, attendance: 96, avatar: '' },
            { id: '3', name: 'Rohan Kumar', rollNo: '3', gpa: 75, attendance: 85, avatar: '' },
            { id: '4', name: 'Ananya Singh', rollNo: '4', gpa: 82, attendance: 89, avatar: '' },
            { id: '5', name: 'Arjun Reddy', rollNo: '5', gpa: 78, attendance: 88, avatar: '' },
            { id: '6', name: 'Kavya Nair', rollNo: '6', gpa: 91, attendance: 95, avatar: '' },
            { id: '7', name: 'Vikram Joshi', rollNo: '7', gpa: 73, attendance: 78, avatar: '' },
            { id: '8', name: 'Sneha Kapoor', rollNo: '8', gpa: 88, attendance: 93, avatar: '' },
          ])
        } else {
          setStudents([])
        }
        setAssignments(Array.isArray(assignmentResults) ? assignmentResults : [])

        if (attendanceResults) {
          if (Array.isArray(attendanceResults) && attendanceResults.length > 0) {
            setWeeklyAttendanceData(attendanceResults)
          } else if (attendanceResults?.weekly) {
            setWeeklyAttendanceData(attendanceResults.weekly)
          }
        } else {
          setWeeklyAttendanceData([
            { day: 'Mon', present: 40, absent: 5 },
            { day: 'Tue', present: 38, absent: 7 },
            { day: 'Wed', present: 42, absent: 3 },
            { day: 'Thu', present: 39, absent: 6 },
            { day: 'Fri', present: 41, absent: 4 },
          ])
        }

        if (analyticsResults?.classPerformance) {
          setClassPerformance(analyticsResults.classPerformance)
        } else if (Array.isArray(analyticsResults)) {
          setClassPerformance(analyticsResults)
        } else {
          setClassPerformance([
            { class: selectedClass, avg: 78, highest: 95 },
            { class: selectedClass === '10-A' ? '10-B' : '10-A', avg: 72, highest: 91 },
          ])
        }

        const pending = Array.isArray(assignmentResults)
          ? assignmentResults.filter((a: any) => a.status === 'pending' || a.status === 'submitted' || a.status === 'ai_graded')
          : []
        setGradingQueue(pending.map((a: any, i: number) => ({
          id: a.id || i + 1,
          student: a.studentName || a.student || 'Unknown',
          subject: a.subject || selectedClass,
          type: a.type || a.assignmentType || 'Assignment',
          submitted: a.submittedAt ? timeAgo(new Date(a.submittedAt)) : '—',
          status: a.status === 'ai_graded' ? 'ai_graded' : a.status === 'graded' ? 'graded' : 'pending',
        })))
      } catch (error) {
        console.error('Unable to load class dashboard data', error)
        setStudents([])
        setAssignments([])
        setWeeklyAttendanceData([
          { day: 'Mon', present: 40, absent: 5 },
          { day: 'Tue', present: 38, absent: 7 },
          { day: 'Wed', present: 42, absent: 3 },
          { day: 'Thu', present: 39, absent: 6 },
          { day: 'Fri', present: 41, absent: 4 },
        ])
        setClassPerformance([
          { class: selectedClass, avg: 78, highest: 95 },
          { class: selectedClass === '10-A' ? '10-B' : '10-A', avg: 72, highest: 91 },
        ])
        setGradingQueue([])
      } finally {
        setIsLoading(false)
      }
    }

    loadClassData()
  }, [selectedClass])

  const totalStudents = students.length
  const pendingGrades = assignments.filter((item) => ['pending', 'submitted'].includes(item.status)).length
  const avgPerformance = students.length
    ? Math.round(
        students.reduce((sum, student) => sum + (student.gpa || 0), 0) / students.length,
      )
    : 0
  const todaysClasses = classes.length || 0

  return (
    <>
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="space-y-6">
        {/* Hero */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/10 via-cyan-600/5 to-transparent border border-orange-500/10 p-6 lg:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full filter blur-[80px]" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Avatar src={user?.avatar} alt={user?.name || ''} size="lg" />
                <div>
                  <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}! 👨‍🏫</h1>
                  <p className="text-muted-foreground text-sm">Mathematics Department • 3 Classes</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                You have <span className="text-amber-500 font-medium">2 ungraded submissions</span> and <span className="text-orange-500 font-medium">1 class</span> scheduled today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAI(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white text-sm font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
              >
                <Brain className="w-4 h-4" />
                AI Grade Assistant
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: `${totalStudents}`, icon: Users, color: 'from-orange-600 to-amber-600', sub: `${classes.length || 1} class${classes.length === 1 ? '' : 'es'}` },
            { label: 'Avg Performance', value: `${avgPerformance}%`, icon: TrendingUp, color: 'from-emerald-600 to-teal-600', sub: '+3% this month' },
            { label: 'Pending Grades', value: `${pendingGrades}`, icon: PenTool, color: 'from-amber-600 to-orange-600', sub: 'AI graded: 2' },
            { label: "Today's Classes", value: `${todaysClasses}`, icon: Calendar, color: 'from-orange-500 to-amber-600', sub: `Next: ${selectedClass} at 10:45` },
          ].map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: -2, scale: 1.02 }}>
              <Card glow className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1 stat-value">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                    </div>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br", stat.color)}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Performance */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card glow>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-500" />
                    Class Performance
                  </CardTitle>
                  <Badge variant="info" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Analysis
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="class" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Average" />
                      <Bar dataKey="highest" fill="#10b981" radius={[4, 4, 0, 0]} name="Highest" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-2">
                  <Brain className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-orange-500">AI Teaching Insight</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Class 10-B needs attention - 12% lower average. Consider extra tutorial sessions for struggling students. 3 students show declining trends.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attendance Today */}
          <motion.div variants={itemVariants}>
            <Card glow className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  Weekly Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyAttendanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
                      <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Today's Attendance</span>
                    <span className="font-semibold text-emerald-500">
                      {weeklyAttendanceData.length > 0
                        ? `${Math.round((weeklyAttendanceData[weeklyAttendanceData.length - 1].present || 0) / ((weeklyAttendanceData[weeklyAttendanceData.length - 1].present || 0) + (weeklyAttendanceData[weeklyAttendanceData.length - 1].absent || 0)) * 100)}%`
                        : '—'}
                    </span>
                  </div>
                  <Progress
                    value={weeklyAttendanceData.length > 0
                      ? Math.round((weeklyAttendanceData[weeklyAttendanceData.length - 1].present || 0) / ((weeklyAttendanceData[weeklyAttendanceData.length - 1].present || 0) + (weeklyAttendanceData[weeklyAttendanceData.length - 1].absent || 0)) * 100)
                      : 0}
                    color="#10b981"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Grading Queue & Student List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Grading Queue */}
          <motion.div variants={itemVariants}>
            <Card glow>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-amber-500" />
                    AI Grading Queue
                  </CardTitle>
                  <Badge variant="warning">2 Pending</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gradingQueue.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ x: 2 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/50 transition-all cursor-pointer"
                    >
                      <Avatar alt={item.student} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.student}</p>
                        <p className="text-xs text-muted-foreground">{item.type} • {item.submitted}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'pending' && (
                          <Badge variant="warning" className="text-[10px]">Pending</Badge>
                        )}
                        {item.status === 'ai_graded' && (
                          <Badge variant="info" className="text-[10px] flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI Graded
                          </Badge>
                        )}
                        {item.status === 'graded' && (
                          <Badge variant="success" className="text-[10px]">Graded</Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-500">AI Auto-Grade</p>
                    <p className="text-xs text-muted-foreground mt-0.5">2 submissions have been auto-graded by AI. Review and confirm the grades.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Student Roster */}
          <motion.div variants={itemVariants}>
            <Card glow>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    Student Roster
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">Class {selectedClass}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {students.slice(0, 8).map((student) => (
                    <div key={student.id || student.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/50 transition-colors">
                      <Avatar src={student.avatar} alt={student.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name || 'Student'}</p>
                        <p className="text-xs text-muted-foreground">Roll: {student.rollNo || student.roll || '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{student.gpa !== undefined ? formatPercentage(normalizeAcademicPercentage(student.gpa)) : 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">Academic %</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-semibold", (student.attendance ?? 0) >= 90 ? "text-emerald-500" : (student.attendance ?? 0) >= 75 ? "text-amber-500" : "text-red-500")}>
                          {student.attendance ?? 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Att.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card glow>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Take Attendance', icon: UserCheck, color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20', onClick: () => navigate('/teacher/attendance') },
                  { label: 'Create Assignment', icon: ClipboardList, color: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20', onClick: () => navigate('/teacher/assignments') },
                  { label: 'AI Grade Essays', icon: Brain, color: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20', onClick: () => navigate('/teacher/ai') },
                  { label: 'Send Announcement', icon: MessageSquare, color: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20', onClick: () => navigate('/student/announcements') },
                ].map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className={cn("flex items-center gap-2 p-3 rounded-xl border border-border/50 transition-all text-sm font-medium", action.color)}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <AIChatPanel isOpen={showAI} onClose={() => setShowAI(false)} context="Teacher dashboard - grading, class management, analytics" />
    </>
  )
}