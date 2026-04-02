import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, MapPin, BookOpen, Award, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const Profile = ({ user }) => {
  const { data: marks } = useStore(KEYS.MARKS, []);
  const { data: attendance } = useStore(KEYS.ATTENDANCE, []);

  const myMarks = marks.filter(m => m.studentId === user.id);
  const avgMarks = myMarks.length > 0 ? Math.round(myMarks.reduce((a, b) => a + b.marksObtained, 0) / myMarks.length) : 0;

  const myAttendance = attendance.filter(a => a.studentId === user.id);
  const attendanceRate = myAttendance.length > 0 ? Math.round((myAttendance.filter(a => a.status === 'present').length / myAttendance.length) * 100) : 0;

  const infoFields = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone },
    { icon: Calendar, label: 'Joined', value: user.joined },
    { icon: BookOpen, label: 'Class', value: user.class },
    { icon: MapPin, label: 'Roll No', value: user.rollNo },
    { icon: User, label: 'Parent', value: user.parentName },
    { icon: Phone, label: 'Parent Phone', value: user.parentPhone },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 p-8 text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl">
            {user.avatar}
          </motion.div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-white/70">Student • Class {user.class}</p>
            <p className="text-sm text-white/50 mt-1">Roll No: {user.rollNo}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity }} className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full" />
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Award, label: 'Average Score', value: `${avgMarks}%`, color: 'from-purple-500 to-pink-500' },
          { icon: TrendingUp, label: 'Attendance', value: `${attendanceRate}%`, color: 'from-emerald-500 to-teal-500' },
          { icon: Calendar, label: 'Days Enrolled', value: Math.floor((Date.now() - new Date(user.joined).getTime()) / (1000 * 60 * 60 * 24)), color: 'from-blue-500 to-cyan-500' },
        ].map((s, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="text-center">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mx-auto mb-3`}>
                <s.icon size={22} />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Personal Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoFields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                  <field.icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{field.label}</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
