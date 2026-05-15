import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Send, AlertTriangle, TrendingUp, Package, Clock, X, ChevronDown, CheckCircle, Loader2, BarChart2 } from 'lucide-react';
import { teacherApi, parentApi } from '../../services/apiDataLayer';
import { getSocket } from '../../utils/socketClient';

const costEstimates = {
  notebook: 2.5, pen: 0.5, pencil: 0.3, eraser: 0.25,
  ruler: 1.0, calculator: 15.0, textbook: 25.0,
  folder: 3.0, highlighter: 1.5, markers: 4.0,
  glue: 2.0, scissors: 3.5, paper: 1.0, binder: 5.0,
};

const NOTIFICATION_TYPES = [
  { value: 'info', label: 'ℹ️ Information', color: 'bg-blue-500' },
  { value: 'warning', label: '⚠️ Warning', color: 'bg-amber-500' },
  { value: 'urgent', label: '🚨 Urgent', color: 'bg-rose-500' },
];

export function StationeryAlertCenter({ user, addToast }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [notificationData, setNotificationData] = useState({ classId: '', subject: '', message: '', type: 'info' });
  const [sending, setSending] = useState(false);
  const [sentResult, setSentResult] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getSupplyAnalytics();
      if (res?.success) setAnalytics(res.analytics);
    } catch (e) {
      addToast?.('Failed to load supply analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  // WebSocket listener for live analytics updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleNotification = (data) => {
      if (data.type === 'supplies') {
        addToast?.(`📦 Stationery alert sent: ${data.message?.substring(0, 60)}...`, 'info');
        loadAnalytics();
      }
    };
    socket.on('notification:new', handleNotification);
    return () => { socket.off('notification:new', handleNotification); };
  }, [loadAnalytics, addToast]);

  const handleSendBulkNotification = async () => {
    if (!notificationData.classId || !notificationData.message.trim()) {
      addToast?.('Please select a class and enter a message', 'error');
      return;
    }
    try {
      setSending(true);
      setSentResult(null);
      const res = await teacherApi.sendBulkParentNotification({
        classId: notificationData.classId,
        subject: notificationData.subject,
        message: notificationData.message,
        type: notificationData.type,
      });
      setSentResult(res);
      addToast?.(`📨 Notification sent to ${res?.notifiedCount || 0} parents`, 'success');
      setShowNotificationModal(false);
      setNotificationData({ classId: '', subject: '', message: '', type: 'info' });
    } catch (e) {
      addToast?.('Failed to send notification', 'error');
    } finally {
      setSending(false);
    }
  };

  const getCostTier = (cost) => {
    if (cost < 10) return { label: 'Low', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    if (cost < 50) return { label: 'Medium', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return { label: 'High', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
  };

  const upcomingAlerts = analytics?.upcomingAlerts || [];
  const supplySummary = analytics?.supplySummary || [];
  const costBreakdown = analytics?.costBreakdown || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Stationery Alert Center</h2>
          <p className="text-sm text-slate-400 mt-1">Supply analytics and bulk parent notifications</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAnalytics} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={() => setShowNotificationModal(true)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <Send size={14} /> Bulk Notify Parents
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 nova-card animate-pulse" />
          ))}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div className="nova-card p-5" whileHover={{ y: -2 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Package size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Assignments with Supplies</p>
                <p className="text-2xl font-black text-white">{analytics.totalAssignmentsWithSupplies}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">{analytics.uniqueSupplyItems} unique supply items tracked</p>
          </motion.div>

          <motion.div className="nova-card p-5" whileHover={{ y: -2 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <TrendingUp size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Estimated Budget</p>
                <p className="text-2xl font-black text-white">${analytics.totalBudgetEstimate.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                🟢 Low: {costBreakdown.low}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                🟡 Med: {costBreakdown.medium}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                🔴 High: {costBreakdown.high}
              </span>
            </div>
          </motion.div>

          <motion.div className="nova-card p-5" whileHover={{ y: -2 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <AlertTriangle size={18} className="text-rose-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Upcoming Alerts (7 days)</p>
                <p className="text-2xl font-black text-white">{upcomingAlerts.length}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">due dates approaching with supply needs</p>
          </motion.div>
        </div>
      ) : null}

      {/* Supply Breakdown Table */}
      <div className="nova-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 size={16} className="text-indigo-500" />
            Supply Demand Breakdown
          </h3>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : supplySummary.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No supply data available yet. Assign supplies to trigger alerts.
          </div>
        ) : (
          <div className="space-y-3">
            {supplySummary.map((item) => {
              const tier = getCostTier(item.estimatedCost);
              return (
                <motion.div key={item.item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold capitalize ${tier.color}`}>
                      {item.item.substring(0, 4)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 capitalize">{item.item}</p>
                      <p className="text-[10px] text-slate-500">{item.classesAffected} class{item.classesAffected > 1 ? 'es' : ''} affected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono font-bold text-gray-700">×{item.totalNeeded}</span>
                    <span className="text-sm font-bold">${item.estimatedCost.toFixed(2)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Supply Alerts */}
      <div className="nova-card p-6">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Clock size={16} className="text-amber-500" />
          Upcoming Supply Deadlines (Next 7 Days)
        </h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
          </div>
        ) : upcomingAlerts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No upcoming alerts this week 🎉</p>
        ) : (
          <div className="space-y-3">
            {upcomingAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-[10px] text-slate-500">
                    📎 {alert.supplies.join(', ')} · Due: {new Date(alert.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full font-bold">
                  Due Soon
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Notification Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Send size={18} className="text-blue-400" /> Bulk Parent Notification
                </h3>
                <button onClick={() => setShowNotificationModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>

              {sentResult && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                  ✅ {sentResult.message || 'Notifications sent successfully'}
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Target Class *</label>
                  <input
                    value={notificationData.classId}
                    onChange={e => setNotificationData({ ...notificationData, classId: e.target.value })}
                    placeholder="Enter class ID (e.g., class-10-a)"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Subject</label>
                  <input
                    value={notificationData.subject}
                    onChange={e => setNotificationData({ ...notificationData, subject: e.target.value })}
                    placeholder="e.g., Stationery Alert"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Notification Type</label>
                  <div className="flex gap-2 mt-1">
                    {NOTIFICATION_TYPES.map(nt => (
                      <button key={nt.value}
                        onClick={() => setNotificationData({ ...notificationData, type: nt.value })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          notificationData.type === nt.value
                            ? `${nt.color} text-white`
                            : 'bg-white/5 text-slate-400 border border-slate-700'
                        }`}>
                        {nt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Message *</label>
                  <textarea
                    value={notificationData.message}
                    onChange={e => setNotificationData({ ...notificationData, message: e.target.value })}
                    rows={4}
                    placeholder="Enter notification message..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <button
                  onClick={handleSendBulkNotification}
                  disabled={sending || !notificationData.classId || !notificationData.message.trim()}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {sending ? 'Sending...' : `Send to Parents`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}