import React from 'react'
import { motion } from 'framer-motion'
import { useAuthStore, useDataStore } from '@/lib/store'
import { TimetableView } from '@/components/timetable'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function TimetablePage() {
  const { user } = useAuthStore()
  const { timetable, isLoading } = useDataStore()
  const className = user?.class || '10-A'

  const entries = Array.isArray(timetable) ? timetable : []
  const timeSlots = [...new Set(entries.map((e: any) => e.time).filter(Boolean))].sort()

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <TimetableView
          entries={entries}
          loading={isLoading}
          timeSlots={timeSlots.length > 0 ? timeSlots : undefined}
          title="Timetable"
          subtitle={`Class ${className} weekly schedule`}
          showViewSwitcher
        />
      </motion.div>
    </motion.div>
  )
}
