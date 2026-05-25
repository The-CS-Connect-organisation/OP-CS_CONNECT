import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { FileText, Plus, Edit, Trash2, Calendar, Clock, MapPin, Users } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  subject: string;
  class: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  type: 'midterm' | 'final' | 'quiz' | 'test';
  totalMarks: number;
  status: 'scheduled' | 'ongoing' | 'completed';
}

export default function TeacherManageExams() {
  const { user } = useAuthStore();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subject: 'Math', class: '10-A', date: '', time: '', duration: 60, location: '', type: 'test' as Exam['type'], totalMarks: 100 });

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await api.getExams();
      setExams(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      const newExam = await api.createExam({ ...form, teacherId: user?.id });
      setExams(prev => [...prev, newExam]);
      setForm({ title: '', subject: 'Math', class: '10-A', date: '', time: '', duration: 60, location: '', type: 'test', totalMarks: 100 });
      setShowForm(false);
    } catch {
      // error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteExam(id);
      setExams(prev => prev.filter(e => e.id !== id));
    } catch {
      // error
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'final': return 'bg-red-100 text-red-700';
      case 'midterm': return 'bg-orange-100 text-orange-700';
      case 'quiz': return 'bg-blue-100 text-blue-700';
      case 'test': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Exams</h1>
          <p className="text-muted-foreground">Schedule & manage exams</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Exam
        </Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Schedule Exam</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
              {['Math', 'Science', 'English', 'History', 'Geography', 'Art'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
              {['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="px-3 py-2 rounded-lg border bg-background">
              <option value="test">Test</option>
              <option value="quiz">Quiz</option>
              <option value="midterm">Midterm</option>
              <option value="final">Final</option>
            </select>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="number" placeholder="Duration (min)" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 60 })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="number" placeholder="Total Marks" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value) || 100 })} className="px-3 py-2 rounded-lg border bg-background" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreate}>Schedule</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <div className="space-y-4">
          {exams.map(exam => (
            <Card key={exam.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-lg">{exam.title}</h3>
                    <Badge className={getTypeColor(exam.type)}>{exam.type}</Badge>
                    <Badge variant="secondary">{exam.class}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(exam.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{exam.time} ({exam.duration} min)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{exam.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{exam.totalMarks} marks</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(exam.id)} className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {exams.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No exams scheduled</h3>
          <p className="text-muted-foreground">Schedule your first exam to get started</p>
        </div>
      )}
    </div>
  );
}
