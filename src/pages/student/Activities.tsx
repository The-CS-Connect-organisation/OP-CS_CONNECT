import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore, useDataStore } from '@/lib/store'
import { Trophy, Calendar, Users, ArrowUpRight, Sparkles } from 'lucide-react'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

const eventTypeColors: Record<string, string> = {
  sports: '#3b82f6', academic: '#8b5cf6', meeting: '#f59e0b', ceremony: '#ec4899', holiday: '#10b981', event: '#6366f1',
}
const eventTypeBadge: Record<string, string> = {
  sports: 'info', academic: 'success', meeting: 'warning', ceremony: 'destructive', holiday: 'success', event: 'info',
}

export default function ActivitiesPage() {
  const { user } = useAuthStore()
  const { clubs, events, isLoading } = useDataStore()

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-primary" /> Activities</h1>
          <p className="text-muted-foreground text-sm mt-1">Your clubs and upcoming events</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <>
            {/* My Clubs */}
            <motion.div variants={itemVariants}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> My Clubs</h2>
            </motion.div>
            {clubs.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No clubs found</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
                {clubs.map((club: any) => (
                  <motion.div key={club.id} variants={itemVariants}>
                    <Card glow className="hover:border-primary/20 transition-colors cursor-pointer group">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: (club.color || '#6366f1') + '20' }}>
                            {club.icon || '🎯'}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{club.name}</p>
                            <p className="text-sm text-muted-foreground">{club.members} members</p>
                          </div>
                          <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Upcoming Events */}
            <motion.div variants={itemVariants} className="mt-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Upcoming Events</h2>
            </motion.div>
            {events.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No events found</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event: any) => (
                  <motion.div key={event.id} variants={itemVariants}>
                    <Card glow className="hover:border-primary/20 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: (eventTypeColors[event.type] || '#6366f1') + '20' }}>
                            <Sparkles className="w-6 h-6" style={{ color: eventTypeColors[event.type] || '#6366f1' }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{event.title}</p>
                              <Badge variant={(eventTypeBadge[event.type] || 'info') as any}>{event.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
  )
}