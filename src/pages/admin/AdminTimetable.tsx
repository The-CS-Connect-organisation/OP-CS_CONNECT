import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { GridView } from '../../components/timetable';
import type { TimetableEntry, SubjectTeacherMap } from '../../components/timetable';
import { DAYS, DEFAULT_PERIODS } from '../../components/timetable';

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://op-csconnect-backend-production.up.railway.app/api');

async function localApiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('eduvault-token');
  const userId = localStorage.getItem('eduvault-user-id');
  const res = await fetch(`${API_BASE}/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': userId } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

interface SectionOption { id: string; label: string; }

export default function AdminTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [subjectTeacherMap, setSubjectTeacherMap] = useState<SubjectTeacherMap>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createSection, setCreateSection] = useState('');
  const [timetableName, setTimetableName] = useState('');

  useEffect(() => { loadSections(); }, []);

  const loadSections = async () => {
    try {
      const detailed = await localApiFetch('/classes/detailed');
      const opts: SectionOption[] = [];
      (Array.isArray(detailed) ? detailed : []).forEach((cls: any) => {
        (cls.sections || []).forEach((sec: any) => {
          opts.push({ id: sec.id, label: `${cls.name} — Section ${sec.name}` });
        });
      });
      setSectionOptions(opts);
    } catch { setSectionOptions([]); }
  };

  const loadSectionTeachers = async (sectionLabel: string) => {
    try {
      const detailed = await localApiFetch('/classes/detailed');
      const usersData = await api.getUsers().catch(() => []);
      const teachers = Array.isArray(usersData) ? usersData : usersData?.data ?? [];
      const teacherIdToName: Record<string, string> = {};
      teachers.forEach((u: any) => { teacherIdToName[u.id] = u.name; });

      const map: SubjectTeacherMap = {};
      (Array.isArray(detailed) ? detailed : []).forEach((cls: any) => {
        (cls.subjects || []).forEach((subj: any) => {
          if (subj.teacherId && subj.name) {
            const sectionMatch = !subj.sectionId ||
              cls.sections?.some((s: any) => s.id === subj.sectionId && `${cls.name} — Section ${s.name}` === sectionLabel);
            if (sectionMatch) {
              map[subj.name] = teacherIdToName[subj.teacherId] || subj.teacherId;
            }
          }
        });
      });
      setSubjectTeacherMap(map);
    } catch { setSubjectTeacherMap({}); }
  };

  const handleCreate = async () => {
    if (!createName.trim() || !createSection) return;
    const sec = sectionOptions.find(s => s.id === createSection);
    if (!sec) return;
    setTimetableName(createName.trim());
    setSelectedSection(sec.label);
    setShowCreate(false);
    setCreateName('');
    setCreateSection('');
    setEntries([]);
    await loadSectionTeachers(sec.label);
  };

  const handleAssignSlot = async (day: string, time: string, data: { teacher: string; subject: string; room: string }) => {
    try {
      const newEntry = await api.createTimetableEntry({ ...data, day, time, class: selectedSection });
      setEntries(prev => [...prev, newEntry]);
    } catch (err) { console.error('[AdminTimetable] Failed to assign slot:', err); }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await api.deleteTimetableEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) { console.error('[AdminTimetable] Failed to delete entry:', err); }
  };

  const courseOpts = Object.keys(subjectTeacherMap).map(name => ({ id: name, name }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timetable Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage class timetables</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Timetable
        </Button>
      </div>

      {!timetableName && !loading && (
        <Card>
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-lg font-medium">No timetable created yet</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Click "Create Timetable" to get started</p>
          </div>
        </Card>
      )}

      {timetableName && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Plus className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{timetableName}</h2>
              <p className="text-sm text-muted-foreground">{selectedSection}</p>
            </div>
          </div>

          <Card className="p-4">
            <GridView
              entries={entries}
              timeSlots={DEFAULT_PERIODS}
              onAssignSlot={handleAssignSlot}
              onDeleteEntry={handleDeleteEntry}
              courses={courseOpts}
              subjectTeacherMap={subjectTeacherMap}
            />
          </Card>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreate(false)}>
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Create Timetable</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Timetable Name</label>
                <input
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  placeholder="e.g. Term 1 Timetable"
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Section</label>
                <select
                  value={createSection}
                  onChange={e => setCreateSection(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a section...</option>
                  {sectionOptions.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 border rounded-md py-2 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
                <button onClick={handleCreate} disabled={!createName.trim() || !createSection} className="flex-1 bg-primary text-primary-foreground rounded-md py-2 text-sm hover:opacity-90 disabled:opacity-60">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
