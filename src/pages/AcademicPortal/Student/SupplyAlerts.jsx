import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, Loader2, Package, TrendingUp, RefreshCw } from 'lucide-react';
import { studentApi } from '../../services/apiDataLayer';
import { getSocket } from '../../utils/socketClient';

const statusColors = {
  submitted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  overdue: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const statusLabels = {
  submitted: 'Submitted',
  pending: 'Pending',
  overdue: 'Overdue',
};

export function SupplyAlerts({ user, addToast }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, submitted: 0, pending: 0, overdue: 0 });

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await studentApi.getStudentSupplyAlerts();
      if (res?.success) {
        setAlerts(res.alerts || []);
        setSummary(res.summary || { total: 0, submitted: 0, pending: 0, overdue: 0 });
      }
    } catch (e) {
      addToast?.('Failed to load supply alerts', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  // WebSocket listener for real-time supply alerts
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewAlert = (data) => {
      if (data.type === 'supplies') {
        addToast?.(`📦 New supply alert: ${data.message?.substring(0, 60)}...`, 'warning');
        loadAlerts();
      }
    };

    socket.on('notification:new', handleNewAlert);
    return () => { socket.off('notification:new', handleNewAlert); };
  }, [loadAlerts, addToast]);

  const getStatus = (alert) => {
    if (alert.isSubmitted) return 'submitted';
    if (alert.isLate) return 'overdue';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">📦 Supply Alerts</h2>
          <p className="text-sm text-slate-400 mt-1">Track your pending supply requirements</p>
        </div>
        <button onClick={loadAlerts} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div className="nova-card p-4" whileHover={{ y: -2 }}>
          <div className="text-center">
            <p className="text-3xl font-black text-blue-400">{summary.total}</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Total Alerts</p>
          </div>
        </motion.div>
        <motion.div className="nova-card p-4" whileHover={{ y: -2 }}>
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-400">{summary.submitted}</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Submitted</p>
          </div>
        </motion.div>
        <motion.div className="nova-card p-4" whileHover={{ y: -2 }}>
          <div className="text-center">
            <p className="text-3xl font-black text-amber-400">{summary.pending}</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Pending</p>
          </div>
        </motion.div>
        <motion.div className="nova-card p-4" whileHover={{ y: -2 }}>
          <div className="text-center">
            <p className="text-3xl font-black text-rose-400">{summary.overdue}</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Overdue</p>
          </div>
        </motion.div>
      </div>

      {/* Alert Progress */}
      {summary.total > 0 && (
        <motion.div className="nova-card p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-300">Completion Progress</p>
            <span className="text-sm font-bold text-emerald-400">{Math.round((summary.submitted / summary.total) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(summary.submitted / summary.total) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        <AnimatePresence>
          {loading ? (
            <div className="text-center py-8 text-slate-500">
              <Loader2 size={24} className="mx-auto mb-2 animate-spin text-slate-400" />
              <p>Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle size={32} className="mx-auto mb-3 opacity-30 text-emerald-400" />
              <p className="font-medium">No supply alerts!</p>
              <p className="text-xs mt-1">You're all caught up with your supplies.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const status = getStatus(alert);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`p-4 rounded-xl border transition-all ${statusColors[status]}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        status === 'submitted' ? 'bg-emerald-500/20' : status === 'overdue' ? 'bg-rose-500/20' : 'bg-amber-500/20'
                      }`}>
                        {status === 'submitted' ? (
                          <CheckCircle size={14} className="text-emerald-400" />
                        ) : status === 'overdue' ? (
                          <AlertTriangle size={14} className="text-rose-400" />
                        ) : (
                          <Package size={14} className="text-amber-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{alert.title}</p>
                        <p className="text-[10px] text-slate-400">{alert.subject}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      status === 'submitted' ? 'bg-emerald-500/20 text-emerald-400' :
                      status === 'overdue' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {statusLabels[status]}
                    </span>
                  </div>

                  {alert.suppliesNeeded && alert.suppliesNeeded.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {alert.suppliesNeeded.map((supply, i) => (
                        <span key={i} className="text-[9px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                          📎 {supply}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(alert.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {alert.classId && <span>📚 Class: {alert.classId}</span>}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}