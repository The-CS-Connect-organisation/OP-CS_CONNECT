import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { normalizeAcademicPercentage, formatPercentage } from '@/lib/utils';
import { BarChart3, Users, TrendingUp, DollarSign, GraduationCap, Bus } from 'lucide-react';
import { FinanceChart, AttendanceChart } from '../../components/ui/Charts';
import { GenderBreakdownChart, DemographicPieChart } from '../../components/ui/RadialChart';

export default function ManagerAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    avgAttendance: 0,
    avgGpa: 0,
    revenue: 0,
    expenses: 0,
    maleStudents: 0,
    femaleStudents: 0,
    studentTrend: [] as { month: string; count: number }[],
    performanceByClass: [] as { class: string; avg: number }[],
    financeData: [] as { name: string; income: number; expense: number }[],
    attendanceTrend: [] as { name: string; present: number; absent: number }[],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getManagerAnalytics();
      if (data) setStats(data);
    } catch (err) {
      console.error('[ManagerAnalytics] Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">School-wide analytics</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 card-hover"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold stat-value">{stats.totalStudents}</p><p className="text-sm text-muted-foreground">Students</p></div></div></Card>
            <Card className="p-4 card-hover"><div className="flex items-center gap-3"><GraduationCap className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold stat-value">{stats.totalTeachers}</p><p className="text-sm text-muted-foreground">Teachers</p></div></div></Card>
            <Card className="p-4 card-hover"><div className="flex items-center gap-3"><TrendingUp className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold stat-value">{stats.avgAttendance}%</p><p className="text-sm text-muted-foreground">Attendance</p></div></div></Card>
            <Card className="p-4 card-hover"><div className="flex items-center gap-3"><BarChart3 className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold stat-value">{formatPercentage(normalizeAcademicPercentage(stats.avgGpa))}</p><p className="text-sm text-muted-foreground">Avg Academic %</p></div></div></Card>
            <Card className="p-4 card-hover"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold stat-value">${stats.revenue.toLocaleString()}</p><p className="text-sm text-muted-foreground">Revenue</p></div></div></Card>
            <Card className="p-4 card-hover"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-red-500" /><div><p className="text-2xl font-bold stat-value">${stats.expenses.toLocaleString()}</p><p className="text-sm text-muted-foreground">Expenses</p></div></div></Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[400px]">
              <FinanceChart data={stats.financeData || []} />
            </div>
            <div className="h-[400px]">
              <AttendanceChart data={stats.attendanceTrend || []} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-[350px]">
              <GenderBreakdownChart male={stats.maleStudents} female={stats.femaleStudents} />
            </div>
            <div className="h-[350px]">
              <DemographicPieChart
                title="Class Performance Distribution"
                data={stats.performanceByClass.map(c => ({ name: c.class, value: c.avg }))}
              />
            </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Performance by Class</h3>
            <div className="space-y-3">
              {stats.performanceByClass.map(cls => (
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
          </div>
        </>
      )}
    </div>
  );
}
