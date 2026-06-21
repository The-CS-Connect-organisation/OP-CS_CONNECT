import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { FileText, Plus, Edit, Trash2, Calendar, Clock, MapPin } from 'lucide-react';

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

export default function AdminExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all');

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

  const filteredExams = exams.filter(e => filter === 'all' || e.status === filter);

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
          <h1 className="text-2xl font-bold">Exams</h1>
          <p className="text-muted-foreground">Exam management</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Schedule Exam</Button>
      </div>

      <div className="flex gap-2">
        {['all', 'scheduled', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-accent hover:bg-accent/80'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <div className="space-y-4">
          {filteredExams.map(exam => (
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
                    <div className="text-sm text-muted-foreground">
                      <span>{exam.totalMarks} marks</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => {}} className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
