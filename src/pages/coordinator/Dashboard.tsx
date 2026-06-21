
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AIChatPanel from '@/components/ai/AIChatPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/lib/store'
import { cn, formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Building2, Globe, DollarSign, BarChart3, Users, Sparkles,
  TrendingUp, Brain, FileText, CheckCircle2, AlertCircle,
  GraduationCap, Target, Zap, ArrowUpRight, ArrowDownRight,
  MapPin, Activity, Eye
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function CoordinatorDashboard() {
  const { user } = useAuthStore()
  const [showAI, setShowAI] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const dashboardData = await api.getCoordinatorDashboard()
        setData(dashboardData)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>
  }

  const { summaryStats, schools, comparisonData, radarComparison, aiAnalysis } = data

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Hero */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/10 via-teal-600/5 to-transparent border border-emerald-500/10 p-6 lg:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-[80px]" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Multi-School Command Center 🌐</h1>
                  <p className="text-muted-foreground text-sm">{summaryStats.schoolCount} Schools Under Coordination • {summaryStats.zone}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                All schools performing above <span className="text-emerald-500 font-medium">{summaryStats.benchmark}% benchmarks</span>. {aiAnalysis.needsAttention.school} needs <span className="text-amber-500 font-medium">{aiAnalysis.needsAttention.area} attention</span>.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAI(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
              >
                <Brain className="w-4 h-4" />
                AI Zone Report
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: summaryStats.totalStudents.toLocaleString(), icon: GraduationCap, color: 'from-emerald-600 to-teal-600', change: summaryStats.studentChange },
            { label: 'Total Teachers', value: summaryStats.totalTeachers.toString(), icon: Users, color: 'from-orange-600 to-amber-600', change: summaryStats.teacherChange },
            { label: 'Avg Attendance', value: `${summaryStats.avgAttendance}%`, icon: Activity, color: 'from-orange-500 to-amber-600', change: summaryStats.attendanceChange },
            { label: 'Fee Collection', value: `${summaryStats.avgFeeCollection}%`, icon: DollarSign, color: 'from-amber-600 to-orange-600', change: `Target: ${summaryStats.feeTarget}%` },
          ].map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: -2, scale: 1.02 }}>
              <Card glow className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1 stat-value">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
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

        {/* School Cards */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            Schools Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
            {schools.map((school: any, i: number) => (
              <motion.div key={school.id} whileHover={{ y: -3, scale: 1.02 }}>
                <Card glow className="cursor-pointer" onClick={() => setSelectedSchool(school.id)}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{school.name}</h3>
                      <Badge variant={school.status === 'Active' ? 'success' : 'warning'}>{school.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-secondary/50">
                        <p className="text-muted-foreground">Students</p>
                        <p className="font-semibold">{school.students}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary/50">
                        <p className="text-muted-foreground">Teachers</p>
                        <p className="font-semibold">{school.teachers}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Attendance</span>
                          <span className="font-medium">{school.attendance}%</span>
                        </div>
                        <Progress value={school.attendance} color={school.attendance >= 90 ? '#10b981' : '#f59e0b'} size="sm" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Fee Collection</span>
                          <span className="font-medium">{school.feeCollection}%</span>
                        </div>
                        <Progress value={school.feeCollection} color={school.feeCollection >= 85 ? '#10b981' : '#f59e0b'} size="sm" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Comparison Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card glow>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    School Comparison
                  </CardTitle>
                  <Badge variant="info" className="gap-1"><Sparkles className="w-3 h-3" />AI Benchmarked</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[60, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="north" fill="#8b5cf6" radius={[2, 2, 0, 0]} name="North" />
                      <Bar dataKey="south" fill="#3b82f6" radius={[2, 2, 0, 0]} name="South" />
                      <Bar dataKey="east" fill="#10b981" radius={[2, 2, 0, 0]} name="East" />
                      <Bar dataKey="west" fill="#f59e0b" radius={[2, 2, 0, 0]} name="West" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card glow>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Performance Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarComparison}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[60, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Radar name="North" dataKey="North" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                      <Radar name="East" dataKey="East" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                      <Legend fontSize={11} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Zone Report */}
        <motion.div variants={itemVariants}>
          <Card glow>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold flex items-center gap-2">
                    AI Zone Analysis
                    <Badge variant="success">Live</Badge>
                  </h3>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {aiAnalysis.insights.map((insight: string, i: number) => (
                      <p key={i} dangerouslySetInnerHTML={{ __html: insight }} />
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setShowAI(true)}>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Full AI Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AIChatPanel isOpen={showAI} onClose={() => setShowAI(false)} context="Area Coordinator managing 4 schools. Need comparative analytics and resource allocation insights." />
      </motion.div>
  )
}
