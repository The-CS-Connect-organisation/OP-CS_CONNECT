import { useState, useEffect } from 'react';
import { api, apiFetch } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { BarChart3, TrendingUp, AlertTriangle, Users } from 'lucide-react';

interface ClassItem { id: string; name: string; }

interface ClassAnalytics {
  classAverage?: number;
  topScore?: number;
  atRiskCount?: number;
  complianceScore?: number;
  gradeDistribution?: Record<string, number>;
  weakAreas?: Array<{ subjectName: string; averageScore: number; studentsBelow60: number }>;
  totalStudents?: number;
  attendanceRate?: number;
}

export default function AdminAnalytics() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCourses().then((data: any) => {
      const list = Array.isArray(data) ? data.map((c: any) => ({ id: c.id, name: c.name || c.code })) : [];
      setClasses(list);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedClassId) { setAnalytics(null); return; }
    setLoading(true);
    setError('');
    apiFetch(`/analytics/class/${selectedClassId}`, {
      
    })
      .then((data: any) => { setAnalytics(data.analytics || data); setLoading(false); })
      .catch((err: any) => { setError(`Failed to load analytics: ${err.message}`); setLoading(false); });
  }, [selectedClassId]);

  const stats = [
    {
      label: 'Class Average',
      value: analytics?.classAverage != null ? `${analytics.classAverage.toFixed(1)}%` : '--',
      icon: BarChart3,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      label: 'Top Score',
      value: analytics?.topScore != null ? `${analytics.topScore.toFixed(1)}%` : '--',
      icon: TrendingUp,
      bg: 'bg-green-50',
      color: 'text-green-600',
    },
    {
      label: 'At-Risk Students',
      value: analytics?.atRiskCount != null ? String(analytics.atRiskCount) : '--',
      icon: AlertTriangle,
      bg: 'bg-red-50',
      color: 'text-red-600',
    },
    {
      label: 'Compliance Score',
      value: analytics?.complianceScore != null ? `${analytics.complianceScore.toFixed(1)}%` : '--',
      icon: Users,
      bg: 'bg-purple-50',
      color: 'text-purple-600',
    },
  ];

  const gradeEntries = analytics?.gradeDistribution
    ? Object.entries(analytics.gradeDistribution).sort(([a], [b]) => a.localeCompare(b))
    : [];

  const maxGradeCount = gradeEntries.reduce((m, [, v]) => Math.max(m, v), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Performance Analytics</h1>
        <p className="text-muted-foreground">School-wide class performance tracking</p>
      </div>

      {/* Class Selector */}
      <Card className="p-4">
        <label className="block text-sm font-medium mb-1">Select Class</label>
        <select
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value)}
          className="w-full max-w-xs border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="">Select a class to view analytics</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className={`text-xl font-bold ${loading ? 'text-muted-foreground' : ''}`}>
                    {loading ? '...' : s.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade Distribution */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Grade Distribution</h2>
            {gradeEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No grade distribution data.</p>
            ) : (
              <div className="space-y-3">
                {gradeEntries.map(([grade, count]) => (
                  <div key={grade} className="flex items-center gap-3">
                    <span className="text-sm font-bold w-8">{grade}</span>
                    <div className="flex-1 bg-muted rounded-full h-4">
                      <div
                        className="bg-primary h-4 rounded-full transition-all"
                        style={{ width: maxGradeCount > 0 ? `${(count / maxGradeCount) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-10 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
            {analytics.totalStudents != null && (
              <p className="text-xs text-muted-foreground mt-4">Total students: {analytics.totalStudents}</p>
            )}
          </Card>

          {/* Weak Area Interventions */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Weak Area Interventions</h2>
            {!analytics.weakAreas || analytics.weakAreas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No students flagged for intervention at this time.
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.weakAreas.map(area => (
                  <div key={area.subjectName} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{area.subjectName}</p>
                      <p className="text-xs text-muted-foreground">Avg: {area.averageScore.toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs">
                        {area.studentsBelow60} below 60%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {analytics.attendanceRate != null && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Attendance Rate</span>
                  <span className={`font-bold text-sm ${analytics.attendanceRate >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.attendanceRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {!selectedClassId && !loading && (
        <Card className="p-12 text-center text-muted-foreground text-sm">
          Select a class above to view performance analytics.
        </Card>
      )}
    </div>
  );
}
