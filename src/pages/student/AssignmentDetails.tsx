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
    if (isGraded) return { variant: 'bg-green-100 text-green-700', label: 'GRADED' };
    if (submission) return { variant: 'bg-amber-100 text-amber-700', label: 'SUBMITTED' };
    if (isLate) return { variant: 'bg-red-100 text-red-700', label: 'OVERDUE' };
    return { variant: 'bg-secondary text-secondary-foreground', label: 'PENDING' };
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
        <div className="bg-card border border-border rounded-xl shadow-sm p-8">
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-[1000px] mx-auto w-full pt-4 pb-12">
        <div className="bg-card border border-border rounded-xl shadow-sm p-8">
          <p className="text-sm text-foreground font-semibold mb-2">Assignment not found</p>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors" onClick={() => navigate('/student/assignments')}>Back</button>
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
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{assignment.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge.variant}`}>{statusBadge.label}</span>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">{assignment.class}</span>
          </div>
        </div>
      </motion.div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap gap-4 text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
          <span className="flex items-center gap-2"><Calendar size={14} /> Due: {assignment.dueDate || '—'}</span>
        </div>
        {assignment.description && (
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-foreground whitespace-pre-wrap">{assignment.description}</p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Upload size={16} /> Your submission
        </h2>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Notes / Answer</label>
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 min-h-[140px] resize-none"
            placeholder="Write your answer or notes here..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors" onClick={() => navigate('/student/assignments')}>Back to list</button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors" onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {isGraded && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquareText size={16} /> Feedback & grade
          </h2>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">{submission.scoredMarks} / {assignment.maxMarks || 50}</span>
            {submission.submittedAt && <span className="text-xs text-muted-foreground">Graded: {new Date(submission.submittedAt).toLocaleDateString()}</span>}
          </div>
          {submission.feedback ? (
            <p className="text-sm text-foreground whitespace-pre-wrap">{submission.feedback}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No feedback provided.</p>
          )}
        </div>
      )}
    </div>
  );
}
