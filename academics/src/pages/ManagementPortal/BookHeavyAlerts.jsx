import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle, RefreshCw, BookOpen, TrendingUp } from 'lucide-react';
import { parentApi } from '../../services/apiDataLayer';

export function BookHeavyAlerts({ user, addToast }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => { loadAlerts(); }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await parentApi.getBookHeavyAlerts();
      if (res?.success) setAlerts(res.alerts || []);
    } catch (e) { addToast?.('Failed to load book heavy alerts', 'error'); }
    finally { setLoading(false); }
  };

  const HEAVY_THRESHOLD = 4;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">📚 Book Heavy Day Alerts</h2>
          <p className="text-sm text-slate-400 mt-1">Stay informed about heavy textbook days for your child</p>
        </div>
        <button onClick={loadAlerts} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-slate-300 transition-all flex items-center gap-2">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <CheckCircle size={40} className="mx-auto mb-3 opacity-30 text-emerald-400" />
          <p className="text-sm">No heavy book day alerts at this time</p>
          <p className="text-[10px] mt-1 text-slate-600">Your child has manageable book loads for the upcoming days</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {alerts.map((alert, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border p-5 cursor-pointer hover:shadow-lg transition-all ${
                  alert.status === 'today'
                    ? 'bg-gradient-to-br from-rose-500/10 to-red-500/5 border-rose-500/30'
                    : 'bg-white/5 border-slate-700/40 hover:border-slate-600'
                }`}
                onClick={() => setSelectedAlert(alert)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      alert.status === 'today'
                        ? 'bg-rose-500/20 border-rose-500/30'
                        : 'bg-amber-500/20 border-amber-500/30'
                    }`}>
                      <AlertTriangle size={18} className={alert.status === 'today' ? 'text-rose-400' : 'text-amber-400'} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{alert.day} — {alert.date}</p>
                      <p className={`text-[10px] font-semibold capitalize mt-0.5 ${
                        alert.status === 'today' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {alert.status === 'today' ? '⏰ Today' : '📅 Upcoming'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-[9px] font-black px-2 py-1 rounded-full ${
                    alert.status === 'today'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {alert.heavyCount}/{alert.totalSubjects} heavy
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {alert.heavySubjects.map((s, j) => (
                    <span key={j} className="text-[9px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded font-semibold">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <Clock size={10} />
                  <span>{alert.totalSubjects} periods total · {alert.suggestion}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Alert Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedAlert(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{selectedAlert.day} — Book Load</h3>
                <button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${
                selectedAlert.status === 'today' ? 'bg-rose-500/20 border-rose-500/30' : 'bg-amber-500/20 border-amber-500/30'
              }`}>
                <BookOpen size={24} className={selectedAlert.status === 'today' ? 'text-rose-400' : 'text-amber-400'} />
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Date</span>
                  <span className="text-white font-medium">{selectedAlert.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Day</span>
                  <span className="text-white font-medium">{selectedAlert.day}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Periods</span>
                  <span className="text-white font-medium">{selectedAlert.totalSubjects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Heavy Subjects</span>
                  <span className="text-rose-400 font-bold">{selectedAlert.heavyCount}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Heavy Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.heavySubjects.map((s, i) => (
                      <span key={i} className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-1 rounded font-semibold">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-[10px] text-amber-400">💡 {selectedAlert.suggestion}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}