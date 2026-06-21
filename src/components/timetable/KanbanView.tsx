import { Clock, MapPin, User } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { TimetableEntry, CRUDHandlers } from './types';
import { DAYS } from './types';

interface KanbanViewProps {
  entries: TimetableEntry[];
  timeSlots: string[];
  onDeleteEntry?: CRUDHandlers['onDeleteEntry'];
  compact?: boolean;
}

const subjectColors: Record<string, string> = {
  math: '#6366f1',
  science: '#22c55e',
  english: '#f59e0b',
  history: '#ef4444',
  geography: '#06b6d4',
  art: '#ec4899',
  pe: '#f97316',
  music: '#a855f7',
  default: '#6366f1',
};

function getSubjectColor(subject: string): string {
  const key = subject.toLowerCase().split(' ')[0];
  return subjectColors[key] || subjectColors.default;
}

export function KanbanView({ entries, timeSlots, onDeleteEntry, compact }: KanbanViewProps) {
  const getEntriesForDay = (day: string) =>
    entries
      .filter(e => e.day === day)
      .sort((a, b) => timeSlots.indexOf(a.time) - timeSlots.indexOf(b.time));

  return (
    <div className={cn(
      "grid gap-4",
      compact ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5" : "grid-cols-1 md:grid-cols-5"
    )}>
      {DAYS.map((day, idx) => {
        const dayEntries = getEntriesForDay(day);
        const todayIdx = new Date().getDay() - 1;
        const isToday = todayIdx === idx;

        return (
          <div key={day} className={cn(
            "rounded-xl border bg-card overflow-hidden",
            isToday && "ring-2 ring-primary/30 border-primary/20"
          )}>
            <div className={cn(
              "px-4 py-3 border-b font-semibold text-sm flex items-center justify-between",
              isToday ? "bg-primary/5 text-primary" : "bg-muted/30"
            )}>
              <span>{isToday ? 'Today' : day.slice(0, 3)}</span>
              <Badge variant={isToday ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                {dayEntries.length}
              </Badge>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
              {timeSlots.map(time => {
                const entry = dayEntries.find(e => e.time === time);
                if (!entry) {
                  return (
                    <div key={time} className="p-2 rounded-lg bg-muted/10 text-center">
                      <span className="text-[10px] text-muted-foreground/30">{time}</span>
                      <span className="block text-[10px] text-muted-foreground/20">—</span>
                    </div>
                  );
                }

                const color = entry.color || getSubjectColor(entry.subject);

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "p-2.5 rounded-lg border-l-[3px] group relative transition-shadow hover:shadow-sm",
                      compact ? "text-xs" : "text-sm"
                    )}
                    style={{
                      backgroundColor: color + '12',
                      borderLeftColor: color,
                    }}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-medium leading-tight text-xs">{entry.subject}</p>
                      {onDeleteEntry && (
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100 text-red-500 shrink-0"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" /> {entry.time}
                    </div>
                    {!compact && (
                      <>
                        {entry.teacher && (
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                            <User className="w-3 h-3" /> {entry.teacher}
                          </div>
                        )}
                        {entry.room && (
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                            <MapPin className="w-3 h-3" /> Room {entry.room}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
