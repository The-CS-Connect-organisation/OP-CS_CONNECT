import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Check, X, Clock, Users, Search, Loader2, RefreshCw, Camera } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { ScrollArea } from '@/components/ui/ScrollArea'
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
  createdBy: string
  status: string
  createdAt: string
  meetingDay: string
  meetingTime: string
}

export default function AdminClubs() {
  const [pendingClubs, setPendingClubs] = useState<Club[]>([])
  const [approvedClubs, setApprovedClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')
  const [editAvatarClub, setEditAvatarClub] = useState<Club | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [savingAvatar, setSavingAvatar] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [pending, approved] = await Promise.all([
        api.getClubs({ pending: 'true' }).catch(() => []),
        api.getClubs().catch(() => []),
      ])
      setPendingClubs(Array.isArray(pending) ? pending : [])
      setApprovedClubs(Array.isArray(approved) ? approved : [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleApprove = async (id: string) => {
    try {
      await api.approveClub(id)
      loadData()
    } catch { }
  }

  const handleReject = async (id: string) => {
    try {
      await api.rejectClub(id)
      loadData()
    } catch { }
  }

  const handleEditAvatar = async () => {
    if (!editAvatarClub || !avatarUrl.trim()) return
    setSavingAvatar(true)
    try {
      await api.updateClub(editAvatarClub.id, { avatar: avatarUrl.trim() })
      setEditAvatarClub(null)
      setAvatarUrl('')
      loadData()
    } catch { } finally { setSavingAvatar(false) }
  }

  const list = tab === 'pending' ? pendingClubs : approvedClubs
  const filtered = list.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Club Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage club requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex bg-muted/50 rounded-lg p-1">
          <button onClick={() => setTab('pending')} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", tab === 'pending' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            Pending ({pendingClubs.length})
          </button>
          <button onClick={() => setTab('approved')} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", tab === 'approved' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            Approved ({approvedClubs.length})
          </button>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input className="pl-8 h-9 text-sm" placeholder="Search clubs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No {tab} clubs found</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3">
            {filtered.map(club => (
              <div key={club.id} className="bg-card border border-border/50 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="relative group">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={club.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">{(club.name || '??').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <button onClick={() => { setEditAvatarClub(club); setAvatarUrl(club.avatar || '') }} className="absolute -bottom-1 -right-1 p-1 rounded-full bg-orange-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-orange-600">
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{club.name}</h3>
                      {club.status === 'pending' ? (
                        <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 bg-amber-50">Pending</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-green-300 text-green-600 bg-green-50">Approved</Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">{club.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{club.description || 'No description'}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Lead: {club.leadName}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {club.members?.length || 0} members</span>
                      {club.meetingDay && <span>{club.meetingDay} {club.meetingTime}</span>}
                      <span>Created: {club.createdAt ? new Date(club.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  {tab === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" className="h-8 text-xs gap-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(club.id)}>
                        <Check className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleReject(club.id)}>
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <Dialog open={!!editAvatarClub} onOpenChange={(o) => { if (!o) setEditAvatarClub(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-orange-500" />
              Edit Club Avatar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex justify-center">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-lg">{(editAvatarClub?.name || '??').slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Avatar Image URL</Label>
              <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.png" className="h-9 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAvatarClub(null)} className="h-9 text-sm">Cancel</Button>
            <Button onClick={handleEditAvatar} disabled={!avatarUrl.trim() || savingAvatar} className="h-9 text-sm bg-orange-600 hover:bg-orange-700 gap-1.5">
              {savingAvatar && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Avatar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
