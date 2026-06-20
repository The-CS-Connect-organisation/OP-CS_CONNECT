import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FileText, Plus, Calendar, Clock, MapPin, Users } from 'lucide-react';
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
}

export default function ManagerExams() {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await api.getExams();
        setExams(data);
      } catch (err) {
        console.error('[ManagerExams] Failed to load:', err);
      }
    }
    loadExams();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'final': return 'bg-red-100 text-red-700';
      case 'midterm': return 'bg-orange-100 text-orange-700';
      case 'quiz': return 'bg-blue-100 text-blue-700';
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" />{new Date(exam.date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" />{exam.time} ({exam.duration} min)</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" />{exam.location}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="w-4 h-4" />{exam.totalMarks} marks</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
