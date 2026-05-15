import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, X, FileText, Upload } from 'lucide-react';
import { studentApi } from '../../services/apiDataLayer';

export function SupplyAlerts({ user, addToast }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, submitted: 0, pending: 0, overdue: 0 });

  useEffect(() => { loadAlerts(); }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await studentApi.getStudentSupplyAlerts();
      if (res?.success) {
        setAlerts(res.alerts || []);
        setSummary(res.summary || { total: 0, submitted: 0, pending: 0, overdue: 0 });
      }
    } catch (e) { addToast?.('Failed to load supply alerts', 'error'); }
    finally { setLoading(false); }
  };

  const statusColors = {
    pending: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    submitted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    overdue: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const priorityItems = useMemo(() => {
    const items = alerts.filter(a => a.suppliesNeeded.length > 0);
    // Group by supply item
    const grouped = {};
    items.forEach(a => {
      a.suppliesNeeded.forEach(s => {
        if (!grouped[s]) grouped[s] = { item: s, count: 0, assignments: [] };
        grouped[s].count++;
        grouped[s].assignments.push(a.title);
      });
    });
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  }, [alerts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">📦 Supply Alerts</h2>
          <p className="text-sm text-slate-400 mt-1">Track assignments requiring supplies</p>
        </div>
        <button onClick={loadAlerts} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-slate-300 transition-all flex items-center gap-2">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-4 shadow-lg">
          <p className="text-2xl font-black text-white">{summary.total}</p>
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Total Alerts</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-4 shadow-lg">
          <p className="text-2xl font-black text-white">{summary.submitted}</p>
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Submitted</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 shadow-lg">
          <p className="text-2xl font-black text-white">{summary.pending}</p>
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Pending</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl p-4 shadow-lg">
          <p className="text-2xl font-black text-white">{summary.overdue}</p>
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Overdue</p>
        </div>
      </div>

      {/* Priority Items */}
      {priorityItems.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700/40 p-5">
          <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-widest">⚡ Priority Supply Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {priorityItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-slate-700/30 hover:border-slate-600 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                  <AlertTriangle size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{item.item}</p>
                  <p className="text-xs text-slate-400">Needed in {item.count} assignment{item.count > 1 ? 's' : ''}</p>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">{item.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700/40 overflow-hidden">
        <div className="p-5 border-b border-slate-700/30">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">All Assignments with Supplies</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading supply alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>No supply alerts at this time</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.03] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-white truncate">{alert.title}</p>
                    {!alert.isSubmitted && alert.isLate && (
                      <span className="text-[8px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-bold">OVERDUE</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {alert.subject} · Due: {new Date(alert.dueDate).toLocaleDateString()}
                    {alert.suppliesNeeded.length > 0 && (
                      <span className="ml-2">📦 {alert.suppliesNeeded.join(', ')}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-full capitalize ${
                    alert.isSubmitted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : alert.isLate
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {alert.isSubmitted ? 'Submitted' : alert.isLate ? 'Overdue' : 'Pending'}
                  </span>
                  {alert.notifyParents && <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">Parents Notified</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}