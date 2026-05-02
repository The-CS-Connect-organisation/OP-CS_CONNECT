import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  MessageSquare,
  Calendar,
  FileText,
  TrendingUp,
  Sparkles,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Lightbulb,
  Target,
  Award,
} from 'lucide-react';
import { studentAssistantApi } from '../../services/apiDataLayer';
import { Skeleton } from '../../components/ui/Skeleton';

/**
 * @component StudentAssistant
 * @description AI-Powered Personal Study Assistant - A comprehensive study companion
 * Features: AI Doubt Resolution, Study Plans, Flashcards, Practice Tests, Analytics
 */

const StudentAssistant = ({ user, addToast }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'chat', label: 'AI Tutor', icon: Brain },
    { id: 'study-plan', label: 'Study Plan', icon: Calendar },
    { id: 'flashcards', label: 'Flashcards', icon: FileText },
    { id: 'practice', label: 'Practice Tests', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Smart Study Companion</h1>
                <p className="text-xs text-gray-500">Your AI-powered personal tutor</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block mr-1 animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <AIChat key="chat" user={user} addToast={addToast} />
          )}
          {activeTab === 'study-plan' && (
            <StudyPlanGenerator key="study-plan" user={user} addToast={addToast} />
          )}
          {activeTab === 'flashcards' && (
            <FlashcardManager key="flashcards" user={user} addToast={addToast} />
          )}
          {activeTab === 'practice' && (
            <PracticeTestGenerator key="practice" user={user} addToast={addToast} />
          )}
          {activeTab === 'analytics' && (
            <StudyAnalytics key="analytics" user={user} addToast={addToast} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// AI CHAT COMPONENT
// ============================================================================

const AIChat = ({ user, addToast }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI study companion. Ask me any academic question, and I'll help you understand it step by step. What would you like to learn today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('general');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await studentAssistantApi.resolveDoubt(input, subject);
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.data.doubt.response,
        explanation: response.data.doubt.explanation,
        relatedTopics: response.data.doubt.relatedTopics,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      addToast?.('Failed to get response', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Area */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.explanation && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        <Lightbulb size={12} className="inline mr-1" />
                        {message.explanation}
                      </p>
                    </div>
                  )}
                  {message.relatedTopics && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.relatedTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
              >
                <option value="general">General</option>
                <option value="mathematics">Mathematics</option>
                <option value="science">Science</option>
                <option value="english">English</option>
                <option value="history">History</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
              </select>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask any question..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-500" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Explain a concept', icon: Lightbulb, query: 'Can you explain' },
              { label: 'Solve a problem', icon: Target, query: 'How do I solve' },
              { label: 'Get study tips', icon: BookOpen, query: 'Give me study tips for' },
              { label: 'Summarize topic', icon: FileText, query: 'Summarize' },
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => setInput(action.query + ' ')}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left text-sm text-gray-700"
              >
                <action.icon size={14} className="text-indigo-500" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            Recent Questions
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="text-xs text-gray-400">Your recent questions will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STUDY PLAN GENERATOR
// ============================================================================

const StudyPlanGenerator = ({ user, addToast }) => {
  const [days, setDays] = useState(7);
  const [focusAreas, setFocusAreas] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await studentAssistantApi.generateStudyPlan(days, focusAreas);
      setPlan(response.data.plan);
      addToast?.('Study plan generated successfully!', 'success');
    } catch (error) {
      addToast?.('Failed to generate study plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Plan Generator */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Study Plan</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Duration
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">{days} days</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Areas
              </label>
              <div className="flex flex-wrap gap-2">
                {['Mathematics', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology'].map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setFocusAreas(prev =>
                      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
                    )}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      focusAreas.includes(subject)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generatePlan}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Plan Display */}
      <div className="lg:col-span-2">
        {plan ? (
          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Your Study Plan</h3>
                  <p className="text-sm text-gray-500">
                    {plan.startDate} - {plan.endDate} ({plan.totalDays} days)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{plan.tasks.length}</p>
                  <p className="text-xs text-gray-500">Total Tasks</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {plan.tasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      task.type === 'study' ? 'bg-blue-100 text-blue-600' :
                      task.type === 'practice' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {task.type === 'study' ? <BookOpen size={18} /> :
                       task.type === 'practice' ? <Target size={18} /> :
                       <RotateCcw size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">{task.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{task.time}</p>
