import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/lib/store'
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

const mockHomework: HomeworkItem[] = [
  {
    id: 'hw1',
    title: 'Quadratic Equations Practice',
    subject: 'Mathematics',
    description: 'Solve problems 1-20 from Chapter 5: Quadratic Equations. Show all steps clearly.',
    dueDate: '2026-02-20',
    assignedDate: '2026-02-13',
    status: 'pending',
    maxScore: 50,
    attachments: 2,
    teacherName: 'Dr. Rajesh Gupta',
    subjectColor: '#8b5cf6',
  },
  {
    id: 'hw2',
    title: 'Physics Lab Report - Ohm\'s Law',
    subject: 'Physics',
    description: 'Write a comprehensive lab report on the Ohm\'s Law experiment conducted in class.',
    dueDate: '2026-02-18',
    assignedDate: '2026-02-11',
    status: 'submitted',
    maxScore: 30,
    attachments: 1,
    teacherName: 'Prof. Sunita Verma',
    subjectColor: '#3b82f6',
  },
  {
    id: 'hw3',
    title: 'Organic Chemistry Nomenclature',
    subject: 'Chemistry',
    description: 'Complete the nomenclature worksheet on alkanes, alkenes, and alkynes.',
    dueDate: '2026-02-22',
    assignedDate: '2026-02-15',
    status: 'pending',
    maxScore: 25,
    attachments: 3,
    teacherName: 'Mr. Anil Desai',
    subjectColor: '#10b981',
  },
  {
    id: 'hw4',
    title: 'Essay: Modern Indian Poetry',
    subject: 'English',
    description: 'Write a 1000-word analytical essay on modern Indian poetry since 1950.',
    dueDate: '2026-02-15',
    assignedDate: '2026-02-08',
    status: 'graded',
    score: 36,
    maxScore: 40,
    feedback: 'Excellent analysis and structure. Could improve on citations.',
    attachments: 0,
    teacherName: 'Ms. Lakshmi Rao',
    subjectColor: '#f59e0b',
  },
  {
    id: 'hw5',
    title: 'Data Structures - Linked Lists',
    subject: 'Computer Science',
    description: 'Implement singly and doubly linked lists with insertion, deletion, and traversal operations.',
    dueDate: '2026-02-25',
    assignedDate: '2026-02-17',
    status: 'pending',
    maxScore: 60,
    attachments: 4,
    teacherName: 'Mr. Vikash Singh',
    subjectColor: '#6366f1',
  },
  {
    id: 'hw6',
    title: 'Cell Biology Diagrams',
    subject: 'Biology',
    description: 'Draw and label the structure of plant and animal cells, including all organelles.',
    dueDate: '2026-02-17',
    assignedDate: '2026-02-10',
    status: 'late',
    maxScore: 25,
    attachments: 0,
    teacherName: 'Dr. Meena Krishnan',
    subjectColor: '#ec4899',
  },
  {
    id: 'hw7',
    title: 'Trigonometric Identities',
    subject: 'Mathematics',
    description: 'Prove 15 trigonometric identities from the worksheet. Use proper mathematical notation.',
    dueDate: '2026-02-27',
    assignedDate: '2026-02-20',
    status: 'pending',
    maxScore: 45,
    attachments: 1,
    teacherName: 'Dr. Rajesh Gupta',
    subjectColor: '#8b5cf6',
  },
  {
    id: 'hw8',
    title: 'History Essay: Industrial Revolution',
    subject: 'History',
    description: 'Discuss the social and economic impact of the Industrial Revolution in Europe.',
    dueDate: '2026-02-28',
    assignedDate: '2026-02-21',
    status: 'pending',
    maxScore: 35,
    attachments: 2,
    teacherName: 'Mr. Amit Verma',
    subjectColor: '#ef4444',
  },
]

const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Biology', 'History']
const statusFilters = ['all', 'pending', 'submitted', 'graded', 'late'] as const

const statusConfig: Record<string, { label: string; icon: any; color: string; variant: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-500', variant: 'warning' },
  submitted: { label: 'Submitted', icon: Send, color: 'text-blue-500', variant: 'info' },
  graded: { label: 'Graded', icon: CheckCircle2, color: 'text-emerald-500', variant: 'success' },
  late: { label: 'Late', icon: AlertCircle, color: 'text-red-500', variant: 'destructive' },
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

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'manager'

  const filteredHomework = useMemo(() => {
    return mockHomework.filter((hw) => {
      const matchesStatus = activeStatus === 'all' || hw.status === activeStatus
      const matchesSubject = activeSubject === 'All' || hw.subject === activeSubject
      const matchesSearch =
        hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSubject && matchesSearch
    })
  }, [activeStatus, activeSubject, searchQuery])

  const stats = useMemo(() => {
    const total = mockHomework.length
    const completed = mockHomework.filter((h) => h.status === 'graded').length
    const pending = mockHomework.filter((h) => h.status === 'pending').length
    const late = mockHomework.filter((h) => h.status === 'late').length
    return { total, completed, pending, late }
  }, [])

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
            {subjects.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </motion.div>

      {/* Status Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((status) => {
          const config = status === 'all'
            ? { label: 'All', icon: Filter, color: '' }
            : statusConfig[status]
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

      {/* Homework List */}
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
                    {searchQuery
                      ? 'Try a different search term'
                      : 'All caught up! No pending homework in this category'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            filteredHomework.map((hw) => {
              const statusConf = statusConfig[hw.status]
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
    </motion.div>
  )
}
