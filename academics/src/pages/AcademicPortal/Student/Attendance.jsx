import { useMemo, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { request } from '../../../utils/apiClient';
import { useSound } from '../../../hooks/useSound';

export const Attendance = ({ user }) => {
  const { playClick } = useSound();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, rate: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    request('/student/attendance')
      .then(res => {
        const recs = res?.records || [];
        const smry = res?.summary || { total: 0, present: 0, absent: 0, late: 0, rate: 0 };
        setRecords(recs);
        setSummary(smry);
      })
      .catch(e => console.error('Failed to fetch attendance:', e))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const myRecords = useMemo(() =>
    records.filter(a => a.student_id === user.id),
    [records, user?.id]
  );

  const filteredRecords = useMemo(() => {
    let recs = myRecords;
    if (statusFilter !== 'all') {
      recs = recs.filter(r => r.status === statusFilter);
    }
    if (selectedMonth >= 0 && selectedYear) {
      recs = recs.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      });
    }
    return recs;
  }, [myRecords, statusFilter, selectedMonth, selectedYear]);

  const currentStreak = useMemo(() => {
    const sorted = [...myRecords]
      .filter(r => r.status === 'present' || r.status === 'late')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i].date);
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (d.toDateString() === expected.toDateString()) streak++;
      else break;
    }
    return streak;
  }, [myRecords]);

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = days.map(() => ({ present: 0, total: 0 }));
    filteredRecords.forEach(r => {
      const d = new Date(r.date);
      const dayIdx = (d.getDay() + 6) % 7;
      if (dayIdx < 7) {
        counts[dayIdx].total++;
        if (r.status === 'present' || r.status === 'late') counts[dayIdx].present++;
      }
    });
    return days.map((day, i) => ({ day, ...counts[i] }));
  }, [filteredRecords]);

  const monthDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7;
    const days = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);
    return { days, firstDay, lastDay };
  }, [selectedMonth, selectedYear]);

  const dayStatus = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      const key = new Date(r.date).toDateString();
      if (!map[key] || r.status === 'present') map[key] = r.status;
    });
    return map;
  }, [filteredRecords]);

  const exportReport = useCallback(() => {
    const data = { summary, records: filteredRecords, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${selectedYear}-${selectedMonth + 1}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playClick?.();
  }, [summary, filteredRecords, selectedMonth, selectedYear, playClick]);

  const statusColor = (s) => ({
    present: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    absent: 'bg-red-500/20 text-red-400 border border-red-500/30',
    late: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  }[s] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30');

  const heatColor = (s) => ({
    present: 'bg-emerald-500',
    absent: 'bg-red-500',
    late: 'bg-yellow-500',
    none: 'bg-zinc-800',
  }[s] || 'bg-zinc-800');

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const maxBarVal = Math.max(...weeklyData.map(w => w.total), 1);

  const AnimatedCounter = ({ value, duration = 1.2 }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let start = 0;
      const step = value / (duration * 60);
      const timer = setInterval(() => {
        start += step;
        if (start >= value) { setDisplay(value); clearInterval(timer); }
        else setDisplay(Math.floor(start));
      }, 16);
      return () => clearInterval(timer);
    }, [value, duration]);
    return <span>{display}</span>;
  };

  const ProgressRing = ({ rate }) => {
    const r = 54;
    const circ = 2 * Math.PI * r;
    const offset = circ - (rate / 100) * circ;
    return (
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1a1a24" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="#ea580c" strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 8px #ea580c80)' }}
        />
        <text x="70" y="65" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
          {rate}%
        </text>
        <text x="70" y="85" textAnchor="middle" fill="#71717a" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">
          ATTENDANCE
        </text>
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 font-['Plus_Jakarta_Sans',sans-serif] p-6 md:p-10 pb-16">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Attendance <span className="text-[#ea580c]">Overview</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">Track your attendance and identify patterns</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={exportReport}
          className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-orange-900/30 transition-colors"
        >
          Export Report
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Hero Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            {[
              { label: 'Present', value: summary.present, sub: 'days' },
              { label: 'Absent', value: summary.absent, sub: 'days' },
              { label: 'Late', value: summary.late, sub: 'days' },
              { label: 'Total', value: summary.total, sub: 'records' },
              { label: 'Streak', value: currentStreak, sub: 'days' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center relative overflow-hidden"
              >
                <div className={`absolute inset-0 opacity-10 ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-red-500' : i === 2 ? 'bg-yellow-500' : i === 4 ? 'bg-[#ea580c]' : 'bg-zinc-600'}`} />
                <div className="relative">
                  <p className="text-3xl font-extrabold text-white mb-1">
                    <AnimatedCounter value={s.value} duration={1.2 + i * 0.1} />
                  </p>
                  <p className="text-xs font-semibold text-[#ea580c] uppercase tracking-wider">{s.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{s.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Circular Progress Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center"
            >
              <ProgressRing rate={summary.rate} />
              <div className="flex gap-4 mt-6 text-xs text-zinc-400">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-emerald-500" /> Present</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-yellow-500" /> Late</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-red-500" /> Absent</div>
              </div>
            </motion.div>

            {/* Weekly Bar Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-sm font-semibold text-zinc-300 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" /> Weekly Overview
              </h3>
              <div className="flex items-end justify-between gap-3 h-36 px-2">
                {weeklyData.map((w, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full flex flex-col gap-1 items-center h-28 justify-end">
                      {w.total > 0 && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(w.present / maxBarVal) * 100}%` }}
                          transition={{ delay: 0.5 + i * 0.06, duration: 0.6, ease: 'easeOut' }}
                          className="w-6 bg-[#ea580c] rounded-t-md"
                          style={{ boxShadow: '0 0 10px #ea580c60' }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 font-medium">{w.day}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-sm font-semibold text-zinc-300 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" /> Filters
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={e => { setSelectedMonth(Number(e.target.value)); playClick?.(); }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-[#ea580c]/50 transition-colors"
                  >
                    {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Year</label>
                  <select
                    value={selectedYear}
                    onChange={e => { setSelectedYear(Number(e.target.value)); playClick?.(); }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-[#ea580c]/50 transition-colors"
                  >
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'present', 'late', 'absent'].map(f => (
                      <button key={f} onClick={() => { setStatusFilter(f); playClick?.(); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${statusFilter === f ? 'bg-[#ea580c] border-[#ea580c] text-white' : 'border-white/10 text-zinc-400 hover:border-white/30'}`}>
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Calendar Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-zinc-200">
                {monthNames[selectedMonth]} {selectedYear} Calendar
              </h3>
              <div className="flex gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Present</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500" /> Absent</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-yellow-500" /> Late</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-zinc-800" /> No data</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-xs font-semibold text-zinc-600 text-center mb-2">{d}</div>
              ))}
              {monthDays.days.map((day, i) => {
                if (!day) return <div key={`pad-${i}`} />;
                const dateStr = new Date(selectedYear, selectedMonth, day).toDateString();
                const dayRec = myRecords.find(r => new Date(r.date).toDateString() === dateStr);
                const status = dayRec?.status || 'none';
                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.01 }}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all cursor-default
                      ${heatColor(status)} ${status !== 'none' ? 'shadow-md' : 'text-zinc-600'}`}
                    title={`${new Date(selectedYear, selectedMonth, day).toLocaleDateString()} - ${status}`}
                  >
                    {day}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Records Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="px-8 py-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-zinc-200">Recent Records</h3>
              <p className="text-xs text-zinc-500 mt-1">{filteredRecords.length} records shown</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-8 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Day</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.slice(0, 20).map((rec, i) => {
                    const d = new Date(rec.date);
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                    return (
                      <motion.tr
                        key={`${rec.date}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.03 }}
                        className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'} hover:bg-white/5 transition-colors`}
                      >
                        <td className="px-8 py-4 text-zinc-300 font-medium">
                          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-4 text-zinc-500">{dayName}</td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(rec.status)}`}>
                            {rec.status?.charAt(0).toUpperCase() + rec.status?.slice(1)}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredRecords.length === 0 && (
                <div className="text-center py-12 text-zinc-500 text-sm">No records found for the selected filters.</div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};