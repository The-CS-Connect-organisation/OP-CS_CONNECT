import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save, AlertTriangle, Sparkles, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { TimetableEntry, DropdownOption } from './types';
import { DAYS, DEFAULT_PERIODS } from './types';

interface BulkWizardProps {
  classList: string[];
  teachers: DropdownOption[];
  courses: DropdownOption[];
  rooms: DropdownOption[];
  onSave: (entries: Omit<TimetableEntry, 'id'>[]) => void;
  onClose: () => void;
}

type SlotData = { subject: string; teacher: string; room: string };

const steps = [
  { id: 'class', label: 'Class' },
  { id: 'configure', label: 'Configure' },
  { id: 'fill', label: 'Fill Grid' },
  { id: 'review', label: 'Review' },
];

export function BulkWizard({ classList, teachers, courses, rooms, onSave, onClose }: BulkWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedClass, setSelectedClass] = useState(classList[0] || '');
  const [days, setDays] = useState(DAYS);
  const [timeSlots, setTimeSlots] = useState(DEFAULT_PERIODS);
  const [grid, setGrid] = useState<Record<string, SlotData>>({});
  const [saving, setSaving] = useState(false);

  const getKey = (day: string, time: string) => `${day}|${time}`;

  const setSlot = (day: string, time: string, data: Partial<SlotData>) => {
    const key = getKey(day, time);
    setGrid(prev => ({
      ...prev,
      [key]: { ...prev[key] || { subject: '', teacher: '', room: '' }, ...data },
    }));
  };

  const filledSlots = Object.values(grid).filter(s => s.subject && s.teacher).length;
  const totalSlots = days.length * timeSlots.length;

  // Conflict detection
  const conflicts: string[] = [];
  const teacherSlotMap = new Map<string, string[]>();
  const subjectSlotMap = new Map<string, string[]>();

  Object.entries(grid).forEach(([key, slot]) => {
    if (!slot.subject || !slot.teacher) return;
    const existingTeacher = teacherSlotMap.get(slot.teacher) || [];
    const existingSubject = subjectSlotMap.get(slot.subject) || [];
    teacherSlotMap.set(slot.teacher, [...existingTeacher, key]);
    subjectSlotMap.set(slot.subject, [...existingSubject, key]);
  });

  teacherSlotMap.forEach((slots, teacher) => {
    if (slots.length > 1) {
      conflicts.push(`${teacher} assigned to ${slots.length} slots (${slots.join(', ')})`);
    }
  });

  const generateEntries = (): Omit<TimetableEntry, 'id'>[] => {
    const entries: Omit<TimetableEntry, 'id'>[] = [];
    Object.entries(grid).forEach(([key, slot]) => {
      if (!slot.subject || !slot.teacher) return;
      const [day, time] = key.split('|');
      entries.push({
        class: selectedClass,
        day,
        time,
        subject: slot.subject,
        teacher: slot.teacher,
        room: slot.room,
      });
    });
    return entries;
  };

  const handleSave = async () => {
    setSaving(true);
    onSave(generateEntries());
    setSaving(false);
  };

  const canProceed = () => {
    if (step === 0) return !!selectedClass;
    if (step === 1) return timeSlots.length > 0;
    if (step === 2) return filledSlots > 0;
    return true;
  };

  return (
    <Card className="p-6 space-y-6" glow>
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Bulk Timetable Generator</h2>
        </div>
        <Badge variant="secondary" className="text-xs">
          {filledSlots}/{totalSlots} slots filled
        </Badge>
      </div>

      <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
        {steps.map((s, i) => (
          <div key={s.id} className={cn(
            "flex-1 text-center py-2 px-3 rounded-md text-xs font-medium transition-all",
            i === step ? "bg-background text-foreground shadow-sm" : i < step ? "text-primary" : "text-muted-foreground"
          )}>
            {i < step ? '✓' : i + 1}. {s.label}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 0: Select Class */}
          {step === 0 && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Choose the class to generate a timetable for</p>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-background text-sm"
              >
                {classList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Step 1: Configure days & periods */}
          {step === 1 && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Set the days and time periods for this timetable</p>
              <div>
                <label className="text-sm font-medium mb-2 block">Days of the week</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                        days.includes(day)
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-background border-border text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Time periods</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_PERIODS.map(time => (
                    <button
                      key={time}
                      onClick={() => {
                        setTimeSlots(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time].sort());
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                        timeSlots.includes(time)
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-background border-border text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Fill Grid */}
          {step === 2 && (
            <div className="space-y-3 py-2 max-h-[400px] overflow-y-auto">
              <p className="text-sm text-muted-foreground">Assign subjects, teachers, and rooms to each slot</p>
              {days.map(day => (
                <div key={day}>
                  <h4 className="text-sm font-semibold mb-2 text-primary">{day}</h4>
                  <div className="space-y-2 ml-2">
                    {timeSlots.map(time => {
                      const key = getKey(day, time);
                      const slot = grid[key];
                      return (
                        <div key={key} className="flex items-center gap-2 bg-muted/20 rounded-lg p-2">
                          <span className="text-xs font-medium text-muted-foreground w-12 shrink-0">{time}</span>
                          <select
                            value={slot?.subject || ''}
                            onChange={e => setSlot(day, time, { subject: e.target.value })}
                            className="flex-1 px-2 py-1.5 text-xs rounded border bg-background"
                          >
                            <option value="">Subject</option>
                            {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                          <select
                            value={slot?.teacher || ''}
                            onChange={e => setSlot(day, time, { teacher: e.target.value })}
                            className="flex-1 px-2 py-1.5 text-xs rounded border bg-background"
                          >
                            <option value="">Teacher</option>
                            {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                          </select>
                          <select
                            value={slot?.room || ''}
                            onChange={e => setSlot(day, time, { room: e.target.value })}
                            className="w-24 px-2 py-1.5 text-xs rounded border bg-background"
                          >
                            <option value="">Room</option>
                            {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Review + Conflicts */}
          {step === 3 && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">Review the generated timetable before saving</p>

              {/* Conflicts */}
              {conflicts.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <div className="flex items-center gap-2 text-amber-500 font-medium text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''} Detected
                  </div>
                  {conflicts.map((c, i) => (
                    <p key={i} className="text-xs text-amber-600/80 ml-6">{c}</p>
                  ))}
                </div>
              )}

              {conflicts.length === 0 && filledSlots > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  No conflicts detected — all good!
                </div>
              )}

              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-2xl font-bold text-primary">{filledSlots}</p>
                  <p className="text-xs text-muted-foreground">Slots filled</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-2xl font-bold">{Object.keys(teacherSlotMap).length}</p>
                  <p className="text-xs text-muted-foreground">Teachers used</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-2xl font-bold">{Object.keys(subjectSlotMap).length}</p>
                  <p className="text-xs text-muted-foreground">Subjects used</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                <RotateCcw className="w-3 h-3 inline mr-1" />
                Go back to step 3 to edit individual slots
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t">
        <Button variant="ghost" onClick={step === 0 ? onClose : () => setStep(s => s - 1)}>
          {step === 0 ? 'Cancel' : <><ChevronLeft className="w-4 h-4 mr-1" /> Back</>}
        </Button>

        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={saving || filledSlots === 0}>
            {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-1" /> Save Timetable ({filledSlots} entries)</>}
          </Button>
        )}
      </div>
    </Card>
  );
}
