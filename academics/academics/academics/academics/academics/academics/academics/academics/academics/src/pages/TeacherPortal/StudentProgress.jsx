import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertCircle, Flag, Bell,
  Brain, Loader2, Search, User
} from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * @component StudentProgress
 * @description Individual student progress tracking with grades, attendance, AI analysis
 * @param {Object} user - Current user object
 * @param {string} studentId - Selected student ID (optional; shows selector if absent)
 * @param {Function} addToast - Toast notification function
 */

const TrendIndicator = ({ trend }) => {
  if (trend === 'improving') return <div className="flex items-center gap-1 text-green-600"><TrendingUp size={16} /> Improving</div>;
  if (trend === 'declining') return <div className="flex items-center gap-1 text-red-600"><TrendingDown size={16} /> Declining</div>;
  return <div className="flex items-center gap-1 text-gray-600">Stable</div>;
};

export const StudentProgress = ({ user, studentId: propStudentId, addToast }) => {
  const [studentId, setStudentId] = useState(propStudentId || '');
  const [studentIdInput, setStudentIdInput] = useState(propStudentId || '');
  const [progress, setProgress] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [alertThreshold, setAlertThreshold] = useState(60);
  const [notes, setNotes] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setProgress(null);
        setTimeline(null);
        const [progressRes, timelineRes] = await Promise.allSettled([
          teacherApi.getStudentProgress(studentId),
          teacherApi.getStudentTimeline(studentId),
        ]);
        if (!alive) return;
        if (progressRes.status === 'fulfilled') {
          const d = progressRes.value?.data?.data ?? progressRes.value?.data ?? {};
          setProgress(d);
        }
        if (timelineRes.status === 'fulfilled') {
          const d = timelineRes.value?.data?.data ?? timelineRes.value?.data ?? {};
          setTimeline(d);
        }
      } catch (err) {
        if (!alive) return;
        addToast?.('Failed to load student progress', 'error');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [studentId]);

  const runAi = async (type) => {
    try {
      setAiLoading(p => ({ ...p, [type]: true }));
      let res;
      if (type === 'attendance') res = await teacherApi.analyzeAttendance(studentId, null);
      else if (type === 'gaps') res = await teacherApi.identifyLearningGaps(studentId);
      else if (type === 'prediction') res = await teacherApi.predictPerformance(studentId);
      const d = res?.data?.data ?? res?.data ?? {};
      setAiResults(p => ({ ...p, [type]: d }));
      addToast?.('AI analysis complete', 'success');
    } catch (err) {
      addToast?.(`AI analysis failed: ${err?.message || 'Unknown error'}`, 'error');
    } finally {
      setAiLoading(p => ({ ...p, [type]: false }));
    }
  };

  const student = progress?.student ?? {};
  const metrics = progress?.metrics ?? {};
  const gradeTimeline = timeline?.grades ?? timeline?.timeline ?? [];
  const currentGrade = metrics.currentGrade ?? metrics.averageGrade ?? 0;

  const handleSetThreshold = () => {
    if (currentGrade < alertThreshold) {
      addToast?.(`Alert: Student grade (${currentGrade}%) is below threshold (${alertThreshold}%)`, 'warning');
    } else {
      addToast?.(`Threshold set to ${alertThreshold}%`, 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp size={32} className="text-purple-500" />
            Student Progress
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track individual student performance and trends</p>
        </div>
      </motion.div>

      {/* Student Selector */}
      {!propStudentId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="nova-card p-4 flex items-center gap-3">
          <User size={18} className="text-gray-400" />
          <input
            type="text"
            value={studentIdInput}
            onChange={e => setStudentIdInput(e.target.value)}
            placeholder="Enter student ID..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            onKeyDown={e => e.key === 'Enter' && setStudentId(studentIdInput)}
          />
          <Button variant="primary" onClick={() => setStudentId(studentIdInput)} className="rounded-lg">
            <Search size={16} />
          </Button>
        </motion.div>
      )}

      {!studentId && (
        <div className="py-24 text-center border border-dashed rounded-xl border-gray-200">
          <User size={40} className="mx-auto mb-4 text-gray-200" />
          <p className="text-sm text-gray-500">Enter a student ID to view progress</p>
        </div>
      )}

      {studentId && loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-purple-400" />
        </div>
      )}

      {studentId && !loading && progress && (
        <>
          {/* Student Header */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="nova-card p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{student.name || studentId}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {student.class && `Class: ${student.class}`}
                  {student.rollNo && ` • Roll: ${student.rollNo}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-gray-900">{currentGrade}%</p>
                <p className="text-xs text-gray-500 mt-1">Current Grade</p>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Average Grade', value: `${metrics.averageGrade ?? 0}%`, sub: 'All assignments' },
              { label: 'Class Average', value: `${metrics.classAverage ?? 0}%`, sub: 'Comparison' },
              { label: 'Attendance', value: `${metrics.attendanceRate ?? 0}%`, sub: `${metrics.presentDays ?? 0} present` },
              { label: 'Trend', value: null, trend: metrics.trend },
            ].map((m, idx) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.05 }} className="nova-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{m.label}</p>
                {m.trend !== undefined ? (
                  <div className="mt-2"><TrendIndicator trend={m.trend} /></div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900">{m.value}</p>
                    <p className="text-xs text-gray-500 mt-2">{m.sub}</p>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Grade Timeline */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="nova-card p-6">
            <h3 className="text-sm font-semibold mb-4 text-gray-600">Grade Timeline</h3>
            {gradeTimeline.length === 0 ? (
              <p className="text-sm text-gray-500">No grade history available</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gradeTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="grade" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* AI Analysis Buttons */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="nova-card p-6">
            <h3 className="text-sm font-semibold mb-4 text-gray-600 flex items-center gap-2">
              <Brain size={14} className="text-purple-500" />
              AI Analysis
            </h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {[
                { key: 'attendance', label: 'Attendance Analysis' },
                { key: 'gaps', label: 'Learning Gaps' },
                { key: 'prediction', label: 'Performance Prediction' },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant="secondary"
                  onClick={() => runAi(key)}
                  disabled={aiLoading[key]}
                  className="rounded-lg"
                >
                  {aiLoading[key] ? <Loader2 size={14} className="animate-spin mr-1" /> : <Brain size={14} className="mr-1" />}
                  {label}
                </Button>
              ))}
            </div>
            {Object.entries(aiResults).map(([key, result]) => (
              <div key={key} className="p-4 rounded-lg bg-purple-50 border border-purple-100 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-2">
                  {key === 'attendance' ? 'Attendance Analysis' : key === 'gaps' ? 'Learning Gaps' : 'Performance Prediction'}
                </p>
                <p className="text-sm text-gray-700">
                  {typeof result === 'string' ? result : result.summary ?? result.analysis ?? result.prediction ?? JSON.stringify(result)}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Alert Threshold */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="nova-card p-6">
            <h3 className="text-sm font-semibold mb-4 text-gray-600 flex items-center gap-2">
              <Bell size={14} />
              Progress Alert Threshold
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="number" min="0" max="100"
                value={alertThreshold}
                onChange={e => setAlertThreshold(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-200 rounded-lg w-24"
              />
              <span className="text-sm text-gray-600">%</span>
              <Button variant="primary" onClick={handleSetThreshold} className="rounded-lg">Set Threshold</Button>
            </div>
            {currentGrade < alertThreshold && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3">
                <AlertCircle size={18} className="text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Alert Active</p>
                  <p className="text-xs text-red-700">Student grade is below threshold</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Notes */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="nova-card p-6">
            <h3 className="text-sm font-semibold mb-4 text-gray-600 flex items-center gap-2">
              <Flag size={14} />
              Notes & Flags
            </h3>
            {showNoteInput ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes for follow-up..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  rows="3"
                />
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => { if (notes.trim()) { addToast?.('Note saved', 'success'); setNotes(''); setShowNoteInput(false); } }} className="rounded-lg">Save Note</Button>
                  <Button variant="secondary" onClick={() => setShowNoteInput(false)} className="rounded-lg">Cancel</Button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setShowNoteInput(true)} className="rounded-lg">Add Note</Button>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};
