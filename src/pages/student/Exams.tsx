import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { FileText, Calendar, Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  type: 'midterm' | 'final' | 'quiz' | 'test';
  syllabus: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  marks?: number;
  totalMarks?: number;
}

export default function StudentExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

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
      <div>
        <h1 className="text-2xl font-bold">Exams</h1>
        <p className="text-muted-foreground">Upcoming & past exams</p>
      </div>

      <div className="flex gap-2">
        {['all', 'upcoming', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-accent hover:bg-accent/80'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : (
        <div className="space-y-4">
          {filteredExams.map(exam => (
            <Card key={exam.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-lg">{exam.title}</h3>
                    <Badge className={getTypeColor(exam.type)}>{exam.type}</Badge>
                    {exam.status === 'upcoming' && <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Upcoming</Badge>}
                    {exam.status === 'completed' && <Badge variant="outline"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
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
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Syllabus: {exam.syllabus}</p>
                </div>
                {exam.status === 'completed' && exam.marks !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-500">{exam.marks}/{exam.totalMarks}</p>
                    <p className="text-sm text-muted-foreground">{Math.round((exam.marks / (exam.totalMarks || 1)) * 100)}%</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredExams.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No exams</h3>
          <p className="text-muted-foreground">No exams scheduled for this period</p>
        </div>
      )}
    </div>
  );
}