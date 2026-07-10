import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import {
  Gavel, Users, Calendar, Clock, Search, Send, CheckCircle2, XCircle,
  Loader2, Star, Plus, Trash2, X, Music2, Music, Theater, Palette, Code,
  Camera, BookOpen, Trophy, Eye, MessageSquare, Filter
} from 'lucide-react'

const talentIcons: Record<string, React.ReactNode> = {
  'Singing': <Music2 className="w-4 h-4" />,
  'Dancing': <Music className="w-4 h-4" />,
  'Acting': <Theater className="w-4 h-4" />,
  'Art': <Palette className="w-4 h-4" />,
  'Coding': <Code className="w-4 h-4" />,
  'Photography': <Camera className="w-4 h-4" />,
  'Writing': <BookOpen className="w-4 h-4" />,
  'Sports': <Trophy className="w-4 h-4" />,
}

const commonTalents = ['Singing', 'Dancing', 'Acting', 'Art', 'Coding', 'Photography', 'Writing', 'Sports']

export default function AdminTalentMarket() {
  const { user } = useAuthStore()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedListing, setSelectedListing] = useState<any | null>(null)
  const [showSubmissions, setShowSubmissions] = useState(false)
  const [processingSubmission, setProcessingSubmission] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '', eventName: '', description: '', deadline: '', talentsNeeded: [] as string[], status: 'open',
  })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await api.getTalentMarketListings().catch(() => [])
      setListings(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[AdminTalentMarket] Error:', err)
    } finally { setLoading(false) }
  }

  const filteredListings = listings.filter(l => {
    const q = searchQuery.toLowerCase()
    return (l.title?.toLowerCase().includes(q) || l.eventName?.toLowerCase().includes(q)) &&
      (filterStatus === 'all' || l.status === filterStatus)
  })

  const handleCreate = async () => {
    if (!form.title.trim()) return
    try {
      await api.createTalentMarketListing({ ...form, createdBy: user?.id, createdByName: user?.name })
      setShowCreate(false)
      setForm({ title: '', eventName: '', description: '', deadline: '', talentsNeeded: [], status: 'open' })
      fetchData()
    } catch (err: any) { alert(err.message || 'Failed to create') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this talent call?')) return
    try {
      await api.deleteTalentMarketListing(id)
      fetchData()
    } catch (err: any) { alert(err.message || 'Failed to delete') }
  }

  const handleSubmissionStatus = async (listingId: string, submissionId: string, status: 'accepted' | 'rejected', feedback?: string) => {
    setProcessingSubmission(submissionId)
    try {
      await api.updateSubmissionStatus(listingId, submissionId, { status, feedback: feedback || '' })
      fetchData()
    } catch (err: any) { alert(err.message || 'Failed to update') }
    finally { setProcessingSubmission(null) }
  }

  const toggleTalent = (tag: string) => {
    setForm(prev => ({
      ...prev,
      talentsNeeded: prev.talentsNeeded.includes(tag)
        ? prev.talentsNeeded.filter(t => t !== tag)
        : [...prev.talentsNeeded, tag],
    }))
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
            <Gavel className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Talent Market</h1>
            <p className="text-sm text-muted-foreground">Manage talent calls and review submissions</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-1" /> New Call
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search talent calls..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'closed'].map(s => (
            <Button key={s} variant={filterStatus === s ? 'default' : 'outline'} size="sm"
              onClick={() => setFilterStatus(s)}
              className={cn('capitalize', filterStatus === s && 'bg-orange-500 hover:bg-orange-600')}
            >{s}</Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : filteredListings.length === 0 ? (
        <Card><CardContent className="p-12 text-center">
          <Gavel className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No talent calls yet. Create one to get started.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredListings.map(listing => (
            <Card key={listing.id} className="group hover:shadow-lg transition-all">
              <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={cn(listing.status === 'open' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-muted text-muted-foreground')}>
                    {listing.status}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">{listing.submissions?.length || 0} submissions</Badge>
                </div>
                <h3 className="font-semibold text-base mb-1">{listing.title}</h3>
                {listing.eventName && <p className="text-xs text-muted-foreground mb-2"><Calendar className="w-3 h-3 inline mr-1" />{listing.eventName}</p>}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{listing.description}</p>
                {listing.talentsNeeded?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {listing.talentsNeeded.map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-[10px] gap-1">
                        {talentIcons[t] || <Star className="w-3 h-3" />}{t}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  {listing.deadline && <span><Clock className="w-3 h-3 inline mr-1" />Due {new Date(listing.deadline).toLocaleDateString()}</span>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedListing(listing); setShowSubmissions(true) }}>
                    <Eye className="w-4 h-4 mr-1" /> Submissions
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(listing.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">New Talent Call</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-accent"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title *</label>
                  <Input placeholder="e.g. School Play Auditions" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Event Name</label>
                  <Input placeholder="e.g. Annual Day 2026" value={form.eventName} onChange={e => setForm(p => ({ ...p, eventName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea placeholder="Describe what you're looking for..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Deadline</label>
                  <Input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Talents Needed</label>
                  <div className="flex flex-wrap gap-2">
                    {commonTalents.map(tag => (
                      <button key={tag} onClick={() => toggleTalent(tag)}
                        className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                          form.talentsNeeded.includes(tag) ? "bg-orange-500 text-white border-orange-500" : "bg-accent/50 hover:bg-accent border-border"
                        )}>
                        {talentIcons[tag]} {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={!form.title.trim()} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-1" /> Create Call
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showSubmissions && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold">{selectedListing.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedListing.submissions?.length || 0} submissions</p>
                </div>
                <button onClick={() => setShowSubmissions(false)} className="p-1 rounded-lg hover:bg-accent"><X className="w-5 h-5" /></button>
              </div>

              {(!selectedListing.submissions || selectedListing.submissions.length === 0) ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">No submissions yet</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {selectedListing.submissions.map((sub: any) => (
                    <Card key={sub.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-orange-100 text-orange-700">
                                {sub.studentName?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{sub.studentName || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{sub.talentTags?.join(', ') || ''}</p>
                            </div>
                          </div>
                          <Badge className={cn(
                            sub.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                            sub.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          )}>{sub.status || 'pending'}</Badge>
                        </div>
                        {sub.message && <p className="text-sm text-muted-foreground mb-2">{sub.message}</p>}
                        {sub.portfolioUrl && (
                          <a href={sub.portfolioUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-orange-500 hover:underline inline-flex items-center gap-1 mb-3">
                            <Eye className="w-3 h-3" /> View Portfolio
                          </a>
                        )}
                        {sub.status === 'pending' && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600"
                              onClick={() => handleSubmissionStatus(selectedListing.id, sub.id, 'accepted')}
                              disabled={processingSubmission === sub.id}>
                              {processingSubmission === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50"
                              onClick={() => handleSubmissionStatus(selectedListing.id, sub.id, 'rejected')}
                              disabled={processingSubmission === sub.id}>
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
