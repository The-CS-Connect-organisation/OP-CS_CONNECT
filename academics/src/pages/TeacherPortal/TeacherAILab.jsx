import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, History, Trash2, Info, MessageSquare,
  Zap, Brain, AlertTriangle, X, ChevronDown, RotateCcw, Paperclip, FileText, ImageIcon,
  BookOpen, Target, BarChart2, Clock, Plus, Bot
} from 'lucide-react';
import { request } from '../../utils/apiClient';
import { AnimatedAIInput } from '../../components/ui/AnimatedAIInput';

const DISCLAIMER = "CSAI can make mistakes. Verify important information.";

const TEACHER_MODEL_CONFIG = {
  'groq-llama-3.1-8b-instant': { id: 'groq-llama-3.1-8b-instant', name: 'Llama 3.1 8B', subtitle: 'Fast & Efficient', provider: 'Groq', icon: Bot, gradient: 'from-blue-500 to-sky-400', pill: 'bg-blue-50 text-blue-600 border-blue-200', dot: 'bg-blue-500', ring: 'focus-within:ring-blue-100', sendBg: 'from-blue-500 to-sky-400' },
  'groq-llama-3.3-70b': { id: 'groq-llama-3.3-70b', name: 'Llama 3.3 70B', subtitle: 'Powerful', provider: 'Groq', icon: Brain, gradient: 'from-violet-600 to-purple-500', pill: 'bg-violet-50 text-violet-600 border-violet-200', dot: 'bg-violet-500', ring: 'focus-within:ring-violet-100', sendBg: 'from-violet-600 to-purple-500' },
  'cerebras-qwen-3-235b': { id: 'cerebras-qwen-3-235b', name: 'Qwen 3 235B', subtitle: 'Deep Reasoning', provider: 'Cerebras', icon: Brain, gradient: 'from-orange-500 to-amber-600', pill: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-500', ring: 'focus-within:ring-orange-100', sendBg: 'from-orange-500 to-amber-600' },
};

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
                      return <code key={pi} className="bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-200">{p.slice(1, -1)}</code>;
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

/* ── Particle ── */
const Particle = ({ x, y, size, color, delay }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color, filter: 'blur(1px)' }}
    animate={{ y: [0, -28, 0], opacity: [0, 0.7, 0], scale: [0.8, 1.3, 0.8] }}
    transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

const PARTICLES = [
  { x: 12, y: 72, size: 8, color: '#3b82f6', delay: 0 },
  { x: 82, y: 58, size: 6, color: '#8b5cf6', delay: 1 },
  { x: 22, y: 28, size: 10, color: '#06b6d4', delay: 2 },
  { x: 68, y: 82, size: 7, color: '#a78bfa', delay: 0.5 },
  { x: 48, y: 18, size: 5, color: '#3b82f6', delay: 1.5 },
  { x: 88, y: 32, size: 9, color: '#7c3aed', delay: 2.5 },
  { x: 8,  y: 48, size: 6, color: '#60a5fa', delay: 3 },
  { x: 58, y: 88, size: 8, color: '#818cf8', delay: 0.8 },
  { x: 35, y: 55, size: 5, color: '#c4b5fd', delay: 1.2 },
  { x: 75, y: 15, size: 7, color: '#38bdf8', delay: 3.5 },
];

/* ── Advanced warning ── */
const AdvancedWarningModal = ({ onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl p-6 max-w-sm shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="text-amber-500" size={24} />
        <h3 className="font-bold text-lg text-gray-900">Advanced Model</h3>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        The advanced model uses more compute and may take longer to respond. Continue?
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ── Stats Card ── */
const StatCard = ({ icon: Icon, label, value, trend, gradient, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-5 border hover:shadow-md transition-all"
    style={{ borderColor: '#e5e7eb' }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
        <Icon size={18} className="text-white" />
      </div>
      {trend && (
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">{trend}</span>
      )}
    </div>
    <h3 className="text-2xl font-black" style={{ color: '#1c1917' }}>{value}</h3>
    <p className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>{label}</p>
  </motion.div>
);

export const TeacherAILab = ({ user, addToast }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('groq-llama-3.1-8b-instant');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showAdvancedWarning, setShowAdvancedWarning] = useState(false);
  const [pendingModel, setPendingModel] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await request('/teacher/ai-stats');
      if (response?.success) {
        setStats(response.stats);
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await request('/teacher/ai-history');
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

  const handleModelChange = (modelId) => {
    if (modelId === 'cerebras-qwen-3-235b' && selectedModel !== 'cerebras-qwen-3-235b') {
      setPendingModel(modelId);
      setShowAdvancedWarning(true);
    } else {
      setSelectedModel(modelId);
      setShowModelDropdown(false);
    }
  };

  const confirmAdvancedModel = () => {
    setSelectedModel(pendingModel);
    setShowAdvancedWarning(false);
    setShowModelDropdown(false);
  };

  const handleSendMessage = async (message, model) => {
    if (!message.trim() || loading) return;

    const userMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await request('/teacher/ai-chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          model: model.id,
          context: 'teacher',
        }),
      });

      if (response?.success) {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: response.message || response.answer || 'No response received',
          provider: model.provider,
        }]);
      } else {
        addToast?.(response?.message || 'Failed to get AI response', 'error');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      addToast?.('AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
  };

  const currentModel = TEACHER_MODEL_CONFIG[selectedModel];
  const CurrentIcon = currentModel.icon;

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
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentModel.gradient} text-white mb-4`}>
              <CurrentIcon size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Teacher AI Lab</h2>
            <p className="text-gray-500 max-w-sm mb-4">
              Ask questions about lesson planning, student assessment, curriculum design, and more.
            </p>
            <div className="text-xs text-gray-400 bg-white/50 px-3 py-2 rounded-lg">
              {DISCLAIMER}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? `bg-gradient-to-br ${currentModel.gradient} text-white`
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              {msg.role === 'assistant' ? (
                <MsgContent text={msg.content} />
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-gray-600">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
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
        <StatCard
          icon={Bot}
          label="AI Sessions"
          value={stats?.totalSessions?.toLocaleString() || '—'}
          gradient="from-blue-500 to-sky-400"
          color="#3b82f6"
        />
        <StatCard
          icon={MessageSquare}
          label="Messages Sent"
          value={stats?.totalMessages?.toLocaleString() || '—'}
          gradient="from-emerald-500 to-teal-500"
          color="#10b981"
        />
        <StatCard
          icon={Zap}
          label="Avg Response"
          value={stats?.avgResponseTime ? formatResponseTime(stats.avgResponseTime) : '—'}
          gradient="from-violet-500 to-purple-500"
          color="#8b5cf6"
        />
        <StatCard
          icon={Target}
          label="Accuracy"
          value={stats?.accuracy ? `${stats.accuracy}%` : '—'}
          gradient="from-amber-500 to-orange-500"
          color="#f59e0b"
        />
      </div>
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
          <p className="text-xs text-gray-400">No history yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => {
                setMessages([
                  { role: 'user', content: item.prompt },
                  { role: 'assistant', content: item.response, provider: item.model },
                ]);
                setShowHistory(false);
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 group"
            >
              <p className="text-xs text-gray-700 truncate font-medium group-hover:text-gray-900">{item.prompt}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                <p className="text-[10px] text-gray-300 font-medium">{item.model}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </div>

      {/* Top Bar */}
      <div className="relative z-10 border-b border-white/20 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentModel.gradient} text-white`}>
              <CurrentIcon size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Teacher AI Lab</h1>
              <p className="text-xs text-gray-500">Powered by {currentModel.provider}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <div className="relative" onMouseDown={e => e.stopPropagation()}>
              <button onClick={() => setShowModelDropdown(v => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${currentModel.pill}`}
              >
                <motion.div className={`w-1.5 h-1.5 rounded-full ${currentModel.dot}`}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <currentModel.icon size={13} />
                {currentModel.name}
                <ChevronDown size={12} className={`transition-transform duration-200 ${showModelDropdown ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showModelDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl z-50"
                  >
                    <div className="p-2">
                      {Object.values(TEACHER_MODEL_CONFIG).map(cfg => (
                        <button key={cfg.id} onClick={() => handleModelChange(cfg.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all text-left ${selectedModel === cfg.id ? 'bg-gray-50' : ''}`}
                        >
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                            <cfg.icon size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900">{cfg.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{cfg.subtitle} · {cfg.provider}</p>
                          </div>
                          {selectedModel === cfg.id && (
                            <div className="w-2 h-2 rounded-full bg-gray-900 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                      <p className="text-[10px] text-gray-400 leading-relaxed">Powered by Groq · Cerebras fallback</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* History */}
            <button
              onClick={() => setShowHistory(v => !v)}
              className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'}`}
              title="History"
            >
              <History size={17} />
            </button>

            {/* Clear */}
            <button
              onClick={clearHistory}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-400 transition-all"
              title="Clear history"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0" style={{ overflow: 'hidden' }}>
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && renderChatTab()}
            {activeTab === 'stats' && renderStatsTab()}
            {activeTab === 'history' && renderHistoryTab()}
          </AnimatePresence>
        </div>

        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="w-72 border-r border-gray-200 flex flex-col bg-white shrink-0"
              style={{ overflow: 'hidden' }}
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">History</span>
                  {history.length > 0 && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">{history.length}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={loadHistory}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                    title="Refresh">
                    <RotateCcw size={13} className={historyLoading ? 'animate-spin' : ''} />
                  </button>
                  <button onClick={() => setShowHistory(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all">
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-3 space-y-1" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={20} className="animate-spin text-gray-300" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-16 text-gray-300">
                    <MessageSquare size={28} className="mx-auto mb-3" />
                    <p className="text-xs font-medium">No history yet</p>
                    <p className="text-[10px] mt-1 text-gray-200">Your chats will appear here</p>
                  </div>
                ) : history.map((item, i) => (
                  <motion.button key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => {
                      setMessages([
                        { role: 'user', content: item.prompt },
                        { role: 'assistant', content: item.response, provider: item.model },
                      ]);
                      setShowHistory(false);
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 group"
                  >
                    <p className="text-xs text-gray-700 truncate font-medium group-hover:text-gray-900">{item.prompt}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-[10px] text-gray-300 font-medium">{item.model}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Bottom Bar - Fixed at bottom for all tabs */}
        <div className="border-t border-white/20 bg-white/80 backdrop-blur-xl px-6 py-4 shrink-0 shadow-lg">
          <AnimatedAIInput
            onSend={handleSendMessage}
            placeholder="Ask about teaching, lesson plans, assessments..."
          />
        </div>
      </div>

      {/* Advanced Warning Modal */}
      <AnimatePresence>
        {showAdvancedWarning && (
          <AdvancedWarningModal
            onConfirm={confirmAdvancedModel}
            onCancel={() => setShowAdvancedWarning(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};