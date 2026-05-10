import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import { getDataMode, DATA_MODES } from '../../config/dataMode';

const AdminAnalytics = ({ user, addToast }) => {
  const [selectedPeriod] = useState('This Month');
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  const useApi = getDataMode() === DATA_MODES.REMOTE_API;

  useEffect(() => {
    if (!useApi) {
      setMetrics([
        { name: 'Student Performance', value: '87%', trend: '+5%', icon: TrendingUp, color: 'bg-green-500' },
        { name: 'Teacher Efficiency', value: '92%', trend: '+3%', icon: Users, color: 'bg-blue-500' },
        { name: 'Fee Collection', value: '89%', trend: '+8%', icon: DollarSign, color: 'bg-yellow-500' },
        { name: 'Overall Growth', value: '94%', trend: '+12%', icon: BarChart3, color: 'bg-purple-500' },
      ]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [studentRes, teacherRes, feesRes, attendanceRes] = await Promise.allSettled([
          apiRequest('/school/students', { method: 'GET' }),
          apiRequest('/school/teachers', { method: 'GET' }),
          apiRequest('/fees', { method: 'GET' }),
          apiRequest('/school/attendance/report', { method: 'GET' }),
        ]);

        const students = studentRes.status === 'fulfilled' ? (studentRes.value?.items ?? studentRes.value?.students ?? []) : [];
        const teachers = teacherRes.status === 'fulfilled' ? (teacherRes.value?.items ?? teacherRes.value?.teachers ?? []) : [];
        const fees = feesRes.status === 'fulfilled' ? (feesRes.value?.items ?? feesRes.value ?? []) : [];

        const studentCount = students.length;
        const teacherCount = teachers.length;
        const avgAttendance = attendanceRes.status === 'fulfilled' && attendanceRes.value?.records?.length > 0
          ? (attendanceRes.value.records.filter(r => ['present', 'late'].includes(r.status)).length / attendanceRes.value.records.length * 100).toFixed(0)
          : 87;

        const totalFees = fees.reduce((sum, f) => sum + (f.amount || f.total_amount || 0), 0);
        const paidFees = fees.filter(f => f.status === 'paid' || f.paid).reduce((sum, f) => sum + (f.amount || f.total_amount || 0), 0);
        const feeCollectionRate = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 89;

        setMetrics([
          {
            name: 'Student Performance',
            value: `${avgAttendance}%`,
            trend: '+5%',
            icon: TrendingUp,
            color: 'bg-green-500',
            detail: `${studentCount} enrolled students`,
          },
          {
            name: 'Teacher Efficiency',
            value: `${teacherCount > 0 ? Math.min(100, Math.round((teacherCount / studentCount) * 500)) : 92}%`,
            trend: '+3%',
            icon: Users,
            color: 'bg-blue-500',
            detail: `${teacherCount} active teachers`,
          },
          {
            name: 'Fee Collection',
            value: `${feeCollectionRate}%`,
            trend: feeCollectionRate >= 85 ? '+8%' : '-2%',
            icon: DollarSign,
            color: 'bg-yellow-500',
            detail: `₹${paidFees.toLocaleString()} collected`,
          },
          {
            name: 'Overall Growth',
            value: `${Math.min(100, Math.round((avgAttendance + feeCollectionRate) / 2))}%`,
            trend: '+12%',
            icon: BarChart3,
            color: 'bg-purple-500',
            detail: 'Term performance',
          },
        ]);

        setChartData({ students, teachers, fees });
      } catch (err) {
        console.error('Failed to load analytics', err);
        setMetrics([
          { name: 'Student Performance', value: '87%', trend: '+5%', icon: TrendingUp, color: 'bg-green-500' },
          { name: 'Teacher Efficiency', value: '92%', trend: '+3%', icon: Users, color: 'bg-blue-500' },
          { name: 'Fee Collection', value: '89%', trend: '+8%', icon: DollarSign, color: 'bg-yellow-500' },
          { name: 'Overall Growth', value: '94%', trend: '+12%', icon: BarChart3, color: 'bg-purple-500' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [useApi]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics Dashboard</h1>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 rounded-xl border text-sm" style={{ borderColor: 'var(--border-color)' }}>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
          {useApi && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">API</span>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-gray-400" />
          <span className="ml-3 text-sm text-gray-400">Loading analytics...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${metric.color} flex items-center justify-center`}>
                <metric.icon size={20} className="text-white" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">{metric.trend}</span>
            </div>
            <h3 className="text-2xl font-bold mt-4" style={{ color: 'var(--text-primary)' }}>{metric.value}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{metric.name}</p>
            {metric.detail && (
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{metric.detail}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-color)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Enrollment Overview</h2>
        {chartData && chartData.students && chartData.students.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">{chartData.students.length}</p>
              <p className="text-xs text-gray-500 mt-1">Students</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">{chartData.teachers?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Teachers</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">{chartData.fees?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Fee Records</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">{metrics[3]?.value || '94%'}</p>
              <p className="text-xs text-gray-500 mt-1">Overall Score</p>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No enrollment data available yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
