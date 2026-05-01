import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Download, Filter, Brain, Loader2 } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

/**
 * @component ClassAnalytics
 * @description Performance analytics dashboard with real-time metrics, charts, and AI insights
 * @param {Object} user - Current user object
 * @param {string} classId - Selected class ID (optional; shows selector if absent)
 * @param {Function} addToast - Toast notification function
 */

const MetricCard = ({ label, value, unit, trend, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="nova-card p-6"
  >
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{label}</p>
    <div className="flex items-end justify-between">
      <div>
        <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-xs text-gray-500 mt-1">{unit}</p>
      </div>
      {trend != null && (
        <div className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  </motion.div>
);

const CLASSES = ['10-A', '10-B', '11-A', '11-B'];

export const ClassAnalytics = ({ user, classId: propClassId, addToast }) => {
  const [classId, setClassId] = useState(propClassId || '10-A');
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setAnalytics(null);
        setTrends(null);
        const [analyticsRes, trendsRes] = await Promise.allSettled([
          teacherApi.getClassAnalytics(classId),
          teacherApi.getClassTrends(classId),
        ]);
        if (!alive) return;
        if (analyticsRes.status === 'fulfilled') {
          const d = analyticsRes.value?.data?.data ?? analyticsRes.value?.data ?? {};
          setAnalytics(d);
        }
        if (trendsRes.status === 'fulfilled') {
          const d = trendsRes.value?.data?.data ?? trendsRes.value?.data ?? {};
          setTrends(d);
        }
      } catch (err) {
        if (!alive) return;
        addToast?.('Failed to load analytics', 'error');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [classId]);

  const handleGenerateAiInsights = async () => {
    try {
      setAiLoading(true);
      const res = await teacherApi.generateClassInsights(classId);
      const d = res?.data?.data ?? res?.data ?? {};
      setAiInsights(d);
      addToast?.('AI insights generated', 'success');
    } catch (err) {
      addToast?.('Failed to generate AI insights', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const overview = analytics?.overview ?? {};
  const gradeDistribution = analytics?.gradeDistribution ?? [];
  const attendanceTrends = trends?.attendanceTrends ?? trends?.trends ?? [];
  const assignmentCompletion = analytics?.assignmentCompletion ?? [];
  const atRiskStudents = analytics?.atRiskStudents ?? [];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 size={32} className="text-blue-500" />
            Class Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">Performance metrics and trends for {classId}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            icon={Brain}
            onClick={handleGenerateAiInsights}
            disabled={aiLoading}
            className="rounded-xl"
          >
            {aiLoading ? 'Generating...' : 'AI Insights'}
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => addToast?.('Export coming soon', 'info')}
            className="rounded-xl"
          >
            Export PDF
          </Button>
        </div>
      </motion.div>

      {/* Class Selector (if no prop) */}
      {!propClassId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="nova-card p-4 flex items-center gap-4">
          <Filter size={18} className="text-gray-400" />
          <select
            value={classId}
            onChange={e => setClassId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-blue-400" />
        </div>
      )}

      {!loading && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Average Grade" value={overview.averageGrade != null ? `${overview.averageGrade}%` : '—'} unit="class average" delay={0.1} />
            <MetricCard label="Attendance Rate" value={overview.attendanceRate != null ? `${overview.attendanceRate}%` : '—'} unit="this term" delay={0.15} />
            <MetricCard label="Completion Rate" value={overview.completionRate != null ? `${overview.completionRate}%` : '—'} unit="assignments" delay={0.2} />
            <MetricCard label="Total Students" value={overview.totalStudents} unit="enrolled" delay={0.25} />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grade Distribution */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="nova-card p-6">
              <h3 className="text-sm font-semibold mb-4 text-gray-600">Grade Distribution</h3>
              {gradeDistribution.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No data available</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

            {/* Attendance Trends */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="nova-card p-6">
              <h3 className="text-sm font-semibold mb-4 text-gray-600">Attendance Trends</h3>
              {attendanceTrends.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No trend data available</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendanceTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke="#10b981" fill="#10b98115" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          </div>

          {/* Assignment Completion */}
          {assignmentCompletion.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="nova-card p-6">
              <h3 className="text-sm font-semibold mb-4 text-gray-600">Assignment Completion Rates</h3>
              <div className="space-y-3">
                {assignmentCompletion.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                      <p className="text-xs text-gray-500">{a.submitted}/{a.total} submitted</p>
                    </div>
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${a.rate ?? 0}%` }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-12 text-right">{a.rate ?? 0}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* At-Risk Students */}
          {atRiskStudents.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="nova-card p-6">
              <h3 className="text-sm font-semibold mb-4 text-gray-600 flex items-center gap-2">
                <TrendingUp size={14} />
                Students Needing Attention
              </h3>
              <div className="space-y-2">
                {atRiskStudents.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">Average: {s.average ?? s.grade ?? '—'}%</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                      {s.risk ?? 'At Risk'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* AI Insights Panel */}
          {aiInsights && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="nova-card p-6 border-l-4 border-l-purple-500">
              <h3 className="text-sm font-semibold mb-4 text-gray-600 flex items-center gap-2">
                <Brain size={14} className="text-purple-500" />
                AI Class Insights
              </h3>
              <div className="space-y-3">
                {(aiInsights.insights ?? [aiInsights]).map((insight, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                    <p className="text-sm text-gray-700">{typeof insight === 'string' ? insight : insight.message ?? insight.text ?? JSON.stringify(insight)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};
