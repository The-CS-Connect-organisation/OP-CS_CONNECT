import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { FileText, Plus, Calendar, Clock, MapPin, Users, Edit, Trash2, X, Search, BookOpen } from 'lucide-react';
import { api } from '../../lib/api';

interface Exam {
  id: string;
  title: string;
  subject: string;
  class: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  type: string;
  totalMarks: number;
  status: string;
}

const EMPTY_FORM = {
  title: '', subject: '', class: '', date: '', time: '',
  duration: 60, location: '', type: 'midterm', totalMarks: 100, status: 'scheduled',
};

export default function ManagerExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadExams(); }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await api.getExams();
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[ManagerExams] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.updateExam(editingId, form);
      } else {
        await api.createExam(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      loadExams();
    } catch (err) {
      console.error('[ManagerExams] Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exam?')) return;
    try {
      await api.deleteExam(id);
      setExams(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('[ManagerExams] Failed to delete:', err);
    }
  };

  const typeColors: Record<string, string> = {
    final: 'bg-red-100 text-red-700',
    midterm: 'bg-orange-100 text-orange-700',
    quiz: 'bg-blue-100 text-blue-700',
    weekly: 'bg-green-100 text-green-700',
    practical: 'bg-purple-100 text-purple-700',
  };

  const filteredExams = exams.filter(e =>
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.class?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingCount = exams.filter(e => e.status === 'scheduled' && new Date(e.date) >= new Date()).length;
  const completedCount = exams.filter(e => e.status === 'completed' || new Date(e.date) < new Date()).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exams</h1>
          <p className="text-muted-foreground">Exam scheduling and management</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />Schedule Exam
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-orange-500" />
            <div><p className="text-2xl font-bold stat-value">{exams.length}</p><p className="text-sm text-muted-foreground">Total Exams</p></div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div><p className="text-2xl font-bold stat-value">{upcomingCount}</p><p className="text-sm text-muted-foreground">Upcoming</p></div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-green-500" />
            <div><p className="text-2xl font-bold stat-value">{completedCount}</p><p className="text-sm text-muted-foreground">Completed</p></div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold stat-value">{new Set(exams.map(e => e.subject)).size}</p>
              <p className="text-sm text-muted-foreground">Subjects</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search exams by title, subject or class..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
      </div>

      {/* Exam Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Exam' : 'Schedule Exam'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="Mathematics Final" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="Mathematics" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <input value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="10-A" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                    <option value="midterm">Midterm</option>
                    <option value="final">Final</option>
                    <option value="quiz">Quiz</option>
                    <option value="weekly">Weekly Test</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (min)</label>
                  <input type="number" min="15" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Marks</label>
                  <input type="number" min="1" value={form.totalMarks} onChange={e => setForm(f => ({ ...f, totalMarks: Number(e.target.value) }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="Hall A / Room 101" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving || !form.title}>
                  {saving ? 'Saving...' : editingId ? 'Update Exam' : 'Schedule Exam'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Cards */}
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}</div>
      ) : filteredExams.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border rounded-lg">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No exams found. Schedule one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExams.map(exam => (
            <Card key={exam.id} className="p-4 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold">{exam.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[exam.type] || 'bg-gray-100 text-gray-700'}`}>{exam.type}</span>
                    <Badge variant="secondary" className="text-[10px]">{exam.class}</Badge>
                    <Badge className={
                      exam.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      exam.status === 'completed' ? 'bg-green-100 text-green-700' :
                      exam.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }>{exam.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                    {exam.date && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    )}
                    {exam.time && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{exam.time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{exam.duration} min</span>
                    </div>
                    {exam.location && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{exam.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{exam.totalMarks} marks</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 ml-3">
                  <button onClick={() => { setEditingId(exam.id); setForm({ title: exam.title, subject: exam.subject, class: exam.class, date: exam.date, time: exam.time || '', duration: exam.duration, location: exam.location || '', type: exam.type, totalMarks: exam.totalMarks, status: exam.status }); setShowForm(true); }} className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => handleDelete(exam.id)} className="p-2 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
