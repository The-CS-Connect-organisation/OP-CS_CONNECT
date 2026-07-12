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
import { ScrollArea } from '@/components/ui/ScrollArea'
import { cn } from '@/lib/utils'
import {
  Gavel, Users, Calendar, Clock, Search, Send, CheckCircle2, XCircle,
  Loader2, Star,
  Trophy, Music, Palette, Code, Theater, Camera, BookOpen, Music2
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function TalentMarket() {
  const { user } = useAuthStore()
  const [listings, setListings] = useState<any[]>([])
  const [mySubmissions, setMySubmissions] = useState<any[]>([])
  const [selectedListing, setSelectedListing] = useState<any | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('open')
  const [submitForm, setSubmitForm] = useState({
    message: '',
    portfolioUrl: '',
    talentTags: [] as string[],
  })
  const [viewMode, setViewMode] = useState<'browse' | 'my'>('browse')

  useEffect(() => {
    fetchData()
  }, [viewMode]) // BUG-7 fix: re-fetch when switching between Browse and My Submissions

  const fetchData = async () => {
    setLoading(true)
    try {
      const [listingsData] = await Promise.all([
        api.getTalentMarketListings().catch(() => []),
      ])
      setListings(Array.isArray(listingsData) ? listingsData : [])
      
      if (user?.id) {
        const myData = await api.getMyTalentMarketSubmissions(user.id).catch(() => [])
        setMySubmissions(Array.isArray(myData) ? myData : [])
      }
    } catch (err) {
      console.error('[TalentMarket] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter(l => {
    const matchesSearch = l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || l.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleSubmit = async () => {
    if (!selectedListing || !user) return
    setSubmitting(true)
    try {
      await api.submitToTalentMarket(selectedListing.id, {
        studentId: user.id,
        studentName: user.name,
        portfolioUrl: submitForm.portfolioUrl,
        message: submitForm.message,
        talentTags: submitForm.talentTags,
      })
      await api.createInboxItem({
        userId: selectedListing.createdBy,
        title: 'New Talent Submission',
        message: `${user.name} has submitted their portfolio for "${selectedListing.title}"`,
        type: 'auction_update',
        relatedId: selectedListing.id, // BUG-4 fix: include listing ID for navigation/linking
      })
      setShowSubmitModal(false)
      setSubmitForm({ message: '', portfolioUrl: '', talentTags: [] })
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTalentTag = (tag: string) => {
    setSubmitForm(prev => ({
      ...prev,
      talentTags: prev.talentTags.includes(tag)
        ? prev.talentTags.filter(t => t !== tag)
        : [...prev.talentTags, tag],
    }))
  }

  const commonTalents = ['Singing', 'Dancing', 'Acting', 'Art', 'Coding', 'Photography', 'Writing', 'Sports']

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
            Discover talent opportunities and showcase your skills for upcoming events and projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'browse' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('browse')}
            className={viewMode === 'browse' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            <Search className="w-4 h-4 mr-1" /> Browse
          </Button>
          <Button
            variant={viewMode === 'my' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('my')}
            className={viewMode === 'my' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            <Star className="w-4 h-4 mr-1" /> My Submissions
          </Button>
        </div>
      </motion.div>

      {viewMode === 'browse' ? (
        <>
          {/* Search & Filter */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search talent calls by title, event, or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {['open', 'all'].map(s => (
                <Button
                  key={s}
                  variant={filterStatus === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(s)}
                  className={filterStatus === s ? 'bg-orange-500 hover:bg-orange-600 capitalize' : 'capitalize'}
                >
                  {s === 'all' ? 'All' : 'Open'}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-16">
              <Gavel className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Open Talent Calls</h3>
              <p className="text-sm text-muted-foreground">No talent calls are open right now. Check back later!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredListings.map((listing, idx) => {
                const alreadyApplied = listing.submissions?.some((s: any) => s.studentId === user?.id)
                return (
                  <motion.div key={listing.id} variants={itemVariants}>
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                            {listing.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {listing.submissions?.length || 0} applicants
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-base mb-1 group-hover:text-orange-500 transition-colors">
                          {listing.title}
                        </h3>
                        {listing.eventName && (
                          <p className="text-xs text-muted-foreground mb-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {listing.eventName}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {listing.description}
                        </p>

                        {/* Talent Tags */}
                        {listing.talentsNeeded?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {listing.talentsNeeded.map((t: string) => (
                              <Badge key={t} variant="secondary" className="text-[10px] gap-1">
                                {talentIcons[t] || <Star className="w-3 h-3" />}
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Created by {listing.createdByName || 'Organizer'}
                          </span>
                          {listing.deadline && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(listing.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <Button
                          className="w-full group-hover:bg-orange-500 group-hover:text-white transition-all"
                          variant={alreadyApplied ? "secondary" : "outline"}
                          disabled={alreadyApplied}
                          onClick={() => {
                            setSelectedListing(listing)
                            setShowSubmitModal(true)
                          }}
                        >
                          {alreadyApplied ? (
                            <><CheckCircle2 className="w-4 h-4 mr-1" /> Applied</>
                          ) : (
                            <><Send className="w-4 h-4 mr-1" /> Submit Portfolio</>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        /* My Submissions View */
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-lg font-semibold">My Submissions</h2>
          {mySubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Send className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">You haven't applied to any talent calls yet</p>
              </CardContent>
            </Card>
          ) : (
            mySubmissions.map((item: any) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.eventName}</p>
                    </div>
                    <Badge className={cn(
                      item.mySubmission?.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      item.mySubmission?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    )}>
                      {item.mySubmission?.status || 'pending'}
                    </Badge>
                  </div>
                  {item.mySubmission?.feedback && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Feedback: {item.mySubmission.feedback}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Submit Portfolio</h2>
                <button onClick={() => setShowSubmitModal(false)} className="p-1 rounded-lg hover:bg-accent">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 rounded-lg bg-accent/30">
                <h3 className="font-semibold text-sm">{selectedListing.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{selectedListing.eventName}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedListing.talentsNeeded?.map((t: string) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Tell us about yourself *</label>
                  <Textarea
                    placeholder="Describe your relevant experience, skills, and why you'd be a great fit..."
                    value={submitForm.message}
                    onChange={e => setSubmitForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Portfolio URL (optional)</label>
                  <Input
                    placeholder="Link to your portfolio, GitHub, or showcase"
                    value={submitForm.portfolioUrl}
                    onChange={e => setSubmitForm(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Talents</label>
                  <div className="flex flex-wrap gap-2">
                    {commonTalents.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTalentTag(tag)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                          submitForm.talentTags.includes(tag)
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-accent/50 hover:bg-accent border-border"
                        )}
                      >
                        {talentIcons[tag]}{' '}
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !submitForm.message.trim()}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                    Submit Application
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
