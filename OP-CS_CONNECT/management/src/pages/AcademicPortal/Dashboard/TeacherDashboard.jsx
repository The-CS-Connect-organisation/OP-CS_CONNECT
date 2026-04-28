import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';

const StatCard = ({ icon: Icon, label, value, delay, color = '#111111' }) => {
  const { playClick } = useSound();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      className="nova-card-stat p-6 cursor-pointer"
      onMouseEnter={playClick}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <span className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </motion.div>
  );
};

export const TeacherDashboard = ({ user }) => {
  const { playClick } = useSound();
  const { data: assignments } = useStore(KEYS.ASSIGNMENTS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  
  const myAssignments = assignments.filter(a => a.teacherId === user.id);
  const totalSubmissions = myAssignments.reduce((acc, a) => acc + (a.submissions?.filter(s => s.submittedAt)?.length || 0), 0);
  const pendingGrading = myAssignments.reduce((acc, a) => acc + (a.submissions?.filter(s => s.status === 'submitted')?.length || 0), 0);
  const students = users.filter(u => u.role === 'student');

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full relative pt-2 pb-12">
      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="nova-card p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(168,85,247,0.05), transparent 60%)' }} />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold mb-3"
            style={{ background: 'rgba(168,85,247,0.08)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.20)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Teacher Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 mb-3" style={{ color: 'var(--text-primary)' }}>
            <span className="w-1 h-9 rounded-full bg-black" />
            Welcome, {user.name} 👋
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {[`Department: ${user.department || 'N/A'}`, `Subjects: ${user.subjects?.join(', ') || 'N/A'}`].map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="My Assignments" value={myAssignments.length} delay={0.1} color="#111111" />
        <StatCard icon={CheckCircle} label="Submissions" value={totalSubmissions} delay={0.15} color="#10b981" />
        <StatCard icon={Clock} label="Pending Grading" value={pendingGrading} delay={0.2} color="#f59e0b" />
        <StatCard icon={Users} label="Total Students" value={students.length} delay={0.25} color="#a855f7" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-black" />
            Recent Assignments
          </h3>
          <div className="space-y-2.5">
            {myAssignments.length === 0 ? (
              <div className="py-12 border border-dashed rounded-xl flex items-center justify-center" style={{ borderColor: 'var(--border-default)' }}>
                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>No assignments yet 📝</p>
              </div>
            ) : (
              myAssignments.map(a => (
                <div key={a.id} onMouseEnter={playClick} 
                  className="flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{a.subject} • Class {a.class} • Due: {a.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{a.submissions?.filter(s => s.submittedAt)?.length || 0}/{students.length}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>Submitted</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Pending Grading */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--semantic-warning)' }} />
            Needs Grading
          </h3>
          {pendingGrading === 0 ? (
            <div className="py-12 border border-dashed rounded-xl flex items-center justify-center" style={{ borderColor: 'var(--border-default)' }}>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>All caught up! 🎉</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
              {myAssignments.flatMap(a =>
                (a.submissions || []).filter(s => s.status === 'submitted').map(s => (
                  <div key={`${a.id}-${s.studentId}`} onMouseEnter={playClick} 
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors"
                    style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)' }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.studentName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.title}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.10)', color: 'var(--semantic-warning)' }}
                    >Grade</span>
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
