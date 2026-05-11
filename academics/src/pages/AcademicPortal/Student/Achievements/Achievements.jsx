import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Zap, Star, Target, Flame, Award, Medal, Crown,
  TrendingUp, ChevronRight, Lock, CheckCircle2, Clock,
  Sword, Shield, BookOpen, Calendar, Users, FlameKindling,
  GraduationCap, Brain, Clock3, BarChart3, Bookmark, Heart, UserCheck
} from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { getFromStorage, setToStorage, KEYS } from '../../../../data/schema';
import { useSound } from '../../../../hooks/useSound';

// Badge definitions
const BADGE_DEFS = [
  { id: 'first_login',    label: 'First Steps',        desc: 'Logged in for the first time',         icon: Star,       xp: 50,  tier: 'bronze' },
  { id: 'streak_7',      label: 'Week Warrior',      desc: '7-day study streak',                   icon: Flame,     xp: 150, tier: 'bronze' },
  { id: 'streak_30',     label: 'Iron Will',         desc: '30-day study streak',                  icon: Flame,     xp: 400, tier: 'silver' },
  { id: 'streak_100',    label: 'Legend',             desc: '100-day study streak',                 icon: Flame,     xp: 1000,tier: 'gold'   },
  { id: 'assign_done',   label: 'Task Slayer',        desc: 'Completed 5 assignments',              icon: CheckCircle2,xp: 100,tier: 'bronze' },
  { id: 'assign_10',     label: 'Productivity Pro',   desc: 'Completed 10 assignments',             icon: CheckCircle2,xp: 250,tier: 'silver' },
  { id: 'perfect_att',   label: 'Attendance Ace',     desc: 'Perfect attendance for 30 days',      icon: UserCheck,  xp: 200, tier: 'bronze' },
  { id: 'grade_top',     label: 'Grade Crusher',      desc: 'Scored above 90% in exams',           icon: TrendingUp, xp: 300, tier: 'bronze' },
  { id: 'note_5',        label: 'Note Taker',         desc: 'Created 5 notes',                      icon: BookOpen,  xp: 80,  tier: 'bronze' },
  { id: 'study_50h',     label: 'Study Machine',      desc: 'Studied for 50 hours total',           icon: Clock,     xp: 350, tier: 'silver' },
  { id: 'focus_10',      label: 'Focus Master',       desc: 'Completed 10 focus sessions',          icon: Brain,     xp: 200, tier: 'bronze' },
  { id: 'challenge_5',   label: 'Challenge Champion',desc: 'Completed 5 weekly challenges',       icon: Sword,     xp: 300, tier: 'silver' },
  { id: 'xp_1000',       label: 'Rising Star',        desc: 'Reached 1000 XP',                     icon: Zap,       xp: 0,   tier: 'bronze' },
  { id: 'xp_5000',       label: 'XP Hunter',          desc: 'Reached 5000 XP',                     icon: Zap,       xp: 0,   tier: 'silver' },
  { id: 'rank_1',        label: 'Champion',           desc: 'Reached #1 on leaderboard',           icon: Crown,     xp: 500, tier: 'gold'   },
];

const TIER_COLORS = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold:   '#ffd700',
};
const TIER_GLOW = {
  bronze: 'rgba(205,127,50,0.3)',
  silver: 'rgba(192,192,192,0.4)',
  gold:   'rgba(255,215,0,0.5)',
};

// Weekly challenge definitions
const CHALLENGE_DEFS = [
  { id: 'cw_1', label: 'Study Session', desc: 'Complete 3 focus sessions this week', icon: Brain, target: 3, type: 'focus' },
  { id: 'cw_2', label: 'Assignment Master', desc: 'Submit 2 assignments on time', icon: BookOpen, target: 2, type: 'assign' },
  { id: 'cw_3', label: 'Streak Builder', desc: 'Login and study 5 days this week', icon: Flame, target: 5, type: 'login' },
];

const LEVELS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6600, 8200, 10000];

const getLevel = (xp) => {
  let level = 1;
  for (let i = 1; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i]) level = i + 1;
    else break;
  }
  return level;
};

const getLevelXP = (xp) => {
  const level = getLevel(xp);
  const base = LEVELS[level - 1] || 0;
  const next = LEVELS[level] || LEVELS[LEVELS.length - 1];
  return { level, base, next, progress: ((xp - base) / (next - base)) * 100 };
};

// ============================================================================
// REALTIME LEADERBOARD PANEL (Firebase)
// ============================================================================

// XP sources: attendance=5/day present, marks=2 per mark point, submissions=10 per assignment

const RankBadge = ({ rank, size = 'md' }) => {
  const configs = {
    1: { bg: 'linear-gradient(135deg, #ffd700, #ffb700)', shadow: '0 0 20px rgba(255,215,0,0.5)', label: '#1', emoji: 'G' },
    2: { bg: 'linear-gradient(135deg, #e0e0e0, #b0b0b0)', shadow: '0 0 16px rgba(192,192,192,0.4)', label: '#2', emoji: 'S' },
    3: { bg: 'linear-gradient(135deg, #cd7f32, #a0522d)', shadow: '0 0 14px rgba(205,127,50,0.4)', label: '#3', emoji: 'B' },
  };
  const c = configs[rank] || null;
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  const fs = size === 'sm' ? 12 : 14;
  if (c) {
    return (
      <div className={`${sizeClass} rounded-full flex items-center justify-center font-black`}
        style={{ background: c.bg, boxShadow: c.shadow, color: '#0a0a0f', fontSize: fs }}>
        {c.label}
      </div>
    );
  }
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-mono font-bold`}
      style={{ background: '#18181b', color: '#525252', fontSize: fs }}>
      #{rank}
    </div>
  );
};

const AvatarCircle = ({ name, avatar, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const initial = (name || '?')[0]?.toUpperCase();
  const colors = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#ffedd5'];
  const colorIndex = (name || '').charCodeAt(0) % colors.length;
  return avatar ? (
    <img src={avatar} alt={name} className={`${sizeClass} rounded-full object-cover`} />
  ) : (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold`}
      style={{ background: colors[colorIndex] + '33', color: colors[colorIndex], border: `1px solid ${colors[colorIndex]}55` }}>
      {initial}
    </div>
  );
};

export const LeaderboardPanel = ({ user }) => {
  const [mode, setMode] = useState('all'); // 'all' | 'weekly'
  const [entries, setEntries] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [isRealtime, setIsRealtime] = useState(false);

  const classId = user?.classId || user?.class_id || 'default';

  // Load backend data and sync to Firebase on mount
  const syncFromBackend = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    try {
      // Fetch all backend data
      const [attendRes, marksRes, assignRes, profileRes] = await Promise.allSettled([
        studentApi.getAttendance(),
        studentApi.getGrades(),
        studentApi.getAssignments(),
        studentApi.getProfile(),
      ]);

      const attendance = attendRes.status === 'fulfilled' ? (attendRes.value?.data || []) : [];
      const marks = marksRes.status === 'fulfilled' ? (marksRes.value?.data || []) : [];
      const submissions = assignRes.status === 'fulfilled'
        ? (assignRes.value?.data || []).filter(a => a.status === 'submitted')
        : [];
      const profile = profileRes.status === 'fulfilled' ? (profileRes.value?.data || {}) : {};

      // Get classmates (mock list + current user)
      const classmates = [
        { id: user.id, name: user.name, avatar: user.avatar },
        { id: 'u1', name: 'Aarav Sharma', avatar: null },
        { id: 'u2', name: 'Priya Patel', avatar: null },
        { id: 'u3', name: 'Rohan Gupta', avatar: null },
        { id: 'u4', name: 'Sneha Reddy', avatar: null },
        { id: 'u5', name: 'Arjun Nair', avatar: null },
        { id: 'u6', name: 'Meera Iyer', avatar: null },
        { id: 'u7', name: 'Vivaan Shah', avatar: null },
        { id: 'u8', name: 'Ananya Singh', avatar: null },
        { id: 'u9', name: 'Karan Mehta', avatar: null },
        { id: 'u10', name: 'Diya Krishnan', avatar: null },
      ];

      await firebaseLeaderboardService.syncAllStudents(
        classId,
        classmates,
        attendance,
        marks,
        submissions
      );

      setLastSync(new Date());
    } catch (err) {
      console.error('[Leaderboard] Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  }, [user, classId]);

  // Subscribe to real-time leaderboard updates
  useEffect(() => {
    if (!user) return;

    // Initial sync from backend
    syncFromBackend();

    // Set up real-time listeners
    let unsubAll, unsubWeekly;
    if (mode === 'all') {
      unsubAll = firebaseLeaderboardService.subscribe(classId, (data) => {
        setEntries(data);
        setIsRealtime(true);
        const idx = data.findIndex(e => e.studentId === user.id || e.id === user.id);
        setMyRank(idx >= 0 ? idx + 1 : null);
      });
    } else {
      unsubWeekly = firebaseLeaderboardService.subscribeWeekly(classId, (data) => {
        setEntries(data);
        setIsRealtime(true);
        const idx = data.findIndex(e => e.studentId === user.id || e.id === user.id);
        setMyRank(idx >= 0 ? idx + 1 : null);
      });
    }

    return () => {
      if (unsubAll) unsubAll();
      if (unsubWeekly) unsubWeekly();
    };
  }, [user, classId, mode, syncFromBackend]);

  // Re-subscribe when mode changes
  useEffect(() => {
    if (!user) return;
    let unsub;
    if (mode === 'all') {
      unsub = firebaseLeaderboardService.subscribe(classId, (data) => {
        setEntries(data);
        setIsRealtime(true);
        const idx = data.findIndex(e => e.studentId === user.id || e.id === user.id);
        setMyRank(idx >= 0 ? idx + 1 : null);
      });
    } else {
      unsub = firebaseLeaderboardService.subscribeWeekly(classId, (data) => {
        setEntries(data);
        setIsRealtime(true);
        const idx = data.findIndex(e => e.studentId === user.id || e.id === user.id);
        setMyRank(idx >= 0 ? idx + 1 : null);
      });
    }
    return () => { if (unsub) unsub(); };
  }, [mode, user, classId]);

  const displayEntries = entries.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Medal size={18} style={{ color: '#ea580c' }} />
          <h3 className="text-base font-bold" style={{ color: '#fafafa' }}>Leaderboard</h3>
          {isRealtime && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
              <span className="text-[10px] font-mono" style={{ color: '#22c55e' }}>LIVE</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastSync && (
            <span className="text-[10px] font-mono hidden sm:block" style={{ color: '#525252' }}>
              Synced {lastSync.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={syncFromBackend}
            disabled={syncing}
            className="p-1.5 rounded-lg transition-all disabled:opacity-50"
            style={{ background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.15)' }}
            title="Sync from backend"
          >
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} style={{ color: '#ea580c' }} />
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(234,88,12,0.2)' }}>
        {['all', 'weekly'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all"
            style={{
              background: mode === m ? 'rgba(234,88,12,0.15)' : 'transparent',
              color: mode === m ? '#ea580c' : '#71717a',
            }}
          >
            {m === 'all' ? 'All Time' : 'Weekly'}
          </button>
        ))}
      </div>

      {/* XP XP source info */}
      <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: '#525252' }}>
        <span>5 XP/day present</span>
        <span>|</span>
        <span>2 XP/mark point</span>
        <span>|</span>
        <span>10 XP/submission</span>
      </div>

      {/* Leaderboard entries */}
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {displayEntries.map((entry, i) => {
            const isMe = entry.studentId === user?.id || entry.id === user?.id;
            const xpField = mode === 'weekly' ? entry.xpWeekly : entry.xp;
            return (
              <motion.div
                key={entry.studentId || entry.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: isMe ? 'rgba(234,88,12,0.1)' : '#0a0a0f',
                  border: isMe
                    ? '1px solid rgba(234,88,12,0.3)'
                    : '1px solid rgba(255,255,255,0.04)',
                  borderLeft: isMe ? '3px solid #ea580c' : '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <RankBadge rank={i + 1} />
                <AvatarCircle name={entry.studentName} avatar={entry.avatar} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold truncate" style={{ color: isMe ? '#ea580c' : '#fafafa' }}>
                      {entry.studentName}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(234,88,12,0.15)', color: '#ea580c' }}>YOU</span>
                    )}
                    {i === 0 && !isMe && <Crown size={12} style={{ color: '#ffd700' }} />}
                  </div>
                  {myRank && isMe && i > 9 && (
                    <span className="text-[10px] font-mono" style={{ color: '#71717a' }}>Your rank: #{myRank}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold" style={{ color: '#fafafa' }}>
                    {(xpField || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono ml-1" style={{ color: '#71717a' }}>XP</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {displayEntries.length === 0 && (
          <div className="flex flex-col items-center py-8">
            <Flame size={32} style={{ color: '#3f3f46' }} />
            <p className="text-sm mt-2" style={{ color: '#525252' }}>No leaderboard data yet</p>
            <button
              onClick={syncFromBackend}
              className="mt-3 px-4 py-2 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(234,88,12,0.1)', color: '#ea580c', border: '1px solid rgba(234,88,12,0.2)' }}
            >
              Sync Now
            </button>
          </div>
        )}
      </div>

      {/* My rank banner (if not in top 10) */}
      {myRank && myRank > 10 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.15)' }}>
          <RankBadge rank={myRank} size="sm" />
          <div className="flex-1">
            <span className="text-sm font-bold" style={{ color: '#fafafa' }}>Your Position</span>
          </div>
          <span className="font-mono text-sm font-bold" style={{ color: '#ea580c' }}>#{myRank}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN ACHIEVEMENTS COMPONENT
// ============================================================================

export const Achievements = ({ user }) => {
  const { playClick, playBlip } = useSound();
  const [xpData, setXpData] = useState(() => getFromStorage(KEYS.STUDENT_XP, {}));
  const [badges, setBadges] = useState(() => getFromStorage(KEYS.BADGES, []));
  const [weekly, setWeekly] = useState(() => getFromStorage(KEYS.WEEKLY_CHALLENGE, {}));
  const [focusHistory, setFocusHistory] = useState(() => getFromStorage('sms_focus_history', []));
  const [assignments, setAssignments] = useState(() => getFromStorage(KEYS.ASSIGNMENTS, []));
  const [attendance, setAttendance] = useState(() => getFromStorage(KEYS.ATTENDANCE, []));
  const [marks, setMarks] = useState(() => getFromStorage(KEYS.MARKS, []));
  const [notes, setNotes] = useState(() => getFromStorage(KEYS.NOTES, []));
  const [loaded, setLoaded] = useState(false);

  // Seed leaderboard if not exists
  useEffect(() => {
    const existing = getFromStorage('sms_leaderboard', null);
    if (!existing) {
      const board = [
        { id: 'u1', name: 'Aarav Sharma',    xp: 4850, rank: 1 },
        { id: 'u2', name: 'Priya Patel',     xp: 4320, rank: 2 },
        { id: 'u3', name: 'Rohan Gupta',     xp: 3980, rank: 3 },
        { id: 'u4', name: 'Sneha Reddy',     xp: 3540, rank: 4 },
        { id: 'u5', name: 'Arjun Nair',      xp: 3200, rank: 5 },
        { id: 'u6', name: 'Meera Iyer',      xp: 2950, rank: 6 },
        { id: 'u7', name: 'Vivaan Shah',     xp: 2710, rank: 7 },
        { id: 'u8', name: 'Ananya Singh',    xp: 2480, rank: 8 },
        { id: 'u9', name: 'Karan Mehta',     xp: 2150, rank: 9 },
        { id: 'u10', name: 'Diya Krishnan',  xp: 1920, rank: 10 },
      ];
      setToStorage('sms_leaderboard', board);
    }
    setLoaded(true);
  }, []);

  // Compute current user XP from real data
  const computedXP = useMemo(() => {
    if (!user) return 0;
    const myAssignments = Array.isArray(assignments)
      ? assignments.filter(a => a.studentId === user.id && a.status === 'submitted')
      : [];
    const myAttendance = Array.isArray(attendance)
      ? attendance.filter(a => a.studentId === user.id && a.status === 'present')
      : [];
    const myMarks = Array.isArray(marks)
      ? marks.filter(m => m.studentId === user.id)
      : [];
    const myNotes = Array.isArray(notes)
      ? notes.filter(n => n.studentId === user.id || n.authorId === user.id)
      : [];

    const assignXP = Math.min(myAssignments.length, 20) * 25;
    const attendXP = Math.min(myAttendance.length, 30) * 15;
    const avgScore = myMarks.length > 0
      ? myMarks.reduce((s, m) => s + (parseFloat(m.score) || 0), 0) / myMarks.length
      : 0;
    const markXP = avgScore > 90 ? 200 : avgScore > 75 ? 100 : avgScore > 50 ? 50 : 0;
    const noteXP = Math.min(myNotes.length, 10) * 20;
    const baseXP = 100;

    return baseXP + assignXP + attendXP + markXP + noteXP;
  }, [user, assignments, attendance, marks, notes]);

  // Merge computed XP with stored XP (prefer stored if higher)
  const totalXP = Math.max(computedXP, xpData[user?.id] || 0);
  const levelInfo = getLevelXP(totalXP);

  // Calculate earned badges
  const earnedBadgeIds = useMemo(() => {
    const ids = new Set(badges.map(b => b.id));

    const myAssignments = Array.isArray(assignments)
      ? assignments.filter(a => a.studentId === user?.id && a.status === 'submitted')
      : [];
    const myAttendance = Array.isArray(attendance)
      ? attendance.filter(a => a.studentId === user?.id && a.status === 'present')
      : [];
    const myMarks = Array.isArray(marks)
      ? marks.filter(m => m.studentId === user?.id)
      : [];
    const myNotes = Array.isArray(notes)
      ? notes.filter(n => n.studentId === user?.id || n.authorId === user?.id)
      : [];

    const streak = focusHistory.filter(d => {
      if (!d?.date) return false;
      const now = new Date();
      const diff = (now - new Date(d.date)) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    }).length;

    if (!ids.has('first_login') && user) ids.add('first_login');
    if (streak >= 7 && !ids.has('streak_7')) ids.add('streak_7');
    if (streak >= 30 && !ids.has('streak_30')) ids.add('streak_30');
    if (streak >= 100 && !ids.has('streak_100')) ids.add('streak_100');
    if (myAssignments.length >= 5 && !ids.has('assign_done')) ids.add('assign_done');
    if (myAssignments.length >= 10 && !ids.has('assign_10')) ids.add('assign_10');
    if (myAttendance.length >= 30 && !ids.has('perfect_att')) ids.add('perfect_att');
    if (myMarks.length > 0) {
      const avg = myMarks.reduce((s, m) => s + (parseFloat(m.score) || 0), 0) / myMarks.length;
      if (avg > 90 && !ids.has('grade_top')) ids.add('grade_top');
    }
    if (myNotes.length >= 5 && !ids.has('note_5')) ids.add('note_5');
    if (totalXP >= 1000 && !ids.has('xp_1000')) ids.add('xp_1000');
    if (totalXP >= 5000 && !ids.has('xp_5000')) ids.add('xp_5000');

    return ids;
  }, [badges, user, assignments, attendance, marks, notes, focusHistory, totalXP]);

  // Streak: count consecutive days from focusHistory
  const streakDays = useMemo(() => {
    if (!Array.isArray(focusHistory) || focusHistory.length === 0) return 0;
    const sorted = [...focusHistory]
      .filter(d => d?.date)
      .map(d => new Date(d.date).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b) - new Date(a));
    if (sorted.length === 0) return 0;
    let count = 1;
    const today = new Date().toDateString();
    if (sorted[0] !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (sorted[0] !== yesterday) return 0;
    }
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i - 1]) - new Date(sorted[i])) / 86400000;
      if (diff === 1) count++;
      else break;
    }
    return count;
  }, [focusHistory]);

  // Leaderboard with current user injected
  const leaderboard = useMemo(() => {
    const board = getFromStorage('sms_leaderboard', []) || [];
    const enriched = board.map(entry => ({
      ...entry,
      xp: entry.id === user?.id ? totalXP : entry.xp,
      isCurrentUser: entry.id === user?.id,
    }));

    const already = enriched.some(e => e.isCurrentUser);
    if (!already && user) {
      enriched.push({ id: user.id, name: user.name || 'You', xp: totalXP, rank: 0, isCurrentUser: true });
    }

    return enriched
      .filter(e => e.xp > 0 || e.isCurrentUser)
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10)
      .map((e, idx) => ({ ...e, rank: idx + 1 }));
  }, [user, totalXP]);

  // Weekly challenge progress
  const weeklyProgress = useMemo(() => {
    const weekStr = getFromStorage('sms_study_activity', []) || [];
    const myAssignCount = Array.isArray(assignments)
      ? assignments.filter(a => a.studentId === user?.id && a.status === 'submitted').length
      : 0;

    return CHALLENGE_DEFS.map(ch => {
      let current = 0;
      if (ch.type === 'focus') {
        current = Array.isArray(focusHistory) ? focusHistory.length : 0;
      } else if (ch.type === 'assign') {
        current = myAssignCount;
      } else if (ch.type === 'login') {
        current = Array.isArray(weekStr) ? weekStr.length : 0;
      }
      return { ...ch, current: Math.min(current, ch.target), pct: Math.min(100, (current / ch.target) * 100) };
    });
  }, [user, focusHistory, assignments]);

  // Staggered container animation
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const RankMedal = ({ rank }) => {
    const colors = {
      1: { bg: 'linear-gradient(135deg, #ffd700, #ffb700)', shadow: '0 0 20px rgba(255,215,0,0.5)' },
      2: { bg: 'linear-gradient(135deg, #e0e0e0, #b0b0b0)', shadow: '0 0 16px rgba(192,192,192,0.4)' },
      3: { bg: 'linear-gradient(135deg, #cd7f32, #a0522d)', shadow: '0 0 14px rgba(205,127,50,0.4)' },
    };
    const c = colors[rank] || { bg: '#1a1a2e', shadow: 'none' };
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
        style={{
          background: c.bg,
          boxShadow: c.shadow,
          color: rank <= 3 ? '#0a0a0f' : '#888',
          fontFamily: 'monospace',
        }}
      >
        {rank}
      </div>
    );
  };

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: '#09090b', fontFamily: "'Space Grotesk', 'JetBrains Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(234,88,12,0.4); }
          50% { box-shadow: 0 0 20px rgba(234,88,12,0.8), 0 0 40px rgba(234,88,12,0.3); }
        }
        .badge-glow { animation: glow-pulse 2.5s ease-in-out infinite; }
        @keyframes scan {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .scan-line {
          background: linear-gradient(90deg, transparent 0%, rgba(234,88,12,0.15) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: scan 3s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .float-anim { animation: float 3s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #ea580c; border-radius: 3px; }
      `}</style>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 0 24px rgba(234,88,12,0.5)' }}
            >
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#fafafa' }}>Achievements</h1>
              <p className="text-sm font-mono mt-0.5" style={{ color: '#525252' }}>Level {levelInfo.level} &middot; {totalXP.toLocaleString()} XP</p>
            </div>
          </div>
          <div
            className="px-4 py-2 rounded-lg text-xs font-black font-mono uppercase tracking-widest"
            style={{ background: 'rgba(234,88,12,0.1)', color: '#ea580c', border: '1px solid rgba(234,88,12,0.2)' }}
          >
            {earnedBadgeIds.size} / {BADGE_DEFS.length} Badges
          </div>
        </motion.div>

        {/* XP Progress Bar */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden" style={{ background: '#0a0a0f', border: '1px solid rgba(234,88,12,0.15)' }}>
            <div className="relative px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={16} style={{ color: '#ea580c' }} />
                  <span className="text-sm font-bold" style={{ color: '#71717a' }}>Level {levelInfo.level}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(234,88,12,0.1)', color: '#ea580c' }}>
                    {levelInfo.base.toLocaleString()} XP
                  </span>
                </div>
                <span className="font-mono text-sm font-bold" style={{ color: '#ea580c' }}>
                  {totalXP.toLocaleString()} / {levelInfo.next.toLocaleString()} XP
                </span>
              </div>
              <div className="h-4 rounded-full overflow-hidden relative" style={{ background: '#18181b' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full relative"
                  style={{ background: 'linear-gradient(90deg, #ea580c, #f97316, #fb923c)' }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 rounded-r-full" style={{ background: '#fff', opacity: 0.8 }} />
                </motion.div>
              </div>
              <p className="text-xs font-mono mt-2" style={{ color: '#3f3f46' }}>
                Next level: {(levelInfo.next - totalXP).toLocaleString()} XP remaining
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Streak', value: streakDays, icon: Flame, color: '#ea580c', suffix: ' days' },
            { label: 'Total XP', value: totalXP.toLocaleString(), icon: Zap, color: '#fb923c', suffix: '' },
            { label: 'Level', value: levelInfo.level, icon: TrendingUp, color: '#f97316', suffix: '' },
            { label: 'Rank', value: '#' + (leaderboard.find(l => l.isCurrentUser)?.rank || '—'), icon: Medal, color: '#ea580c', suffix: '' },
          ].map((stat, i) => (
            <Card
              key={stat.label}
              className="p-4 relative overflow-hidden cursor-pointer"
              style={{
                background: '#0a0a0f',
                border: `1px solid ${stat.color}22`,
              }}
              whileHover={{ scale: 1.03, borderColor: stat.color + '66' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className={`absolute inset-0 scan-line ${i % 2 === 0 ? '' : 'opacity-50'}`} />
              <stat.icon size={18} className="mb-2 float-anim" style={{ color: stat.color }} />
              <div className="font-mono text-2xl font-black mb-0.5" style={{ color: '#fafafa' }}>{stat.value}{stat.suffix}</div>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#525252' }}>{stat.label}</div>
            </Card>
          ))}
        </motion.div>

        {/* Badges Grid */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} style={{ color: '#ea580c' }} />
            <h2 className="text-lg font-bold" style={{ color: '#fafafa' }}>Badge Collection</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {BADGE_DEFS.map((badge, i) => {
              const earned = earnedBadgeIds.has(badge.id);
              const Icon = badge.icon;
              const tierColor = TIER_COLORS[badge.tier];
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: earned ? 1 : 0.35, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  whileHover={earned ? { scale: 1.08, y: -4 } : {}}
                  className={`relative p-4 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer ${earned ? 'badge-glow' : ''}`}
                  style={{
                    background: earned ? '#0f0f14' : '#0a0a0f',
                    border: `1px solid ${earned ? tierColor + '44' : '#27272a'}`,
                    boxShadow: earned ? `0 0 16px ${TIER_GLOW[badge.tier]}` : 'none',
                  }}
                >
                  {!earned && (
                    <div className="absolute top-2 right-2">
                      <Lock size={12} style={{ color: '#525252' }} />
                    </div>
                  )}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-2"
                    style={{
                      background: earned ? `${tierColor}22` : '#18181b',
                      border: `1px solid ${tierColor}33`,
                      boxShadow: earned ? `0 0 12px ${TIER_GLOW[badge.tier]}` : 'none',
                    }}
                  >
                    <Icon size={24} style={{ color: earned ? tierColor : '#525252' }} />
                  </div>
                  <div className="font-bold text-xs mb-1 leading-tight" style={{ color: earned ? '#fafafa' : '#525252' }}>
                    {badge.label}
                  </div>
                  <div className="text-[10px] leading-tight" style={{ color: earned ? '#71717a' : '#3f3f46' }}>
                    {earned ? badge.desc : 'Locked'}
                  </div>
                  {earned && badge.xp > 0 && (
                    <div className="mt-1.5 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${tierColor}22`, color: tierColor }}>
                      +{badge.xp} XP
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Two Column Layout: Leaderboard + Weekly Challenges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard — Firebase Realtime */}
          <motion.div variants={itemVariants}>
            <Card style={{ background: '#0a0a0f', border: '1px solid rgba(234,88,12,0.15)' }}>
              <div className="p-5">
                <LeaderboardPanel user={user} />
              </div>
            </Card>
          </motion.div>

          {/* Weekly Challenges */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <Sword size={18} style={{ color: '#ea580c' }} />
              <h2 className="text-lg font-bold" style={{ color: '#fafafa' }}>Weekly Challenges</h2>
            </div>
            <div className="space-y-3">
              {weeklyProgress.map((ch, i) => {
                const Icon = ch.icon;
                const completed = ch.current >= ch.target;
                return (
                  <Card
                    key={ch.id}
                    style={{
                      background: completed ? '#0f1f0f' : '#0a0a0f',
                      border: `1px solid ${completed ? 'rgba(34,197,94,0.2)' : 'rgba(234,88,12,0.12)'}`,
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background: completed ? 'rgba(34,197,94,0.15)' : 'rgba(234,88,12,0.12)',
                            border: `1px solid ${completed ? 'rgba(34,197,94,0.3)' : 'rgba(234,88,12,0.2)'}`,
                          }}
                        >
                          {completed ? (
                            <CheckCircle2 size={20} style={{ color: '#22c55e' }} />
                          ) : (
                            <Icon size={20} style={{ color: '#ea580c' }} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm" style={{ color: '#fafafa' }}>{ch.label}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#71717a' }}>{ch.desc}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#18181b' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ch.pct}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{
                              background: completed
                                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                                : 'linear-gradient(90deg, #ea580c, #f97316)',
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold" style={{ color: completed ? '#22c55e' : '#71717a' }}>
                          {ch.current}/{ch.target}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Active Streak Banner */}
        {streakDays > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden" style={{ background: '#0a0a0f', border: '1px solid rgba(234,88,12,0.2)' }}>
              <div className="absolute inset-0 scan-line" />
              <div className="relative flex items-center gap-5 p-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #ea580c, #f97316)',
                    boxShadow: '0 0 30px rgba(234,88,12,0.4)',
                    animation: 'glow-pulse 2s ease-in-out infinite',
                  }}
                >
                  <Flame size={32} className="text-white float-anim" />
                </div>
                <div>
                  <div className="text-3xl font-black font-mono" style={{ color: '#fafafa' }}>
                    {streakDays} Day{streakDays !== 1 ? 's' : ''} Streak
                  </div>
                  <div className="text-sm mt-1" style={{ color: '#71717a' }}>
                    Keep it going! Study every day to maintain your streak.
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="font-mono text-2xl font-black" style={{ color: '#ea580c' }}>+{streakDays * 5}</div>
                  <div className="text-xs font-bold" style={{ color: '#525252' }}>XP / day</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};