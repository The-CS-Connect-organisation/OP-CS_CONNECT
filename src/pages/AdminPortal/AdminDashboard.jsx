import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Calendar,
  Bell,
  Activity,
  School,
  FileText,
  Settings,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

/**
 * @component AdminDashboard
 * @description Main admin dashboard with school-wide analytics and management tools
 */
const AdminDashboard = ({ user, addToast }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalClasses: 0,
    attendanceToday: 0,
    feesCollected: 0,
    upcomingExams: 0,
    pendingNotices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [studentsRes, teachersRes, parentsRes, classesRes, announcementsRes] = await Promise.allSettled([
        apiRequest('/school/students'),
        apiRequest('/school/teachers'),
        apiRequest('/school/users?role=parent'),
        apiRequest('/school/classes'),
        apiRequest('/school/announcements'),
      ]);

      const students = studentsRes.status === 'fulfilled' ? (studentsRes.value?.items ?? studentsRes.value?.students ?? []) : [];
      const teachers = teachersRes.status === 'fulfilled' ? (teachersRes.value?.items ?? teachersRes.value?.teachers ?? []) : [];
      const parents = parentsRes.status === 'fulfilled' ? (parentsRes.value?.items ?? parentsRes.value?.users ?? []) : [];
      const classList = classesRes.status === 'fulfilled' ? (classesRes.value?.classRooms ?? classesRes.value?.items ?? classesRes.value ?? []) : [];
      const notifs = announcementsRes.status === 'fulfilled' ? (announcementsRes.value?.announcements ?? []) : [];

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalParents: parents.length,
        totalClasses: classList.length,
        attendanceToday: 0,
        feesCollected: 0,
        upcomingExams: 0,
        pendingNotices: notifs.filter(a => !a.read).length,
      });
      setClasses(classList);
      setAnnouncements(notifs.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      addToast?.('Failed to load dashboard data', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    addToast?.('Dashboard refreshed', 'success');
  };

  const quickActions = [
    { icon: UserPlus, label: 'Add User', color: 'bg-blue-500', action: () => addToast?.('Opening user creation form...', 'info') },
    { icon: Bell, label: 'Announcement', color: 'bg-yellow-500', action: () => addToast?.('Opening announcement creator...', 'info') },
    { icon: Calendar, label: 'Schedule Event', color: 'bg-green-500', action: () => addToast?.('Opening event scheduler...', 'info') },
    { icon: FileText, label: 'Generate Report', color: 'bg-purple-500', action: () => addToast?.('Opening report generator...', 'info') },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Admin Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Welcome back, {user?.name || 'Administrator'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 rounded-xl border text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            Export Data
          </button>
          <button className="px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ background: 'var(--primary)' }}>
            <Settings size={16} className="inline mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          trend="Live"
          color="bg-blue-500"
          loading={loading}
        />
        <StatCard
          icon={GraduationCap}
          label="Total Teachers"
          value={stats.totalTeachers}
          trend="Live"
          color="bg-green-500"
          loading={loading}
        />
        <StatCard
          icon={School}
          label="Total Classes"
          value={stats.totalClasses}
          trend="Live"
          color="bg-purple-500"
          loading={loading}
        />
        <StatCard
          icon={Users}
          label="Total Parents"
          value={stats.totalParents}
          trend="Live"
          color="bg-orange-500"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-color)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className="flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:shadow-md"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                <action.icon size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recent Announcements
            </h2>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">
              {announcements.length} total
            </span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-xl bg-gray-50 animate-pulse" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell size={36} style={{ color: 'var(--text-muted)' }} className="mb-3 opacity-40" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                No announcements yet
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {announcements.map((ann) => (
                <div key={ann.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    ann.priority === 'high' ? 'bg-red-500' :
                    ann.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{ann.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ann.body}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        ann.category === 'exam' ? 'bg-red-50 text-red-600' :
                        ann.category === 'event' ? 'bg-purple-50 text-purple-600' :
                        ann.category === 'academic' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>{ann.category}</span>
                      <span className="text-[10px] text-gray-400">
                        {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Classes Overview */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-color)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Classes
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 rounded-xl bg-gray-50 animate-pulse" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <School size={36} style={{ color: 'var(--text-muted)' }} className="mb-3 opacity-40" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                No classes found
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {classes.slice(0, 8).map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <School size={14} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{cls.name || cls.grade || 'Class'}</p>
                      <p className="text-[10px] text-gray-500">{cls.section ? `Section ${cls.section}` : '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, color, loading }) => (
  <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
        trend === 'Live' ? 'bg-green-100 text-green-700' :
        trend.startsWith('+') ? 'bg-green-100 text-green-700' :
        trend === 'Stable' ? 'bg-gray-100 text-gray-700' :
        'bg-red-100 text-red-700'
      }`}>
        {trend}
      </span>
    </div>
    <div className="mt-4">
      {loading ? (
        <div className="h-8 w-16 rounded bg-gray-100 animate-pulse" />
      ) : (
        <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
      )}
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  </div>
);

export default AdminDashboard;