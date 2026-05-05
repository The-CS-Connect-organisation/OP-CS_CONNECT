import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, History, Trash2, ChevronLeft, Info, MessageSquare, Cpu } from 'lucide-react';
import { request } from '../../../utils/apiClient';

const CSAI_DISCLAIMER = "We trained CSAI to be brilliant, not perfect. Mistakes can happen.";

export const AILab = ({ user, addToast }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await request('/ai/history');
      if (data?.success) setHistory(data.history);
    } catch (e) {
      console.error('Failed to load AI history', e);
    }
  }, []);

  useEffect(() => {
    if (showHistory) loadHistory();
  }, [showHistory, loadHistory]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (data?.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer, provider: data.provider }]);
      }
    } catch (e) {
      addToast?.(e.message || 'CSAI is currently resting. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (showSplash) {
    return (
      <motion.div 
        className="fixed inset-0 z-[100] bg-[#0a0a0a] flex items-center justify-center font-nova"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 mb-6 tracking-tighter"
          >
            AI
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">CSAI</h2>
            <p className="text-gray-400 text-sm tracking-widest uppercase">Designed and Run by CSTians</p>
          </motion.div>
          <motion.button
            onClick={() => setShowSplash(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="mt-12 px-8 py-3 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all text-sm font-medium backdrop-blur-md"
          >
            Enter Lab
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 max-w-[1400px] mx-auto p-4">
      {/* Sidebar - History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-80 glass-card flex flex-col overflow-hidden backdrop-blur-2xl border-r border-white/10"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <History size={18} />
                Interaction History
              </h3>
              <button onClick={() => setShowHistory(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md text-gray-500">
                <ChevronLeft size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-xs">No previous chats found</p>
                </div>
              ) : (
                history.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMessages([{ role: 'user', content: item.prompt }, { role: 'assistant', content: item.response, provider: item.model }]);
                      setShowHistory(false);
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all space-y-1 group"
                  >
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{item.prompt}</p>
                    <p className="text-[10px] text-gray-500 truncate">{new Date(item.created_at).toLocaleDateString()}</p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {!showHistory && (
              <button 
                onClick={() => setShowHistory(true)}
                className="p-2.5 rounded-xl glass-card text-gray-600 hover:text-blue-500 transition-colors"
              >
                <History size={20} />
              </button>
            )}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Sparkles className="text-blue-500" size={20} />
                CSAI
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Autonomous Cognitive Unit</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              Triple Model Fallback Active
            </div>
            <button 
              onClick={() => setMessages([])}
              className="p-2.5 rounded-xl glass-card text-gray-400 hover:text-red-500 transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 glass-card p-6 overflow-y-auto space-y-6 backdrop-blur-xl mb-6 custom-scrollbar">
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center scale-110">
                <Cpu size={40} className="text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">How can I assist you today?</h2>
                <p className="text-sm max-w-sm">I'm optimized for academic guidance, administrative tasks, and analytical problem-solving.</p>
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
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-white border-gray-200 dark:bg-white/10 dark:border-white/20'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className={msg.role === 'assistant' ? 'text-blue-500' : ''} />}
                </div>
                <div className={`space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-gray-100 text-gray-800 dark:bg-white/5 dark:border-white/10 dark:text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.provider && (
                    <span className="text-[10px] text-gray-400 font-medium px-1">
                      Computed by {msg.provider}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-3 rounded-2xl rounded-tl-none">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                <span className="text-xs text-gray-500 font-medium">CSAI is synthesizing data...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex flex-col gap-3">
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message CSAI..."
              className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 pr-16 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none min-h-[60px]"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-3 bottom-3 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shadow-lg"
            >
              <Send size={18} />
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <Info size={12} />
            <p>{CSAI_DISCLAIMER}</p>
          </div>
        </div>
      </div>
    </div>
  );
};