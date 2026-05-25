import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore, useDataStore } from '@/lib/store'
import { ClipboardList, Clock, CheckCircle2, AlertCircle, BookOpen, Send } from 'lucide-react'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function AssignmentsPage() {
  const { user } = useAuthStore()
  const { assignments, isLoading } = useDataStore()
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all')

  const filtered = filter === 'all' ? assignments : assignments.filter((a: any) => {
    const status = a.studentStatus || a.status
    return status === filter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      case 'submitted': return <Send className="w-5 h-5 text-orange-500" />
      case 'pending': case 'active': return <Clock className="w-5 h-5 text-amber-500" />
      case 'late': return <AlertCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'success'
      case 'submitted': return 'info'
      case 'pending': case 'active': return 'warning'
      case 'late': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Assignments</h1>
            <p className="text-muted-foreground text-sm mt-1">Track and manage your assignments</p>
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'submitted', 'graded'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No assignments found</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((assignment: any) => {
              const status = assignment.studentStatus || assignment.status
              return (
                <motion.div key={assignment.id} variants={itemVariants}>
                  <Card glow className="hover:border-primary/20 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5">{getStatusIcon(status)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold">{assignment.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5" />
                                {assignment.subject || assignment.subjectId}
                              </p>
                            </div>
                            <Badge variant={getStatusColor(status) as any}>{status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Due: {assignment.dueDate}</span>
                            {assignment.scoredMarks !== undefined && (
                              <span>Score: {assignment.scoredMarks}/{assignment.maxMarks || 50}</span>
                            )}
                            {assignment.feedback && (
                              <span className="text-emerald-500">Feedback: {assignment.feedback}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
  )
}
