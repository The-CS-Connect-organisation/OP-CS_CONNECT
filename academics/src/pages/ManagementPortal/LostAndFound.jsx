import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Trash2, AlertTriangle, CheckCircle, Clock, MapPin, Upload, X } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';
import { Select } from '../../components/ui/Select';

export function LostAndFound({ user, addToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', category: '', status: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', type: 'lost', category: '', location: '', date: new Date().toISOString().split('T')[0], isAnonymous: false, contactInfo: '' });
  const [claimModal, setClaimModal] = useState(null);
  const [claimData, setClaimData] = useState({ claimantName: '', claimantEmail: '', description: '', proofDescription: '' });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getLostItems();
      if (res?.success) setItems(res.data || []);
    } catch (e) { addToast?.('Failed to load items', 'error'); }
    finally { setLoading(false); }
  };

  const filteredItems = items.filter(i =>
    (!filters.type || i.type === filters.type) &&
    (!filters.category || i.category === filters.category) &&
    (!filters.status || i.status === filters.status)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await teacherApi.createLostItem(formData);
      if (res?.success) {
        addToast?.('Item reported successfully', 'success');
        setShowForm(false);
        setFormData({ title: '', description: '', type: 'lost', category: '', location: '', date: new Date().toISOString().split('T')[0], isAnonymous: false, contactInfo: '' });
        loadItems();
      }
    } catch (e) { addToast?.('Failed to report item', 'error'); }
  };

  const handleClaim = async () => {
    if (!claimModal) return;
    try {
      const res = await teacherApi.claimLostItem(claimModal.id, claimData);
      if (res?.success) {
        addToast?.('Claim submitted for review', 'success');
        setClaimModal(null);
        setClaimData({ claimantName: '', claimantEmail: '', description: '', proofDescription: '' });
        loadItems();
      }
    } catch (e) { addToast?.('Failed to submit claim', 'error'); }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await teacherApi.deleteLostItem(itemId);
      addToast?.('Item deleted', 'success');
      loadItems();
    } catch (e) { addToast?.('Failed to delete', 'error'); }
  };

  const statusColors = { open: 'bg-blue-500/10 text-blue-400 border-blue-500/30', claimed: 'bg-amber-500/10 text-amber-400 border-amber-500/30', resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  const typeIcons = { lost: '🔍', found: '✅' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Lost & Found</h2>
          <p className="text-sm text-slate-400 mt-1">Report and track lost/found items</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all">
          Report Item
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Lost', count: items.filter(i => i.type === 'lost').length, color: 'from-red-500 to-rose-500' },
          { label: 'Found', count: items.filter(i => i.type === 'found').length, color: 'from-emerald-500 to-teal-500' },
          { label: 'Resolved', count: items.filter(i => i.status === 'resolved').length, color: 'from-blue-500 to-indigo-500' },
          { label: 'Open Claims', count: items.filter(i => i.status === 'claimed').length, color: 'from-amber-500 to-orange-500' }
        ].map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 shadow-lg`}>
            <p className="text-2xl font-black text-white">{s.count}</p>
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">All Items</h3>
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-500" />
            <Select options={['', 'lost', 'found']} labels={['All Types', 'Lost', 'Found']} value={filters.type} onChange={v => setFilters({ ...filters, type: v })} className="w-32" />
            <Select options={['', 'personal', 'electronic', 'clothing', 'book', 'bag', 'jewelry', 'other']} labels={['All Categories', 'Personal', 'Electronic', 'Clothing', 'Book', 'Bag', 'Jewelry', 'Other']} value={filters.category} onChange={v => setFilters({ ...filters, category: v })} className="w-36" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
            <p>No items found</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-white/5 backdrop-blur-sm border-slate-700/40 hover:border-slate-600 transition-all">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${statusColors[item.status] || 'bg-slate-800 text-slate-400'}`}>
                    {typeIcons[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white truncate">{item.title}</p>
                      {item.isAnonymous && <span className="text-[8px] bg-slate-600 text-slate-300 px-1.5 py-0.5 rounded">Anonymous</span>}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{item.description?.substring(0, 100)}{item.description?.length > 100 ? '...' : ''}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {item.location}</span>
                      <span>{item.date}</span>
                      <span className="capitalize">{item.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${statusColors[item.status] || 'bg-slate-800'} border`}>{item.status}</span>
                    {item.type === 'found' && item.status === 'open' && user?.id !== item.reportedBy && (
                      <button onClick={() => setClaimModal(item)} className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/30 transition-colors">Claim</button>
                    )}
                    {(user?.id === item.reportedBy || user?.role === 'admin') && (
                      <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Report Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Report {formData.type === 'lost' ? 'Lost' : 'Found'} Item</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-3">
                  {['lost', 'found'].map(t => (
                    <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${formData.type === t ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 border border-slate-700'}`}>
                      {t === 'lost' ? '🔍 Lost' : '✅ Found'}
                    </button>
                  ))}
                </div>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Item title" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed description..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <Select options={['personal', 'electronic', 'clothing', 'book', 'bag', 'jewelry', 'other']} labels={['Personal', 'Electronic', 'Clothing', 'Book', 'Bag', 'Jewelry', 'Other']} value={formData.category} onChange={v => setFormData({ ...formData, category: v })} className="w-full" />
                  <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Last known location" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="anonymous" checked={formData.isAnonymous} onChange={e => setFormData({ ...formData, isAnonymous: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="anonymous" className="text-sm text-slate-300">Report anonymously</label>
                </div>
                {!formData.isAnonymous && (
                  <input value={formData.contactInfo} onChange={e => setFormData({ ...formData, contactInfo: e.target.value })} placeholder="Contact info (phone/email)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
                )}
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all">Submit Report</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claim Modal */}
      <AnimatePresence>
        {claimModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Claim Found Item</h3>
              <p className="text-sm text-slate-300 mb-4">Provide details to verify your claim for "<strong>{claimModal.title}</strong>"</p>
              <div className="space-y-3">
                <input value={claimData.claimantName} onChange={e => setClaimData({ ...claimData, claimantName: e.target.value })} placeholder="Your full name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400" />
                <input value={claimData.claimantEmail} onChange={e => setClaimData({ ...claimData, claimantEmail: e.target.value })} placeholder="Email (optional)" type="email" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400" />
                <textarea value={claimData.proofDescription} onChange={e => setClaimData({ ...claimData, proofDescription: e.target.value })} placeholder="Describe proof of ownership..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 resize-none" />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setClaimModal(null)} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800">Cancel</button>
                  <button onClick={handleClaim} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:opacity-90">Submit Claim</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}