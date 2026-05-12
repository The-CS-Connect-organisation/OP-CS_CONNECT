import { useMemo, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Clock, Award, FileText, UserCheck, TrendingUp, ChevronRight, Wrench, Users,
  Trophy, Star, Target, Zap, Brain, Calendar, BarChart3, PieChart, Bell, Flame, Crown, Medal,
  Activity, MessageSquare, Share2, Focus, CheckCircle2, XCircle, Timer, Clock3
} from 'lucide-react';
import { studentApi } from '../../../services/apiDataLayer';
import { apiRequest } from '../../../services/apiClient';
import { getDataMode, DATA_MODES } from '../../../config/dataMode';
import { calendarService } from '../../../services/calendarService';
import { aiCoachService } from '../../../services/aiCoachService';

const StatCard = ({ icon: Icon, label, value, subtitle, delay, color = '#1f2937', loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="nova-card p-6 hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <Icon size={18} style={{ color }} />
          )}
        </div>
      </div>
      <span className="text-4xl font-bold tracking-tight block text-gray-900">{loading ? '-' : value}</span>
      {subtitle && (
        <div className="flex items-center gap-2 mt-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          <span className="text-xs text-gray-500">{subtitle}</span>
        </div>
      )}
    </motion.div>
  );
};

const XPBar = ({ xp, level, nextLevelXP, loading }) => {
  const progress = ((xp % nextLevelXP) / nextLevelXP) * 100;
  const levelTitles = ['Beginner', 'Scholar', 'Expert', 'Master', 'Legend'];
  const currentTitle = levelTitles[Math.min(Math.floor(level / 5), levelTitles.length - 1)];

  return (
    <div className="nova-card p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
              {loading ? '-' : level}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
              <Trophy size={12} className="text-white" />
            </div>
          </div>
          <div>
            <p className="font-bold text-gray-900">{loading ? 'Loading...' : `Level ${level}`}</p>
            <p className="text-xs text-gray-500">{currentTitle} Rank</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-gray-900">{loading ? '-' : xp.toLocaleString()} XP</p>
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
      <Trophy size={18} className="text-white" />
    </div>
    <p className="text-xs font-semibold mt-2 text-gray-700">{badge.name}</p>
  </motion.div>
);

const StudyHeatmap = ({ activityData }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeks = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="nova-card p-6">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-600">
        <Activity size={14} /> Study Activity
      </h3>
      <div className="flex flex-col gap-1">
        {weeks.map((week) => (
          <div key={week} className="flex gap-1">
            {days.map((day, i) => {
              // Use real activity data or show placeholder
              const val = activityData?.[`${week}-${i}`] || Math.random() * 0.3;
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
    {data.length === 0 ? (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No subject data available
      </div>
    ) : (
      <div className="h-48 flex items-center justify-center">
        {/* Simple bar chart fallback */}
        <div className="flex items-end gap-2 h-full">
          {data.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="w-8 rounded-t bg-purple-400"
                style={{ height: `${item.score}%`, maxHeight: 120 }}
              />
              <span className="text-[10px] text-gray-500 mt-1">{item.subject?.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>
    )}
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
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState(null);

  const [focusMode, setFocusMode] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    if (!user?.id) return;

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          assignmentsRes,
          marksRes,
          attendanceRes,
          announcementsRes,
          notificationsRes,
          profileRes
        ] = await Promise.allSettled([
          studentApi.getAssignments(),
          studentApi.getGrades(),
          studentApi.getAttendance(),
          apiRequest('/school/announcements'),
          apiRequest('/notifications'),
          apiRequest(`/school/students/${user.id}/profile`)
        ]);

        // Handle assignments
        if (assignmentsRes.status === 'fulfilled' && assignmentsRes.value?.items) {
          setAssignments(assignmentsRes.value.items);
        }

        // Handle marks
        if (marksRes.status === 'fulfilled' && marksRes.value?.marks) {
          setMarks(marksRes.value.marks);
        }

        // Handle attendance
        if (attendanceRes.status === 'fulfilled' && attendanceRes.value?.records) {
          setAttendance(attendanceRes.value.records);
        }

        // Handle announcements
        if (announcementsRes.status === 'fulfilled' && announcementsRes.value?.items) {
          setAnnouncements(announcementsRes.value.items);
        }

        // Handle notifications
        if (notificationsRes.status === 'fulfilled' && notificationsRes.value?.items) {
          setNotifications(notificationsRes.value.items.filter(n => n.userId === user.id));
        }

        // Fetch timetable for student's class
        const userClass = profileRes.value?.profile?.class || '10-A';
        try {
          const timetableRes = await apiRequest(`/school/timetables?classId=${userClass}`);
          if (timetableRes?.entries) {
            setTimetable(timetableRes.entries);
          }
        } catch (ttErr) {
          console.log('Timetable fetch failed, using empty', ttErr);
        }

        // Fetch submissions
        try {
          const subsRes = await apiRequest('/school/assignments');
          if (subsRes?.items) {
            // Filter submissions for this student
            setSubmissions(subsRes.items.filter(a => a.student_id === user.id));
          }
        } catch (subErr) {
          console.log('Submissions fetch failed', subErr);
        }

        // Fetch goals
        try {
          const goalsRes = await apiRequest(`/student/goals/${user.id}`);
          if (goalsRes?.goals) {
            setGoals(goalsRes.goals);
          }
        } catch (goalsErr) {
          // Goals might not exist, that's ok
          setGoals([]);
        }

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load some dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user?.id]);

  // Filter data for current student
  const myAssignments = assignments.filter(a =>
    a.class_name === user?.class || a.class === user?.class
  );

  const pendingAssignments = myAssignments.filter(a => {
    const sub = submissions.find(s => s.assignment_id === a.id);
    return !sub || (sub.status !== 'graded');
  });

  const myMarks = marks.filter(m => m.student_id === user?.id);
  const avgMarks = myMarks.length > 0
    ? Math.round(myMarks.reduce((a, b) => a + (b.score || 0), 0) / myMarks.length)
    : 0;

  const myAttendance = attendance.filter(a => a.student_id === user?.id);
  const presentCount = myAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = myAttendance.length > 0
    ? Math.round((presentCount / myAttendance.length) * 100)
    : 0;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Get today's schedule from timetable
  const todaySchedule = timetable.filter(t => t.day === today) || [];

  // Calculate XP and level
  const xpFromMarks = myMarks.reduce((sum, m) => sum + (m.score || 0), 0) * 2;
  const xpFromAttendance = presentCount * 5;
  const totalXP = xpFromMarks + xpFromAttendance;
  const level = Math.floor(totalXP / 1000) + 1;
  const nextLevelXP = 1000;

  // Calculate subject health scores
  const subjectMarks = {};
  myMarks.forEach(m => {
    if (!subjectMarks[m.subject]) subjectMarks[m.subject] = [];
    subjectMarks[m.subject].push(m.score || 0);
  });

  const subjectHealthData = Object.entries(subjectMarks).map(([subject, scores]) => {
    const avgMark = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      subject,
      score: Math.round(avgMark)
    };
  });

  // Dynamic badges
  const earnedBadges = [];
  if (attendanceRate >= 95) earnedBadges.push({ name: 'Perfect Attendance', color: 'bg-green-500' });
  if (avgMarks >= 80) earnedBadges.push({ name: 'Honor Roll', color: 'bg-yellow-500' });
  if (pendingAssignments.length === 0) earnedBadges.push({ name: 'All Caught Up', color: 'bg-blue-500' });
  if (myMarks.some(m => (m.score || 0) >= 95)) earnedBadges.push({ name: 'Top Scorer', color: 'bg-purple-500' });

  // Weekly challenge
  const completedAssignments = myAssignments.length - pendingAssignments.length;
  const weeklyChallenge = {
    title: 'Submit 3 assignments this week',
    description: 'Complete all pending tasks before Friday',
    reward: 50,
    progress: Math.min(completedAssignments, 3),
    target: 3
  };

  // Live activities from notifications
  const liveActivities = notifications.slice(0, 3).map(n => ({
    id: n.id,
    message: n.message || n.title || 'New notification'
  }));

  // Calendar events from assignments and announcements
  const calendarEvents = useMemo(() => {
    const events = [];

    // Add assignments as events
    myAssignments.forEach(a => {
      events.push({
        date: a.due_date || a.dueDate,
        type: 'assignment',
        title: a.title,
        subject: a.subject
      });
    });

    // Add announcements as events
    announcements.forEach(a => {
      if (a.created_at) {
        events.push({
          date: a.created_at.split('T')[0],
          type: a.category === 'exam' ? 'exam' : 'event',
          title: a.title
        });
      }
    });

    return events;
  }, [myAssignments, announcements]);

  // AI Coach tip
  const aiTip = useMemo(() => {
    if (pendingAssignments.length > 0) {
      return `You have ${pendingAssignments.length} pending assignment${pendingAssignments.length > 1 ? 's' : ''}. Focus on ${pendingAssignments[0].subject} first - it's due soon.`;
    }
    if (avgMarks > 85) {
      return 'Great performance! Consider reviewing your weaker subjects to maintain your excellent grades.';
    }
    if (subjectHealthData.length > 0) {
      const weakest = subjectHealthData.reduce((min, curr) =>
        curr.score < min.score ? curr : min
      );
      return `Your ${weakest.subject} scores could improve. Try spending 30 minutes daily on practice problems.`;
    }
    return 'Stay consistent with your studies. Regular practice is key to academic success!';
  }, [pendingAssignments, avgMarks, subjectHealthData]);

  // Countdown timers
  const countdownItems = useMemo(() => {
    const now = new Date();
    const items = [];

    // Next assignment deadline
    const nextAssignment = pendingAssignments[0];
    if (nextAssignment) {
      const dueDate = new Date(nextAssignment.due_date || nextAssignment.dueDate);
      if (dueDate > now) {
        const diff = dueDate.getTime() - now.getTime();
        const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
        const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const s = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
        items.push({ label: 'Assignment Due', timeLeft: `${h}:${m}:${s}` });
      }
    }

    // If no items, show placeholders
    while (items.length < 3) {
      items.push({ label: 'Coming Soon', timeLeft: '--:--:--' });
    }

    return items.slice(0, 3);
  }, [pendingAssignments]);

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
                <p className="text-xs text-gray-500">{a.subject} • Due: {a.due_date || a.dueDate}</p>
              </div>
            </div>
          ))}
          {pendingAssignments.length === 0 && (
            <p className="text-gray-500">All caught up! No pending tasks.</p>
          )}
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
        transition={{ duration: 0.5 }}
        className="nova-card p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-blue-100 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gradient-to-tr from-purple-100 to-transparent blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-600 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Student Portal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {user?.class || '10-A'}
            </span>
            <button
              onClick={() => setFocusMode(!focusMode)}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-200"
            >
              <Focus size={12} /> Focus Mode
            </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 mb-3 text-gray-900">
            <span className="w-1 h-10 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              `Class: ${user?.class || '10-A'}`,
              `ID: ${user?.id?.slice(-6) || 'N/A'}`,
              today
            ].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* XP & Gamification Bar */}
      <XPBar xp={totalXP} level={level} nextLevelXP={nextLevelXP} loading={loading} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard loading={loading} icon={UserCheck} label="Attendance" value={`${attendanceRate}%`} subtitle="Monthly average" delay={0.1} color="#10b981" />
        <StatCard loading={loading} icon={FileText} label="Pending Tasks" value={pendingAssignments.length} subtitle="Needs attention" delay={0.15} color="#f59e0b" />
        <StatCard loading={loading} icon={Award} label="Average Score" value={`${avgMarks}%`} subtitle="Performance" delay={0.2} color="#a855f7" />
        <StatCard loading={loading} icon={Clock3} label="Classes Today" value={todaySchedule.length || 0} subtitle="Scheduled" delay={0.25} color="#3b82f6" />
      </div>

      {/* Live Activity Ticker */}
      <LiveActivityTicker activities={liveActivities.length > 0 ? liveActivities : [{ id: 'empty', message: 'Loading activities...' }]} />

      {/* Countdown Timers */}
      <div className="nova-card p-6">
        <h3 className="text-sm font-semibold mb-4 text-gray-600">Upcoming Deadlines</h3>
        <div className="grid grid-cols-3 gap-4">
          {countdownItems.map((cd, i) => <CountdownTimer key={i} label={cd.label} timeLeft={cd.timeLeft} />)}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Coach + Weekly Challenge */}
        <div className="space-y-6">
          <AICoachTip tip={aiTip} />
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
            {goals.length > 0 ? (
              goals.map((goal, i) => <GoalProgress key={i} goal={goal} />)
            ) : (
              <p className="text-sm text-gray-400">No goals set yet</p>
            )}
          </div>

          <div className="nova-card p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-600">
              <Award size={14} /> Earned Badges
            </h3>
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {earnedBadges.map((badge, i) => <BadgeCard key={i} badge={badge} />)}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Complete tasks to earn badges!</p>
            )}
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
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : todaySchedule.length === 0 ? (
              <div className="py-12 border border-dashed rounded-xl flex items-center justify-center border-gray-200">
                <p className="text-xs text-gray-500">No classes scheduled</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySchedule.map((slot, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-gray-200 text-gray-700 flex-shrink-0">
                      P{slot.period}
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
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : pendingAssignments.length === 0 ? (
              <div className="py-12 border border-dashed rounded-xl flex items-center justify-center border-gray-200">
                <p className="text-xs text-gray-500">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingAssignments.slice(0, 5).map(a => {
                  const isLate = new Date(a.due_date || a.dueDate) < new Date();
                  return (
                    <div key={a.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                          <p className="text-xs mt-1 text-gray-500">{a.subject} • Due: {a.due_date || a.dueDate}</p>
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
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : announcements.length > 0 ? (
                announcements.slice(0, 4).map(a => (
                  <div key={a.id} className="border-l-2 pl-3 py-1.5 border-gray-200">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                        a.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {a.priority || 'normal'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed mt-1 text-gray-600">{a.title}</p>
                  </div>
                ))
              ) : (
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
    </div>
  );
};