import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { BarChart3, TrendingUp, Calendar, BookOpen } from 'lucide-react';

interface GradeRecord {
  id: string;
  subject: string;
  assignment: string;
  marks: number;
  totalMarks: number;
  date: string;
  grade: string;
  teacher: string;
}

export default function ParentGrades() {
  const { user } = useAuthStore();
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState('child1');

  useEffect(() => {
    loadGrades();
  }, [selectedChild]);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const data = await api.getChildGrades(selectedChild);
      setGrades(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const avgGrade = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + (g.marks / g.totalMarks) * 100, 0) / grades.length) : 0;

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-700';
    if (percentage >= 75) return 'bg-orange-100 text-orange-700';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Child Grades</h1>
          <p className="text-muted-foreground">Academic performance</p>
        </div>
        <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          <option value="child1">Child 1</option>
          <option value="child2">Child 2</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{avgGrade}%</p>
              <p className="text-sm text-muted-foreground">Average Grade</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{grades.length}</p>
              <p className="text-sm text-muted-foreground">Total Grades</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{new Set(grades.map(g => g.subject)).size}</p>
              <p className="text-sm text-muted-foreground">Subjects</p>
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {grades.map(grade => {
            const percentage = Math.round((grade.marks / grade.totalMarks) * 100);
            return (
              <Card key={grade.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{grade.assignment}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{grade.subject}</span>
                      <span>•</span>
                      <span>{grade.teacher}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(grade.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{grade.marks}/{grade.totalMarks}</p>
                    <Badge className={getGradeColor(percentage)}>{percentage}%</Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
