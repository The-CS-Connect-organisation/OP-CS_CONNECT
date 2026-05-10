import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, CheckCircle, Clock, TrendingUp, Bell, BarChart3,
  MessageSquare, BookOpen, Zap, Calendar, Brain, RefreshCw
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import { Skeleton } from '../../components/ui/Skeleton';

const ROUTE_MAP = {
  attendance: '/teacher/attendance',
  grading: '/teacher/submissions',
  analytics: '/teacher/analytics',
  progress: '/teacher/progress',
  messaging: '/teacher/messaging',
  notes: '/teacher/class-notes',
  notifications: '/teacher/notifications',
  reports: '/teacher/reports',
  insights: '/teacher/insights',
};

const StatCard = ({ icon: Icon, label, value, subtitle, delay, color = '#1f2937', loading }) => (
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
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    {loading ? (
      <Skeleton className="h-10 w-20 mb-2" />
    ) : (
      <span className="text-4xl font-bold tracking-tight block text-gray-900">{value ?? 0}</span>
    )}
    {subtitle && (
      <div className="flex items-center gap-2 mt-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <span className="text-xs text-gray-500">{subtitle}</span>
      </div>
    )}
  </motion.div>
);

const QuickActionButton = ({ icon: Icon, label, onClick, color = 'bg-blue-500', delay }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-6 rounded-2xl ${color} text-white font-semibold text-sm hover:shadow-lg transition-all duration-300`}
  >
    <Icon size={24} className="mb-2" />
    <span className="text-center text-xs">{label}</span>
  </motion.button>
);

const PendingActionCard = ({ icon: Icon, title, count, color, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    onClick={onClick}
    className="nova-card p-4 cursor-pointer border-l-4 transition-all"
    style={{ borderLeftColor: color }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">Click to view</p>
        </div>
      </div>
      <span className="text-2xl font-bold" style={{ color }}>{count ?? 0}</span>
    </div>
  </motion.div>
);

export const TeacherDashboard = ({ user, addToast }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState({
    totalClasses: 0,
    totalStudents: 0,
    todayAttendance: null,
    pendingGrading: 0,
    unreadNotifications: 0,
  });
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [weeklyActivity] = useState({
    assignmentsGraded: 0,
    attendanceMarked: 0,
    messagesSent: 0,
    notesCreated: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, announcementsRes, classesRes, submissionsRes] = await Promise.allSettled([
        apiRequest('/school/assignments'),
        apiRequest('/school/announcements'),
        apiRequest('/school/classes'),
        apiRequest('/school/submissions'),
      ]);

      const assignmentList = assignmentsRes.status === 'fulfilled'
        ? (assignmentsRes.value?.items ?? assignmentsRes.value ?? [])
        : [];
      const myAssignments = assignmentList.filter(a => a.teacher_id === user.id || a.teacherId === user.id);

      const submissions = submissionsRes.status === 'fulfilled'
        ? (submissionsRes.value?.submissions ?? submissionsRes.value?.items ?? [])
        : [];

      const mySubmissionCount = submissions.filter(s =>
        myAssignments.some(a => a.id === s.assignment_id || a.id === s.assignmentId)
      ).length;

      const gradedCount = submissions.filter(s =>
        s.marks != null && myAssignments.some(a => a.id === s.assignment_id || a.id === s.assignmentId)
      ).length;

      const classes = classesRes.status === 'fulfilled'
        ? (classesRes.value?.classRooms ?? classesRes.value?.items ?? classesRes.value ?? [])
        : [];

      const notifs = announcementsRes.status === 'fulfilled'
        ? (announcementsRes.value?.announcements ?? [])
        : [];

      setOverview({
        totalClasses: classes.length,
        totalStudents: 0,
        todayAttendance: null,
        pendingGrading: mySubmissionCount - gradedCount,
        unreadNotifications: notifs.filter(n => !n.read).length,
      });
      setAssignments(myAssignments.slice(0, 5));
      setAnnouncements(notifs.slice(0, 5));
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      if (refreshing) setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const handleNavigate = (action) => {
    const route = ROUTE_MAP[action];
    if (route) navigate(route);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    addToast?.('Dashboard refreshed', 'success');
  };

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
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-purple-100 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gradient-to-tr from-blue-100 to-transparent blur-3xl" />
        </div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Teacher Portal
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {user.department || 'Faculty'}
              </span>
              {overview.unreadNotifications > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200">
                  <Bell size={12} />
                  {overview.unreadNotifications} new
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 mb-3 text-gray-900">
              <span className="w-1 h-10 rounded-full bg-gradient-to-b from-purple-500 to-blue-500" />
              Welcome, {user.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-4">
              {[`Department: ${user.department || 'N/A'}`, `Subjects: ${user.subjects?.join(', ') || 'N/A'}`].map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard loading={loading} icon={BookOpen} label="My Assignments" value={assignments.length} subtitle="Total created" delay={0.1} color="#3b82f6" />
        <StatCard loading={loading} icon={Users} label="Classes" value={overview.totalClasses} subtitle="Active classes" delay={0.15} color="#10b981" />
        <StatCard loading={loading} icon={CheckCircle} label="Pending Grading" value={overview.pendingGrading} subtitle="Needs attention" delay={0.2} color="#f59e0b" />
        <StatCard loading={loading} icon={Bell} label="Notifications" value={overview.unreadNotifications} subtitle="Unread" delay={0.25} color="#a855f7" />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <QuickActionButton icon={CheckCircle} label="Mark Attendance" onClick={() => handleNavigate('attendance')} color="bg-emerald-500" delay={0.1} />
        <QuickActionButton icon={Zap} label="Grade Submissions" onClick={() => handleNavigate('grading')} color="bg-amber-500" delay={0.15} />
        <QuickActionButton icon={BarChart3} label="View Analytics" onClick={() => handleNavigate('analytics')} color="bg-blue-500" delay={0.2} />
        <QuickActionButton icon={TrendingUp} label="Student Progress" onClick={() => handleNavigate('progress')} color="bg-purple-500" delay={0.25} />
        <QuickActionButton icon={MessageSquare} label="Quick Message" onClick={() => handleNavigate('messaging')} color="bg-pink-500" delay={0.3} />
        <QuickActionButton icon={BookOpen} label="Class Notes" onClick={() => handleNavigate('notes')} color="bg-indigo-500" delay={0.35} />
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PendingActionCard
          icon={Clock}
          title="Pending Grading"
          count={overview.pendingGrading}
          color="#f59e0b"
          onClick={() => handleNavigate('grading')}
        />
        <PendingActionCard
          icon={Bell}
          title="Notifications"
          count={overview.unreadNotifications}
          color="#ef4444"
          onClick={() => handleNavigate('notifications')}
        />
        <PendingActionCard
          icon={Brain}
          title="AI Insights"
          count="→"
          color="#8b5cf6"
          onClick={() => handleNavigate('insights')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Assignments */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 text-gray-600">
            <FileText size={14} />
            My Assignments
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : assignments.length === 0 ? (
            <div className="py-12 border border-dashed rounded-xl flex items-center justify-center border-gray-200">
              <p className="text-xs text-gray-500">No assignments created yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                    <p className="text-xs mt-0.5 text-gray-500">{a.subject} • {a.class_id || a.class || '—'}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 ml-3 flex-shrink-0">
                    {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No due date'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Announcements */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 text-gray-600">
            <Bell size={14} />
            Recent Announcements
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-12 border border-dashed rounded-xl flex items-center justify-center border-gray-200">
              <p className="text-xs text-gray-500">No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {announcements.map((ann) => (
                <div key={ann.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                    ann.priority === 'high' ? 'bg-red-500' :
                    ann.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{ann.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{ann.body?.substring(0, 80)}…</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};