import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
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
} from 'lucide-react';

/**
 * @component AdminDashboard
 * @description Main admin dashboard with school-wide analytics and management tools
 */
const AdminDashboard = ({ user, addToast }) => {
  // Empty states - data would come from backend API
  const [stats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalClasses: 0,
    attendanceToday: 0,
    feesCollected: 0,
    upcomingExams: 0,
    pendingNotices: 0,
  });

  const [recentActivities] = useState([]);

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
          value={stats.totalStudents.toLocaleString()}
          trend="+12%"
          color="bg-blue-500"
        />
        <StatCard
          icon={GraduationCap}
          label="Total Teachers"
          value={stats.totalTeachers.toLocaleString()}
          trend="+5%"
          color="bg-green-500"
        />
        <StatCard
          icon={School}
          label="Total Classes"
          value={stats.totalClasses}
          trend="Stable"
          color="bg-purple-500"
        />
        <StatCard
          icon={DollarSign}
          label="Fees Collected"
          value={`${stats.feesCollected}%`}
          trend="+8%"
          color="bg-yellow-500"
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
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recent Activity
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <Activity size={48} style={{ color: 'var(--text-muted)' }} className="mb-3 opacity-50" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              No recent activities
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Activity will appear here as users interact with the system
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-color)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Key Metrics
          </h2>
          <div className="space-y-4">
            <MetricBar
              label="Today's Attendance"
              value={stats.attendanceToday}
              target={95}
              color="bg-green-500"
            />
            <MetricBar
              label="Fees Collection"
              value={stats.feesCollected}
              target={95}
              color="bg-blue-500"
            />
            <MetricBar
              label="Teacher Availability"
              value={97}
              target={95}
              color="bg-purple-500"
            />
            <MetricBar
              label="Assignment Completion"
              value={88}
              target={90}
              color="bg-yellow-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
        trend.startsWith('+') ? 'bg-green-100 text-green-700' : 
        trend === 'Stable' ? 'bg-gray-100 text-gray-700' :
        'bg-red-100 text-red-700'
      }`}>
        {trend}
      </span>
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </h3>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  </div>
);

const MetricBar = ({ label, value, target, color }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}%</span>
    </div>
    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
    {value < target && (
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        Target: {target}%
      </p>
    )}
  </div>
);

export default AdminDashboard;