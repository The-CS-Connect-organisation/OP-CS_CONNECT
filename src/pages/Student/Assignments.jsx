import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, AlertCircle, Search, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const Assignments = ({ user }) => {
  const { data: assignments } = useStore(KEYS.ASSIGNMENTS, []);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  // Assignments are marked offline: students do not submit files online.

  // Normalize class names for matching (handles "10-A", "10A", "10 - A", etc.)
  const normalizeClass = (cls) => cls?.replace(/[\s-]/g, '').toUpperCase();
  const myAssignments = assignments.filter(a =>
    normalizeClass(a.class) === normalizeClass(user.class)
  );

  const filtered = useMemo(() => {
    return myAssignments.filter(a => {
      const sub = a.submissions.find(s => s.studentId === user.id);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FileText className="text-primary-500" /> My Assignments
          </h1>
          <p className="text-gray-500 mt-1">{myAssignments.length} total assignments</p>
        </motion.div>

        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input-field pl-9 pr-4 py-2 text-sm w-48" />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'graded'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  filter === f ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {filtered.map((a, idx) => {
            const sub = a.submissions.find(s => s.studentId === user.id);
            const isLate = new Date(a.dueDate) < new Date() && sub?.status !== 'graded';
            const isGraded = sub?.status === 'graded';
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isGraded ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                    'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                  }`}>
                    {isGraded ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-gray-800 dark:text-white">{a.title}</h4>
                      {isGraded && <Badge color="green">Graded: {sub.marks}/{a.totalMarks}</Badge>}
                      {isLate && <Badge color="red">Overdue</Badge>}
                      {(!sub || sub.status !== 'graded') && <Badge color="orange">Pending</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">{a.subject} • {a.teacherName}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar size={12} /> Due: {a.dueDate}</span>
                      <span>Max Marks: {a.totalMarks}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500">No assignments found</p>
          </div>
        )}
      </div>

      {/* No submit modal: assignments are submitted offline. */}
    </div>
  );
};
