import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, FileText, Hash, MessageSquareText, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function AssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [contentText, setContentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.getAssignment(id!);
        const mySub = data.submissions?.find((s: any) => s.studentId === user?.id) ?? null;
        if (!alive) return;
        setAssignment(data);
        setSubmission(mySub);
        setContentText(mySub?.content ?? '');
      } catch (e) {
        console.error('Failed to load assignment:', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, user?.id]);

  const isGraded = submission?.scoredMarks !== undefined;
  const isLate = assignment?.dueDate ? new Date(assignment.dueDate) < new Date() && !isGraded : false;

  const statusBadge = useMemo(() => {
    if (isGraded) return { variant: 'badge-success', label: 'GRADED' };
    if (submission) return { variant: 'badge-warning', label: 'SUBMITTED' };
    if (isLate) return { variant: 'badge-error', label: 'OVERDUE' };
    return { variant: 'badge-default', label: 'PENDING' };
  }, [isGraded, submission, isLate]);

  const onSubmit = async () => {
    if (!assignment || !user) return;
    try {
      setSubmitting(true);
      await api.submitAssignment(assignment.id, { studentId: user.id, content: contentText });
      setSubmission({ content: contentText, submittedAt: new Date().toISOString() });
    } catch (e: any) {
      console.error('Failed to submit:', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full pt-4 pb-12">
        <div className="nova-card p-8 border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-muted)] font-mono uppercase tracking-widest">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-[1000px] mx-auto w-full pt-4 pb-12">
        <div className="nova-card p-8 border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-primary)] font-semibold mb-2">Assignment not found</p>
          <button className="btn-secondary" onClick={() => navigate('/student/assignments')}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto w-full pt-4 pb-12">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{assignment.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${statusBadge.variant}`}>{statusBadge.label}</span>
            <span className="badge badge-default">{assignment.class}</span>
          </div>
        </div>
      </motion.div>

      <div className="nova-card p-6 border-[var(--border-default)] space-y-4">
        <div className="flex flex-wrap gap-4 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
          <span className="flex items-center gap-2"><Calendar size={14} /> Due: {assignment.dueDate || '—'}</span>
        </div>
        {assignment.description && (
          <div className="pt-3 border-t border-[var(--border-default)]">
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{assignment.description}</p>
          </div>
        )}
      </div>

      <div className="nova-card p-6 border-[var(--border-default)] space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Upload size={16} /> Your submission
        </h2>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--text-muted)]">Notes / Answer</label>
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            className="input-field min-h-[140px] resize-none"
            placeholder="Write your answer or notes here..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="btn-secondary" onClick={() => navigate('/student/assignments')}>Back to list</button>
          <button className="btn-primary" onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {isGraded && (
        <div className="nova-card p-6 border-[var(--border-default)] space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <MessageSquareText size={16} /> Feedback & grade
          </h2>
          <div className="flex items-center gap-3">
            <span className="badge badge-success">{submission.scoredMarks} / {assignment.maxMarks || 50}</span>
            {submission.submittedAt && <span className="text-xs text-[var(--text-muted)]">Graded: {new Date(submission.submittedAt).toLocaleDateString()}</span>}
          </div>
          {submission.feedback ? (
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{submission.feedback}</p>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No feedback provided.</p>
          )}
        </div>
      )}
    </div>
  );
}
