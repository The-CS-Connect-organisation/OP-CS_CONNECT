import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertTriangle, Trash2, Shield, Clock, CheckCircle, X } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';

export function AnonymousReport({ user, addToast }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewReport, setViewReport] = useState(null);
  const [formData, setFormData] = useState({ type: 'bullying', severity: 'medium', title: '', description: '', location: '', dateOfIncident: '', isAnonymous: true, evidenceUrls: '' });

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getReports();
      if (res?.success) setReports(res.reports || []);
    } catch (e) { addToast?.('Failed to load reports', 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        type: formData.type, severity: formData.severity, title: formData.title,
        description: formData.description, location: formData.location || null,
        dateOfIncident: formData.dateOfIncident || null,
        isAnonymous: formData.isAnonymous,
        evidenceUrls: formData.evidenceUrls ? formData.evidenceUrls.split(',').map(u => u.trim()).filter(Boolean) : [],
      };
      const res = await teacherApi.createReport(data);
      if (res?.success) {
        addToast?.('Report submitted successfully', 'success');
        setShowForm(false);
        setFormData({ type: 'bullying', severity: 'medium', title: '', description: '', location: '', dateOfIncident: '', isAnonymous: true, evidenceUrls: '' });
        loadReports();
      }
    } catch (e) { addToast?.('Failed to submit report', 'error'); }
  };

  const handleStatusChange = async (reportId, status) => {
    try {
      await teacherApi.updateReportStatus(reportId, { status });
      addToast?.(`Report marked as ${status}`, 'success');
      loadReports();
    } catch (e) { addToast?.('Failed to update status', 'error'); }
  };

  const severityColors = { low: 'bg-blue-500/10 text-blue-400', medium: 'bg-amber-500/10 text-amber-400', high: 'bg-orange-500/10 text-orange-400', urgent: 'bg-rose-500/10 text-rose-400' };
  const typeLabels = { bullying: 'Bullying', theft: 'Theft', vandalism: 'Vandalism', safety: 'Safety', academic_misconduct: 'Academic Misconduct', harassment: 'Harassment', other: 'Other' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Anonymous Reporting</h2>
          <p className="text-sm text-slate-400 mt-1">Report incidents safely and confidentially</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-500 text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2">
          <AlertTriangle size={16} /> Submit Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', count: reports.length, gradient: 'from-blue-500 to-indigo-500' },
          { label: 'Under Review', count: reports.filter(r => r.status === 'under_review').length, gradient: 'from-amber-500 to-orange-500' },
          { label: 'Investigating', count: reports.filter(r => r.status === 'investigating').length, gradient: 'from-violet-500 to-purple-500' },
          { label: 'Resolved', count: reports.filter(r => r.status === 'resolved').length, gradient: 'from-emerald-500 to-teal-500' },
        ].map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-4 shadow-lg`}>
            <p className="text-2xl font-black text-white">{s.count}</p>
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">All Reports</h3>
          <Shield size={16} className="text-emerald-400" />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
            <p>No reports yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {reports.map((report) => (
                <motion.div key={report.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-white/5 backdrop-blur-sm border-slate-700/40 hover:border-slate-600 transition-all cursor-pointer"
                  onClick={() => setViewReport(report)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${severityColors[report.severity] || 'bg-slate-800'} border`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white truncate">{report.title}</p>
                      {report.isAnonymous && <span className="text-[8px] bg-slate-600 text-slate-300 px-1.5 py-0.5 rounded">Anonymous</span>}
                    </div>
                    <p className="text-xs text-slate-400">{typeLabels[report.type] || report.type} · {report.description?.substring(0, 80)}{report.description?.length > 80 ? '...' : ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${severityColors[report.severity] || 'bg-slate-800'}`}>{report.status}</span>
                    <span className="text-[10px] text-slate-600">{new Date(report.createdAt).toLocaleDateString()}</span>
                    {['under_review', 'investigating'].includes(report.status) && (user?.role === 'admin' || user?.role === 'teacher') && (
                      <select value={report.status} onChange={e => handleStatusChange(report.id, e.target.value)}
                        className="text-[10px] bg-slate-800 text-slate-300 border border-slate-600 rounded px-1.5 py-0.5">
                        <option value="under_review">Under Review</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
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
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Submit Anonymous Report</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select options={['bullying', 'theft', 'vandalism', 'safety', 'academic_misconduct', 'harassment', 'other']} labels={['Bullying', 'Theft', 'Vandalism', 'Safety Concern', 'Academic Misconduct', 'Harassment', 'Other']} value={formData.type} onChange={v => setFormData({ ...formData, type: v })} className="w-full" />
                <Select options={['low', 'medium', 'high', 'urgent']} labels={['Low', 'Medium', 'High', 'Urgent']} value={formData.severity} onChange={v => setFormData({ ...formData, severity: v })} className="w-full" />
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Report title" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-rose-500" />
                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the incident in detail (minimum 10 characters)..." rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-none" />
                <input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Location (optional)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-rose-500" />
                <input type="date" value={formData.dateOfIncident} onChange={e => setFormData({ ...formData, dateOfIncident: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white focus:outline-none focus:border-rose-500" />
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="anon" checked={formData.isAnonymous} onChange={e => setFormData({ ...formData, isAnonymous: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="anon" className="text-sm text-slate-300">Submit anonymously</label>
                </div>
                <input value={formData.evidenceUrls} onChange={e => setFormData({ ...formData, evidenceUrls: e.target.value })} placeholder="Evidence image URLs (comma separated, optional)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-rose-500" />
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-rose-500/20 transition-all">Submit Report</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {viewReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewReport(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{viewReport.title}</h3>
                <button onClick={() => setViewReport(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${severityColors[viewReport.severity]}`}>{viewReport.severity}</span>
                  <span className="text-slate-400">{typeLabels[viewReport.type]}</span>
                </div>
                <p className="text-slate-300">{viewReport.description}</p>
                {viewReport.location && <p className="text-slate-400 flex items-center gap-1"><Shield size={14} /> {viewReport.location}</p>}
                <p className="text-[10px] text-slate-500">Status: <span className="capitalize font-bold">{viewReport.status}</span> · {new Date(viewReport.createdAt).toLocaleString()}</p>
                {viewReport.isAnonymous && <p className="text-[10px] text-slate-500">Reporter: Anonymous</p>}
                {viewReport.notes?.length > 0 && (
                  <div className="border-t border-slate-700 pt-3 mt-3">
                    <p className="text-[10px] text-slate-400 font-bold mb-1">Notes:</p>
                    {viewReport.notes.map((n, i) => <p key={i} className="text-[10px] text-slate-300">- {n.text} ({n.by}, {n.role})</p>)}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}