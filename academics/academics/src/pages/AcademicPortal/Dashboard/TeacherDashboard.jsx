import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, Clock, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';

const StatCard = ({ icon: Icon, label, value, delay, color = '#1f2937' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-6 backdrop-blur-xl hover:shadow-md transition-all duration-300"
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
    </motion.div>
  );
};

export const TeacherDashboard = ({ user }) => {
  const { data: assignments } = useStore(KEYS.ASSIGNMENTS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  
  const myAssignments = assignments.filter(a => a.teacherId === user.id);
  const totalSubmissions = myAssignments.reduce((acc, a) => acc + (a.submissions?.filter(s => s.submittedAt)?.length || 0), 0);
  const pendingGrading = myAssignments.reduce((acc, a) => acc + (a.submissions?.filter(s => s.status === 'submitted')?.length || 0), 0);
  const students = users.filter(u => u.role === 'student');

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full relative pt-2 pb-12">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 md:p-8 backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-purple-100 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gradient-to-tr from-blue-100 to-transparent blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Teacher Portal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {user.department || 'Faculty'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 mb-3 text-gray-900">
            <span className="w-1 h-10 rounded-full bg-gradient-to-b from-purple-500 to-blue-500" />
            Welcome, {user.name}
          </h1>
          <div className="flex flex-wrap gap-2 mt-4">
            {[`Department: ${user.department || 'N/A'}`, `Subjects: ${Array.isArray(user.subjects) ? user.subjects.join(', ') : (user.subjects || 'N/A')}`].map((tag, i) => (
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
        <StatCard icon={FileText} label="My Assignments" value={myAssignments.length} delay={0.1} color="#1f2937" />
        <StatCard icon={CheckCircle} label="Submissions" value={totalSubmissions} delay={0.15} color="#10b981" />
        <StatCard icon={Clock} label="Pending Grading" value={pendingGrading} delay={0.2} color="#f59e0b" />
        <StatCard icon={Users} label="Total Students" value={students.length} delay={0.25} color="#a855f7" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
            Recent Assignments
          </h3>
          <div className="space-y-2.5">
            {myAssignments.length === 0 ? (
              <div className="py-12 border border-dashed rounded-xl flex items-center justify-center border-gray-200">
                <p className="text-xs text-gray-500">No assignments yet</p>
              </div>
            ) : (
              myAssignments.map(a => (
                <div key={a.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                    <p className="text-xs mt-1 text-gray-500">{a.subject} • Class {a.class} • Due: {a.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold font-mono text-gray-900">{a.submissions?.filter(s => s.submittedAt)?.length || 0}/{students.length}</p>
                    <p className="text-[10px] text-gray-500">Submitted</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Pending Grading */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="glass-card p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Needs Grading
          </h3>
          {pendingGrading === 0 ? (
            <div className="py-12 border border-dashed rounded-xl flex items-center justify-center border-gray-200">
              <p className="text-xs text-gray-500">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
              {myAssignments.flatMap(a =>
                (a.submissions || []).filter(s => s.status === 'submitted').map(s => (
                  <div key={`${a.id}-${s.studentId}`} 
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.studentName}</p>
                      <p className="text-xs text-gray-500">{a.title}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Grade</span>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};