import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Megaphone, Calendar, Clock, AlertCircle, Pin, PinOff, User,
  ChevronDown, ChevronUp, ArrowUpDown, Eye, ThumbsUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  priority: 'low' | 'medium' | 'high'
  author: string
  pinned: boolean
  approved: boolean
  approvedBy?: string
  audience?: string
}

type SortMode = 'date-desc' | 'date-asc' | 'priority'

export default function StudentAnnouncements() {
  const { user } = useAuthStore()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [sortMode, setSortMode] = useState<SortMode>('date-desc')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => { loadAnnouncements() }, [])

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const data = await api.getAnnouncements()
      setAnnouncements(Array.isArray(data) ? data.filter(a => !a.audience || a.audience === 'all' || a.audience === 'students') : [])
    } catch (err) { console.error('[StudentAnnouncements] Failed to load:', err); } finally { setLoading(false) }
  }

  const togglePin = async (id: string) => {
    try {
      const result = await api.pinAnnouncement(id)
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: result.pinned } : a))
    } catch (err) { console.error('[StudentAnnouncements] Failed to toggle pin:', err); }
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const getSortedAndFiltered = () => {
    let filtered = announcements
    if (filter !== 'all') filtered = filtered.filter(a => a.priority === filter)

    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      if (sortMode === 'priority') {
        const pOrder = { high: 0, medium: 1, low: 2 }
        return pOrder[a.priority] - pOrder[b.priority]
      }
      if (sortMode === 'date-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"><AlertCircle className="w-3 h-3 mr-1" />High</Badge>
      case 'medium': return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800">Medium</Badge>
      default: return <Badge className="bg-muted text-muted-foreground">Low</Badge>
    }
  }

  const sorted = getSortedAndFiltered()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground">{sorted.length} announcement{sorted.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            {(['all', 'high', 'medium', 'low'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 text-xs font-medium capitalize transition-colors", filter === f ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>{f}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setSortMode(prev => prev === 'date-desc' ? 'date-asc' : prev === 'date-asc' ? 'priority' : 'date-desc')}>
            <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
            {sortMode === 'date-desc' ? 'Newest' : sortMode === 'date-asc' ? 'Oldest' : 'Priority'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-2">
            <AnimatePresence>
              {sorted.map(ann => {
                const isExpanded = expandedIds.has(ann.id)
                return (
                  <motion.div key={ann.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Card
                      className={cn("cursor-pointer transition-all hover:shadow-md", ann.pinned && "border-orange-300 dark:border-orange-700 bg-orange-50/30 dark:bg-orange-950/10")}
                      onClick={() => { setSelectedAnn(ann); setShowDetail(true) }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", ann.pinned ? "bg-orange-100 dark:bg-orange-900/30" : "bg-muted")}>
                            {ann.pinned ? <Pin className="w-5 h-5 text-orange-500" /> : <Megaphone className="w-5 h-5 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-sm truncate">{ann.title}</h3>
                              {getPriorityBadge(ann.priority)}
                              <Badge variant="outline" className="bg-purple-100 text-purple-700 capitalize border-purple-200">To: {ann.audience || 'all'}</Badge>
                              {ann.pinned && <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800"><Pin className="w-3 h-3 mr-1" />Pinned</Badge>}
                            </div>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                  {ann.content}
                                </motion.p>
                              )}
                            </AnimatePresence>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><User className="w-3 h-3" />{ann.author || 'Admin'}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); toggleExpand(ann.id) }} className="p-1.5 hover:bg-accent rounded">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); togglePin(ann.id) }} className="p-1.5 hover:bg-accent rounded">
                              {ann.pinned ? <PinOff className="w-4 h-4 text-orange-500" /> : <Pin className="w-4 h-4 text-muted-foreground" />}
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}

      {sorted.length === 0 && !loading && (
        <div className="text-center py-12">
          <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No announcements</h3>
          <p className="text-muted-foreground">Check back later for updates</p>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          {selectedAnn && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", selectedAnn.pinned ? "bg-orange-100 dark:bg-orange-900/30" : "bg-muted")}>
                    {selectedAnn.pinned ? <Pin className="w-6 h-6 text-orange-500" /> : <Megaphone className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <DialogTitle className="text-xl">{selectedAnn.title}</DialogTitle>
                      {getPriorityBadge(selectedAnn.priority)}
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 capitalize border-purple-200">To: {selectedAnn.audience || 'all'}</Badge>
                      {selectedAnn.pinned && <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"><Pin className="w-3 h-3 mr-1" />Pinned</Badge>}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{selectedAnn.author || 'Admin'}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(selectedAnn.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedAnn.content}</p>
                </div>
                {selectedAnn.approved && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Approved by {selectedAnn.approvedBy === 'u7' ? 'Principal Meera' : selectedAnn.approvedBy === 'u12' ? 'Mr. Arjun Manager' : 'Admin'}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setShowDetail(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
