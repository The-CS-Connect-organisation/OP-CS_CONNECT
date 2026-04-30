import { useState } from 'react';
import { Bot, Brain, MessageSquare, TrendingUp, Users, Zap } from 'lucide-react';

const AdminAILab = ({ user, addToast }) => {
  const [stats] = useState({
    totalQueries: 15420,
    activeUsers: 892,
    avgResponseTime: '1.2s',
    accuracy: 94.5,
  });

  const [aiTools] = useState([
    { id: 1, name: 'Essay Scorer', description: 'AI-powered essay evaluation with detailed feedback', usage: 3420, status: 'active', icon: Brain },
    { id: 2, name: 'Math Tutor', description: 'Step-by-step math problem solving assistant', usage: 2890, status: 'active', icon: Bot },
    { id: 3, name: 'Language Partner', description: 'Conversational AI for language practice', usage: 1560, status: 'active', icon: MessageSquare },
    { id: 4, name: 'Code Helper', description: 'Programming assistance and code review', usage: 980, status: 'beta', icon: Zap },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>AI Lab</h1>
        <button className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: 'var(--primary)' }}>
          + Add AI Tool
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-color)' }}>
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