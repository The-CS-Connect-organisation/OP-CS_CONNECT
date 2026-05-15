import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, History, Trash2, Info, MessageSquare,
  Bot, BarChart3, Brain, X, RotateCcw
} from 'lucide-react';
import { request } from '../../utils/apiClient';
import { AnimatedAIInput } from '../../components/ui/AnimatedAIInput';

const DISCLAIMER = "CSAI can make mistakes. Verify important information.";

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

/* ── Advanced Warning ── */
const AdvancedWarningModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onCancel}>
    <motion.div
      initial={{ scale: 0.92, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0 }}
      onClick={e => e.stopPropagation()}
      className="bg-white border border-gray-200 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
          <Brain size={18} className="text-amber-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Advanced Model</h3>
          <p className="text-xs text-gray-400">Uses more compute and may take longer.</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-6">
        Deep reasoning models are available. This may consume more quota. Continue?
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-all font-medium">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-violet-100 transition-all">
          Continue
        </button>
      </div>
    </motion.div>
  </div>
);

export const TeacherAILab = ({ user, addToast }) => {
  const [activeTab, setActiveTab] = useState('chat'); // chat, stats, history
  const [chatMessages, setChatMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showAdvWarning, setShowAdvWarning] = useState(false);
  const [pendingModel, setPendingModel] = useState(null);
  const [stats, setStats] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const response = await request('/teacher/ai-stats');
      if (response?.success) setStats(response.stats);
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'stats') loadStats();
  }, [activeTab, loadStats]);

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

  const handleSendChatMessage = async (message, model) => {
    if (!message.trim() || isSending) return;

    // Check if this is an advanced model requiring warning
    const isAdvanced = model.id.includes('qwen-3-235b') || model.id.includes('zai');
    if (isAdvanced) {
      const pModel = { ...model, _pendingMessage: message };
      setPendingModel(pModel);
      setShowAdvWarning(true);
      return;
    }

    await doSend(message, model);
  };

  const doSend = async (message, model) => {
    const userMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setIsSending(true);

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
        setChatMessages(prev => [...prev, {
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
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const confirmAdvancedModel = async () => {
    setShowAdvWarning(false);
    if (pendingModel) {
      await doSend(pendingModel._pendingMessage || '', pendingModel);
    }
    setPendingModel(null);
  };

  const handleHistoryMessageClick = (prompt, response, model) => {
    setChatMessages([{ role: 'user', content: prompt }, { role: 'assistant', content: response, provider: model }]);
    setShowHistory(false);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const formatResponseTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  /* ── Tab Renderers ── */

  const renderChatTab = () => (
    <div className="space-y-4">
      <div className="h-[450px] overflow-y-auto rounded-xl border p-4 space-y-4"
        style={{ background: 'var(--bg-surface, #fafafa)' }}>
        {chatMessages.length === 0 && !isSending && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className={`p-4 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white mb-4 shadow-lg`}>
              <Bot size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome to Teacher AI Lab</h2>
            <p className="text-gray-500 max-w-sm mb-1">
              Ask about lesson planning, student assessment, curriculum design, and more.
            </p>
            <p className="text-[11px] text-gray-400 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100/50">
              {DISCLAIMER}
            </p>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
              msg.role === 'user'
                ? 'bg-gray-900 text-white rounded-br-sm'
                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.role === 'assistant' ? (
                <MsgContent text={msg.content} />
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
              {msg.provider && (
                <p className="text-[10px] mt-1 flex items-center gap-1 ${msg.role === 'user' ? 'text-gray-300' : 'text-gray-400'}">
                  <Bot size={10} /> via {msg.provider}
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {isSending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2 text-gray-500 shadow-sm">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Generating...</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={MessageSquare} label="AI Sessions" value={stats?.totalSessions?.toLocaleString() || '—'} gradient="from-blue-500 to-sky-400" color="#3b82f6" />
        <StatCard icon={Send} label="Messages Sent" value={stats?.totalMessages?.toLocaleString() || '—'} gradient="from-emerald-500 to-teal-500" color="#10b981" />
        <StatCard icon={Zap} label="Avg Response" value={stats?.avgResponseTime ? formatResponseTime(stats.avgResponseTime) : '—'} gradient="from-violet-500 to-purple-500" color="#8b5cf6" />
        <StatCard icon={Brain} label="Accuracy" value={stats?.accuracy ? `${stats.accuracy}%` : '—'} gradient="from-amber-500 to-orange-500" color="#f59e0b" />
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <motion.div
      key="history"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {history.length === 0 ? (
        <div className="py-8 text-center">
          <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm text-gray-400">No AI history yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => handleHistoryMessageClick(item.prompt, item.response, item.model)}
              className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 group"
            >
              <p className="text-sm text-gray-800 truncate font-medium group-hover:text-gray-900">{item.prompt}</p>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                <p className="text-[10px] text-gray-400 font-medium">via {item.model}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );

  /* ── Main Render ── */
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-400 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-violet-400 blur-[80px]" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 border-b border-white/30 bg-white/70 backdrop-blur-xl px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-md">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Teacher AI Lab</h1>
              <p className="text-[10px] text-gray-400">Powered by Groq · Cerebras</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(v => !v)}
              className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
              title="History">
              <History size={17} />
            </button>
            <button onClick={clearChat}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-400 transition-all"
              title="Clear chat">
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
              style={{ overflow: 'hidden' }}>
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
                    transition={{ delay: i * 0.02 }}
                    onClick={() => handleHistoryMessageClick(item.prompt, item.response, item.model)}
                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 group">
                    <p className="text-xs text-gray-700 truncate font-medium group-hover:text-gray-900">{item.prompt}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-[10px] text-gray-300 font-medium">via {item.model}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Bottom Bar - Shared AnimatedAIInput across all tabs */}
        <div className="border-t border-white/30 bg-white/70 backdrop-blur-xl px-6 py-4 shrink-0 shadow-lg">
          <AnimatedAIInput
            onSend={handleSendChatMessage}
            placeholder={
              activeTab === 'chat' ? 'Ask about teaching, lesson plans, assessments...'
                : activeTab === 'stats' ? 'Type your message...'
                  : 'Type your message...'
            }
          />
        </div>
      </div>

      {/* Advanced Model Warning */}
      <AnimatePresence>
        {showAdvWarning && (
          <AdvancedWarningModal
            onConfirm={confirmAdvancedModel}
            onCancel={() => { setShowAdvWarning(false); setPendingModel(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};