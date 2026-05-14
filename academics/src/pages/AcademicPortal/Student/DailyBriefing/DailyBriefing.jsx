import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sunrise, Calendar, Clock, FileText, CheckCircle, AlertCircle, Lightbulb, GraduationCap } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { useSound } from '../../../../hooks/useSound';
import { request } from '../../../../utils/apiClient';

const AI_TIPS = {
  Mathematics: "Focus on understanding the 'why' behind formulas, not just memorizing them. Try explaining concepts to yourself out loud to identify gaps.",
  Physics: "Physics is about visualizing phenomena. Draw diagrams for every problem, even the simple ones. It builds intuition for complex scenarios.",
  Chemistry: "Chemistry concepts connect like a web. Review previous chapters before moving forward. Focus on understanding periodic trends.",
  Biology: "Biology is vocabulary-heavy. Use flashcards for terms and create concept maps linking systems together.",
  English: "Read actively: underline passages and annotate margins. For writing, outline before drafting to clarify your argument structure.",
  'Computer Science': "Code daily, even 20 minutes. Focus on understanding algorithms before syntax. Build small projects to reinforce learning.",
  History: "Connect events chronologically. Ask 'why' for every historical fact — context transforms memorization into understanding.",
  Geography: "Use maps actively while studying. Draw freehand maps and fill in features. Link climate patterns to real-world locations.",
  'Physical Education': "Practice makes permanent. Focus on correct form over speed. Review theory concepts regularly for written assessments.",
  default: "Review your notes within 24 hours of class. Spaced repetition is the most effective way to retain information long-term."
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatDate = () => new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

export const DailyBriefing = ({ user, addToast }) => {
  const { playClick } = useSound();
  const today = new Date();
  const todayDay = today.toLocaleDateString('en-US', { weekday: 'long' });

  // Initialize from API
  const [apiData, setApiData] = useState({
    timetable:   [],
    assignments: [],
    attendance:  [],
    marks:       [],
    exams:       [],
  });

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;

    const fetchAll = async () => {
      const norm = (cls) => String(cls ?? '').replace(/[\s-]/g, '').toUpperCase();
      const myClass = norm(user.class);

      const [ttRes, assignRes, attendRes, marksRes] = await Promise.allSettled([
        request('/student/timetable'),
        request('/student/assignments'),
        request('/student/attendance'),
        request('/student/grades'),
      ]);

      const updates = {};

      if (ttRes.status === 'fulfilled') {
        const raw = ttRes.value?.entries ?? ttRes.value?.data?.entries ?? [];
        const entries = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : raw;
        const timetable = Array.isArray(entries) ? entries : [];
        updates.timetable = timetable;
      }

      if (assignRes.status === 'fulfilled') {
        const raw = assignRes.value?.assignments ?? assignRes.value?.items ?? [];
        const list = (Array.isArray(raw) ? raw : []).filter(a => {
          const ac = norm(a.class || a.class_id || a.grade || '');
          return !ac || ac === myClass;
        });
        updates.assignments = list;
      }

      if (attendRes.status === 'fulfilled') {
        const recs = attendRes.value?.records ?? attendRes.value?.items ?? [];
        const list = Array.isArray(recs) ? recs : [];
        updates.attendance = list;
      }

      if (marksRes.status === 'fulfilled') {
        const mk = marksRes.value?.marks ?? marksRes.value?.items ?? [];
        const list = Array.isArray(mk) ? mk : [];
        updates.marks = list;
      }

      if (alive && Object.keys(updates).length > 0) {
        setApiData(prev => ({ ...prev, ...updates }));
      }
    };

    fetchAll().catch(e => console.error('[DailyBriefing] API fetch error:', e.message));
    return () => { alive = false; };
  }, [user?.id]);

  const todaySchedule = useMemo(() => {
    return apiData.timetable
      .filter(slot => slot && slot.day === todayDay)
      .sort((a, b) => {
        const hA = parseInt((a.time || a.period || '12:00').split(':')[0]) || 0;
        const hB = parseInt((b.time || b.period || '12:00').split(':')[0]) || 0;
        return hA - hB;
      });
  }, [apiData.timetable, todayDay]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return apiData.assignments
      .filter(a => {
        const due = new Date(a.due_date || a.dueDate || a.due);
        return due >= now && due <= weekEnd;
      })
      .sort((a, b) => new Date(a.due_date || a.dueDate) - new Date(b.due_date || b.dueDate));
  }, [apiData.assignments]);

  const weekAttendance = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    return apiData.attendance.filter(rec => {
      const d = new Date(rec.date);
      return d >= start && d <= now;
    });
  }, [apiData.attendance]);

  const presentDays = weekAttendance.filter(r =>
    r.status === 'present' || r.status === 'late'
  ).length;
  const attendanceRate = weekAttendance.length > 0
    ? Math.round((presentDays / weekAttendance.length) * 100)
    : null;

  const myMarks = useMemo(() => apiData.marks.filter(m => {
    const sid = m.student_id || m.studentId;
    return !sid || sid === user?.id;
  }), [apiData.marks, user?.id]);

  const weakestSubject = useMemo(() => {
    if (!myMarks.length) return null;
    const bySubject = {};
    myMarks.forEach(m => {
      const sub = m.subject || m.subject_name || m.subjectName;
      if (!sub) return;
      if (!bySubject[sub]) bySubject[sub] = [];
      const score = parseFloat(m.score ?? m.obtained_marks ?? m.marks ?? 0);
      const max   = parseFloat(m.max_marks ?? m.maxScore ?? m.max ?? 100);
      if (max > 0) bySubject[sub].push(score / max);
    });
    const avgs = Object.entries(bySubject).map(([sub, scores]) => ({
      subject: sub,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));
    if (!avgs.length) return null;
    avgs.sort((a, b) => a.avg - b.avg);
    return avgs[0].subject;
  }, [myMarks]);

  const tip = weakestSubject && AI_TIPS[weakestSubject] ? AI_TIPS[weakestSubject] : AI_TIPS.default;

  const nextExam = useMemo(() => {
    const now = new Date();
    return apiData.exams
      .filter(e => new Date(e.date || e.examDate) >= now)
      .sort((a, b) => new Date(a.date || a.examDate) - new Date(b.date || b.examDate))[0];
  }, [apiData.exams]);

  const pendingCount = apiData.assignments.filter(a => {
    const due = new Date(a.due_date || a.dueDate || a.due);
    return due >= new Date() && a.status !== 'graded';
  }).length;

  return (
    <div className="max-w-5xl mx-auto w-full pt-2 pb-12 px-4 md:px-6" style={{ background: '#fefaf6', minHeight: '100%' }}>
      {/* Hero Greeting */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', boxShadow: '0 6px 20px rgba(234,88,12,0.3)' }}>
            <Sunrise size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: '#1c1917' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="text-sm" style={{ color: '#a8a29e' }}>{formatDate()}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-3 gap-3 mb-8">
        <motion.div variants={itemVariants}>
          <Card className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: 'rgba(234,88,12,0.08)' }}>
              <CheckCircle size={18} style={{ color: '#ea580c' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#1c1917' }}>
              {attendanceRate !== null ? `${attendanceRate}%` : '—'}
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#a8a29e' }}>Attendance</p>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: 'rgba(234,88,12,0.08)' }}>
              <FileText size={18} style={{ color: '#ea580c' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#1c1917' }}>{pendingCount}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#a8a29e' }}>Pending</p>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: 'rgba(234,88,12,0.08)' }}>
              <GraduationCap size={18} style={{ color: '#ea580c' }} />
            </div>
            <p className="text-sm font-bold truncate px-1" style={{ color: '#1c1917' }}>
              {nextExam ? (nextExam.subject || nextExam.subjectName || 'Soon') : 'None'}
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#a8a29e' }}>Next Exam</p>
          </Card>
        </motion.div>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.24 }}>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} style={{ color: '#ea580c' }} />
              <h2 className="text-base font-bold" style={{ color: '#1c1917' }}>Today's Schedule</h2>
            </div>
            {todaySchedule.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: '#a8a29e' }}>No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todaySchedule.map((slot, idx) => {
                  const isBreak = ['Break', 'Lunch', 'Recess'].includes(slot.period);
                  return (
                    <div key={idx} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isBreak ? 'opacity-60' : ''}`}
                      style={{ background: isBreak ? 'rgba(0,0,0,0.04)' : 'rgba(234,88,12,0.04)', borderLeft: `3px solid ${isBreak ? '#d6d3d1' : '#ea580c'}` }}>
                      <span className="text-xs font-semibold w-12 shrink-0" style={{ color: '#78716c' }}>
                        {slot.time ? slot.time.split(' – ')[0] : slot.period || ''}
                      </span>
                      <span className="font-semibold flex-1" style={{ color: '#1c1917' }}>
                        {slot.subject || slot.period}
                      </span>
                      {slot.room && <span className="text-xs" style={{ color: '#a8a29e' }}>Rm {slot.room}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.32 }}>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={16} style={{ color: '#ea580c' }} />
              <h2 className="text-base font-bold" style={{ color: '#1c1917' }}>Upcoming Deadlines</h2>
            </div>
            {upcomingDeadlines.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: '#a8a29e' }}>No deadlines in the next 7 days</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.slice(0, 5).map((a, idx) => {
                  const due = new Date(a.due_date || a.dueDate || a.due);
                  const daysLeft = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: 'rgba(234,88,12,0.04)', borderLeft: '3px solid #ea580c' }}>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ color: '#1c1917' }}>{a.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>{a.subject}</p>
                      </div>
                      <span className="text-xs font-semibold shrink-0 px-2 py-0.5 rounded-lg"
                        style={{ background: daysLeft <= 1 ? 'rgba(239,68,68,0.1)' : 'rgba(234,88,12,0.08)', color: daysLeft <= 1 ? '#dc2626' : '#ea580c' }}>
                        {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* AI Tip */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(234,88,12,0.08)' }}>
                <Lightbulb size={14} style={{ color: '#ea580c' }} />
              </div>
              <h2 className="text-base font-bold" style={{ color: '#1c1917' }}>Tip of the Day</h2>
              {weakestSubject && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold ml-auto"
                  style={{ background: 'rgba(234,88,12,0.06)', color: '#ea580c' }}>
                  Focus: {weakestSubject}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#57534e' }}>{tip}</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};