import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Trash2, Plus, Download, Filter, BookOpen, Award, X } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';

export function EPortfolio({ user, addToast }) {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', academicYear: new Date().getFullYear().toString(), grade: '', section: '', skills: '', objectives: '' });

  useEffect(() => { loadPortfolios(); }, []);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getPortfolios();
      if (res?.success) setPortfolios(res.portfolios || []);
    } catch (e) { addToast?.('Failed to load portfolios', 'error'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!formData.studentId) { addToast?.('Student ID required', 'error'); return; }
    try {
      const res = await teacherApi.createPortfolio({ ...formData, skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean), objectives: formData.objectives.split(',').map(s => s.trim()).filter(Boolean) });
      if (res?.success) {
        addToast?.('Portfolio created', 'success');
        setShowForm(false);
        setFormData({ studentId: '', academicYear: new Date().getFullYear().toString(), grade: '', section: '', skills: '', objectives: '' });
        loadPortfolios();
      }
    } catch (e) { addToast?.('Failed to create portfolio', 'error'); }
  };

  const handleExport = async (portfolioId) => {
    try {
      const res = await teacherApi.exportPortfolio(portfolioId);
      if (res?.success) {
        addToast?.('Portfolio exported successfully', 'success');
      }
    } catch (e) { addToast?.('Export failed', 'error'); }
  };

  const handleAddItem = async (portfolioId) => {
    const title = prompt('Item title:');
    if (!title) return;
    const type = prompt('Type (work_sample, certificate, project, reflection, assessment, award):') || 'work_sample';
    const subject = prompt('Subject:') || '';
    const description = prompt('Description:') || '';

    try {
      const res = await teacherApi.addPortfolioItem(portfolioId, { title, type, subject, description });
      if (res?.success) {
        addToast?.('Item added', 'success');
        loadPortfolios();
      }
    } catch (e) { addToast?.('Failed to add item', 'error'); }
  };

  const handleDeleteItem = async (portfolioId, itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await teacherApi.deletePortfolioItem(portfolioId, itemId);
      addToast?.('Item deleted', 'success');
      loadPortfolios();
    } catch (e) { addToast?.('Failed to delete', 'error'); }
  };

  const typeIcons = { work_sample: '📄', certificate: '🏆', project: '🚀', reflection: '💭', assessment: '📝', award: '🎖️' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Digital E-Portfolio</h2>
          <p className="text-sm text-slate-400 mt-1">Manage student portfolios and learning artifacts</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-violet-500/20 transition-all flex items-center gap-2">
          <Plus size={16} /> Create Portfolio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-500">Loading portfolios...</div>
          ) : portfolios.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p>No portfolios yet</p>
            </div>
          ) : (
            portfolios.map((p) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700/40 overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">{p.student?.name || p.studentId}</h3>
                      <p className="text-xs text-slate-500">Academic Year: {p.academicYear} {p.grade && '· ' + p.grade} {p.section && p.section}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleExport(p.id)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-emerald-400 transition-colors" title="Export">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.skills && p.skills.map((s, i) => <span key={i} className="text-[9px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded">{s}</span>)}
                  </div>
                  {p.objectives && p.objectives.length > 0 && (
                    <p className="text-xs text-slate-400 mb-4">🎯 {p.objectives.length} objectives set</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                    <span className="text-xs text-slate-500">{p.items?.length || 0} items</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleAddItem(p.id)} className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-300 px-2 py-1 rounded transition-colors">Add Item</button>
                      {p.items && p.items.length > 0 && (
                        <button onClick={() => handleDeleteItem(p.id, p.items[p.items.length - 1].id)} className="text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-2 py-1 rounded transition-colors">Remove Last</button>
                      )}
                    </div>
                  </div>
                </div>
                {p.items && p.items.length > 0 && (
                  <div className="px-5 pb-4 border-t border-slate-700/20">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recent Items</p>
                    <div className="space-y-1.5">
                      {p.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                          <span className="text-sm">{typeIcons[item.type] || '📄'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-200 truncate">{item.title}</p>
                            {item.subject && <p className="text-[9px] text-slate-500">{item.subject}</p>}
                          </div>
                          <span className="text-[9px] text-slate-600">{item.type?.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Create Portfolio Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Create New Portfolio</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input required value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} placeholder="Student ID" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500" />
                <input value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} placeholder="Grade (e.g., 10)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400" />
                <input value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} placeholder="Section (e.g., A)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400" />
                <input value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="Skills (comma separated)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400" />
                <input value={formData.objectives} onChange={e => setFormData({ ...formData, objectives: e.target.value })} placeholder="Learning objectives (comma separated)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400" />
                <button onClick={handleCreate} className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-violet-500/20 transition-all">Create Portfolio</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}