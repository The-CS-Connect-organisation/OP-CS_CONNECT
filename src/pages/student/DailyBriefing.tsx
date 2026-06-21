import { useState, useEffect } from 'react'
import { useAuthStore, useDataStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { normalizeAcademicPercentage, formatPercentage } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Zap, Calendar, Clock, BookOpen, AlertCircle, CheckCircle, TrendingUp,
  Sun, Moon, CloudRain, Bus, Bell, Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function StudentDailyBriefing() {
  const { user } = useAuthStore()
  const { grades, attendance, assignments, timetable, events, fees, isLoading, fetchStudentData } = useDataStore()
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([])

  useEffect(() => {
    if (user?.id) {
      fetchStudentData(user.id)
      loadData()
    }
  }, [user?.id])

  const loadData = async () => {
    try {
      const [anns, books] = await Promise.all([
        api.getAnnouncements().catch(() => []),
        api.getBorrowedBooksByStudent(user?.id || '').catch(() => [])
      ])
      setAnnouncements(Array.isArray(anns) ? anns : [])
      setBorrowedBooks(Array.isArray(books) ? books : [])
    } catch { /* error */ } finally { setLoading(false) }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const greetingIcon = hour < 12 ? <Sun className="w-6 h-6 text-amber-500" /> : hour < 17 ? <Sun className="w-6 h-6 text-orange-500" /> : <Moon className="w-6 h-6 text-blue-500" />

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todaySchedule = timetable.find((t: any) => t.time && t[todayName.toLowerCase()]) || {}
  const todayPeriods = timetable
    .filter((t: any) => t[todayName.toLowerCase()])
    .map((t: any) => ({ time: t.time, ...t[todayName.toLowerCase()] }))
    .filter(p => p.subject)

  const pendingAssignments = assignments.filter((a: any) => a.status === 'active' || a.studentStatus === 'pending')
  const overdueBooks = borrowedBooks.filter((b: any) => b.status === 'overdue')
  const attendancePercent = attendance.length > 0 ? attendance[0]?.percentage : (user?.attendance || 0)
  const gpa = normalizeAcademicPercentage(grades.length > 0 ? grades.reduce((a: number, g: any) => a + (g.overall || g.score || 0), 0) / grades.length : (user?.gpa || 0))

  const upcomingExams = events.filter((e: any) => e.type === 'exam' || e.title.toLowerCase().includes('exam'))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  const feeStatus = fees.find((f: any) => f.status !== 'paid')

  if (isLoading || loading) {
    return <div className="space-y-4">{[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40" />)}</div>
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">{greetingIcon}</div>
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><TrendingUp className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{formatPercentage(gpa)}</p><p className="text-xs text-muted-foreground">Academic %</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{attendancePercent}%</p><p className="text-xs text-muted-foreground">Attendance</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><AlertCircle className="w-8 h-8 text-red-500" /><div><p className="text-2xl font-bold">{pendingAssignments.length}</p><p className="text-xs text-muted-foreground">Pending</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Bell className="w-8 h-8 text-blue-500" /><div><p className="text-2xl font-bold">{announcements.filter(a => a.pinned).length}</p><p className="text-xs text-muted-foreground">Pinned</p></div></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500" />Today's Schedule - {todayName}</CardTitle></CardHeader>
          <CardContent>
            {todayPeriods.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No classes today</p>
            ) : (
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {todayPeriods.map((period: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-orange-500" />
                        <div>
                          <p className="text-sm font-medium">{period.subject}</p>
                          <p className="text-xs text-muted-foreground">{period.room}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{period.time}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Pending Assignments */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-orange-500" />Pending Assignments</CardTitle></CardHeader>
          <CardContent>
            {pendingAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">All caught up!</p>
            ) : (
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {pendingAssignments.slice(0, 5).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.subject}</p>
                      </div>
                      <Badge variant={a.dueDate && new Date(a.dueDate) < new Date() ? 'destructive' : 'secondary'}>
                        {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No due date'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-orange-500" />Announcements</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {announcements.filter(a => a.pinned).slice(0, 3).map((ann: any) => (
                  <div key={ann.id} className="p-3 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                    <p className="text-sm font-medium">{ann.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ann.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" />Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueBooks.length > 0 && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">{overdueBooks.length} overdue book{overdueBooks.length > 1 ? 's' : ''}</p>
                </div>
              )}
              {feeStatus && (
                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Fee payment pending for {feeStatus.term}</p>
                </div>
              )}
              {upcomingExams.length > 0 && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{upcomingExams.length} upcoming exam{upcomingExams.length > 1 ? 's' : ''}</p>
                </div>
              )}
              {overdueBooks.length === 0 && !feeStatus && upcomingExams.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No alerts</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

