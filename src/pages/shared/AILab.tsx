import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import { api, apiFetch } from "@/lib/api";
import {
  Send, Loader2, Sparkles, Brain, Zap, RotateCcw,
  Trash2, MessageSquare, ChevronDown, X, History,
  AlertTriangle, Bot, User, Paperclip, FileText, Copy, Check
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  model?: string;
  provider?: string;
  attachments?: { name: string; type: string }[];
}

const MODEL_CONFIG: Record<string, { id: string; name: string; subtitle: string; provider: string; icon: React.ElementType; gradient: string; pill: string; dot: string }> = {
  gemini: { id: "gemini", name: "Gemini Flash", subtitle: "Fast & Smart", provider: "Google", icon: Zap, gradient: "from-orange-500 to-amber-400", pill: "bg-orange-50 text-orange-600 border-orange-200", dot: "bg-orange-500" },
  "gpt-oss-120b": { id: "gpt-oss-120b", name: "GPT-OSS 120B", subtitle: "Powerful", provider: "Cerebras", icon: Brain, gradient: "from-orange-600 to-amber-500", pill: "bg-orange-50 text-orange-600 border-violet-200", dot: "bg-orange-500" },
  "llama-3.3-70b": { id: "llama-3.3-70b", name: "Llama 3.3 70B", subtitle: "Versatile", provider: "Groq", icon: Sparkles, gradient: "from-emerald-500 to-teal-400", pill: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
  "qwen-3-235b": { id: "qwen-3-235b", name: "Qwen 3 235B", subtitle: "Deep Reasoning", provider: "Cerebras", icon: Brain, gradient: "from-orange-500 to-amber-400", pill: "bg-orange-50 text-orange-600 border-orange-200", dot: "bg-orange-500" },
  compound: { id: "compound", name: "Groq Compound", subtitle: "Agentic", provider: "Groq", icon: Sparkles, gradient: "from-rose-500 to-pink-400", pill: "bg-rose-50 text-rose-600 border-rose-200", dot: "bg-rose-500" },
};

const SYSTEM_PROMPTS: Record<string, string> = {
  student: "You are CSAI, an AI learning assistant for students at Cornerstone International School. Help with academics, study plans, doubt resolution, and homework. Be encouraging and educational. Use markdown formatting.",
  teacher: "You are CSAI, an AI teaching assistant for teachers at Cornerstone International School. Help with lesson planning, grading rubrics, student assessment, and pedagogical strategies. Be professional and thorough.",
  admin: "You are CSAI, an AI administrative assistant for Cornerstone International School. Help with school management, analytics interpretation, policy drafting, and operational efficiency. Be analytical and precise.",
  parent: "You are CSAI, an AI assistant for parents at Cornerstone International School. Help understand child progress, school policies, and provide guidance on supporting learning at home. Be supportive and informative.",
  default: "You are CSAI, an AI assistant for Cornerstone International School. Help with any queries related to education, school operations, and learning. Be helpful and professional.",
};

const MsgContent = ({ text }: { text: string }) => {
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-2">
      {blocks.map((block, bi) => {
        if (block.startsWith("```")) {
          const code = block.replace(/^```[^\n]*\n?/, "").replace(/```$/, "");
          return <pre key={bi} className="bg-black/5 border border-border/50 rounded-xl p-3 text-xs font-mono overflow-x-auto leading-relaxed">{code}</pre>;
        }
        return (
          <p key={bi} className="leading-relaxed whitespace-pre-wrap">
            {block.split("\n").map((line, li) => {
              const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
              return (
                <span key={li}>
                  {parts.map((p, pi) => {
                    if (p.startsWith("`") && p.endsWith("`")) return <code key={pi} className="bg-black/5 px-1.5 py-0.5 rounded text-xs font-mono border border-border/50">{p.slice(1, -1)}</code>;
                    if (p.startsWith("**") && p.endsWith("**")) return <strong key={pi} className="font-semibold">{p.slice(2, -2)}</strong>;
                    return p;
                  })}
                  {li < block.split("\n").length - 1 && <br />}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
};

const Particle = ({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) => (
  <motion.div className="absolute rounded-full pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color, filter: "blur(1px)" }}
    animate={{ y: [0, -28, 0], opacity: [0, 0.7, 0], scale: [0.8, 1.3, 0.8] }}
    transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const PARTICLES = [
  { x: 12, y: 72, size: 8, color: "#3b82f6", delay: 0 },
  { x: 82, y: 58, size: 6, color: "#8b5cf6", delay: 1 },
  { x: 22, y: 28, size: 10, color: "#06b6d4", delay: 2 },
  { x: 68, y: 82, size: 7, color: "#a78bfa", delay: 0.5 },
  { x: 48, y: 18, size: 5, color: "#3b82f6", delay: 1.5 },
  { x: 88, y: 32, size: 9, color: "#7c3aed", delay: 2.5 },
  { x: 8, y: 48, size: 6, color: "#60a5fa", delay: 3 },
  { x: 58, y: 88, size: 8, color: "#818cf8", delay: 0.8 },
];

const AdvancedWarningModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onCancel}>
    <motion.div initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()}
      className="bg-background border border-border rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
          <AlertTriangle size={18} className="text-amber-500" />
        </div>
        <div><h3 className="font-bold text-sm">Advanced Mode</h3><p className="text-xs text-muted-foreground">School-funded resource</p></div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">Advanced mode runs a significantly larger model funded by the school. Please use it responsibly.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-2xl border border-border text-sm text-muted-foreground hover:bg-accent transition-all font-medium">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white text-sm font-bold hover:opacity-90 shadow-lg transition-all">I understand</button>
      </div>
    </motion.div>
  </motion.div>
);

const SplashScreen = ({ onEnter }: { onEnter: () => void }) => (
  <motion.div className="fixed inset-0 z-[100] flex items-center justify-center"
    style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #ffffff 50%, #f5f0ff 100%)" }}
    exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.5 }}>
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
      <motion.div className="absolute w-[600px] h-[600px] rounded-full bg-orange-100 blur-[120px] opacity-50"
        animate={{ scale: [1, 1.12, 1], x: [0, 30, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "-10%", left: "-10%" }} />
      <motion.div className="absolute w-[500px] h-[500px] rounded-full bg-orange-100 blur-[120px] opacity-40"
        animate={{ scale: [1, 1.15, 1], x: [0, -25, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ bottom: "-10%", right: "-10%" }} />
    </div>
    <div className="relative flex flex-col items-center text-center px-6 w-full max-w-md">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="mb-6 relative flex items-center justify-center">
        <motion.div className="absolute w-40 h-40 rounded-full bg-orange-200 blur-3xl opacity-40"
          animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white"
          animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <Sparkles className="w-14 h-14" />
        </motion.div>
      </motion.div>
      <motion.div initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
        <h1 className="text-7xl font-black tracking-tighter leading-none select-none">
          CS<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">AI</span>
        </h1>
        <p className="text-[11px] text-muted-foreground tracking-[0.28em] uppercase font-semibold mt-3">Cornerstone School &middot; AI Studio</p>
      </motion.div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.85, duration: 0.6 }} className="flex gap-3 mt-8">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 shadow-sm">
          <Zap size={12} className="text-orange-500" /><span className="text-xs text-orange-600 font-bold">Gemini Flash</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-violet-200 shadow-sm">
          <Brain size={12} className="text-orange-500" /><span className="text-xs text-orange-600 font-bold">Qwen-3 235B</span>
        </div>
      </motion.div>
      <motion.button onClick={onEnter} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        className="mt-10 px-14 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white text-sm font-bold tracking-wide shadow-xl shadow-orange-200/60 transition-all">
        Enter Lab
      </motion.button>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}
        className="text-[10px] text-muted-foreground/40 mt-5 tracking-widest uppercase">CSAI can make mistakes. Verify important information.</motion.p>
    </div>
  </motion.div>
);

export default function AILab() {
  const { user } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("gemini");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showAdvancedWarning, setShowAdvancedWarning] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const m = MODEL_CONFIG[mode];
  const MIcon = m?.icon || Sparkles;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    if (!showModelMenu) return;
    const handler = () => setShowModelMenu(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showModelMenu]);

  const handleModeSelect = (id: string) => {
    setShowModelMenu(false);
    if (id === "qwen-3-235b" && mode !== "qwen-3-235b") {
      setShowAdvancedWarning(true);
    } else {
      setMode(id);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const content = input.trim();
    const userMsg: ChatMessage = { id: `msg${Date.now()}`, role: "user", content, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const systemPrompt = SYSTEM_PROMPTS[user?.role || "default"] || SYSTEM_PROMPTS.default;
      const res = await api.chatAI(newMessages.map((x) => ({ role: x.role, content: x.content })), mode, systemPrompt);
      const responseText =
        res?.response ||
        res?.message ||
        res?.result ||
        "I could not generate a response. Please try again.";
      setMessages((prev) => [...prev, {
        id: `msg${Date.now()}-ai`, role: "assistant", content: responseText,
        timestamp: new Date().toISOString(), model: mode, provider: m?.provider,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: `msg${Date.now()}-err`, role: "assistant", content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(), model: mode,
      }]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (showSplash) {
    return <AnimatePresence mode="wait"><SplashScreen key="splash" onEnter={() => setShowSplash(false)} /></AnimatePresence>;
  }

  return (
    <div className="flex bg-background" style={{ height: "calc(100vh - 64px)", overflow: "hidden", maxWidth: "100vw", position: "relative" }}>
      <AnimatePresence>{showAdvancedWarning && <AdvancedWarningModal onConfirm={() => { setMode("qwen-3-235b"); setShowAdvancedWarning(false); }} onCancel={() => setShowAdvancedWarning(false)} />}</AnimatePresence>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.aside initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="w-72 border-r border-border flex flex-col bg-background shrink-0" style={{ overflow: "hidden" }}>
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">History</span>
                {history.length > 0 && <span className="text-[10px] bg-accent text-muted-foreground px-2 py-0.5 rounded-full font-semibold">{history.length}</span>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setHistory([])} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-all" title="Clear"><Trash2 size={13} /></button>
                <button onClick={() => setShowHistory(false)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-all"><X size={15} /></button>
              </div>
            </div>
            <div className="flex-1 p-3 space-y-1" style={{ overflowY: "auto", overflowX: "hidden" }}>
              {history.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground/40">
                  <MessageSquare size={28} className="mx-auto mb-3" />
                  <p className="text-xs font-medium">No history yet</p>
                  <p className="text-[10px] mt-1">Your chats will appear here</p>
                </div>
              ) : history.map((item, i) => (
                <motion.button key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => { setMessages([{ id: `h${i}`, role: "user", content: item.prompt, timestamp: item.created_at }, { id: `h${i}a`, role: "assistant", content: item.response, timestamp: item.created_at, provider: item.model }]); setShowHistory(false); }}
                  className="w-full text-left p-3 rounded-xl hover:bg-accent transition-all border border-transparent hover:border-border group">
                  <p className="text-xs truncate font-medium">{item.prompt}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    <p className="text-[10px] text-muted-foreground/50 font-medium">{item.model}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0" style={{ overflow: "hidden" }}>
        {/* Top bar */}
        <div className="h-14 border-b border-border flex items-center justify-between px-5 shrink-0 bg-background/90 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory((v) => !v)}
              className={`p-2 rounded-xl transition-all ${showHistory ? "bg-accent text-foreground" : "hover:bg-accent text-muted-foreground"}`}>
              <History size={17} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-black tracking-tight text-lg leading-none">
                CS<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">AI</span>
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-semibold hidden sm:block">AI Studio</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
              <button onClick={() => setShowModelMenu((v) => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${m.pill}`}>
                <motion.div className={`w-1.5 h-1.5 rounded-full ${m.dot}`} animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <MIcon size={13} />{m.name}
                <ChevronDown size={12} className={`transition-transform duration-200 ${showModelMenu ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showModelMenu && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-2xl overflow-hidden shadow-2xl z-50">
                    <div className="p-2">
                      {Object.values(MODEL_CONFIG).map((cfg) => {
                        const CIcon = cfg.icon;
                        return (
                          <button key={cfg.id} onClick={() => handleModeSelect(cfg.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent transition-all text-left ${mode === cfg.id ? "bg-accent" : ""}`}>
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                              <CIcon size={16} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold">{cfg.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{cfg.subtitle} &middot; {cfg.provider}</p>
                            </div>
                            {mode === cfg.id && <div className="w-2 h-2 rounded-full bg-foreground shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="px-4 py-2.5 border-t border-border bg-accent/30">
                      <p className="text-[10px] text-muted-foreground leading-relaxed">Powered by Cerebras &middot; Groq fallback &middot; Gemini default</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setMessages([])} className="p-2 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-400 transition-all" title="Clear chat">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-8" style={{ overflowY: "auto", overflowX: "hidden" }}>
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.length === 0 && !loading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center pt-16 pb-20">
                <motion.div className="relative mb-6 flex items-center justify-center"
                  animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                  <motion.div className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${m.gradient} blur-3xl opacity-15`}
                    animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity }} />
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white shadow-xl`}>
                    <MIcon className="w-12 h-12" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">What can I help with?</h2>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">Ask me anything — academics, concepts, planning, or analysis.</p>
                <div className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold shadow-sm ${m.pill}`}>
                  <MIcon size={12} />{m.name} &middot; {m.subtitle}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-6 w-full max-w-sm">
                  {["Help me study for my math exam", "Create a lesson plan for physics", "Explain photosynthesis simply", "Write a grading rubric for essays"].map((s) => (
                    <button key={s} onClick={() => setInput(s)}
                      className="p-3 text-left text-xs bg-accent/50 hover:bg-accent rounded-xl transition-all border border-border/50">{s}</button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "user" ? (
                  <div className="max-w-[75%]">
                    <div className="bg-foreground text-background px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed font-medium shadow-sm">{msg.content}</div>
                  </div>
                ) : (
                  <div className="max-w-[85%] flex gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
                      <MIcon size={15} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm text-sm shadow-sm">
                        <MsgContent text={msg.content} />
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 px-1">
                        {msg.provider && <p className="text-[10px] text-muted-foreground font-medium">via {msg.provider}</p>}
                        <button onClick={() => handleCopy(msg.content, msg.id)} className="text-[10px] text-muted-foreground hover:text-foreground transition-all flex items-center gap-1">
                          {copiedId === msg.id ? <><Check size={10} />Copied</> : <><Copy size={10} />Copy</>}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                  <MIcon size={15} className="text-white" />
                </div>
                <div className="bg-card border border-border px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/30"
                      animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-border bg-background/90 backdrop-blur-xl shrink-0">
          <div className="max-w-2xl mx-auto">
            <div className={`flex items-end gap-2 rounded-2xl border bg-background px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-200 transition-all ${m.pill.split(" ").includes("bg-orange-50") ? "focus-within:ring-violet-200" : "focus-within:ring-blue-200"}`}>
              <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown} placeholder="Ask CSAI anything..." rows={1}
                className="flex-1 bg-transparent resize-none text-sm focus:outline-none placeholder:text-muted-foreground/50 max-h-32"
                style={{ height: "auto" }}
                onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 128) + "px"; }}
              />
              <button onClick={handleSend} disabled={!input.trim() || loading}
                className={`p-2 rounded-xl bg-gradient-to-br ${m.gradient} text-white shadow-sm disabled:opacity-30 transition-all hover:shadow-md`}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/40 text-center mt-2">CSAI can make mistakes. Verify important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
