import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, AlertCircle, Search, Calendar, Terminal, Activity, Hash, Layers, ChevronRight, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useSound } from '../../../hooks/useSound';
import { assignmentsService } from '../../../services/assignmentsService';
import { useNavigate } from 'react-router-dom';

export const Assignments = ({ user }) => {
  const { playClick, playBlip } = useSound();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Normalize class names for matching
  const normalizeClass = (cls) => cls?.replace(/[\s-]/g, '').toUpperCase();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const list = await assignmentsService.listForUser(user);
        if (!alive) return;
        setAssignments(Array.isArray(list) ? list : []);
        // Don't fetch all submissions here - they're fetched per assignment
        setSubmissions([]);
      } catch (err) {
        console.error('Failed to load assignments:', err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  // Backend /student/assignments already filters by student's class
  const myAssignments = assignments;

  const filtered = useMemo(() => {
    return myAssignments.filter(a => {
      const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === user.id);
      const status = sub?.status || 'pending';

      const matchesFilter =
        filter === 'all' ||
        (filter === 'pending' && status !== 'graded') ||
        (filter === 'graded' && status === 'graded');

      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.subject.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [myAssignments, filter, search, user.id]);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-sm text-[10px] font-semibold font-mono">
               Overview
             </span>
             <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
             <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
               <Activity size={10} className="animate-pulse" /> Total: {myAssignments.length}
             </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
             <FileText className="text-[var(--text-muted)]" size={48} />
             Assignments
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-muted)] transition-colors" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search..." 
              className="input-field pl-12 pr-6 py-3 font-mono uppercase text-xs w-full min-w-[240px]" 
            />
          </div>
          
          <div className="flex p-1 bg-nova-base border border-[var(--border-default)] rounded-xl">
            {['all', 'pending', 'graded'].map(f => (
              <button 
                key={f} 
                onClick={() => { playClick(); setFilter(f); }}
                className={`px-5 py-2 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                  filter === f 
                    ? 'bg-white text-[var(--text-primary)] shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Assignment Stream */}
      <div className="grid gap-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center nova-card border-dashed border-[var(--border-default)]"
            >
              <Terminal size={48} className="mx-auto text-zinc-800 mb-6" />
              <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Loading assignments...</p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="py-32 text-center nova-card border-dashed border-[var(--border-default)]"
            >
              <Terminal size={48} className="mx-auto text-zinc-800 mb-6" />
              <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">No results found</p>
            </motion.div>
          ) : (
            filtered.map((a, idx) => {
              const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === user.id);
              const isLate = new Date(a.dueDate) < new Date() && sub?.status !== 'graded';
              const isGraded = sub?.status === 'graded';
              
              return (
                <motion.div 
                  key={a.id} 
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Card 
                    className="group flex flex-col md:flex-row gap-6 p-6 border-[var(--border-default)] hover:border-white/20 transition-all duration-500 relative overflow-hidden"
                    onMouseEnter={() => { playClick(); }}
                    onClick={() => navigate(`/student/assignments/${a.id}`)}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none transition-colors ${
                      isGraded ? 'bg-emerald-500/5' : isLate ? 'bg-white/[0.06]' : 'bg-white/[0.03]'
                    }`} />
                    
                    <div className={`w-16 h-16 rounded-xl border flex items-center justify-center transition-all duration-500 shadow-xl ${
                      isGraded 
                        ? 'bg-[var(--bg-elevated)] border-emerald-500/30 text-emerald-500 shadow-emerald-500/5' 
                        : isLate 
                          ? 'bg-[var(--bg-elevated)] border-white/15 text-[var(--text-muted)] shadow-rose-600/5'
                          : 'bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-muted)] group-hover:border-white/12 group-hover:text-[var(--text-muted)]'
                    }`}>
                      {isGraded ? <CheckCircle size={28} /> : <Clock size={28} />}
                    </div>
                    
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--text-muted)] transition-colors">{a.title}</h4>
                        {isGraded && <Badge variant="emerald">Index: {sub.marks} / {a.totalMarks}</Badge>}
                        {isLate && <Badge variant="rose">Overdue</Badge>}
                        {(!sub || sub.status !== 'graded') && <Badge variant="default">Processing</Badge>}
                      </div>
                      <p className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-widest mb-4">Subject: {a.subject} • Teacher: {a.teacherName}</p>
                      
                      <div className="flex items-center gap-6 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wide">
                        <span className="flex items-center gap-1.5 text-[var(--text-muted)] font-bold">
                          <Calendar size={12} className="text-[var(--text-muted)]" /> Deadline: {a.dueDate}
                        </span>
                        <span className="h-1 w-1 bg-[var(--bg-floating)] rounded-full" />
                        <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                          <Hash size={12} className="text-[var(--text-muted)]" /> Max_Score: {a.totalMarks}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center self-center relative z-10">
                       <ChevronRight className="text-zinc-800 group-hover:text-[var(--text-muted)] group-hover:translate-x-2 transition-all duration-500" size={32} />
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

