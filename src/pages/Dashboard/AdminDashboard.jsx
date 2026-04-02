import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, FileText, TrendingUp, Award, Bell, Calendar, BarChart3 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
    </Card>
  </motion.div>
);

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export const AdminDashboard = ({ user }) => {
  const { data: users } = useStore(KEYS.USERS, []);
  const { data: assignments } = useStore(KEYS.ASSIGNMENTS, []);
  const { data: attendance } = useStore(KEYS.ATTENDANCE, []);
  const { data: marks } = useStore(KEYS.MARKS, []);
  const { data: announcements } = useStore(KEYS.ANNOUNCEMENTS, []);

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');

  // Attendance by class
  const classAttendance = ['10-A', '10-B'].map(cls => {
    const classStudents = students.filter(s => s.class === cls);
    const classAttendance = attendance.filter(a => classStudents.some(s => s.id === a.studentId));
    const present = classAttendance.filter(a => a.status === 'present').length;
    const rate = classAttendance.length > 0 ? Math.round((present / classAttendance.length) * 100) : 0;
    return { class: cls, attendance: rate };
  });

  // Grade distribution
  const gradeDist = marks.reduce((acc, m) => {
    acc[m.grade] = (acc[m.grade] || 0) + 1;
    return acc;
  }, {});
  const gradePieData = Object.entries(gradeDist).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard 🏫</h1>
          <p className="text-white/80">School overview and management controls.</p>
        </div>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity }} className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={students.length} color="from-blue-500 to-cyan-500" delay={0.1} />
        <StatCard icon={UserCheck} label="Teachers" value={teachers.length} color="from-purple-500 to-pink-500" delay={0.2} />
        <StatCard icon={FileText} label="Assignments" value={assignments.length} color="from-emerald-500 to-teal-500" delay={0.3} />
        <StatCard icon={TrendingUp} label="Avg. Attendance" value={Math.round(attendance.filter(a => a.status === 'present').length / Math.max(attendance.length, 1) * 100)} color="from-orange-500 to-red-500" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Class-wise Attendance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={classAttendance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="class" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="attendance" fill="#0ea5e9" radius={[8, 8, 0, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Grade Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={gradePieData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={5} dataKey="value">
                  {gradePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Announcements</h3>
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color={a.priority === 'high' ? 'red' : a.priority === 'medium' ? 'orange' : 'gray'}>{a.priority}</Badge>
                    <span className="text-xs text-gray-400">{a.date}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{a.title}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: 'Manage Users', color: 'from-blue-500 to-cyan-500' },
                { icon: Bell, label: 'Announcements', color: 'from-purple-500 to-pink-500' },
                { icon: Calendar, label: 'Timetable', color: 'from-emerald-500 to-teal-500' },
                { icon: BarChart3, label: 'Analytics', color: 'from-orange-500 to-red-500' },
              ].map((action, idx) => (
                <motion.button key={idx} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="p-4 rounded-xl bg-gradient-to-br text-white text-left">
                  <action.icon size={24} className="mb-2" />
                  <p className="text-sm font-medium">{action.label}</p>
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
