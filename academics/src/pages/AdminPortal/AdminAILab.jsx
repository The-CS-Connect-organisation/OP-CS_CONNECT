import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Brain, MessageSquare, TrendingUp, Users, Zap, Send, Loader2 } from 'lucide-react';
import { AnimatedAIInput } from '../../components/ui/AnimatedAIInput';

const AdminAILab = ({ user, addToast }) => {
  const [stats] = useState({
    totalQueries: 15420,
    activeUsers: 892,
    avgResponseTime: '1.2s',
    accuracy: 94.5,
  });

  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const [aiTools] = useState([
    { id: 1, name: 'Essay Scorer', description: 'AI-powered essay evaluation with detailed feedback', usage: 3420, status: 'active', icon: Brain },
    { id: 2, name: 'Math Tutor', description: 'Step-by-step math problem solving assistant', usage: 2890, status: 'active', icon: Bot },
    { id: 3, name: 'Language Partner', description: 'Conversational AI for language practice', usage: 1560, status: 'active', icon: MessageSquare },
    { id: 4, name: 'Code Helper', description: 'Programming assistance and code review', usage: 980, status: 'beta', icon: Zap },
  ]);

  const handleSendMessage = async (message, model) => {
    if (!message.trim()) return;

    setLoading(true);
    const userMsg = { role: 'user', content: message, model: model.name };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = {
        role: 'assistant',
        content: `This is a simulated response from ${model.name}. In production, this would connect to the ${model.provider} API endpoint. The model processed your query: "${message}"`,
        model: model.name,
        provider: model.provider,
      };
      setChatMessages(prev => [...prev, response]);
    } catch (err) {
      addToast?.('AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFlashcardGenerate = async (topic) => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const cards = [
        { question: `What is ${topic}?`, answer: `A key concept in the subject area.` },
        { question: `Why is ${topic} important?`, answer: `It's fundamental for further learning!` },
        { question: `Give an example of ${topic}`, answer: `A practical illustration of the concept.` },
        { question: `How does ${topic} relate to other concepts?`, answer: `It connects to broader principles in the field.` },
      ];
      setFlashcards(cards);
      setFlashcardIndex(0);
      setShowFlashcardAnswer(false);
      setActiveTab('flashcards');
    } catch (err) {
      addToast?.('Failed to generate flashcards', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizGenerate = async (topic) => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const questions = [
        { question: `What is ${topic}?`, options: ['Definition A', 'Definition B', 'Definition C', 'Definition D'], correct: 0 },
        { question: `Which of these is true about ${topic}?`, options: ['True statement', 'False statement', 'Partially true', 'None'], correct: 1 },
        { question: `Choose the best answer for ${topic}`, options: ['First', 'Second', 'Third', 'Fourth'], correct: 2 },
        { question: `What is the key principle of ${topic}?`, options: ['Principle A', 'Principle B', 'Principle C', 'Principle D'], correct: 1 },
      ];
      setQuizQuestions(questions);
      setQuizIndex(0);
      setQuizScore(0);
      setQuizComplete(false);
      setActiveTab('quiz');
    } catch (err) {
      addToast?.('Failed to generate quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (selectedIndex) => {
    if (selectedIndex === quizQuestions[quizIndex].correct) {
      setQuizScore(prev => prev + 1);
    }
    if (quizIndex === quizQuestions.length - 1) {
      setQuizComplete(true);
    } else {
      setQuizIndex(prev => prev + 1);
    }
  };

  const resetQuiz = () => {
    setQuizQuestions([]);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizComplete(false);
    setActiveTab('chat');
  };

  const resetFlashcards = () => {
    setFlashcards([]);
    setFlashcardIndex(0);
    setShowFlashcardAnswer(false);
    setActiveTab('chat');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <Bot className="inline mr-2" size={24} /> AI Lab
        </h1>
        <button className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: 'var(--primary)' }}>
          + Add AI Tool
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-3">
            <MessageSquare size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalQueries.toLocaleString()}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Queries</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center mb-3">
            <Users size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.activeUsers}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Active Users</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center mb-3">
            <TrendingUp size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.avgResponseTime}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Avg Response</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center mb-3">
            <Bot size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.accuracy}%</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Accuracy Rate</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
        {/* Tab Bar */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'chat'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare size={14} className="inline mr-2" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'flashcards'
                ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BookOpen size={14} className="inline mr-2" />
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'quiz'
                ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Brain size={14} className="inline mr-2" />
            Quiz
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Chat Messages */}
                <div className="h-[400px] overflow-y-auto rounded-xl border mb-4 p-4 space-y-4" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
                  {chatMessages.length === 0 && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <Bot size={48} className="text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600">Welcome to AI Lab Chat</h3>
                      <p className="text-sm text-gray-400 max-w-md">
                        Ask questions about your school data, analytics, and more. Select a model below to start.
                      </p>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        {msg.provider && (
                          <p className="text-[10px] opacity-70 mt-1">via {msg.provider}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-gray-500" />
                        <span className="text-sm text-gray-600">AI is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Flashcards Tab */}
            {activeTab === 'flashcards' && (
              <motion.div
                key="flashcards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {flashcards.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Flashcard Generator</h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                      Enter a topic to generate interactive flashcards for studying.
                    </p>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        Card {flashcardIndex + 1} of {flashcards.length}
                      </span>
                    </div>
                    <motion.div
                      key={flashcardIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-200 rounded-2xl p-8 shadow-lg cursor-pointer"
                      onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                    >
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                          {showFlashcardAnswer ? 'Tap to see question' : 'Tap to see answer'}
                        </p>
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                          {showFlashcardAnswer
                            ? flashcards[flashcardIndex].answer
                            : flashcards[flashcardIndex].question}
                        </h3>
                      </div>
                    </motion.div>
                    <div className="flex items-center justify-between mt-6">
                      <button
                        onClick={() => setFlashcardIndex(i => Math.max(0, i - 1))}
                        disabled={flashcardIndex === 0}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-all font-medium text-sm"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setFlashcardIndex(i => Math.min(flashcards.length - 1, i + 1))}
                        disabled={flashcardIndex === flashcards.length - 1}
                        className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-50 hover:bg-blue-600 transition-all font-medium text-sm"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Quiz Tab */}
            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {quizQuestions.length === 0 ? (
                  <div className="text-center py-16">
                    <Brain size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Quiz Generator</h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                      Enter a topic to generate an interactive quiz and test your knowledge.
                    </p>
                  </div>
                ) : quizComplete ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-10 shadow-lg inline-block">
                      <p className="text-6xl font-black text-emerald-600 mb-2">
                        {quizScore}/{quizQuestions.length}
                      </p>
                      <p className="text-lg font-semibold text-emerald-700">
                        {Math.round((quizScore / quizQuestions.length) * 100)}% Correct!
                      </p>
                    </div>
                    <button
                      onClick={resetQuiz}
                      className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:opacity-90 transition-all shadow-lg"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm text-gray-500">
                        Question {quizIndex + 1} of {quizQuestions.length}
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        Score: {quizScore}
                      </span>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {quizQuestions[quizIndex].question}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {quizQuestions[quizIndex].options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuizAnswer(i)}
                          className="w-full text-left px-5 py-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all font-medium text-sm"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Bar - Shared across all tabs */}
        <div className="border-t px-6 py-4" style={{ borderColor: 'var(--border-color)' }}>
          {activeTab === 'chat' && (
            <AnimatedAIInput
              onSend={handleSendMessage}
              placeholder="Ask about school data, analytics, or anything..."
            />
          )}
          {activeTab === 'flashcards' && (
            <AnimatedAIInput
              onSend={handleFlashcardGenerate}
              placeholder="Enter a topic to generate flashcards..."
            />
          )}
          {activeTab === 'quiz' && (
            <AnimatedAIInput
              onSend={handleQuizGenerate}
              placeholder="Enter a topic to generate a quiz..."
            />
          )}
        </div>
      </div>

      {/* AI Tools */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>AI Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiTools.map((tool) => (
            <div key={tool.id} className="p-4 rounded-xl border hover:shadow-md transition-shadow" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <tool.icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{tool.name}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      tool.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{tool.status}</span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{tool.description}</p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{tool.usage.toLocaleString()} uses this month</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAILab;