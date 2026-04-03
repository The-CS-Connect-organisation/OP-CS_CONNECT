import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, BookOpen, Wand2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { request } from '../../utils/apiClient';

export const AILab = ({ user, addToast }) => {
  const [subject, setSubject] = useState('Mathematics');
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('Algebra');
  const [model, setModel] = useState('openai/gpt-4o');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [quiz, setQuiz] = useState('');

  const runDoubtSolver = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const payload = await request('/ai/doubt-solver', {
        method: 'POST',
        body: JSON.stringify({ question, subject, model }),
      });
      setAnswer(payload?.answer || 'No answer returned.');
      addToast('AI doubt solver response ready', 'success');
    } catch (e) {
      addToast(e.message || 'AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runQuizGenerator = async () => {
    setLoading(true);
    try {
      const payload = await request('/ai/quiz-generator', {
        method: 'POST',
        body: JSON.stringify({ topic, difficulty: 'medium', questionCount: 10, model }),
      });
      setQuiz(payload?.quiz || 'No quiz returned.');
      addToast('AI quiz generated', 'success');
    } catch (e) {
      addToast(e.message || 'AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 border border-orange-500/30 app-shell-gradient">
        <h1 className="text-3xl font-extrabold gradient-text flex items-center gap-2"><Sparkles size={24} />AI Command Lab</h1>
        <p className="text-zinc-300 mt-1">Powered by OpenRouter using your configured API key. Role: {user?.role}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#111] border border-orange-500/30 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Brain size={18} className="text-orange-400" />AI Doubt Solver</h2>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" placeholder="Subject context" />
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} className="input-field min-h-28" placeholder="Type your doubt..." />
          <input value={model} onChange={(e) => setModel(e.target.value)} className="input-field" placeholder="Model name" />
          <Button variant="primary" onClick={runDoubtSolver} disabled={loading}>
            {loading ? 'Thinking...' : 'Solve with AI'}
          </Button>
          {answer && <div className="rounded-xl bg-[#1a1a1a] border border-orange-500/20 p-3 text-sm text-zinc-200 whitespace-pre-wrap">{answer}</div>}
        </Card>

        <Card className="bg-[#111] border border-orange-500/30 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Wand2 size={18} className="text-orange-400" />AI Quiz Generator</h2>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} className="input-field" placeholder="Topic for MCQs" />
          <Button variant="primary" onClick={runQuizGenerator} disabled={loading || user?.role === 'student'}>
            {loading ? 'Generating...' : 'Generate 10 MCQs'}
          </Button>
          {user?.role === 'student' && <p className="text-xs text-zinc-400">Quiz generation is teacher/admin only by policy.</p>}
          {quiz && (
            <div className="rounded-xl bg-[#1a1a1a] border border-orange-500/20 p-3 text-sm text-zinc-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {quiz}
            </div>
          )}
        </Card>
      </div>

      <Card className="bg-[#111] border border-orange-500/20 text-sm text-zinc-300">
        <p className="flex items-center gap-2"><BookOpen size={16} className="text-orange-400" />Every AI call is logged in MongoDB with model, prompt, response, tokens, and timestamp.</p>
      </Card>
    </div>
  );
};
