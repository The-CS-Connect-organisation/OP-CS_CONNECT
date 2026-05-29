import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { TimetableView } from '../../components/timetable';
import type { TimetableEntry } from '../../components/timetable';

const extractArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function ParentTimetable() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState('child1');

  useEffect(() => { loadTimetable(); }, [selectedChild]);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const data = await api.getChildTimetable(selectedChild);
      setEntries(extractArray(data) as TimetableEntry[]);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const childList = user?.children?.length ? user.children : ['child1', 'child2'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-muted-foreground">Child:</label>
        <select
          value={selectedChild}
          onChange={e => { setSelectedChild(e.target.value); setLoading(true); }}
          className="px-3 py-2 rounded-lg border bg-background text-sm"
        >
          {childList.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <TimetableView
        entries={entries}
        loading={loading}
        title="Timetable"
        subtitle="Class schedule"
        showViewSwitcher
      />
    </div>
  );
}
