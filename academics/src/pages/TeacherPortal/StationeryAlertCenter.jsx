import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, AlertTriangle, CheckCircle, X, Plus, PlusCircle,
  FileText, Upload, Bell, MessageSquare, Shield
} from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';
import { Select } from '../../components/ui/Select';

export function StationeryAlertCenter({ user, addToast }) {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, sent: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    classId: '', title: '', message: '',
    supplies: '', type: 'supplies', priority: 'warning'
  });
  const [classes, setClasses] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getSupplyAnalytics();
      if (res?.success) {
        setAlerts(res.analytics?.upcomingAlerts || []);
        setSummary({
          total: res.analytics?.totalAssignmentsWithSupplies || 0,
          pending: res.analytics?.upcomingAlerts?.length || 0,
          sent: (res.analytics?.totalAssignmentsWithSupplies || 0) - (res.analytics?.upcomingAlerts?.length || 0)
        });
      }
      // Load classes
      const classRes = await teacherApi.getClassAttendanceView('', new Date().toISOString().split('T')[0]);
    } catch (e) { addToast?.('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  const handleSendBulkAlert = async () => {
    if (!formData.classId || !formData.message) {
      addToast?.('Class and message are required', 'error');
      return;
    }
    try {
      await teacherApi.sendBulkParentNotification({
        classId: formData.classId,
        subject: formData.title || 'Stationery Alert',
        message: formData.message,
        type: 'supplies'
      });
      addToast?.('Parents notified successfully!', 'success');
      setShowForm(false);
      setFormData({ classId: '', title: '', message: '', supplies: '', type: 'supplies', priority: 'warning' });
      loadData();
    } catch (e) { addToast?.('Failed to send notification', 'error'); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">📦 Stationery Alert Center</h2>
          <p className="text-sm text-slate-400 mt-1">Monitor supply needs and notify parents</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2">
          <Bell size={16} /> Notify Parents
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-4 shadow-lg">
          <p className="text-2xl font-black text-white">{summary.total}</p>
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Assignments w/ Supplies</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 shadow-lg">
          <p className="text-2xl font-black text-white">{summary.pending}</p>
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Pending Alerts</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-4 shadow-lg">
          <p className="text-2xl font-black text-white">{summary.sent}</p>
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Notified</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl p-4 shadow-lg">
          <p className="text-2xl font-black text-white">
            {(() => {
              const analytics = alerts;
              const costs = { notebook: 2.5, pen: 0.5, pencil: 0.3, eraser: 0.25, ruler: 1.0 };
              let total = 0;
              for (const a of analytics) {
                (a.supplies || []).forEach(s => { total += costs[s.toLowerCase()] || 2; });
              }
              return '$' + Math.round(total).toLocaleString();
            })()}
          </p>
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Est. Cost</p>
        </div>
      </div>

      {/* Supply Items Overview */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700/40 p-5">
        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-widest">Supply Items Overview</h3>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading analytics...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle size={32} className="mx-auto mb-2 opacity-30 text-emerald-400" />
            <p>No pending supply alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div key={alert.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-700/30 bg-white/[0.03] hover:border-slate-600 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white truncate">{alert.title}</p>
                      <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">{formatDate(alert.dueDate)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(alert.supplies || []).map((s, i) => (
                        <span key={i} className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.25 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bulk Notification Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Send Bulk Parent Notification</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })} placeholder="Class ID (e.g., class-10-a)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500" />
                <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Alert title (e.g., Stationery Needed)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500" />
                <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="Message to parents..." rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 resize-none"></textarea>
                <div className="grid grid-cols-2 gap-3">
                  <Select options={['supplies', 'general', 'urgent']} labels={['Supplies', 'General', 'Urgent']} value={formData.type} onChange={v => setFormData({ ...formData, type: v })} className="w-full" />
                  <Select options={['low', 'medium', 'high']} labels={['Low', 'Medium', 'High']} value={formData.priority} onChange={v => setFormData({ ...formData, priority: v })} className="w-full" />
                </div>
                <button onClick={handleSendBulkAlert} className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={18} /> Send to All Parents
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}