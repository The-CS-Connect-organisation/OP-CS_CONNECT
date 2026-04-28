import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Search, Clock, FileText, User, ChevronRight, Filter, AlertCircle, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { useSound } from '../../hooks/useSound';
import { assignmentsService } from '../../services/assignmentsService';
import { notificationsService } from '../../services/notificationsService';

export const GradeSubmissions = ({ user, addToast }) => {
  const { data: assignments } = useStore(KEYS.ASSIGNMENTS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  const { playClick, playBlip } = useSound();

  const [selectedAsgn, setSelectedAsgn] = useState(null);
  const [filter, setFilter] = useState('submitted');
  const [gradingModal, setGradingModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ marks: '', feedback: '' });
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const myAssignments = assignments.filter(a => a.teacherId === user.id);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const subs = await assignmentsService.listSubmissions();
        if (!alive) return;
        setSubmissions(Array.isArray(subs) ? subs : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  const flatSubmissions = useMemo(() => {
    const list = [];
    const myIds = new Set(myAssignments.map((a) => a.id));

    // Build a lookup of real submissions.
    const byKey = new Map(
      submissions
        .filter((s) => myIds.has(s.assignmentId))
        .map((s) => [`${s.assignmentId}:${s.studentId}`, s])
    );

    // Include pending entries for all students in the assignment's class.
    myAssignments.forEach((a) => {
      const studentsInClass = users.filter((u) => u.role === 'student' && u.class === a.class);
      studentsInClass.forEach((stu) => {
        const s = byKey.get(`${a.id}:${stu.id}`) ?? {
          assignmentId: a.id,
          studentId: stu.id,
          studentName: stu.name,
          status: 'pending',
          submittedAt: null,
          marks: null,
          feedback: '',
          attachment: null,
        };
        list.push({
          assignmentId: a.id,
          assignmentTitle: a.title,
          totalMarks: a.totalMarks,
          ...s,
        });
      });
    });

    return list;
  }, [myAssignments, submissions, users]);

  const filteredSubmissions = flatSubmissions.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const handleOpenGrade = (s) => {
    playBlip();
    setSelectedSubmission(s);
    setGradeData({ marks: s.marks || '', feedback: s.feedback || '' });
    setGradingModal(true);
  };

  const handleSaveGrade = () => {
    (async () => {
      playBlip();
      if (gradeData.marks === '') {
        addToast('Please enter a grade score', 'error');
        return;
      }

      try {
        const updated = await assignmentsService.grade({
          assignmentId: selectedSubmission.assignmentId,
          studentId: selectedSubmission.studentId,
          grader: user,
          marks: parseFloat(gradeData.marks),
          feedback: gradeData.feedback,
        });

        // refresh list
        const subs = await assignmentsService.listSubmissions();
        setSubmissions(Array.isArray(subs) ? subs : []);

        await notificationsService.emit({
          userId: selectedSubmission.studentId,
          message: `Assignment graded: ${selectedSubmission.assignmentTitle} (${gradeData.marks}/${selectedSubmission.totalMarks})`,
          type: 'assignment',
          meta: { assignmentId: selectedSubmission.assignmentId, marks: gradeData.marks },
          actor: user,
        });

        setGradingModal(false);
        addToast(`Grade published for ${selectedSubmission.studentName}`, 'success');
      } catch (e) {
        addToast(e?.message || 'Failed to publish grade', 'error');
      }
    })();
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12 font-sans">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-2 mb-4">
           <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200">
             Grading Service
           </div>
           <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-2">
             Pending Review: {flatSubmissions.filter(s => s.status === 'submitted').length}
           </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-4">
           <CheckCircle className="text-slate-300" size={40} />
           Grade Submissions
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation / Filter */}
        <div className="lg:col-span-3 space-y-4">
           <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Filter Records</h3>
           {['all', 'submitted', 'graded', 'pending'].map(f => (
             <button
               key={f}
               onClick={() => { playClick(); setFilter(f); }}
               className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all ${
                 filter === f 
                   ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10' 
                   : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
               }`}
             >
               {f}
             </button>
           ))}

           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 mt-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Grading Policy</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Please ensure feedback is constructive. Once published, students will receive instant notification of their results.
              </p>
           </div>
        </div>

        {/* Submissions List */}
        <div className="lg:col-span-9 space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center bg-white border border-dashed border-slate-300 rounded-3xl">
                <Search size={40} className="mx-auto mb-4 text-slate-200" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading submissions...</p>
              </motion.div>
            ) : filteredSubmissions.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center bg-white border border-dashed border-slate-300 rounded-3xl">
                <Search size={40} className="mx-auto mb-4 text-slate-200" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No matching submissions found</p>
              </motion.div>
            ) : (
              filteredSubmissions.map((s, idx) => (
                <motion.div
                  key={`${s.assignmentId}-${s.studentId}`}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card 
                    className="group p-5 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all rounded-3xl cursor-pointer"
                    onClick={() => handleOpenGrade(s)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <User size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                           <h4 className="font-bold text-slate-900 truncate">{s.studentName}</h4>
                           <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] border rounded-md ${
                             s.status === 'submitted' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                             s.status === 'graded' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                             'bg-slate-50 text-slate-500 border-slate-200'
                           }`}>
                             {s.status}
                           </span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{s.assignmentTitle}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                           <p className="text-lg font-bold text-slate-900">{s.marks !== null ? s.marks : '-'}<span className="text-slate-300 text-xs font-medium ml-1">/ {s.totalMarks}</span></p>
                           <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Score</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grading Modal */}
      <Modal
        isOpen={gradingModal}
        onClose={() => setGradingModal(false)}
        title="Grade Submission"
        size="lg"
      >
        {selectedSubmission && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-3xl">
               <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                  <User size={18} />
               </div>
               <div>
                  <h3 className="font-bold text-slate-900">{selectedSubmission.studentName}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{selectedSubmission.assignmentTitle}</p>
               </div>
            </div>

            <div className="space-y-4">
               {selectedSubmission.submittedAt ? (
                 <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl">
                   <FileText size={16} />
                   {selectedSubmission.attachment?.fileName ? (
                     <a
                       href={selectedSubmission.attachment.dataUrl}
                       target="_blank"
                       rel="noreferrer"
                       className="text-xs font-bold uppercase tracking-widest underline underline-offset-4"
                     >
                       Submission File: {selectedSubmission.attachment.fileName}
                     </a>
                   ) : (
                     <p className="text-xs font-bold uppercase tracking-widest">Submission received</p>
                   )}
                 </div>
               ) : (
                 <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl">
                   <X size={16} />
                   <p className="text-xs font-bold uppercase tracking-widest">No submission file attached</p>
                 </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Mark Score *</label>
                    <div className="relative group">
                      <input 
                        type="number" 
                        value={gradeData.marks}
                        max={selectedSubmission.totalMarks}
                        onChange={e => setGradeData({ ...gradeData, marks: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" 
                        placeholder="0.00"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/ {selectedSubmission.totalMarks}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Status</label>
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                      {selectedSubmission.status}
                    </div>
                  </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Instructor Feedback</label>
                 <textarea 
                   value={gradeData.feedback}
                   onChange={e => setGradeData({ ...gradeData, feedback: e.target.value })}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium min-h-[120px] resize-none focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" 
                   placeholder="Enter your feedback for the student..."
                 />
               </div>
            </div>

            <div className="flex gap-4 justify-end pt-6 border-t border-slate-100">
               <Button variant="secondary" onClick={() => setGradingModal(false)} className="px-6 py-2.5">Cancel</Button>
               <Button 
                 variant="primary" 
                 onClick={handleSaveGrade} 
                 className="px-6 py-2.5 bg-slate-900 text-white shadow-xl shadow-slate-900/10"
               >
                 Review & Publish
               </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
