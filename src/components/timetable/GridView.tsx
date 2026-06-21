import { useState } from 'react';
import { Clock, X, Check, Trash2, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { TimetableEntry, DropdownOption, CRUDHandlers } from './types';
import { DAYS } from './types';

interface GridViewProps {
  entries: TimetableEntry[];
  timeSlots: string[];
  onAssignSlot?: CRUDHandlers['onAssignSlot'];
  onDeleteEntry?: CRUDHandlers['onDeleteEntry'];
  teachers?: DropdownOption[];
  courses?: DropdownOption[];
  rooms?: DropdownOption[];
  compact?: boolean;
}

export function GridView({ entries, timeSlots, onAssignSlot, onDeleteEntry, teachers, courses, rooms, compact }: GridViewProps) {
  const [assignSlot, setAssignSlot] = useState<{ day: string; time: string } | null>(null);
  const [assignTeacher, setAssignTeacher] = useState('');
  const [assignSubject, setAssignSubject] = useState('');
  const [assignRoom, setAssignRoom] = useState('');

  const getEntry = (day: string, time: string) =>
    entries.find(e => e.day === day && e.time === time);

  const handleAssign = () => {
    if (!assignSlot || !assignTeacher || !assignSubject) return;
    onAssignSlot?.(assignSlot.day, assignSlot.time, {
      teacher: assignTeacher,
      subject: assignSubject,
      room: assignRoom,
    });
    setAssignSlot(null);
    setAssignTeacher('');
    setAssignSubject('');
    setAssignRoom('');
  };

  const cancelAssign = () => {
    setAssignSlot(null);
    setAssignTeacher('');
    setAssignSubject('');
    setAssignRoom('');
  };

  const hasCRUD = !!(onAssignSlot || onDeleteEntry);

  return (
    <>
    <div className="overflow-x-auto hidden md:block">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 pr-4 w-24 sticky left-0 bg-card z-10">
              Time
            </th>
            {DAYS.map(day => (
              <th key={day} className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-3 min-w-[130px]">
                {compact ? day.slice(0, 3) : day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(time => (
            <tr key={time} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
              <td className="py-3 pr-4 text-sm text-muted-foreground whitespace-nowrap sticky left-0 bg-card z-10">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  {time}
                </span>
              </td>
              {DAYS.map(day => {
                const entry = getEntry(day, time);
                const isAssigning = assignSlot?.day === day && assignSlot?.time === time;

                return (
                  <td key={day} className="p-1.5">
                    {isAssigning ? (
                      <div className="p-2 bg-background border rounded-lg space-y-1.5 min-w-[160px] shadow-sm">
                        <select
                          value={assignSubject}
                          onChange={e => setAssignSubject(e.target.value)}
                          className="w-full px-2 py-1 text-xs rounded border bg-background"
                        >
                          <option value="">Subject</option>
                          {courses?.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                        <select
                          value={assignTeacher}
                          onChange={e => setAssignTeacher(e.target.value)}
                          className="w-full px-2 py-1 text-xs rounded border bg-background"
                        >
                          <option value="">Teacher</option>
                          {teachers?.map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </select>
                        <select
                          value={assignRoom}
                          onChange={e => setAssignRoom(e.target.value)}
                          className="w-full px-2 py-1 text-xs rounded border bg-background"
                        >
                          <option value="">Room</option>
                          {rooms?.map(r => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                        <div className="flex gap-1 pt-1">
                          <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleAssign} disabled={!assignTeacher || !assignSubject}>
                            <Check className="w-3 h-3 mr-1" /> Assign
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={cancelAssign}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : entry ? (
                      <div
                        className={cn(
                          "p-2 rounded-lg border-l-[3px] group relative",
                          compact ? "text-xs" : "text-sm"
                        )}
                        style={{
                          backgroundColor: (entry.color || '#f97316') + '15',
                          borderLeftColor: entry.color || '#f97316',
                        }}
                      >
                        <p className="font-medium leading-tight">{entry.subject}</p>
                        {!compact && (
                          <>
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.teacher}</p>
                            <p className="text-xs text-muted-foreground">{entry.room && `Room ${entry.room}`}</p>
                          </>
                        )}
                        {onDeleteEntry && (
                          <button
                            onClick={() => onDeleteEntry(entry.id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100 text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : hasCRUD ? (
                      <button
                        onClick={() => { setAssignSlot({ day, time }); setAssignTeacher(''); setAssignSubject(''); setAssignRoom(''); }}
                        className="w-full p-2 bg-accent/40 rounded-lg text-center text-sm text-muted-foreground hover:bg-accent/60 transition-colors cursor-pointer border border-dashed border-border/50"
                      >
                        <span className="block text-xs">Free</span>
                        <span className="block text-[10px] mt-0.5 text-blue-500">+ Assign</span>
                      </button>
                    ) : (
                      <div className="p-2 rounded-lg text-center">
                        <span className="text-xs text-muted-foreground/30">—</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="md:hidden space-y-4">
      {DAYS.map(day => (
        <div key={day}>
          <h3 className="font-semibold text-lg mb-2">{day}</h3>
          <div className="space-y-2">
            {timeSlots.map(time => {
              const entry = getEntry(day, time);
              if (!entry) return null;
              return (
                <div key={`${day}-${time}`} className="p-3 rounded-lg" style={{ backgroundColor: (entry.color || '#f97316') + '15' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{entry.subject}</span>
                    <span className="text-sm text-muted-foreground">{time}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span>{entry.teacher}</span>
                    {entry.room && <span> &middot; Room {entry.room}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
    </>
  );
}