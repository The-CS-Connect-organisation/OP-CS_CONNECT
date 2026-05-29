import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
const AIChatPanel = lazy(() => import('@/components/ai/AIChatPanel'))
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore, useDataStore } from '@/lib/store'
import { cn, formatCurrency, normalizeAcademicPercentage, formatPercentage } from '@/lib/utils'
import {
  BookOpen, ClipboardList, Calendar, BarChart3, UserCheck,
  CreditCard, Trophy, Sparkles, TrendingUp, TrendingDown,
  Clock, AlertCircle, CheckCircle2, ArrowUpRight, Brain,
  Target, Zap, GraduationCap, Star, Loader2
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, PieChart, Pie, Cell
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const { grades, attendance, assignments, subjects, fees, clubs, timetable, events, isLoading, fetchStudentData } = useDataStore()
  const [showAI, setShowAI] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'schedule'>('overview')
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.id) fetchStudentData(user.id)
  }, [user?.id, fetchStudentData])

  const totalFees = fees.reduce((a: number, f: any) => a + (f.amount || 0), 0)
  const paidFees = fees.reduce((a: number, f: any) => a + (f.paid || 0), 0)
  const dueFees = fees.reduce((a: number, f: any) => a + (f.due || 0), 0)
  const currentGPA = grades.length > 0 ? grades.reduce((a: number, g: any) => a + (g.overall || 0), 0) / grades.length : (user?.gpa || 0)
  const currentPercentage = normalizeAcademicPercentage(currentGPA)
  const attendancePercent = attendance.length > 0 && attendance[0]?.percentage ? attendance[0].percentage : (user?.attendance || 0)

  const radarData = grades.map((g: any) => ({ subject: g.subject?.slice(0, 4) || '??', score: g.overall || 0, fullMark: 100 }))
  const pieData = [
    { name: 'Present', value: attendancePercent, color: '#10b981' },
    { name: 'Absent', value: 100 - attendancePercent, color: '#ef4444' },
  ]

  const performanceData = grades.map((g: any) => ({
    month: g.subject?.slice(0, 4) || '??',
    score: normalizeAcademicPercentage(g.overall || 0),
    attendance: attendancePercent,
  }))

  const upcomingAssignments = assignments.filter((a: any) => a.studentStatus === 'pending' || a.studentStatus === 'active' || a.status === 'active' || a.status === 'pending').slice(0, 3)

  return (
    <>
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="space-y-6 bento-grid">
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600/10 via-amber-600/5 to-transparent border border-orange-500/10 p-6 lg:p-8 hero-card">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full filter blur-[80px]" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Avatar src={user?.avatar} alt={user?.name || ''} size="lg" />
                <div>
                  <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 🎓</h1>
                  <p className="text-muted-foreground text-sm">{user?.class ? `${user.class} •` : ''} Roll No: {user?.rollNo || '—'}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                Your AI study plan has been updated. You have <span className="text-amber-500 font-medium">3 pending assignments</span> and a <span className="text-orange-500 font-medium">Physics exam</span> in 5 days.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAI(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                AI Study Plan
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="quick-stats-grid">
          {[
            { label: 'Academic %', value: formatPercentage(currentPercentage), icon: GraduationCap, change: '+0.3', trend: 'up', color: 'from-orange-500 to-amber-600', bgColor: 'bg-orange-500/10' },
            { label: 'Attendance', value: `${attendancePercent}%`, icon: UserCheck, change: '+2%', trend: 'up', color: 'from-emerald-600 to-teal-600', bgColor: 'bg-emerald-500/10' },
            { label: 'Assignments', value: `${upcomingAssignments.length}`, icon: ClipboardList, change: '3 due', trend: 'neutral', color: 'from-amber-600 to-orange-600', bgColor: 'bg-amber-500/10' },
            { label: 'Fees Due', value: formatCurrency(dueFees), icon: CreditCard, change: 'Term 3', trend: 'warning', color: 'from-red-600 to-pink-600', bgColor: 'bg-red-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ duration:.2 }}
              className={`quick-stat-${i+1}`}>
              <Card glow className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {stat.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                        {stat.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                        <span className={cn(
                          "text-xs font-medium",
                          stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'warning' ? 'text-amber-500' : 'text-muted-foreground'
                        )}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br", stat.color)}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Performance Chart */}
          <motion.div variants={itemVariants} className="performance-chart">
            <Card glow>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Performance Trends
                  </CardTitle>
                  <Badge variant="info" className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    AI Insights
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[60, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#gpaGradient)" strokeWidth={2} name="Score %" />
                      <Area type="monotone" dataKey="attendance" stroke="#10b9.81" fill="url(#attGradient)" strokeWidth={2} name="Attendance" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* AI Insight */}
                <div className="mt-4 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-orange-500">AI Insight</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Your academic percentage is trending upward! Attendance dips in Dec correlated with lower scores. Stay consistent for even better results.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attendance & Radar */}
          <motion.div variants={itemVariants} className="attendance-radar-grid">
            <Card glow>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-xs">Present {attendancePercent}%</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-xs">Absent {100 - attendancePercent}%</span></div>
                </div>
              </CardContent>
            </Card>

            <Card glow>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Subject Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" opacity={0.3} />
                      <PolarAngleAxis dataKey="subject" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                      <Radar name="Performance" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Assignments & Schedule Row */}
        <div className="assignments-schedule-grid">
          {/* Upcoming Assignments */}
          <motion.div variants={itemVariants} className="upcoming-assignments">
            <Card glow>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-500" />
                    Upcoming Assignments
                  </CardTitle>
                  <button className="text-xs text-primary hover:underline">View All</button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingAssignments.map((assignment) => (
                  <motion.div
                    key={assignment.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: assignment.color + '20' }}>
                      📝
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground">{assignment.subject} • Due: {assignment.dueDate}</p>
                    </div>
                    <Badge variant={assignment.status === 'late' ? 'destructive' : assignment.status === 'pending' ? 'warning' : 'success'}>
                      {assignment.status}
                    </Badge>
                  </motion.div>
                ))}
                {assignments.filter((a: any) => a.status === 'graded').slice(0, 1).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">Scored: {a.scoredMarks}/{a.maxMarks}</p>
                    </div>
                    <Badge variant="success">Graded</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Schedule */}
          <motion.div variants={itemVariants} className="todays-schedule">
            <Card glow>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Today's Schedule
                  </CardTitle>
                  <Badge variant="info">5 Classes</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {timetable.slice(0, 5).map((slot: any, i: number) => {
                  const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()] as string
                  const cls = slot[dayKey] || slot.monday || slot.tuesday || Object.values(slot).find((v: any) => v?.subject) as any
                  if (!cls) return null
                  const isBreak = cls.subject === 'Break' || cls.subject === 'Lunch'
                  return (
                    <div key={i} className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
                      isBreak ? "opacity-50" : "hover:bg-secondary/30"
                    )}>
                      <div className="text-xs text-muted-foreground w-24 flex-shrink-0">{(slot.time || '').split(' - ')[0]}</div>
                      <div className={cn("w-1 h-8 rounded-full", isBreak ? "bg-muted-foreground/30" : "")} style={!isBreak ? { backgroundColor: cls.color || '#6366f1' } : {}} />
                      <div className="flex-1">
                        <p className={cn("text-sm font-medium", isBreak && "italic")}>{cls.subject}</p>
                        {!isBreak && cls.room && <p className="text-xs text-muted-foreground">Room {cls.room}</p>}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Grades Table & Activities */}
        <div className="grades-activities-grid">
          {/* Grade Analytics */}
          <motion.div variants={itemVariants} className="grade-analytics">
            <Card glow>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Grade Analytics
                  </CardTitle>
                  <Badge variant="info" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Predictions
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Subject</th>
                        <th className="text-center text-xs font-medium text-muted-foreground pb-3 px-2">Mid Term</th>
                        <th className="text-center text-xs font-medium text-muted-foreground pb-3 px-2">Final</th>
                        <th className="text-center text-xs font-medium text-muted-foreground pb-3 px-2">Overall</th>
                        <th className="text-center text-xs font-medium text-muted-foreground pb-3 px-2">Grade</th>
                        <th className="text-center text-xs font-medium text-muted-foreground pb-3 pl-2">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade: any) => (
                        <tr key={grade.subject} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                          <td className="py-3 pr-4 text-sm font-medium">{grade.subject}</td>
                          <td className="py-3 px-2 text-center text-sm">{grade.midTerm || '—'}</td>
                          <td className="py-3 px-2 text-center text-sm">{grade.finalTerm || '—'}</td>
                          <td className="py-3 px-2 text-center text-sm font-semibold">{grade.overall || '—'}</td>
                          <td className="py-3 px-2 text-center text-sm">{grade.grade || '—'}</td>
                          <td className="py-3 pl-2 text-center">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full mx-auto ${grade.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                              {grade.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activities & Fees */}
          <motion.div variants={itemVariants} className="activities-fees-grid">
            <Card glow>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  My Clubs & Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {clubs.slice(0, 2).map((club: any) => (
                  <div key={club.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-lg">{club.icon}</div>
                    <div>
                      <p className="text-sm font-medium">{club.name}</p>
                      <p className="text-xs text-muted-foreground">{club.role}</p>
                    </div>
                  </div>
                ))}
                {events.slice(0, 1).map((event: any) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🎉</div>
                    <div>
                      <p className="text-sm font-medium">{event.name}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card glow>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  Fee Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fees.slice(0, 1).map((fee: any) => (
                    <div key={fee.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{fee.title}</p>
                        <Badge variant={fee.status === 'paid' ? 'success' : 'warning'}>{fee.status}</Badge>
                      </div>
                      <Progress value={(fee.paid / fee.amount) * 100} />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Paid: {formatCurrency(fee.paid)}</span>
                        <span>Due: {formatCurrency(fee.due)}</span>
                      </div>
                      {fee.status !== 'paid' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate('/student/fees')}
                          className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                        >
                          Pay Now
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* AI Chat Panel */}
      <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
        <AIChatPanel isOpen={showAI} onClose={() => setShowAI(false)} context="Student dashboard - viewing grades, assignments, and schedule" />
      </Suspense>
    </>
  )
}