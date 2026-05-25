
import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
  Activity, PieChart as PieIcon
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts'
import { mockStudents, mockTeachers, mockSchools, mockRevenueData } from '@/lib/mock-data'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const enrollmentData = [
  { month: 'Jun', students: 1200 },
  { month: 'Jul', students: 1250 },
  { month: 'Aug', students: 1380 },
  { month: 'Sep', students: 1420 },
  { month: 'Oct', students: 1450 },
  { month: 'Nov', students: 1480 },
  { month: 'Dec', students: 1500 },
  { month: 'Jan', students: 1560 },
]

const departmentData = [
  { name: 'Science', teachers: 12, color: '#8b5cf6' },
  { name: 'Math', teachers: 10, color: '#3b82f6' },
  { name: 'English', teachers: 8, color: '#f59e0b' },
  { name: 'Arts', teachers: 6, color: '#ec4899' },
  { name: 'Sports', teachers: 5, color: '#10b981' },
]

const recentActivities = [
  { id: 1, action: 'New student enrolled', detail: 'Kavya Iyer - Class 9-A', time: '5 min ago', type: 'info' },
  { id: 2, action: 'Fee payment received', detail: '₹25,000 - Aarav Sharma', time: '15 min ago', type: 'success' },
  { id: 3, action: 'Teacher leave request', detail: 'Mr. Anil Desai - Jan 20', time: '1 hour ago', type: 'warning' },
  { id: 4, action: 'Exam schedule published', detail: 'Mid-term Feb 2025', time: '2 hours ago', type: 'info' },
  { id: 5, action: 'System backup completed', detail: 'Full backup - 2.4GB', time: '3 hours ago', type: 'success' },
]

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [showAI, setShowAI] = useState(false)

  const totalStudents = 1560
  const totalTeachers = 125
  const totalRevenue = 4580000
  const attendanceRate = 92

  return (
    <>
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
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
                School is running at <span className="text-emerald-500 font-medium">92% attendance</span>. <span className="text-amber-500 font-medium">3 leave requests</span> pending approval. Fee collection at 85% target.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-1.5">
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
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: totalStudents.toLocaleString(), icon: GraduationCap, color: 'from-orange-500 to-red-500', change: '+60 this month', trend: 'up' },
            { label: 'Total Teachers', value: totalTeachers.toString(), icon: Users, color: 'from-orange-600 to-amber-600', change: '5 on leave', trend: 'neutral' },
            { label: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'from-emerald-600 to-teal-600', change: '+12% YoY', trend: 'up' },
            { label: 'Attendance', value: `${attendanceRate}%`, icon: Activity, color: 'from-amber-600 to-orange-600', change: 'School-wide', trend: 'up' },
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <AreaChart data={mockRevenueData}>
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
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} formatter={(v: number) => [`₹${(v/100000).toFixed(1)}L`, '']} />
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
                      <Pie data={departmentData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="teachers" nameKey="name">
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {departmentData.map(dept => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <LineChart data={enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[1100, 1600]} />
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
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map(activity => (
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Add Student', icon: UserPlus, color: 'from-orange-500 to-amber-600' },
                  { label: 'Send Notice', icon: Bell, color: 'from-orange-600 to-amber-600' },
                  { label: 'View Reports', icon: FileText, color: 'from-emerald-600 to-teal-600' },
                  { label: 'System Settings', icon: Settings, color: 'from-amber-600 to-orange-600' },
                ].map(action => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
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
