import { useState, useEffect } from 'react';
import { Bell, Plus, Edit2, Trash2, Send, Eye, Loader2 } from 'lucide-react';
import { request } from '../../utils/apiClient';

const CATEGORY_COLORS = {
  exam: 'bg-yellow-100 text-yellow-700',
  holiday: 'bg-green-100 text-green-700',
  event: 'bg-purple-100 text-purple-700',
  emergency: 'bg-red-100 text-red-700',
  general: 'bg-blue-100 text-blue-700',
};

const AdminAnnouncements = ({ user, addToast }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('event');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    request('/school/announcements?limit=100')
      .then(res => {
        if (!cancelled) {
          const list = res.announcements || res.items || [];
          list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setAnnouncements(list);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;
    setCreating(true);
    try {
      const res = await request('/school/announcements', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, body: newBody, category: newCategory, scope: 'school' }),
      });
      setAnnouncements(prev => [res.announcement, ...prev]);
      setNewTitle(''); setNewBody(''); setShowCreate(false);
      addToast?.('Announcement published!', 'success');
    } catch (err) {
      addToast?.('Failed to create announcement', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Announcements</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{announcements.length} total announcements</p>
        </div>
        <button onClick={() => setShowCreate(v => !v)}
          className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2 hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-5 space-y-4" style={{ border: '1px solid var(--border-color)' }}>
          <h3 className="font-semibold text-gray-800">New Announcement</h3>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" required
            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400" style={{ borderColor: 'var(--border-color)' }} />
          <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Body" required rows={3}
            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 resize-none" style={{ borderColor: 'var(--border-color)' }} />
          <div className="flex gap-3">
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm outline-none" style={{ borderColor: 'var(--border-color)' }}>
              {['exam','event','holiday','emergency'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" disabled={creating}
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              style={{ background: 'var(--primary)' }}>
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Publish
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100">Cancel</button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Bell size={18} className="text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>{ann.title}</h3>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {new Date(ann.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{ann.body}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[ann.category] || CATEGORY_COLORS.general}`}>
                      {ann.category}
                    </span>
                    {ann.pinned && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">📌 Pinned</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="text-center py-12 text-gray-400">No announcements yet. Create one above.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;