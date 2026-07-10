import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { normalizeAcademicPercentage, formatPercentage } from '@/lib/utils';
import { User, TrendingUp, BookOpen, Calendar, BarChart3 } from 'lucide-react';

interface StudentProgress {
  id: string;
  name: string;
  class: string;
  gpa: number;
  attendance: number;
  assignments: { completed: number; total: number };
  exams: { passed: number; total: number };
  trend: 'up' | 'down' | 'stable';
  subjects: { name: string; grade: number }[];
}

export default function TeacherStudentProgress() {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, [selectedClass]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentProgress(selectedClass);
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const selected = students.find(s => s.id === selectedStudent);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Progress</h1>
          <p className="text-muted-foreground">Individual student tracking</p>
        </div>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          {['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {students.map(student => (
              <Card
                key={student.id}
                className={`p-4 cursor-pointer transition-colors ${selectedStudent === student.id ? 'border-orange-500 bg-orange-50/30' : 'hover:border-orange-200'}`}
                onClick={() => setSelectedStudent(student.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{student.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Score: {formatPercentage(normalizeAcademicPercentage(student.gpa))}</span>
                      <span>•</span>
                      <span>{student.attendance}%</span>
                    </div>
                  </div>
                  <Badge className={student.trend === 'up' ? 'bg-green-100 text-green-700' : student.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
                    {student.trend}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="w-7 h-7 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selected.name}</h2>
                    <p className="text-muted-foreground">Class {selected.class}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-accent rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-500">{formatPercentage(normalizeAcademicPercentage(selected.gpa))}</p>
                    <p className="text-sm text-muted-foreground">Academic %</p>
                  </div>
                  <div className="p-3 bg-accent rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-500">{selected.attendance}%</p>
                    <p className="text-sm text-muted-foreground">Attendance</p>
                  </div>
                  <div className="p-3 bg-accent rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-500">{selected.assignments?.completed ?? 0}/{selected.assignments?.total ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Assignments</p>
                  </div>
                  <div className="p-3 bg-accent rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-500">{selected.exams?.passed ?? 0}/{selected.exams?.total ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Exams Passed</p>
                  </div>
                </div>

                <h3 className="font-semibold mb-3">Subject Performance</h3>
                <div className="space-y-3">
                  {(selected.subjects || []).map(subject => (
                    <div key={subject.name} className="flex items-center justify-between">
                      <span className="text-sm">{subject.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-accent rounded-full">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${subject.grade}%` }} />
                        </div>
                        <span className="text-sm font-medium">{subject.grade}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a student</h3>
                <p className="text-muted-foreground">Click on a student to view their progress details</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}