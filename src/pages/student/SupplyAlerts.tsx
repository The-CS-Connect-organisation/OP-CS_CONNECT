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
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const params: Record<string, string> = {}
        if (user?.class) params.class = user.class
        const data = await api.getSupplyAlerts(params)
        setAlerts(Array.isArray(data) ? data : [])
      } catch (err: any) {
        setError('Failed to fetch supply alerts. Please try again later.')
        setAlerts([])
      }
      setIsLoading(false)
    }
    fetchAlerts()
  }, [user?.id])

  const handleResolve = async (id: string) => {
    try {
      await api.updateSupplyAlert(id, { resolved: true })
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a))
    } catch (err) {
      setError('Failed to resolve alert. Please try again.')
      console.error('Failed to resolve alert', err)
    }
  }

  const getPriorityIcon = (priority: string) => {
    const p = priority.toLowerCase()
    if (p === 'high') return <AlertCircle className="w-4 h-4 text-red-500" />
    if (p === 'medium') return <Info className="w-4 h-4 text-amber-500" />
    return <Info className="w-4 h-4 text-blue-500" />
  }

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.priority?.toLowerCase() === filter)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-pink-500" />
            Supply Alerts
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Supplies needed for {user?.class || 'your'} class
          </p>
        </div>
        <div className="relative">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors" onClick={() => setShowFilter(!showFilter)}>
            <Filter className="w-4 h-4" />
            Filter
          </button>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 bg-card border rounded-xl shadow-sm p-2 min-w-[160px] z-10"
            >
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-card transition-colors" onClick={() => { setFilter('all'); setShowFilter(false) }}>
                All
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-card transition-colors" onClick={() => { setFilter('high'); setShowFilter(false) }}>
                High Priority
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-card transition-colors" onClick={() => { setFilter('medium'); setShowFilter(false) }}>
                Medium Priority
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-card transition-colors" onClick={() => { setFilter('low'); setShowFilter(false) }}>
                Low Priority
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {filteredAlerts.length === 0 ? (
        <motion.div variants={itemVariants}>
          <div className="bg-card border rounded-xl shadow-sm p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/60 mb-4" />
            <p className="text-muted-foreground">No supply alerts found</p>
            <p className="text-muted-foreground text-sm mt-1">All supplies are accounted for</p>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">High Priority</p>
                  <p className="text-xl font-bold">{alerts.filter(a => a.priority?.toLowerCase() === 'high').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-card border rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Medium Priority</p>
                  <p className="text-xl font-bold">{alerts.filter(a => a.priority?.toLowerCase() === 'medium').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-card border rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resolved</p>
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
                className={`bg-card border rounded-xl shadow-sm p-4 flex items-center gap-4 ${alert.resolved ? 'opacity-60' : ''}`}
              >
                <div className="flex-shrink-0">
                  {getPriorityIcon(alert.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{alert.item || alert.name || 'Supply Item'}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.quantity && `${alert.quantity}x `}
                    {alert.class && `Class ${alert.class}`}
                    {alert.dueDate && ` • Due ${new Date(alert.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                    {alert.priority || 'low'}
                  </span>
                  {alert.resolved ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Resolved
                    </span>
                  ) : (
                    <button className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-3 py-1 text-xs font-medium text-white hover:bg-orange-600 transition-colors" onClick={() => handleResolve(alert.id)}>
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