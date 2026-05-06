import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Calendar, Tag, Pin, Loader2, Bell } from 'lucide-react';
import { request } from '../../../utils/apiClient';

const CATEGORY_COLORS = {
  exam:      { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
  holiday:   { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
  event:     { bg: '#ede9fe', text: '#7c3aed', border: '#ddd6fe' },
  emergency: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
  general:   { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
};

const getCategoryStyle = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.general;

export const Announcements = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    request('/school/announcements?limit=100')
      .then(res => {
        if (cancelled) return;
        const list = res.announcements || res.items || [];
        // Sort: pinned first, then newest
        list.sort((a, b) => {
          if (b.pinned !== a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setAnnouncements(list);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const categories = ['all', 'exam', 'event', 'holiday', 'emergency'];
  const filtered = filter === 'all' ? announcements : announcements.filter(a => a.category === filter);

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Megaphone size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Announcements
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {announcements.length} announcements from school
            </p>
          </div>
        </div>
      </motion.div>

      {/* Category filter */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                filter === cat
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat === 'all' ? `All (${announcements.length})` : cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gray-300" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Bell size={40} className="text-gray-200" />
          <p className="text-gray-400 font-medium">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ann, i) => {
            const style = getCategoryStyle(ann.category);
            return (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="nova-card p-5 hover:shadow-md transition-all duration-200"
                style={{ borderLeft: `4px solid ${style.border}` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {ann.pinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Pin size={10} /> Pinned
                        </span>
                      )}
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                      >
                        {ann.category}
                      </span>
                      {ann.scope === 'class' && (
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          Class only
                        </span>
                      )}
                    </div>
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">{ann.title}</h3>
                    <p className="text-[13px] text-gray-600 leading-relaxed">{ann.body}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Calendar size={11} />
                    {new Date(ann.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
