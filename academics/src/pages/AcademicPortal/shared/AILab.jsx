import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Loader2, History, Trash2, Info, MessageSquare,
  Zap, Brain, AlertTriangle, X, ChevronDown, RotateCcw, Paperclip, FileText, ImageIcon
} from 'lucide-react';
import { request } from '../../../utils/apiClient';

const DISCLAIMER = "CSAI can make mistakes. Verify important information.";

const MODEL_CONFIG = {
  balanced: {
    id: 'balanced',
    name: 'Llama 3.1',
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

/* ── Markdown renderer using react-markdown ── */
const MsgContent = ({ text }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ inline, children }) {
        return inline
          ? <code className="bg-gray-100 text-violet-600 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-200">{children}</code>
          : <pre className="bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs font-mono overflow-x-auto text-gray-800 leading-relaxed my-2"><code>{children}</code></pre>;
      },
      p({ children }) { return <p className="leading-relaxed mb-1 last:mb-0">{children}</p>; },
      strong({ children }) { return <strong className="font-semibold text-gray-900">{children}</strong>; },
      ul({ children }) { return <ul className="list-disc list-inside space-y-1 my-1">{children}</ul>; },
      ol({ children }) { return <ol className="list-decimal list-inside space-y-1 my-1">{children}</ol>; },
      li({ children }) { return <li className="text-gray-700">{children}</li>; },
    }}
  >
    {text}
  </ReactMarkdown>
);

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
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm"
    onClick={onCancel}
  >
    <motion.div initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0 }}
      onClick={e => e.stopPropagation()}
      className="bg-white border border-gray-200 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
          <AlertTriangle size={18} className="text-amber-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Advanced Mode</h3>
          <p className="text-xs text-gray-400">School-funded resource</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-6">
        Advanced mode runs a significantly larger model funded by the school. Please use it responsibly — only when deeper reasoning is genuinely needed.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-all font-medium">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-violet-100 transition-all">
          I understand
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ── Splash ── */
const SplashScreen = ({ onEnter }) => (
  <motion.div
    className="fixed inset-0 z-[100] flex items-center justify-center"
    style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #fafafa 45%, #f5f0ff 100%)' }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
  >
    {/* Background blobs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div className="absolute w-[700px] h-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', top: '-20%', left: '-15%' }}
        animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div className="absolute w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', bottom: '-15%', right: '-10%' }}
        animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '48px 48px' }}
      />
    </div>

    <div className="relative flex flex-col items-center text-center px-6 w-full max-w-lg">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 relative"
      >
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', width: '160px', height: '160px', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Cornerstone School"
          className="relative w-28 h-28 object-contain drop-shadow-2xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* CSAI */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-2"
      >
        <h1 className="text-8xl font-black tracking-tighter leading-none select-none"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CSAI
        </h1>
      </motion.div>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="text-[11px] text-gray-400 tracking-[0.35em] uppercase font-semibold mb-8"
      >
        Cornerstone School · AI Studio
      </motion.p>

      {/* Model cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.6 }}
        className="flex gap-3 mb-10"
      >
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-blue-100 shadow-sm shadow-blue-100/50">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-gray-800">Llama 3.1</p>
            <p className="text-[9px] text-gray-400">Balanced</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-violet-100 shadow-sm shadow-violet-100/50">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center">
            <Brain size={12} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-gray-800">Qwen-3 235B</p>
            <p className="text-[9px] text-gray-400">Advanced</p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        onClick={onEnter}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(99,102,241,0.3)' }}
        whileTap={{ scale: 0.97 }}
        className="px-14 py-4 rounded-2xl text-white text-sm font-bold tracking-wide transition-all"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 8px 32px rgba(99,102,241,0.25)' }}
      >
        Enter Lab
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="text-[10px] text-gray-300 mt-5 tracking-widest uppercase"
      >
        Designed &amp; run by CSTians
      </motion.p>
    </div>
  </motion.div>
);

/* ── Main component ── */
export const AILab = ({ user, addToast }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('balanced');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showAdvancedWarning, setShowAdvancedWarning] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const m = MODEL_CONFIG[mode];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Close model menu on outside click
  useEffect(() => {
    if (!showModelMenu) return;
    const handler = () => setShowModelMenu(false);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showModelMenu]);

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

  const handleModeSelect = (id) => {
    setShowModelMenu(false);
    if (id === 'advanced' && mode !== 'advanced') {
      setShowAdvancedWarning(true);
    } else {
      setMode(id);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || loading) return;
    let content = input.trim();
    if (attachments.length > 0) {
      const fileNames = attachments.map(f => f.name).join(', ');
      content = content ? `${content}\n\n[Attached: ${fileNames}]` : `[Attached: ${fileNames}]`;
    }
    const userMsg = { role: 'user', content, attachments: [...attachments] };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
    setLoading(true);
    try {
      const data = await request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: newMessages.map(x => ({ role: x.role, content: x.content })),
          mode,
        }),
      });
      if (data?.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer,
          provider: data.provider,
        }]);
      }
    } catch (e) {
      addToast?.(e.message || 'CSAI is unavailable. Try again shortly.', 'error');
      setMessages(prev => prev.slice(0, -1)); // remove optimistic user msg on error
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  if (showSplash) {
    return (
      <AnimatePresence mode="wait">
        <SplashScreen key="splash" onEnter={() => setShowSplash(false)} />
      </AnimatePresence>
    );
  }

  return (
    <div className="flex bg-gray-50" style={{ height: '100%', overflow: 'hidden', width: '100%' }}>
      <AnimatePresence>
        {showAdvancedWarning && (
          <AdvancedWarningModal
            onConfirm={() => { setMode('advanced'); setShowAdvancedWarning(false); }}
            onCancel={() => setShowAdvancedWarning(false)}
          />
        )}
      </AnimatePresence>

      {/* ── History sidebar ── */}
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

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ overflow: 'hidden' }}>

        {/* Top bar */}
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-5 shrink-0 bg-white/90 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(v => !v)}
              className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'}`}>
              <History size={17} />
            </button>
            <div className="flex items-center gap-2.5">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CS" className="w-7 h-7 object-contain" />
              <span className="font-black text-gray-900 tracking-tight text-lg leading-none">
                CS<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-600">AI</span>
              </span>
              <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-semibold hidden sm:block">AI Studio</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model selector */}
            <div className="relative" onMouseDown={e => e.stopPropagation()}>
              <button onClick={() => setShowModelMenu(v => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${m.pill}`}>
                <motion.div className={`w-1.5 h-1.5 rounded-full ${m.dot}`}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <m.icon size={13} />
                {m.name}
                <ChevronDown size={12} className={`transition-transform duration-200 ${showModelMenu ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showModelMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl z-50"
                  >
                    <div className="p-2">
                      {Object.values(MODEL_CONFIG).map(cfg => (
                        <button key={cfg.id} onClick={() => handleModeSelect(cfg.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all text-left ${mode === cfg.id ? 'bg-gray-50' : ''}`}
                        >
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                            <cfg.icon size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900">{cfg.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{cfg.subtitle} · {cfg.provider}</p>
                          </div>
                          {mode === cfg.id && (
                            <div className="w-2 h-2 rounded-full bg-gray-900 shrink-0" />
                          )}
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

            <button onClick={() => setMessages([])}
              className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
              title="Clear chat">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-8" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center pt-16 pb-20"
              >
                <motion.div className="relative mb-6 flex items-center justify-center"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <motion.div
                    className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${m.gradient} blur-3xl opacity-15`}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CSAI" className="relative w-28 h-28 object-contain drop-shadow-xl" />
                </motion.div>
                <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">What can I help with?</h2>
                <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                  Ask me anything — academics, concepts, planning, or analysis.
                </p>
                <div className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold shadow-sm ${m.pill}`}>
                  <m.icon size={12} />
                  {m.name} · {m.subtitle}
                </div>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-[75%]">
                    {msg.attachments?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2 justify-end">
                        {msg.attachments.map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-300">
                            {f.type?.startsWith('image/') ? <ImageIcon size={11} /> : <FileText size={11} />}
                            <span className="max-w-[100px] truncate">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed font-medium shadow-sm">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[85%] flex gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
                      <m.icon size={15} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-gray-800 shadow-sm">
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
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                  <m.icon size={15} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-gray-300"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-gray-200 bg-white/90 backdrop-blur-xl shrink-0">
          <div className="max-w-2xl mx-auto">
            {/* Attachment previews */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700 font-medium">
                    {file.type.startsWith('image/') ? <ImageIcon size={12} className="text-blue-500" /> : <FileText size={12} className="text-violet-500" />}
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                      className="text-gray-400 hover:text-red-400 transition-colors ml-1">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className={`flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-3 shadow-sm transition-all ${m.ring} focus-within:ring-4 focus-within:border-gray-300`}>
              {/* Attach button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shrink-0 mb-0.5"
                title="Attach file"
              >
                <Paperclip size={17} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  setAttachments(prev => [...prev, ...files].slice(0, 5));
                  e.target.value = '';
                }}
              />
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder={`Message ${m.name}...`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none resize-none leading-relaxed"
                style={{ minHeight: '24px', maxHeight: '160px' }}
              />
              <motion.button
                onClick={handleSend}
                disabled={loading || (!input.trim() && attachments.length === 0)}
                whileTap={(input.trim() || attachments.length > 0) && !loading ? { scale: 0.92 } : {}}
                className={`p-2.5 rounded-xl transition-all shrink-0 mb-0.5 ${(input.trim() || attachments.length > 0) && !loading
                  ? `bg-gradient-to-br ${m.sendBg} text-white shadow-md hover:opacity-90`
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </motion.button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1.5">
              <Info size={10} />
              {DISCLAIMER}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


