import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Calendar, Plus, Edit, Trash2, Clock, X, Check } from 'lucide-react';

interface TimetableEntry {
  id: string;
  class: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Room {
  id: string;
  name: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

export default function AdminTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [classList, setClassList] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [assignSlot, setAssignSlot] = useState<{ day: string; time: string } | null>(null);
  const [assignTeacher, setAssignTeacher] = useState('');
  const [assignSubject, setAssignSubject] = useState('');
  const [assignRoom, setAssignRoom] = useState('');
  const [form, setForm] = useState({ day: 'Monday', time: '09:00', subject: '', teacher: '', room: '' });

  const extractArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.users)) return data.users;
    if (data && Array.isArray(data.courses)) return data.courses;
    if (data && Array.isArray(data.rooms)) return data.rooms;
    return [];
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadTimetable();
    }
  }, [selectedClass]);

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
      setEntries(timetableData);

      const classes = [...new Set<string>(
        coursesData
          .map((c: any) => c.class || c.name?.split(' ')[0])
          .filter(Boolean)
      )];
      if (classes.length === 0) {
        const fromEntries = [...new Set<string>(timetableData.map((e: any) => e.class).filter(Boolean))];
        classes.push(...fromEntries);
      }
      if (classes.length === 0) {
        classes.push('10-A', '10-B', '11-A', '11-B', '12-A', '12-B');
      }
      setClassList(classes);
      if (!selectedClass && classes.length > 0) {
        setSelectedClass(classes[0]);
      }
    } catch {
      setClassList(['10-A', '10-B', '11-A', '11-B', '12-A', '12-B']);
      if (!selectedClass) setSelectedClass('10-A');
    } finally {
      setLoading(false);
    }
  };

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const data = await api.getTimetable(selectedClass);
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.subject || !form.teacher) return;
    try {
      const newEntry = await api.createTimetableEntry({ ...form, class: selectedClass });
      setEntries(prev => [...prev, newEntry]);
      setShowForm(false);
      setForm({ day: 'Monday', time: '09:00', subject: '', teacher: '', room: '' });
    } catch {
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTimetableEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch {
    }
  };

  const handleAssignTeacher = async () => {
    if (!assignSlot || !assignTeacher || !assignSubject) return;
    try {
      const newEntry = await api.createTimetableEntry({
        class: selectedClass,
        day: assignSlot.day,
        time: assignSlot.time,
        subject: assignSubject,
        teacher: assignTeacher,
        room: assignRoom,
      });
      setEntries(prev => [...prev, newEntry]);
      setAssignSlot(null);
      setAssignTeacher('');
      setAssignSubject('');
      setAssignRoom('');
    } catch {
    }
  };

  const cancelAssign = () => {
    setAssignSlot(null);
    setAssignTeacher('');
    setAssignSubject('');
    setAssignRoom('');
  };

  const teachers = users.filter(u => u.role?.toLowerCase() === 'teacher');
  const getTeacherName = (id: string) => {
    const user = users.find(u => u.id === id);
    return user ? user.name : id;
  };
  const getCourseName = (id: string) => {
    const course = courses.find(c => c.id === id || c.name === id);
    return course ? course.name : id;
  };
  const getRoomName = (id: string) => {
    const room = rooms.find(r => r.id === id || r.name === id);
    return room ? room.name : id;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timetable Manager</h1>
          <p className="text-muted-foreground">Manage school timetable</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-4 py-2 rounded-lg border bg-background"
          >
            {classList.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Add Timetable Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={form.day}
              onChange={e => setForm({ ...form, day: e.target.value })}
              className="px-3 py-2 rounded-lg border bg-background"
            >
              {DAYS.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={form.time}
              onChange={e => setForm({ ...form, time: e.target.value })}
              className="px-3 py-2 rounded-lg border bg-background"
            >
              {PERIODS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="px-3 py-2 rounded-lg border bg-background"
            >
              <option value="">Select subject</option>
              {courses.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={form.teacher}
              onChange={e => setForm({ ...form, teacher: e.target.value })}
              className="px-3 py-2 rounded-lg border bg-background"
            >
              <option value="">Select teacher</option>
              {teachers.map(t => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              value={form.room}
              onChange={e => setForm({ ...form, room: e.target.value })}
              className="px-3 py-2 rounded-lg border bg-background"
            >
              <option value="">Select room</option>
              {rooms.map(r => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAdd}>Add</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <Skeleton className="h-96" />
      ) : entries.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No timetable data</p>
          <p className="text-sm">Add entries or assign teachers to free periods</p>
        </Card>
      ) : (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Time</th>
                {DAYS.map(day => (
                  <th key={day} className="text-left p-3">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(time => (
                <tr key={time} className="border-b">
                  <td className="p-3 font-medium flex items-center gap-2 whitespace-nowrap">
                    <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                    {time}
                  </td>
                  {DAYS.map(day => {
                    const entry = entries.find(e => e.day === day && e.time === time);
                    const isAssigning = assignSlot?.day === day && assignSlot?.time === time;
                    return (
                      <td key={day} className="p-3">
                        {isAssigning ? (
                          <div className="p-2 bg-background border rounded-lg space-y-2 min-w-[180px]">
                            <select
                              value={assignTeacher}
                              onChange={e => setAssignTeacher(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border bg-background"
                            >
                              <option value="">Select teacher</option>
                              {teachers.map(t => (
                                <option key={t.id} value={t.name}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                            <select
                              value={assignSubject}
                              onChange={e => setAssignSubject(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border bg-background"
                            >
                              <option value="">Select subject</option>
                              {courses.map(c => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <select
                              value={assignRoom}
                              onChange={e => setAssignRoom(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border bg-background"
                            >
                              <option value="">Room</option>
                              {rooms.map(r => (
                                <option key={r.id} value={r.name}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="flex-1 h-7 text-xs"
                                onClick={handleAssignTeacher}
                                disabled={!assignTeacher || !assignSubject}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Assign
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={cancelAssign}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : entry ? (
                          <div className="p-2 bg-orange-50 rounded-lg">
                            <p className="font-medium text-sm">
                              {getCourseName(entry.subject)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getTeacherName(entry.teacher)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getRoomName(entry.room)}
                            </p>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="mt-1 flex items-center gap-1 text-xs text-red-500 hover:underline"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAssignSlot({ day, time });
                              setAssignTeacher('');
                              setAssignSubject('');
                              setAssignRoom('');
                            }}
                            className="w-full p-2 bg-accent rounded-lg text-center text-sm text-muted-foreground hover:bg-accent/80 transition-colors cursor-pointer"
                          >
                            <span className="block">Free</span>
                            <span className="block text-xs mt-0.5 text-blue-500">Click to assign</span>
                          </button>
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
