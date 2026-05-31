import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { normalizeAcademicPercentage, formatPercentage } from '@/lib/utils';
import { BarChart3, Users, TrendingUp, DollarSign, GraduationCap } from 'lucide-react';
import { FinanceChart, AttendanceChart } from '../../components/ui/Charts';
import { GenderBreakdownChart, DemographicPieChart } from '../../components/ui/RadialChart';

interface User {
  role?: string;
  class?: string;
  className?: string;
  grade?: number;
  gpa?: number;
  average?: number;
  gender?: string;
  date?: string;
  status?: string;
  present?: boolean;
}

interface AttendanceRecord {
  status?: string;
  present?: boolean;
  date?: string;
  studentId?: string;
}

export default function AdminAnalytics() {
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
    attendanceTrend: [] as { name: string; present: number; absent: number }[],
    feeCollection: { collected: 0, pending: 0 },
    financeData: [] as { name: string; income: number; expense: number }[],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.getUsers(),
        api.getManagerFinance(),
        api.getAttendance(),
      ]);

      const [usersResult, financeResult, attendanceResult] = results;

      const users: User[] = usersResult.status === 'fulfilled' ? usersResult.value : [];
      const finance: any = financeResult.status === 'fulfilled' ? financeResult.value : {};
      const attendance: AttendanceRecord[] = attendanceResult.status === 'fulfilled' ? attendanceResult.value : [];

      const students = users.filter(u => u.role?.toLowerCase() === 'student');
      const teachers = users.filter(u => u.role?.toLowerCase() === 'teacher');
      const maleStudents = users.filter(u => u.role?.toLowerCase() === 'student' && u.gender?.toLowerCase() === 'male').length;
      const femaleStudents = users.filter(u => u.role?.toLowerCase() === 'student' && u.gender?.toLowerCase() === 'female').length;

      const totalStudents = students.length;
      const totalTeachers = teachers.length;

      const revenue = finance.revenue || 0;
      const expenses = finance.expenses || 0;
      const feeCollection = finance.feeCollection || { collected: 0, pending: 0 };

      const monthlyTrend = (finance.monthlyTrend || []).map((m: any) => ({
        name: m.month,
        income: m.revenue || 0,
        expense: m.expenses || 0,
      }));

      let avgAttendance = 0;
      if (attendance.length > 0) {
        const present = attendance.filter(a => a.status?.toLowerCase() === 'present' || a.present).length;
        avgAttendance = Math.round((present / attendance.length) * 100);
      }

      const dayMap = new Map<string, { present: number; absent: number }>();
      const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayOrder.forEach(d => dayMap.set(d, { present: 0, absent: 0 }));

      attendance.forEach(a => {
        const dateStr = (a as any).date || '';
        if (dateStr) {
          const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' });
          if (dayMap.has(dayName)) {
            const isPresent = a.status?.toLowerCase() === 'present' || a.present === true;
            if (isPresent) {
              dayMap.get(dayName)!.present++;
            } else {
              dayMap.get(dayName)!.absent++;
            }
          }
        }
      });

      const attendanceTrend = Array.from(dayMap.entries())
        .filter(([, v]) => v.present > 0 || v.absent > 0)
        .map(([name, v]) => ({ name, present: v.present, absent: v.absent }));

      const classMap = new Map<string, number[]>();
      students.forEach(s => {
        const cls = s.class || s.className || '';
        const score = s.gpa || s.average || s.grade || 0;
        if (cls && score) {
          if (!classMap.has(cls)) classMap.set(cls, []);
          classMap.get(cls)!.push(Number(score));
        }
      });
      const performanceByClass = Array.from(classMap.entries()).map(([cls, scores]) => ({
        class: cls,
        avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      }));

      const avgGpa = performanceByClass.length > 0
        ? Math.round(performanceByClass.reduce((s, c) => s + c.avg, 0) / performanceByClass.length)
        : 0;

      setStats({
        totalStudents,
        totalTeachers,
        avgAttendance,
        avgGpa,
        revenue,
        expenses,
        maleStudents,
        femaleStudents,
        studentTrend: [],
        performanceByClass,
        attendanceTrend,
        feeCollection,
        financeData: monthlyTrend,
      });
    } catch {
      // data remains 0s
    } finally {
      setLoading(false);
    }
  };

  const totalFees = stats.feeCollection.collected + stats.feeCollection.pending;
  const collectedPercent = totalFees > 0 ? (stats.feeCollection.collected / totalFees) * 100 : 0;
  const pendingPercent = totalFees > 0 ? (stats.feeCollection.pending / totalFees) * 100 : 0;

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
            <Card className="p-4 card-hover">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold stat-value">{stats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 card-hover">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold stat-value">{stats.totalTeachers}</p>
                  <p className="text-sm text-muted-foreground">Total Teachers</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 card-hover">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold stat-value">{stats.avgAttendance}%</p>
                  <p className="text-sm text-muted-foreground">Avg Attendance</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 card-hover">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold stat-value">{formatPercentage(normalizeAcademicPercentage(stats.avgGpa))}</p>
                  <p className="text-sm text-muted-foreground">Avg Academic %</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 card-hover">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold stat-value">${stats.revenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 card-hover">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold stat-value">${stats.expenses.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Expenses</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[400px]">
              <FinanceChart data={stats.financeData} />
            </div>
            <div className="h-[400px]">
              <AttendanceChart data={stats.attendanceTrend} />
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
              {stats.performanceByClass.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data</p>
              ) : (
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
              )}
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Fee Collection</h3>
              {totalFees === 0 ? (
                <p className="text-sm text-muted-foreground">No data</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Collected</span>
                      <span className="font-medium text-green-500">${stats.feeCollection.collected.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-accent rounded-full">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${collectedPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Pending</span>
                      <span className="font-medium text-red-500">${stats.feeCollection.pending.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-accent rounded-full">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${pendingPercent}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
