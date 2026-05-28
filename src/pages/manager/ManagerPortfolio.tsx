import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ScrollText, Award, GraduationCap, ThumbsUp,
  User, BookOpen, Target, ExternalLink
} from 'lucide-react';

interface Portfolio {
  studentId: string; studentName: string; achievements: number; endorsements: number; collegeApps: number;
}

export default function ManagerPortfolio() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Portfolio[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [collegeApps, setCollegeApps] = useState<any[]>([]);
  const [endorsements, setEndorsements] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const s = await api.getStudents().catch(() => []);
        const data = Array.isArray(s) ? s.map((st: any) => ({
          studentId: st.id || st._id,
          studentName: st.name || st.studentName || 'Unknown',
          achievements: 0,
          endorsements: 0,
          collegeApps: 0,
        })) : [];
        setStudents(data);
        const a = await api.getAchievements().catch(() => []);
        setAchievements(Array.isArray(a) ? a : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadPortfolio = async (id: string) => {
    if (!id) return;
    setSelectedStudent(id);
    try {
      const [p, c, e] = await Promise.all([
        api.getStudentPortfolio(id).catch(() => null),
        api.getCollegeApps(id).catch(() => []),
        api.getEndorsements(id).catch(() => []),
      ]);
      setPortfolio(p);
      setCollegeApps(Array.isArray(c) ? c : []);
      setEndorsements(Array.isArray(e) ? e : []);
    } catch {
      setPortfolio(null);
      setCollegeApps([]);
      setEndorsements([]);
    }
  };

  const totalAchievements = achievements.filter((a: any) =>
    a.studentId === selectedStudent || a.studentName?.includes(students.find(s => s.studentId === selectedStudent)?.studentName || '')
  ).length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio Overview</h1>
        <p className="text-muted-foreground">Student portfolios, achievements & college applications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><ScrollText className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{students.length}</p><p className="text-sm text-muted-foreground">Portfolios Active</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Award className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{achievements.length}</p><p className="text-sm text-muted-foreground">Total Achievements</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><GraduationCap className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{collegeApps.filter((c: any) => c.status === 'in-progress' || c.status === 'pending').length}</p><p className="text-sm text-muted-foreground">College Apps In Progress</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><ThumbsUp className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{endorsements.length}</p><p className="text-sm text-muted-foreground">Endorsements</p></div></div></Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Student Portfolio</h3>
        <div className="mb-4">
          <select
            value={selectedStudent}
            onChange={(e) => loadPortfolio(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-background"
          >
            <option value="">Select a student...</option>
            {students.map(s => (
              <option key={s.studentId} value={s.studentId}>{s.studentName}</option>
            ))}
          </select>
        </div>
        {!selectedStudent ? (
          <p className="text-muted-foreground text-center py-8">Select a student to view their portfolio</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-3 bg-accent"><p className="text-xs text-muted-foreground">Achievements</p><p className="text-lg font-bold">{totalAchievements}</p></Card>
              <Card className="p-3 bg-accent"><p className="text-xs text-muted-foreground">College Apps</p><p className="text-lg font-bold">{collegeApps.length}</p></Card>
              <Card className="p-3 bg-accent"><p className="text-xs text-muted-foreground">Endorsements</p><p className="text-lg font-bold">{endorsements.length}</p></Card>
            </div>
            {collegeApps.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-orange-500" />College Applications</h4>
                <div className="space-y-2">
                  {collegeApps.map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                      <div><p className="text-sm font-medium">{app.collegeName || app.university}</p><p className="text-xs text-muted-foreground">{app.program || app.course}</p></div>
                      <div className="flex items-center gap-2">
                        <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'destructive' : 'warning'}>{app.status}</Badge>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
