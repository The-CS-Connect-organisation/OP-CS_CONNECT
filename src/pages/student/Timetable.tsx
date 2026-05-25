import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore, useDataStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Calendar, Clock, MapPin } from 'lucide-react'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function TimetablePage() {
  const { user } = useAuthStore()
  const { timetable, isLoading } = useDataStore()

  const todayIdx = new Date().getDay() - 1 // 0=Mon
  const todayKey = todayIdx >= 0 && todayIdx < 5 ? days[todayIdx] : null

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6 text-primary" /> Timetable</h1>
          <p className="text-muted-foreground text-sm mt-1">Class {user?.class || '10-A'} weekly schedule</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : timetable.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No timetable available</CardContent></Card>
        ) : (
          <>
            {/* Today's Schedule */}
            {todayKey && (
              <motion.div variants={itemVariants}>
                <Card glow className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" /> Today's Classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {timetable.map((slot: any, i: number) => {
                      const cls = slot[todayKey]
                      if (!cls) return null
                      return (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="text-sm font-medium text-muted-foreground w-28 flex-shrink-0">{slot.time}</div>
                          <div className="w-1 h-10 rounded-full" style={{ backgroundColor: cls.color || '#6366f1' }} />
                          <div className="flex-1">
                            <p className="font-medium">{cls.subject}</p>
                            {cls.room && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Room {cls.room}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Full Week Grid */}
            <motion.div variants={itemVariants}>
              <Card glow>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Full Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 w-28">Time</th>
                          {dayLabels.map((d, i) => (
                            <th key={d} className={cn("text-center text-xs font-medium pb-3 px-2", days[i] === todayKey && "text-primary")}>{d}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timetable.map((slot: any, rowIdx: number) => (
                          <tr key={rowIdx} className="border-b border-border/20 hover:bg-secondary/10 transition-colors">
                            <td className="py-3 pr-4 text-sm text-muted-foreground">{slot.time}</td>
                            {days.map(day => {
                              const cls = slot[day]
                              return (
                                <td key={day} className="py-3 px-2 text-center">
                                  {cls ? (
                                    <div className="px-2 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: (cls.color || '#6366f1') + '20', color: cls.color || '#6366f1' }}>
                                      {cls.subject}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground/40">—</span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
  )
}
