import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Package, CheckCircle2, AlertCircle, Info, Filter, X } from 'lucide-react'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function SupplyAlerts() {
  const { user } = useAuthStore()
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const params: Record<string, string> = {}
        if (user?.class) params.class = user.class
        const data = await api.getSupplyAlerts(params)
        setAlerts(data)
      } catch {
        setAlerts([])
      }
      setIsLoading(false)
    }
    fetchAlerts()
  }, [user])

  const handleResolve = async (id: string) => {
    try {
      await api.updateSupplyAlert(id, { resolved: true })
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a))
    } catch {
      console.error('Failed to resolve alert')
    }
  }

  const getPriorityBadge = (priority: string) => {
    const p = priority.toLowerCase()
    if (p === 'high') return 'badge-error'
    if (p === 'medium') return 'badge-warning'
    return 'badge-blue'
  }

  const getPriorityIcon = (priority: string) => {
    const p = priority.toLowerCase()
    if (p === 'high') return <AlertCircle className="w-4 h-4 text-[var(--semantic-error)]" />
    if (p === 'medium') return <Info className="w-4 h-4 text-[var(--semantic-warning)]" />
    return <Info className="w-4 h-4 text-[var(--accent-blue)]" />
  }

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.priority?.toLowerCase() === filter)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]" />
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-[var(--accent-pink)]" />
            Supply Alerts
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Supplies needed for {user?.class || 'your'} class
          </p>
        </div>
        <div className="relative">
          <button className="btn-secondary flex items-center gap-2" onClick={() => setShowFilter(!showFilter)}>
            <Filter className="w-4 h-4" />
            Filter
          </button>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 nova-card p-2 min-w-[160px] z-10"
            >
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-surface)] transition-colors" onClick={() => { setFilter('all'); setShowFilter(false) }}>
                All
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-surface)] transition-colors" onClick={() => { setFilter('high'); setShowFilter(false) }}>
                High Priority
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-surface)] transition-colors" onClick={() => { setFilter('medium'); setShowFilter(false) }}>
                Medium Priority
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-surface)] transition-colors" onClick={() => { setFilter('low'); setShowFilter(false) }}>
                Low Priority
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {filteredAlerts.length === 0 ? (
        <motion.div variants={itemVariants}>
          <div className="nova-card p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-[var(--text-dim)] mb-4" />
            <p className="text-[var(--text-secondary)]">No supply alerts found</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">All supplies are accounted for</p>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="nova-card nova-card-stat p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(239,68,68,0.10)] flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-[var(--semantic-error)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">High Priority</p>
                  <p className="text-xl font-bold">{alerts.filter(a => a.priority?.toLowerCase() === 'high').length}</p>
                </div>
              </div>
            </div>
            <div className="nova-card nova-card-stat p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(245,158,11,0.10)] flex items-center justify-center">
                  <Info className="w-5 h-5 text-[var(--semantic-warning)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Medium Priority</p>
                  <p className="text-xl font-bold">{alerts.filter(a => a.priority?.toLowerCase() === 'medium').length}</p>
                </div>
              </div>
            </div>
            <div className="nova-card nova-card-stat p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.10)] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[var(--semantic-success)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Resolved</p>
                  <p className="text-xl font-bold">{alerts.filter(a => a.resolved).length}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            {filteredAlerts.map((alert, i) => (
              <motion.div
                key={alert.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`nova-card p-4 flex items-center gap-4 ${alert.resolved ? 'opacity-60' : ''}`}
              >
                <div className="flex-shrink-0">
                  {getPriorityIcon(alert.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{alert.item || alert.name || 'Supply Item'}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {alert.quantity && `${alert.quantity}x `}
                    {alert.class && `Class ${alert.class}`}
                    {alert.dueDate && ` • Due ${new Date(alert.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${getPriorityBadge(alert.priority)}`}>
                    {alert.priority || 'low'}
                  </span>
                  {alert.resolved ? (
                    <span className="badge badge-success flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Resolved
                    </span>
                  ) : (
                    <button className="btn-primary text-xs px-3 py-1" onClick={() => handleResolve(alert.id)}>
                      Resolve
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
