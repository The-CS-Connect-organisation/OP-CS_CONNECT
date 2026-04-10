import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useSound } from '../../hooks/useSound';

const StatCard = ({ icon: Icon, label, value, delay, color = '#111111' }) => {
  const { playClick } = useSound();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onMouseEnter={playClick}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 group-hover:text-slate-900 border border-slate-100">
          <Icon size={20} />
        </div>
      </div>
      <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
    </motion.div>
  );
};

export const TeacherDashboard = ({ user }) => {
  const { playClick } = useSound();

  const { data: assignmentsData, loading: assignmentsLoading } = useApi(
    user?.id ? `/school/assignments?teacherId=${user.id}&limit=50` : null,
    { defaultValue: [], skip: !user?.id }
  );
  const { data: studentsData } = useApi('/school/students?limit=200', { defaultValue: [] });

  const assignments = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData?.items || []);
  const students = Array.isArray(studentsData) ? studentsData : (studentsData?.items || []);

  const myAssignments = assignments.filter(a => a.teacherId === user.id || !a.teacherId);
  const totalSubmissions = myAssignments.reduce((acc, a) => acc + (a.submissions?.filter(s => s.submittedAt)?.length || 0), 0);
  const pendingGrading = myAssignments.reduce((acc, a) => acc + (a.submissions?.filter(s => s.status === 'submitted')?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12 font-sans">
      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 p-6 md:p-10 rounded-3xl relative overflow-hidden shadow-sm"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 w-fit mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Teacher Portal</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Welcome back, {user.name}
          </h1>
          
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
              Department of {user.department || 'Education'}
            </span>
            <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
              {user.subjects?.join(' • ') || 'General Studies'}
            </span>
          </div>
        </div>
        
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={FileText} label="Assignments" value={assignmentsLoading ? '...' : myAssignments.length} delay={0.1} />
        <StatCard icon={CheckCircle} label="Total Submissions" value={totalSubmissions} delay={0.15} />
        <StatCard icon={Clock} label="Pending Review" value={pendingGrading} delay={0.2} />
        <StatCard icon={Users} label="My Students" value={students.length} delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Assignments */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Recent Assignments</h3>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
              <FileText size={14} className="text-slate-400" />
            </div>
          </div>
          
          <div className="space-y-4 text-sm">
            {myAssignments.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                <FileText size={40} className="opacity-10" />
                <p className="text-xs font-medium uppercase tracking-widest">No assignments found</p>
              </div>
            ) : (
              myAssignments.map(a => (
                <div key={a.id} onMouseEnter={playClick} 
                  className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-200 hover:bg-white hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{a.title}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Class {a.class} • Due {a.dueDate}</p>
                  </div>
                  <div className="text-right pl-4">
                    <p className="text-lg font-bold text-slate-900">{a.submissions?.filter(s => s.submittedAt)?.length || 0}/{students.length}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Handed In</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Pending Grading */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Action Required</h3>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
              <Clock size={14} className="text-amber-500" />
            </div>
          </div>

          <div className="space-y-4">
            {pendingGrading === 0 ? (
              <div className="py-12 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                <CheckCircle size={40} className="opacity-10" />
                <p className="text-xs font-medium uppercase tracking-widest">Everything is graded</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 no-scrollbar">
                {myAssignments.flatMap(a =>
                  (a.submissions || []).filter(s => s.status === 'submitted').map(s => (
                    <div key={`${a.id}-${s.studentId}`} onMouseEnter={playClick} 
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-200 hover:bg-white transition-all cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{s.studentName}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">{a.title}</p>
                      </div>
                      <span className="px-4 py-2 bg-indigo-600 text-[10px] font-bold uppercase tracking-widest text-white rounded-xl shadow-lg shadow-indigo-600/20">Review</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
