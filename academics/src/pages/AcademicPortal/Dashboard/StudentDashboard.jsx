import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, FileText, UserCheck, TrendingUp, AlertCircle, ChevronRight, Wrench, Users, MessageCircle } from 'lucide-react';
import { useProfile, useAssignments, useAttendance, useMarks, useAnnouncements } from '../../../hooks/useSchoolData';

const StatCard = ({ icon: Icon, label, value, subtitle, delay, color = '#1f2937' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="nova-card p-6 hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <span className="text-4xl font-bold tracking-tight block text-gray-900">{value}</span>
      {subtitle && (
        <div className="flex items-center gap-2 mt-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          <span className="text-xs text-gray-500">{subtitle}</span>
        </div>
      )}
    </motion.div>
  );
};

export const StudentDashboard = ({ user }) => {
  const { profile } = useProfile(user);
  const classroomId = user?.classroomId || profile?.classroomId;
  const { assignments } = useAssignments(classroomId);
  const { records: attendanceRecords } = useAttendance(user?.id);
  const { report: marksReport } = useMarks(user?.id);
  const { announcements } = useAnnouncements(classroomId);

  const pendingAssignments = assignments.filter(a => !a.submissions?.some(s => s.student_id === user.id));
  const avgMarks = marksReport?.percentage ?? 0;
  // Use attendance_percent from user object (set at login) as primary, fallback to computed
  const attendanceRate = user?.attendancePercent
    ?? (attendanceRecords.length > 0
      ? Math.round(attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length * 100)
      : 0);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = [];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full relative pt-2 pb-12">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="nova-card p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-blue-100 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gradient-to-tr from-purple-100 to-transparent blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-600 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Student Portal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {user.class}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 mb-3 text-gray-900">
            <span className="w-1 h-10 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <div className="flex flex-wrap gap-2 mt-4">
            {[`Class: ${user.class || user.grade && `${user.grade}-${user.section}` || 'N/A'}`, `ID: ${user.rollNo || user.admissionNo || 'N/A'}`, today].map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserCheck} label="Attendance" value={`${attendanceRate}%`} subtitle="Monthly average" delay={0.1} color="#10b981" />
        <StatCard icon={FileText} label="Pending Tasks" value={pendingAssignments.length} subtitle="Needs attention" delay={0.15} color="#f59e0b" />
        <StatCard icon={Award} label="Average Score" value={`${avgMarks}%`} subtitle="Performance" delay={0.2} color="#a855f7" />
        <StatCard icon={Clock} label="Classes Today" value={todaySchedule.length} subtitle="Scheduled" delay={0.25} color="#3b82f6" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Schedule */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Today's Schedule
          </h3>
          {todaySchedule.length === 0 ? (
            <div className="py-12 border border-dashed rounded-xl flex items-center justify-center border-gray-200">
              <p className="text-xs text-gray-500">No classes scheduled</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaySchedule.map((slot, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-gray-200 text-gray-700 flex-shrink-0">
                    {slot.time.split(' ')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{slot.subject}</p>
                    <p className="text-xs mt-0.5 text-gray-500">{slot.teacher} • Room {slot.room}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pending Assignments */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending Assignments
          </h3>
          {pendingAssignments.length === 0 ? (
            <div className="py-12 border border-dashed rounded-xl flex items-center justify-center border-gray-200">
              <p className="text-xs text-gray-500">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingAssignments.map(a => {
                const isLate = new Date(a.dueDate) < new Date();
                return (
                  <div key={a.id}
                    className="p-3.5 rounded-xl bg-gray-50 border border-gray-200"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                        <p className="text-xs mt-1 text-gray-500">{a.subject} • Due: {a.dueDate}</p>
                      </div>
                      {isLate && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 shrink-0">Overdue</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Announcements */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            Announcements
          </h3>
          <div className="space-y-3">
            {announcements.slice(0, 4).map(a => (
              <div key={a.id} className="border-l-2 pl-3 py-1.5 border-gray-200">
                <div className="flex justify-between items-center mb-0.5">
                  <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${a.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {a.priority} priority
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{a.date}</span>
                </div>
                <p className="text-sm leading-relaxed mt-1 text-gray-600">{a.title}</p>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-xs text-gray-500">No announcements</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
