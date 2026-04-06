import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, BookOpen, Wand2, Send, Bot, User, Loader2, Zap, GraduationCap, BarChart3, FileText } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { request } from '../../../utils/apiClient';

const AI_TOOLS = [
  {
    id: 'doubt',
    label: 'Doubt Solver',
    icon: Brain,
    description: 'Ask any academic question',
    color: '#ffffff',
  },
  {
    id: 'quiz',
    label: 'Quiz Generator',
    icon: Wand2,
    description: 'Generate MCQ quizzes',
    color: '#a1a1aa',
    roles: ['teacher', 'admin'],
  },
  {
    id: 'study',
    label: 'Study Planner',
    icon: GraduationCap,
    description: 'AI-powered study plans',
    color: '#52525b',
  },
  {
    id: 'grade',
    label: 'Grade Predictor',
    icon: BarChart3,
    description: 'Predict expected grades',
    color: '#71717a',
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
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="nova-card relative overflow-hidden p-8"
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.05), transparent)' }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'white', boxShadow: 'var(--shadow-glow)' }}
            >
              <Sparkles size={20} className="text-[var(--text-primary)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Command Lab</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Powered by OpenRouter • Role: <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{user?.role?.toUpperCase()}</span>
          </p>
        </div>

        <motion.div
          animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-4 right-8 w-24 h-24 rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent)' }}
        />
      </motion.div>

      {/* Tool Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {availableTools.map((tool, i) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTool(tool.id)}
            className="relative p-4 rounded-xl text-left cursor-pointer transition-all duration-200 border"
            style={{
              background: activeTool === tool.id ? `${tool.color}15` : 'var(--bg-surface)',
              borderColor: activeTool === tool.id ? `${tool.color}40` : 'var(--border-default)',
            }}
          >
            <tool.icon size={22} className="mb-2" style={{ color: activeTool === tool.id ? tool.color : 'var(--text-muted)' }} />
            <p className="text-sm font-semibold" style={{ color: activeTool === tool.id ? 'white' : 'var(--text-primary)' }}>{tool.label}</p>
            <p className="text-[11px] mt-0.5" style={{ color: activeTool === tool.id ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
              {tool.description}
            </p>
            {activeTool === tool.id && (
              <motion.div layoutId="activeToolBar" className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full" style={{ background: tool.color }} />
            )}
          </motion.button>
        ))}
      </div>

      {/* Input Area */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            {activeToolData && <activeToolData.icon size={18} style={{ color: activeToolData.color }} />}
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{activeToolData?.label}</h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Subject / Context</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="input-field" placeholder="e.g. Mathematics, Physics, History..." />
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
            <input value={model} onChange={e => setModel(e.target.value)} className="input-field font-mono text-sm" placeholder="openai/gpt-4o" />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleRun}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2 cursor-pointer transition-all border-0"
            style={{
              background: `linear-gradient(135deg, ${activeToolData?.color || '#ffffff'}, ${activeToolData?.color || '#ffffff'}cc)`,
              boxShadow: `0 4px 20px ${activeToolData?.color || '#ffffff'}30`,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : (
              <><Zap size={18} /> Run {activeToolData?.label}</>
            )}
          </motion.button>

          {activeTool === 'quiz' && user?.role === 'student' && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Quiz generation is restricted to teachers and admins.
            </p>
          )}
        </Card>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {currentResult && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${activeToolData?.color || '#ffffff'}20` }}
                >
                  <Bot size={16} style={{ color: activeToolData?.color || '#ffffff' }} />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)]">AI Response</h3>
              </div>
              <div className="rounded-xl p-4 text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed no-scrollbar"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                {currentResult}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Card className="p-4">
          <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <BookOpen size={16} style={{ color: 'var(--white)' }} />
            Every AI call is logged with model, prompt, response, tokens, and timestamp.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

