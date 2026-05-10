import { useState, useEffect } from 'react';
import { Bell, Plus, Edit2, Trash2, RefreshCw, Search } from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

const AdminAnnouncements = ({ user, addToast }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const res = await apiRequest('/school/announcements');
      setAnnouncements(res?.announcements ?? res?.items ?? res ?? []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
      addToast?.('Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
    addToast?.('Announcements refreshed', 'success');
  };

  const filtered = announcements.filter(a =>
    (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.body || a.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Announcements</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading...' : `${announcements.length} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border text-sm hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'var(--border-color)' }}
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2"
            style={{ background: 'var(--primary)' }}>
            <Plus size={16} /> New Announcement
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm"
          style={{ borderColor: 'var(--border-color)' }}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 h-32" style={{ border: '1px solid var(--border-color)' }}>
              <div className="animate-pulse flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
                  <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 flex flex-col items-center" style={{ border: '1px solid var(--border-color)' }}>
          <Bell size={40} style={{ color: 'var(--text-muted)' }} className="mb-3 opacity-30" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {searchTerm ? 'No announcements match your search' : 'No announcements yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <Bell size={20} className="text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : '—'}
                        {ann.priority && (
                          <span className={`ml-2 inline-flex items-center ${
                            ann.priority === 'high' ? 'text-red-600' :
                            ann.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            • {ann.priority}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {ann.body || ann.content || '—'}
                  </p>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    {ann.category && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                        {ann.category}
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      ann.scope === 'all' ? 'bg-blue-100 text-blue-700' :
                      ann.scope === 'class' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {ann.scope === 'all' ? 'All' : ann.scope === 'class' ? `Class ${ann.class_id || ''}` : ann.scope || '—'}
                    </span>
                    {ann.pinned && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                        📌 Pinned
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => addToast?.('Edit — coming soon', 'info')}>
                    <Edit2 size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => addToast?.('Delete — coming soon', 'warning')}>
                    <Trash2 size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;