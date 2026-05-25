import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { BarChart3, Users, TrendingUp, DollarSign, GraduationCap, Bus, BookOpen, AlertCircle } from 'lucide-react';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    avgAttendance: 0,
    avgGpa: 0,
    revenue: 0,
    expenses: 0,
    studentTrend: [] as { month: string; count: number }[],
    performanceByClass: [] as { class: string; avg: number }[],
    attendanceTrend: [] as { month: string; rate: number }[],
    feeCollection: { collected: 0, pending: 0 },
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminAnalytics();
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
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">School-wide analytics dashboard</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalTeachers}</p>
                  <p className="text-sm text-muted-foreground">Total Teachers</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgAttendance}%</p>
                  <p className="text-sm text-muted-foreground">Avg Attendance</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgGpa}</p>
                  <p className="text-sm text-muted-foreground">Avg GPA</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">${stats.revenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">${stats.expenses.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Expenses</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Performance by Class</h3>
              <div className="space-y-3">
                {stats.performanceByClass.map(cls => (
                  <div key={cls.class} className="flex items-center justify-between">
                    <span className="text-sm">{cls.class}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-accent rounded-full">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${cls.avg}%` }} />
                      </div>
                      <span className="text-sm font-medium">{cls.avg}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Fee Collection</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Collected</span>
                    <span className="font-medium text-green-500">${stats.feeCollection.collected.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-accent rounded-full">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.feeCollection.collected / (stats.feeCollection.collected + stats.feeCollection.pending)) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pending</span>
                    <span className="font-medium text-red-500">${stats.feeCollection.pending.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-accent rounded-full">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.feeCollection.pending / (stats.feeCollection.collected + stats.feeCollection.pending)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
