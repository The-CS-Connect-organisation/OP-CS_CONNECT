import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Check,
  X,
  DoorOpen,
  Bell,
  Users,
  BookOpen,
  UserCheck,
} from 'lucide-react';

interface GeneratedTimetableEntry {
  id: string;
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
}

interface BellSchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface CoverageRequest {
  id: string;
  class: string;
  period: string;
  teacher: string;
  substitute: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

interface SubjectChoice {
  studentId: string;
  subjects: string[];
}

interface CoTeaching {
  id: string;
  class: string;
  subject: string;
  leadTeacher: string;
  coTeacher: string;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];

export default function AdminScheduling() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timetable');

  // Timetable Generator
  const [ttClass, setTtClass] = useState('10-A');
  const [ttEntries, setTtEntries] = useState<GeneratedTimetableEntry[]>([]);
  const [generating, setGenerating] = useState(false);

  // Room Booking
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({ room: '', date: '', startTime: '', endTime: '', purpose: '', bookedBy: '' });

  // Bell Schedules
  const [bellSchedules, setBellSchedules] = useState<BellSchedule[]>([]);
  const [showBellForm, setShowBellForm] = useState(false);
  const [bellForm, setBellForm] = useState({ name: '', startTime: '', endTime: '' });

  // Coverage
  const [coverage, setCoverage] = useState<CoverageRequest[]>([]);
  const [showCoverageForm, setShowCoverageForm] = useState(false);
  const [coverageForm, setCoverageForm] = useState({ class: '', period: '', teacher: '', substitute: '', date: '' });

  // Subject Choices
  const [subjectChoices, setSubjectChoices] = useState<SubjectChoice[]>([]);

  // Co-Teaching
  const [coTeaching, setCoTeaching] = useState<CoTeaching[]>([]);
  const [showCoTeachingForm, setShowCoTeachingForm] = useState(false);
  const [coTeachingForm, setCoTeachingForm] = useState({ class: '', subject: '', leadTeacher: '', coTeacher: '' });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const raw = await Promise.allSettled([
        api.getGeneratedTimetable('10-A'),
        api.getRoomBookings(),
        api.getBellSchedules(),
        api.getCoverageRequests(),
        api.getSubjectChoices('all'),
        api.getCoTeaching(),
      ]);
      const [tt, bks, bells, cov, sc, coteach] = raw.map(r => r.status === 'fulfilled' ? r.value : []);
      setTtEntries(Array.isArray(tt) ? tt : []);
      setBookings(Array.isArray(bks) ? bks : []);
      setBellSchedules(Array.isArray(bells) ? bells : []);
      setCoverage(Array.isArray(cov) ? cov : []);
      setSubjectChoices(Array.isArray(sc) ? sc : []);
      setCoTeaching(Array.isArray(coteach) ? coteach : []);
      try { const roomData = await api.getRooms(); setRooms(Array.isArray(roomData) ? roomData : []); } catch (err) { console.error('[AdminScheduling] Failed to load rooms:', err); }
    } catch (err) { console.error('[AdminScheduling] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTimetable = async () => {
    try {
      setGenerating(true);
      const result = await api.generateTimetable({ class: ttClass });
      setTtEntries(Array.isArray(result) ? result : []);
    } catch {
      // error
    } finally {
      setGenerating(false);
    }
  };

  const handleTtCellEdit = async (entryId: string, field: string, value: string) => {
    try {
      const entry = ttEntries.find(e => e.id === entryId);
      if (!entry) return;
      await api.updateTimetableEntry(ttClass, entry.day, entry.period, { [field]: value });
      setTtEntries(prev => prev.map(e => e.id === entryId ? { ...e, [field]: value } : e));
    } catch {
      // error
    }
  };

  const handleCreateBooking = async () => {
    try {
      const created = await api.createRoomBooking(bookingForm);
      setBookings(prev => [...prev, created]);
      setShowBookingForm(false);
      setBookingForm({ room: '', date: '', startTime: '', endTime: '', purpose: '', bookedBy: '' });
    } catch {
      // error
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await api.deleteRoomBooking(id);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch {
      // error
    }
  };

  const handleCreateBell = async () => {
    try {
      const created = await api.createBellSchedule(bellForm);
      setBellSchedules(prev => [...prev, created]);
      setShowBellForm(false);
      setBellForm({ name: '', startTime: '', endTime: '' });
    } catch {
      // error
    }
  };

  const handleDeleteBell = async (id: string) => {
    try {
      await api.deleteBellSchedule(id);
      setBellSchedules(prev => prev.filter(b => b.id !== id));
    } catch {
      // error
    }
  };

  const handleCreateCoverage = async () => {
    try {
      const created = await api.createCoverageRequest(coverageForm);
      setCoverage(prev => [...prev, created]);
      setShowCoverageForm(false);
      setCoverageForm({ class: '', period: '', teacher: '', substitute: '', date: '' });
    } catch {
      // error
    }
  };

  const handleCoverageAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const updated = await api.updateCoverageRequest(id, { status: action });
      setCoverage(prev => prev.map(c => c.id === id ? updated : c));
    } catch {
      // error
    }
  };

  const handleCreateCoTeaching = async () => {
    try {
      const created = await api.createCoTeaching(coTeachingForm);
      setCoTeaching(prev => [...prev, created]);
      setShowCoTeachingForm(false);
      setCoTeachingForm({ class: '', subject: '', leadTeacher: '', coTeacher: '' });
    } catch {
      // error
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scheduling</h1>
        <p className="text-muted-foreground">Timetable, rooms, bells & coverage</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="timetable">Timetable Generator</TabsTrigger>
          <TabsTrigger value="rooms">Room Booking</TabsTrigger>
          <TabsTrigger value="bells">Bell Schedules</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="subjects">Subject Choices</TabsTrigger>
          <TabsTrigger value="coteaching">Co-Teaching</TabsTrigger>
        </TabsList>

        <TabsContent value="timetable">
          <div className="flex items-center gap-4 mb-4">
            <select value={ttClass} onChange={(e) => setTtClass(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
              {['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Button onClick={handleGenerateTimetable} disabled={generating}>
              <Calendar className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>

          {loading ? (
            <Skeleton className="h-80" />
          ) : (
            <Card className="p-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Period</th>
                    {days.map(day => <th key={day} className="text-left p-3">{day}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {periods.map(period => (
                    <tr key={period} className="border-b">
                      <td className="p-3 font-medium">{period}</td>
                      {days.map(day => {
                        const entry = ttEntries.find(e => e.day === day && e.period === period);
                        return (
                          <td key={day} className="p-2">
                            {entry ? (
                              <div className="p-2 bg-orange-50 rounded-lg text-sm space-y-1">
                                <input
                                  defaultValue={entry.subject}
                                  onBlur={(e) => handleTtCellEdit(entry.id, 'subject', e.target.value)}
                                  className="w-full bg-transparent font-medium outline-none"
                                />
                                <input
                                  defaultValue={entry.teacher}
                                  onBlur={(e) => handleTtCellEdit(entry.id, 'teacher', e.target.value)}
                                  className="w-full bg-transparent text-muted-foreground outline-none text-xs"
                                />
                                <input
                                  defaultValue={entry.room}
                                  onBlur={(e) => handleTtCellEdit(entry.id, 'room', e.target.value)}
                                  className="w-full bg-transparent text-muted-foreground outline-none text-xs"
                                />
                              </div>
                            ) : (
                              <div className="p-2 bg-accent rounded-lg text-center text-sm text-muted-foreground">—</div>
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
        </TabsContent>

        <TabsContent value="rooms">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{bookings.length} booking(s)</p>
            <Button onClick={() => setShowBookingForm(true)}>
              <Plus className="w-4 h-4 mr-2" />Book Room
            </Button>
          </div>

          {showBookingForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Room Booking</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={bookingForm.room} onChange={(e) => setBookingForm({ ...bookingForm, room: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="">Select Room</option>
                  {rooms.map(r => <option key={r.id} value={r.name}>{r.name} (Cap: {r.capacity})</option>)}
                </select>
                <input type="date" value={bookingForm.date} onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="time" value={bookingForm.startTime} onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="time" value={bookingForm.endTime} onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Purpose" value={bookingForm.purpose} onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Booked By" value={bookingForm.bookedBy} onChange={(e) => setBookingForm({ ...bookingForm, bookedBy: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateBooking}>Create</Button>
                <Button variant="outline" onClick={() => setShowBookingForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <Card key={b.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DoorOpen className="w-5 h-5 text-orange-500" />
                      <div>
                        <h4 className="font-semibold">{b.room}</h4>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{new Date(b.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{b.startTime} - {b.endTime}</span>
                          <span>•</span>
                          <span>{b.purpose}</span>
                          <span>•</span>
                          <span>{b.bookedBy}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteBooking(b.id)} className="p-2 hover:bg-red-100 rounded text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
              {bookings.length === 0 && <p className="text-muted-foreground text-center py-8">No bookings</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bells">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{bellSchedules.length} schedule(s)</p>
            <Button onClick={() => setShowBellForm(true)}>
              <Plus className="w-4 h-4 mr-2" />Add Schedule
            </Button>
          </div>

          {showBellForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Bell Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Name (e.g. Period 1)" value={bellForm.name} onChange={(e) => setBellForm({ ...bellForm, name: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="time" value={bellForm.startTime} onChange={(e) => setBellForm({ ...bellForm, startTime: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="time" value={bellForm.endTime} onChange={(e) => setBellForm({ ...bellForm, endTime: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateBell}>Create</Button>
                <Button variant="outline" onClick={() => setShowBellForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : (
            <div className="space-y-3">
              {bellSchedules.map(b => (
                <Card key={b.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-orange-500" />
                      <div>
                        <h4 className="font-semibold">{b.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{b.startTime} - {b.endTime}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteBell(b.id)} className="p-2 hover:bg-red-100 rounded text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
              {bellSchedules.length === 0 && <p className="text-muted-foreground text-center py-8">No bell schedules</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="coverage">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{coverage.length} request(s)</p>
            <Button onClick={() => setShowCoverageForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Request
            </Button>
          </div>

          {showCoverageForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Coverage Request</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Class" value={coverageForm.class} onChange={(e) => setCoverageForm({ ...coverageForm, class: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Period" value={coverageForm.period} onChange={(e) => setCoverageForm({ ...coverageForm, period: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Teacher" value={coverageForm.teacher} onChange={(e) => setCoverageForm({ ...coverageForm, teacher: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Substitute" value={coverageForm.substitute} onChange={(e) => setCoverageForm({ ...coverageForm, substitute: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="date" value={coverageForm.date} onChange={(e) => setCoverageForm({ ...coverageForm, date: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateCoverage}>Create</Button>
                <Button variant="outline" onClick={() => setShowCoverageForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : (
            <div className="space-y-3">
              {coverage.map(c => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-orange-500" />
                      <div>
                        <h4 className="font-semibold">{c.class} - {c.period}</h4>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{new Date(c.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{c.teacher} → {c.substitute}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.status === 'approved' ? 'success' : c.status === 'rejected' ? 'destructive' : 'warning'}>{c.status}</Badge>
                      {c.status === 'pending' && (
                        <>
                          <button onClick={() => handleCoverageAction(c.id, 'approved')} className="p-2 hover:bg-green-100 rounded text-green-500">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleCoverageAction(c.id, 'rejected')} className="p-2 hover:bg-red-100 rounded text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {coverage.length === 0 && <p className="text-muted-foreground text-center py-8">No coverage requests</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subjects">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-orange-500" />
            <p className="text-muted-foreground">Subject choices per student</p>
          </div>

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {subjectChoices.map(sc => (
                <Card key={sc.studentId} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Student: {sc.studentId}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <BookOpen className="w-4 h-4" />
                        {sc.subjects?.join(', ')}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {subjectChoices.length === 0 && <p className="text-muted-foreground text-center py-8">No subject choices</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="coteaching">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{coTeaching.length} co-teaching pair(s)</p>
            <Button onClick={() => setShowCoTeachingForm(true)}>
              <Plus className="w-4 h-4 mr-2" />Add Pair
            </Button>
          </div>

          {showCoTeachingForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Co-Teaching Pair</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Class" value={coTeachingForm.class} onChange={(e) => setCoTeachingForm({ ...coTeachingForm, class: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Subject" value={coTeachingForm.subject} onChange={(e) => setCoTeachingForm({ ...coTeachingForm, subject: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Lead Teacher" value={coTeachingForm.leadTeacher} onChange={(e) => setCoTeachingForm({ ...coTeachingForm, leadTeacher: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Co-Teacher" value={coTeachingForm.coTeacher} onChange={(e) => setCoTeachingForm({ ...coTeachingForm, coTeacher: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateCoTeaching}>Create</Button>
                <Button variant="outline" onClick={() => setShowCoTeachingForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {coTeaching.map(ct => (
                <Card key={ct.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{ct.class} - {ct.subject}</h4>
                      <p className="text-sm text-muted-foreground">{ct.leadTeacher} (Lead) + {ct.coTeacher} (Co)</p>
                    </div>
                  </div>
                </Card>
              ))}
              {coTeaching.length === 0 && <p className="text-muted-foreground text-center py-8">No co-teaching pairs</p>}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
