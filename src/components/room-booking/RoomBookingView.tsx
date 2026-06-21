import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  CalendarDays, Clock, User, MapPin, Plus, Search, X, Check,
  Building2, ChevronLeft, ChevronRight, Monitor
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Room {
  id: string
  name: string
  building: string
  floor: number
  capacity: number
  equipment: string
}

interface Booking {
  id: string
  roomId: string
  roomName: string
  title: string
  date: string
  startTime: string
  endTime: string
  bookedBy: string
  purpose: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

export default function RoomBookingView({ role }: { role: string }) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ roomId: '', title: '', date: selectedDate, startTime: '', endTime: '', purpose: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [roomsData, bookingsData] = await Promise.all([
        api.getRooms().catch(() => []),
        api.getRoomBookings().catch(() => [])
      ])
      setRooms(roomsData)
      setBookings(bookingsData)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.roomId || !form.title || !form.startTime || !form.endTime) return
    try {
      await api.createRoomBooking({
        roomId: form.roomId,
        title: form.title,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        status: 'confirmed'
      })
      setShowForm(false)
      setForm({ roomId: '', title: '', date: selectedDate, startTime: '', endTime: '', purpose: '' })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await api.updateRoomBooking(id, { status: 'cancelled' })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const dayBookings = bookings.filter(b => b.date === selectedDate && b.status !== 'cancelled')
  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.building.toLowerCase().includes(search.toLowerCase())
  )

  const navigateDay = (dir: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + dir)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const getRoomBookings = (roomId: string) =>
    dayBookings.filter(b => b.roomId === roomId).sort((a, b) => a.startTime.localeCompare(b.startTime))

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Room Booking</h1>
          <p className="text-muted-foreground text-sm">Book and manage room reservations</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />New Booking</Button>
      </div>

      {/* Date Navigator */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigateDay(-1)}><ChevronLeft className="w-4 h-4" /></Button>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border">
          <CalendarDays className="w-4 h-4 text-primary" />
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium" />
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigateDay(1)}><ChevronRight className="w-4 h-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>Today</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      {/* Room Grid with Timeline */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] space-y-4">
          {filteredRooms.map(room => {
            const roomBookings = getRoomBookings(room.id)
            return (
              <Card key={room.id} className="p-4 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{room.name}</span>
                      <Badge variant="outline" className="text-[10px]">{room.building}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Floor {room.floor}</span>
                      <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{room.equipment}</span>
                      <span>Capacity: {room.capacity}</span>
                    </div>
                  </div>
                </div>
                {/* Timeline */}
                <div className="relative h-10 bg-muted/30 rounded-lg flex">
                  {timeSlots.map((slot, i) => (
                    <div key={slot} className="flex-1 border-l border-border/30 first:border-l-0 relative">
                      <span className="absolute -top-4 left-1 text-[9px] text-muted-foreground">{slot}</span>
                    </div>
                  ))}
                  {roomBookings.map(booking => {
                    const startIdx = timeSlots.indexOf(booking.startTime)
                    const endIdx = timeSlots.indexOf(booking.endTime)
                    const left = (startIdx / timeSlots.length) * 100
                    const width = ((endIdx - startIdx) / timeSlots.length) * 100
                    return (
                      <div key={booking.id}
                        className="absolute top-1 h-8 rounded-md flex items-center justify-center text-[10px] font-medium text-white cursor-pointer group"
                        style={{ left: `${left}%`, width: `${Math.max(width, 8)}%`, background: '#f97316' }}
                        title={`${booking.title} (${booking.bookedBy})`}>
                        <span className="truncate px-1">{booking.title}</span>
                        <button onClick={() => handleCancel(booking.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full hidden group-hover:flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
          {filteredRooms.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No rooms found</div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-card rounded-2xl p-6 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Room Booking</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Room</label>
                <select value={form.roomId} onChange={e => setForm({...form, roomId: e.target.value})}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-background border text-sm outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Select room...</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name} - {r.building}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Math Class" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Start</label>
                  <Input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">End</label>
                  <Input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Purpose</label>
                <Input value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleCreate} disabled={!form.roomId || !form.title || !form.startTime || !form.endTime}>
                <Check className="w-4 h-4 mr-2" />Book Room
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
