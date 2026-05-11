import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Clock, Award, FileText, UserCheck, TrendingUp, AlertCircle, ChevronRight, Wrench, Users, MessageCircle,
  Trophy, Star, Target, Zap, Brain, Calendar, BarChart3, PieChart, Bell, Flame, Crown, Medal,
  TrendingDown, Activity, MessageSquare, Share2, Focus, Moon, Sun, GripVertical, CheckCircle2, XCircle, Timer
} from 'lucide-react';
import { KEYS } from '../../../data/schema';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { calendarService } from '../../../services/calendarService';
import { aiCoachService } from '../../../services/aiCoachService';
import { request } from '../../../utils/apiClient';

const StatCard = ({ icon: Icon, label, value, subtitle, delay, color = '#ea580c' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="nova-card p-5 relative overflow-hidden"
      style={{ transition: 'all 250ms' }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: color }} />
      <div className="flex justify-between items-start mb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#a8a29e', letterSpacing: '0.08em' }}>{label}</span>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <span className="text-4xl font-extrabold tracking-tight block" style={{ color: '#1c1917' }}>{value}</span>
      {subtitle && (
        <div className="flex items-center gap-2 mt-2.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          <span className="text-xs font-medium" style={{ color: '#a8a29e' }}>{subtitle}</span>
        </div>
      )}
    </motion.div>
  );
};

const XPBar = ({ xp, level, nextLevelXP }) => {
  const progress = ((xp % nextLevelXP) / nextLevelXP) * 100;
  const levelTitles = ['Beginner', 'Scholar', 'Expert', 'Master', 'Legend'];
  const currentTitle = levelTitles[Math.min(Math.floor(level / 5), levelTitles.length - 1)];
  
  return (
    <div className="nova-card p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
              {level}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
              <Trophy size={12} className="text-white" />
            </div>
          </div>
          <div>
            <p className="font-bold text-gray-900">Level {level}</p>
            <p className="text-xs text-gray-500">{currentTitle} Rank</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-gray-900">{xp.toLocaleString()} XP</p>
          <p className="text-xs text-gray-500">{nextLevelXP - (xp % nextLevelXP)} XP to next level</p>
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full"
        />
      </div>
    </div>
  );
};

const BadgeCard = ({ badge }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -4 }}
    className="flex flex-col items-center p-3 rounded-xl bg-gray-50 border border-gray-100"
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.color}`}>
      <badge.icon size={18} className="text-white" />
    </div>
    <p className="text-xs font-semibold mt-2 text-gray-700">{badge.name}</p>
  </motion.div>
);

const StudyHeatmap = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeks = Array.from({ length: 5 }, (_, i) => i);
  const intensity = () => Math.random();

  return (
    <div className="nova-card p-6">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-600">
        <Activity size={14} /> Study Activity
      </h3>
      <div className="flex flex-col gap-1">
        {weeks.map((week) => (
          <div key={week} className="flex gap-1">
            {days.map((day, i) => {
              const val = intensity();
              const bg = val > 0.7 ? 'bg-green-500' : val > 0.4 ? 'bg-green-300' : val > 0.1 ? 'bg-green-100' : 'bg-gray-100';
              return <div key={`${week}-${i}`} className={`w-4 h-4 rounded-sm ${bg}`} />;
            })}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3">Last 5 weeks activity</p>
    </div>
  );
};

const CSCalendarWidget = ({ assignments, announcements }) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const getEventsForDay = (day) => {
    const dateStr = day.toISOString().split('T')[0];
    const events = [];

    // Class events from announcements
    announcements.forEach(a => {
      if (a.date === dateStr || a.startDate === dateStr) {
        events.push({ type: 'class', label: a.title, color: '#3b82f6' });
      }
    });

    // Assignment events
    assignments.forEach(a => {
      const dueDate = a.dueDate || a.due_date;
      if (dueDate && dueDate.split('T')[0] === dateStr) {
        events.push({ type: 'assignment', label: a.title, color: '#f59e0b' });
      }
    });

    // Exam events (from assignments with exam type)
    assignments.forEach(a => {
      if (a.type === 'exam' || a.isExam) {
        const examDate = a.examDate || a.date || a.dueDate;
        if (examDate && examDate.split('T')[0] === dateStr) {
          events.push({ type: 'exam', label: a.title, color: '#ef4444' });
        }
      }
    });

    // Study events from announcements
    announcements.forEach(a => {
      if ((a.type === 'study' || a.category === 'study') && (a.date === dateStr || a.startDate === dateStr)) {
        events.push({ type: 'study', label: a.title, color: '#8b5cf6' });
      }
    });

    // Custom/Event from announcements
    announcements.forEach(a => {
      if ((a.type === 'event' || a.category === 'event') && (a.date === dateStr || a.startDate === dateStr)) {
        events.push({ type: 'event', label: a.title, color: '#10b981' });
      }
    });

    return events;
  };

  const eventTypeColors = [
    { type: 'Class', color: '#3b82f6', bg: 'bg-blue-100' },
    { type: 'Assignment', color: '#f59e0b', bg: 'bg-amber-100' },
    { type: 'Exam', color: '#ef4444', bg: 'bg-red-100' },
    { type: 'Study', color: '#8b5cf6', bg: 'bg-purple-100' },
    { type: 'Event', color: '#10b981', bg: 'bg-green-100' },
  ];

  return (
    <div className="nova-card p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Calendar size={18} className="text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">CS Calendar</h3>
            <p className="text-[11px] text-gray-400">Next 7 days at a glance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/student/calendar"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center gap-1.5"
          >
            <span className="text-[10px]">+</span> New Event
          </a>
          <a
            href="/student/calendar"
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors flex items-center gap-1.5"
          >
            Open Calendar
            <ChevronRight size={12} />
          </a>
        </div>
      </div>

      {/* 7-Day Strip */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((day, i) => {
          const events = getEventsForDay(day);
          const overflow = events.length > 3 ? events.length - 3 : 0;
          const visibleEvents = events.slice(0, 3);
          const isToday = i === 0;

          return (
            <div
              key={i}
              className={`
                relative flex flex-col items-center p-3 rounded-xl cursor-pointer
                transition-all hover:bg-white/10
                ${isToday ? 'bg-orange-500/20 ring-1 ring-orange-500/50' : 'bg-white/5'}
              `}
              onClick={() => window.location.href = '/student/calendar'}
            >
              <span className="text-[10px] font-medium text-gray-400 uppercase">
                {i === 0 ? 'Today' : day.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className={`text-lg font-bold mt-1 ${isToday ? 'text-orange-400' : 'text-white'}`}>
                {day.getDate()}
              </span>
              <div className="flex flex-col gap-1 mt-2 items-center">
                {visibleEvents.map((e, j) => (
                  <div
                    key={j}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: e.color }}
                    title={e.label}
                  />
                ))}
                {overflow > 0 && (
                  <span className="text-[9px] font-bold text-gray-400">+{overflow}</span>
                )}
                {events.length === 0 && (
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Type Pills */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider self-center mr-1">Legend:</span>
        {eventTypeColors.map((item) => (
          <span
            key={item.type}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${item.bg}`}
            style={{ color: item.color }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.type}
          </span>
        ))}
      </div>
    </div>
  );
};

const WeeklyChallenge = ({ challenge }) => (
  <div className="nova-card p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
    <div className="flex items-center gap-2 mb-3">
      <Flame size={18} className="text-yellow-300" />
      <span className="text-xs font-bold uppercase tracking-wider">Weekly Challenge</span>
    </div>
    <h4 className="font-bold text-lg mb-2">{challenge.title}</h4>
    <p className="text-sm opacity-80 mb-4">{challenge.description}</p>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Star size={14} className="text-yellow-300" />
        <span className="font-bold">+{challenge.reward} XP</span>
      </div>
      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{challenge.progress}/{challenge.target}</span>
    </div>
    <div className="h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
      <div 
        className="h-full bg-yellow-300 rounded-full" 
        style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
      />
    </div>
  </div>
);

const AICoachTip = ({ tip }) => (
  <div className="nova-card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
        <Brain size={18} className="text-white" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 mb-1">AI Study Coach</p>
        <p className="text-sm text-gray-600">{tip}</p>
      </div>
    </div>
  </div>
);

const SubjectHealthRadar = ({ data }) => (
  <div className="nova-card p-6">
    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-600">
      <PieChart size={14} /> Subject Health Score
    </h3>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
          <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const LiveActivityTicker = ({ activities }) => (
  <div className="nova-card p-4 bg-gray-900 text-white overflow-hidden">
    <div className="flex items-center gap-3 mb-2">
      <Bell size={14} className="animate-pulse" />
      <span className="text-xs font-semibold uppercase tracking-wider">Live Activity Feed</span>
    </div>
    <div className="space-y-2 overflow-hidden">
      <AnimatePresence>
        {activities.slice(0, 3).map((activity, i) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="text-xs text-gray-300 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {activity.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </div>
);

const CountdownTimer = ({ label, timeLeft }) => (
  <div className="flex flex-col items-center">
    <span className="text-xs text-gray-500 mb-1">{label}</span>
    <span className="font-mono font-bold text-lg text-gray-900">{timeLeft}</span>
  </div>
);

const GoalProgress = ({ goal }) => (
  <div className="p-4 rounded-xl bg-gray-50 mb-3">
    <div className="flex justify-between items-center mb-2">
      <span className="font-medium text-sm text-gray-900">{goal.subject}</span>
      <span className="text-xs font-bold" style={{ color: goal.progress >= 90 ? '#10b981' : goal.progress >= 70 ? '#f59e0b' : '#ef4444' }}>
        {goal.progress}%
      </span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${goal.progress}%` }}
        className="h-full rounded-full"
        style={{ 
          background: goal.progress >= 90 ? 'linear-gradient(90deg, #10b981, #059669)' : 
                     goal.progress >= 70 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 
                     'linear-gradient(90deg, #ef4444, #dc2626)' 
        }}
      />
    </div>
    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
      <span>Current: {goal.current}</span>
      <span>Target: {goal.target}%</span>
    </div>
  </div>
);

const CalendarDay = ({ day, events }) => {
  const hasAssignment = events.some(e => e.type === 'assignment');
  const hasExam = events.some(e => e.type === 'exam');
  const hasEvent = events.some(e => e.type === 'event');
  
  return (
    <div className="aspect-square rounded-lg flex flex-col items-center justify-center text-sm hover:bg-gray-50 cursor-pointer">
      <span>{day}</span>
      <div className="flex gap-1 mt-1">
        {hasAssignment && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
        {hasExam && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
        {hasEvent && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
      </div>
    </div>
  );
};

export const StudentDashboard = ({ user }) => {
  // API-fetched data
  const [apiAssignments, setApiAssignments] = useState([]);
  const [apiMarks, setApiMarks] = useState([]);
  const [apiAttendance, setApiAttendance] = useState([]);
  const [apiAnnouncements, setApiAnnouncements] = useState([]);
  const [apiTimetable, setApiTimetable] = useState({});
  const [loadingDash, setLoadingDash] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoadingDash(true);

    Promise.allSettled([
      request('/school/assignments'),
      request(`/student/grades`),
      request(`/school/attendance/${user.id}/report`),
      request('/school/announcements?limit=50'),
      request('/school/timetables'),
    ]).then(([assignRes, marksRes, attRes, annRes, ttRes]) => {
      if (cancelled) return;
      if (assignRes.status === 'fulfilled') {
        const list = assignRes.value.assignments || assignRes.value.items || [];
        setApiAssignments(list);
      }
      if (marksRes.status === 'fulfilled') {
        const list = marksRes.value.marks || marksRes.value.items || [];
        setApiMarks(list);
      }
      if (attRes.status === 'fulfilled') {
        const list = attRes.value.records || attRes.value.items || [];
        setApiAttendance(list);
      }
      if (annRes.status === 'fulfilled') {
        const list = annRes.value.announcements || annRes.value.items || [];
        setApiAnnouncements(list);
      }
      if (ttRes.status === 'fulfilled') {
        setApiTimetable(ttRes.value.timetable || ttRes.value || {});
      }
    }).finally(() => { if (!cancelled) setLoadingDash(false); });

    return () => { cancelled = true; };
  }, [user?.id]);

  // Use API data
  const safeAssignments = apiAssignments;
  const safeSubmissions = [];
  const safeMarks = apiMarks;
  const safeAttendance = apiAttendance;
  const safeTimetable = apiTimetable;
  const safeAnnouncements = apiAnnouncements;
  const safeExams = [];
  const safeAttempts = [];
  
  const [focusMode, setFocusMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const myAssignments = safeAssignments.filter(a => !a.class_id || a.class_id === user.classroomId || a.class === user.class);
  const pendingAssignments = myAssignments.filter(a => {
    const sub = safeSubmissions.find((s) => s.assignmentId === a.id && s.studentId === user.id);
    return !sub || (sub.status !== 'submitted' && sub.status !== 'graded');
  });

  // Normalize marks — API returns score/maxMarks, local uses marksObtained/maxMarks
  const normalizedMarks = safeMarks.map(m => ({
    ...m,
    marksObtained: m.marksObtained ?? m.score ?? 0,
    maxMarks: m.maxMarks ?? m.max_marks ?? 100,
    subject: m.subject || 'General',
  }));

  const myMarks = normalizedMarks.filter(m => !m.student_id || m.student_id === user.id || m.studentId === user.id);
  const avgMarks = myMarks.length > 0 ? Math.round(myMarks.reduce((a, b) => a + (b.marksObtained / b.maxMarks) * 100, 0) / myMarks.length) : 0;

  const myAttendance = safeAttendance.filter(a => !a.student_id || a.student_id === user.id || a.studentId === user.id);
  const presentCount = myAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 0;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = safeTimetable[user.class]?.find(t => t.day === today)?.slots || [];

  // Dynamic Data Calculations — use computed values, no useStore needed
  const xpData = { xp: 0, level: 1 };
  const badgesData = [];
  const goalsData = [];
  const studyActivity = {};
  const notifications = [];

  // Calculate real XP and level
  const baseXP = myMarks.reduce((sum, m) => sum + (m.marksObtained * 2), 0) + 
                 myAttendance.filter(a => a.status === 'present').length * 5;
  const xp = baseXP;
  const level = Math.floor(xp / 1000) + 1;
  const nextLevelXP = 1000;

  // Calculate subject health scores dynamically
  const subjectMarks = {};
  myMarks.forEach(m => {
    if (!subjectMarks[m.subject]) subjectMarks[m.subject] = [];
    subjectMarks[m.subject].push((m.marksObtained / m.maxMarks) * 100);
  });

  const subjectAttendance = {};
  myAttendance.forEach(a => {
    if (!subjectAttendance[a.subject]) subjectAttendance[a.subject] = { present: 0, total: 0 };
    subjectAttendance[a.subject].total++;
    if (a.status === 'present') subjectAttendance[a.subject].present++;
  });

  const subjectHealthData = Object.entries(subjectMarks).map(([subject, marks]) => {
    const avgMark = marks.reduce((a,b) => a+b, 0) / marks.length;
    const attRate = subjectAttendance[subject] ? (subjectAttendance[subject].present / subjectAttendance[subject].total) * 100 : 80;
    return {
      subject,
      score: Math.round((avgMark * 0.7) + (attRate * 0.3))
    };
  });

  // Dynamic badges earned from actual achievements
  const earnedBadges = [];
  if (attendanceRate >= 95) earnedBadges.push({ name: 'Perfect Attendance', icon: CheckCircle2, color: 'bg-green-500' });
  if (avgMarks >= 80) earnedBadges.push({ name: 'Honor Roll', icon: Crown, color: 'bg-yellow-500' });
  if (pendingAssignments.length === 0) earnedBadges.push({ name: 'All Caught Up', icon: CheckCircle2, color: 'bg-blue-500' });
  if (myMarks.some(m => m.marksObtained >= 95)) earnedBadges.push({ name: 'Top Scorer', icon: Medal, color: 'bg-purple-500' });

  // Real weekly challenge progress
  const completedAssignments = myAssignments.length - pendingAssignments.length;
  const weeklyChallenge = {
    title: 'Submit 3 assignments this week',
    description: 'Complete all pending tasks before Friday',
    reward: 50,
    progress: Math.min(completedAssignments, 3),
    target: 3
  };

  // Live activities from actual notifications
  const liveActivities = (Array.isArray(notifications) ? notifications : []).slice(0, 3).map(n => ({
    id: n.id,
    message: n.message
  })).concat([
    { id: 'live1', message: `${todaySchedule[0]?.subject || 'Next'} class starting soon` }
  ]);

  // Goals from stored user targets (read from Firebase via useStore)
  const goals = goalsData || [];

  const calendarEvents = useMemo(() => {
    const myAssignments = safeAssignments.filter((a) => a.class === user.class);
    return calendarService.buildEvents({ user, assignments: myAssignments, exams: safeExams, timetable: safeTimetable, announcements: safeAnnouncements });
  }, [safeAssignments, safeExams, safeTimetable, safeAnnouncements, user]);

  const upcoming = useMemo(() => calendarService.nextUpcoming({ events: calendarEvents, limit: 3 }), [calendarEvents]);

  // AI Coach generates real tip based on weakest subject
  const coach = useMemo(() => {
    return aiCoachService.buildCoach({
      user,
      subjectHealthData,
      pendingAssignments,
      upcomingEvents: upcoming,
      attendanceRate,
      attempts: safeAttempts.filter((a) => a.studentId === user.id),
    });
  }, [user, subjectHealthData, pendingAssignments, upcoming, attendanceRate, safeAttempts]);
  const aiTip = coach.tip;

  const countdownItems = useMemo(() => {
    const now = new Date();
    const fmt = (ms) => {
      const total = Math.max(0, Math.floor(ms / 1000));
      const h = String(Math.floor(total / 3600)).padStart(2, '0');
      const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
      const s = String(total % 60).padStart(2, '0');
      return `${h}:${m}:${s}`;
    };
    return upcoming.map((e) => {
      const when = new Date(e.date);
      // if we only have date (no time), treat it as end of that day
      when.setHours(23, 59, 59, 999);
      const label =
        e.type === 'exam' ? 'Next Exam' :
        e.type === 'assignment' ? 'Assignment Due' :
        e.type === 'class' ? 'Classes' :
        'Upcoming';
      return { label, timeLeft: fmt(when.getTime() - now.getTime()), event: e };
    });
  }, [upcoming]);

  useEffect(() => {
    if (!user || safeAnnouncements.length === 0) return;
    const toMark = safeAnnouncements.filter(a => !(a.readBy || []).includes(user.id));
    if (toMark.length === 0) return;
    // Announcements are read-only from API, no local update needed
  }, [safeAnnouncements, user]);

  if (focusMode) {
    return (
      <div className="space-y-6 max-w-[800px] mx-auto w-full pt-2 pb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Focus Mode</h2>
          <button onClick={() => setFocusMode(false)} className="text-sm text-gray-500">Exit Focus Mode</button>
        </div>
        
        <div className="nova-card p-6">
          <h3 className="font-bold mb-4">Today's Tasks</h3>
          {pendingAssignments.map(a => (
            <div key={a.id} className="p-4 border border-gray-200 rounded-xl mb-3 flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-gray-500">{a.subject} • Due: {a.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full relative pt-2 pb-12">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="nova-card p-6 md:p-8 relative overflow-hidden"
      >
        {/* Atmospheric background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(234,88,12,0.08)', color: '#ea580c', border: '1px solid rgba(234,88,12,0.15)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
              Active Session
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.15)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} />
              {user.class}
            </span>
            <button
              onClick={() => setFocusMode(!focusMode)}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all hover:brightness-95"
              style={{ background: 'rgba(168,85,247,0.08)', color: '#7c3aed', border: '1px solid rgba(168,85,247,0.15)' }}
            >
              <Focus size={12} /> Focus Mode
            </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3 mb-3" style={{ color: '#1c1917' }}>
            <span className="w-1.5 h-10 rounded-full" style={{ background: 'linear-gradient(180deg, #ea580c, #f97316)' }} />
            Welcome back, <span style={{ color: '#ea580c' }}>{user.name.split(' ')[0]}</span>
          </h1>
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              { label: 'Class', value: user.class },
              { label: 'ID', value: user.admissionNo || user.rollNo || user.id.slice(-6).toUpperCase() },
              { label: 'Level', value: level },
            ].map((tag, i) => (
              <span
                key={tag.label}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--bg-surface)', color: '#78716c', border: '1px solid rgba(0,0,0,0.06)' }}
              >
                {tag.label}: <span style={{ color: '#1c1917' }}>{tag.value}</span>
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* XP & Gamification Bar */}
      <XPBar xp={xp} level={level} nextLevelXP={nextLevelXP} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserCheck} label="Attendance" value={`${attendanceRate}%`} subtitle="Monthly average" delay={0.1} color="#10b981" />
        <StatCard icon={FileText} label="Pending Tasks" value={pendingAssignments.length} subtitle="Needs attention" delay={0.15} color="#f59e0b" />
        <StatCard icon={Award} label="Average Score" value={`${avgMarks}%`} subtitle="Performance" delay={0.2} color="#a855f7" />
        <StatCard icon={Clock} label="Classes Today" value={todaySchedule.length} subtitle="Scheduled" delay={0.25} color="#3b82f6" />
      </div>

      {/* Live Activity Ticker */}
      <LiveActivityTicker activities={liveActivities} />

      {/* Countdown Timers */}
      <div className="nova-card p-6">
        <h3 className="text-sm font-semibold mb-4 text-gray-600">Upcoming Deadlines</h3>
        <div className="grid grid-cols-3 gap-4">
          {(countdownItems.length > 0 ? countdownItems : [
            { label: 'Next Exam', timeLeft: '--:--:--' },
            { label: 'Assignment Due', timeLeft: '--:--:--' },
            { label: 'Class Starts', timeLeft: '--:--:--' },
          ]).map((cd, i) => <CountdownTimer key={i} label={cd.label} timeLeft={cd.timeLeft} />)}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Coach + Weekly Challenge */}
        <div className="space-y-6">
          <AICoachTip tip={aiTip} />
          {coach.plan?.length > 0 && (
            <div className="nova-card p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-600">
                <Brain size={14} /> Coach Plan (Next Steps)
              </h3>
              <div className="space-y-3">
                {coach.plan.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <WeeklyChallenge challenge={weeklyChallenge} />
          <StudyHeatmap />
        </div>

        {/* Subject Health + Goals */}
        <div className="space-y-6">
          <SubjectHealthRadar data={subjectHealthData} />
          
          <div className="nova-card p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-600">
              <Target size={14} /> Semester Goals
            </h3>
            {goals.map((goal, i) => <GoalProgress key={i} goal={goal} />)}
          </div>

          <div className="nova-card p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-600">
              <Award size={14} /> Earned Badges
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {earnedBadges.map((badge, i) => <BadgeCard key={i} badge={badge} />)}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="nova-card p-6">
            <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Today's Schedule
            </h3>
            {todaySchedule.length === 0 ? (
              <div className="py-12 border border-dashed rounded-xl flex items-center justify-center border-gray-200">
                <p className="text-xs text-gray-500">No classes scheduled</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySchedule.map((slot, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-gray-200 text-gray-700 flex-shrink-0">
                      {slot.time.split(' ')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{slot.subject}</p>
                      <p className="text-xs mt-0.5 text-gray-500">{slot.teacher} • Room {slot.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Pending Assignments */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="nova-card p-6">
            <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Pending Assignments
            </h3>
            {pendingAssignments.length === 0 ? (
              <div className="py-12 border border-dashed rounded-xl flex items-center justify-center border-gray-200">
                <p className="text-xs text-gray-500">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingAssignments.map(a => {
                  const isLate = new Date(a.dueDate) < new Date();
                  return (
                    <div key={a.id}
                      className="p-3.5 rounded-xl bg-gray-50 border border-gray-200"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                          <p className="text-xs mt-1 text-gray-500">{a.subject} • Due: {a.dueDate}</p>
                        </div>
                        {isLate && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 shrink-0">Overdue</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Announcements */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="nova-card p-6">
            <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              Announcements
            </h3>
            <div className="space-y-3">
              {safeAnnouncements.slice(0, 4).map(a => (
                <div key={a.id} className="border-l-2 pl-3 py-1.5 border-gray-200">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${a.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                      {a.priority} priority
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{a.date}</span>
                  </div>
                  <p className="text-sm leading-relaxed mt-1 text-gray-600">{a.title}</p>
                </div>
              ))}
              {safeAnnouncements.length === 0 && (
                <p className="text-xs text-gray-500">No announcements</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="nova-card p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-600">
          <Calendar size={14} /> This Month
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 31 }, (_, i) => {
            const d = new Date();
            d.setDate(1 + i);
            const dateKey = d.toISOString().split('T')[0];
            const dayEvents = calendarEvents.filter((e) => e.date === dateKey);
            return <CalendarDay key={i} day={i + 1} events={dayEvents} />;
          })}
        </div>
      </div>

      {/* CS Calendar Widget */}
      <CSCalendarWidget assignments={safeAssignments} announcements={safeAnnouncements} />
    </div>
  );
};
