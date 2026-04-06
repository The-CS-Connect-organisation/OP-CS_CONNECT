import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, BookOpen, Wand2, Send, Bot, User, Loader2, Zap, GraduationCap, BarChart3, FileText, Cpu, ChevronRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { request } from '../../../utils/apiClient';

const AI_TOOLS = [
  {
    id: 'doubt',
    label: 'Doubt Solver',
    icon: Brain,
    description: 'Ask any academic question',
    color: '#ff6b9d',
    gradient: 'linear-gradient(135deg, #ff6b9d, #ff8fab)',
  },
  {
    id: 'quiz',
    label: 'Quiz Generator',
    icon: Wand2,
    description: 'Generate MCQ quizzes',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #c084fc)',
    roles: ['teacher', 'admin'],
  },
  {
    id: 'study',
    label: 'Study Planner',
    icon: GraduationCap,
    description: 'AI-powered study plans',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
  },
  {
    id: 'grade',
    label: 'Grade Predictor',
    icon: BarChart3,
    description: 'Predict expected grades',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
  },
];

export const AILab = ({ user, addToast }) => {
  const [activeTool, setActiveTool] = useState('doubt');
  const [subject, setSubject] = useState('Mathematics');
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('Algebra');
  const [model, setModel] = useState('openai/gpt-4o');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [quiz, setQuiz] = useState('');
  const [studyPlan, setStudyPlan] = useState('');
  const [gradeResult, setGradeResult] = useState('');
  const resultRef = useRef(null);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [answer, quiz, studyPlan, gradeResult]);

  const runDoubtSolver = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const payload = await request('/ai/doubt-solver', {
        method: 'POST',
        body: JSON.stringify({ question, subject, model }),
      });
      setAnswer(payload?.answer || 'No answer returned.');
      addToast?.('AI response ready', 'success');
    } catch (e) {
      addToast?.(e.message || 'AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runQuizGenerator = async () => {
    setLoading(true);
    setQuiz('');
    try {
      const payload = await request('/ai/quiz-generator', {
        method: 'POST',
        body: JSON.stringify({ topic, difficulty: 'medium', questionCount: 10, model }),
      });
      setQuiz(payload?.quiz || 'No quiz returned.');
      addToast?.('Quiz generated', 'success');
    } catch (e) {
      addToast?.(e.message || 'AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runStudyPlanner = async () => {
    if (!subject.trim()) return;
    setLoading(true);
    setStudyPlan('');
    try {
      const payload = await request('/ai/study-planner', {
        method: 'POST',
        body: JSON.stringify({ subject, goals: question || 'Improve grades', duration: '1 month', model }),
      });
      setStudyPlan(payload?.plan || payload?.answer || 'No plan returned.');
      addToast?.('Study plan ready', 'success');
    } catch (e) {
      addToast?.(e.message || 'AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runGradePredictor = async () => {
    if (!subject.trim()) return;
    setLoading(true);
    setGradeResult('');
    try {
      const payload = await request('/ai/grade-predictor', {
        method: 'POST',
        body: JSON.stringify({ subject, currentGrade: question || 'B+', attendance: '85%', model }),
      });
      setGradeResult(payload?.prediction || payload?.answer || 'No prediction returned.');
      addToast?.('Prediction ready', 'success');
    } catch (e) {
      addToast?.(e.message || 'AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = () => {
    switch (activeTool) {
      case 'doubt': return runDoubtSolver();
      case 'quiz': return runQuizGenerator();
      case 'study': return runStudyPlanner();
      case 'grade': return runGradePredictor();
    }
  };

  const activeToolData = AI_TOOLS.find(t => t.id === activeTool);
  const currentResult = activeTool === 'doubt' ? answer : activeTool === 'quiz' ? quiz : activeTool === 'study' ? studyPlan : gradeResult;
  const availableTools = AI_TOOLS.filter(t => !t.roles || t.roles.includes(user?.role));

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pt-2 pb-12">
      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="nova-card relative overflow-hidden p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(255,107,157,0.05), rgba(168,85,247,0.05), rgba(59,130,246,0.05))',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              x: [0, 30, -20, 0],
              y: [0, -20, 30, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,107,157,0.1), transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <motion.div
            animate={{ 
              x: [0, -20, 30, 0],
              y: [0, 30, -20, 0],
              scale: [1, 0.9, 1.1, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'var(--bg-surface)', 
                boxShadow: 'var(--shadow-glow)',
                border: '1px solid var(--border-default)',
              }}
            >
              <Cpu size={22} className="text-[var(--text-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Command Lab</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Powered by OpenRouter
              </p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ 
                  background: 'rgba(16, 185, 129, 0.08)', 
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {user?.role?.toUpperCase()} Mode
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Tool Selector ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {availableTools.map((tool, i) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTool(tool.id)}
            className="relative p-4 rounded-xl text-left cursor-pointer transition-all duration-300 nova-card"
            style={{
              background: activeTool === tool.id ? tool.color + '10' : undefined,
              border: activeTool === tool.id ? `2px solid ${tool.color}50` : undefined,
              boxShadow: activeTool === tool.id ? `0 4px 20px ${tool.color}20` : undefined,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  background: activeTool === tool.id ? tool.color + '20' : 'var(--bg-elevated)',
                  border: activeTool === tool.id ? `1px solid ${tool.color}30` : '1px solid var(--border-default)',
                }}
              >
                <tool.icon size={20} style={{ color: activeTool === tool.id ? tool.color : 'var(--text-muted)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: activeTool === tool.id ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                  {tool.label}
                </p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: activeTool === tool.id ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                  {tool.description}
                </p>
              </div>
            </div>
            {activeTool === tool.id && (
              <motion.div 
                layoutId="activeToolBar" 
                className="absolute bottom-0 left-4 right-4 h-[3px] rounded-full" 
                style={{ background: tool.gradient }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* ── Input Area ── */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.25 }}
      >
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: activeToolData?.color + '15', border: `1px solid ${activeToolData?.color}30` }}
            >
              {activeToolData && <activeToolData.icon size={16} style={{ color: activeToolData.color }} />}
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{activeToolData?.label}</h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Subject / Context</label>
            <input 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              className="input-field" 
              placeholder="e.g. Mathematics, Physics, History..." 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {activeTool === 'doubt' ? 'Your Question' : activeTool === 'quiz' ? 'Topic for MCQs' : activeTool === 'study' ? 'Learning Goals' : 'Current Performance'}
            </label>
            <textarea
              value={activeTool === 'quiz' ? topic : question}
              onChange={e => activeTool === 'quiz' ? setTopic(e.target.value) : setQuestion(e.target.value)}
              className="input-field min-h-[100px] resize-none"
              placeholder={
                activeTool === 'doubt' ? 'Type your question here...'
                  : activeTool === 'quiz' ? 'e.g. Algebra, Photosynthesis...'
                  : activeTool === 'study' ? 'What do you want to achieve?'
                  : 'e.g. B+ in Physics, 85% attendance...'
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>AI Model</label>
            <input 
              value={model} 
              onChange={e => setModel(e.target.value)} 
              className="input-field font-mono text-sm" 
              placeholder="openai/gpt-4o" 
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleRun}
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
            style={{
              background: activeToolData?.gradient || 'linear-gradient(135deg, #ff6b9d, #ff8fab)',
              boxShadow: `0 4px 20px ${activeToolData?.color || '#ff6b9d'}40`,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Processing your request...</>
            ) : (
              <><Zap size={18} /> Run {activeToolData?.label}</>
            )}
          </motion.button>

          {activeTool === 'quiz' && user?.role === 'student' && (
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Quiz generation is restricted to teachers and admins.
            </p>
          )}
        </Card>
      </motion.div>

      {/* ── Result ── */}
      <AnimatePresence>
        {currentResult && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: `${activeToolData?.color}15`,
                    border: `1px solid ${activeToolData?.color}30`,
                  }}
                >
                  <Bot size={18} style={{ color: activeToolData?.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">AI Response</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Model: {model}</p>
                </div>
              </div>
              <div className="rounded-xl p-5 text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto leading-relaxed no-scrollbar"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                {currentResult}
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <FileText size={14} />
                  Copy Response
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Send size={14} />
                  Share
                </motion.button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Card className="p-4">
          <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <BookOpen size={16} style={{ color: 'var(--text-muted)' }} />
            Every AI call is logged with model, prompt, response, tokens, and timestamp.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};