import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Clock, Plus } from 'lucide-react';

interface TimetableEntry {
  id: string;
  class: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

const mockEntries: TimetableEntry[] = [
  { id: '1', class: '10-A', day: 'Monday', time: '09:00', subject: 'Math', teacher: 'Mr. Smith', room: '101' },
  { id: '2', class: '10-A', day: 'Monday', time: '10:00', subject: 'Science', teacher: 'Ms. Johnson', room: '102' },
  { id: '3', class: '10-A', day: 'Monday', time: '11:00', subject: 'English', teacher: 'Mrs. Davis', room: '103' },
];

export default function ManagerTimetable() {
  const [entries] = useState<TimetableEntry[]>(mockEntries);
  const [selectedClass, setSelectedClass] = useState('10-A');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timetable</h1>
          <p className="text-muted-foreground">School timetable</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
            {['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button><Plus className="w-4 h-4 mr-2" />Add Entry</Button>
        </div>
      </div>

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
                <td className="p-3 font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" />{time}</td>
                {days.map(day => {
                  const entry = entries.find(e => e.day === day && e.time === time && e.class === selectedClass);
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
    </div>
  );
}
