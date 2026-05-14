import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Calendar, Clock, Target, BookOpen, ChevronRight, ChevronDown,
  Plus, Zap, Play, RotateCcw, CheckCircle2, Star, TrendingUp, AlertCircle,
  Loader2, ArrowRight, Sparkles, LayoutGrid, Timer
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useSound } from '../../../hooks/useSound';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'History', 'Geography', 'Computer Science', 'Hindi',
];

const TOPICS = {
  Mathematics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Quadratic Equations', 'Linear Equations', 'Coordinate Geometry', 'Calculus'],
  Physics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electricity', 'Magnetism', 'Waves', 'Modern Physics', 'Kinematics'],
  Chemistry: ['Atomic Structure', 'Chemical Bonding', 'Periodic Table', 'Organic Chemistry', 'Electrochemistry', 'Equilibrium', 'Thermodynamics', 'Redox'],
  Biology: ['Cell Biology', 'Genetics', 'Human Anatomy', 'Plant Biology', 'Ecology', 'Evolution', 'Biochemistry', 'Microbiology'],
  English: ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Essay Writing', 'Poetry Analysis', 'Literature', 'Communication Skills'],
  History: ['Ancient India', 'Medieval India', 'Modern India', 'World History', 'Indian Freedom Struggle', 'Post-Independence', 'Art & Culture'],
  Geography: ['Physical Geography', 'Indian Geography', 'World Geography', 'Climate & Weather', 'Resources & Agriculture', 'Population', 'Environmental Geography'],
  'Computer Science': ['Programming Basics', 'Data Structures', 'Algorithms', 'Python', 'Web Development', 'Databases', 'Networking', 'Cybersecurity'],
  Hindi: ['Grammar', 'Comprehension', 'Essay', 'Poetry', 'Story Writing', 'Grammar Rules', 'Literature'],
};

// Generate a week-by-week study schedule
function generateSchedule({ examDate, subjects, weeklyHours, goals }) {
  const daysUntilExam = Math.max(1, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const totalHours = Math.min(weeklyHours, 56); // Cap at 8h/day

  // Distribute hours across subjects based on difficulty
  const weights = { Mathematics: 1.2, Physics: 1.1, Chemistry: 1.0, Biology: 0.9, English: 0.7, History: 0.6, Geography: 0.7, 'Computer Science': 1.1, Hindi: 0.6 };
  const totalWeight = subjects.reduce((s, sub) => s + (weights[sub] || 1.0), 0);

  const weeks = Math.ceil(daysUntilExam / 7);
  const schedule = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Weekly intensity: front-load intensive weeks, taper off at the end
  const weekIntensities = Array.from({ length: weeks }, (_, i) => {
    if (i === 0) return 0.9;
    if (i === weeks - 1) return 1.2; // Final week revision sprint
    if (i < weeks / 2) return 1.0;
    return 0.85;
  });

  const allTopics = Object.values(TOPICS).flat();

  for (let week = 0; week < weeks; week++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + week * 7);
    const daysThisWeek = Math.min(7, daysUntilExam - week * 7);
    const weekHours = totalHours * weekIntensities[week];
    const hoursPerDay = weekHours / daysThisWeek;

    const weekData = {
      week: week + 1,
      label: week === 0 ? 'This Week' : week === weeks - 1 ? 'Final Week' : `Week ${week + 1}`,
      startDate: weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      endDate: new Date(weekStart.getTime() + (daysThisWeek - 1) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      totalHours: Math.round(weekHours),
      phases: [],
    };

    // Study days distribution
    const studyDays = [];
    for (let d = 0; d < daysThisWeek; d++) {
      const dayDate = new Date(weekStart.getTime() + d * 86400000);
      const dayOfWeek = dayDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const sessions = [];
      if (!isWeekend || weekHours > 20) {
        const dayHours = isWeekend ? hoursPerDay * 1.3 : hoursPerDay;

        for (const subject of subjects) {
          const subjectHours = (dayHours * (weights[subject] || 1.0)) / totalWeight;
          if (subjectHours < 0.2) continue;

          const availableTopics = TOPICS[subject] || allTopics.slice(0, 3);
          const topic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
          const sessionMin = Math.round(subjectHours * 60);
          const sessionCount = Math.max(1, Math.floor(sessionMin / 45));

          if (sessionCount === 1) {
            sessions.push({
              subject,
              topic,
              duration: `${sessionMin}m`,
              type: 'study',
            });
          } else {
            for (let s = 0; s < sessionCount; s++) {
              sessions.push({
                subject,
                topic: s === 0 ? topic : `Practice: ${topic}`,
                duration: `${Math.round(sessionMin / sessionCount)}m`,
                type: s === 0 ? 'study' : 'practice',
              });
            }
          }
        }

        // Add review block for later weeks
        if (week >= Math.floor(weeks / 2)) {
          sessions.push({ subject: 'Review', topic: 'Previous week topics', duration: '30m', type: 'review' });
        }

        // Add break for long sessions
        const totalMins = sessions.reduce((s, ses) => s + parseInt(ses.duration), 0);
        if (totalMins > 120) {
          sessions.push({ subject: 'Break', topic: 'Short break', duration: '15m', type: 'break' });
        }
      } else {
        sessions.push({ subject: 'Weekend', topic: goals || 'Light revision / rest', duration: `${Math.round(dayHours * 60)}m`, type: 'light' });
      }

      studyDays.push({
        date: dayDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        fullDate: dayDate.toISOString().split('T')[0],
        sessions,
        totalHours: Math.round(sessions.reduce((s, ses) => s + parseInt(ses.duration), 0) / 60 * 10) / 10,
      });
    }

    weekData.phases = studyDays;
    schedule.push(weekData);
  }

  return {
    summary: {
      examDate,
      daysUntilExam,
      totalStudyHours: Math.round(totalHours * weeks),
      weeklyHours,
      weeks,
      subjects,
      goals,
    },
    schedule,
  };
}

const SUBJECT_COLORS = {
  Mathematics: { bg: '#fdf2f8', border: '#db2777', text: '#9d174d', icon: '✖' },
  Physics: { bg: '#f5f3ff', border: '#7c3aed', text: '#5b21b6', icon: '⚡' },
  Chemistry: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: '⚗' },
  Biology: { bg: '#f0fdf4', border: '#16a34a', text: '#166534', icon: '🧬' },
  English: { bg: '#fffbeb', border: '#d97706', text: '#92400e', icon: '📖' },
  History: { bg: '#fff1f2', border: '#e11d48', text: '#9f1239', icon: '📜' },
  Geography: { bg: '#f0fdfa', border: '#0d9488', text: '#134e4a', icon: '🌍' },
  'Computer Science': { bg: '#faf5ff', border: '#a855f7', text: '#7e22ce', icon: '💻' },
  Hindi: { bg: '#fefce8', border: '#ca8a04', text: '#854d0e', icon: '📝' },
  Review: { bg: '#f1f5f9', border: '#64748b', text: '#334155', icon: '🔄' },
  Break: { bg: '#f0f9ff', border: '#0284c7', text: '#0c4a6e', icon: '☕' },
  Weekend: { bg: '#fafafa', border: '#d4d4d4', text: '#525252', icon: '🌿' },
};

export const AIStudyPlanner = ({ user }) => {
  const { playClick, playBlip } = useSound();
  const [step, setStep] = useState(1); // 1 = form, 2 = schedule

  // Form state
  const [examDate, setExamDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  });
  const [examName, setExamName] = useState('Half-Yearly Examination');
  const [selectedSubjects, setSelectedSubjects] = useState(['Mathematics', 'Physics', 'Chemistry']);
  const [weeklyHours, setWeeklyHours] = useState(25);
  const [goals, setGoals] = useState('');
  const [generating, setGenerating] = useState(false);
  const [schedule, setSchedule] = useState(null);

  // Expanded week
  const [expandedWeek, setExpandedWeek] = useState(0);

  const toggleSubject = (s) => {
    playClick();
    setSelectedSubjects(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleGenerate = async () => {
    if (selectedSubjects.length === 0) return;
    playBlip();
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500)); // Simulate AI thinking
    const result = generateSchedule({
      examDate,
      subjects: selectedSubjects,
      weeklyHours,
      goals,
    });
    setSchedule(result);
    setGenerating(false);
    setStep(2);
  };

  const handleAddToFocusMode = () => {
    if (!schedule) return;
    playBlip();
    const existingTasks = JSON.parse(localStorage.getItem('sms_focus_tasks') || '[]');
    const newTasks = [];

    schedule.schedule.forEach(week => {
      week.phases.forEach(day => {
        day.sessions.forEach(session => {
          if (['study', 'practice', 'review'].includes(session.type) && session.subject !== 'Weekend' && session.subject !== 'Break') {
            newTasks.push({
              id: `focus-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              title: `${session.subject}: ${session.topic}`,
              subject: session.subject,
              duration: session.duration,
              type: session.type,
              date: day.fullDate,
              week: week.week,
              completed: false,
              addedAt: new Date().toISOString(),
            });
          }
        });
      });
    });

    localStorage.setItem('sms_focus_tasks', JSON.stringify([...existingTasks, ...newTasks]));
    // Dispatch event so Focus Mode picks up changes
    window.dispatchEvent(new CustomEvent('sms_storage_changed', { detail: { key: 'sms_focus_tasks' } }));
  };

  const handleReset = () => {
    playClick();
    setStep(1);
    setSchedule(null);
    setExpandedWeek(0);
  };

  const subjectColor = (s) => SUBJECT_COLORS[s] || { bg: '#f9fafb', border: '#6b7280', text: '#374151', icon: '📚' };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-200 rounded-sm text-[10px] font-bold uppercase tracking-widest">
            AI_Powered
          </span>
          <div className="h-[1px] w-8 bg-gray-200" />
          <span className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={10} className="text-orange-400" /> Intelligent Scheduler
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 flex items-center gap-4">
          <Brain className="text-orange-500" size={36} />
          AI Study Planner
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Enter your exam details and let AI create a personalized week-by-week study schedule.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Step 1: Exam Details */}
            <Card className="p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: '#ea580c' }}>1</div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Exam Details</h3>
                  <p className="text-xs text-gray-500">Tell us about your upcoming exam</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Exam Name</label>
                  <input
                    type="text" value={examName} onChange={e => setExamName(e.target.value)}
                    placeholder="e.g., Final Term Physics"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Exam Date</label>
                  <input
                    type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Step 2: Subjects */}
            <Card className="p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: '#ea580c' }}>2</div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Select Subjects</h3>
                  <p className="text-xs text-gray-500">Choose the subjects you need to prepare</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {SUBJECTS.map(s => {
                  const selected = selectedSubjects.includes(s);
                  const color = subjectColor(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSubject(s)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all"
                      style={{
                        background: selected ? color.bg : 'transparent',
                        borderColor: selected ? color.border : '#e5e7eb',
                        color: selected ? color.text : '#6b7280',
                        boxShadow: selected ? `0 0 0 1px ${color.border}` : 'none',
                      }}
                    >
                      <span className="mr-1">{color.icon}</span>
                      {s}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400">{selectedSubjects.length} subjects selected</p>
            </Card>

            {/* Step 3: Hours & Goals */}
            <Card className="p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: '#ea580c' }}>3</div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Study Commitment</h3>
                  <p className="text-xs text-gray-500">How many hours can you study per week?</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Weekly Study Hours</label>
                    <span className="text-lg font-extrabold" style={{ color: '#ea580c' }}>{weeklyHours}h</span>
                  </div>
                  <input
                    type="range" min={5} max={56} value={weeklyHours}
                    onChange={e => setWeeklyHours(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Light (5h)</span>
                    <span>Moderate (20h)</span>
                    <span>Intensive (56h)</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-gray-500">Study Goals / Notes (optional)</label>
                  <textarea
                    value={goals} onChange={e => setGoals(e.target.value)}
                    placeholder="e.g., Focus more on trigonometry, need extra practice in Physics..."
                    className="input-field w-full min-h-[80px] resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Generate button */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                icon={generating ? Loader2 : Brain}
                onClick={handleGenerate}
                disabled={selectedSubjects.length === 0 || generating}
                className="px-8 py-3 text-sm"
                size="lg"
              >
                {generating ? (
                  <><span className="animate-spin mr-2"><Loader2 size={16} /></span>Generating Schedule...</>
                ) : (
                  <><Sparkles size={16} className="mr-2" />Generate AI Schedule</>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary bar */}
            {schedule && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Calendar, label: 'Days Left', value: schedule.summary.daysUntilExam, color: '#ea580c' },
                  { icon: Clock, label: 'Total Hours', value: `${schedule.summary.totalStudyHours}h`, color: '#7c3aed' },
                  { icon: BookOpen, label: 'Subjects', value: schedule.summary.subjects.length, color: '#0891b2' },
                  { icon: Target, label: 'Weeks', value: schedule.summary.weeks, color: '#16a34a' },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="p-5 text-center border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${s.color}15` }}>
                        <s.icon size={18} style={{ color: s.color }} />
                      </div>
                      <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Week breakdown */}
            {schedule && schedule.schedule.map((week, wi) => (
              <motion.div
                key={week.week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: wi * 0.1 }}
              >
                <Card className="border border-gray-200 overflow-hidden">
                  {/* Week header */}
                  <button
                    onClick={() => { playClick(); setExpandedWeek(expandedWeek === wi ? -1 : wi); }}
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs"
                        style={{ background: wi === 0 ? '#fef3c7' : wi === schedule.schedule.length - 1 ? '#fee2e2' : '#f3f4f6', color: wi === 0 ? '#92400e' : wi === schedule.schedule.length - 1 ? '#991b1b' : '#374151' }}>
                        W{week.week}
                      </div>
                      <div className="text-left">
                        <h3 className="text-base font-bold text-gray-900">{week.label}</h3>
                        <p className="text-xs text-gray-500">{week.startDate} – {week.endDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 text-orange-600">
                        {week.totalHours}h total
                      </span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${expandedWeek === wi ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Week detail */}
                  <AnimatePresence>
                    {expandedWeek === wi && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 p-4 space-y-3">
                          {week.phases.map((day, di) => (
                            <div key={di} className="p-4 rounded-xl border transition-all" style={{ borderColor: '#f3f4f6', background: '#fafafa' }}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Calendar size={12} className="text-gray-400" />
                                  <span className="text-sm font-bold text-gray-900">{day.date}</span>
                                </div>
                                <span className="text-[10px] font-semibold text-gray-400">{day.totalHours}h</span>
                              </div>
                              <div className="space-y-1.5">
                                {day.sessions.map((session, si) => {
                                  const color = subjectColor(session.subject);
                                  const isBreak = session.type === 'break' || session.type === 'light';
                                  return (
                                    <div key={si} className="flex items-center gap-3 py-1.5 px-3 rounded-lg text-xs"
                                      style={{ background: isBreak ? '#f9fafb' : `${color.bg}`, borderLeft: `3px solid ${color.border}` }}>
                                      <span style={{ color: color.text }} className="font-semibold w-36 flex-shrink-0">{session.subject}</span>
                                      <span className="text-gray-600 flex-1">{session.topic}</span>
                                      <span className="font-mono font-bold flex-shrink-0" style={{ color: color.text }}>{session.duration}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}

            {/* Actions */}
            <div className="flex gap-4 justify-end flex-wrap">
              <Button variant="secondary" icon={RotateCcw} onClick={handleReset} className="px-6 py-2.5">
                New Schedule
              </Button>
              <Button
                variant="primary"
                icon={Plus}
                onClick={handleAddToFocusMode}
                className="px-8 py-2.5"
                style={{ background: '#ea580c', boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)' }}
              >
                Add All to Focus Mode
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIStudyPlanner;