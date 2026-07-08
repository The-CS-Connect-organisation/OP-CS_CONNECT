import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Search,
  Filter,
  Plus,
  FileText,
  Calendar,
  ChevronDown,
  MessageSquare,
  Paperclip,
  Loader2,
} from 'lucide-react'

interface HomeworkItem {
  id: string
  title: string
  subject: string
  description: string
  dueDate: string
  assignedDate: string
  status: 'pending' | 'submitted' | 'graded' | 'late'
  score?: number
  maxScore: number
  feedback?: string
  attachments: number
  teacherName: string
  subjectColor: string
}

const SUBJECT_HUES = [262, 217, 156, 180, 22, 48, 280, 142, 340, 190, 200];
function getSubjectColor(subject: string): string {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = SUBJECT_HUES[Math.abs(hash) % SUBJECT_HUES.length];
  return `hsl(${hue}, 60%, 50%)`;
}

const STATUS_FILTERS = ['all', 'pending', 'submitted', 'graded', 'late'] as const;

function getStatusConfig(status: string): { label: string; icon: any; variant: string } {
  switch (status) {
    case 'pending': return { label: 'Pending', icon: Clock, variant: 'warning' };
    case 'submitted': return { label: 'Submitted', icon: Send, variant: 'info' };
    case 'graded': return { label: 'Graded', icon: CheckCircle2, variant: 'success' };
    case 'late': return { label: 'Late', icon: AlertCircle, variant: 'destructive' };
    default: return { label: 'Pending', icon: Clock, variant: 'warning' };
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function getDaysRemaining(dueDate: string): { text: string; urgent: boolean } {
  const now = new Date()
  const due = new Date(dueDate)
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { text: `${Math.abs(diff)} days overdue`, urgent: true }
  if (diff === 0) return { text: 'Due today', urgent: true }
  if (diff === 1) return { text: 'Due tomorrow', urgent: true }
  if (diff <= 3) return { text: `${diff} days left`, urgent: true }
  return { text: `${diff} days left`, urgent: false }
}

export default function HomeworkPage() {
  const { user } = useAuthStore()
  const [activeStatus, setActiveStatus] = useState<string>('all')
  const [activeSubject, setActiveSubject] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'manager'

  useEffect(() => {
    let mounted = true
    async function fetchAssignments() {
      try {
        setLoading(true)
        setFetchError(null)
        const params: Record<string, string> = {}
        if (user?.class) params.class = user.class
        if (user?.id && user.role === 'student') {
          params.studentId = user.id
          if (user.sectionId) params.sectionId = user.sectionId
        }
        const data = await api.getAssignments(params)
        // Handle both plain array response and wrapped { success, assignments } format
        let list = Array.isArray(data) ? data : (data?.assignments ?? [])
        // Client-side section filter: if the assignment targets specific sections,
        // only show it if the student belongs to one of those sections
        if (user?.sectionId) {
          list = list.filter((a: any) => {
            const ids = a.sectionIds
            return !ids || ids.length === 0 || ids.includes(user.sectionId)
          })
        }
        if (mounted) setAssignments(list)
      } catch (err: any) {
        console.error('Failed to fetch assignments:', err)
        if (mounted) {
          setAssignments([])
          setFetchError(err?.message || 'Failed to load homework. Please try again.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (user?.id) fetchAssignments()
    else setLoading(false)
    return () => { mounted = false }
  }, [user?.id, user?.class, user?.role, user?.sectionId])

  const homeworkItems: HomeworkItem[] = useMemo(() => {
    return assignments.map((a: any) => ({
      id: a.id,
      title: a.title || 'Untitled Assignment',
      subject: a.subject || a.subjectId || 'General',
      description: a.description || '',
      dueDate: a.dueDate || a.due_date || '',
      assignedDate: a.createdAt || a.assignedDate || '',
      status: a.studentStatus || 'pending',
      score: a.scoredMarks ?? a.score,
      maxScore: a.points || a.maxMarks || a.maxScore || 100,
      feedback: a.feedback || null,
      attachments: a.attachments || 0,
      teacherName: a.teacherName || 'Teacher',
      subjectColor: getSubjectColor(a.subject || a.subjectId || 'General'),
    }))
  }, [assignments])

  const allSubjects = useMemo(() => {
    const subs = new Set<string>()
    homeworkItems.forEach(h => subs.add(h.subject))
    return ['All', ...Array.from(subs).sort()]
  }, [homeworkItems])

  const filteredHomework = useMemo(() => {
    return homeworkItems.filter((hw) => {
      const matchesStatus = activeStatus === 'all' || hw.status === activeStatus
      const matchesSubject = activeSubject === 'All' || hw.subject === activeSubject
      const matchesSearch =
        hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSubject && matchesSearch
    })
  }, [homeworkItems, activeStatus, activeSubject, searchQuery])

  const stats = useMemo(() => {
    const total = homeworkItems.length
    const completed = homeworkItems.filter((h) => h.status === 'graded').length
    const submitted = homeworkItems.filter((h) => h.status === 'submitted').length
    const pending = homeworkItems.filter((h) => h.status === 'pending').length
    const late = homeworkItems.filter((h) => h.status === 'late').length
    return { total, completed: completed || submitted, pending, late }
  }, [homeworkItems])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Homework</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isTeacherOrAdmin
              ? 'Assign and review homework submissions'
              : 'Track and submit your homework assignments'}
          </p>
        </div>
        {isTeacherOrAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow font-medium"
          >
            <Plus className="w-4 h-4" />
            New Assignment
          </motion.button>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'from-blue-500 to-blue-600', icon: FileText },
          { label: 'Pending', value: stats.pending, color: 'from-amber-500 to-orange-500', icon: Clock },
          { label: 'Completed', value: stats.completed, color: 'from-emerald-500 to-green-500', icon: CheckCircle2 },
          { label: 'Late', value: stats.late, color: 'from-red-500 to-rose-500', icon: AlertCircle },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 overflow-hidden" glow>
            <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search homework by title, subject, or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={activeSubject}
            onChange={(e) => setActiveSubject(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all appearance-none cursor-pointer"
          >
            {allSubjects.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </motion.div>

      {/* Status Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((status) => {
          const config = status === 'all'
            ? { label: 'All', icon: Filter, color: '' }
            : getStatusConfig(status)
          const Icon = config.icon
          const isActive = activeStatus === status
          return (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {config.label}
            </button>
          )
        })}
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="w-10 h-10 mx-auto mb-4 text-orange-500 animate-spin" />
              <p className="text-muted-foreground text-lg font-medium">Loading homework...</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Homework List */}
      {!loading && (
        <motion.div variants={containerVariants} className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredHomework.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardContent className="py-16 text-center">
                  <BookOpen className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-lg font-medium">No homework found</p>
                  <p className="text-muted-foreground/60 text-sm mt-1">
                    {fetchError
                      ? fetchError
                      : searchQuery
                        ? 'Try a different search term'
                        : homeworkItems.length === 0
                          ? 'No homework has been assigned yet. Check back later!'
                          : 'All caught up! No pending homework in this category'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            filteredHomework.map((hw) => {
              const statusConf = getStatusConfig(hw.status)
              const StatusIcon = statusConf.icon
              const daysInfo = getDaysRemaining(hw.dueDate)
              const isExpanded = expandedId === hw.id

              return (
                <motion.div
                  key={hw.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    glow
                    className="hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => setExpandedId(isExpanded ? null : hw.id)}
                  >
                    <CardContent className="p-0">
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Subject color indicator */}
                          <div
                            className="w-1.5 h-12 rounded-full mt-1 shrink-0"
                            style={{ backgroundColor: hw.subjectColor }}
                          />

                          <div className="flex-1 min-w-0">
                            {/* Top row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                  {hw.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span
                                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: `${hw.subjectColor}15`,
                                      color: hw.subjectColor,
                                    }}
                                  >
                                    {hw.subject}
                                  </span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {hw.teacherName}
                                  </span>
                                </div>
                              </div>
                              <Badge variant={statusConf.variant as any} className="shrink-0">
                                <StatusIcon className="w-3 h-3 mr-1 inline" />
                                {statusConf.label}
                              </Badge>
                            </div>

                            {/* Bottom info row */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Due: {new Date(hw.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className={`flex items-center gap-1 ${daysInfo.urgent ? 'text-red-500 font-medium' : ''}`}>
                                <Clock className="w-3.5 h-3.5" />
                                {daysInfo.text}
                              </span>
                              {hw.attachments > 0 && (
                                <span className="flex items-center gap-1">
                                  <Paperclip className="w-3.5 h-3.5" />
                                  {hw.attachments} files
                                </span>
                              )}
                              {hw.score !== undefined && (
                                <span className="flex items-center gap-1 text-emerald-500 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Score: {hw.score}/{hw.maxScore}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Expand indicator */}
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-muted-foreground/40"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </motion.div>
                        </div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Description</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{hw.description}</p>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition-shadow"
                                >
                                  <Send className="w-4 h-4" />
                                  {hw.status === 'submitted' ? 'Resubmit' : 'Submit Homework'}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  Ask Question
                                </motion.button>
                              </div>

                              {hw.feedback && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                                  <div className="flex items-start gap-3">
                                    <MessageSquare className="w-5 h-5 text-emerald-500 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Teacher Feedback</p>
                                      <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">{hw.feedback}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </motion.div>
      )}
    </motion.div>
  )
}
