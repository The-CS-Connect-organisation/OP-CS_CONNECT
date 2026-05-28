import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../lib/store'
import { api } from '../../lib/api'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog'
import { Label } from '../../components/ui/Label'
import { Skeleton } from '../../components/ui/Skeleton'
import { Star, Award, Calendar, Plus, CheckCircle, XCircle, Clock, Upload, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Accolade {
  id: string
  studentId: string
  studentName: string
  title: string
  description: string
  category: string
  certificateUrl: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  approvedBy?: string
  approvedAt?: string
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function Accolades() {
  const { user } = useAuthStore()
  const [accolades, setAccolades] = useState<Accolade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [applyForm, setApplyForm] = useState({ title: '', description: '', category: 'academic', certificateUrl: '' })
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const canApprove = user?.role === 'teacher' || user?.role === 'manager' || user?.role === 'admin'

  useEffect(() => { loadAccolades() }, [])

  const loadAccolades = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getAccolades()
      setAccolades(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load accolades.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = accolades.filter(a => filter === 'all' || a.status === filter)

  const handleApply = async () => {
    if (!user || !applyForm.title.trim() || !applyForm.description.trim()) return
    try {
      await api.submitAccolade({
        studentId: user.id,
        studentName: user.name,
        ...applyForm
      })
      setApplyForm({ title: '', description: '', category: 'academic', certificateUrl: '' })
      setShowApplyDialog(false)
      loadAccolades()
    } catch {
      setError('Failed to submit accolade.')
    }
  }

  const handleApprove = async (id: string) => {
    if (!user) return
    try {
      await api.approveAccolade(id, user.id)
      loadAccolades()
    } catch {
      setError('Failed to approve accolade.')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await api.rejectAccolade(id, user?.id || '', 'Not approved')
      loadAccolades()
    } catch {
      setError('Failed to reject accolade.')
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />
      default: return null
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'destructive'
      case 'pending': return 'warning'
      default: return 'secondary'
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="w-6 h-6 text-primary" /> Accolades</h1>
          <p className="text-muted-foreground text-sm mt-1">Apply for recognitions - teachers approve</p>
        </div>
        {user?.role === 'student' && (
          <Button onClick={() => setShowApplyDialog(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" /> Apply for Accolade
          </Button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === f ? "bg-orange-600 text-white" : "bg-accent hover:bg-accent/80 text-muted-foreground"
            )}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="nova-card bg-red-500/10 p-4 text-red-500 text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(accolade => (
            <motion.div key={accolade.id} variants={itemVariants}>
              <Card glow>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center",
                      accolade.status === 'approved' ? "bg-emerald-500/10" : accolade.status === 'rejected' ? "bg-red-500/10" : "bg-amber-500/10"
                    )}>
                      {statusIcon(accolade.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{accolade.title}</h3>
                        <Badge variant={statusColor(accolade.status) as any}>{accolade.status}</Badge>
                        <Badge variant="secondary" className="text-xs">{accolade.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{accolade.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>By: {accolade.studentName}</span>
                        <span>{new Date(accolade.submittedAt).toLocaleDateString()}</span>
                        {accolade.certificateUrl && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Certificate</span>}
                      </div>
                      {canApprove && accolade.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" onClick={() => handleApprove(accolade.id)} className="bg-emerald-600 hover:bg-emerald-700 h-8">
                            <CheckCircle className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(accolade.id)} className="h-8">
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No accolades found</p>
            </div>
          )}
        </div>
      )}

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply for Accolade</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={applyForm.title} onChange={e => setApplyForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Math Olympiad Winner" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={applyForm.description} onChange={e => setApplyForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe your achievement..." />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={applyForm.category} onChange={e => setApplyForm(prev => ({ ...prev, category: e.target.value }))}>
                <option value="academic">Academic</option>
                <option value="science">Science</option>
                <option value="sports">Sports</option>
                <option value="technology">Technology</option>
                <option value="extracurricular">Extracurricular</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Certificate URL (optional)</Label>
              <div className="flex gap-2">
                <Input value={applyForm.certificateUrl} onChange={e => setApplyForm(prev => ({ ...prev, certificateUrl: e.target.value }))} placeholder="https://..." />
                <Button variant="outline" size="icon"><Upload className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={!applyForm.title || !applyForm.description} className="bg-orange-600 hover:bg-orange-700">Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}