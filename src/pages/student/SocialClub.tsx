import React, { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { EmojiPicker, EmojiPickerSearch, EmojiPickerContent } from '@/components/ui/emoji-picker'
import {
  Hash, Plus, Send, Trophy, Upload, Users, Star, Search,
  Award, Camera, Heart, MessageCircle, MoreVertical, Smile, X,
  ChevronDown, LogOut, Check, Clock, UserPlus, UserCheck, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Club {
  id: string
  name: string
  description: string
  avatar: string
  category: string
  members: string[]
  joinRequests: string[]
  lead: string
  leadName: string
  createdBy: string
  meetingDay: string
  meetingTime: string
  status: string
  posts: ClubPost[]
}

interface ClubPost {
  id: string
  authorId: string
  authorName: string
  avatar: string
  content: string
  timestamp: string
  likes: string[]
}

const POSTS_PER_PAGE = 10
const categories = ['Technology', 'Academic', 'Arts', 'Sports', 'Music', 'Culture', 'Community', 'Other']

export default function SocialClub() {
  const { user } = useAuthStore()
  const [clubs, setClubs] = useState<Club[]>([])
  const [pendingClubs, setPendingClubs] = useState<Club[]>([])
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '', category: 'Technology', meetingDay: '', meetingTime: '' })
  const [creating, setCreating] = useState(false)
  const [joinRequests, setJoinRequests] = useState<string[]>([])

  const isClubLead = selectedClub && user && (selectedClub.lead === user.id || selectedClub.createdBy === user.id)
  const isAdmin = user?.role === 'admin' || user?.role === 'manager'
  const isMember = selectedClub && user && selectedClub.members?.includes(user.id)
  const hasRequested = selectedClub && user && selectedClub.joinRequests?.includes(user.id)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [approved, pending] = await Promise.all([
        api.getClubs().catch(() => []),
        isAdmin ? api.getClubs({ pending: 'true' }).catch(() => []) : Promise.resolve([]),
      ])
      setClubs(Array.isArray(approved) ? approved : [])
      setPendingClubs(Array.isArray(pending) ? pending : [])
    } catch { } finally { setLoading(false) }
  }, [isAdmin])

  useEffect(() => { loadData() }, [loadData])

  const handleClubChange = (club: Club) => {
    setSelectedClub(club)
    setVisibleCount(POSTS_PER_PAGE)
  }

  const handleCreatePost = async () => {
    if (!newPost.trim() || !selectedClub || !user) return
    const localPost: ClubPost = {
      id: `local-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      avatar: user.avatar || '',
      content: newPost,
      timestamp: new Date().toISOString(),
      likes: [],
    }
    setSelectedClub(prev => prev ? { ...prev, posts: [...(prev.posts || []), localPost] } : null)
    setClubs(prev => prev.map(c => c.id === selectedClub.id ? { ...c, posts: [...(c.posts || []), localPost] } : c))
    setNewPost('')
    api.createClubPost(selectedClub.id, {
      authorId: user.id,
      authorName: user.name,
      avatar: user.avatar || '',
      content: newPost,
    }).catch(() => {})
  }

  const handleLike = async (postId: string) => {
    if (!selectedClub || !user) return
    try {
      await api.toggleClubPostLike(selectedClub.id, postId, user.id)
      setSelectedClub(prev => {
        if (!prev) return null
        const updatedPosts = (prev.posts || []).map(p => {
          if (p.id === postId) {
            const likes = p.likes || []
            return { ...p, likes: likes.includes(user.id) ? likes.filter(l => l !== user.id) : [...likes, user.id] }
          }
          return p
        })
        return { ...prev, posts: updatedPosts }
      })
    } catch { /* error */ }
  }

  const handleCreateClub = async () => {
    if (!createForm.name.trim() || !user) return
    setCreating(true)
    try {
      await api.createClub({
        name: createForm.name,
        description: createForm.description,
        category: createForm.category,
        meetingDay: createForm.meetingDay,
        meetingTime: createForm.meetingTime,
        lead: user.id,
        leadName: user.name,
        createdBy: user.id,
        members: [user.id],
        avatar: user.avatar || '',
      })
      setShowCreateDialog(false)
      setCreateForm({ name: '', description: '', category: 'Technology', meetingDay: '', meetingTime: '' })
      loadData()
    } catch { } finally { setCreating(false) }
  }

  const handleJoin = async () => {
    if (!selectedClub || !user) return
    try {
      const res = await api.joinClub(selectedClub.id, user.id)
      setSelectedClub(prev => prev ? { ...prev, joinRequests: res.joinRequests } : null)
    } catch { }
  }

  const handleLeave = async () => {
    if (!selectedClub || !user) return
    try {
      await api.leaveClub(selectedClub.id, user.id)
      setSelectedClub(prev => prev ? { ...prev, members: (prev.members || []).filter(id => id !== user.id) } : null)
      setClubs(prev => prev.map(c => c.id === selectedClub.id ? { ...c, members: (c.members || []).filter(id => id !== user.id) } : c))
    } catch { }
  }

  const handleApproveJoin = async (userId: string) => {
    if (!selectedClub) return
    try {
      const res = await api.approveJoinRequest(selectedClub.id, userId)
      setSelectedClub(prev => prev ? { ...prev, members: res.members, joinRequests: res.joinRequests } : null)
    } catch { }
  }

  const handleRejectJoin = async (userId: string) => {
    if (!selectedClub) return
    try {
      const res = await api.rejectJoinRequest(selectedClub.id, userId)
      setSelectedClub(prev => prev ? { ...prev, joinRequests: res.joinRequests } : null)
    } catch { }
  }

  const handleApproveClub = async (clubId: string) => {
    try {
      await api.approveClub(clubId)
      loadData()
    } catch { }
  }

  const handleRejectClub = async (clubId: string) => {
    try {
      await api.rejectClub(clubId)
      loadData()
    } catch { }
  }

  const filteredClubs = [...clubs, ...(isAdmin ? pendingClubs : [])].filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading clubs...</p></div>

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-4">
      {/* Club List */}
      <div className="w-full md:w-72 bg-card rounded-lg border border-border/50 flex flex-col">
        <div className="p-3 border-b border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Social Clubs</h2>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-3.5 h-3.5" /> Create
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-muted-foreground" />
            <Input className="pl-7 h-8 text-xs" placeholder="Search clubs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {filteredClubs.map(club => (
              <button key={club.id} onClick={() => handleClubChange(club)}
                className={cn("w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors",
                  selectedClub?.id === club.id ? "bg-primary/10 text-primary" : "hover:bg-accent/50"
                )}>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={club.avatar} />
                  <AvatarFallback className={cn("text-xs text-white", club.status === 'pending' ? 'bg-amber-500' : 'bg-gradient-to-br from-orange-500 to-amber-600')}>{(club.name || '??').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium truncate text-xs">{club.name}</p>
                    {club.status === 'pending' && <Clock className="w-3 h-3 text-amber-500 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{club.members?.length || 0} members</p>
                </div>
              </button>
            ))}
            {filteredClubs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No clubs found</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Club Content */}
      <div className="flex-1 bg-card rounded-lg border border-border/50 flex flex-col">
        {selectedClub ? (
          <>
            {/* Club Header */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedClub.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">{(selectedClub.name || '??').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold truncate">{selectedClub.name}</h2>
                    {selectedClub.status === 'pending' && <Badge variant="outline" className="text-[10px] h-5 border-amber-300 text-amber-600 bg-amber-50">Pending</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{selectedClub.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">{selectedClub.category}</Badge>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>Lead: {selectedClub.leadName}</span>
                  {selectedClub.meetingDay && <span>Meet: {selectedClub.meetingDay} {selectedClub.meetingTime}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {selectedClub.status === 'pending' && isAdmin && (
                    <>
                      <Button size="sm" variant="default" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700" onClick={() => handleApproveClub(selectedClub.id)}>
                        <Check className="w-3 h-3" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleRejectClub(selectedClub.id)}>
                        <X className="w-3 h-3" /> Reject
                      </Button>
                    </>
                  )}
                  {selectedClub.status !== 'pending' && user && (
                    isMember ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-500" onClick={handleLeave}>
                        <LogOut className="w-3 h-3" /> Leave
                      </Button>
                    ) : hasRequested ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-amber-600" disabled>
                        <Clock className="w-3 h-3" /> Requested
                      </Button>
                    ) : (
                      <Button size="sm" variant="default" className="h-7 text-xs gap-1 bg-orange-600 hover:bg-orange-700" onClick={handleJoin}>
                        <UserPlus className="w-3 h-3" /> Join
                      </Button>
                    )
                  )}
                </div>
              </div>
              {/* Join Requests (for club lead/admin) */}
              {isClubLead && selectedClub.joinRequests?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    Join Requests ({selectedClub.joinRequests.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedClub.joinRequests.map(reqId => (
                      <div key={reqId} className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                        <span className="text-[11px] text-muted-foreground">{reqId.slice(0, 8)}</span>
                        <button onClick={() => handleApproveJoin(reqId)} className="text-green-600 hover:text-green-700"><Check className="w-3 h-3" /></button>
                        <button onClick={() => handleRejectJoin(reqId)} className="text-red-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Posts */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {(selectedClub.posts || []).slice(0, visibleCount).map(post => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-orange-500 to-amber-600 text-white">{(post.authorName || '??').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{post.authorName}</span>
                        <span className="text-[10px] text-muted-foreground">{post.timestamp ? new Date(post.timestamp).toLocaleDateString() : ''}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Heart className={cn("w-3.5 h-3.5", (post.likes || []).includes(user?.id || '') && "fill-primary text-primary")} />
                          <span>{(post.likes || []).length}</span>
                        </button>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {(selectedClub.posts || []).length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No posts yet. Start the conversation!</p>
                  </div>
                )}
                {(selectedClub.posts || []).length > visibleCount && (
                  <div className="text-center pb-2">
                    <button onClick={() => setVisibleCount(prev => prev + POSTS_PER_PAGE)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/50 rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      Show more ({selectedClub.posts.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Post Input */}
            {isMember && (
              <div className="p-3 border-t border-border/50">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder={`Post to ${selectedClub.name}...`} className="min-h-[40px] max-h-[120px] resize-none text-sm" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreatePost() } }} />
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground">
                      <Smile className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-10 right-0 z-10">
                          <div className="relative">
                            <button onClick={() => setShowEmojiPicker(false)} className="absolute top-1 right-1 z-20"><X className="w-4 h-4" /></button>
                            <EmojiPicker className="h-[300px] w-[280px] rounded-lg border shadow-lg" onEmojiSelect={({ emoji }) => { setNewPost(prev => prev + emoji); setShowEmojiPicker(false) }}>
                              <EmojiPickerSearch />
                              <EmojiPickerContent />
                            </EmojiPicker>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <Button size="icon" onClick={handleCreatePost} disabled={!newPost.trim()} className="h-10 w-10 bg-orange-600 hover:bg-orange-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full flex-col gap-3">
            <Users className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Select a club to view</p>
          </div>
        )}
      </div>

      {/* Create Club Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-orange-500" />
              Create a New Club
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Club Name *</Label>
              <Input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Photography Club" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="What is your club about?" className="min-h-[60px] text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <select value={createForm.category} onChange={e => setCreateForm(f => ({ ...f, category: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Meeting Day</Label>
                <Input value={createForm.meetingDay} onChange={e => setCreateForm(f => ({ ...f, meetingDay: e.target.value }))} placeholder="e.g. Wednesday" className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Meeting Time</Label>
              <Input value={createForm.meetingTime} onChange={e => setCreateForm(f => ({ ...f, meetingTime: e.target.value }))} placeholder="e.g. 3:30 PM" className="h-9 text-sm" />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Your club will be reviewed by an admin before being published.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="h-9 text-sm">Cancel</Button>
            <Button onClick={handleCreateClub} disabled={!createForm.name.trim() || creating} className="h-9 text-sm bg-orange-600 hover:bg-orange-700 gap-1.5">
              {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
