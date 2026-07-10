import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { BookOpen, Plus, AlertTriangle, Calendar, Weight, X } from 'lucide-react'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function BookHeavyAlerts() {
  const { user } = useAuthStore()
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ bookName: '', weight: 'heavy', className: '', date: '' })

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await api.getBookAlerts(user?.class || '')
        setAlerts(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('[BookHeavyAlerts] Failed to load:', err);
      }
      setIsLoading(false)
    }
    fetchAlerts()
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newAlert = await api.createBookAlert(formData)
      setAlerts(prev => [newAlert, ...prev])
      setFormData({ bookName: '', weight: 'heavy', className: '', date: '' })
      setShowForm(false)
    } catch {
      console.error('Failed to create alert')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-pink-500" />
            Book Heavy Alerts
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track heavy book days for your child</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          New Alert
        </button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Create Book Alert</h2>
            <button className="hover:bg-accent rounded-lg p-1 transition-colors" onClick={() => setShowForm(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Book Name</label>
              <input
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                placeholder="e.g. Physics Textbook"
                value={formData.bookName}
                onChange={e => setFormData(prev => ({ ...prev, bookName: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Weight</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  value={formData.weight}
                  onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                >
                  <option value="heavy">Heavy</option>
                  <option value="medium">Medium</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Class</label>
                <input
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  placeholder="e.g. 10-A"
                  value={formData.className}
                  onChange={e => setFormData(prev => ({ ...prev, className: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Date</label>
              <input
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                type="date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors flex-1" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors flex-1">Create Alert</button>
            </div>
          </form>
        </motion.div>
      )}

      {alerts.length === 0 ? (
        <motion.div variants={itemVariants}>
          <div className="bg-card border rounded-xl shadow-sm p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/60 mb-4" />
            <p className="text-muted-foreground">No book alerts found</p>
            <p className="text-muted-foreground text-sm mt-1">Create an alert when heavy books are scheduled</p>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-3">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border rounded-xl shadow-sm p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Weight className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{alert.bookName || alert.book}</p>
                <p className="text-xs text-muted-foreground">Class {alert.className || alert.class}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                  {alert.weight}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {alert.date ? new Date(alert.date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
