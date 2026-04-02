import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, TrendingUp, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MarksChart, SubjectWiseChart } from '../../components/charts/MarksChart';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

const StatCard = ({ icon: Icon, label, value, change, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        {change && <p className="text-xs text-emerald-500 font-medium">{change}</p>}
      </div>
    </Card>
  </motion.div>
);

export const StudentDashboard = ({ user }) => {
  const { data: assignments } = useStore(KEYS.ASSIGNMENTS, []);
  const { data: marks } = useStore(KEYS.MARKS, []);
  const { data: attendance } = useStore(KEYS.ATTENDANCE, []);
  const { data: timetable } = useStore(KEYS.TIMETABLE, {});
  const { data: announcements } = useStore(KEYS.ANNOUNCEMENTS, []);

  const myAssignments = assignments.filter(a => a.class === user.class);
  const pendingAssignments = myAssignments.filter(a => {
    const sub = a.submissions.find(s => s.studentId === user.id);
    return !sub || sub.status === 'pending';
  });
  const gradedAssignments = myAssignments.filter(a => {
    const sub = a.submissions.find(s => s.studentId === user.id);
    return sub && sub.status === 'graded';
  });

  const myMarks = marks.filter(m => m.studentId === user.id);
  const avgMarks = myMarks.length > 0 ? Math.round(myMarks.reduce((a, b) => a + b.marksObtained, 0) / myMarks.length) : 0;

  const myAttendance = attendance.filter(a => a.studentId === user.id);
  const presentCount = myAttendance.filter(a => a.status === 'present').length;
  const attendanceRate = myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 0;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = timetable[user.class]?.find(t => t.day === today)?.slots || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8 gradient-bg text-white">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user.name.split(' ')[0]}! 🎓</h1>
          <p className="text-white/80">Here's what's happening in your academic journey today.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className="bg-white/20 text-white border-none">Class: {user.class}</Badge>
            <Badge className="bg-white/20 text-white border-none">Roll: {user.rollNo}</Badge>
            <Badge className="bg-white/20 text-white border-none">{today}</Badge>
          </div>
        </div>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute right-20 -top-10 w-32 h-32 bg-white/5 rounded-full" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Attendance" value={`${attendanceRate}%`} change="+2.3% this month" color="from-emerald-500 to-teal-500" delay={0.1} />
        <StatCard icon={FileText} label="Pending Tasks" value={pendingAssignments.length} change="Submit on time!" color="from-orange-500 to-red-500" delay={0.2} />
        <StatCard icon={Award} label="Avg. Score" value={`${avgMarks}%`} change={avgMarks >= 80 ? 'Excellent! 🌟' : 'Keep improving'} color="from-purple-500 to-pink-500" delay={0.3} />
        <StatCard icon={Clock} label="Classes Today" value={todaySchedule.length} change={todaySchedule[0]?.subject || 'No classes'} color="from-blue-500 to-indigo-500" delay={0.4} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="h-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Today's Schedule</h3>
            {todaySchedule.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No classes scheduled for today 🎉</p>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((slot, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {slot.time.split(' ')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{slot.subject}</p>
                      <p className="text-xs text-gray-500">{slot.teacher} • Room {slot.room}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Pending Assignments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="h-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Pending Assignments</h3>
            {pendingAssignments.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-emerald-500 mb-3" />
                <p className="text-gray-500">All caught up! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.map(a => {
                  const sub = a.submissions.find(s => s.studentId === user.id);
                  const isLate = new Date(a.dueDate) < new Date();
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{a.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{a.subject} • Due: {a.dueDate}</p>
                        </div>
                        {isLate && !sub?.submittedAt && <Badge color="red">Overdue</Badge>}
                      </div>
                      {sub?.submittedAt && <Badge color="blue">Submitted</Badge>}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Announcements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="h-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Announcements</h3>
            <div className="space-y-3">
              {announcements.slice(0, 4).map(a => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color={a.priority === 'high' ? 'red' : a.priority === 'medium' ? 'orange' : 'gray'}>{a.priority}</Badge>
                    <span className="text-xs text-gray-400">{a.date}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card><MarksChart data={myMarks} title="Marks Trend" /></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card><SubjectWiseChart data={myMarks} /></Card>
        </motion.div>
      </div>
    </div>
  );
};
