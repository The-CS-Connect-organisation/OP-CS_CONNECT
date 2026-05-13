import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, GraduationCap, DollarSign, TrendingUp,
  Calendar, Bell, Activity, School, FileText, Settings, UserPlus, Loader2,
  Clock, AlertTriangle, CheckCircle, Edit, UserCheck
} from 'lucide-react';
import { request } from '../../utils/apiClient';

const StatCard = ({ icon: Icon, label, value, color = 'bg-blue-500' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-5 rounded-2xl border"
    style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={18} className="text-white" />
      </div>
      <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
    </div>
    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
      {value}
    </p>
    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
  </motion.div>
);

const ManagerDashboard = ({ user, addToast }) => {
  const [stats, setStats] = useState({
    totalStudents: 0, totalTeachers: 0, totalClasses: 0, pendingComplaints: 0,
    pendingAccolades: 0, upcomingExams: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersRes, announcementsRes, classesRes] = await Promise.allSettled([
          request('/school/users?limit=500'),
          request('/school/announcements?limit=10'),
          request('/school/classes'),
        ]);

        const users = usersRes.status === 'fulfilled'
          ? (usersRes.value.users || usersRes.value.items || []) : [];
        const announcements = announcementsRes.status === 'fulfilled'
          ? (announcementsRes.value.announcements || announcementsRes.value.items || []) : [];
        const classes = classesRes.status === 'fulfilled'
          ? (classesRes.value.classes || []) : [];

        setStats({
          totalStudents: users.filter(u => u.role === 'student').length,
          totalTeachers: users.filter(u => u.role === 'teacher').length,
          totalClasses: classes.length,
          pendingComplaints: 3,
          pendingAccolades: 5,
          upcomingExams: 2,
        });

        setRecentActivities([
          { id: 1, type: 'complaint', message: 'New anonymous complaint received', time: '10 mins ago', status: 'pending' },
          { id: 2, type: 'accolade', message: 'Accolade request from Priya Sharma', time: '1 hour ago', status: 'pending' },
          { id: 3, type: 'assignment', message: 'Math assignment posted by Rajesh Kumar', time: '2 hours ago', status: 'active' },
        ]);
      } catch (err) {
        console.error('Manager dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    { icon: AlertTriangle, label: 'View Complaints', color: 'bg-red-500', action: () => addToast?.('Opening complaints panel...', 'info') },
    { icon: CheckCircle, label: 'Approve Accolades', color: 'bg-emerald-500', action: () => addToast?.('Opening accolades panel...', 'info') },
    { icon: Edit, label: 'Manage Timetable', color: 'bg-blue-500', action: () => addToast?.('Opening timetable manager...', 'info') },
    { icon: UserCheck, label: 'Allot Teachers', color: 'bg-purple-500', action: () => addToast?.('Opening teacher allotment...', 'info') },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Manager Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Welcome back, {user?.name || 'Manager'}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="bg-blue-500" />
        <StatCard icon={GraduationCap} label="Total Teachers" value={stats.totalTeachers} color="bg-violet-500" />
        <StatCard icon={School} label="Total Classes" value={stats.totalClasses} color="bg-amber-500" />
        <StatCard icon={AlertTriangle} label="Pending Complaints" value={stats.pendingComplaints} color="bg-red-500" />
        <StatCard icon={CheckCircle} label="Pending Accolades" value={stats.pendingAccolades} color="bg-emerald-500" />
        <StatCard icon={Calendar} label="Upcoming Exams" value={stats.upcomingExams} color="bg-pink-500" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className="p-5 rounded-2xl border text-left transition-all hover:shadow-lg"
            style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}
          >
            <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
              <action.icon size={18} className="text-white" />
            </div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{action.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="p-5 rounded-2xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Recent Activity
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-3">
                  {activity.type === 'complaint' ? <AlertTriangle size={16} className="text-red-500" /> : 
                   activity.type === 'accolade' ? <CheckCircle size={16} className="text-emerald-500" /> : 
                   <FileText size={16} className="text-blue-500" />}
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{activity.message}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{activity.time}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${activity.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
