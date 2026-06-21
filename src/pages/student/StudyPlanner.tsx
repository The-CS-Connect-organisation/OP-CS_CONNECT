import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Brain, Plus, Trash2, Calendar, Clock, CheckCircle, AlertCircle, Sparkles,
  Target, BookOpen, Loader2, ChevronRight, ChevronDown, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StudyPlan {
  id: string
  title: string
  subject: string
  startDate: string
  endDate: string
  tasks: { title: string; completed: boolean }[]
  createdAt: string
}

interface StudyTask {
  id: string
  title: string
  subject: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  estimatedHours: number
  notes: string
}

export default function StudyPlanner() {
  const { user } = useAuthStore()
  const [plans, setPlans] = useState<StudyPlan[]>([])
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set())
  const [planForm, setPlanForm] = useState({ subject: 'Math', topics: '', level: 'intermediate' })
  const [taskForm, setTaskForm] = useState({ title: '', subject: 'Math', dueDate: '', priority: 'medium' as 'low' | 'medium' | 'high', estimatedHours: 1, notes: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [plansData] = await Promise.all([
        api.getStudyPlans(user?.id || '').catch(() => [])
      ])
      setPlans(Array.isArray(plansData) ? plansData : [])
    } catch { /* error */ } finally { setLoading(false) }
  }

  const generateAIPlan = async () => {
    if (!planForm.subject.trim()) return
    setGenerating(true)
    try {
      const topics = planForm.topics.split(',').map(t => t.trim()).filter(Boolean)
      const result = await api.getStudyPlan(planForm.subject, topics.length ? topics : ['all topics'], planForm.level)
      const newPlan: StudyPlan = {
        id: `sp${Date.now()}`,
        title: `${planForm.subject} Study Plan`,
        subject: planForm.subject,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tasks: [
          { title: `Review ${planForm.subject} fundamentals`, completed: false },
          { title: `Complete practice problems - Chapter 1`, completed: false },
          { title: `Complete practice problems - Chapter 2`, completed: false },
          { title: `Take mock test`, completed: false },
          { title: `Review mistakes and revise`, completed: false },
        ],
        createdAt: new Date().toISOString()
      }
      await api.createStudyPlan(user?.id || '', newPlan)
      setPlans(prev => [...prev, newPlan])
      setShowCreatePlan(false)
      setPlanForm({ subject: 'Math', topics: '', level: 'intermediate' })
    } catch { /* error */ } finally { setGenerating(false) }
  }

  const toggleTask = async (planId: string, taskIndex: number) => {
    try {
      const plan = plans.find(p => p.id === planId)
      if (!plan) return
      const task = plan.tasks[taskIndex]
      await api.updateStudyPlanTask(planId, user?.id || '', taskIndex, !task.completed)
      setPlans(prev => prev.map(p => {
        if (p.id !== planId) return p
        const newTasks = [...p.tasks]
        newTasks[taskIndex] = { ...newTasks[taskIndex], completed: !newTasks[taskIndex].completed }
        return { ...p, tasks: newTasks }
      }))
    } catch { /* error */ }
  }

  const addManualTask = async () => {
    if (!taskForm.title.trim()) return
    setTasks(prev => [...prev, { id: `t${Date.now()}`, ...taskForm, completed: false }])
    setTaskForm({ title: '', subject: 'Math', dueDate: '', priority: 'medium', estimatedHours: 1, notes: '' })
    setShowAddTask(false)
  }

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id))

  const togglePlan = (id: string) => {
    setExpandedPlans(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)
  const totalHours = pendingTasks.reduce((sum, t) => sum + t.estimatedHours, 0)
  const totalPlanTasks = plans.reduce((sum, p) => sum + p.tasks.length, 0)
  const completedPlanTasks = plans.reduce((sum, p) => sum + p.tasks.filter(t => t.completed).length, 0)

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="w-6 h-6 text-orange-500" />Study Planner</h1>
          <p className="text-sm text-muted-foreground">AI-powered study plans and task tracking</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreatePlan(true)}><Sparkles className="w-4 h-4 mr-1" />Generate AI Plan</Button>
          <Button variant="outline" onClick={() => setShowAddTask(true)}><Plus className="w-4 h-4 mr-1" />Add Task</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{totalHours}h</p><p className="text-xs text-muted-foreground">Hours Remaining</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><AlertCircle className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{pendingTasks.length}</p><p className="text-xs text-muted-foreground">Pending Tasks</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{completedTasks.length}</p><p className="text-xs text-muted-foreground">Completed</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Target className="w-8 h-8 text-blue-500" /><div><p className="text-2xl font-bold">{plans.length}</p><p className="text-xs text-muted-foreground">Study Plans</p></div></div></CardContent></Card>
      </div>

      {/* AI Study Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-orange-500" />AI Study Plans</h2>
        {plans.length === 0 ? (
          <Card><CardContent className="py-8 text-center"><Brain className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No study plans yet. Generate one with AI!</p></CardContent></Card>
        ) : (
          <div className="space-y-2">
            {plans.map(plan => {
              const isExpanded = expandedPlans.has(plan.id)
              const completedCount = plan.tasks.filter(t => t.completed).length
              const progress = plan.tasks.length > 0 ? Math.round((completedCount / plan.tasks.length) * 100) : 0
              return (
                <motion.div key={plan.id} layout>
                  <Card className={cn("transition-all", progress === 100 && "border-green-200 dark:border-green-800")}>
                    <CardContent className="p-4">
                      <button onClick={() => togglePlan(plan.id)} className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><BookOpen className="w-5 h-5 text-orange-500" /></div>
                          <div className="text-left">
                            <h3 className="font-semibold">{plan.title}</h3>
                            <p className="text-xs text-muted-foreground">{completedCount}/{plan.tasks.length} tasks completed</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs font-medium w-8">{progress}%</span>
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 space-y-1">
                            {plan.tasks.map((task, i) => (
                              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                                <button onClick={() => toggleTask(plan.id, i)} className={cn("w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0", task.completed ? "bg-green-500 border-green-500" : "border-muted-foreground/30")}>
                                  {task.completed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                </button>
                                <span className={cn("text-sm", task.completed && "line-through text-muted-foreground")}>{task.title}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Manual Tasks */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-orange-500" />Quick Tasks</h2>
        {tasks.length === 0 ? (
          <Card><CardContent className="py-8 text-center"><Zap className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No tasks added yet</p></CardContent></Card>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <Card key={task.id} className={cn("transition-all", task.completed && "opacity-60")}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))} className={cn("w-5 h-5 rounded border-2 flex items-center justify-center", task.completed ? "bg-green-500 border-green-500" : "border-muted-foreground/30")}>
                      {task.completed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <div>
                      <p className={cn("text-sm font-medium", task.completed && "line-through")}>{task.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px]">{task.subject}</Badge>
                        {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
                        <span>{task.estimatedHours}h</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Generate AI Plan Dialog */}
      <Dialog open={showCreatePlan} onOpenChange={setShowCreatePlan}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate AI Study Plan</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Subject</Label>
              <select value={planForm.subject} onChange={e => setPlanForm({ ...planForm, subject: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="Math">Mathematics</option><option value="Physics">Physics</option><option value="Chemistry">Chemistry</option><option value="English">English</option><option value="Biology">Biology</option><option value="CS">Computer Science</option>
              </select>
            </div>
            <div><Label>Specific Topics (comma separated)</Label><Input value={planForm.topics} onChange={e => setPlanForm({ ...planForm, topics: e.target.value })} placeholder="e.g., Algebra, Calculus, Geometry" /></div>
            <div><Label>Level</Label>
              <select value={planForm.level} onChange={e => setPlanForm({ ...planForm, level: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePlan(false)}>Cancel</Button>
            <Button onClick={generateAIPlan} disabled={generating}>
              {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Plan</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Study Task</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Title</Label><Input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Subject</Label>
                <select value={taskForm.subject} onChange={e => setTaskForm({ ...taskForm, subject: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="Math">Math</option><option value="Physics">Physics</option><option value="Chemistry">Chemistry</option><option value="English">English</option><option value="Biology">Biology</option><option value="CS">CS</option>
                </select>
              </div>
              <div><Label>Due Date</Label><Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Priority</Label>
                <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as any })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <div><Label>Hours</Label><Input type="number" value={taskForm.estimatedHours} onChange={e => setTaskForm({ ...taskForm, estimatedHours: parseInt(e.target.value) || 1 })} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={taskForm.notes} onChange={e => setTaskForm({ ...taskForm, notes: e.target.value })} placeholder="Additional notes" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddTask(false)}>Cancel</Button><Button onClick={addManualTask}>Add Task</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}