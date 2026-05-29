import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Columns3, Grid3X3, List, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { GridView } from './GridView';
import { KanbanView } from './KanbanView';
import { exportTimetablePDF } from './TimetablePDF';
import type { TimetableEntry, ViewMode, DropdownOption, CRUDHandlers } from './types';
import { DAYS, DEFAULT_PERIODS } from './types';

interface TimetableViewProps {
  entries: TimetableEntry[];
  loading?: boolean;
  classList?: string[];
  selectedClass?: string;
  onClassChange?: (cls: string) => void;
  showViewSwitcher?: boolean;
  defaultView?: ViewMode;
  crud?: CRUDHandlers;
  teachers?: DropdownOption[];
  courses?: DropdownOption[];
  rooms?: DropdownOption[];
  timeSlots?: string[];
  title?: string;
  subtitle?: string;
}

const viewIcons: Record<ViewMode, React.ReactNode> = {
  grid: <Grid3X3 className="w-4 h-4" />,
  kanban: <Columns3 className="w-4 h-4" />,
  calendar: <Calendar className="w-4 h-4" />,
  list: <List className="w-4 h-4" />,
};

const viewLabels: Record<ViewMode, string> = {
  grid: 'Grid',
  kanban: 'Kanban',
  calendar: 'Calendar',
  list: 'List',
};

export function TimetableView({
  entries,
  loading = false,
  classList,
  selectedClass,
  onClassChange,
  showViewSwitcher = true,
  defaultView = 'grid',
  crud,
  teachers,
  courses,
  rooms,
  timeSlots = DEFAULT_PERIODS,
  title,
  subtitle,
}: TimetableViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const hasEntries = entries.length > 0;

  const handleExportPDF = () => {
    exportTimetablePDF(entries, selectedClass || 'Timetable');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {title && <h1 className="text-2xl font-bold flex items-center gap-2">{title}</h1>}
          {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {classList && classList.length > 0 && (
            <select
              value={selectedClass}
              onChange={e => onClassChange?.(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-background text-sm"
            >
              {classList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {hasEntries && (
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
          )}

          {showViewSwitcher && (
            <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border">
              {(Object.keys(viewLabels) as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    viewMode === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {viewIcons[mode]}
                  <span className="hidden sm:inline">{viewLabels[mode]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !hasEntries ? (
        <Card className="p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground">No timetable entries</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {crud?.onAddEntry ? 'Add entries or select a different class' : 'No schedule available for this class'}
          </p>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4" glow>
              {viewMode === 'grid' && (
                <GridView
                  entries={entries}
                  timeSlots={timeSlots}
                  onAssignSlot={crud?.onAssignSlot}
                  onDeleteEntry={crud?.onDeleteEntry}
                  teachers={teachers}
                  courses={courses}
                  rooms={rooms}
                />
              )}

              {viewMode === 'kanban' && (
                <KanbanView
                  entries={entries}
                  timeSlots={timeSlots}
                  onDeleteEntry={crud?.onDeleteEntry}
                />
              )}

              {viewMode === 'calendar' && (
                <div className="py-16 text-center text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">Calendar view coming soon</p>
                  <p className="text-sm mt-1">Use Grid or Kanban view in the meantime</p>
                </div>
              )}

              {viewMode === 'list' && (
                <div className="py-16 text-center text-muted-foreground">
                  <List className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">List view coming soon</p>
                  <p className="text-sm mt-1">Use Grid or Kanban view in the meantime</p>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
