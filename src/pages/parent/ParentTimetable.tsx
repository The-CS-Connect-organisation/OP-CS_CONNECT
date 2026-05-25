import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Calendar, Clock } from 'lucide-react';

interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

export default function ParentTimetable() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState('child1');

  useEffect(() => {
    loadTimetable();
  }, [selectedChild]);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const data = await api.getChildTimetable(selectedChild);
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timetable</h1>
          <p className="text-muted-foreground">Class schedule</p>
        </div>
        <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          <option value="child1">Child 1</option>
          <option value="child2">Child 2</option>
        </select>
      </div>

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
