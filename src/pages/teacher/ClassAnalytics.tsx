import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { BarChart3, TrendingUp, Users, Award, BookOpen, Target } from 'lucide-react';

export default function TeacherClassAnalytics() {
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [stats, setStats] = useState({
    avgGrade: 0,
    attendance: 0,
    totalStudents: 0,
    topPerformer: '',
    subjects: [] as { name: string; avg: number }[],
    gradeDistribution: [] as { grade: string; count: number }[],
  });

  useEffect(() => {
    loadStats();
  }, [selectedClass]);

  const loadStats = async () => {
    try {
      setLoading(true);
      let data = await api.getClassAnalytics(selectedClass);
      if (data) {
        data = {
          ...data,
          gradeDistribution: Array.isArray(data.gradeDistribution) ? data.gradeDistribution : (data.gradeDistribution ? [data.gradeDistribution] : []),
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
        }
        setStats(data);
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Class Analytics</h1>
          <p className="text-muted-foreground">Class performance insights</p>
        </div>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          {['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgGrade.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Average Grade</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.attendance}%</p>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-lg font-bold truncate">{stats.topPerformer}</p>
                  <p className="text-sm text-muted-foreground">Top Performer</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Subject Averages</h3>
              <div className="space-y-3">
                {stats.subjects.map(subject => (
                  <div key={subject.name} className="flex items-center justify-between">
                    <span className="text-sm">{subject.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-accent rounded-full">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${subject.avg}%` }} />
                      </div>
                      <span className="text-sm font-medium">{subject.avg}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Grade Distribution</h3>
              <div className="space-y-3">
                {stats.gradeDistribution.map(dist => (
                  <div key={dist.grade} className="flex items-center justify-between">
                    <Badge variant="secondary">{dist.grade}</Badge>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-accent rounded-full">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(dist.count / stats.totalStudents) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium">{dist.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}