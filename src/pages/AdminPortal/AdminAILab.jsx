import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Brain, MessageSquare, TrendingUp, Users, Zap, Plus, BarChart2, Activity, Clock, Target, RefreshCw, ArrowUpRight, Settings, ChevronRight } from 'lucide-react';
import { request } from '../../utils/apiClient';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

const AiToolCard = ({ tool, onClick }) => {
  const Icon = tool.icon || Bot;
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(0,0,0,0.08)' }}
      className="bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer transition-all hover:border-indigo-200 group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient || 'from-blue-500 to-indigo-500'} flex items-center justify-center shadow-lg shadow-indigo-100`}>
          <Icon size={22} className="text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
            tool.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
            tool.status === 'beta' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
            'bg-gray-50 text-gray-500 border border-gray-100'
          }`}>
            {tool.status}
          </span>
          <ArrowUpRight size={14} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>
      <h3 className="font-bold text-gray-900 text-base mb-1">{tool.name}</h3>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">{tool.description}</p>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
          <Activity size={10} /> {tool.usage?.toLocaleString() || 0} uses
        </span>
        {tool.lastUsed && (
          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
            <Clock size={10} /> {tool.lastUsed}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const AdminAILab = ({ user, addToast }) => {
  const [stats, setStats] = useState(null);
  const [tools, setTools] = useState([]);
  const [recentQueries, setRecentQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolModalOpen, setToolModalOpen] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, toolsRes, queriesRes] = await Promise.allSettled([
        request('/ai/stats'),
        request('/ai/tools'),
        request('/ai/recent-queries?limit=10'),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.stats);
      } else {
        setStats({
          totalQueries: 0,
          activeUsers: 0,
          avgResponseTime: '0ms',
          accuracy: 0,
          totalTokens: 0,
          successRate: 0,
        });
      }

      if (toolsRes.status === 'fulfilled' && toolsRes.value?.success) {
        setTools(toolsRes.value.tools.map((t, i) => ({
          ...t,
          icon: [Brain, Bot, MessageSquare, Zap, TrendingUp, Target][i % 6],
          gradient: ['from-blue-500 to-indigo-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-pink-500 to-rose-500', 'from-cyan-500 to-blue-500'][i % 6],
        })));
      } else {
        setTools([]);
      }

      if (queriesRes.status === 'fulfilled' && queriesRes.value?.queries) {
        setRecentQueries(queriesRes.value.queries);
      }
    } catch (err) {
      console.error('Failed to load AI dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToolClick = (tool) => {
    setSelectedTool(tool);
    setToolModalOpen(true);
  };

  const formatResponseTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const StatCard = ({ icon: Icon, label, value, trend, gradient, sublabel }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon size={18} className="text-white" />
        </div>
        {trend && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">{trend}</span>
        )}
      </div>
      <h3 className="text-2xl font-black text-gray-900">{value}</h3>
      <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
      {sublabel && <p className="text-[10px] text-gray-400 mt-0.5">{sublabel}</p>}
    </motion.div>
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[10px] font-bold uppercase tracking-widest">
              AI Infrastructure
            </div>
            {loading && <RefreshCw size={12} className="animate-spin text-gray-400" />}
          </div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            AI Lab
            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold border border-emerald-100">Live</span>
          </h1>
        </div>
        <Button variant="primary" icon={Plus} className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg">
          Add AI Tool
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={MessageSquare} label="Total Queries" value={stats?.totalQueries?.toLocaleString() || '—'} gradient="from-blue-500 to-indigo-500" trend={stats?.queriesGrowth ? `+${stats.queriesGrowth}%` : null} />
        <StatCard icon={Users} label="Active Users" value={stats?.activeUsers?.toLocaleString() || '—'} gradient="from-emerald-500 to-teal-500" sublabel={stats?.uniqueUsers ? `${stats.uniqueUsers.toLocaleString()} unique` : null} />
        <StatCard icon={Activity} label="Avg Response" value={stats?.avgResponseTime ? formatResponseTime(stats.avgResponseTime) : '—'} gradient="from-violet-500 to-purple-500" sublabel={stats?.p95Response ? `p95: ${formatResponseTime(stats.p95Response)}` : null} />
        <StatCard icon={Target} label="Accuracy" value={stats?.accuracy ? `${stats.accuracy}%` : '—'} gradient="from-amber-500 to-orange-500" trend={stats?.accuracyDelta ? `${stats.accuracyDelta > 0 ? '+' : ''}${stats.accuracyDelta}%` : null} />
        <StatCard icon={Brain} label="Tokens Used" value={stats?.totalTokens ? `${(stats.totalTokens / 1000000).toFixed(1)}M` : '—'} gradient="from-pink-500 to-rose-500" />
        <StatCard icon={TrendingUp} label="Success Rate" value={stats?.successRate ? `${stats.successRate}%` : '—'} gradient="from-cyan-500 to-blue-500" sublabel={stats?.errorCount ? `${stats.errorCount} errors` : null} />
      </div>

      {/* AI Tools */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" /> AI Tools
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{tools.length} tools active in production</p>
          </div>
          <button onClick={loadDashboard} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all" title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-48 bg-gray-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <Bot size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="font-bold text-gray-500">No AI tools configured</p>
            <p className="text-xs text-gray-400 mt-1">Add tools to start monitoring AI usage</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <AiToolCard key={tool.id || tool.name} tool={tool} onClick={() => handleToolClick(tool)} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Queries & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Recent Queries</h2>
            <span className="text-[10px] text-gray-400 font-medium">{recentQueries.length} shown</span>
          </div>
          {recentQueries.length === 0 ? (
            <div className="py-8 text-center text-gray-300">
              <Activity size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No recent queries</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentQueries.map((q, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">
                    {q.mode?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{q.prompt || q.query || 'Query'}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{q.user?.name || 'User'} · {q.mode || 'balanced'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-gray-500">{q.responseTime ? formatResponseTime(q.responseTime) : '—'}</p>
                    <p className="text-[10px] text-gray-400">{q.created_at ? new Date(q.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">System Status</h2>
            <div className="flex items-center gap-1.5 text-emerald-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Operational</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Primary API (Cerebras)', status: 'operational', latency: stats?.avgResponseTime || '0ms' },
              { label: 'Fallback API (Groq)', status: stats?.fallbackAvailable ? 'operational' : 'degraded', latency: stats?.fallbackLatency || '—' },
              { label: 'Stream Chat Integration', status: 'operational', latency: '—' },
              { label: 'Firebase Realtime DB', status: 'operational', latency: '—' },
              { label: 'Rate Limiter', status: 'operational', limit: '100 req/min' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${s.status === 'operational' ? 'bg-emerald-500' : s.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium text-gray-700">{s.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {s.latency && s.latency !== '—' && <span className="text-[10px] font-mono text-gray-400">{s.latency}</span>}
                  {s.limit && <span className="text-[10px] font-mono text-gray-400">{s.limit}</span>}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.status === 'operational' ? 'bg-emerald-50 text-emerald-600' : s.status === 'degraded' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tool Detail Modal */}
      <Modal isOpen={toolModalOpen} onClose={() => setToolModalOpen(false)} title={selectedTool?.name || 'AI Tool'} size="lg">
        {selectedTool && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedTool.gradient || 'from-blue-500 to-indigo-500'} flex items-center justify-center shadow-lg`}>
                {(() => { const Icon = selectedTool.icon || Bot; return <Icon size={26} className="text-white" />; })()}
              </div>
              <div>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedTool.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    selectedTool.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>{selectedTool.status}</span>
                  <span className="text-xs text-gray-400 font-medium">{selectedTool.usage?.toLocaleString() || 0} total uses</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Daily Uses</p>
                <p className="text-xl font-black text-gray-900">{selectedTool.dailyUsage?.toLocaleString() || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Latency</p>
                <p className="text-xl font-black text-gray-900">{selectedTool.avgLatency ? formatResponseTime(selectedTool.avgLatency) : '—'}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setToolModalOpen(false)}>Close</Button>
              <Button variant="primary" className="bg-gray-900 text-white">Configure Tool</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAILab;