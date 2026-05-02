import { useState } from 'react';
import { Bell, Plus, Edit2, Trash2, Send, Eye } from 'lucide-react';

const AdminAnnouncements = ({ user, addToast }) => {
  const [announcements] = useState([
    { id: 1, title: 'Sports Day Event', content: 'Annual sports day will be held on May 15th. All students must participate.', audience: 'All', date: '2024-04-28', status: 'published' },
    { id: 2, title: 'Exam Schedule Released', content: 'Final exam schedule has been uploaded. Check your student portal.', audience: 'Students', date: '2024-04-25', status: 'published' },
    { id: 3, title: 'Teacher Training', content: 'Professional development workshop on May 5th. Mandatory attendance.', audience: 'Teachers', date: '2024-04-24', status: 'draft' },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Announcements</h1>
        <button className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2"
          style={{ background: 'var(--primary)' }}>
          <Plus size={16} /> New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Bell size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{ann.title}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ann.date}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{ann.content}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    ann.audience === 'All' ? 'bg-blue-100 text-blue-700' :
                    ann.audience === 'Students' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {ann.audience}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    ann.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {ann.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => addToast?.('Preview announcement', 'info')}>
                  <Eye size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => addToast?.('Edit announcement', 'info')}>
                  <Edit2 size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => addToast?.('Delete announcement', 'warning')}>
                  <Trash2 size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAnnouncements;