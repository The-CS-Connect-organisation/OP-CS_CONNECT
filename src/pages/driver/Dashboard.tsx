
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import AIChatPanel from '@/components/ai/AIChatPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { getSocket } from '@/lib/socket'
import {
  MapPin, Bus, Users, Fuel, Shield, Sparkles,
  Brain, Clock, CheckCircle2, AlertCircle, Navigation,
  Phone, Route, Thermometer, Zap, AlertTriangle,
  ArrowRight, Star, Timer, Map, Radio
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}



const GPS_START_HOUR = 5
const GPS_END_HOUR = 17

function isWithinSchedule(): boolean {
  const hour = new Date().getHours()
  return hour >= GPS_START_HOUR && hour < GPS_END_HOUR
}

export default function DriverDashboard() {
  const { user } = useAuthStore()
  const [showAI, setShowAI] = useState(false)
  const [boardedStudents, setBoardedStudents] = useState<Set<string>>(new Set(['s1', 's2']))
  const [sosActive, setSosActive] = useState(false)
  const [routes, setRoutes] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [gpsActive, setGpsActive] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('Waiting for schedule...')
  const [scheduleActive, setScheduleActive] = useState(isWithinSchedule())
  const [onLeave, setOnLeave] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const busIdRef = useRef<string>('r1')
  // Manual GPS override: null = follow schedule, true = force on, false = force off.
  const gpsOverrideRef = useRef<boolean | null>(null)
  // Tracks the last schedule-window state so we can detect boundary crossings.
  const lastActiveRef = useRef<boolean>(isWithinSchedule())
  // Mirror onLeave into a ref so the schedule interval always sees the latest value.
  const onLeaveRef = useRef<boolean>(false)

  const startGps = useCallback(() => {
    if (watchIdRef.current !== null) return
    if (!navigator.geolocation) {
      setGpsStatus('GPS not available on this device')
      return
    }
    setGpsActive(true)
    setGpsStatus('Acquiring GPS position...')
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        getSocket().emit('driver:location', { busId: busIdRef.current, lat, lng })
        setGpsStatus(`Broadcasting: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      },
      (err) => {
        setGpsStatus(`GPS error: ${err.message}`)
        stopGps()
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )
  }, [])

  const stopGps = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setGpsActive(false)
  }, [])

  // Auto-schedule: check every minute
  useEffect(() => {
    const check = () => {
      // If the admin has marked this driver on leave, never broadcast.
      if (onLeaveRef.current) {
        stopGps()
        setGpsStatus('You are marked on leave — tracking disabled')
        return
      }
      const active = isWithinSchedule()
      setScheduleActive(active)
      // When the schedule window boundary is crossed, clear any manual override
      // so automatic scheduling resumes from the new window.
      if (active !== lastActiveRef.current) {
        lastActiveRef.current = active
        gpsOverrideRef.current = null
      }
      // A manual override takes precedence over the schedule.
      if (gpsOverrideRef.current === true) {
        startGps()
        return
      }
      if (gpsOverrideRef.current === false) {
        stopGps()
        return
      }
      if (active) {
        startGps()
        setGpsStatus(prev => prev.includes('Broadcasting') ? prev : 'Auto-started (5:00–17:00)')
      } else {
        stopGps()
        setGpsStatus('Outside schedule (active 5:00–17:00)')
      }
    }
    check()
    const interval = setInterval(check, 60000)
    return () => { clearInterval(interval); stopGps() }
  }, [startGps, stopGps, onLeave])

  useEffect(() => {
    Promise.allSettled([
      api.getRoutes().then((d: any) => {
        const list = Array.isArray(d) ? d : [];
        setRoutes(list);
        const myRoute = list.find((r: any) => r.driverId === user?.id);
        if (myRoute) busIdRef.current = myRoute.id;
      }).catch(() => {}),
      api.getStudents().then((d: any) => setStudents(Array.isArray(d) ? d : [])).catch(() => {}),
    ]).then(() => setLoading(false))

    if (user?.id) {
      api.getUser(user.id)
        .then((u: any) => { onLeaveRef.current = !!u?.onLeave; setOnLeave(!!u?.onLeave) })
        .catch(() => {})
    }
  }, [user?.id])

  const toggleBoarded = (id: string) => {
    setBoardedStudents(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleGps = () => {
    if (onLeave) return
    if (gpsActive) {
      gpsOverrideRef.current = false
      stopGps()
      setGpsStatus('GPS broadcasting stopped (manual)')
    } else {
      gpsOverrideRef.current = true
      startGps()
    }
  }

  const fuelData = [
    { week: 'Mon', usage: 45, efficiency: 4.2 },
    { week: 'Tue', usage: 52, efficiency: 3.8 },
    { week: 'Wed', usage: 48, efficiency: 4.0 },
    { week: 'Thu', usage: 38, efficiency: 4.5 },
    { week: 'Fri', usage: 55, efficiency: 3.6 },
    { week: 'Sat', usage: 42, efficiency: 4.1 },
    { week: 'Sun', usage: 35, efficiency: 4.8 },
  ]

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading dashboard...</p></div>;

  const totalStudents = students.length;
  const boardedCount = boardedStudents.size;

  // Safely derive the active route and normalize its stops. Stops may come from
  // the backend as plain strings or as rich objects, and the route list can be
  // empty - guard against both so the dashboard never crashes on render.
  const currentRoute = routes[0];
  const routeStops: any[] = Array.isArray(currentRoute?.stops)
    ? currentRoute.stops.map((s: any, i: number) =>
        typeof s === 'string'
          ? { id: `stop-${i}`, name: s, time: '--:--', students: 0, status: 'upcoming' }
          : { id: s.id ?? `stop-${i}`, status: 'upcoming', time: '--:--', students: 0, ...s }
      )
    : [];
  const currentStopName = routeStops.find((s: any) => s.status === 'current')?.name ?? '—';
  const nextStopName = routeStops.find((s: any) => s.status === 'upcoming')?.name ?? '—';

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Hero */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600/10 via-amber-600/5 to-transparent border border-orange-500/10 p-6 lg:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full filter blur-[80px]" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Driver Dashboard 🚌</h1>
                  <p className="text-muted-foreground text-sm">Route Alpha - North Zone • Vehicle: KA-01-1234</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                Currently at <span className="text-orange-500 font-medium">{currentStopName}</span>. {boardedCount}/{totalStudents} students boarded. Next stop: {nextStopName}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSosActive(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                SOS
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAI(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white text-sm font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
              >
                <Brain className="w-4 h-4" />
                AI Route
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Students Onboard', value: `${boardedCount}/${totalStudents}`, icon: Users, color: 'from-orange-600 to-amber-600', sub: `${totalStudents - boardedCount} remaining` },
            { label: 'Route Progress', value: '45%', icon: Route, color: 'from-orange-600 to-amber-600', sub: '4 of 8 stops' },
            { label: 'ETA to School', value: '25 min', icon: Clock, color: 'from-emerald-600 to-teal-600', sub: 'On schedule' },
            { label: 'Fuel Level', value: '72%', icon: Fuel, color: 'from-orange-500 to-amber-600', sub: '28L remaining' },
          ].map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: -2, scale: 1.02 }}>
              <Card glow className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1 stat-value">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                    </div>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br", stat.color)}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* GPS Broadcast Card */}
        <motion.div variants={itemVariants}>
          <Card glow className={cn("border transition-all", gpsActive ? "border-emerald-500/30" : "border-orange-500/10")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    gpsActive ? "bg-gradient-to-br from-emerald-600 to-teal-600" : "bg-gradient-to-br from-orange-600 to-amber-600"
                  )}>
                    <Radio className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Live GPS Broadcasting</p>
                    <p className="text-xs text-muted-foreground">{gpsStatus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {gpsActive && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-500 font-medium">LIVE</span>
                    </div>
                  )}
                  {onLeave ? (
                    <span className="px-3 py-2 rounded-xl text-sm font-medium bg-amber-100 text-amber-700">On leave — tracking off</span>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleGps}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition-all",
                        gpsActive
                          ? "bg-red-600 text-white shadow-red-500/25 hover:shadow-red-500/40"
                          : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40"
                      )}
                    >
                      <MapPin className="w-4 h-4" />
                      {gpsActive ? 'Stop GPS' : 'Start GPS'}
                    </motion.button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Route & Students */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Route Timeline */}
          <motion.div variants={itemVariants}>
            <Card glow>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-orange-500" />
                    Route Timeline
                  </CardTitle>
                  <Badge variant="info">Live</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {routeStops.map((stop: any, i: number) => (
                    <motion.div
                      key={stop.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-lg transition-all",
                        stop.status === 'current' && "bg-orange-500/10 border border-orange-500/20",
                        stop.status === 'completed' && "opacity-60",
                      )}
                    >
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-3 h-3 rounded-full border-2",
                          stop.status === 'completed' && "bg-emerald-500 border-emerald-500",
                          stop.status === 'current' && "bg-orange-500 border-orange-500 animate-pulse",
                          stop.status === 'upcoming' && "bg-muted border-muted-foreground/30",
                          (stop.status === 'start' || stop.status === 'end') && "bg-orange-500 border-orange-500",
                        )} />
                        {i < routeStops.length - 1 && <div className="w-0.5 h-6 bg-border" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", stop.status === 'current' && "text-orange-500")}>{stop.name}</p>
                        <p className="text-xs text-muted-foreground">{stop.time}{stop.students > 0 && ` • ${stop.students} students`}</p>
                      </div>
                      {stop.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {stop.status === 'current' && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Student Boarding */}
          <motion.div variants={itemVariants}>
            <Card glow>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    Student Boarding
                  </CardTitle>
                  <Badge variant="info">{boardedCount}/{totalStudents}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {students.map((student) => (
                    <motion.div
                      key={student.id}
                      whileHover={{ x: 2 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                        boardedStudents.has(student.id)
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-border/50 hover:bg-accent/50"
                      )}
                      onClick={() => toggleBoarded(student.id)}
                    >
                      <Avatar src={student.avatar} alt={student.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.class} • {student.pickup}</p>
                      </div>
                      {boardedStudents.has(student.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-2">
                  <Brain className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-orange-500">AI Route Suggestion</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Skip Park Avenue and go directly to Green Valley - saves 8 min. Student at Park Avenue is absent today.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Fuel & Vehicle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card glow>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-orange-500" />
                  Fuel Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fuelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="efficiency" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="km/L" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Efficiency</span>
                  <span className="font-semibold text-orange-500">2.95 km/L</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card glow>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bus className="w-5 h-5 text-orange-500" />
                  Vehicle Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Engine', value: 'Good', status: 'success', progress: 85 },
                    { label: 'Tires', value: 'Fair', status: 'warning', progress: 65 },
                    { label: 'Brakes', value: 'Good', status: 'success', progress: 90 },
                    { label: 'Battery', value: 'Good', status: 'success', progress: 88 },
                    { label: 'Oil Level', value: 'Low', status: 'warning', progress: 35 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16">{item.label}</span>
                      <Progress value={item.progress} size="sm" color={item.status === 'success' ? '#10b981' : '#f59e0b'} className="flex-1" />
                      <Badge variant={item.status === 'success' ? 'success' : 'warning'} className="text-[10px]">{item.value}</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-500">Maintenance Alert</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Oil change due in 200 km. Schedule maintenance this weekend.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* SOS Modal */}
        {sosActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSosActive(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-sm w-full border border-red-500/20 shadow-2xl"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold">Emergency SOS</h3>
                <p className="text-sm text-muted-foreground">This will alert school admin and emergency contacts with your current location.</p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setSosActive(false)}>Cancel</Button>
                  <Button variant="destructive" className="flex-1" onClick={() => { setSosActive(false); alert('SOS sent to school admin!') }}>Send SOS</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        <AIChatPanel isOpen={showAI} onClose={() => setShowAI(false)} context="Driver route optimization and navigation assistance" />
      </motion.div>
  )
}
