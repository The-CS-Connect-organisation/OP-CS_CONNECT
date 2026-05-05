import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, History, Trash2, Info, MessageSquare,
  Zap, Brain, AlertTriangle, X, ChevronDown, RotateCcw, Paperclip, FileText, ImageIcon
} from 'lucide-react';
import { request } from '../../utils/apiClient';

const DISCLAIMER = "CSAI can make mistakes. Verify important information.";

const MODEL_CONFIG = {
  balanced: {
    id: 'balanced',
    name: 'CS v2',
    subtitle: 'Fast & Efficient',
    provider: 'Cerebras',
    icon: Zap,
    gradient: 'from-blue-500 to-sky-400',
    pill: 'bg-blue-50 text-blue-600 border-blue-200',
    dot: 'bg-blue-500',
    ring: 'focus-within:ring-blue-100',
    sendBg: 'from-blue-500 to-sky-400',
  },
  advanced: {
    id: 'advanced',
    name: 'Qwen-3 235B',
    subtitle: 'Deep Reasoning',
    provider: 'Cerebras',
    icon: Brain,
    gradient: 'from-violet-600 to-purple-500',
    pill: 'bg-violet-50 text-violet-600 border-violet-200',
    dot: 'bg-violet-500',
    ring: 'focus-within:ring-violet-100',
    sendBg: 'from-violet-600 to-purple-500',
  },
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

export const TeacherAILab = ({ user, addToast }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('balanced');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showAdvancedWarning, setShowAdvancedWarning] = useState(false);
  const [pendingModel, setPendingModel] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleModelChange = (modelId) => {
    if (modelId === 'advanced' && selectedModel !== 'advanced') {
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await request('/school/ai-chat', {
        method: 'POST',
        body: JSON.stringify({
          message: input,
          model: selectedModel,
          context: 'teacher',
        }),
      });

      const assistantMessage = {
        role: 'assistant',
        content: response?.message || 'No response received',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      addToast?.('Failed to get AI response', 'error');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
  };

  const currentModel = MODEL_CONFIG[selectedModel];
  const CurrentIcon = currentModel.icon;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </div>

      {/* Header */}
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
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${currentModel.pill}`}
              >
                <span className="text-xs font-semibold">{currentModel.name}</span>
                <ChevronDown size={14} />
              </button>

              <AnimatePresence>
                {showModelDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48"
                  >
                    {Object.values(MODEL_CONFIG).map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelChange(model.id)}
                        className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                          selectedModel === model.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <model.icon size={16} className={selectedModel === model.id ? 'text-blue-600' : 'text-gray-400'} />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{model.name}</p>
                            <p className="text-xs text-gray-500">{model.subtitle}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear History */}
            <button
              onClick={clearHistory}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              title="Clear history"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentModel.gradient} text-white mb-4`}>
              <Brain size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Teacher AI Lab</h2>
            <p className="text-gray-600 max-w-sm mb-4">
              Ask questions about lesson planning, student assessment, curriculum design, and more.
            </p>
            <div className="text-xs text-gray-500 bg-white/50 px-3 py-2 rounded-lg">
              {DISCLAIMER}
            </div>
          </div>
        ) : (
          <>
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-gray-600">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="relative z-10 border-t border-white/20 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about teaching..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`px-6 py-3 rounded-xl font-semibold text-white transition-all flex items-center gap-2 bg-gradient-to-br ${currentModel.sendBg} disabled:opacity-50 hover:shadow-lg`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">{DISCLAIMER}</p>
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
