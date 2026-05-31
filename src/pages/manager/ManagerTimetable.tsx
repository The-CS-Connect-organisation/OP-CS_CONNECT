import { useState, useEffect } from 'react';
import { TimetableView } from '../../components/timetable';
import type { TimetableEntry } from '../../components/timetable';
import { api } from '../../lib/api';

const mockEntries: TimetableEntry[] = [
  { id: '1', class: '10-A', day: 'Monday', time: '09:00', subject: 'Math', teacher: 'Mr. Smith', room: '101' },
  { id: '2', class: '10-A', day: 'Monday', time: '10:00', subject: 'Science', teacher: 'Ms. Johnson', room: '102' },
  { id: '3', class: '10-A', day: 'Monday', time: '11:00', subject: 'English', teacher: 'Mrs. Davis', room: '103' },
  { id: '4', class: '10-A', day: 'Tuesday', time: '09:00', subject: 'History', teacher: 'Mr. Brown', room: '201' },
  { id: '5', class: '10-A', day: 'Tuesday', time: '10:00', subject: 'Math', teacher: 'Mr. Smith', room: '101' },
  { id: '6', class: '10-A', day: 'Wednesday', time: '09:00', subject: 'Science', teacher: 'Ms. Johnson', room: '102' },
  { id: '7', class: '10-A', day: 'Wednesday', time: '10:00', subject: 'English', teacher: 'Mrs. Davis', room: '103' },
  { id: '8', class: '10-A', day: 'Thursday', time: '09:00', subject: 'Geography', teacher: 'Ms. Wilson', room: '202' },
  { id: '9', class: '10-A', day: 'Thursday', time: '10:00', subject: 'History', teacher: 'Mr. Brown', room: '201' },
  { id: '10', class: '10-A', day: 'Friday', time: '09:00', subject: 'Art', teacher: 'Ms. Taylor', room: '301' },
  { id: '11', class: '10-A', day: 'Friday', time: '10:00', subject: 'PE', teacher: 'Mr. White', room: 'Ground' },
];

const FALLBACK_CLASSES = ['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'];

export default function ManagerTimetable() {
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [entries, setEntries] = useState<TimetableEntry[]>(mockEntries.filter(e => e.class === selectedClass));
  const [classList, setClassList] = useState<string[]>(FALLBACK_CLASSES);

  useEffect(() => {
    api.getCourses()
      .then((data: any) => {
        const extracted = [...new Set<string>(
          (Array.isArray(data) ? data : []).map((c: any) => c.class || c.name?.split(' ')[0]).filter(Boolean)
        )];
        if (extracted.length > 0) setClassList(extracted);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function loadTimetable() {
      try {
        const data = await api.getTimetable(selectedClass);
        setEntries(data);
      } catch (err) {
        console.error('[ManagerTimetable] Failed to load:', err);
      }
    }
    loadTimetable();
  }, [selectedClass]);

  return (
    <div className="p-6 space-y-6">
      <TimetableView
        entries={entries}
        classList={classList}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        title="Timetable"
        subtitle="School timetable"
        showViewSwitcher
      />
    </div>
  );
}
