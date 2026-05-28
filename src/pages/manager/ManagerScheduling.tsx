import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Calendar, Clock, BookOpen, Plus, Edit, Trash2, Check, X, DoorOpen, Users } from 'lucide-react';

interface TimetableEntry {
  day: string;
  period: number;
  subject: string;
  teacher: string;
  room: string;
}

interface RoomBooking {
  id: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  bookedBy: string;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  type: string;
}

interface BellSchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  periods: { period: number; start: string; end: string }[];
}

interface CoverageRequest {
  id: string;
  className: string;
  subject: string;
  date: string;
  period: string;
  teacher: string;
  substitute: string;
  status: string;
  reason: string;
}

export default function ManagerScheduling() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timetable');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scheduling</h1>
        <p className="text-muted-foreground">Timetable, rooms, bells, and coverage</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="timetable"><Calendar className="w-4 h-4 mr-2" />Timetable Generator</TabsTrigger>
          <TabsTrigger value="rooms"><DoorOpen className="w-4 h-4 mr-2" />Room Booking</TabsTrigger>
          <TabsTrigger value="bells"><Clock className="w-4 h-4 mr-2" />Bell Schedules</TabsTrigger>
          <TabsTrigger value="coverage"><Users className="w-4 h-4 mr-2" />Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="timetable"><TimetableTab days={days} /></TabsContent>
        <TabsContent value="rooms"><RoomBookingTab /></TabsContent>
        <TabsContent value="bells"><BellSchedulesTab /></TabsContent>
        <TabsContent value="coverage"><CoverageTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function TimetableTab({ days }: { days: string[] }) {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [generating, setGenerating] = useState(false);
  const [editingCell, setEditingCell] = useState<{ day: string; period: number } | null>(null);
  const [editForm, setEditForm] = useState({ subject: '', teacher: '', room: '' });
  const [subjects, setSubjects] = useState<string[]>(['Math', 'Science', 'English', 'History', 'Geography', 'Art', 'Physical Education', 'Computer Science']);

  const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await api.getStudents();
      if (Array.isArray(data)) {
        const unique = [...new Set(data.map((s: any) => s.class).filter(Boolean))] as string[];
        setClasses(unique);
        if (unique.length > 0) setSelectedClass(unique[0]);
      }
    } catch { }
  };

  useEffect(() => {
    if (selectedClass) loadTimetable();
  }, [selectedClass]);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const data = await api.getGeneratedTimetable(selectedClass);
      if (Array.isArray(data)) setEntries(data);
      else if (data?.schedule) setEntries(data.schedule);
      else setEntries([]);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const data = await api.generateTimetable({ className: selectedClass, subjects });
      if (data?.schedule) setEntries(data.schedule);
      else if (Array.isArray(data)) setEntries(data);
    } catch { } finally {
      setGenerating(false);
    }
  };

  const handleEditCell = (day: string, period: number) => {
    const existing = entries.find(e => e.day === day && e.period === period);
    setEditForm({
      subject: existing?.subject || '',
      teacher: existing?.teacher || '',
      room: existing?.room || '',
    });
    setEditingCell({ day, period });
  };

  const handleSaveCell = async () => {
    if (!editingCell) return;
    try {
      await api.updateTimetableEntry(selectedClass, editingCell.day, editingCell.period, editForm);
      setEntries(prev => {
        const filtered = prev.filter(e => !(e.day === editingCell.day && e.period === editingCell.period));
        return [...filtered, { day: editingCell.day, period: editingCell.period, ...editForm }];
      });
      setEditingCell(null);
    } catch { }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button onClick={handleGenerate} disabled={generating}>
          <Calendar className="w-4 h-4 mr-2" />{generating ? 'Generating...' : 'Generate Timetable'}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10" />)}</div>
      ) : (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Period</th>
                <th className="text-left p-3">Time</th>
                {days.map(day => <th key={day} className="text-left p-3">{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {times.map((time, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-3 font-medium">{idx + 1}</td>
                  <td className="p-3 text-sm text-muted-foreground"><Clock className="w-3 h-3 inline mr-1" />{time}</td>
                  {days.map(day => {
                    const entry = entries.find(e => e.day === day && e.period === idx);
                    const isEditing = editingCell?.day === day && editingCell?.period === idx;
                    return (
                      <td key={day} className="p-2">
                        {isEditing ? (
                          <div className="space-y-1 min-w-[140px]">
                            <input type="text" placeholder="Subject" value={editForm.subject} onChange={(e) => setEditForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-2 py-1 text-xs rounded border bg-background" />
                            <input type="text" placeholder="Teacher" value={editForm.teacher} onChange={(e) => setEditForm(f => ({ ...f, teacher: e.target.value }))} className="w-full px-2 py-1 text-xs rounded border bg-background" />
                            <input type="text" placeholder="Room" value={editForm.room} onChange={(e) => setEditForm(f => ({ ...f, room: e.target.value }))} className="w-full px-2 py-1 text-xs rounded border bg-background" />
                            <div className="flex gap-1">
                              <button onClick={handleSaveCell} className="p-1 bg-green-100 text-green-700 rounded"><Check className="w-3 h-3" /></button>
                              <button onClick={() => setEditingCell(null)} className="p-1 bg-red-100 text-red-700 rounded"><X className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ) : entry ? (
                          <div onClick={() => handleEditCell(day, idx)} className="p-1.5 bg-orange-50 rounded cursor-pointer hover:bg-orange-100">
                            <p className="font-medium text-xs">{entry.subject}</p>
                            <p className="text-xs text-muted-foreground">{entry.teacher}</p>
                            <p className="text-xs text-muted-foreground">{entry.room}</p>
                          </div>
                        ) : (
                          <div onClick={() => handleEditCell(day, idx)} className="p-1.5 bg-accent rounded text-center text-xs text-muted-foreground cursor-pointer hover:bg-accent/70">+ Add</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function RoomBookingTab() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ room: '', date: '', startTime: '', endTime: '', purpose: '', bookedBy: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [b, r] = await Promise.all([api.getRoomBookings(), api.getRooms()]);
      setBookings(Array.isArray(b) ? b : []);
      setRooms(Array.isArray(r) ? r : []);
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.room || !form.date) return;
    try {
      const data = await api.createRoomBooking(form);
      setBookings(prev => [...prev, data]);
      setForm({ room: '', date: '', startTime: '', endTime: '', purpose: '', bookedBy: '' });
      setShowForm(false);
    } catch { }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteRoomBooking(id);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch { }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{bookings.length} booking(s)</p>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />New Booking</Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Create Room Booking</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={form.room} onChange={(e) => setForm(f => ({ ...f, room: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background">
              <option value="">Select Room</option>
              {rooms.map(r => <option key={r.id} value={r.name}>{r.name} ({r.capacity} cap)</option>)}
            </select>
            <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="time" value={form.startTime} onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="time" value={form.endTime} onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Purpose" value={form.purpose} onChange={(e) => setForm(f => ({ ...f, purpose: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Booked by" value={form.bookedBy} onChange={(e) => setForm(f => ({ ...f, bookedBy: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setForm({ room: '', date: '', startTime: '', endTime: '', purpose: '', bookedBy: '' }); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <Card key={b.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <DoorOpen className="w-5 h-5 text-orange-500" />
                  <div>
                    <h4 className="font-semibold">{b.room}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{new Date(b.date).toLocaleDateString()}</span>
                      <span>{b.startTime} - {b.endTime}</span>
                      <span>{b.purpose}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{b.bookedBy}</Badge>
                  <button onClick={() => handleDelete(b.id)} className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
          {bookings.length === 0 && <p className="text-center text-muted-foreground py-8">No bookings yet</p>}
        </div>
      )}
    </div>
  );
}

function BellSchedulesTab() {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<BellSchedule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BellSchedule | null>(null);
  const [form, setForm] = useState({ name: '', startTime: '', endTime: '', periods: '' });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await api.getBellSchedules();
      setSchedules(Array.isArray(data) ? data : []);
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) return;
    try {
      const periods = form.periods.split('\n').filter(Boolean).map((line, i) => {
        const [start, end] = line.split('-').map(s => s.trim());
        return { period: i + 1, start, end };
      });
      const payload = { ...form, periods };
      if (editing) {
        await api.updateBellSchedule(editing.id, payload);
        setSchedules(prev => prev.map(s => s.id === editing.id ? { ...s, ...payload } : s));
      } else {
        const data = await api.createBellSchedule(payload);
        setSchedules(prev => [...prev, data]);
      }
      setForm({ name: '', startTime: '', endTime: '', periods: '' });
      setShowForm(false);
      setEditing(null);
    } catch { }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBellSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch { }
  };

  const handleEdit = (sched: BellSchedule) => {
    setEditing(sched);
    setForm({
      name: sched.name,
      startTime: sched.startTime,
      endTime: sched.endTime,
      periods: sched.periods.map(p => `${p.start}-${p.end}`).join('\n'),
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{schedules.length} schedule(s)</p>
        <Button onClick={() => { setEditing(null); setForm({ name: '', startTime: '', endTime: '', periods: '' }); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />Add Schedule</Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">{editing ? 'Edit' : 'Create'} Bell Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Schedule name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="time" value={form.startTime} onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="time" value={form.endTime} onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
          </div>
          <div className="mt-4">
            <label className="text-sm text-muted-foreground mb-1 block">Periods (one per line: HH:MM-HH:MM)</label>
            <textarea value={form.periods} onChange={(e) => setForm(f => ({ ...f, periods: e.target.value }))} className="w-full px-3 py-2 rounded-lg border bg-background min-h-[100px]" placeholder="08:00-08:45&#10;08:45-09:30" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); setForm({ name: '', startTime: '', endTime: '', periods: '' }); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map(s => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{s.name}</h4>
                  <p className="text-sm text-muted-foreground">{s.startTime} - {s.endTime}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(s)} className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-1">
                {s.periods.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">P{p.period}</Badge>
                    <span>{p.start} - {p.end}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CoverageTab() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<CoverageRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ className: '', subject: '', date: '', period: '', teacher: '', substitute: '', reason: '' });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getCoverageRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.className || !form.date) return;
    try {
      const data = await api.createCoverageRequest(form);
      setRequests(prev => [...prev, data]);
      setForm({ className: '', subject: '', date: '', period: '', teacher: '', substitute: '', reason: '' });
      setShowForm(false);
    } catch { }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.updateCoverageRequest(id, { status });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch { }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{requests.length} request(s)</p>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />New Request</Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Create Coverage Request</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Class" value={form.className} onChange={(e) => setForm(f => ({ ...f, className: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Subject" value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Period" value={form.period} onChange={(e) => setForm(f => ({ ...f, period: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Teacher" value={form.teacher} onChange={(e) => setForm(f => ({ ...f, teacher: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Substitute" value={form.substitute} onChange={(e) => setForm(f => ({ ...f, substitute: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Reason" value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background md:col-span-3" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setForm({ className: '', subject: '', date: '', period: '', teacher: '', substitute: '', reason: '' }); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{r.subject}</h4>
                    <Badge variant="secondary">{r.className}</Badge>
                    {getStatusBadge(r.status)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{new Date(r.date).toLocaleDateString()}</span>
                    <span>Period: {r.period}</span>
                    <span>Teacher: {r.teacher}</span>
                    {r.substitute && <span>Sub: {r.substitute}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(r.id, 'approved')} className="p-2 bg-green-100 text-green-700 rounded"><Check className="w-4 h-4" /></button>
                      <button onClick={() => handleStatusUpdate(r.id, 'rejected')} className="p-2 bg-red-100 text-red-700 rounded"><X className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {requests.length === 0 && <p className="text-center text-muted-foreground py-8">No coverage requests</p>}
        </div>
      )}
    </div>
  );
}
