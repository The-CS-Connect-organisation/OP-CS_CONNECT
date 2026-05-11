import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock, BookOpen, FileText,
  AlertCircle, Sparkles, Edit2, Trash2, X, Bell, CheckCircle2, Zap
} from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { getFromStorage, setToStorage } from '../../../../data/schema';

const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = 7 + i;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h;
  return { label: `${display}:00 ${suffix}`, hour: h };
});

const EVENT_TYPES = {
  class: { label: 'Class', color: '#3b82f6', bg: '#eff6ff' },
  assignment: { label: 'Assignment', color: '#f59e0b', bg: '#fffbeb' },
  exam: { label: 'Exam', color: '#ef4444', bg: '#fef2f2' },
  study: { label: 'Study', color: '#8b5cf6', bg: '#f5f3ff' },
  custom: { label: 'Event', color: '#10b981', bg: '#f0fdf4' },
};

const getEventStyle = (type) => EVENT_TYPES[type] || EVENT_TYPES.custom;

const today = new Date();
today.setHours(0, 0, 0, 0);

function getWeekDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

function loadEvents() {
  return getFromStorage('sms_calendar_events', []);
}

function saveEvents(events) {
  setToStorage('sms_calendar_events', events);
}

export const CSCalendar = ({ user }) => {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [events, setEvents] = useState(loadEvents);
  const [selectedDay, setSelectedDay] = useState(null);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const navigateWeek = (dir) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + dir * 7);
    setWeekStart(next);
  };

  const goToToday = () => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    d.setHours(0, 0, 0, 0);
    setWeekStart(d);
  };

  // Load assignments and exams from localStorage
  const assignments = getFromStorage('sms_assignments', []);
  const exams = getFromStorage('sms_exams', []);
  const focusTasks = getFromStorage('sms_focus_tasks', []);

  const assignmentsInRange = useMemo(() => {
    return assignments.filter(a => a.dueDate && weekDates.some(d => toDateStr(d) === a.dueDate));
  }, [assignments, weekDates]);

  const examsInRange = useMemo(() => {
    return exams.filter(e => e.date && weekDates.some(d => toDateStr(d) === e.date));
  }, [exams, weekDates]);

  const focusTasksInRange = useMemo(() => {
    return focusTasks.filter(t => t.date && weekDates.some(d => toDateStr(d) === t.date));
  }, [focusTasks, weekDates]);

  const allEvents = useMemo(() => {
    const evs = [...events];

    // Add assignments as events
    assignmentsInRange.forEach(a => {
      evs.push({
        id: `asgn-${a.id}`,
        title: a.title,
        type: 'assignment',
        date: a.dueDate,
        subject: a.subject,
        time: '23:59',
        endTime: '23:59',
        meta: a,
      });
    });

    // Add exams as events
    examsInRange.forEach(e => {
      evs.push({
        id: `exam-${e.id}`,
        title: e.name,
        type: 'exam',
        date: e.date,
        subject: e.subject,
        time: '09:00',
        endTime: '13:00',
        meta: e,
      });
    });

    // Add focus tasks as events
    focusTasksInRange.forEach(t => {
      evs.push({
        id: `focus-${t.id}`,
        title: t.title,
        type: 'study',
        date: t.date,
        subject: t.subject,
        time: '10:00',
        endTime: null,
        meta: t,
      });
    });

    return evs;
  }, [events, assignmentsInRange, examsInRange, focusTasksInRange]);

  const getEventsForDay = (date) => {
    const dateStr = toDateStr(date);
    return allEvents.filter(e => e.date === dateStr);
  };

  const isToday = (date) => toDateStr(date) === toDateStr(new Date());
  const isPast = (date) => date < today;

  const handleDeleteEvent = (id) => {
    const updated = events.filter(e => e.id !== id);
    saveEvents(updated);
    setEvents(updated);
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-200 rounded-sm text-[10px] font-bold uppercase tracking-widest">
              CS_CALENDAR
            </span>
            <div className="h-[1px] w-8 bg-gray-200" />
            <span className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={10} className="text-orange-400" /> Week View
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 flex items-center gap-4">
            <Calendar className="text-orange-500" size={36} />
            CS Calendar
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Week navigation */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button onClick={() => navigateWeek(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft size={16} className="text-gray-500" />
            </button>
            <button onClick={goToToday} className="px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
              Today
            </button>
            <button onClick={() => navigateWeek(1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </div>

          <span className="text-sm font-bold text-gray-900">
            {weekDates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {weekDates[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>

          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)} className="px-4 py-2 text-xs" style={{ background: '#ea580c', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
            Add Event
          </Button>
        </div>
      </div>

      {/* Event type legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(EVENT_TYPES).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs font-medium">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: val.color }} />
            <span style={{ color: val.color }}>{val.label}</span>
          </div>
        ))}
      </div>

      {/* Week Grid */}
      <Card className="border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b" style={{ borderColor: '#f3f4f6' }}>
          <div className="py-3 px-3 text-xs text-gray-400 font-medium border-r" style={{ borderColor: '#f3f4f6' }}>Time</div>
          {weekDates.map((date, i) => (
            <div
              key={i}
              className={`py-3 text-center border-r last:border-r-0 transition-colors ${isToday(date) ? 'bg-orange-50' : ''}`}
              style={{ borderColor: '#f3f4f6' }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isToday(date) ? '#ea580c' : '#9ca3af' }}>
                {dayNames[i]}
              </div>
              <div className={`text-sm font-extrabold mt-0.5 ${isToday(date) ? 'text-orange-600' : isPast(date) ? 'text-gray-400' : 'text-gray-900'}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="overflow-auto max-h-[600px]">
          {HOURS.map((h) => (
            <div key={h.hour} className="grid grid-cols-8 border-b" style={{ borderColor: '#f9fafb' }}>
              <div className="py-4 px-3 text-[10px] font-mono text-gray-400 border-r text-right" style={{ borderColor: '#f9fafb' }}>
                {h.label}
              </div>
              {weekDates.map((date, di) => {
                const dayEvents = getEventsForDay(date).filter(e => {
                  const eventHour = parseInt(e.time?.split(':')[0] || '0');
                  return eventHour === h.hour;
                });
                return (
                  <div
                    key={di}
                    className={`py-2 px-1 border-r last:border-r-0 min-h-[60px] relative transition-colors ${isToday(date) ? 'bg-orange-50/30' : ''}`}
                    style={{ borderColor: '#f9fafb' }}
                    onClick={() => {
                      setSelectedDay({ date, hour: h.hour });
                      setShowAddModal(true);
                    }}
                  >
                    {dayEvents.map((ev, ei) => {
                      const evStyle = getEventStyle(ev.type);
                      return (
                        <motion.div
                          key={ev.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[9px] p-1.5 rounded-lg mb-1 cursor-pointer group relative overflow-hidden"
                          style={{ background: evStyle.bg, borderLeft: `3px solid ${evStyle.color}` }}
                          onClick={(e) => { e.stopPropagation(); setEditEvent(ev); setShowAddModal(true); }}
                        >
                          <div className="font-bold truncate leading-tight" style={{ color: evStyle.color }}>{ev.title}</div>
                          {ev.subject && <div className="truncate opacity-70 mt-0.5">{ev.subject}</div>}
                          {ev.time && <div className="font-mono opacity-60">{ev.time}</div>}
                          {/* Delete on hover */}
                          {ev.type === 'custom' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <X size={8} />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Day detail sidebar */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedDay.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              {getEventsForDay(selectedDay.date).length === 0 ? (
                <Card className="p-8 text-center border border-dashed border-gray-200">
                  <Calendar size={32} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-500">No events this day</p>
                  <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)} className="mt-3 px-4" style={{ background: '#ea580c' }}>
                    Add Event
                  </Button>
                </Card>
              ) : (
                getEventsForDay(selectedDay.date).map(ev => {
                  const evStyle = getEventStyle(ev.type);
                  return (
                    <Card key={ev.id} className="p-5 border-l-4 flex items-start gap-4" style={{ borderLeftColor: evStyle.color }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: evStyle.bg }}>
                        {ev.type === 'class' ? <BookOpen size={16} style={{ color: evStyle.color }} /> :
                         ev.type === 'assignment' ? <FileText size={16} style={{ color: evStyle.color }} /> :
                         ev.type === 'exam' ? <AlertCircle size={16} style={{ color: evStyle.color }} /> :
                         ev.type === 'study' ? <Zap size={16} style={{ color: evStyle.color }} /> :
                         <Calendar size={16} style={{ color: evStyle.color }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-gray-900">{ev.title}</h4>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: evStyle.bg, color: evStyle.color }}>{evStyle.label}</span>
                        </div>
                        {ev.subject && <p className="text-xs text-gray-500 mb-1">{ev.subject}</p>}
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
                          <span className="flex items-center gap-1"><Clock size={10} />{ev.time || 'All day'}</span>
                          {ev.meta?.totalMarks && <span>Max: {ev.meta.totalMarks} marks</span>}
                          {ev.meta?.status && <span className="capitalize">{ev.meta.status}</span>}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => { setShowAddModal(false); setEditEvent(null); setSelectedDay(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">{editEvent ? 'Edit Event' : 'Add Custom Event'}</h3>
                <button onClick={() => { setShowAddModal(false); setEditEvent(null); }} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <EventForm
                initialData={editEvent}
                initialDate={selectedDay?.date ? toDateStr(selectedDay.date) : toDateStr(new Date())}
                initialHour={selectedDay?.hour || 10}
                onSave={(newEvent) => {
                  if (editEvent) {
                    const updated = events.map(e => e.id === editEvent.id ? { ...e, ...newEvent } : e);
                    saveEvents(updated);
                    setEvents(updated);
                  } else {
                    const ev = { ...newEvent, id: `custom-${Date.now()}`, type: 'custom' };
                    const updated = [...events, ev];
                    saveEvents(updated);
                    setEvents(updated);
                  }
                  setShowAddModal(false);
                  setEditEvent(null);
                  setSelectedDay(null);
                }}
                onDelete={editEvent ? () => { handleDeleteEvent(editEvent.id); setShowAddModal(false); setEditEvent(null); } : null}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function EventForm({ initialData, initialDate, initialHour, onSave, onDelete }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [date, setDate] = useState(initialData?.date || initialDate);
  const [time, setTime] = useState(initialData?.time || `${String(initialHour).padStart(2, '0')}:00`);
  const [type, setType] = useState(initialData?.type || 'custom');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), subject, date, time, type });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Event Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Science Fair Project"
          className="input-field w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-full" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input-field w-full" />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Subject / Category</label>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Mathematics"
          className="input-field w-full" />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Type</label>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(EVENT_TYPES).map(([key, val]) => (
            <button key={key} onClick={() => setType(key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all"
              style={{
                background: type === key ? val.bg : 'transparent',
                borderColor: type === key ? val.color : '#e5e7eb',
                color: type === key ? val.color : '#9ca3af',
              }}>
              {val.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        {onDelete && (
          <button onClick={onDelete}
            className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors flex items-center gap-2">
            <Trash2 size={14} /> Delete
          </button>
        )}
        <button onClick={handleSubmit} disabled={!title.trim()}
          className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:brightness-105 disabled:opacity-50"
          style={{ background: '#ea580c' }}>
          {initialData ? 'Update Event' : 'Add Event'}
        </button>
      </div>
    </div>
  );
}

export default CSCalendar;