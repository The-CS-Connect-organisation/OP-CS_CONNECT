import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, CheckCircle, FileText, Star } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const GradeSubmissions = ({ user, addToast }) => {
  const { data: assignments, update } = useStore(KEYS.ASSIGNMENTS, []);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');

  const myAssignments = assignments.filter(a => a.teacherId === user.id);
  const pendingSubmissions = myAssignments.flatMap(a =>
    a.submissions.filter(s => s.status === 'submitted').map(s => ({ ...s, assignmentTitle: a.title, assignmentId: a.id, totalMarks: a.totalMarks }))
  );

  const handleGrade = () => {
    if (!selectedSubmission || !grade) return;
    const assignment = assignments.find(a => a.id === selectedSubmission.assignmentId);
    const updatedSubmissions = assignment.submissions.map(s =>
      s.studentId === selectedSubmission.studentId ? { ...s, marks: parseInt(grade), status: 'graded' } : s
    );
    update(assignment.id, { submissions: updatedSubmissions });
    setSelectedSubmission(null);
    setGrade('');
    addToast('Submission graded successfully! ⭐', 'success');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <GraduationCap className="text-primary-500" /> Grade Submissions
        </h1>
        <p className="text-gray-500 mt-1">{pendingSubmissions.length} submissions waiting to be graded</p>
      </motion.div>

      {pendingSubmissions.length === 0 ? (
        <Card className="text-center py-16">
          <CheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">All Caught Up!</h3>
          <p className="text-gray-500 mt-1">No pending submissions to grade</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {pendingSubmissions.map((sub, idx) => (
              <motion.div key={`${sub.assignmentId}-${sub.studentId}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl flex-shrink-0">
                    {sub.studentName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-white">{sub.studentName}</h4>
                    <p className="text-sm text-gray-500">{sub.assignmentTitle}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400"><FileText size={12} /> {sub.file}</span>
                      <span className="text-xs text-gray-400">Submitted: {sub.submittedAt}</span>
                    </div>
                  </div>
                  <Badge color="orange">Pending</Badge>
                  <Button variant="primary" size="sm" icon={Star} onClick={() => setSelectedSubmission(sub)}>Grade</Button>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={!!selectedSubmission} onClose={() => setSelectedSubmission(null)} title="Grade Submission">
        {selectedSubmission && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white">{selectedSubmission.studentName}</h4>
              <p className="text-sm text-gray-500">{selectedSubmission.assignmentTitle}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-300">File: {selectedSubmission.file}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marks (out of {selectedSubmission.totalMarks})</label>
              <input type="number" value={grade} onChange={e => setGrade(e.target.value)} className="input-field" max={selectedSubmission.totalMarks} min={0} placeholder="Enter marks" />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setSelectedSubmission(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleGrade} disabled={!grade}>Submit Grade</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
