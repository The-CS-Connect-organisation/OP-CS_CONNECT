import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, Clock, TrendingUp, Award } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

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

export const TeacherDashboard = ({ user }) => {
  const { data: assignments } = useStore(KEYS.ASSIGNMENTS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  const { data: attendance } = useStore(KEYS.ATTENDANCE, []);
  const { data: announcements } = useStore(KEYS.ANNOUNCEMENTS, []);

  const myAssignments = assignments.filter(a => a.teacherId === user.id);
  const totalSubmissions = myAssignments.reduce((acc, a) => acc + a.submissions.filter(s => s.submittedAt).length, 0);
  const pendingGrading = myAssignments.reduce((acc, a) => acc + a.submissions.filter(s => s.status === 'submitted').length, 0);
  const students = users.filter(u => u.role === 'student');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {user.name}! 👨‍🏫</h1>
          <p className="text-white/80">Here's your teaching overview for today.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className="bg-white/20 text-white border-none">{user.department}</Badge>
            <Badge className="bg-white/20 text-white border-none">{user.subjects?.join(', ')}</Badge>
          </div>
        </div>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity }} className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="My Assignments" value={myAssignments.length} color="from-blue-500 to-cyan-500" delay={0.1} />
        <StatCard icon={CheckCircle} label="Total Submissions" value={totalSubmissions} color="from-emerald-500 to-teal-500" delay={0.2} />
        <StatCard icon={Clock} label="Pending Grading" value={pendingGrading} color="from-orange-500 to-red-500" delay={0.3} />
        <StatCard icon={Users} label="Total Students" value={students.length} color="from-purple-500 to-pink-500" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Assignments</h3>
            <div className="space-y-3">
              {myAssignments.map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.subject} • {a.class} • Due: {a.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{a.submissions.filter(s => s.submittedAt).length}/{students.length}</p>
                    <p className="text-xs text-gray-500">submitted</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Pending Submissions to Grade</h3>
            {pendingGrading === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-emerald-500 mb-3" />
                <p className="text-gray-500">All submissions graded! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAssignments.flatMap(a =>
                  a.submissions.filter(s => s.status === 'submitted').map(s => (
                    <div key={`${a.id}-${s.studentId}`} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{s.studentName}</p>
                        <p className="text-xs text-gray-500">{a.title} • Submitted: {s.submittedAt}</p>
                      </div>
                      <Badge color="orange">Needs Grading</Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
