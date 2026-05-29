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

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const DEFAULT_PERIODS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
