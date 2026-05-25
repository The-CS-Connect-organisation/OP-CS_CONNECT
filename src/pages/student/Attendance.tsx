import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { useAuthStore, useDataStore } from '@/lib/store'
import { api } from '@/lib/api'
import { UserCheck, CheckCircle2, XCircle, Clock, CalendarDays, Plus, Calendar, Send, AlertCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function AttendancePage() {
  const { user } = useAuthStore()
  const { attendance, isLoading } = useDataStore()
  const [rawAttendance, setRawAttendance] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '', type: 'personal' })

  const attendancePercent = attendance.length > 0 && attendance[0]?.percentage ? attendance[0].percentage : (user?.attendance || 0)
  const pieData = [
    { name: 'Present', value: attendancePercent, color: '#10b981' },
    { name: 'Absent', value: 100 - attendancePercent, color: '#ef4444' },
  ]

  useEffect(() => {
    if (user?.id) {
      api.getStudentAttendance(user.id).then((d: any) => setRawAttendance(Array.isArray(d) ? d : [])).catch(() => setRawAttendance([]))
      api.getLeaveRequestsByStudent(user.id).then((d: any) => setLeaveRequests(Array.isArray(d) ? d : [])).catch(() => setLeaveRequests([]))
    }
  }, [user?.id])

  const presentCount = rawAttendance.filter((a: any) => a.status === 'present').length
  const absentCount = rawAttendance.filter((a: any) => a.status === 'absent').length
  const lateCount = rawAttendance.filter((a: any) => a.status === 'late').length

  const statusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      case 'absent': return <XCircle className="w-5 h-5 text-red-500" />
      case 'late': return <Clock className="w-5 h-5 text-amber-500" />
      default: return <div className="w-5 h-5 rounded-full bg-muted" />
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success'
      case 'absent': return 'destructive'
      case 'late': return 'warning'
      default: return 'secondary'
    }
  }

  const handleLeaveSubmit = async () => {
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason || !user) return
    try {
      const newLeave = await api.createLeaveRequest({
        studentId: user.id,
        studentName: user.name,
        avatar: user.avatar || '',
        ...leaveForm
      })
      setLeaveRequests(prev => [newLeave.leaveRequest, ...prev])
      setLeaveForm({ startDate: '', endDate: '', reason: '', type: 'personal' })
      setShowLeaveDialog(false)
    } catch { /* error */ }
  }

  const leaveStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'destructive'
      case 'pending': return 'warning'
      default: return 'secondary'
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><UserCheck className="w-6 h-6 text-primary" /> Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">Your attendance record and leave scheduling</p>
        </div>
        <Button onClick={() => setShowLeaveDialog(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" /> Schedule Leave
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <Card glow>
                <CardContent className="p-5 text-center">
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270}>
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-2xl font-bold">{attendancePercent}%</p>
                  <p className="text-sm text-muted-foreground">Overall Attendance</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card glow>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
                  <div><p className="text-2xl font-bold">{presentCount}</p><p className="text-sm text-muted-foreground">Days Present</p></div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card glow>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center"><XCircle className="w-6 h-6 text-red-500" /></div>
                  <div><p className="text-2xl font-bold">{absentCount}</p><p className="text-sm text-muted-foreground">Days Absent</p></div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card glow>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center"><Clock className="w-6 h-6 text-amber-500" /></div>
                  <div><p className="text-2xl font-bold">{lateCount}</p><p className="text-sm text-muted-foreground">Days Late</p></div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Leave Requests */}
          <motion.div variants={itemVariants}>
            <Card glow>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {leaveRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No leave requests yet</p>
                    <Button variant="link" onClick={() => setShowLeaveDialog(true)} className="text-orange-600">Schedule your first leave</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaveRequests.map((lr: any) => (
                      <div key={lr.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center",
                          lr.status === 'approved' ? "bg-emerald-500/10" : lr.status === 'rejected' ? "bg-red-500/10" : "bg-amber-500/10"
                        )}>
                          {lr.status === 'approved' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                           lr.status === 'rejected' ? <XCircle className="w-5 h-5 text-red-500" /> :
                           <AlertCircle className="w-5 h-5 text-amber-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{lr.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(lr.startDate).toLocaleDateString()} - {new Date(lr.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={leaveStatusColor(lr.status) as any}>{lr.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card glow>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><CalendarDays className="w-5 h-5 text-primary" /> Daily Record</CardTitle>
              </CardHeader>
              <CardContent>
                {rawAttendance.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No attendance records found</p>
                ) : (
                  <div className="space-y-2">
                    {rawAttendance.map((record: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        {statusIcon(record.status)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                        <Badge variant={statusColor(record.status) as any}>{record.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Leave Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Leave</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={leaveForm.startDate} onChange={e => setLeaveForm(prev => ({ ...prev, startDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={leaveForm.endDate} onChange={e => setLeaveForm(prev => ({ ...prev, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={leaveForm.type} onChange={e => setLeaveForm(prev => ({ ...prev, type: e.target.value }))}>
                <option value="personal">Personal</option>
                <option value="medical">Medical</option>
                <option value="academic">Academic Event</option>
                <option value="family">Family Event</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea placeholder="Explain why you need leave..." value={leaveForm.reason} onChange={e => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>Cancel</Button>
            <Button onClick={handleLeaveSubmit} disabled={!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason} className="bg-orange-600 hover:bg-orange-700">
              <Send className="w-4 h-4 mr-2" /> Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
