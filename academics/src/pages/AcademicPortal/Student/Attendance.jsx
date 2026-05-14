import { useMemo, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { request } from '../../../utils/apiClient';
import { useSound } from '../../../hooks/useSound';

const calculateSummary = (recs) => {
  const present = recs.filter(r => r.status === 'present' || r.status === 'late').length;
  const absent = recs.filter(r => r.status === 'absent').length;
  const late = recs.filter(r => r.status === 'late').length;
  const total = recs.length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, present, absent, late, rate };
};

const LEAVE_STORAGE_KEY = 'sms_leave_requests';

const getLeaveRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(LEAVE_STORAGE_KEY) || '[]');
  } catch { return []; }
};

const saveLeaveRequests = (requests) => {
  localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(requests));
};

export const Attendance = ({ user }) => {
  const { playClick } = useSound();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, rate: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('all');

  // Leave requests state
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: 'medical', reason: '', startDate: '', endDate: '' });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    // Try API first
    const fetchAttendance = () => {
      request('/student/attendance')
        .then(res => {
          const recs = res?.records || res?.items || [];
          const smry = res?.summary || calculateSummary(recs);
          setRecords(recs);
          setSummary(smry);
        })
        .catch(() => {
          setRecords([]);
          setSummary({ total: 0, present: 0, absent: 0, late: 0, rate: 0 });
        })
        .finally(() => setLoading(false));
    };

    fetchAttendance();

    // Load leave requests from localStorage
    const stored = JSON.parse(localStorage.getItem('sms_leave_requests') || '[]');
    setLeaveRequests(stored.filter(r => r.studentId === user.id));
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const maxBarVal = Math.max(...weeklyData.map(w => w.total), 1);

  // Leave request handlers
  const handleLeaveSubmit = useCallback(() => {
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) return;
    setLeaveSubmitting(true);

    const newRequest = {
      id: Date.now().toString(),
      studentId: user.id,
      studentName: user.name || user.studentName || 'Student',
      type: leaveForm.type,
      reason: leaveForm.reason,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
    };

    setTimeout(() => {
      const all = getLeaveRequests();
      all.push(newRequest);
      saveLeaveRequests(all);
      setLeaveRequests(prev => [...prev, newRequest]);
      setLeaveForm({ type: 'medical', reason: '', startDate: '', endDate: '' });
      setShowLeaveForm(false);
      setLeaveSubmitting(false);
      playClick?.();
    }, 400);
  }, [leaveForm, user, playClick]);

  const getLeaveStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      approved: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    const labels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
        {labels[status] || 'Pending'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 font-['Plus_Jakarta_Sans',sans-serif] p-4 md:p-6 pb-16">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Attendance <span className="text-[#ea580c]">Overview</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-xs">
            {monthNames[selectedMonth]} {selectedYear} — {filteredRecords.length} records
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={exportReport}
          className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-lg shadow-orange-900/30 transition-colors"
        >
          Export Report
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Hero Summary Strip - compact */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
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
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center relative overflow-hidden"
              >
                <div className={`absolute inset-0 opacity-10 ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-red-500' : i === 2 ? 'bg-yellow-500' : i === 4 ? 'bg-[#ea580c]' : 'bg-zinc-600'}`} />
                <div className="relative">
                  <p className="text-2xl font-extrabold text-white mb-0.5">
                    {s.value}
                  </p>
                  <p className="text-[10px] font-semibold text-[#ea580c] uppercase tracking-wider">{s.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{s.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Circular Progress Ring - smaller */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center"
                >
                  <ProgressRing rate={summary.rate} small />
                  <div className="flex gap-3 mt-4 text-[10px] text-zinc-400">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-500" /> Present</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-yellow-500" /> Late</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-red-500" /> Absent</div>
                  </div>
                </motion.div>

                {/* Weekly Bar Chart - compact */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
                >
                  <h3 className="text-xs font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" /> Weekly Overview
                  </h3>
                  <div className="flex items-end justify-between gap-2 h-24 px-1">
                    {weeklyData.map((w, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div className="w-full flex flex-col gap-0.5 items-center h-20 justify-end">
                          {w.total > 0 && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${(w.present / maxBarVal) * 100}%` }}
                              transition={{ delay: 0.4 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
                              className="w-5 bg-[#ea580c] rounded-t-sm"
                              style={{ boxShadow: '0 0 8px #ea580c60' }}
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium">{w.day}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Calendar Heatmap - compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-200">
                    {monthNames[selectedMonth]} {selectedYear}
                  </h3>
                  <div className="flex gap-3 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Present</span>
                    <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Absent</span>
                    <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-yellow-500" /> Late</span>
                    <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-zinc-800" /> No data</span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="text-[10px] font-semibold text-zinc-600 text-center mb-1.5">{d}</div>
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
                        transition={{ delay: 0.55 + i * 0.005 }}
                        className={`aspect-square rounded flex items-center justify-center text-[10px] font-medium transition-all cursor-default
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
                <div className="px-6 py-4 border-b border-white/10">
                  <h3 className="text-sm font-semibold text-zinc-200">Recent Records</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{filteredRecords.length} records shown</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-6 py-2.5 text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Day</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.slice(0, 15).map((rec, i) => {
                        const d = new Date(rec.date);
                        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                        return (
                          <motion.tr
                            key={`${rec.date}-${i}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.65 + i * 0.025 }}
                            className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'} hover:bg-white/5 transition-colors`}
                          >
                            <td className="px-6 py-3 text-zinc-300 font-medium">
                              {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 text-zinc-500">{dayName}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(rec.status)}`}>
                                {rec.status?.charAt(0).toUpperCase() + rec.status?.slice(1)}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredRecords.length === 0 && (
                    <div className="text-center py-10 text-zinc-500 text-xs">No records found for the selected filters.</div>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="space-y-6">
              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
              >
                <h3 className="text-xs font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" /> Filter Records
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 mb-1 block">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={e => { setSelectedMonth(Number(e.target.value)); playClick?.(); }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-[#ea580c]/50 transition-colors"
                    >
                      {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 mb-1 block">Year</label>
                    <select
                      value={selectedYear}
                      onChange={e => { setSelectedYear(Number(e.target.value)); playClick?.(); }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-[#ea580c]/50 transition-colors"
                    >
                      {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 mb-1.5 block">Status</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {['all', 'present', 'late', 'absent'].map(f => (
                        <button key={f} onClick={() => { setStatusFilter(f); playClick?.(); }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${statusFilter === f ? 'bg-[#ea580c] border-[#ea580c] text-white' : 'border-white/10 text-zinc-400 hover:border-white/30'}`}>
                          {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Leave Requests Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" /> Leave Requests
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{leaveRequests.length} request{leaveRequests.length !== 1 ? 's' : ''}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowLeaveForm(!showLeaveForm); playClick?.(); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-colors ${showLeaveForm ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#ea580c] hover:bg-[#c2410c] text-white'}`}
                  >
                    {showLeaveForm ? 'Cancel' : 'Apply Leave'}
                  </motion.button>
                </div>

                {/* Leave Form */}
                <AnimatePresence>
                  {showLeaveForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-5">
                        <h4 className="text-xs font-semibold text-zinc-300 mb-4">New Leave Request</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-zinc-500 mb-1 block">Leave Type</label>
                            <select
                              value={leaveForm.type}
                              onChange={e => setLeaveForm(f => ({ ...f, type: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#ea580c]/50 transition-colors"
                            >
                              <option value="medical">Medical Leave</option>
                              <option value="vacation">Vacation Leave</option>
                              <option value="personal">Personal Leave</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-500 mb-1 block">Start Date</label>
                            <input
                              type="date"
                              value={leaveForm.startDate}
                              onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#ea580c]/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-500 mb-1 block">End Date</label>
                            <input
                              type="date"
                              value={leaveForm.endDate}
                              onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#ea580c]/50 transition-colors"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="text-[10px] text-zinc-500 mb-1 block">Reason</label>
                          <textarea
                            value={leaveForm.reason}
                            onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))}
                            placeholder="Describe the reason for your leave request..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#ea580c]/50 transition-colors resize-none"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={handleLeaveSubmit}
                          disabled={leaveSubmitting || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason}
                          className="w-full bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors"
                        >
                          {leaveSubmitting ? 'Submitting...' : 'Submit Request'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Leave Requests List */}
                <AnimatePresence mode="popLayout">
                  {leaveRequests.length > 0 ? (
                    <div className="space-y-2">
                      {[...leaveRequests].reverse().map((req, i) => (
                        <motion.div
                          key={req.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white/[0.03] border border-white/10 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-zinc-200 capitalize">
                                  {req.type === 'medical' ? 'Medical Leave' : req.type === 'vacation' ? 'Vacation Leave' : 'Personal Leave'}
                                </span>
                                {getLeaveStatusBadge(req.status)}
                              </div>
                              <p className="text-[11px] text-zinc-400 mb-1">{req.reason}</p>
                              <p className="text-[10px] text-zinc-500">
                                {new Date(req.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {' — '}
                                {new Date(req.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-zinc-500">Applied</p>
                              <p className="text-[10px] text-zinc-400">
                                {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-zinc-500 text-xs py-6"
                    >
                      No leave requests yet. Click "Apply Leave" to create one.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ProgressRing = ({ rate, small }) => {
  const r = small ? 40 : 54;
  const size = small ? 100 : 140;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rate / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1a1a24" strokeWidth={small ? '8' : '10'} transform={`rotate(-90 ${cx} ${cx})`} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#ea580c" strokeWidth={small ? '8' : '10'}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ filter: 'drop-shadow(0 0 8px #ea580c80)' }}
      />
      <text x={cx} y={cx - (small ? 6 : 5)} textAnchor="middle" fill="#ffffff" fontSize={small ? '18' : '26'} fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
        {rate}%
      </text>
      <text x={cx} y={cx + (small ? 10 : 15)} textAnchor="middle" fill="#71717a" fontSize={small ? '8' : '10'} fontFamily="Plus Jakarta Sans, sans-serif">
        ATTENDANCE
      </text>
    </svg>
  );
};