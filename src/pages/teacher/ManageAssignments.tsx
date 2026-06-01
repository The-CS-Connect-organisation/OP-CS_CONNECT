import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ClipboardList, Plus, Edit, Trash2, Calendar, Clock, Users, FileText } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  class: string;
  dueDate: string;
  totalMarks: number;
  status: 'draft' | 'published' | 'completed';
  submissions: number;
  createdAt: string;
}

export default function TeacherManageAssignments() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: 'Math', class: '10-A', dueDate: '', totalMarks: 100 });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await api.getAssignments({ class: '10-A' });
      setAssignments(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      const newAssignment = await api.createAssignment({ ...form, teacherId: user?.id });
      setAssignments(prev => [...prev, newAssignment]);
      setForm({ title: '', description: '', subject: 'Math', class: '10-A', dueDate: '', totalMarks: 100 });
      setShowForm(false);
    } catch {
      // error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAssignment(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch {
      // error
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.publishAssignment(id);
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: 'published' } : a));
    } catch {
      // error
    }
  };

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
              {['Math', 'Science', 'English', 'History', 'Geography', 'Art'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
              {['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="number" placeholder="Total Marks" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value) || 100 })} className="px-3 py-2 rounded-lg border bg-background" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 rounded-lg border bg-background md:col-span-2" />
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
                    <Badge className={assignment.status === 'published' ? 'bg-green-100 text-green-700' : assignment.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}>
                      {assignment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{assignment.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'Not set'}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{assignment.submissions} submissions</span>
                    <span className="flex items-center gap-1"><ClipboardList className="w-4 h-4" />{assignment.totalMarks} marks</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {assignment.status === 'draft' && (
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