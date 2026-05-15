import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, History, Trash2, Info, MessageSquare,
  X, RotateCcw, Bot, BarChart2, TrendingUp, Target, Brain,
  CheckCircle2, AlertTriangle, Plus, XCircle
} from 'lucide-react';
import { request } from '../../utils/apiClient';
import { AnimatedAIInput } from '../../components/ui/AnimatedAIInput';

const DISCLAIMER = "CSAI can make mistakes. Verify important information.";

/* ── Markdown-lite renderer ── */
const MsgContent = ({ text }) => {
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-2">
      {blocks.map((block, bi) => {
        if (block.startsWith('```')) {
          const code = block.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
          return (
            <pre key={bi} className="bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-mono overflow-x-auto text-gray-800 leading-relaxed">
              {code}
            </pre>
          );
        }
        return (
          <p key={bi} className="leading-relaxed">
            {block.split('\n').map((line, li) => {
              const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
              return (
                <span key={li}>
                  {parts.map((p, pi) => {
                    if (p.startsWith('`') && p.endsWith('`'))
                      return <code key={pi} className="bg-gray-100 text-violet-600 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-200">{p.slice(1, -1)}</code>;
                    if (p.startsWith('**') && p.endsWith('**'))
                      return <strong key={pi} className="font-semibold text-gray-900">{p.slice(2, -2)}</strong>;
                    return p;
                  })}
                  {li < block.split('\n').length - 1 && <br />}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
};

/* ── Stats Card ── */
const StatCard = ({ icon: Icon, label, value, trend, gradient, color, sublabel }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-5 border hover:shadow-md transition-all"
    style={{ borderColor: color === '#1c1917' ? '#e5e7eb' : color }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
        <Icon size={18} className="text-white" />
      </div>
      {trend && (
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">{trend}</span>
      )}
    </div>
    <h3 className="text-2xl font-black" style={{ color: color || '#1c1917' }}>{value}</h3>
    <p className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>{label}</p>
    {sublabel && <p className="text-[10px]" style={{ color: '#a8a29e' }}>{sublabel}</p>}
  </motion.div>
);

/* ── AI Tool Card ── */
const AiToolCard = ({ tool, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
    onClick={() => onClick(tool)}
    className="bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
    style={{ borderColor: '#e5e7eb' }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
        tool.gradient ? `bg-gradient-to-br ${tool.gradient}` : 'bg-gray-100'
      }`}>
        {(() => { const Icon = tool.icon || Bot; return <Icon size={20} className="text-white" />; })()}
      </div>
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
        tool.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
      }`}>{tool.status || 'active'}</span>
    </div>
    <h4 className="text-sm font-bold text-gray-900">{tool.name}</h4>
    <p className="text-xs text-gray-500 mt-1 truncate">{tool.description || 'AI-powered tool'}</p>
    <div className="flex items-center justify-between mt-3">
      <span className="text-[10px] text-gray-400">{tool.usage?.toLocaleString() || 0} uses</span>
      <span className="text-[10px] text-gray-400">{tool.dailyUsage ? `${tool.dailyUsage}/day` : '—'}</span>
    </div>
  </motion.div>
);

export const AdminAILab = ({ user, addToast }) => {
  const [stats, setStats] = useState(null);
  const [tools, setTools] = useState([]);
  const [recentQueries, setRecentQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
        setStats({ totalQueries: 0, activeUsers: 0, avgResponseTime: '0ms', accuracy: 0, totalTokens: 0, successRate: 0 });
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

  const handleSendChatMessage = async (message, model) => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message, model: model.name };
    setChatMessages(prev => [...prev, userMessage]);
    setIsSending(true);

    try {
      const response = await request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, model: model.id }),
      });

      if (response?.success) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: response.reply || response.message,
          model: model.name,
          provider: model.provider,
        }]);
      } else {
        addToast?.(response?.message || 'Failed to get AI response', 'error');
      }
    } catch (err) {
      addToast?.('AI request failed', 'error');
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await request('/ai/history');
      if (data?.success) setHistory(data.history ?? []);
    } catch (e) {
      console.error('History load failed', e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showHistory) loadHistory();
  }, [showHistory, loadHistory]);

  const formatResponseTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const renderChatTab = () => (
    <motion.div
      key="chat"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="h-[450px] overflow-y-auto rounded-xl border p-4 space-y-4"
        style={{ background: 'var(--bg-surface, #fafafa)' }}>
        {chatMessages.length === 0 && !isSending && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Bot size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Welcome to AI Lab Chat</h3>
            <p className="text-sm text-gray-400 max-w-md mt-2">
              Ask anything about your school data. Select a model using the dropdown below.
            </p>
            <div className="text-xs text-gray-400 bg-white/50 px-3 py-2 rounded-lg mt-2">
              {DISCLAIMER}
            </div>
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              {msg.provider && (
                <p className="text-[10px] opacity-70 mt-1 flex items-center gap-1">
                  <Bot size={10} /> via {msg.provider}
                </p>
              )}
            </div>
          </motion.div>
        ))}
        {isSending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
              <Loader2 size={16} className="animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">AI is thinking...</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  const renderStatsTab = () => (
    <motion.div
      key="stats"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={MessageSquare} label="Total Queries" value={stats?.totalQueries?.toLocaleString() || '—'} gradient="from-blue-500 to-indigo-500" trend={stats?.queriesGrowth ? `+${stats.queriesGrowth}%` : null} color="#3b82f6" />
        <StatCard icon={Users} label="Active Users" value={stats?.activeUsers?.toLocaleString() || '—'} gradient="from-emerald-500 to-teal-500" sublabel={stats?.uniqueUsers ? `${stats.uniqueUsers.toLocaleString()} unique` : null} color="#10b981" />
        <StatCard icon={Zap} label="Avg Response" value={stats?.avgResponseTime ? formatResponseTime(stats.avgResponseTime) : '—'} gradient="from-violet-500 to-purple-500" sublabel={stats?.p95Response ? `p95: ${formatResponseTime(stats.p95Response)}` : null} color="#8b5cf6" />
        <StatCard icon={Target} label="Accuracy" value={stats?.accuracy ? `${stats.accuracy}%` : '—'} gradient="from-amber-500 to-orange-500" trend={stats?.accuracyDelta ? `${stats.accuracyDelta > 0 ? '+' : ''}${stats.accuracyDelta}%` : null} color="#f59e0b" />
        <StatCard icon={Brain} label="Tokens Used" value={stats?.totalTokens ? `${(stats.totalTokens / 1000000).toFixed(1)}M` : '—'} gradient="from-pink-500 to-rose-500" color="#ec4899" />
        <StatCard icon={TrendingUp} label="Success Rate" value={stats?.successRate ? `${stats.successRate}%` : '—'} gradient="from-cyan-500 to-blue-500" sublabel={stats?.errorCount ? `${stats.errorCount} errors` : null} color="#06b6d4" />
      </div>
    </motion.div>
  );

  const renderToolsTab = () => (
    <motion.div
      key="tools"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : tools.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed rounded-2xl">
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
    </motion.div>
  );

  const renderHistoryTab = () => (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {history.length === 0 ? (
        <div className="py-8 text-center">
          <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
          <p className="text-xs text-gray-400">No recent queries</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {item.mode?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{item.prompt || item.query || 'Query'}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.user?.name || 'User'} · {item.mode || 'balanced'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-bold text-gray-500">{item.responseTime ? formatResponseTime(item.responseTime) : '—'}</p>
                <p className="text-[10px] text-gray-400">{item.created_at ? new Date(item.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[10px] font-bold uppercase tracking-widest">
              AI Infrastructure
            </div>
            {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
          </div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            AI Lab
            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold border border-emerald-100">Live</span>
          </h1>
        </div>
        <button className="px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg flex items-center gap-2"
          style={{ background: 'var(--primary)', color: 'white' }}>
          <Plus size={16} /> Add AI Tool
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={MessageSquare} label="Total Queries" value={stats?.totalQueries?.toLocaleString() || '—'} gradient="from-blue-500 to-indigo-500" trend={stats?.queriesGrowth ? `+${stats.queriesGrowth}%` : null} />
        <StatCard icon={Users} label="Active Users" value={stats?.activeUsers?.toLocaleString() || '—'} gradient="from-emerald-500 to-teal-500" sublabel={stats?.uniqueUsers ? `${stats.uniqueUsers.toLocaleString()} unique` : null} />
        <StatCard icon={Zap} label="Avg Response" value={stats?.avgResponseTime ? formatResponseTime(stats.avgResponseTime) : '—'} gradient="from-violet-500 to-purple-500" sublabel={stats?.p95Response ? `p95: ${formatResponseTime(stats.p95Response)}` : null} />
        <StatCard icon={Target} label="Accuracy" value={stats?.accuracy ? `${stats.accuracy}%` : '—'} gradient="from-amber-500 to-orange-500" trend={stats?.accuracyDelta ? `${stats.accuracyDelta > 0 ? '+' : ''}${stats.accuracyDelta}%` : null} />
        <StatCard icon={Brain} label="Tokens Used" value={stats?.totalTokens ? `${(stats.totalTokens / 1000000).toFixed(1)}M` : '—'} gradient="from-pink-500 to-rose-500" />
        <StatCard icon={TrendingUp} label="Success Rate" value={stats?.successRate ? `${stats.successRate}%` : '—'} gradient="from-cyan-500 to-blue-500" sublabel={stats?.errorCount ? `${stats.errorCount} errors` : null} />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: 'var(--border-color, #e5e7eb)' }}>
        {/* Tab Bar */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-color, #e5e7eb)' }}>
          {[
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'stats', label: 'Analytics', icon: BarChart2 },
            { id: 'tools', label: 'AI Tools', icon: TrendingUp },
            { id: 'history', label: 'History', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && renderChatTab()}
            {activeTab === 'stats' && renderStatsTab()}
            {activeTab === 'tools' && renderToolsTab()}
            {activeTab === 'history' && renderHistoryTab()}
          </AnimatePresence>
        </div>

        {/* Bottom Bar - Shared AnimatedAIInput across all tabs */}
        <div className="border-t px-6 py-4" style={{ borderColor: 'var(--border-color, #e5e7eb)' }}>
          <AnimatedAIInput
            onSend={handleSendChatMessage}
            placeholder={activeTab === 'chat' ? 'Ask about school data, analytics, or anything...' : 'Type your message...'}
          />
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
              <button className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                onClick={() => setToolModalOpen(false)}>Close</button>
              <button className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">Configure Tool</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAILab;