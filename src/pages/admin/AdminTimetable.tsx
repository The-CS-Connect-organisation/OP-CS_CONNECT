import { useState, useEffect, useRef } from 'react';
import { Plus, Bot, Send, Loader2, X, Sparkles, User, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { GridView } from '../../components/timetable';
import type { TimetableEntry, SubjectTeacherMap } from '../../components/timetable';
import { DAYS, DEFAULT_PERIODS } from '../../components/timetable';

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://eduvault-backend-production-6a1b.up.railway.app/api');

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

interface SectionOption { id: string; label: string; className: string; }

interface ChatMsg { role: 'user' | 'assistant'; content: string; }

export default function AdminTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [subjectTeacherMap, setSubjectTeacherMap] = useState<SubjectTeacherMap>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createSection, setCreateSection] = useState('');
  const [timetableName, setTimetableName] = useState('');
  const [showCSAI, setShowCSAI] = useState(false);
  const [csaiMsgs, setCsaiMsgs] = useState<ChatMsg[]>([]);
  const [csaiInput, setCsaiInput] = useState('');
  const [csaiLoading, setCsaiLoading] = useState(false);
  const csaiEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { csaiEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [csaiMsgs]);

  useEffect(() => { loadSections(); }, []);

  const loadSections = async () => {
    try {
      const detailed = await localApiFetch('/classes/detailed');
      const opts: SectionOption[] = [];
      (Array.isArray(detailed) ? detailed : []).forEach((cls: any) => {
        (cls.sections || []).forEach((sec: any) => {
          opts.push({ id: sec.id, label: `${cls.name} — Section ${sec.name}`, className: cls.name });
        });
      });
      setSectionOptions(opts);
    } catch { setSectionOptions([]); }
  };

  const loadSectionTeachers = async (className: string) => {
    try {
      const detailed = await localApiFetch('/classes/detailed');
      const usersData = await api.getUsers().catch(() => []);
      const teachers = Array.isArray(usersData) ? usersData : usersData?.data ?? [];
      const teacherIdToName: Record<string, string> = {};
      teachers.forEach((u: any) => { teacherIdToName[u.id] = u.name; });

      const map: SubjectTeacherMap = {};
      const classObj = (Array.isArray(detailed) ? detailed : []).find((c: any) => c.name === className);
      if (classObj) {
        (classObj.subjects || []).forEach((subj: any) => {
          if (subj.teacherId && subj.name) {
            map[subj.name] = teacherIdToName[subj.teacherId] || subj.teacherId;
          }
        });
      }
      setSubjectTeacherMap(map);
    } catch { setSubjectTeacherMap({}); }
  };

  const loadEntries = async (className: string) => {
    try {
      const data = await api.getTimetable(className);
      setEntries(Array.isArray(data) ? data : []);
    } catch { setEntries([]); }
  };

  const saveEntries = async (className: string, updated: TimetableEntry[]) => {
    await api.updateTimetable(className, updated);
  };

  const handleCreate = async () => {
    if (!createName.trim() || !createSection) return;
    const sec = sectionOptions.find(s => s.id === createSection);
    if (!sec) return;
    setTimetableName(createName.trim());
    setSelectedSection(sec.label);
    setSelectedClassName(sec.className);
    setShowCreate(false);
    setCreateName('');
    setCreateSection('');
    setEntries([]);
    await loadSectionTeachers(sec.className);
    await loadEntries(sec.className);
  };

  const handleAssignSlot = async (day: string, time: string, data: { teacher: string; subject: string; room: string }) => {
    try {
      const newEntry: TimetableEntry = {
        id: `${selectedClassName}-${day}-${time}`,
        class: selectedClassName,
        day,
        time,
        subject: data.subject,
        teacher: data.teacher,
        room: data.room,
      };
      const updated = [...entries, newEntry];
      setEntries(updated);
      await saveEntries(selectedClassName, updated);
    } catch (err) { console.error('[AdminTimetable] Failed to assign slot:', err); }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      await saveEntries(selectedClassName, updated);
    } catch (err) { console.error('[AdminTimetable] Failed to delete entry:', err); }
  };

  const courseOpts = Object.keys(subjectTeacherMap).map(name => ({ id: name, name }));

  const [clearing, setClearing] = useState(false);

  const handleClearAll = async () => {
    if (!confirm('Delete ALL timetables from Firebase? This cannot be undone.')) return;
    setClearing(true);
    try {
      const token = localStorage.getItem('eduvault-token');
      const userId = localStorage.getItem('eduvault-user-id');
      const res = await fetch(`${API_BASE}/timetable`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(userId ? { 'x-user-id': userId } : {}),
        },
      });
      if (!res.ok) throw new Error('Failed to clear');
      setEntries([]);
      setTimetableName('');
      setSelectedSection('');
      setSelectedClassName('');
      alert('All timetables cleared!');
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setClearing(false);
    }
  };

  const handleCSAISend = async () => {
    if (!csaiInput.trim() || csaiLoading) return;
    const msg = csaiInput.trim();
    setCsaiInput('');
    setCsaiMsgs(prev => [...prev, { role: 'user', content: msg }]);
    setCsaiLoading(true);
    try {
      const allTt: Record<string, any> = {};
      try {
        const detailed = await localApiFetch('/classes/detailed');
        if (Array.isArray(detailed)) {
          for (const cls of detailed) {
            const className = cls.name;
            const tt = await localApiFetch(`/timetable/${className}`).catch(() => null);
            if (tt) allTt[className] = tt;
          }
        }
      } catch {}
      const users = await localApiFetch('/users').catch(() => ({}));
      const userList = Array.isArray(users) ? users : users?.data ?? [];
      const teacherList = userList.filter((t: any) => t.role === 'teacher');
      const subjects = await localApiFetch('/subjects').catch(() => []);
      const res = await api.csAITimetable({
        message: msg,
        className: selectedClassName,
        allClassesTimetables: allTt,
        subjects: Array.isArray(subjects) ? subjects : [],
        teachers: teacherList,
      });
      setCsaiMsgs(prev => [...prev, { role: 'assistant', content: res.response + ' Refreshing timetable...' || 'Done. Refreshing timetable...' }]);
      // Reload entries instead of full page refresh
      if (selectedClassName) {
        await loadEntries(selectedClassName);
        await loadSectionTeachers(selectedClassName);
      }
    } catch (err: any) {
      setCsaiMsgs(prev => [...prev, { role: 'assistant', content: 'Error: ' + (err.message || 'Something went wrong') }]);
    } finally {
      setCsaiLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timetable Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage class timetables</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleClearAll} disabled={clearing} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
            <Trash2 className="w-4 h-4 mr-1" /> {clearing ? 'Clearing...' : 'Clear All'}
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Timetable
          </Button>
        </div>
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

      {/* CSAI Floating Button */}
      <button onClick={() => setShowCSAI(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl shadow-orange-200/60 hover:shadow-orange-300/80 hover:scale-105 transition-all flex items-center justify-center">
        <Bot className="w-6 h-6" />
      </button>

      {/* CSAI Chat Panel */}
      {showCSAI && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[520px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-orange-600/5 to-amber-600/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold">CS<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">AI</span></h3>
                <p className="text-[10px] text-muted-foreground">Timetable Agent · Cerebras</p>
              </div>
            </div>
            <button onClick={() => setShowCSAI(false)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {csaiMsgs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-600/20 to-amber-600/20 flex items-center justify-center">
                  <Bot className="w-7 h-7 text-orange-500" />
                </div>
                <p className="text-sm font-semibold">CSAI Timetable Agent</p>
                <p className="text-xs text-muted-foreground px-4">Ask me to create, edit, or manage timetables. I can handle multiple classes, change timings, merge periods, add Saturday schedules, and more.</p>
                <div className="flex flex-wrap gap-2 justify-center px-2">
                  {["Add Saturday for 10-A with 6 subjects", "Change all classes to 8:20-3:00", "Merge History & Civics into one", "Create timetable for 10-B"].map(s => (
                    <button key={s} onClick={() => { setCsaiInput(s); }} className="px-3 py-1.5 rounded-lg bg-accent/50 text-[11px] hover:bg-accent transition-colors border border-border/50">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {csaiMsgs.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-foreground text-background rounded-br-md' : 'bg-accent/50 rounded-bl-md'}`}>
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {csaiLoading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-accent/50 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                  {[1,2,3].map(d => (
                    <div key={d} className={`w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse`} style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={csaiEndRef} />
          </div>

          <div className="border-t p-3">
            <div className="flex items-end gap-2 rounded-xl border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
              <input value={csaiInput} onChange={e => setCsaiInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCSAISend(); } }}
                placeholder="Ask CSAI to manage timetables..." className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50" />
              <button onClick={handleCSAISend} disabled={!csaiInput.trim() || csaiLoading}
                className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white disabled:opacity-30 transition-all hover:shadow-md shrink-0">
                {csaiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground/40 text-center mt-1.5">CSAI can make mistakes. Changes are applied directly.</p>
          </div>
        </div>
      )}
    </div>
  );
}
