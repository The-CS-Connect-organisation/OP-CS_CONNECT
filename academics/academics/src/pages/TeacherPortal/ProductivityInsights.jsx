import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';
import { Button } from '../../components/ui/Button';

/**
 * @component ProductivityInsights
 * @description AI-driven productivity insights and recommendations for teachers
 * @param {Object} user - Current user object
 * @param {Function} addToast - Toast notification function
 */

const PRIORITY_CONFIG = {
  high: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  medium: { color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  low: { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
};

const InsightCard = ({ insight, idx }) => {
  const priority = insight.priority ?? 'medium';
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      className="nova-card p-5"
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-900">{insight.title ?? insight.type ?? 'Insight'}</p>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.color}`}>
              {priority}
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{insight.message ?? insight.description ?? insight.text ?? ''}</p>
          {insight.recommendation && (
            <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-1">Recommendation</p>
              <p className="text-xs text-blue-600">{insight.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ScoreGauge = ({ score }) => {
  const pct = Math.min(100, Math.max(0, score ?? 0));
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{pct}</span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-700 mt-2">Productivity Score</p>
      <p className="text-xs text-gray-500 mt-1">
        {pct >= 75 ? 'Excellent' : pct >= 50 ? 'Good' : 'Needs Improvement'}
      </p>
    </div>
  );
};

export const ProductivityInsights = ({ user, addToast }) => {
  const [insights, setInsights] = useState(null);
  const [productivity, setProductivity] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [insightsRes, prodRes] = await Promise.allSettled([
        teacherApi.getInsights(),
        teacherApi.getProductivityScore(),
      ]);
      if (insightsRes.status === 'fulfilled') {
        const d = insightsRes.value?.data?.data ?? insightsRes.value?.data ?? {};
        setInsights(d);
      }
      if (prodRes.status === 'fulfilled') {
        const d = prodRes.value?.data?.data ?? prodRes.value?.data ?? {};
        setProductivity(d);
      }
    } catch (err) {
      addToast?.('Failed to load insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const insightsList = insights?.insights ?? (Array.isArray(insights) ? insights : []);
  const recommendations = insights?.recommendations ?? productivity?.recommendations ?? [];
  const score = productivity?.score ?? productivity?.productivityScore ?? null;
  const breakdown = productivity?.breakdown ?? {};

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain size={32} className="text-purple-500" />
            Productivity Insights
          </h1>
          <p className="text-sm text-gray-500 mt-1">AI-driven insights and recommendations to boost your effectiveness</p>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading} className="rounded-xl">
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-purple-400" />
        </div>
      )}

      {!loading && (
        <>
          {/* Score + Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="nova-card p-8 flex items-center justify-center">
              <ScoreGauge score={score} />
            </motion.div>

            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {Object.entries(breakdown).map(([key, val], idx) => (
                <motion.div key={key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.05 }} className="nova-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-3xl font-bold text-gray-900">{typeof val === 'number' ? val : String(val)}</p>
                </motion.div>
              ))}
              {Object.keys(breakdown).length === 0 && score != null && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="nova-card p-5 col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Overall Score</p>
                  <p className="text-3xl font-bold text-gray-900">{score}</p>
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ delay: 0.5, duration: 0.8 }} className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Insights List */}
          {insightsList.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Zap size={14} className="text-amber-500" />
                AI Insights ({insightsList.length})
              </h3>
              {insightsList.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} idx={idx} />
              ))}
            </motion.div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.05 }} className="nova-card p-5 border-l-4 border-l-green-400">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{rec.title ?? rec.action ?? 'Recommendation'}</p>
                    <p className="text-xs text-gray-600">{rec.description ?? rec.message ?? (typeof rec === 'string' ? rec : '')}</p>
                    {rec.impact && (
                      <div className="mt-2 flex items-center gap-1">
                        <TrendingUp size={12} className="text-green-500" />
                        <span className="text-xs text-green-600 font-semibold">{rec.impact}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {insightsList.length === 0 && recommendations.length === 0 && !loading && (
            <div className="py-16 text-center border border-dashed rounded-xl border-gray-200">
              <Brain size={40} className="mx-auto mb-4 text-gray-200" />
              <p className="text-sm text-gray-500">No insights available yet. Check back after more activity.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
