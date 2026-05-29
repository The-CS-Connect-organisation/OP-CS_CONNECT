import { useState, useEffect } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TimetableView, BulkWizard } from '../../components/timetable';
import type { TimetableEntry, DropdownOption } from '../../components/timetable';
import { DAYS, DEFAULT_PERIODS } from '../../components/timetable';

interface User { id: string; name: string; email: string; role: string; }
interface Course { id: string; name: string; code: string; }
interface Room { id: string; name: string; }

const extractArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.users)) return data.users;
  if (data && Array.isArray(data.courses)) return data.courses;
  if (data && Array.isArray(data.rooms)) return data.rooms;
  return [];
};

export default function AdminTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [classList, setClassList] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [form, setForm] = useState({ day: 'Monday', time: '09:00', subject: '', teacher: '', room: '' });

  useEffect(() => { loadAllData(); }, []);
  useEffect(() => { if (selectedClass) loadTimetable(); }, [selectedClass]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.getUsers(),
        api.getCourses(),
        api.getRooms(),
        selectedClass ? api.getTimetable(selectedClass) : Promise.resolve([]),
      ]);
      const [usersResult, coursesResult, roomsResult, timetableResult] = results;
      const usersData = usersResult.status === 'fulfilled' ? extractArray(usersResult.value) : [];
      const coursesData = coursesResult.status === 'fulfilled' ? extractArray(coursesResult.value) : [];
      const roomsData = roomsResult.status === 'fulfilled' ? extractArray(roomsResult.value) : [];
      const timetableData = timetableResult.status === 'fulfilled' ? extractArray(timetableResult.value) : [];

      setUsers(usersData);
      setCourses(coursesData);
      setRooms(roomsData);
      setEntries(timetableData as TimetableEntry[]);

      const classes = [...new Set<string>(
        coursesData.map((c: any) => c.class || c.name?.split(' ')[0]).filter(Boolean)
      )];
      if (classes.length === 0) classes.push(...new Set<string>(timetableData.map((e: any) => e.class).filter(Boolean)));
      if (classes.length === 0) classes.push('10-A', '10-B', '11-A', '11-B', '12-A', '12-B');
      setClassList(classes);
      if (!selectedClass && classes.length > 0) setSelectedClass(classes[0]);
    } catch {
      setClassList(['10-A', '10-B', '11-A', '11-B', '12-A', '12-B']);
      if (!selectedClass) setSelectedClass('10-A');
    } finally { setLoading(false); }
  };

  const loadTimetable = async () => {
    setLoading(true);
    try { setEntries(extractArray(await api.getTimetable(selectedClass)) as TimetableEntry[]); }
    catch { setEntries([]); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!form.subject || !form.teacher) return;
    try {
      const newEntry = await api.createTimetableEntry({ ...form, class: selectedClass });
      setEntries(prev => [...prev, newEntry]);
      setShowForm(false);
      setForm({ day: 'Monday', time: '09:00', subject: '', teacher: '', room: '' });
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTimetableEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch {}
  };

  const handleAssignSlot = async (day: string, time: string, data: { teacher: string; subject: string; room: string }) => {
    try {
      const newEntry = await api.createTimetableEntry({ ...data, day, time, class: selectedClass });
      setEntries(prev => [...prev, newEntry]);
    } catch {}
  };

  const handleBulkSave = async (newEntries: Omit<TimetableEntry, 'id'>[]) => {
    try {
      const created = await Promise.all(newEntries.map(e => api.createTimetableEntry(e)));
      setEntries(prev => [...prev, ...created]);
      setShowWizard(false);
    } catch {}
  };

  const teachers: DropdownOption[] = users.filter(u => u.role?.toLowerCase() === 'teacher').map(t => ({ id: t.id, name: t.name }));
  const courseOpts: DropdownOption[] = courses.map(c => ({ id: c.id, name: c.name }));
  const roomOpts: DropdownOption[] = rooms.map(r => ({ id: r.id, name: r.name }));

  return (
    <div className="p-6 space-y-6">
      {showWizard && (
        <BulkWizard
          classList={classList}
          teachers={teachers}
          courses={courseOpts}
          rooms={roomOpts}
          onSave={handleBulkSave}
          onClose={() => setShowWizard(false)}
        />
      )}

      <TimetableView
        entries={entries}
        loading={loading}
        classList={classList}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        title="Timetable Manager"
        subtitle="Manage school timetable"
        crud={{
          onDeleteEntry: handleDelete,
          onAssignSlot: handleAssignSlot,
        }}
        teachers={teachers}
        courses={courseOpts}
        rooms={roomOpts}
      />

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Add Timetable Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
              {DEFAULT_PERIODS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
              <option value="">Select subject</option>
              {courseOpts.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
              <option value="">Select teacher</option>
              {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            <select value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
              <option value="">Select room</option>
              {roomOpts.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAdd}>Add</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        <Button onClick={() => setShowForm(prev => !prev)}>
          <Plus className="w-4 h-4 mr-2" />{showForm ? 'Close Form' : 'Add Entry'}
        </Button>
        <Button variant="outline" onClick={() => setShowWizard(true)}>
          <Sparkles className="w-4 h-4 mr-2" />Generate
        </Button>
      </div>
    </div>
  );
}
