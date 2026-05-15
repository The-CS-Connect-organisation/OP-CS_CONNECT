import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, History, Trash2, Info, MessageSquare,
  Bot, BarChart3, BookOpen, BrainCircuit, X, ChevronDown, RotateCcw
} from 'lucide-react';
import { request } from '../../../utils/apiClient';
import { AnimatedAIInput } from '../../../components/ui/AnimatedAIInput';

const DISCLAIMER = "CSAI can make mistakes. Verify important information";

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
    <h3 className="text-2xl font-black" style={{ color: color || '#1c1917' }}>{value}</h3>
    <p className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>{label}</p>
  </motion.div>
);

/* ── Main component ── */
export const AILab = ({ user, addToast }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // chat, analytics, flashcards, quiz
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [showAdvancedWarning, setShowAdvancedWarning] = useState(false);
  const chatEndRef = useRef(null);

  // Flashcards & Quiz state
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Close advanced warning on outside click
  useEffect(() => {
    if (!showAdvancedWarning) return;
    const handler = () => setShowAdvancedWarning(false);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAdvancedWarning]);

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

  const loadStats = useCallback(async () => {
    try {
      const response = await request('/ai/stats');
      if (response?.success) setStats(response.stats);
    } catch (e) {
      console.error('Stats load failed', e);
    }
  }, []);

  useEffect(() => {
    if (showHistory) loadHistory();
    if (activeTab === 'analytics') loadStats();
  }, [showHistory, loadHistory, activeTab, loadStats]);

  const handleSendChatMessage = async (message, model) => {
    if (!message.trim() || loading) return;

    const userMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          model: model.id,
        }),
      });

      if (response?.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: response.answer || response.message,
            provider: model.provider,
          },
        ]);
      }
    } catch (e) {
      addToast?.(e.message || 'CSAI is unavailable. Try again shortly.', 'error');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const formatResponseTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const renderChatTab = () => (
    <div className="flex-1 overflow-y-auto px-4 py-8" style={{ overflowX: 'hidden' }}>
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
              <div className="absolute w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 blur-3xl opacity-15"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <Bot size={56} className="text-gray-400" />
            </motion.div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome to AI Lab</h2>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Ask me anything — academics, concepts, planning, or analysis.
            </p>
            <div className="text-[10px] text-gray-400 bg-white px-3 py-2 rounded-lg mt-3 border border-gray-100">
              {DISCLAIMER}
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
                <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed font-medium shadow-sm">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="max-w-[85%] flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot size={15} className="text-white" />
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shrink-0 shadow-sm">
              <Bot size={15} className="text-white" />
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
  );

  const renderAnalyticsTab = () => (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        <StatCard
          icon={MessageSquare}
          label="Total Queries"
          value={stats?.totalQueries?.toLocaleString() || '—'}
          gradient="from-blue-500 to-indigo-500"
          trend={stats?.queriesGrowth ? `+${stats.queriesGrowth}%` : null}
          color="#3b82f6"
        />
        <StatCard
          icon={Users}
          label="Active Users"
          value={stats?.activeUsers?.toLocaleString() || '—'}
          gradient="from-emerald-500 to-teal-500"
          sublabel={stats?.uniqueUsers ? `${stats.uniqueUsers.toLocaleString()} unique` : null}
          color="#10b981"
        />
        <StatCard
          icon={Zap}
          label="Avg Response"
          value={stats?.avgResponseTime ? formatResponseTime(stats.avgResponseTime) : '—'}
          gradient="from-violet-500 to-purple-500"
          sublabel={stats?.p95Response ? `p95: ${formatResponseTime(stats.p95Response)}` : null}
          color="#8b5cf6"
        />
        <StatCard
          icon={Target}
          label="Accuracy"
          value={stats?.accuracy ? `${stats.accuracy}%` : '—'}
          gradient="from-amber-500 to-orange-500"
          trend={stats?.accuracyDelta ? `${stats.accuracyDelta > 0 ? '+' : ''}${stats.accuracyDelta}%` : null}
          color="#f59e0b"
        />
        <StatCard
          icon={Brain}
          label="Tokens Used"
          value={stats?.totalTokens ? `${(stats.totalTokens / 1000000).toFixed(1)}M` : '—'}
          gradient="from-pink-500 to-rose-500"
          color="#ec4899"
        />
        <StatCard
          icon={BarChart3}
          label="Success Rate"
          value={stats?.successRate ? `${stats.successRate}%` : '—'}
          gradient="from-cyan-500 to-blue-500"
          sublabel={stats?.errorCount ? `${stats.errorCount} errors` : null}
          color="#06b6d4"
        />
      </div>
    </div>
  );

  const renderFlashcardsTab = () => (
    <div className="flex-1 px-4 py-8 flex flex-col items-center justify-center" style={{ overflowY: 'auto' }}>
      {flashcards.length === 0 ? (
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-black text-gray-900">Flashcard Generator</h2>
          <p className="text-sm text-gray-500 mt-8 mb-6">Enter a topic to generate flashcards!</p>
          <AnimatedAIInput
            onSend={(text, model) => {
              const dummyCards = [
                { question: `What is ${text}?`, answer: `A key concept in the subject!` },
                { question: `Why is ${text} important?`, answer: `It's fundamental for further learning!` },
                { question: `Give an example of ${text}`, answer: `A practical example that illustrates the concept!` },
              ];
              setFlashcards(dummyCards);
              setCurrentFlashcardIndex(0);
              setShowFlashcardAnswer(false);
            }}
          />
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500 font-semibold">
              {currentFlashcardIndex + 1} of {flashcards.length}
            </span>
          </div>
          <motion.div
            key={currentFlashcardIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl cursor-pointer"
            onClick={() => setShowFlashcardAnswer(v => !v)}
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {showFlashcardAnswer ? 'Answer:' : 'Question:'}
              </h3>
              <p className="text-lg text-gray-700">
                {showFlashcardAnswer
                  ? flashcards[currentFlashcardIndex].answer
                  : flashcards[currentFlashcardIndex].question}
              </p>
              <p className="text-xs text-gray-400 mt-6">Tap to flip</p>
            </div>
          </motion.div>
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => { setCurrentFlashcardIndex(Math.max(0, currentFlashcardIndex - 1)); setShowFlashcardAnswer(false); }}
              disabled={currentFlashcardIndex === 0}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all font-semibold text-sm"
            >Previous</button>
            <button
              onClick={() => { setCurrentFlashcardIndex(Math.min(flashcards.length - 1, currentFlashcardIndex + 1)); setShowFlashcardAnswer(false); }}
              disabled={currentFlashcardIndex === flashcards.length - 1}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all font-semibold text-sm"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderQuizTab = () => (
    <div className="flex-1 px-4 py-8 flex flex-col items-center justify-center" style={{ overflowY: 'auto' }}>
      {quizQuestions.length === 0 ? (
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-black text-gray-900">Quiz Generator</h2>
          <p className="text-sm text-gray-500 mt-8 mb-6">Enter a topic to generate a quiz!</p>
          <AnimatedAIInput
            onSend={(text, model) => {
              const dummyQuiz = [
                { question: `What is ${text}?`, options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 0 },
                { question: `Which of these is true about ${text}?`, options: ['True', 'False', 'Maybe', 'None'], correct: 1 },
                { question: `Choose the best answer for ${text}`, options: ['First', 'Second', 'Third', 'Fourth'], correct: 2 },
              ];
              setQuizQuestions(dummyQuiz);
              setCurrentQuizIndex(0);
              setQuizScore(0);
              setQuizComplete(false);
            }}
          />
        </div>
      ) : quizComplete ? (
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-black text-gray-900">Quiz Complete!</h2>
          <div className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-8">
            <p className="text-5xl font-black text-emerald-600 mb-2">{quizScore}/{quizQuestions.length}</p>
            <p className="text-sm text-emerald-700 font-semibold">
              {Math.round((quizScore / quizQuestions.length) * 100)}% Correct!
            </p>
          </div>
          <button
            onClick={() => { setQuizQuestions([]); setCurrentQuizIndex(0); setQuizScore(0); setQuizComplete(false); }}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:opacity-90 transition-all"
          >New Quiz</button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500 font-semibold">Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
            <span className="text-sm font-bold text-emerald-600">Score: {quizScore}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl mb-6">
            <p className="text-lg font-semibold text-gray-900">{quizQuestions[currentQuizIndex].question}</p>
          </div>
          <div className="space-y-3 w-full max-w-md">
            {quizQuestions[currentQuizIndex].options.map((option, i) => (
              <button key={i}
                onClick={() => {
                  if (i === quizQuestions[currentQuizIndex].correct) setQuizScore(s => s + 1);
                  if (currentQuizIndex === quizQuestions.length - 1) setQuizComplete(true);
                  else setCurrentQuizIndex(c => c + 1);
                }}
                className="w-full text-left px-4 py-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all font-semibold text-sm"
              >{option}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex bg-gray-50" style={{ height: 'calc(100vh - 64px)', overflow: 'hidden', maxWidth: '100vw', position: 'relative' }}>
      <AnimatePresence>
        {showAdvancedWarning && (
          <AdvancedWarningModal
            onConfirm={() => setShowAdvancedWarning(false)}
            onCancel={() => setShowAdvancedWarning(false)}
          />
        )}
      </AnimatePresence>

      {/* ── History sidebar ── */}
      <AnimatePresence>
        {showHistory && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="w-72 border-r border-gray-200 flex flex-col bg-white shrink-0" style={{ overflow: 'hidden' }}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">History</span>
                {history.length > 0 && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">{history.length}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={loadHistory} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all" title="Refresh">
                  <RotateCcw size={13} className={historyLoading ? 'animate-spin' : ''} />
                </button>
                <button onClick={() => setShowHistory(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all">
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-3 space-y-1" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
              {historyLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
              ) : history.length === 0 ? (
                <div className="text-center py-16 text-gray-300">
                  <MessageSquare size={28} className="mx-auto mb-3" />
                  <p className="text-xs font-medium">No history yet</p>
                  <p className="text-[10px] mt-1 text-gray-200">Your chats will appear here</p>
                </div>
              ) : history.map((item, i) => (
                <motion.button key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => { setMessages([{ role: 'user', content: item.prompt }, { role: 'assistant', content: item.response, provider: item.model }]); setShowHistory(false); }}
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

        {/* Top Bar */}
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-5 shrink-0 bg-white/90 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(v => !v)}
              className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'}`}>
              <History size={17} />
            </button>
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="CS" className="w-7 h-7 object-contain" />
              <span className="font-black text-gray-900 tracking-tight text-lg leading-none">
                CS<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-600">AI</span>
              </span>
              <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-semibold hidden sm:block">AI Studio</span>
            </div>
          </div>

          {/* 4-Tab bar */}
          <div className="flex items-center gap-1">
            {[
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
              { id: 'quiz', label: 'Quiz', icon: BrainCircuit },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => {
              if (activeTab === 'chat') clearChat();
              if (activeTab === 'flashcards') { setFlashcards([]); setCurrentFlashcardIndex(0); setShowFlashcardAnswer(false); }
              if (activeTab === 'quiz') { setQuizQuestions([]); setCurrentQuizIndex(0); setQuizScore(0); setQuizComplete(false); }
            }}
              className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all" title="Clear current">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Tab Content - uses AnimatePresence from framer-motion already imported */}
        <AnimatePresence mode="wait">
          <div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col" style={{ overflow: 'hidden' }}>
            {activeTab === 'chat' && renderChatTab()}
            {activeTab === 'analytics' && renderAnalyticsTab()}
            {activeTab === 'flashcards' && renderFlashcardsTab()}
            {activeTab === 'quiz' && renderQuizTab()}
          </div>
        </AnimatePresence>

        {/* Bottom Bar - Shared AnimatedAIInput */}
        <div className="border-t border-gray-200 bg-white/90 backdrop-blur-xl px-6 py-4 shrink-0">
          <AnimatedAIInput
            onSend={handleSendChatMessage}
            placeholder={
              activeTab === 'chat' ? 'Ask about anything...'
                : activeTab === 'flashcards' ? 'Enter a topic to generate flashcards...'
                  : activeTab === 'quiz' ? 'Enter a topic to generate a quiz...'
                    : 'Type your message...'
            }
          />
        </div>
      </div>
    </div>
  );
};