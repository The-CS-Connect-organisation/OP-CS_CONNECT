import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown, ChevronRight, Plus, Pencil, Trash2, BookOpen, Users, X, Check,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';

interface Section {
  id: string;
  name: string;
  capacity: number;
  studentCount: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  isElective: boolean;
  teacherId?: string;
  sectionId?: string;
}

interface ClassData {
  id: string;
  name: string;
  grade: number;
  sectionCount: number;
  studentCount: number;
  sections: Section[];
  subjects: Subject[];
  classTeacherId?: string;
}

type ModalType =
  | { kind: 'add-class' }
  | { kind: 'edit-class'; cls: ClassData }
  | { kind: 'add-section'; classId: string; className: string }
  | { kind: 'edit-section'; section: Section; classId: string }
  | { kind: 'add-subject'; classId: string; className: string }
  | { kind: 'edit-subject'; subject: Subject; classId: string }
  | null;

async function localApiFetch(path: string, options: RequestInit = {}) {
  const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://op-csconnect-backend-production.up.railway.app/api');
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

export default function AdminClassroom() {
  const [classList, setClassList] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Record<string, 'sections' | 'subjects'>>({});
  const [modal, setModal] = useState<ModalType>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [classTeacherId, setClassTeacherId] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [sectionCapacity, setSectionCapacity] = useState('40');
  const [sectionTeacherId, setSectionTeacherId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectElective, setSubjectElective] = useState(false);
  const [subjectTeacherId, setSubjectTeacherId] = useState('');
  const [subjectSectionId, setSubjectSectionId] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);

  const PREDEFINED_SUBJECTS = [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Physics', code: 'PHY' },
    { name: 'Chemistry', code: 'CHEM' },
    { name: 'Biology', code: 'BIO' },
    { name: 'English', code: 'ENG' },
    { name: 'Computer Science', code: 'CS' },
    { name: 'History', code: 'HIST' },
    { name: 'Geography', code: 'GEO' },
    { name: 'Art', code: 'ART' },
    { name: 'Physical Education', code: 'PE' },
    { name: 'Economics', code: 'ECON' },
    { name: 'Accounting', code: 'ACCT' },
  ];

  const assignedTeacherIds = new Set<string>();
  const teacherSectionMap = new Map<string, string>();
  classList.forEach(cls =>
    cls.sections.forEach(sec => {
      const tid = (sec as any).teacherId;
      if (tid) {
        assignedTeacherIds.add(tid);
        teacherSectionMap.set(tid, `${cls.name} — Section ${sec.name}`);
      }
    })
  );

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await localApiFetch('/classes/detailed');
      setClassList(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.getUsers({ role: 'teacher' }).then(setTeachers).catch(() => {});
  }, []);

  useEffect(() => { loadClasses(); }, [loadClasses]);

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function getTab(id: string): 'sections' | 'subjects' {
    return activeTab[id] ?? 'sections';
  }

  function setTab(id: string, tab: 'sections' | 'subjects') {
    setActiveTab(prev => ({ ...prev, [id]: tab }));
  }

  function openModal(m: ModalType) {
    setFormError('');
    setModal(m);
    if (m?.kind === 'add-class') { setClassName(''); setClassGrade(''); setClassTeacherId(''); }
    if (m?.kind === 'edit-class') { setClassName(m.cls.name); setClassGrade(String(m.cls.grade)); setClassTeacherId(m.cls.classTeacherId || ''); }
    if (m?.kind === 'add-section') { setSectionName(''); setSectionCapacity('40'); setSectionTeacherId(''); }
    if (m?.kind === 'edit-section') { setSectionName(m.section.name); setSectionCapacity(String(m.section.capacity)); setSectionTeacherId((m.section as any).teacherId || ''); }
    if (m?.kind === 'add-subject') { setSubjectName(''); setSubjectCode(''); setSubjectElective(false); setSubjectTeacherId(''); setSubjectSectionId(''); }
    if (m?.kind === 'edit-subject') { setSubjectName(m.subject.name); setSubjectCode(m.subject.code); setSubjectElective(m.subject.isElective); setSubjectTeacherId(m.subject.teacherId || ''); setSubjectSectionId(m.subject.sectionId || ''); }
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError('');
    try {
      if (!modal) return;

      if (modal.kind === 'add-class') {
        if (!className.trim() || !classGrade) throw new Error('Name and grade are required');
        await localApiFetch('/classes', { method: 'POST', body: JSON.stringify({ name: className.trim(), grade: Number(classGrade), classTeacherId: classTeacherId || undefined }) });
      } else if (modal.kind === 'edit-class') {
        await localApiFetch(`/classes/${modal.cls.id}`, { method: 'PATCH', body: JSON.stringify({ name: className.trim(), grade: Number(classGrade), classTeacherId: classTeacherId || undefined }) });
      } else if (modal.kind === 'add-section') {
        if (!sectionName.trim()) throw new Error('Section name is required');
        await localApiFetch('/sections', { method: 'POST', body: JSON.stringify({ name: sectionName.trim(), classId: modal.classId, capacity: Number(sectionCapacity), teacherId: sectionTeacherId || undefined }) });
      } else if (modal.kind === 'edit-section') {
        await localApiFetch(`/sections/${modal.section.id}`, { method: 'PATCH', body: JSON.stringify({ name: sectionName.trim(), capacity: Number(sectionCapacity), teacherId: sectionTeacherId || undefined }) });
      } else if (modal.kind === 'add-subject') {
        if (!subjectName.trim() || !subjectCode.trim()) throw new Error('Name and code are required');
        if (!subjectTeacherId) throw new Error('Please select a teacher for this subject');
        await localApiFetch('/subjects', { method: 'POST', body: JSON.stringify({ name: subjectName.trim(), code: subjectCode.trim(), classId: modal.classId, isElective: subjectElective, teacherId: subjectTeacherId, sectionId: subjectSectionId || undefined }) });
      } else if (modal.kind === 'edit-subject') {
        await localApiFetch(`/subjects/${modal.subject.id}`, { method: 'PATCH', body: JSON.stringify({ name: subjectName.trim(), code: subjectCode.trim(), isElective: subjectElective, teacherId: subjectTeacherId || undefined, sectionId: subjectSectionId || undefined }) });
      }

      setModal(null);
      loadClasses();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(type: 'class' | 'section' | 'subject', id: string, label: string) {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    try {
      await localApiFetch(`/${type === 'class' ? 'classes' : type === 'section' ? 'sections' : 'subjects'}/${id}`, { method: 'DELETE' });
      loadClasses();
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Classes & Sections</h1>
          <p className="text-muted-foreground text-sm">Manage classes, sections and subjects</p>
        </div>
        <Button onClick={() => openModal({ kind: 'add-class' })}>
          <Plus className="w-4 h-4 mr-2" /> Add Class
        </Button>
      </div>

      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : classList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border rounded-lg">
          No classes found. Add your first class to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {classList.map(cls => {
            const isOpen = expanded.has(cls.id);
            const tab = getTab(cls.id);
            return (
              <div key={cls.id} className="border rounded-lg bg-card overflow-hidden">
                {/* Class header row */}
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <button onClick={() => toggleExpand(cls.id)} className="text-muted-foreground hover:text-foreground">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <div className="flex-1 flex items-center gap-4">
                    <div>
                      <span className="font-semibold">{cls.name}</span>
                      {cls.grade && <span className="ml-2 text-xs text-muted-foreground">Grade {cls.grade}</span>}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-foreground">{cls.sectionCount}</span> sections
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="font-medium text-foreground">{cls.studentCount}</span> students
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span className="font-medium text-foreground">{cls.subjects.length}</span> subjects
                      </span>
                    </div>
                    {(() => {
                      const ct = teachers.find(t => t.id === cls.classTeacherId);
                      return ct ? (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium truncate max-w-[160px] shrink-0" title="Class Teacher">
                          👤 {ct.name}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openModal({ kind: 'edit-class', cls })} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit class">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete('class', cls.id, cls.name)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Delete class">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div className="border-t bg-muted/20">
                    <div className="flex border-b px-4">
                      <button onClick={() => setTab(cls.id, 'sections')} className={`py-2 px-3 text-sm font-medium border-b-2 transition-colors ${tab === 'sections' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                        Sections
                      </button>
                      <button onClick={() => setTab(cls.id, 'subjects')} className={`py-2 px-3 text-sm font-medium border-b-2 transition-colors ${tab === 'subjects' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                        Subjects
                      </button>
                    </div>
                    <div className="p-4">
                      {tab === 'sections' && (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium">Sections</span>
                            <button onClick={() => openModal({ kind: 'add-section', classId: cls.id, className: cls.name })} className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2.5 py-1.5 rounded-md hover:opacity-90">
                              <Plus className="h-3 w-3" /> Add Section
                            </button>
                          </div>
                          {cls.sections.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No sections yet.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {cls.sections.map(sec => {
                                const assignedTeacher = teachers.find(t => t.id === (sec as any).teacherId);
                                return (
                                <div key={sec.id} className="border rounded-md p-3 bg-card">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <span className="font-medium text-sm">Section {sec.name}</span>
                                      <span className="ml-2 text-xs text-muted-foreground">{sec.studentCount}/{sec.capacity} students</span>
                                    </div>
                                    <div className="flex gap-1">
                                      <button onClick={() => openModal({ kind: 'edit-section', section: sec, classId: cls.id })} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit section">
                                        <Pencil className="h-3 w-3" />
                                      </button>
                                      <button onClick={() => handleDelete('section', sec.id, `Section ${sec.name}`)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Delete section">
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Assign Class Teacher</label>
                                    <select
                                      value={(sec as any).teacherId || ''}
                                      onChange={async (e) => {
                                        const tid = e.target.value || undefined;
                                        try {
                                          await localApiFetch(`/sections/${sec.id}`, { method: 'PATCH', body: JSON.stringify({ teacherId: tid }) });
                                          loadClasses();
                                        } catch { alert('Failed to assign teacher'); }
                                      }}
                                      className="w-full text-sm border rounded px-2 py-1.5 bg-background"
                                    >
                                      <option value="">— None —</option>
                                      {teachers.length === 0 && <option disabled>No teachers found</option>}
                                      {teachers.map(t => {
                                        const isAssigned = assignedTeacherIds.has(t.id) && t.id !== (sec as any).teacherId;
                                        return (
                                          <option key={t.id} value={t.id} disabled={isAssigned}>
                                            {t.name}{isAssigned ? ' (already assigned)' : ''}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>
                                </div>
                              )})}
                            </div>
                          )}
                        </div>
                      )}
                      {tab === 'subjects' && (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium">Subjects</span>
                            <button onClick={() => openModal({ kind: 'add-subject', classId: cls.id, className: cls.name })} className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2.5 py-1.5 rounded-md hover:opacity-90">
                              <Plus className="h-3 w-3" /> Add Subject & Teacher
                            </button>
                          </div>
                          {cls.subjects.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No subjects yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {cls.subjects.map(subj => {
                                const assignedSubjectTeacher = teachers.find(t => t.id === subj.teacherId);
                                const subjectSection = cls.sections.find(s => s.id === subj.sectionId);
                                return (
                                <div key={subj.id} className="border rounded-lg bg-card overflow-hidden">
                                  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{subj.name}</span>
                                        <span className="text-xs text-muted-foreground">{subj.code}</span>
                                      </div>
                                      {subj.isElective && (
                                        <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium">Elective</span>
                                      )}
                                      {subjectSection ? (
                                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">Sec {subjectSection.name}</span>
                                      ) : (
                                        <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-1.5 py-0.5 rounded font-medium">All sections</span>
                                      )}
                                      {assignedSubjectTeacher && (
                                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                                          👤 {assignedSubjectTeacher.name}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <button onClick={() => openModal({ kind: 'edit-subject', subject: subj, classId: cls.id })} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                      <button onClick={() => handleDelete('subject', subj.id, subj.name)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-4">
                                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 bg-muted/10">
                                      <label className="block text-sm font-semibold text-foreground mb-3">
                                        Assign Subject Teacher
                                      </label>
                                      <select
                                        value={subj.teacherId || ''}
                                        onChange={async (e) => {
                                          const tid = e.target.value || undefined;
                                          try {
                                            await localApiFetch(`/subjects/${subj.id}`, { method: 'PATCH', body: JSON.stringify({ teacherId: tid }) });
                                            loadClasses();
                                          } catch { alert('Failed to assign teacher'); }
                                        }}
                                        className="w-full text-base border rounded-md px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                      >
                                        <option value="">— Select a teacher —</option>
                                        {teachers.length === 0 && <option disabled>No teachers found</option>}
                                        {teachers.map(t => {
                                          const isAssigned = assignedTeacherIds.has(t.id) && t.id !== subj.teacherId;
                                          return (
                                            <option key={t.id} value={t.id} disabled={isAssigned}>
                                              {t.name}{isAssigned ? ' (already assigned to another section)' : ''}
                                            </option>
                                          );
                                        })}
                                      </select>
                                      {!assignedSubjectTeacher && (
                                        <p className="text-xs text-muted-foreground mt-2">No teacher assigned yet. Select a teacher above to assign them to this subject.</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )})}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModal(null)}>
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {modal.kind === 'add-class' && 'Add Class'}
                {modal.kind === 'edit-class' && 'Edit Class'}
                {modal.kind === 'add-section' && `Add Section — ${modal.className}`}
                {modal.kind === 'edit-section' && 'Edit Section'}
                {modal.kind === 'add-subject' && `Add Subject — ${modal.className}`}
                {modal.kind === 'edit-subject' && 'Edit Subject'}
              </h2>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              {(modal.kind === 'add-class' || modal.kind === 'edit-class') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Class Name</label>
                    <input value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. Class 1" className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Grade (1–12)</label>
                    <input type="number" min={1} max={12} value={classGrade} onChange={e => setClassGrade(e.target.value)} placeholder="e.g. 1" className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assign Class Teacher</label>
                    <select value={classTeacherId} onChange={e => setClassTeacherId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select a class teacher...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">The class teacher can edit the timetable. They can also be a subject teacher.</p>
                  </div>
                </>
              )}
              {(modal.kind === 'add-section' || modal.kind === 'edit-section') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Section Name</label>
                    <input value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="e.g. A" className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Capacity</label>
                    <input type="number" min={1} value={sectionCapacity} onChange={e => setSectionCapacity(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assign Class Teacher</label>
                    <select value={sectionTeacherId} onChange={e => setSectionTeacherId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select a class teacher...</option>
                      {teachers.map(t => {
                        const isAssigned = assignedTeacherIds.has(t.id) && t.id !== sectionTeacherId;
                        const location = teacherSectionMap.get(t.id);
                        return (
                          <option key={t.id} value={t.id} disabled={isAssigned}>
                            {t.name}{location ? ` (${location})` : ''}{isAssigned ? ' — already assigned' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </>
              )}
              {(modal.kind === 'add-subject' || modal.kind === 'edit-subject') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject *</label>
                    <select value={subjectName} onChange={e => {
                      const subj = PREDEFINED_SUBJECTS.find(s => s.name === e.target.value);
                      setSubjectName(e.target.value);
                      setSubjectCode(subj?.code || '');
                    }} className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select a subject...</option>
                      {PREDEFINED_SUBJECTS.map(s => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assign Teacher *</label>
                    <select value={subjectTeacherId} onChange={e => setSubjectTeacherId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select a teacher...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assign to Section</label>
                    <select value={subjectSectionId} onChange={e => setSubjectSectionId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">All Sections</option>
                      {(() => {
                        const cls = classList.find(c => c.id === modal.classId);
                        return cls?.sections.map(sec => (
                          <option key={sec.id} value={sec.id}>Section {sec.name}</option>
                        ));
                      })()}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">Choose a specific section or leave as "All Sections"</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="elective" checked={subjectElective} onChange={e => setSubjectElective(e.target.checked)} className="h-4 w-4" />
                    <label htmlFor="elective" className="text-sm">Elective subject</label>
                  </div>
                </>
              )}
              {formError && <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{formError}</div>}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setModal(null)} className="flex-1 border rounded-md py-2 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
                <button onClick={handleSubmit} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md py-2 text-sm hover:opacity-90 disabled:opacity-60">
                  {saving ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Check className="h-4 w-4" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
