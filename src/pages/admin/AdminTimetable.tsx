import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Calendar, Plus, Edit, Trash2, Clock } from 'lucide-react';

interface TimetableEntry {
  id: string;
  class: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

export default function AdminTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ day: 'Monday', time: '09:00', subject: 'Math', teacher: '', room: '' });

  useEffect(() => {
    loadTimetable();
  }, [selectedClass]);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const data = await api.getTimetable(selectedClass);
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const newEntry = await api.createTimetableEntry({ ...form, class: selectedClass });
      setEntries(prev => [...prev, newEntry]);
      setShowForm(false);
    } catch {
      // error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTimetableEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch {
      // error
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timetable Manager</h1>
          <p className="text-muted-foreground">Manage school timetable</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
            {['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(c => <option key={c} value={c}>{c}</option>)}
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
            <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
              {times.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="text" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Teacher" value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAdd}>Add</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <Skeleton className="h-96" />
      ) : (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Time</th>
                {days.map(day => <th key={day} className="text-left p-3">{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {times.map(time => (
                <tr key={time} className="border-b">
                  <td className="p-3 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    {time}
                  </td>
                  {days.map(day => {
                    const entry = entries.find(e => e.day === day && e.time === time);
                    return (
                      <td key={day} className="p-3">
                        {entry ? (
                          <div className="p-2 bg-orange-50 rounded-lg">
                            <p className="font-medium text-sm">{entry.subject}</p>
                            <p className="text-xs text-muted-foreground">{entry.teacher}</p>
                            <p className="text-xs text-muted-foreground">{entry.room}</p>
                            <button onClick={() => handleDelete(entry.id)} className="mt-1 text-xs text-red-500 hover:underline">Remove</button>
                          </div>
                        ) : (
                          <div className="p-2 bg-accent rounded-lg text-center text-sm text-muted-foreground">Free</div>
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
