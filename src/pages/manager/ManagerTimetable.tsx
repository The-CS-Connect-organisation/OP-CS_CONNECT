import { useState, useEffect } from 'react';
import { TimetableView } from '../../components/timetable';
import type { TimetableEntry } from '../../components/timetable';
import { api } from '../../lib/api';

const FALLBACK_CLASSES = ['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'];

export default function ManagerTimetable() {
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
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
