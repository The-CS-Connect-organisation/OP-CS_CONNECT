export interface TimetableEntry {
  id: string;
  class: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  color?: string;
}

export type ViewMode = 'grid' | 'kanban' | 'calendar' | 'list';

export interface TimetableSlot {
  subject: string;
  teacher?: string;
  room?: string;
  color?: string;
}

export interface DropdownOption {
  id: string;
  name: string;
}

export interface CRUDHandlers {
  onAddEntry?: (entry: Omit<TimetableEntry, 'id' | 'class'>) => void;
  onDeleteEntry?: (id: string) => void;
  onAssignSlot?: (day: string, time: string, data: { teacher: string; subject: string; room: string }) => void;
}

export interface SubjectTeacherMap {
  [subjectName: string]: string; // subject name → teacher name
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const DEFAULT_PERIODS = ['08:20', '09:00', '09:40', '10:30', '11:10', '11:50', '13:00', '13:40', '14:20'];
export const BREAK_SLOTS: Record<string, string> = {
  '10:20': 'Snack Break (10 min)',
  '12:30': 'Lunch Break (30 min)',
};
