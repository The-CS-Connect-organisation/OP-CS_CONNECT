import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilLine, Search, Save, Award, Users, BookOpen, AlertCircle, TrendingUp, User } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { useSound } from '../../hooks/useSound';

export const EnterGrades = ({ user, addToast }) => {
  const { data: exams } = useStore(KEYS.EXAMS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  const { update: updateExam } = useStore(KEYS.EXAMS, []);
  const { playClick, playBlip, playSwitch } = useSound();

  const [selectedExamId, setSelectedExamId] = useState('');
  const [grades, setGrades] = useState({});

  const myExams = useMemo(() => {
    return exams.filter(e => e.createdBy === user.id);
  }, [exams, user.id]);

  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId);
  }, [exams, selectedExamId]);

  const students = useMemo(() => {
    if (!selectedExam) return [];
    return users.filter(u => u.role === 'student' && u.class === selectedExam.class);
  }, [users, selectedExam]);

  // UseEffect-like sync when exam changes
  useMemo(() => {
    if (selectedExam) {
      const g = {};
      selectedExam.results?.forEach(r => {
        g[r.studentId] = r.marks;
      });
      setGrades(g);
    } else {
      setGrades({});
    }
  }, [selectedExam]);

  const handleGradeChange = (studentId, value) => {
    const marks = parseFloat(value);
    setGrades(prev => ({ ...prev, [studentId]: marks }));
  };

  const handleSave = () => {
    if (!selectedExam) return;
    playBlip();

    const results = students.map(s => ({
      studentId: s.id,
      studentName: s.name,
      marks: grades[s.id] || 0
    }));

    updateExam(selectedExam.id, { 
      results,
      status: 'evaluated',
      evaluatedAt: new Date().toISOString().split('T')[0]
    });
    
    addToast?.(`Grading finalized for ${selectedExam.name}`, 'success');
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12 font-sans">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-2 mb-4">
           <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200">
             Achievement Records
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">
             <Award size={12} />
             Standardized Evaluation
           </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-4">
           <PencilLine className="text-slate-300" size={40} />
           Enter Grades
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Exam Selection Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <BookOpen size={14} /> Select Assessment
            </h3>
            
            <div className="space-y-3">
              {myExams.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No assessments scheduled</p>
                </div>
              ) : (
                myExams.map(e => (
                  <button
                    key={e.id}
                    onClick={() => { playClick(); setSelectedExamId(e.id); }}
                    className={`w-full text-left p-5 rounded-2xl transition-all border ${
                      selectedExamId === e.id 
                        ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/10' 
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <p className={`font-bold text-sm ${selectedExamId === e.id ? 'text-white' : 'text-slate-900'}`}>{e.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedExamId === e.id ? 'text-slate-400' : 'text-slate-400'}`}>{e.class} • {e.subject}</span>
                      <Badge variant={e.status === 'evaluated' ? 'emerald' : 'indigo'} className="text-[8px] px-2 py-0.5">
                         {e.status === 'evaluated' ? 'Finalized' : 'Pending'}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>

          {selectedExam && (
            <Card className="p-8 bg-slate-50 border border-slate-200 rounded-3xl">
               <div className="flex items-center gap-2 mb-4">
                 <AlertCircle size={14} className="text-slate-400" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Grading Info</span>
               </div>
               <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Marks</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedExam.maxMarks}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Participation</p>
                    <p className="text-2xl font-bold text-slate-900">{students.length} Students</p>
                  </div>
               </div>
               <Button 
                 onClick={handleSave}
                 className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 shadow-xl shadow-slate-900/10"
                 icon={Save}
               >
                 Save Grades
               </Button>
            </Card>
          )}
        </div>

        {/* Grades Entry Sheet */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!selectedExam ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center bg-white border border-dashed border-slate-300 rounded-3xl">
                <Search size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Select an assessment to begin grading</p>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedExamId}
                initial={{ opacity: 0, y: 12 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {students.map((student, idx) => (
                  <Card 
                    key={student.id} 
                    className="p-5 flex items-center gap-6 bg-white border border-slate-200 hover:border-slate-300 transition-all rounded-3xl group shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all font-bold">
                       {student.rollNo || '01'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-slate-900 truncate">{student.name}</h4>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-0.5">Student ID: {student.id}</p>
                    </div>

                    <div className="flex items-center gap-4">
                       <div className="relative group">
                          <input 
                            type="number"
                            max={selectedExam.maxMarks}
                            value={grades[student.id] !== undefined ? grades[student.id] : ''}
                            onChange={e => handleGradeChange(student.id, e.target.value)}
                            onFocus={playClick}
                            className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-center focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                            placeholder="0"
                          />
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                             <TrendingUp size={10} className="text-indigo-600" />
                          </div>
                       </div>
                       <motion.div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                          / {selectedExam.maxMarks}
                       </motion.div>
                    </div>
                  </Card>
                ))}
              </motion.div>
            ) }
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
