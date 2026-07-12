import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { Award, CheckCircle2, XCircle, Trash2, Search, Loader2, Star, Trophy, Medal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  authorId: string
  authorName: string
  role: string
  avatar: string
  title: string
  description: string
  targetStudentName: string
  category: string
  timestamp: string
  status?: string
  likes: string[]
  comments: any[]
}

const categoryColors: Record<string, string> = {
  academic: 'bg-blue-100 text-blue-700',
  sports: 'bg-red-100 text-red-700',
  science: 'bg-purple-100 text-purple-700',
  technology: 'bg-orange-100 text-orange-700',
  arts: 'bg-pink-100 text-pink-700',
  attendance: 'bg-green-100 text-green-700',
  extracurricular: 'bg-amber-100 text-amber-700',
}

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await api.getAchievements()
      setAchievements(Array.isArray(data) ? data : [])
    } catch { /* error */ } finally { setLoading(false) }
  }

  const handleApprove = async (id: string) => {
    setProcessing(id)
    try {
      await api.updateAchievement(id, { status: 'approved' })
      setAchievements(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a))
    } catch { alert('Failed to approve') } finally { setProcessing(null) }
  }

  const handleReject = async (id: string) => {
    setProcessing(id)
    try {
      await api.updateAchievement(id, { status: 'rejected' })
      setAchievements(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a))
    } catch { alert('Failed to reject') } finally { setProcessing(null) }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setProcessing(id)
    try {
      await api.deleteAchievement(id)
      setAchievements(prev => prev.filter(a => a.id !== id))
    } catch { alert('Failed to delete') } finally { setProcessing(null) }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'academic': return <Award className="w-4 h-4" />
      case 'sports': return <Trophy className="w-4 h-4" />
      case 'science': return <Star className="w-4 h-4" />
      case 'technology': return <Medal className="w-4 h-4" />
      default: return <Award className="w-4 h-4" />
    }
  }

  const filtered = achievements.filter(a => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = a.title?.toLowerCase().includes(q) || a.authorName?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)
    const matchesStatus = filterStatus === 'all' || (a.status || 'approved') === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Manage Achievements</h1>
            <p className="text-sm text-muted-foreground">{achievements.length} total · {achievements.filter(a => (a.status || 'approved') !== 'approved').length} pending</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search achievements..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex gap-2">
          {['all', 'approved', 'pending', 'rejected'].map(s => (
            <Button key={s} variant={filterStatus === s ? 'default' : 'outline'} size="sm"
              onClick={() => setFilterStatus(s)}
              className={cn('capitalize', filterStatus === s && 'bg-orange-500 hover:bg-orange-600')}
            >{s}</Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center">
          <Award className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No achievements found</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((achievement, i) => (
            <motion.div key={achievement.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={cn(
                'border-l-4',
                (achievement.status || 'approved') === 'approved' ? 'border-l-emerald-500' :
                achievement.status === 'pending' ? 'border-l-amber-500' :
                'border-l-red-500'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarImage src={achievement.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-xs">
                        {achievement.authorName?.slice(0, 2).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm">{achievement.authorName}</span>
                        <Badge variant="secondary" className="text-[10px]">{achievement.role}</Badge>
                        <Badge className={cn('text-[10px] gap-1', categoryColors[achievement.category] || 'bg-gray-100 text-gray-700')}>
                          {getCategoryIcon(achievement.category)} {achievement.category}
                        </Badge>
                        <Badge className={cn(
                          (achievement.status || 'approved') === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          achievement.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        )}>{achievement.status || 'approved'}</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">{new Date(achievement.timestamp).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{achievement.description}</p>
                      {achievement.targetStudentName && (
                        <p className="text-xs text-orange-600 mt-1">🎉 {achievement.targetStudentName}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{(achievement.likes || []).length} likes</span>
                        <span>{(achievement.comments || []).length} comments</span>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                        {(achievement.status || 'approved') !== 'approved' && (
                          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-8"
                            onClick={() => handleApprove(achievement.id)}
                            disabled={processing === achievement.id}>
                            {processing === achievement.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                            Approve
                          </Button>
                        )}
                        {achievement.status !== 'rejected' && (
                          <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 h-8"
                            onClick={() => handleReject(achievement.id)}
                            disabled={processing === achievement.id}>
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 ml-auto"
                          onClick={() => handleDelete(achievement.id, achievement.title)}
                          disabled={processing === achievement.id}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
