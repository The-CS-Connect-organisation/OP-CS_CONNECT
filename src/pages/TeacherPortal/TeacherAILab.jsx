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

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const data = await request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: newMessages.map(x => ({ role: x.role, content: x.content })), mode: selectedModel }),
      });
      if (data?.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer, provider: data.provider }]);
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      addToast?.('CSAI is unavailable. Try again shortly.', 'error');
      setMessages(prev => prev.slice(0, -1));
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
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
        <motion.div className="absolute w-[500px] h-[500px] rounded-full bg-blue-100 blur-[120px] opacity-30"
          animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '-20%', right: '-10%' }}
        />
        <motion.div className="absolute w-[400px] h-[400px] rounded-full bg-violet-100 blur-[120px] opacity-20"
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{ bottom: '-15%', left: '-5%' }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/20 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentModel.gradient} text-white shadow-lg shadow-indigo-100`}>
            <CurrentIcon size={20} />
          </div>
          <div>
            <h1 className="font-black text-gray-900 tracking-tight">Teacher AI Lab</h1>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Cerebras · {currentModel.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-bold shadow-sm ${currentModel.pill}`}
            >
              <motion.div className="w-2 h-2 rounded-full bg-current"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <CurrentIcon size={13} />
              {currentModel.name}
              <ChevronDown size={14} className={`transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showModelDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl z-50 min-w-52"
                >
                  <div className="p-2">
                    {Object.values(MODEL_CONFIG).map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelChange(model.id)}
                        className={`w-full text-left px-3 py-3 rounded-xl hover:bg-gray-50 transition-all ${
                          selectedModel === model.id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${model.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                            <model.icon size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{model.name}</p>
                            <p className="text-[10px] text-gray-400">{model.subtitle} · {model.provider}</p>
                          </div>
                          {selectedModel === model.id && (
                            <div className="w-2 h-2 rounded-full bg-gray-900 ml-auto shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                    <p className="text-[10px] text-gray-400 leading-relaxed">Powered by Cerebras · Groq fallback</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear History */}
          <button
            onClick={clearHistory}
            className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
            title="Clear history"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <motion.div className="relative mb-6"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className={`absolute w-24 h-24 rounded-full bg-gradient-to-br ${currentModel.gradient} blur-2xl opacity-15`} />
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentModel.gradient} flex items-center justify-center shadow-xl`}>
                  <Brain size={28} className="text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">What can I help with?</h2>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                Lesson planning, student assessment, curriculum design, and teaching strategies.
              </p>
              <div className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold shadow-sm ${currentModel.pill}`}>
                <CurrentIcon size={12} />
                {currentModel.name} · {currentModel.subtitle}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'user' ? (
                    <div className="max-w-[75%]">
                      <div className={`px-4 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-br ${currentModel.gradient} text-white shadow-md`}>
                        <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%] flex gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${currentModel.gradient} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
                        <CurrentIcon size={15} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                          <MsgContent text={msg.content} />
                        </div>
                        {msg.provider && (
                          <p className="text-[10px] text-gray-400 mt-1.5 px-1 font-medium">via {msg.provider}</p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${currentModel.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                    <CurrentIcon size={15} className="text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                    {[0, 1, 2].map(d => (
                      <motion.div key={d} className="w-2 h-2 rounded-full bg-gray-300"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: d * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 border-t border-gray-100 bg-white/90 backdrop-blur-xl px-6 py-4 shadow-lg">
        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto">
          <div className={`flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 shadow-sm transition-all focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 ${currentModel.ring || 'focus-within:ring-blue-50'}`}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
              }}
              placeholder={`Message ${currentModel.name}...`}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 resize-none leading-relaxed"
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
            <motion.button
              type="submit"
              disabled={loading || !input.trim()}
              whileTap={input.trim() && !loading ? { scale: 0.92 } : {}}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${input.trim() && !loading ? `bg-gradient-to-br ${currentModel.sendBg} text-white shadow-md hover:opacity-90` : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1.5">
            <Info size={10} /> {DISCLAIMER}
          </p>
        </form>
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
