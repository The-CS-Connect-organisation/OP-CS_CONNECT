import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AttendanceChart } from '../../components/charts/AttendanceChart';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const Attendance = ({ user }) => {
  const { data: attendance } = useStore(KEYS.ATTENDANCE, []);
  const myAttendance = attendance.filter(a => a.studentId === user.id);

  const stats = useMemo(() => {
    const total = myAttendance.length;
    const present = myAttendance.filter(a => a.status === 'present').length;
    const late = myAttendance.filter(a => a.status === 'late').length;
    const absent = total - present - late;
    return { total, present, late, absent, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
  }, [myAttendance]);

  // Group by subject
  const subjectStats = useMemo(() => {
    const map = {};
    myAttendance.forEach(a => {
      if (!map[a.subject]) map[a.subject] = { total: 0, present: 0 };
      map[a.subject].total++;
      if (a.status === 'present' || a.status === 'late') map[a.subject].present++;
    });
    return Object.entries(map).map(([subject, data]) => ({
      subject,
      ...data,
      rate: Math.round((data.present / data.total) * 100)
    }));
  }, [myAttendance]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <CheckSquare className="text-primary-500" /> Attendance Record
        </h1>
        <p className="text-gray-500 mt-1">Track your attendance across all subjects</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall Rate', value: `${stats.rate}%`, color: stats.rate >= 75 ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-orange-500' },
          { label: 'Present', value: stats.present, color: 'from-emerald-500 to-green-500' },
          { label: 'Late', value: stats.late, color: 'from-amber-500 to-yellow-500' },
          { label: 'Absent', value: stats.absent, color: 'from-red-500 to-pink-500' },
        ].map((s, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="text-center">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mx-auto mb-3`}>
                <TrendingUp size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card><AttendanceChart data={myAttendance} title="Daily Attendance (Last 30 Days)" /></Card>
      </motion.div>

      {/* Subject-wise */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Subject-wise Attendance</h3>
          <div className="space-y-3">
            {subjectStats.map(s => (
              <div key={s.subject} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-40 truncate">{s.subject}</span>
                <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${s.rate}%` }} transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${s.rate >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : s.rate >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}
                  />
                </div>
                <Badge color={s.rate >= 75 ? 'green' : s.rate >= 50 ? 'yellow' : 'red'}>{s.rate}%</Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
