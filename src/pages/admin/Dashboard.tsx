
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import AIChatPanel from '@/components/ai/AIChatPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/lib/store'
import { cn, formatCurrency } from '@/lib/utils'
import {
  Users, School, DollarSign, BarChart3, Shield, Sparkles,
  TrendingUp, Brain, FileText, Clock, CheckCircle2,
  AlertCircle, GraduationCap, MessageSquare, Calendar,
  BookOpen, Target, Zap, Settings, Bell, UserPlus,
  Activity, PieChart as PieIcon, ChevronLeft, ChevronRight
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line
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



export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [showAI, setShowAI] = useState(false)
  const [liveData, setLiveData] = useState<any>({
    invoices: 0, expenses: 0, staff: 0, books: 0, students: 0, teachers: 0,
    onLeave: 0, totalRevenue: 0, attendanceRate: 0,
    departments: [], activities: [],
  })
  const [activityPage, setActivityPage] = useState(0)
  const activitiesPerPage = 3;

  useEffect(() => {
    const logErr = (label: string) => (e: any) => console.error(`[Dashboard] ${label} failed:`, e?.message || e);
    Promise.allSettled([
      api.getInvoices().then((d: any) => setLiveData((p: any) => ({ ...p, invoices: Array.isArray(d) ? d.filter((i: any) => i.status === 'pending').length : 0 }))).catch(logErr('getInvoices')),
      api.getManagerFinance().then((d: any) => setLiveData((p: any) => ({ ...p, totalRevenue: d?.revenue || 0, monthlyTrend: d?.monthlyTrend || [] }))).catch(logErr('getManagerFinance')),
      api.getExpenses().then((d: any) => setLiveData((p: any) => ({ ...p, expenses: Array.isArray(d) ? d.filter((e: any) => e.status !== 'approved').length : 0 }))).catch(logErr('getExpenses')),
      api.getStaffDirectory().then((d: any) => setLiveData((p: any) => ({ ...p, staff: Array.isArray(d) ? d.length : 0 }))).catch(logErr('getStaffDirectory')),
      api.getLibraryCatalogue().then((d: any) => setLiveData((p: any) => ({ ...p, books: Array.isArray(d) ? d.length : 0 }))).catch(logErr('getLibraryCatalogue')),
      api.getUsers().then((d: any) => {
        if (Array.isArray(d)) {
          const students = d.filter((u: any) => u.role === 'student').length
          const teachers = d.filter((u: any) => u.role === 'teacher').length
          const deptMap: Record<string, number> = {}
          d.filter((u: any) => u.role === 'teacher').forEach((t: any) => { const dept = t.department || 'General'; deptMap[dept] = (deptMap[dept] || 0) + 1 })
          const colors = ['#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#10b981', '#ef4444']
          const departments = Object.entries(deptMap).map(([name, count], i: number) => ({ name, teachers: count, color: colors[i % colors.length] }))
          setLiveData((p: any) => ({ ...p, students, teachers, departments: departments.length ? departments : p.departments }))
        }
      }).catch(logErr('getUsers')),
      api.getAttendance().then((d: any) => {
        if (Array.isArray(d) && d.length > 0) setLiveData((p: any) => ({ ...p, attendanceRate: Math.round(d.filter((a: any) => a.status === 'present').length / d.length * 100) }))
      }).catch(logErr('getAttendance')),
      api.getLeaveRequests().then((d: any) => {
        if (Array.isArray(d)) setLiveData((p: any) => ({ ...p, onLeave: d.filter((r: any) => r.status === 'approved').length }))
      }).catch(logErr('getLeaveRequests')),
      Promise.allSettled([
        api.getAnnouncements().then((d: any) => Array.isArray(d) ? d.slice(0, 3) : []).catch(logErr('getAnnouncements')),
      ]).then(([annRes]) => {
        const ann = (annRes as any).value || []
        const activities = ann.map((a: any, i: number) => ({ id: i + 1, action: a.title || 'Announcement', detail: a.content?.substring(0, 40) || '', time: new Date(a.createdAt || a.date || Date.now()).toLocaleDateString(), type: 'info' as const }))
        if (activities.length) setLiveData((p: any) => ({ ...p, activities }))
      }),
    ])
  }, [])

  const paginatedActivities = liveData.activities.slice(activityPage * activitiesPerPage, (activityPage + 1) * activitiesPerPage);


  return (
    <>
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="space-y-6">
        {/* Hero */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600/10 via-red-600/5 to-transparent border border-orange-500/10 p-6 lg:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full filter blur-[80px]" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Admin Control Center 🏫</h1>
                  <p className="text-muted-foreground text-sm">Cornerstone Academy • Full Overview</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                <span className="text-emerald-500 font-medium">{liveData.students} students</span> enrolled. <span className="text-amber-500 font-medium">{liveData.invoices} pending invoices</span>. {liveData.expenses > 0 && <span className="text-red-500 font-medium">{liveData.expenses} unapproved expenses</span>}. {liveData.books} library books catalogued.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.location.href = '/admin/users'}>
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAI(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
              >
                <Brain className="w-4 h-4" />
                AI Insights
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: liveData.students.toLocaleString(), icon: GraduationCap, color: 'from-orange-500 to-red-500', change: 'enrolled', trend: 'up' },
            { label: 'Total Teachers', value: liveData.teachers.toString(), icon: Users, color: 'from-orange-600 to-amber-600', change: `${liveData.onLeave} on leave`, trend: 'neutral' },
            { label: 'Revenue', value: formatCurrency(liveData.totalRevenue), icon: DollarSign, color: 'from-emerald-600 to-teal-600', change: 'invoiced', trend: 'up' },
            { label: 'Attendance', value: `${liveData.attendanceRate || 0}%`, icon: Activity, color: 'from-amber-600 to-orange-600', change: 'School-wide', trend: 'up' },
          ].map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: -2, scale: 1.02 }}>
              <Card glow>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {stat.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                        <span className={cn("text-xs", stat.trend === 'up' ? 'text-emerald-500' : 'text-muted-foreground')}>{stat.change}</span>
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
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card glow>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    Financial Overview
                  </CardTitle>
                  <Badge variant="success">On Track</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={liveData.monthlyTrend?.length ? liveData.monthlyTrend : [{ month: 'Collected', collected: liveData.totalRevenue || 0, expenses: 0 }]}>
                      <defs>
                        <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} formatter={(v: number) => [formatCurrency(v), '']} />
                      <Area type="monotone" dataKey="collected" stroke="#10b981" fill="url(#revGradient)" strokeWidth={2} name="Collected" />
                      <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expGradient)" strokeWidth={2} name="Expenses" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-2">
                  <Brain className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-orange-500">AI Financial Insight</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Revenue is 12% above projections. Expenses are well-controlled. Recommend allocating surplus to science lab upgrade and digital library expansion.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Department Distribution */}
          <motion.div variants={itemVariants}>
            <Card glow className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-orange-500" />
                  Departments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={liveData.departments.length ? liveData.departments : [{ name: 'No data', teachers: 1, color: '#6b7280' }]} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="teachers" nameKey="name">
                        {(liveData.departments.length ? liveData.departments : [{ name: 'No data', teachers: 1, color: '#6b7280' }]).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {(liveData.departments.length ? liveData.departments : [{ name: 'No data', teachers: 0, color: '#6b7280' }]).map((dept: any) => (
                    <div key={dept.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                        <span className="text-xs">{dept.name}</span>
                      </div>
                      <span className="text-xs font-medium">{dept.teachers} teachers</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enrollment & Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Enrollment Trend */}
          <motion.div variants={itemVariants}>
            <Card glow>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  Enrollment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{ month: 'Current', students: liveData.students }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} name="Students" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card glow>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-500" />
                    Recent Activity
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setActivityPage(p => Math.max(0, p - 1))} disabled={activityPage === 0}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">Page {activityPage + 1} of {Math.ceil(liveData.activities.length / activitiesPerPage)}</span>
                    <Button variant="ghost" size="sm" onClick={() => setActivityPage(p => Math.min(p + 1, Math.ceil(liveData.activities.length / activitiesPerPage) - 1))} disabled={(activityPage + 1) * activitiesPerPage >= liveData.activities.length}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(paginatedActivities.length ? paginatedActivities : [{ id: 0, action: 'No recent activity', detail: 'Data will appear here', time: '', type: 'info' }]).map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        activity.type === 'success' ? 'bg-emerald-500/10' : activity.type === 'warning' ? 'bg-amber-500/10' : 'bg-orange-500/10'
                      )}>
                        {activity.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {activity.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                        {activity.type === 'info' && <Bell className="w-4 h-4 text-orange-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.detail}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{activity.time}</span>
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
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Add User', icon: UserPlus, color: 'from-orange-500 to-amber-600', href: '/admin/create-account' },
                    { label: 'Send Notice', icon: Bell, color: 'from-orange-600 to-amber-600', href: '/admin/announcements' },
                    { label: 'View Reports', icon: FileText, color: 'from-emerald-600 to-teal-600', href: '/admin/analytics' },
                    { label: 'System Settings', icon: Settings, color: 'from-amber-600 to-orange-600', href: '/admin/platform' },
                  ].map(action => (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => window.location.href = action.href}
                      className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/30 bg-card/50 hover:bg-accent/50 transition-all"
                    >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br", action.color)}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <AIChatPanel isOpen={showAI} onClose={() => setShowAI(false)} context="Admin dashboard - school management, user management, financial oversight" />
    </>
  )
}

