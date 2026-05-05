import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, FileText, Hash, MessageSquareText, Upload } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DropzoneUpload } from '../../../components/ui/DropzoneUpload';
import { assignmentsService } from '../../../services/assignmentsService';
import { useSound } from '../../../hooks/useSound';

export const AssignmentDetails = ({ user, addToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playClick, playBlip } = useSound();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [contentText, setContentText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const list = await assignmentsService.listForUser(user);
        const found = (Array.isArray(list) ? list : []).find((a) => a.id === id) ?? null;
        const subs = await assignmentsService.listSubmissions({ assignmentId: id });
        const mySub = (Array.isArray(subs) ? subs : []).find((s) => s.studentId === user.id) ?? null;
        if (!alive) return;
        setAssignment(found);
        setSubmission(mySub);
        setContentText(mySub?.content ?? '');
        setAttachment(mySub?.attachment ?? null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, user?.id]);

  const status = submission?.status ?? 'pending';
  const isGraded = status === 'graded';
  const isLate = assignment?.dueDate ? new Date(assignment.dueDate) < new Date() && !isGraded : false;

  const statusBadge = useMemo(() => {
    if (isGraded) return { variant: 'emerald', label: 'GRADED' };
    if (submission?.status === 'submitted') return { variant: 'amber', label: 'SUBMITTED' };
    if (isLate) return { variant: 'rose', label: 'OVERDUE' };
    return { variant: 'default', label: 'PENDING' };
  }, [isGraded, submission?.status, isLate]);

  const onSubmit = async () => {
    playBlip();
    if (!assignment) return;
    try {
      setSubmitting(true);
      const sub = await assignmentsService.submit({
        assignment,
        student: user,
        contentText,
        attachment,
      });
      setSubmission(sub);
      addToast?.('Submission saved', 'success');
    } catch (e) {
      addToast?.(e?.message || 'Failed to submit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto w-full pt-4 pb-12">
        <Card className="p-8 border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-muted)] font-mono uppercase tracking-widest">Loading assignment...</p>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-[1000px] mx-auto w-full pt-4 pb-12">
        <Card className="p-8 border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-primary)] font-semibold mb-2">Assignment not found</p>
          <Button variant="secondary" onClick={() => navigate('/student/assignments')}>Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto w-full pt-4 pb-12">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={() => { playClick(); navigate(-1); }}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{assignment.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            <Badge variant="default">{assignment.subject}</Badge>
            <Badge variant="default">{assignment.class}</Badge>
          </div>
        </div>
      </motion.div>

      <Card className="p-6 border-[var(--border-default)] space-y-4">
        <div className="flex flex-wrap gap-4 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
          <span className="flex items-center gap-2"><Calendar size={14} /> Due: {assignment.dueDate || '—'}</span>
          <span className="flex items-center gap-2"><Hash size={14} /> Max: {assignment.totalMarks}</span>
          <span className="flex items-center gap-2"><FileText size={14} /> Teacher: {assignment.teacherName || '—'}</span>
        </div>
        {assignment.description && (
          <div className="pt-3 border-t border-[var(--border-default)]">
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{assignment.description}</p>
          </div>
        )}
      </Card>

      <Card className="p-6 border-[var(--border-default)] space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Upload size={16} /> Your submission
        </h2>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--text-muted)]">Notes / Answer (optional)</label>
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm min-h-[140px] resize-none focus:outline-none focus:border-white/20"
            placeholder="Write your answer or notes here..."
          />
        </div>

        <DropzoneUpload
          label="Attach file (pdf/image)"
          accept="image/*,application/pdf"
          maxSizeMb={10}
          previewUrl={attachment?.dataUrl || ''}
          onUploaded={(doc) => setAttachment(doc)}
          onClear={() => setAttachment(null)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => { playClick(); navigate('/student/assignments'); }}>Back to list</Button>
          <Button variant="primary" onClick={onSubmit} disabled={submitting} icon={Upload}>
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </Card>

      {isGraded && (
        <Card className="p-6 border-[var(--border-default)] space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <MessageSquareText size={16} /> Feedback & grade
          </h2>
          <div className="flex items-center gap-3">
            <Badge variant="emerald">{submission.marks} / {assignment.totalMarks}</Badge>
            {submission.gradedAt && <span className="text-xs text-[var(--text-muted)]">Graded: {new Date(submission.gradedAt).toLocaleDateString()}</span>}
          </div>
          {submission.feedback ? (
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{submission.feedback}</p>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No feedback provided.</p>
          )}
        </Card>
      )}
    </div>
  );
};

