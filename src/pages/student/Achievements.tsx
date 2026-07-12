import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../lib/store'
import { api } from '../../lib/api'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import { Label } from '../../components/ui/Label'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar'
import { Skeleton } from '../../components/ui/Skeleton'
import { Award, Star, Trophy, Medal, Heart, MessageCircle, Send, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  authorId: string
  authorName: string
  role: string
  avatar: string
  title: string
  description: string
  targetStudentId: string
  targetStudentName: string
  category: string
  timestamp: string
  status?: string
  likes: string[]
  comments: { authorId: string; authorName: string; content: string; timestamp: string }[]
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function Achievements() {
  const { user } = useAuthStore()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'academic' | 'sports' | 'science' | 'arts' | 'technology' | 'attendance' | 'extracurricular'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createForm, setCreateForm] = useState({ title: '', description: '', targetStudentName: '', category: 'academic' })
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  useEffect(() => { loadAchievements() }, [])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      const data = await api.getAchievements()
      setAchievements(Array.isArray(data) ? data : [])
    } catch { /* error */ } finally { setLoading(false) }
  }

  const filtered = achievements.filter(a => {
    const matchesCategory = filter === 'all' || a.category === filter
    const isVisible = (a.status || 'approved') === 'approved' || a.authorId === user?.id
    return matchesCategory && isVisible
  })

  const handleLike = async (id: string) => {
    if (!user) return
    try {
      await api.toggleAchievementLike(id, user.id)
      setAchievements(prev => prev.map(a => {
        if (a.id === id) {
          const likes = a.likes || []
          return { ...a, likes: likes.includes(user.id) ? likes.filter(l => l !== user.id) : [...likes, user.id] }
        }
        return a
      }))
    } catch { /* error */ }
  }

  const handleComment = async (id: string) => {
    if (!user || !commentInputs[id]?.trim()) return
    try {
      await api.addAchievementComment(id, user.id, user.name, commentInputs[id])
      setAchievements(prev => prev.map(a => {
        if (a.id === id) {
          return { ...a, comments: [...(a.comments || []), { authorId: user.id, authorName: user.name, content: commentInputs[id], timestamp: new Date().toISOString() }] }
        }
        return a
      }))
      setCommentInputs(prev => ({ ...prev, [id]: '' }))
    } catch { /* error */ }
  }

  const handleCreate = async () => {
    if (!user || !createForm.title.trim() || !createForm.description.trim()) return
    try {
      await api.createAchievement({
        authorId: user.id,
        authorName: user.name,
        role: user.role,
        avatar: user.avatar || '',
        ...createForm,
        status: 'pending',
      })
      setCreateForm({ title: '', description: '', targetStudentName: '', category: 'academic' })
      setShowCreateDialog(false)
      loadAchievements()
    } catch { /* error */ }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'attendance': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'sports': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'science': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'technology': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'arts': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
      case 'extracurricular': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <Award className="w-4 h-4" />
      case 'sports': return <Trophy className="w-4 h-4" />
      case 'science': return <Star className="w-4 h-4" />
      case 'technology': return <Medal className="w-4 h-4" />
      default: return <Award className="w-4 h-4" />
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-muted-foreground text-sm mt-1">Celebrate milestones - anyone can post achievements!</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" /> Post Achievement
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        {['all', 'academic', 'sports', 'science', 'technology', 'arts', 'attendance', 'extracurricular'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === f ? "bg-orange-600 text-white" : "bg-accent hover:bg-accent/80 text-muted-foreground"
            )}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(achievement => (
            <motion.div key={achievement.id} variants={itemVariants}>
              <Card glow>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={achievement.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-xs">{achievement.authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{achievement.authorName}</span>
                        <Badge variant="secondary" className="text-[10px]">{achievement.role}</Badge>
                        {achievement.status && achievement.status !== 'approved' && (
                          <Badge className={cn(
                            'text-[10px]',
                            achievement.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          )}>{achievement.status}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">{new Date(achievement.timestamp).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                      {achievement.targetStudentName && (
                        <p className="text-xs text-orange-600 mt-1">🎉 {achievement.targetStudentName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getCategoryColor(achievement.category)}>{getCategoryIcon(achievement.category)} {achievement.category}</Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                        <button onClick={() => handleLike(achievement.id)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Heart className={cn("w-4 h-4", (achievement.likes || []).includes(user?.id || '') && "fill-primary text-primary")} />
                          <span>{(achievement.likes || []).length}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>{(achievement.comments || []).length}</span>
                        </button>
                      </div>

                      {/* Comments */}
                      {(achievement.comments || []).length > 0 && (
                        <div className="mt-3 space-y-2">
                          {achievement.comments.map((c, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <span className="font-medium text-xs">{c.authorName}</span>
                              <span className="text-muted-foreground text-xs">{c.content}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex gap-2 mt-3">
                        <Input className="h-8 text-xs" placeholder="Add a comment..." value={commentInputs[achievement.id] || ''} onChange={e => setCommentInputs(prev => ({ ...prev, [achievement.id]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') handleComment(achievement.id) }} />
                        <Button size="sm" className="h-8 px-2" onClick={() => handleComment(achievement.id)}><Send className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No achievements yet. Be the first to post one!</p>
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Post Achievement</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={createForm.title} onChange={e => setCreateForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Outstanding Performance in Math" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={createForm.description} onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the achievement..." />
            </div>
            <div className="space-y-2">
              <Label>Student Name (optional)</Label>
              <Input value={createForm.targetStudentName} onChange={e => setCreateForm(prev => ({ ...prev, targetStudentName: e.target.value }))} placeholder="Who is this for?" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={createForm.category} onChange={e => setCreateForm(prev => ({ ...prev, category: e.target.value }))}>
                <option value="academic">Academic</option>
                <option value="sports">Sports</option>
                <option value="science">Science</option>
                <option value="technology">Technology</option>
                <option value="arts">Arts</option>
                <option value="attendance">Attendance</option>
                <option value="extracurricular">Extracurricular</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!createForm.title || !createForm.description} className="bg-orange-600 hover:bg-orange-700">Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}