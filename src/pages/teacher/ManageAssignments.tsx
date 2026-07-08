import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ClipboardList, Plus, Edit, Trash2, Calendar, Users, FileText, CheckSquare, Square } from 'lucide-react';

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

export default function TeacherManageAssignments() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [teacherClasses, setTeacherClasses] = useState<string[]>(['10-A']);
  const [classSections, setClassSections] = useState<Record<string, { id: string; name: string }[]>>({});
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const teacherSubjects = (user?.subjects?.length ? user.subjects : ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Geography', 'Art', 'Physical Education', 'Economics', 'Accounting']);
  const [form, setForm] = useState({ title: '', description: '', subject: teacherSubjects[0] || 'Math', class: '10-A', dueDate: '', points: 100 });

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      if (user?.id) {
        const classData = await api.getTeacherClasses(user.id);
        if (classData?.classes?.length) {
          setTeacherClasses(classData.classes);
          setForm(f => ({ ...f, class: classData.classes[0] }));
        }
      }
    } catch {}
    loadSections();
    loadAssignments();
  };

  const loadSections = async () => {
    try {
      const data = await localApiFetch('/classes/detailed');
      const map: Record<string, { id: string; name: string }[]> = {};
      (Array.isArray(data) ? data : []).forEach((cls: any) => {
        const sections = (cls.sections || []).map((s: any) => ({ id: s.id, name: s.name }));
        if (sections.length > 0) map[cls.name] = sections;
      });
      setClassSections(map);
    } catch {}
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await api.getAssignments();
      setAssignments(Array.isArray(data) ? data : []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (className: string) => {
    setForm({ ...form, class: className });
    setSelectedSections([]);
  };

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      const newAssignment = await api.createAssignment({
        title: form.title,
        description: form.description,
        subject: form.subject,
        className: form.class,
        dueDate: form.dueDate,
        points: form.points,
        sectionIds: selectedSections.length > 0 ? selectedSections : undefined,
      });
      setAssignments(prev => [...prev, newAssignment]);
      setForm({ title: '', description: '', subject: 'Math', class: teacherClasses[0] || '10-A', dueDate: '', points: 100 });
      setSelectedSections([]);
      setShowForm(false);
    } catch {
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAssignment(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch {
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.publishAssignment(id);
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, published: true } : a));
    } catch {
    }
  };

  const currentSections = classSections[form.class] || [];
  const showSectionPicker = currentSections.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Assignments</h1>
          <p className="text-muted-foreground">Create & manage assignments</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Assignment
        </Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Create Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
              {teacherSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.class} onChange={(e) => handleClassChange(e.target.value)} className="px-3 py-2 rounded-lg border bg-background">
              {teacherClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="number" placeholder="Total Marks" value={form.points} onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 100 })} className="px-3 py-2 rounded-lg border bg-background" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 rounded-lg border bg-background md:col-span-2" />
            {showSectionPicker && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Assign to Sections</label>
                <p className="text-xs text-muted-foreground mb-2">Select which sections receive this assignment (leave empty for all)</p>
                <div className="flex flex-wrap gap-2">
                  {currentSections.map(sec => {
                    const isSelected = selectedSections.includes(sec.id);
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => toggleSection(sec.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          isSelected
                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400'
                            : 'bg-background border-border text-muted-foreground hover:border-orange-200 hover:text-foreground'
                        }`}
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        Section {sec.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <div className="space-y-4">
          {assignments.map(assignment => (
            <Card key={assignment.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-lg">{assignment.title}</h3>
                    <Badge variant="secondary">{assignment.subject}</Badge>
                    <Badge className={assignment.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {assignment.published ? 'published' : 'draft'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{assignment.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'Not set'}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{(assignment.submissions || []).length} submissions</span>
                    <span className="flex items-center gap-1"><ClipboardList className="w-4 h-4" />{assignment.points || assignment.maxMarks} marks</span>
                    {assignment.sectionIds?.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckSquare className="w-3.5 h-3.5" />
                        {assignment.sectionIds.length} section(s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!assignment.published && (
                    <Button size="sm" onClick={() => handlePublish(assignment.id)}>Publish</Button>
                  )}
                  <button className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(assignment.id)} className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {assignments.length === 0 && !loading && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assignments</h3>
          <p className="text-muted-foreground">Create your first assignment to get started</p>
        </div>
      )}
    </div>
  );
}
