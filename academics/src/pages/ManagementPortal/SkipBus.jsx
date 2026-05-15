import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, ToggleLeft, ToggleRight, RefreshCw, CheckCircle, XCircle, Info, AlertTriangle, Clock } from 'lucide-react';
import { studentApi } from '../../services/apiDataLayer';

export function SkipBus({ user, addToast }) {
  const [busInfo, setBusInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skipStatus, setSkipStatus] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);

  useEffect(() => { loadBusInfo(); }, []);

  const loadBusInfo = async () => {
    try {
      setLoading(true);
      // Get bus route info
      const res = await studentApi.getAttendance();
      if (res?.success) setBusInfo(res);
      // Load skip status
      await loadSkipStatus();
    } catch (e) { addToast?.('Failed to load bus info', 'error'); }
    finally { setLoading(false); }
  };

  const loadSkipStatus = async () => {
    try {
      const res = await studentApi.getAttendance();
      if (res?.success && res.data) {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = res.data.find(r => r.date === today);
        setTodayStatus(todayRecord || null);
      }
    } catch { /* ignore */ }
  };

  const handleSkipBus = async () => {
    if (!window.confirm('Are you sure you want to skip today\'s bus? Your parents will be notified.')) return;

    try {
      // Use the bus tracking API endpoint
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://op-csconnect-backend-production.up.railway.app/api'}/bus/skip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sms_auth_token')?.replace(/"/g, '')}`,
        },
        body: JSON.stringify({
          studentId: user?.id,
          date: new Date().toISOString().split('T')[0],
          reason: 'student_request',
        }),
      });

      if (res.ok) {
        setSkipStatus({ status: 'skipped', date: new Date().toISOString().split('T')[0] });
        addToast?.('Bus skip recorded. Parents notified.', 'success');
        loadSkipStatus();
      } else {
        const data = await res.json();
        addToast?.(data?.message || 'Failed to skip bus', 'error');
      }
    } catch (e) {
      addToast?.('Network error. Please try again.', 'error');
    }
  };

  const handleRevertSkip = async () => {
    if (!window.confirm('Revert today\'s bus skip? You will be marked as present on the bus.')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://op-csconnect-backend-production.up.railway.app/api'}/bus/unskip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sms_auth_token')?.replace(/"/g, '')}`,
        },
        body: JSON.stringify({
          studentId: user?.id,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      if (res.ok) {
        setSkipStatus(null);
        addToast?.('Bus skip reverted.', 'success');
        loadSkipStatus();
      } else {
        addToast?.('Failed to revert skip', 'error');
      }
    } catch (e) {
      addToast?.('Network error. Please try again.', 'error');
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'skipped': return { icon: ToggleRight, color: 'from-amber-500 to-orange-500', label: 'Skipped', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
      case 'present': return { icon: CheckCircle, color: 'from-emerald-500 to-teal-500', label: 'Riding', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
      case 'absent': return { icon: XCircle, color: 'from-rose-500 to-red-500', label: 'Not Riding', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' };
      default: return { icon: Bus, color: 'from-sky-500 to-blue-500', label: 'Unknown', bg: 'bg-slate-700/20', border: 'border-slate-600/30', text: 'text-slate-400' };
    }
  };

  const todayConfig = getStatusConfig(skipStatus?.status || (todayStatus ? 'present' : 'unknown'));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Skip the Bus</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your bus riding status</p>
        </div>
      </div>

      {/* Main Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl p-6 border ${todayConfig.bg} ${todayConfig.border} shadow-lg lg:col-span-2`}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -mr-4 -mt-4" />
          <div className="relative flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${todayConfig.color} flex items-center justify-center shadow-lg`}>
              <todayConfig.icon size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">Today's Status</h3>
              <p className={`text-sm font-semibold ${todayConfig.text} mt-1`}>{todayConfig.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {skipStatus?.status === 'skipped' ? (
                <button onClick={handleRevertSkip}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all border border-white/20">
                  ↩ Revert Skip
                </button>
              ) : (
                <button onClick={handleSkipBus}
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl text-sm font-bold transition-all border border-amber-500/30">
                  Skip Bus Today
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
            <Info size={12} />
            <span>Skipping will automatically notify your parents/guardians.</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700/40 p-6 shadow-lg">
          <h3 className="text-sm font-bold text-slate-300 mb-4">Bus Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
              <span className="text-xs text-slate-400">Route</span>
              <span className="text-sm font-bold text-white">Route A</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
              <span className="text-xs text-slate-400">Pickup Time</span>
              <span className="text-sm font-bold text-white">7:30 AM</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
              <span className="text-xs text-slate-400">Drop-off Time</span>
              <span className="text-sm font-bold text-white">3:45 PM</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
              <span className="text-xs text-slate-400">Pickup Point</span>
              <span className="text-sm font-bold text-white">Main Gate</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Skip History */}
      <Card>
        <h3 className="text-sm font-bold text-slate-300 mb-4">Skip History</h3>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : (
          <div className="space-y-2">
            {upcomingTrips.length === 0 && (
              <p className="text-center py-8 text-sm text-slate-500">No skip records yet</p>
            )}
            {upcomingTrips.slice(0, 10).map((trip, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <Clock size={16} className="text-slate-500" />
                <span className="text-sm text-slate-300 flex-1">{trip.date}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                  trip.status === 'skipped' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {trip.status}
                </span>
              </motion.div>
            ))}
            {upcomingTrips.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                <Bus size={28} className="mx-auto mb-2 opacity-30 text-slate-600" />
                <p className="text-xs text-slate-500">Use the toggle above to skip the bus</p>
              </motion.div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}