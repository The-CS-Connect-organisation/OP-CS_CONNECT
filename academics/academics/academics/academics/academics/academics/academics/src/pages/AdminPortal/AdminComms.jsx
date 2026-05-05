import { useState } from 'react';
import { MessageCircle, Mail, Phone, Users, Send, Clock } from 'lucide-react';

const AdminComms = ({ user, addToast }) => {
  const [stats] = useState({
    totalMessages: 2840,
    unreadCount: 45,
    avgResponseTime: '2.5h',
    satisfaction: 92,
  });

  const [channels] = useState([
    { id: 1, name: 'Email', icon: Mail, messages: 1520, unread: 23, status: 'active' },
    { id: 2, name: 'SMS', icon: MessageCircle, messages: 890, unread: 12, status: 'active' },
    { id: 3, name: 'Phone', icon: Phone, messages: 430, unread: 10, status: 'active' },
  ]);

  const [recentMessages] = useState([
    { id: 1, from: 'Sarah Wilson', type: 'Email', subject: 'Question about timetable', time: '10 min ago', unread: true },
    { id: 2, from: 'John Doe (Parent)', type: 'SMS', subject: 'Fee payment confirmation', time: '25 min ago', unread: true },
    { id: 3, from: 'Emily Brown', type: 'Email', subject: 'Lab equipment request', time: '1 hour ago', unread: false },
    { id: 4, from: 'Michael Lee', type: 'Phone', subject: 'Meeting request', time: '2 hours ago', unread: false },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Communications Hub</h1>
        <button className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2"
          style={{ background: 'var(--primary)' }}>
          <Send size={16} /> New Message
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-3">
            <MessageCircle size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalMessages.toLocaleString()}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Messages</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center mb-3">
            <Mail size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.unreadCount}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Unread</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center mb-3">
            <Clock size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.avgResponseTime}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Avg Response</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center mb-3">
            <Users size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.satisfaction}%</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Satisfaction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Messages</h2>
          </div>
          <div className="divide-y" style={{ divideColor: 'var(--border-color)' }}>
            {recentMessages.map((msg) => (
              <div key={msg.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => addToast?.('Opening message...', 'info')}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{msg.from}</span>
                      {msg.unread && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{msg.subject}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{msg.time} • {msg.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-color)' }}>
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Communication Channels</h2>
          <div className="space-y-4">
            {channels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--primary-light)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <channel.icon size={20} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{channel.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{channel.messages} messages</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>{channel.unread} unread</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">{channel.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComms;