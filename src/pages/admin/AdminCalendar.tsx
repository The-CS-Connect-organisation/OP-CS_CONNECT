import { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const localizer = momentLocalizer(moment);
const BaseDnDCalendar = withDragAndDrop(Calendar as any);

const EVENT_TYPES = [
  { value: 'exam', label: 'Exam', color: '#ef4444', bg: '#fef2f2' },
  { value: 'holiday', label: 'Holiday', color: '#10b981', bg: '#f0fdf4' },
  { value: 'event', label: 'Event', color: '#f59e0b', bg: '#fffbeb' },
  { value: 'assignment', label: 'Assignment', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'meeting', label: 'Meeting', color: '#8b5cf6', bg: '#f5f3ff' },
  { value: 'class', label: 'Class', color: '#14b8a6', bg: '#f0fdfa' },
  { value: 'sports', label: 'Sports', color: '#f97316', bg: '#fff7ed' },
  { value: 'birthday', label: 'Birthday', color: '#ec4899', bg: '#fdf2f8' },
  { value: 'deadline', label: 'Deadline', color: '#dc2626', bg: '#fef2f2' },
  { value: 'other', label: 'Other', color: '#6b7280', bg: '#f9fafb' },
];

const typeMap = Object.fromEntries(EVENT_TYPES.map(t => [t.value, t]));

export default function AdminCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'event' });

  const loadEvents = useCallback(async () => {
    try {
      const data = await api.getEvents();
      const mapped = (Array.isArray(data) ? data : []).map((e: any) => ({
        id: e.id,
        title: e.title || e.name || 'Untitled',
        start: new Date(e.startDate || e.start || e.date),
        end: new Date(e.endDate || e.end || e.startDate || e.start || e.date),
        description: e.description,
        type: e.type || 'event',
      }));
      setEvents(mapped);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setEditingEvent(null);
    setForm({ title: '', description: '', type: 'event' });
    setShowDialog(true);
  };

  const handleSelectEvent = (event: any) => {
    setEditingEvent(event);
    setForm({ title: event.title, description: event.description || '', type: event.type || 'event' });
    setShowDialog(true);
  };

  const handleEventDrop = async ({ event: ev, start, end }: { event: any; start: Date; end: Date }) => {
    const updated = { ...ev, start, end };
    setEvents((prev: any[]) => prev.map((e: any) => e.id === ev.id ? updated : e));
    try {
      await api.updateEvent(ev.id, { startDate: start.toISOString(), endDate: end.toISOString() });
    } catch { loadEvents(); }
  };

  const handleEventResize = async ({ event: ev, start, end }: { event: any; start: Date; end: Date }) => {
    const updated = { ...ev, start, end };
    setEvents((prev: any[]) => prev.map((e: any) => e.id === ev.id ? updated : e));
    try {
      await api.updateEvent(ev.id, { startDate: start.toISOString(), endDate: end.toISOString() });
    } catch { loadEvents(); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    if (editingEvent) {
      try {
        await api.updateEvent(editingEvent.id, { ...form, startDate: editingEvent.start.toISOString(), endDate: editingEvent.end.toISOString() });
        setEvents((prev: any[]) => prev.map((e: any) => e.id === editingEvent.id ? { ...e, ...form } : e));
      } catch { /* ignore */ }
    } else {
      try {
        const created = await api.createEvent({ ...form, startDate: start.toISOString(), endDate: end.toISOString() });
        setEvents((prev: any[]) => [...prev, { id: created.id || String(Date.now()), title: form.title, description: form.description, type: form.type, start, end }]);
      } catch { /* ignore */ }
    }
    setShowDialog(false);
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    try {
      await api.deleteEvent(editingEvent.id);
      setEvents((prev: any[]) => prev.filter((e: any) => e.id !== editingEvent.id));
    } catch { /* ignore */ }
    setShowDialog(false);
  };

  const eventStyleGetter = (event: any) => {
    const t = typeMap[event.type] || typeMap.other;
    return { style: { backgroundColor: t.color, borderRadius: '6px', opacity: 0.85, color: '#fff', border: 'none', fontSize: '13px' } };
  };

  const CustomEvent = ({ event }: { event: any }) => {
    const t = typeMap[event.type] || typeMap.other;
    return (
      <div className="flex items-center gap-1.5 h-full px-1 overflow-hidden">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
        <span className="text-xs truncate font-medium">{event.title}</span>
      </div>
    );
  };

  const calProps: any = {
    localizer,
    events,
    startAccessor: 'start',
    endAccessor: 'end',
    view,
    date,
    onView: (v: any) => setView(v),
    onNavigate: (d: Date) => setDate(d),
    onSelectSlot: handleSelectSlot,
    onSelectEvent: handleSelectEvent,
    onEventDrop: handleEventDrop,
    onEventResize: handleEventResize,
    selectable: true,
    resizable: true,
    defaultView: Views.MONTH,
    views: [Views.MONTH, Views.WEEK, Views.WORK_WEEK, Views.DAY],
    popup: true,
    style: { height: 650 },
    eventPropGetter: eventStyleGetter,
    components: { event: CustomEvent },
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-sm text-muted-foreground">Drag events to reschedule</p>
        </div>
        <Button onClick={() => { setEditingEvent(null); setForm({ title: '', description: '', type: 'event' }); setShowDialog(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Event
        </Button>
      </div>

      {/* Color Legend */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground mr-1">Types:</span>
          {EVENT_TYPES.map(t => (
            <div key={t.value} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
              <span className="text-xs text-muted-foreground">{t.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div style={{ height: 650 }}>
          <BaseDnDCalendar {...calProps} />
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm"
              >
                {EVENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Event description" />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {editingEvent && (
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingEvent ? 'Update' : 'Create'}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
