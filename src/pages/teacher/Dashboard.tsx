
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const defaultClassPerformance = [
  { class: '10-A', avg: 85, highest: 98, lowest: 45, students: 40 },
  { class: '10-B', avg: 78, highest: 95, lowest: 38, students: 38 },
  { class: '9-A', avg: 82, highest: 97, lowest: 42, students: 36 },
]

const weeklyAttendance = [
  { day: 'Mon', present: 38, absent: 2 },
  { day: 'Tue', present: 36, absent: 4 },
  { day: 'Wed', present: 39, absent: 1 },
  { day: 'Thu', present: 35, absent: 5 },
  { day: 'Fri', present: 37, absent: 3 },
]

const gradingQueue = [
  { id: 1, student: 'Aarav Sharma', subject: 'Mathematics', type: 'Essay', submitted: '2 hours ago', status: 'pending' },
  { id: 2, student: 'Priya Patel', subject: 'Mathematics', type: 'Project', submitted: '5 hours ago', status: 'pending' },
  { id: 3, student: 'Rohan Kumar', subject: 'Mathematics', type: 'Essay', submitted: '1 day ago', status: 'ai_graded' },
  { id: 4, student: 'Ananya Singh', subject: 'Mathematics', type: 'Assignment', submitted: '1 day ago', status: 'ai_graded' },
  { id: 5, student: 'Vikram Reddy', subject: 'Mathematics', type: 'Quiz', submitted: '2 days ago', status: 'graded' },
]

export default function TeacherDashboard() {
  const { user } = useAuthStore()
  const [showAI, setShowAI] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('10-A')
  const [students, setStudents] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
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
        const studentResults = await api.getStudents(selectedClass)
        const assignmentResults = await api.getAssignments({ class: selectedClass })

        setStudents(Array.isArray(studentResults) ? studentResults : [])
        setAssignments(Array.isArray(assignmentResults) ? assignmentResults : [])
      } catch (error) {
        console.error('Unable to load class dashboard data', error)
        setStudents([])
        setAssignments([])
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
    : 82
  const todaysClasses = classes.length || 3
  const classPerformance = classes.length
    ? classes.map((cls) => ({
        class: cls.name || cls,
        avg: cls.avg || 78,
        highest: cls.highest || 98,
        lowest: cls.lowest || 45,
        students: cls.students || 30,
      }))
    : defaultClassPerformance

  return (
    <>
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
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
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: `${totalStudents}`, icon: Users, color: 'from-orange-600 to-amber-600', sub: `${classes.length || 1} class${classes.length === 1 ? '' : 'es'}` },
            { label: 'Avg Performance', value: `${avgPerformance}%`, icon: TrendingUp, color: 'from-emerald-600 to-teal-600', sub: '+3% this month' },
            { label: 'Pending Grades', value: `${pendingGrades}`, icon: PenTool, color: 'from-amber-600 to-orange-600', sub: 'AI graded: 2' },
            { label: "Today's Classes", value: `${todaysClasses}`, icon: Calendar, color: 'from-orange-500 to-amber-600', sub: `Next: ${selectedClass} at 10:45` },
          ].map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: -2, scale: 1.02 }}>
              <Card glow>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
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
                    <BarChart data={weeklyAttendance}>
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
                    <span className="font-semibold text-emerald-500">95%</span>
                  </div>
                  <Progress value={95} color="#10b981" />
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Take Attendance', icon: UserCheck, color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' },
                  { label: 'Create Assignment', icon: ClipboardList, color: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' },
                  { label: 'AI Grade Essays', icon: Brain, color: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' },
                  { label: 'Send Announcement', icon: MessageSquare, color: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' },
                ].map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
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
