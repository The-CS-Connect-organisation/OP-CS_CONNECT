import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { GraduationCap, Users, BarChart3, TrendingUp, BookOpen, Calendar } from 'lucide-react';

export default function ManagerAcademics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    avgGpa: 0,
    attendanceRate: 0,
    classPerformance: [] as { class: string; avg: number }[],
    subjectPerformance: [] as { subject: string; avg: number }[],
    upcomingExams: [] as { title: string; date: string; class: string }[],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getManagerAcademics();
      if (data) setStats(data);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Academics</h1>
        <p className="text-muted-foreground">Academic management</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center gap-3"><GraduationCap className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.totalClasses}</p><p className="text-sm text-muted-foreground">Classes</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.totalStudents}</p><p className="text-sm text-muted-foreground">Students</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><BarChart3 className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.avgGpa}</p><p className="text-sm text-muted-foreground">Avg GPA</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><TrendingUp className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.attendanceRate}%</p><p className="text-sm text-muted-foreground">Attendance</p></div></div></Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Class Performance</h3>
              <div className="space-y-3">
                {stats.classPerformance.map(cls => (
                  <div key={cls.class} className="flex items-center justify-between">
                    <span className="text-sm">{cls.class}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-accent rounded-full"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${cls.avg}%` }} /></div>
                      <span className="text-sm font-medium">{cls.avg}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Upcoming Exams</h3>
              <div className="space-y-3">
                {stats.upcomingExams.map((exam, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div><p className="font-medium">{exam.title}</p><p className="text-sm text-muted-foreground">{exam.class}</p></div>
                    <span className="text-sm text-muted-foreground">{new Date(exam.date).toLocaleDateString()}</span>
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
