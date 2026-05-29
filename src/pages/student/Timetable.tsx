import React from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { useAuthStore, useDataStore } from '@/lib/store'
import { TimetableView, DAYS } from '@/components/timetable'
import type { TimetableEntry } from '@/components/timetable'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

function gridToEntries(grid: any[], className: string): TimetableEntry[] {
  const entries: TimetableEntry[] = []
  grid.forEach((row: any) => {
    DAYS.forEach(day => {
      const slot = row[day.toLowerCase()]
      if (slot) {
        entries.push({
          id: `${day}-${row.time}`,
          class: className,
          day,
          time: row.time,
          subject: slot.subject || slot,
          teacher: slot.teacher || '',
          room: slot.room || '',
          color: slot.color,
        })
      }
    })
  })
  return entries
}

export default function TimetablePage() {
  const { user } = useAuthStore()
  const { timetable, isLoading } = useDataStore()
  const className = user?.class || '10-A'

  const entries = gridToEntries(timetable, className)
  const timeSlots = timetable.map((row: any) => row.time)

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
