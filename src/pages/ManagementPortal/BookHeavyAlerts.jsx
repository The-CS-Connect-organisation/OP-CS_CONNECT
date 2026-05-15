import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Calendar, X, CheckCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { parentApi } from '../../services/apiDataLayer';
import { getSocket } from '../../utils/socketClient';

const HEAVY_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Science'];

const severityColors = {
  today: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  upcoming: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  light: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const severityBadges = {
  very-heavy: { text: 'Very Heavy', color: 'bg-rose-600 text-white' },
  heavy: { text: 'Heavy', color: 'bg-amber-500 text-white' },
  light: { text: 'Normal', color: 'bg-emerald-500 text-white' },
};

export function BookHeavyAlerts({ user, addToast }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await parentApi.getBookHeavyAlerts();
      if (res?.success) {
        setAlerts(res.alerts || []);
        const today = new Date().toISOString().split('T')[0];
        setTodayCount((res.alerts || []).filter(a => a.status === 'today').length);
        setUpcomingCount((res.alerts || []).filter(a => a.status === 'upcoming').length);
      }
    } catch (e) {
      addToast?.('Failed to load book heavy alerts', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // WebSocket listener for real-time heavy day alerts
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleHeavyAlert = (data) => {
      if (data.type === 'book-alert') {
        addToast?.(`📚 Heavy book day alert received for ${data.date || 'an upcoming date'}`, 'info');
        loadAlerts();
      }
    };

    socket.on('notification:new', handleHeavyAlert);
    return () => { socket.off('notification:new', handleHeavyAlert); };
  }, [loadAlerts, addToast]);

  const handleOpenDetail = (alert) => {
    setSelectedAlert(alert);
    setShowDetailModal(true);
  };

  const getSeverityStyle = (alert) => {
    if (alert.status === 'today') return severityColors.today;
    if (alert.heavyCount >= 5) return severityColors.today;
    return severityColors.upcoming;
  };

  const getSeverityBadge = (heavyCount) => {
    if (heavyCount >= 5) return severityBadges['very-heavy'];
    if (heavyCount >= 4) return severityBadges.heavy;
    return severityBadges.light;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">📚 Book Heavy Day Alerts</h2>
          <p className="text-sm text-slate-400 mt-1">Warnings about heavy textbook days for your child</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadAlerts} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="nova-card p-4">
          <div className="text-center">
            <p className="text-3xl font-black text-rose-400">{todayCount}</p>
            <p className="text-xs text-slate-400 mt-1">Today's Heavy Days</p>
          </div>
        </div>
        <div className="nova-card p-4">
          <div className="text-center">
            <p className="text-3xl font-black text-amber-400">{upcomingCount}</p>
            <p className="text-xs text-slate-400 mt-1">Upcoming (Next 2 Weeks)</p>
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        <AnimatePresence>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle size={32} className="mx-auto mb-3 opacity-30 text-emerald-400" />
              <p>No heavy book day alerts!</p>
              <p className="text-xs mt-1">Your child's book load looks good.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const sevStyle = getSeverityStyle(alert);
              const sevBadge = getSeverityBadge(alert.heavyCount);
              return (
                <motion.div
                  key={alert.date}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${sevStyle}`}
                  onClick={() => handleOpenDetail(alert)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={18} className={alert.status === 'today' ? 'text-rose-400' : 'text-amber-400'} />
                      <div>
                        <p className="text-sm font-bold text-white">{alert.day}, {new Date(alert.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-[10px] text-slate-400">{alert.heavyCount} of {alert.totalSubjects} subjects are heavy</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${sevBadge.color}`}>{sevBadge.text}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {alert.heavySubjects.map((subj, i) => (
                      <span key={i} className="text-[10px] bg-white/10 text-slate-300 px-2 py-1 rounded-full font-medium">📖 {subj}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 italic">{alert.suggestion}</p>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Heavy Day Details</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Calendar size={18} className="text-blue-400" />
                  <div>
                    <p className="text-sm font-bold text-white">{selectedAlert.day}, {new Date(selectedAlert.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-xs text-slate-400">{selectedAlert.totalSubjects} periods scheduled</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <p className="text-xs font-bold text-rose-400 mb-2">HEAVY SUBJECTS ({selectedAlert.heavyCount})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.heavySubjects.map((s, i) => (
                      <span key={i} className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-1 rounded-full font-bold">📖 {s}</span>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs font-bold text-emerald-400 mb-2">ALL SUBJECTS</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.allSubjects.map((s, i) => (
                      <span key={i} className={`text-[10px] px-2 py-1 rounded-full font-medium ${selectedAlert.heavySubjects.includes(s) ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-slate-300'}`}>📚 {s}</span>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-slate-700/30">
                  <p className="text-[10px] text-slate-400">💡 {selectedAlert.suggestion}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}