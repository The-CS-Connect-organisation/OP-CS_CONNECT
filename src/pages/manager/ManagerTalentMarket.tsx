import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

import { Avatar, AvatarFallback } from '@/components/ui/Avatar'

import { cn } from '@/lib/utils'
import {
  Gavel, Plus, Users, Calendar, Search, Send, CheckCircle2, XCircle,
  Loader2, Eye, Trash2, UserCheck, UserX,
  Trophy, Music, Palette, Code, Theater, Camera, BookOpen, Music2
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function ManagerTalentMarket() {
  const { user } = useAuthStore()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedListing, setSelectedListing] = useState<any | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [customTalent, setCustomTalent] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventName: '',
    talentsNeeded: [] as string[],
    deadline: '',
  })
  const commonTalents = ['Singing', 'Dancing', 'Acting', 'Art', 'Coding', 'Photography', 'Writing', 'Sports', 'Music', 'Debate', 'Anchoring', 'Design']

  const addCustomTalent = () => {
    const t = customTalent.trim()
    if (t && !form.talentsNeeded.includes(t)) {
      setForm(prev => ({ ...prev, talentsNeeded: [...prev.talentsNeeded, t] }))
    }
    setCustomTalent('')
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const data = await api.getTalentMarketListings().catch(() => [])
      setListings(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[ManagerTalentMarket] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter(l =>
    l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.eventName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setForm({ title: '', description: '', eventName: '', talentsNeeded: [], deadline: '' })
  }

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) return
    setSaving(true)
    try {
      await api.createTalentMarketListing({
        title: form.title,
        description: form.description,
        eventName: form.eventName,
        talentsNeeded: form.talentsNeeded,
        deadline: form.deadline || null,
        createdBy: user?.id || '',
        createdByName: user?.name || '',
        status: 'open',
      })
      resetForm()
      setShowCreateModal(false)
      fetchListings()
    } catch (err: any) {
      alert(err.message || 'Failed to create listing')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseListing = async (id: string) => {
    try {
      await api.updateTalentMarketListing(id, { status: 'closed' })
      fetchListings()
    } catch (err) {
      console.error('Failed to close listing:', err)
    }
  }

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      await api.deleteTalentMarketListing(id)
      fetchListings()
    } catch (err) {
      console.error('Failed to delete listing:', err)
    }
  }

  const handleSubmissionAction = async (listingId: string, submissionId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.updateSubmissionStatus(listingId, submissionId, { status })
      // Notify the student
      const listing = listings.find(l => l.id === listingId)
      const submission = listing?.submissions?.find((s: any) => s.id === submissionId)
      if (submission) {
        await api.createInboxItem({
          userId: submission.studentId,
          title: `Application ${status}: ${listing?.title}`,
          message: status === 'accepted'
            ? `Congratulations! Your application for "${listing?.title}" has been accepted!`
            : `Your application for "${listing?.title}" was not selected this time. Keep trying!`,
          type: 'auction_update',
          relatedId: listingId,
        })
      }
      setSelectedListing(null)
      setShowDetail(false)
      fetchListings()
    } catch (err) {
      console.error('Failed to update submission:', err)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gavel className="w-6 h-6 text-orange-500" />
            Talent Market
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create talent calls, review submissions, and build teams for events
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreateModal(true) }} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-1" /> Create Talent Call
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search talent calls..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </motion.div>

      {/* List */}
      {filteredListings.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-16">
          <Gavel className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Talent Calls Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first talent call to find the best talent for your event!</p>
          <Button onClick={() => { resetForm(); setShowCreateModal(true) }} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-1" />                       Create Talent Call
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredListings.map(listing => (
            <motion.div key={listing.id} variants={itemVariants}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedListing(listing); setShowDetail(true) }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{listing.title}</h3>
                        <Badge className={cn(
                          'text-[10px]',
                          listing.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                        )}>
                          {listing.status}
                        </Badge>
                      </div>
                      {listing.eventName && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {listing.eventName}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{listing.description}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 text-xs text-muted-foreground flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {listing.submissions?.length || 0}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={e => { e.stopPropagation(); handleCloseListing(listing.id) }}
                          title="Close listing"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-red-500 hover:text-red-600"
                          onClick={e => { e.stopPropagation(); handleDeleteListing(listing.id) }}
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {listing.talentsNeeded?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {listing.talentsNeeded.map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Create Talent Call</h2>
                  <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-accent">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title *</label>
                    <Input
                      placeholder="e.g., Annual Day Talent Hunt"
                      value={form.title}
                      onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description *</label>
                    <Textarea
                      placeholder="Describe the event and what kind of talent you're looking for..."
                      value={form.description}
                      onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Event Name</label>
                    <Input
                      placeholder="e.g., Annual Sports Day 2026"
                      value={form.eventName}
                      onChange={e => setForm(prev => ({ ...prev, eventName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Application Deadline</label>
                    <Input
                      type="date"
                      value={form.deadline}
                      onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Talents Needed</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.talentsNeeded.map(t => (
                        <Badge key={t} className="bg-orange-100 text-orange-700 cursor-pointer" onClick={() => setForm(prev => ({ ...prev, talentsNeeded: prev.talentsNeeded.filter(x => x !== t) }))}>
                          {t} ×
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add custom talent..."
                        value={customTalent}
                        onChange={e => setCustomTalent(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTalent(); } }}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addCustomTalent} disabled={!customTalent.trim()}>
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {commonTalents.filter(t => !form.talentsNeeded.includes(t)).map(t => (
                        <button
                          key={t}
                          onClick={() => setForm(prev => ({ ...prev, talentsNeeded: [...prev.talentsNeeded, t] }))}
                          className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-accent/50 hover:bg-accent border border-border transition-colors"
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                    <Button
                      onClick={handleCreate}
                      disabled={saving || !form.title.trim() || !form.description.trim()}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                      Create Talent Call
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail View Modal */}
      <AnimatePresence>
        {showDetail && selectedListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">{selectedListing.title}</h2>
                    <p className="text-sm text-muted-foreground">{selectedListing.eventName}</p>
                  </div>
                  <button onClick={() => { setShowDetail(false); setSelectedListing(null) }} className="p-1 rounded-lg hover:bg-accent">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm mb-4">{selectedListing.description}</p>

                {selectedListing.talentsNeeded?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedListing.talentsNeeded.map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                )}

                <div className="text-xs text-muted-foreground mb-4 space-y-1">
                  <p>Created by: {selectedListing.createdByName}</p>
                  <p>Created: {new Date(selectedListing.createdAt).toLocaleDateString()}</p>
                  {selectedListing.deadline && <p>Deadline: {new Date(selectedListing.deadline).toLocaleDateString()}</p>}
                  <p>Status: <Badge className={cn('text-[10px]', selectedListing.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700')}>{selectedListing.status}</Badge></p>
                </div>

                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Submissions ({selectedListing.submissions?.length || 0})
                </h3>

                {(!selectedListing.submissions || selectedListing.submissions.length === 0) ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Send className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No submissions yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {selectedListing.submissions.map((sub: any) => (
                      <Card key={sub.id} className="border-l-4" style={{
                        borderLeftColor: sub.status === 'accepted' ? '#10b981' : sub.status === 'rejected' ? '#ef4444' : '#f59e0b'
                      }}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs bg-orange-100 text-orange-700">
                                    {sub.studentName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-semibold">{sub.studentName}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    Applied {new Date(sub.submittedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">{sub.message}</p>
                              {sub.talentTags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {sub.talentTags.map((t: string) => (
                                    <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                                  ))}
                                </div>
                              )}
                              {sub.portfolioUrl && (
                                <a href={sub.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-500 hover:underline flex items-center gap-1 mt-1">
                                  <Eye className="w-3 h-3" /> View Portfolio
                                </a>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 ml-3">
                              {sub.status === 'pending' && (
                                <>
                                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-xs h-7"
                                    onClick={() => handleSubmissionAction(selectedListing.id, sub.id, 'accepted')}>
                                    <UserCheck className="w-3 h-3 mr-1" /> Accept
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-500 text-xs h-7"
                                    onClick={() => handleSubmissionAction(selectedListing.id, sub.id, 'rejected')}>
                                    <UserX className="w-3 h-3 mr-1" /> Reject
                                  </Button>
                                </>
                              )}
                              {sub.status === 'accepted' && (
                                <Badge className="bg-emerald-100 text-emerald-700">Accepted ✓</Badge>
                              )}
                              {sub.status === 'rejected' && (
                                <Badge className="bg-red-100 text-red-700">Rejected ✗</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="outline" onClick={() => { setShowDetail(false); setSelectedListing(null) }}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
