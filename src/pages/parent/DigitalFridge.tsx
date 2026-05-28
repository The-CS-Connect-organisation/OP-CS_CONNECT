import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Refrigerator, CheckCircle2, Circle, XCircle, UtensilsCrossed } from 'lucide-react'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function DigitalFridge() {
  const { user } = useAuthStore()
  const [fridgeData, setFridgeData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFridge = async () => {
      if (!user?.children?.length) {
        setIsLoading(false)
        return
      }
      try {
        const results = await Promise.all(
          user.children.map((child: any) => api.getDigitalFridge(child.id))
        )
        const flattened = results.flat()
        setFridgeData(flattened)
      } catch {
        setFridgeData([])
      }
      setIsLoading(false)
    }
    fetchFridge()
  }, [user?.id])

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'consumed') return <CheckCircle2 className="w-4 h-4 text-green-500" />
    if (s === 'full') return <Circle className="w-4 h-4 text-blue-500" />
    return <XCircle className="w-4 h-4 text-red-500" />
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
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Refrigerator className="w-6 h-6 text-pink-500" />
          Digital Fridge
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor your child's lunch and fridge status</p>
      </motion.div>

      {fridgeData.length === 0 ? (
        <motion.div variants={itemVariants}>
          <div className="bg-card border rounded-xl shadow-sm p-12 text-center">
            <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground/60 mb-4" />
            <p className="text-muted-foreground">No fridge items found</p>
            <p className="text-muted-foreground text-sm mt-1">Items will appear when your child's lunch is tracked</p>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Consumed</p>
                  <p className="text-xl font-bold">{fridgeData.filter((f: any) => f.status?.toLowerCase() === 'consumed').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-card border rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Circle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Full</p>
                  <p className="text-xl font-bold">{fridgeData.filter((f: any) => f.status?.toLowerCase() === 'full').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-card border rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Empty</p>
                  <p className="text-xl font-bold">{fridgeData.filter((f: any) => f.status?.toLowerCase() === 'empty').length}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            {fridgeData.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border rounded-xl shadow-sm p-4 flex items-center gap-4"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{item.item || item.name || 'Lunch Item'}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.childName || 'Child'} • {item.date ? new Date(item.date).toLocaleDateString() : 'Today'}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                  {item.status || 'unknown'}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
