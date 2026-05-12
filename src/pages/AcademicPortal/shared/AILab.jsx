import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, History, Trash2, Info, MessageSquare,
  Zap, Brain, AlertTriangle, X, ChevronDown, RotateCcw, Paperclip, FileText, ImageIcon,
  Sun, Moon, LayoutDashboard, Bot, Sparkles
} from 'lucide-react';
import { request } from '../../../utils/apiClient';
import { AnimatedAIChat } from '../../../components/ui/AnimatedAIChat';
import { AgentPlan } from '../../../components/ui/AgentPlan';
import { AIPromptBar } from '../../../components/ui/AIPromptBar';
import { cn } from '@/lib/utils';


const DISCLAIMER = "CSAI can make mistakes. Verify important information.";


const MODEL_CONFIG = {
  balanced: {
    id: 'balanced',
    name: 'CS v2',
    subtitle: 'Fast & Efficient',
    provider: 'Cerebras',
    icon: Zap,
    gradient: 'from-blue-500 to-sky-400',
    pill: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    dot: 'bg-blue-500',
    sendBg: 'from-blue-500 to-sky-400',
  },
  advanced: {
    id: 'advanced',
    name: 'Qwen-3 235B',
    subtitle: 'Deep Reasoning',
    provider: 'Cerebras',
    icon: Brain,
    gradient: 'from-violet-600 to-purple-500',
    pill: 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
    dot: 'bg-violet-500',
    sendBg: 'from-violet-600 to-purple-500',
  },
  "o3-mini": {
    id: 'o3-mini',
    name: 'o3-mini',
    subtitle: 'Fast Reasoning',
    provider: 'OpenAI',
    icon: Brain,
    gradient: 'from-green-500 to-emerald-400',
    pill: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    dot: 'bg-green-500',
    sendBg: 'from-green-500 to-emerald-400',
  },
  "GPT-4.1 Mini": {
    id: 'GPT-4.1 Mini',
    name: 'GPT-4.1 Mini',
    subtitle: 'Fast & Capable',
    provider: 'OpenAI',
    icon: Zap,
    gradient: 'from-blue-500 to-indigo-400',
    pill: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    dot: 'bg-blue-500',
    sendBg: 'from-blue-500 to-indigo-400',
  },
  "Claude 3.5 Sonnet": {
    id: 'Claude 3.5 Sonnet',
    name: 'Claude 3.5',
    subtitle: 'Deep Reasoning',
    provider: 'Anthropic',
    icon: Brain,
    gradient: 'from-orange-500 to-amber-400',
    pill: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    dot: 'bg-orange-500',
    sendBg: 'from-orange-500 to-amber-400',
  },
  "Gemini 2.5 Flash": {
    id: 'Gemini 2.5 Flash',
    name: 'Gemini 2.5',
    subtitle: 'Fast & Multimodal',
    provider: 'Google',
    icon: Sparkles,
    gradient: 'from-cyan-500 to-blue-400',
    pill: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
    dot: 'bg-cyan-500',
    sendBg: 'from-cyan-500 to-blue-400',
  },
};


const MsgContent = ({ text }) => {
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-2">
      {blocks.map((block, bi) => {
        if (block.startsWith('```')) {
          const code = block.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
          return (
            <pre className="bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-3 text-xs font-mono overflow-x-auto text-gray-800 dark:text-gray-200 leading-relaxed">
              {code}
            </pre>
          );
        }
        return (
          <p className="leading-relaxed">
            {block.split('\n').map((line, li) => {
              const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
              return (
                <span key={li}>
                  {parts.map((p, pi) => {
                    if (p.startsWith('`') && p.endsWith('`'))
                      return <code key={pi} className="bg-gray-100 dark:bg-zinc-800 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-zinc-700">{p.slice(1, -1)}</code>;
                    if (p.startsWith('**') && p.endsWith('**'))
                      return <strong key={pi} className="font-semibold text-gray-900 dark:text-gray-100">{p.slice(2, -2)}</strong>;
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


const AdvancedWarningModal = ({ onConfirm, onCancel }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm"
    onClick={onCancel}
  >
    <motion.div initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0 }}
      onClick={e => e.stopPropagation()}
      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
          <AlertTriangle size={18} className="text-amber-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Advanced Mode</h3>
          <p className="text-xs text-gray-400">School-funded resource</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
        Advanced mode runs a significantly larger model funded by the school. Please use it responsibly — only when deeper reasoning is genuinely needed.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-2xl border border-gray-200 dark:border-zinc-700 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all font-medium">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-violet-100 dark:shadow-violet-900/30 transition-all">
          I understand
        </button>
      </div>
    </motion.div>
  </motion.div>
);


export const AILab = ({ user, addToast }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GPT-4.1 Mini');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showAdvancedWarning, setShowAdvancedWarning] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [theme, setTheme] = useState('dark');
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);

  const isDark = theme === 'dark';
  const m = MODEL_CONFIG[selectedModel] || MODEL_CONFIG.balanced;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);


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


  const handleModelChange = (model) => {
    setShowModelMenu(false);
    setSelectedModel(model);
  };


  const handleSend = async (message) => {
    const incomingContent = message || input;
    if (!incomingContent.trim() && attachments.length === 0 || loading) return;
    let content = incomingContent.trim();
    if (attachments.length > 0) {
      const fileNames = attachments.map(f => f.name).join(', ');
      content = content ? `${content}\n\n[Attached: ${fileNames}]` : `[Attached: ${fileNames}]`;
    }
    const userMsg = { role: 'user', content, attachments: [...attachments] };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setAttachments([]);
    setLoading(true);
    try {
      const data = await request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: newMessages.map(x => ({ role: x.role, content: x.content })),
          model: selectedModel,
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
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };


  const panelBg = isDark ? "bg-zinc-950" : "bg-gray-50";
  const cardBg = isDark ? "bg-zinc-900/50 border-white/5" : "bg-white border-gray-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-white/70" : "text-gray-600";
  const textMuted = isDark ? "text-white/40" : "text-gray-400";
  const borderColor = isDark ? "border-white/5" : "border-gray-200";
  const inputBg = isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/8" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400";


  if (showSplash) {
    return (
      <div className={cn("flex", panelBg)} style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        <div className="flex-1 flex flex-col">
          <AIBar
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            showModelMenu={showModelMenu}
            setShowModelMenu={setShowModelMenu}
            theme={theme}
            setTheme={setTheme}
            showPlan={showPlan}
            setShowPlan={setShowPlan}
            isDark={isDark}
            MODEL_CONFIG={MODEL_CONFIG}
          />
          <div className="flex-1">
            <AnimatedAIChat theme={theme} />
          </div>
        </div>
        <button
          onClick={() => setShowSplash(false)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 text-white text-sm font-bold shadow-xl hover:opacity-90 transition-opacity"
        >
          Enter CS AI Lab
        </button>
      </div>
    );
  }


  return (
    <div className={cn("flex", panelBg)} style={{ height: 'calc(100vh - 64px)', overflow: 'hidden', maxWidth: '100vw' }}>
      <AnimatePresence>
        {showAdvancedWarning && (
          <AdvancedWarningModal
            onConfirm={() => { setSelectedModel('advanced'); setShowAdvancedWarning(false); }}
            onCancel={() => setShowAdvancedWarning(false)}
          />
        )}
      </AnimatePresence>


      {/* History sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className={cn("w-72 border-r flex flex-col shrink-0", cardBg, borderColor)}
            style={{ overflow: 'hidden' }}
          >
            <div className={cn("p-4 border-b flex items-center justify-between shrink-0", borderColor)}>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-bold uppercase tracking-widest", textSecondary)}>History</span>
                {history.length > 0 && (
                  <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-semibold">{history.length}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={loadHistory}
                  className={cn("p-1.5 rounded-lg hover:bg-white/10 transition-all", textSecondary)}>
                  <RotateCcw size={13} className={historyLoading ? 'animate-spin' : ''} />
                </button>
                <button onClick={() => setShowHistory(false)}
                  className={cn("p-1.5 rounded-lg hover:bg-white/10 transition-all", textSecondary)}>
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-3 space-y-1" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
              {historyLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={20} className="animate-spin text-white/20" />
                </div>
              ) : history.length === 0 ? (
                <div className={cn("text-center py-16", textMuted)}>
                  <MessageSquare size={28} className="mx-auto mb-3 opacity-40" />
                  <p className="text-xs font-medium">No history yet</p>
                  <p className="text-[10px] mt-1 opacity-60">Your chats will appear here</p>
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
                  className={cn(
                    "w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10 group"
                  )}
                >
                  <p className={cn("text-xs truncate font-medium group-hover:text-white/90", textSecondary)}>{item.prompt}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={cn("text-[10px]", textMuted)}>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p className={cn("text-[10px] font-medium", textMuted)}>{item.model}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>


      {/* Plan sidebar */}
      <AnimatePresence>
        {showPlan && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className={cn("border-r flex flex-col shrink-0 overflow-hidden", cardBg, borderColor)}
          >
            <div className={cn("p-4 border-b flex items-center justify-between shrink-0", borderColor)}>
              <span className={cn("text-xs font-bold uppercase tracking-widest", textSecondary)}>AI Plan</span>
              <button onClick={() => setShowPlan(false)}
                className={cn("p-1.5 rounded-lg hover:bg-white/10 transition-all", textSecondary)}>
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AgentPlan theme={theme} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>


      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0" style={{ overflow: 'hidden' }}>

        {/* Top bar */}
        <div className={cn("h-14 border-b flex items-center justify-between px-5 shrink-0 backdrop-blur-xl shadow-sm", cardBg, borderColor)}>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(v => !v)}
              className={cn("p-2 rounded-xl transition-all", showHistory ? 'bg-white/10 text-white/90' : 'hover:bg-white/10 text-white/40 hover:text-white/70')}>
              <History size={17} />
            </button>
            <button onClick={() => setShowPlan(v => !v)}
              className={cn("p-2 rounded-xl transition-all", showPlan ? 'bg-white/10 text-white/90' : 'hover:bg-white/10 text-white/40 hover:text-white/70')}>
              <LayoutDashboard size={17} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <span className={cn("font-black tracking-tight text-lg leading-none", textPrimary)}>
                CS<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">AI</span>
              </span>
              <span className={cn("text-[9px] uppercase tracking-[0.2em] font-semibold hidden sm:block", textMuted)}>AI Studio</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model selector */}
            <div className="relative" onMouseDown={e => e.stopPropagation()}>
              <button onClick={() => setShowModelMenu(v => !v)}
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm", m.pill)}>
                <motion.div className={cn("w-1.5 h-1.5 rounded-full", m.dot)}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <m.icon size={13} />
                {m.name}
                <ChevronDown size={12} className="transition-transform duration-200" />
              </button>
              <AnimatePresence>
                {showModelMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={cn("absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden shadow-2xl z-50", cardBg, borderColor)}
                  >
                    <div className="p-2">
                      {Object.values(MODEL_CONFIG).map(cfg => (
                        <button key={cfg.id} onClick={() => handleModelChange(cfg.id)}
                          className={cn("w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all text-left", selectedModel === cfg.id ? 'bg-white/5' : '')}
                        >
                          <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm", cfg.gradient)}>
                            <cfg.icon size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-bold", textPrimary)}>{cfg.name}</p>
                            <p className={cn("text-[10px]", textMuted)}>{cfg.subtitle} · {cfg.provider}</p>
                          </div>
                          {selectedModel === cfg.id && (
                            <div className="w-2 h-2 rounded-full bg-white shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className={cn("px-4 py-2.5 border-t bg-black/20", borderColor)}>
                      <p className="text-[10px] text-white/40 leading-relaxed">Powered by Cerebras · Groq fallback</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white/70 transition-all">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button onClick={() => setMessages([])}
              className="p-2 rounded-xl hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"
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
                    className={cn("absolute w-36 h-36 rounded-full blur-3xl opacity-15", `bg-gradient-to-br ${m.gradient}`)}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl">
                    <Bot size={40} className="text-white" />
                  </div>
                </motion.div>
                <h2 className={cn("text-2xl font-black mb-2 tracking-tight", textPrimary)}>What can I help with?</h2>
                <p className={cn("text-sm max-w-xs leading-relaxed", textMuted)}>
                  Ask me anything — academics, concepts, planning, or analysis.
                </p>
                <div className={cn("mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold shadow-sm", m.pill)}>
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
                className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-[75%]">
                    {msg.attachments?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2 justify-end">
                        {msg.attachments.map((f, i) => (
                          <div key={i} className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs", isDark ? "bg-white/10 text-white/70" : "bg-gray-800 text-gray-300")}>
                            {f.type?.startsWith('image/') ? <ImageIcon size={11} /> : <FileText size={11} />}
                            <span className="max-w-[100px] truncate">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={cn("px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed font-medium shadow-sm",
                      isDark ? "bg-white text-gray-900" : "bg-gray-900 text-white"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[85%] flex gap-3">
                    <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 mt-0.5 shadow-sm", m.gradient)}>
                      <m.icon size={15} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm", cardBg)}>
                        <MsgContent text={msg.content} />
                      </div>
                      {msg.provider && (
                        <p className={cn("text-[10px] mt-1.5 px-1 font-medium", textMuted)}>via {msg.provider}</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm", m.gradient)}>
                  <m.icon size={15} className="text-white" />
                </div>
                <div className={cn("px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5", cardBg)}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className={cn("w-2 h-2 rounded-full", isDark ? "bg-white/30" : "bg-gray-400")}
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
        <div className={cn("px-4 py-4 border-t shrink-0", cardBg, borderColor)}>
          <div className="max-w-2xl mx-auto">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attachments.map((file, i) => (
                  <div key={i} className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border", inputBg)}>
                    {file.type.startsWith('image/') ? <ImageIcon size={12} className="text-blue-500" /> : <FileText size={12} className="text-violet-500" />}
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                      className="text-white/40 hover:text-red-400 transition-colors ml-1">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <AIPromptBar
              value={input}
              onChange={setInput}
              onSend={handleSend}
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              theme={theme}
            />
            <div className={cn("flex items-center gap-1.5 mt-2 justify-center", textMuted)}>
              <Info size={10} />
              <p className="text-[10px]">{DISCLAIMER}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Mini top bar for splash state
function AIBar({ selectedModel, onModelChange, showModelMenu, setShowModelMenu, theme, setTheme, showPlan, setShowPlan, isDark, MODEL_CONFIG }) {
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-white/70" : "text-gray-600";
  const textMuted = isDark ? "text-white/40" : "text-gray-400";
  const cardBg = isDark ? "bg-zinc-900/50 border-white/5" : "bg-white border-gray-200";
  const m = MODEL_CONFIG[selectedModel] || MODEL_CONFIG.balanced;

  return (
    <div className={cn("h-14 border-b flex items-center justify-between px-5 shrink-0 backdrop-blur-xl shadow-sm", cardBg, isDark ? "border-white/5" : "border-gray-200")}>
      <div className="flex items-center gap-3">
        <button onClick={() => setShowPlan(v => !v)}
          className={cn("p-2 rounded-xl transition-all", showPlan ? 'bg-white/10 text-white/90' : 'hover:bg-white/10 text-white/40 hover:text-white/70')}>
          <LayoutDashboard size={17} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <span className={cn("font-black tracking-tight text-lg leading-none", textPrimary)}>
            CS<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">AI</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white/70 transition-all">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}
