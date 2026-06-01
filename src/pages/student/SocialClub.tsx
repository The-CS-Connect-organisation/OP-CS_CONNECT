import React, { useState, useEffect } from 'react'
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
  Award, Camera, Heart, MessageCircle, MoreVertical, Smile, X
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
  lead: string
  leadName: string
  meetingDay: string
  meetingTime: string
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

export default function SocialClub() {
  const { user } = useAuthStore()
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const clubsData = await api.getClubs().catch(() => [])
      setClubs(Array.isArray(clubsData) ? clubsData : [])
      if (clubsData.length > 0) setSelectedClub(clubsData[0])
    } catch { /* error */ } finally { setLoading(false) }
  }

  const handleCreatePost = async () => {
    if (!newPost.trim() || !selectedClub || !user) return
    try {
      const post = await api.createClubPost(selectedClub.id, {
        authorId: user.id,
        authorName: user.name,
        avatar: user.avatar || '',
        content: newPost,
      })
      setSelectedClub(prev => prev ? { ...prev, posts: [...(prev.posts || []), post] } : null)
      setClubs(prev => prev.map(c => c.id === selectedClub.id ? { ...c, posts: [...(c.posts || []), post] } : c))
      setNewPost('')
    } catch { /* error */ }
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

  const filteredClubs = clubs.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading clubs...</p></div>

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-4">
      {/* Club List */}
      <div className="w-full md:w-64 bg-card rounded-lg border border-border/50 flex flex-col">
        <div className="p-3 border-b border-border/50">
          <h2 className="font-semibold text-sm mb-2">Social Clubs</h2>
          <div className="relative">
            <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-muted-foreground" />
            <Input className="pl-7 h-8 text-xs" placeholder="Search clubs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {filteredClubs.map(club => (
              <button key={club.id} onClick={() => setSelectedClub(club)}
                className={cn("w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors",
                  selectedClub?.id === club.id ? "bg-primary/10 text-primary" : "hover:bg-accent/50"
                )}>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={club.avatar} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-orange-500 to-amber-600 text-white">{club.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium truncate text-xs">{club.name}</p>
                  <p className="text-[10px] text-muted-foreground">{club.members?.length || 0} members</p>
                </div>
              </button>
            ))}
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
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">{selectedClub.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="font-semibold">{selectedClub.name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedClub.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{selectedClub.category}</Badge>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Meet: {selectedClub.meetingDay} {selectedClub.meetingTime}</p>
                  <p className="text-xs text-muted-foreground">Lead: {selectedClub.leadName}</p>
                </div>
              </div>
            </div>

            {/* Posts */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {(selectedClub.posts || []).map(post => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-orange-500 to-amber-600 text-white">{post.authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{post.authorName}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(post.timestamp).toLocaleDateString()}</span>
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
              </div>
            </ScrollArea>

            {/* Post Input */}
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
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a club to view</p>
          </div>
        )}
      </div>
    </div>
  )
}