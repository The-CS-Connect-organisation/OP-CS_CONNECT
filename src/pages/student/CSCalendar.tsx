import React, { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Badge } from '@/components/ui/Badge'
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, AlignLeft,
  Calendar as CalendarIcon, Grid3x3, List, ChevronDown, MoreVertical,
  Trash2, Edit2, Bell, Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type ViewMode = 'month' | 'week' | 'day'

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  startTime?: string
  endTime?: string
  location?: string
  type: 'exam' | 'holiday' | 'event' | 'assignment' | 'meeting' | 'class'
  color?: string
}

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  exam: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' },
  holiday: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', dot: 'bg-green-500' },
  event: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
  assignment: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  meeting: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
  class: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800', dot: 'bg-teal-500' },
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM to 8 PM

export default function CSCalendar() {
  const { user } = useAuthStore()
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [form, setForm] = useState({ title: '', description: '', date: '', startTime: '09:00', endTime: '10:00', location: '', type: 'event' as CalendarEvent['type'] })
  const [showEventDetail, setShowEventDetail] = useState(false)

  useEffect(() => { loadEvents() }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const [eventsData, timetable] = await Promise.all([
        api.getCalendarEvents().catch(() => []),
        user?.class ? api.getTimetable(user.class).catch(() => []) : Promise.resolve([])
      ])
      const calendarEvents = Array.isArray(eventsData) ? eventsData : []
      // Add timetable entries as class events
      if (Array.isArray(timetable)) {
        const classEvents: CalendarEvent[] = []
        timetable.forEach((day: any) => {
          day.periods?.forEach((period: any) => {
            classEvents.push({
              id: `class-${day.day}-${period.time}`,
              title: period.subject,
              description: `Daily class - ${day.day}`,
              date: getNextDayDate(day.day),
              startTime: period.time.split('-')[0]?.trim(),
              endTime: period.time.split('-')[1]?.trim(),
              type: 'class',
              location: period.room || 'TBD'
            })
          })
        })
        setEvents([...calendarEvents, ...classEvents])
      } else {
        setEvents(calendarEvents)
      }
    } catch { /* error */ } finally { setLoading(false) }
  }

  const getNextDayDate = (dayName: string): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const today = new Date()
    const targetDay = days.indexOf(dayName)
    const currentDay = today.getDay()
    const diff = targetDay - currentDay
    const nextDate = new Date(today)
    nextDate.setDate(today.getDate() + (diff >= 0 ? diff : diff + 7))
    return nextDate.toISOString().split('T')[0]
  }

  const handleAddEvent = async () => {
    if (!form.title.trim()) return
    try {
      const newEvent = await api.createCalendarEvent(form)
      setEvents(prev => [...prev, newEvent])
      setForm({ title: '', description: '', date: '', startTime: '09:00', endTime: '10:00', location: '', type: 'event' })
      setShowCreateDialog(false)
    } catch { /* error */ }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      await api.deleteCalendarEvent(id)
      setEvents(prev => prev.filter(e => e.id !== id))
      setShowEventDetail(false)
      setSelectedEvent(null)
    } catch { /* error */ }
  }

  const getEventsForDay = useCallback((date: Date) => {
    return events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }, [events])

  // Navigation
  const goToPrev = () => {
    const d = new Date(currentDate)
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1)
    else if (viewMode === 'week') d.setDate(d.getDate() - 7)
    else d.setDate(d.getDate() - 1)
    setCurrentDate(d)
  }

  const goToNext = () => {
    const d = new Date(currentDate)
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1)
    else if (viewMode === 'week') d.setDate(d.getDate() + 7)
    else d.setDate(d.getDate() + 1)
    setCurrentDate(d)
  }

  const goToToday = () => setCurrentDate(new Date())

  const getHeaderTitle = () => {
    const opts: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
    if (viewMode === 'day') opts.day = 'numeric'
    return currentDate.toLocaleDateString('en-US', opts)
  }

  const getWeekDates = () => {
    const d = new Date(currentDate)
    const day = d.getDay()
    const start = new Date(d)
    start.setDate(d.getDate() - day)
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      return date
    })
  }

  const formatHour = (h: number) => {
    if (h === 12) return '12 PM'
    if (h > 12) return `${h - 12} PM`
    return `${h} AM`
  }

  // Month View
  const MonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))

    return (
      <div className="rounded-lg border bg-card">
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground border-r last:border-r-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            if (!day) return <div key={idx} className="min-h-[100px] border-r border-b last:border-r-0 bg-muted/20" />
            const dayEvents = getEventsForDay(day)
            const isToday = day.toDateString() === new Date().toDateString()
            return (
              <div
                key={idx}
                className={cn("min-h-[100px] border-r border-b last:border-r-0 p-1 cursor-pointer hover:bg-accent/30 transition-colors", isToday && "bg-orange-50/50 dark:bg-orange-950/20")}
                onClick={() => { setSelectedDate(day); setForm(prev => ({ ...prev, date: day.toISOString().split('T')[0] })); setShowCreateDialog(true) }}
              >
                <div className={cn("text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full", isToday && "bg-primary text-primary-foreground")}>
                  {day.getDate()}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map(event => {
                    const colors = EVENT_COLORS[event.type] || EVENT_COLORS.event
                    return (
                      <div
                        key={event.id}
                        className={cn("text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80", colors.bg, colors.text)}
                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setShowEventDetail(true) }}
                      >
                        {event.startTime && <span className="mr-1 opacity-70">{event.startTime}</span>}
                        {event.title}
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Week View
  const WeekView = () => {
    const weekDates = getWeekDates()
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Header - Hidden on mobile */}
        <div className="hidden md:grid grid-cols-8 border-b">
          <div className="p-2 border-r" />
          {weekDates.map((date, i) => {
            const isToday = date.toDateString() === new Date().toDateString()
            return (
              <div key={i} className={cn("p-2 text-center border-r last:border-r-0", isToday && "bg-orange-50/50 dark:bg-orange-950/20")}>
                <div className="text-xs text-muted-foreground">{dayNames[date.getDay()]}</div>
                <div className={cn("text-lg font-semibold mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full", isToday && "bg-primary text-primary-foreground")}>
                  {date.getDate()}
                </div>
              </div>
            )
          })}
        </div>
        {/* Time grid for Desktop */}
        <ScrollArea className="h-[600px] hidden md:block">
          <div className="grid grid-cols-8">
            {HOURS.map(hour => (
              <React.Fragment key={hour}>
                <div className="border-r border-b p-1 text-xs text-muted-foreground text-right pr-2 h-16">
                  {formatHour(hour)}
                </div>
                {weekDates.map((date, di) => {
                  const dayEvents = getEventsForDay(date).filter(e => {
                    if (!e.startTime) return false
                    const eventHour = parseInt(e.startTime.split(':')[0])
                    return eventHour === hour
                  })
                  const isToday = date.toDateString() === new Date().toDateString()
                  return (
                    <div key={di} className={cn("border-r border-b last:border-r-0 h-16 p-0.5 relative", isToday && "bg-orange-50/30 dark:bg-orange-950/10")}>
                      {dayEvents.map(event => {
                        const colors = EVENT_COLORS[event.type] || EVENT_COLORS.event
                        return (
                          <div
                            key={event.id}
                            className={cn("text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80", colors.bg, colors.text)}
                            onClick={() => { setSelectedEvent(event); setShowEventDetail(true) }}
                          >
                            {event.title}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
        {/* Vertical list for Mobile */}
        <ScrollArea className="h-[600px] md:hidden">
          {weekDates.map((date, i) => {
            const dayEvents = getEventsForDay(date)
            const isToday = date.toDateString() === new Date().toDateString()
            return (
              <div key={i} className={cn("border-b p-3", isToday && "bg-orange-50/50 dark:bg-orange-950/20")}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-full", isToday && "bg-primary text-primary-foreground")}>
                    {date.getDate()}
                  </div>
                  <div>
                    <p className="font-semibold">{dayNames[date.getDay()]}</p>
                    <p className="text-xs text-muted-foreground">{dayEvents.length} events</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {dayEvents.length > 0 ? dayEvents.map(event => {
                    const colors = EVENT_COLORS[event.type] || EVENT_COLORS.event
                    return (
                      <div
                        key={event.id}
                        className={cn("p-2 rounded-lg border cursor-pointer", colors.bg, colors.border)}
                        onClick={() => { setSelectedEvent(event); setShowEventDetail(true) }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className={cn("font-semibold text-sm", colors.text)}>{event.title}</div>
                            {event.startTime && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Clock className="w-3 h-3" />
                                {event.startTime} {event.endTime && `- ${event.endTime}`}
                              </div>
                            )}
                          </div>
                          <div className={cn("w-2 h-2 rounded-full mt-1.5", colors.dot)} />
                        </div>
                      </div>
                    )
                  }) : (
                    <p className="text-sm text-muted-foreground italic">No events scheduled.</p>
                  )}
                </div>
              </div>
            )
          })}
        </ScrollArea>
      </div>
    )
  }

  // Day View
  const DayView = () => {
    const dayEvents = getEventsForDay(currentDate)
    const isToday = currentDate.toDateString() === new Date().toDateString()

    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <p className="text-sm text-muted-foreground">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled</p>
        </div>
        <ScrollArea className="h-[600px]">
          <div className="relative">
            {HOURS.map(hour => {
              const hourEvents = dayEvents.filter(e => {
                if (!e.startTime) return false
                return parseInt(e.startTime.split(':')[0]) === hour
              })
              return (
                <div key={hour} className="flex border-b min-h-[80px]">
                  <div className="w-20 p-2 text-xs text-muted-foreground text-right border-r flex-shrink-0">
                    {formatHour(hour)}
                  </div>
                  <div className="flex-1 p-1 relative">
                    {hourEvents.map(event => {
                      const colors = EVENT_COLORS[event.type] || EVENT_COLORS.event
                      return (
                        <div
                          key={event.id}
                          className={cn("mb-1 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow", colors.bg, colors.border)}
                          onClick={() => { setSelectedEvent(event); setShowEventDetail(true) }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className={cn("font-semibold text-sm", colors.text)}>{event.title}</div>
                              {event.startTime && event.endTime && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  {event.startTime} - {event.endTime}
                                </div>
                              )}
                              {event.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                            <div className={cn("w-2 h-2 rounded-full mt-1", colors.dot)} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-[600px] bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">CS Calendar</h1>
          <p className="text-sm text-muted-foreground">Your academic schedule at a glance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToPrev}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm font-semibold w-36 text-center">{getHeaderTitle()}</span>
            <Button variant="ghost" size="icon" onClick={goToNext}><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <div className="flex items-center border rounded-lg overflow-hidden">
            {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn("px-3 py-1.5 text-xs font-medium capitalize transition-colors", viewMode === mode ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
              >
                {mode}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => { setForm(prev => ({ ...prev, date: currentDate.toISOString().split('T')[0] })); setShowCreateDialog(true) }}>
            <Plus className="w-4 h-4 mr-1" /> Add Event
          </Button>
        </div>
      </div>

      {/* Views */}
      <AnimatePresence mode="wait">
        <motion.div key={viewMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {viewMode === 'month' && <MonthView />}
          {viewMode === 'week' && <WeekView />}
          {viewMode === 'day' && <DayView />}
        </motion.div>
      </AnimatePresence>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <Label>Type</Label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="event">Event</option>
                  <option value="exam">Exam</option>
                  <option value="holiday">Holiday</option>
                  <option value="assignment">Assignment</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Room / Location" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Event description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleAddEvent}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <Dialog open={showEventDetail} onOpenChange={setShowEventDetail}>
        <DialogContent>
          {selectedEvent && (() => {
            const colors = EVENT_COLORS[selectedEvent.type] || EVENT_COLORS.event
            return (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mb-2", colors.bg, colors.text)}>
                        <div className={cn("w-2 h-2 rounded-full", colors.dot)} />
                        {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                      </div>
                      <DialogTitle className="text-xl">{selectedEvent.title}</DialogTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(selectedEvent.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {selectedEvent.startTime && selectedEvent.endTime && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                    </div>
                  )}
                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {selectedEvent.description && (
                    <div className="flex items-start gap-3 text-sm">
                      <AlignLeft className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <p className="text-muted-foreground">{selectedEvent.description}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEventDetail(false)}>Close</Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}