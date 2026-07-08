import { useState, useEffect } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TimetableView, BulkWizard } from '../../components/timetable';
import type { TimetableEntry, DropdownOption, SubjectTeacherMap } from '../../components/timetable';
import { DAYS, DEFAULT_PERIODS } from '../../components/timetable';

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://op-csconnect-backend-production.up.railway.app/api');

async function localApiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('eduvault-token');
  const userId = localStorage.getItem('eduvault-user-id');
  const res = await fetch(`${API_BASE}/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': userId } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

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
  const [subjectTeacherMap, setSubjectTeacherMap] = useState<SubjectTeacherMap>({});
  const [showForm, setShowForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [form, setForm] = useState({ day: 'Monday', time: '09:00', subject: '', teacher: '', room: '' });

  useEffect(() => { loadAllData(); }, []);
  useEffect(() => { if (selectedClass) loadTimetable(); }, [selectedClass]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [classDetailed, ...rest] = await Promise.allSettled([
        localApiFetch('/classes/detailed'),
        api.getUsers(),
        api.getCourses(),
        api.getRooms(),
        selectedClass ? api.getTimetable(selectedClass) : Promise.resolve([]),
      ]);
      const [usersResult, coursesResult, roomsResult, timetableResult] = rest;

      // Build class list and subject→teacher map from actual class data
      let classNames: string[] = [];
      const subjectTeacher: SubjectTeacherMap = {};

      if (classDetailed.status === 'fulfilled') {
        const detailed = Array.isArray(classDetailed.value) ? classDetailed.value : [];
        classNames = detailed.map((c: any) => c.name).filter(Boolean);
        detailed.forEach((cls: any) => {
          (cls.subjects || []).forEach((subj: any) => {
            if (subj.teacherId && subj.name) {
              subjectTeacher[subj.name] = subj.teacherId;
            }
          });
        });
      }

      let usersData = usersResult.status === 'fulfilled' ? extractArray(usersResult.value) : [];
      let coursesData = coursesResult.status === 'fulfilled' ? extractArray(coursesResult.value) : [];
      let roomsData = roomsResult.status === 'fulfilled' ? extractArray(roomsResult.value) : [];
      let timetableData = timetableResult.status === 'fulfilled' ? extractArray(timetableResult.value) : [];

      if (usersData.length === 0) {
        usersData = [
          { id: 't1', name: 'Mr. Smith', email: 'smith@school.com', role: 'teacher' },
          { id: 't2', name: 'Ms. Johnson', email: 'johnson@school.com', role: 'teacher' }
        ];
      }
      if (coursesData.length === 0) {
        coursesData = [
          { id: 'c1', name: 'Mathematics', code: 'MATH' },
          { id: 'c2', name: 'Physics', code: 'PHY' },
          { id: 'c3', name: 'English', code: 'ENG' },
          { id: 'c4', name: 'Chemistry', code: 'CHEM' },
          { id: 'c5', name: 'Computer Science', code: 'CS' }
        ];
      }
      if (roomsData.length === 0) {
        roomsData = [
          { id: 'r1', name: 'Room 101' },
          { id: 'r2', name: 'Room 102' },
          { id: 'r3', name: 'Science Lab' }
        ];
      }

      // Convert teacher IDs in subjectTeacherMap to names
      const teacherIdToName: Record<string, string> = {};
      usersData.forEach((u: any) => { teacherIdToName[u.id] = u.name; });
      Object.keys(subjectTeacher).forEach(subj => {
        const id = subjectTeacher[subj];
        if (teacherIdToName[id]) subjectTeacher[subj] = teacherIdToName[id];
      });

      setSubjectTeacherMap(subjectTeacher);
      setUsers(usersData);
      setCourses(coursesData);
      setRooms(roomsData);
      setEntries(timetableData as TimetableEntry[]);

      if (classNames.length > 0) {
        setClassList(classNames);
        if (!selectedClass) setSelectedClass(classNames[0]);
      } else {
        const classes = [...new Set<string>(
          coursesData.map((c: any) => c.class || c.name?.split(' ')[0]).filter(Boolean)
        )];
        if (classes.length === 0) classes.push(...new Set<string>(timetableData.map((e: any) => e.class).filter(Boolean)));
        if (classes.length === 0) classes.push('10-A', '10-B', '11-A', '11-B', '12-A', '12-B');
        setClassList(classes);
        if (!selectedClass && classes.length > 0) setSelectedClass(classes[0]);
      }
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
    } catch (err) { console.error('[AdminTimetable] Failed to add entry:', err); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTimetableEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) { console.error('[AdminTimetable] Failed to delete entry:', err); }
  };

  const handleAssignSlot = async (day: string, time: string, data: { teacher: string; subject: string; room: string }) => {
    try {
      const newEntry = await api.createTimetableEntry({ ...data, day, time, class: selectedClass });
      setEntries(prev => [...prev, newEntry]);
    } catch (err) { console.error('[AdminTimetable] Failed to assign slot:', err); }
  };

  const handleBulkSave = async (newEntries: Omit<TimetableEntry, 'id'>[]) => {
    try {
      const created = await Promise.all(newEntries.map(e => api.createTimetableEntry(e)));
      setEntries(prev => [...prev, ...created]);
      setShowWizard(false);
    } catch (err) { console.error('[AdminTimetable] Failed to bulk save:', err); }
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
        subtitle="Manage school timetable — class teachers can also edit from their panel"
        crud={{
          onDeleteEntry: handleDelete,
          onAssignSlot: handleAssignSlot,
        }}
        teachers={teachers}
        courses={courseOpts}
        rooms={roomOpts}
        subjectTeacherMap={subjectTeacherMap}
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
            <select value={form.subject} onChange={e => {
              const val = e.target.value;
              setForm(prev => ({
                ...prev,
                subject: val,
                teacher: subjectTeacherMap[val] || prev.teacher,
              }));
            }} className="px-3 py-2 rounded-lg border bg-background">
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
