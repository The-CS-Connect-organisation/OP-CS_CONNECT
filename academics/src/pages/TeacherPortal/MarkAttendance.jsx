import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, ChevronLeft, ChevronRight, Users, Zap, Clock, Search,
  Calendar as CalendarIcon, Filter, Download, AlertCircle, ArrowUp,
  ArrowDown, RefreshCw, ChevronDown, MoreVertical, Edit2, Eye,
  BarChart2, TrendingUp, Award, Bell, XCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { teacherApi } from '../../services/apiDataLayer';
import { useSound } from '../../hooks/useSound';

/* ── Stat Pill Component ── */
const StatPill = ({ icon: Icon, label, value, color, bgColor, glow }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`relative overflow-hidden rounded-2xl p-4 ${bgColor} border ${glow} shadow-lg`}
  >
    <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/5 -mr-3 -mt-3" />
    <div className="relative flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-sm`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
        <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  </motion.div>
);

/* ── Progress Ring ── */
const ProgressRing = ({ rate, size = 100 }) => {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rate / 100) * circ;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={rate >= 90 ? '#10b981' : rate >= 75 ? '#3b82f6' : rate >= 50 ? '#f59e0b' : '#ef4444'}
        strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
      />
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" fill="white" fontSize="16" fontWeight="800" fontFamily="inherit">
        {rate}%
      </text>
      <text x={size / 2} y={size / 2 + 12} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="inherit">
        ATTENDANCE
      </text>
    </svg>
  );
};

/* ── Student Status Badge ── */
const StatusBadge = ({ status, size = 'base' }) => {
  const config = {
    present: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Check, ring: 'shadow-emerald-500/20' },
    late:    { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock, ring: 'shadow-amber-500/20' },
    absent:  { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: X, ring: 'shadow-rose-500/20' },
  };
  const c = config[status] || config.absent;
  const Icon = c.icon;
  const sz = size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-[10px]';

  return (
    <span className={`inline-flex items-center justify-center rounded-xl border font-semibold ${sz} ${c.bg} ${c.ring}`}>
      <Icon size={size === 'sm' ? 10 : 13} />
    </span>
  );
};

/* ── Confirm Modal ── */
const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{message}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            This will publish attendance records for the selected class and date. Students and parents will be notified.
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-all">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">
              Confirm & Publish
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ── Main Component ── */
export const MarkAttendance = ({ user, addToast }) => {
  const { playClick, playBlip, playSwitch } = useSound();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [marks, setMarks] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const statusConfig = {
    present: { icon: Check, color: 'text-emerald-500', activeColor: 'bg-emerald-600 text-white shadow-emerald-500/30', label: 'Present' },
    late:    { icon: Clock, color: 'text-amber-500', activeColor: 'bg-amber-500 text-white shadow-amber-500/30', label: 'Late' },
    absent:  { icon: X, color: 'text-rose-500', activeColor: 'bg-rose-500 text-white shadow-rose-500/30', label: 'Absent' },
  };

  // Load attendance data
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { request } = await import('../../utils/apiClient');
        const res = await request(`/teacher/attendance/class/${selectedClass}?date=${selectedDate}`);
        if (!alive) return;
        const studentList = res?.students ?? res?.data?.students ?? [];
        const existingAttendance = res?.attendance ?? res?.data?.attendance ?? [];

        setStudents(studentList);
        const initialMarks = {};
        existingAttendance.forEach(entry => {
          initialMarks[entry.studentId || entry.student_id] = entry.status;
        });
        studentList.forEach(s => {
          if (!initialMarks[s._id ?? s.id]) {
            initialMarks[s._id ?? s.id] = 'present';
          }
        });
        setMarks(initialMarks);
      } catch (err) {
        if (!alive) return;
        addToast?.('Failed to load attendance data', 'error');
        setStudents([]);
        setMarks({});
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedClass, selectedDate]);

  const daySummary = useMemo(() => {
    const map = { present: 0, late: 0, absent: 0, none: 0 };
    students.forEach(s => {
      const id = s._id ?? s.id;
      const status = marks[id] ?? 'none';
      if (map[status] !== undefined) map[status]++;
      else map.none++;
    });
    return map;
  }, [students, marks]);

  const attendanceRate = useMemo(() => {
    const total = students.length;
    if (total === 0) return 0;
    return Math.round(((daySummary.present + daySummary.late) / total) * 100);
  }, [students.length, daySummary]);

  const handleMark = (studentId, status) => {
    playSwitch();
    setMarks(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    playBlip();
    setShowConfirm(false);
    try {
      setSubmitting(true);
      const entries = students.map(s => {
        const id = s._id ?? s.id;
        return { studentId: id, status: marks[id] || 'present', notes: '' };
      });
      await teacherApi.markAttendance(selectedClass, selectedDate, entries);
      addToast?.(`Attendance saved for ${selectedClass} — ${selectedDate}`, 'success');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      addToast?.(err?.message || 'Failed to save attendance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    playClick();
    try {
      const { exportAttendance } = await import('../../services/apiDataLayer');
      await exportAttendance(selectedClass, selectedDate, selectedDate, 'csv');
      addToast?.('Attendance report exported successfully', 'success');
    } catch (err) {
      addToast?.('Export failed. Try again.', 'error');
    }
  };

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(s =>
      (s.name?.toLowerCase().includes(q)) ||
      (s.rollNo?.toString().includes(q)) ||
      (s.rollNumber?.toString().includes(q))
    );
  }, [students, searchQuery]);

  const monthDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const first = new Date(year, month, 1);
    const firstWeekday = first.getDay();
    const startDate = new Date(year, month, 1 - firstWeekday);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      cells.push(d);
    }
    return cells;
  }, [visibleMonth]);

  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8 pb-16">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.03] blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-violet-500/[0.03] blur-[120px]" />
      </div>

      <AnimatePresence>
        {/* Success Toast */}
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-emerald-500/20 flex items-center gap-2 text-sm font-semibold"
          >
            <Check size={16} className="animate-pulse" />
            Attendance published successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-[1440px] mx-auto"
      >
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-blue-500/20">
                Teacher Portal
              </div>
              {isToday && (
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  Today
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/20">
                <Check size={20} className="text-white" />
              </span>
              Mark Attendance
              <span className="text-sm font-normal text-slate-400 ml-2 hidden md:inline">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleExport}
              disabled={loading || submitting}
              className="text-slate-300 hover:text-white hover:bg-white/5 border border-slate-700/50"
            >
              <Download size={15} className="mr-1.5" />
              Export
            </Button>
            <Button
              variant="accent"
              onClick={() => setShowConfirm(true)}
              disabled={submitting || loading}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
            >
              {submitting ? (
                <>
                  <RefreshCw size={15} className="mr-1.5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Zap size={15} className="mr-1.5" />
                  Publish Records
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          <StatPill
            icon={Users}
            label="Present"
            value={daySummary.present}
            color="from-emerald-500 to-teal-500"
            bgColor="bg-emerald-500/10 border border-emerald-500/20"
            glow="shadow-emerald-500/10"
          />
          <StatPill
            icon={Clock}
            label="Late"
            value={daySummary.late}
            color="from-amber-500 to-orange-500"
            bgColor="bg-amber-500/10 border border-amber-500/20"
            glow="shadow-amber-500/10"
          />
          <StatPill
            icon={XCircle}
            label="Absent"
            value={daySummary.absent}
            color="from-rose-500 to-red-500"
            bgColor="bg-rose-500/10 border border-rose-500/20"
            glow="shadow-rose-500/10"
          />
          <StatPill
            icon={Award}
            label="Attendance Rate"
            value={`${attendanceRate}%`}
            color="from-blue-500 to-violet-500"
            bgColor="bg-blue-500/10 border border-blue-500/20"
            glow="shadow-blue-500/10"
          />
          <StatPill
            icon={Users}
            label="Total Students"
            value={students.length}
            color="from-violet-500 to-purple-500"
            bgColor="bg-violet-500/10 border border-violet-500/20"
            glow="shadow-violet-500/10"
          />
        </div>

        {/* Controls Row */}
        <Card className="mb-6 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Date Selector */}
            <div className="flex items-center gap-3">
              <CalendarIcon size={16} className="text-slate-400" />
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => { playClick(); setSelectedDate(e.target.value); }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all w-full sm:w-48"
                />
              </div>
            </div>

            {/* Class Selector */}
            <div className="flex items-center gap-3">
              <Filter size={16} className="text-slate-400" />
              <select
                value={selectedClass}
                onChange={e => { playClick(); setSelectedClass(e.target.value); }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer min-w-[120px]"
              >
                <option value="10-A">10-A</option>
                <option value="10-B">10-B</option>
                <option value="11-A">11-A</option>
                <option value="11-B">11-B</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xs">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search student..."
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>
            </div>

            {/* Class Stats */}
            <div className="hidden lg:flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-400">{daySummary.present}</span>
              </div>
              <span className="text-slate-600">/</span>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-400">{daySummary.late}</span>
              </div>
              <span className="text-slate-600">/</span>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-slate-400">{daySummary.absent}</span>
              </div>
              <span className="text-slate-600 mx-2">|</span>
              <ProgressRing rate={attendanceRate} size={40} />
            </div>
          </div>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Student List */}
          <div className="col-span-12 lg:col-span-8">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                  Student Roster — {selectedClass}
                </h3>
                <span className="text-xs text-slate-500 bg-slate-800/50 px-2.5 py-1 rounded-full">
                  {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Student List */}
              <div className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <div className="py-16 flex flex-col items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
                      />
                      <p className="text-xs text-slate-500 mt-4 font-medium">Loading attendance data...</p>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center">
                      <Search size={40} className="text-slate-700 mb-3" />
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        No students found
                      </p>
                    </div>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const id = student._id ?? student.id;
                      const current = marks[id] || 'present';
                      return (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 12 }}
                          transition={{ delay: idx * 0.02, duration: 0.3 }}
                        >
                          <div className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.03] transition-all group cursor-pointer">
                            {/* Roll Number Badge */}
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                              current === 'present'
                                ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30'
                                : current === 'late'
                                ? 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 group-hover:bg-rose-500/30'
                            }`}>
                              {student.rollNo || student.rollNumber || '??'}
                            </div>

                            {/* Student Name */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-200 truncate">
                                {student.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {student._id ?? student.id}
                              </p>
                            </div>

                            {/* Status Selector */}
                            <div className="flex gap-1 flex-shrink-0">
                              {['present', 'late', 'absent'].map((status) => {
                                const cfg = statusConfig[status];
                                const Icon = cfg.icon;
                                const isActive = current === status;
                                return (
                                  <button
                                    key={status}
                                    onClick={() => handleMark(id, status)}
                                    title={cfg.label}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                      isActive
                                        ? `${cfg.activeColor} scale-110`
                                        : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                                  >
                                    <Icon size={14} strokeWidth={isActive ? 2.5 : 1.5} />
                                  </button>
                                );
                              })}
                            </div>

                            {/* Active indicator */}
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              current === 'present' ? 'bg-emerald-500' :
                              current === 'late' ? 'bg-amber-500' : 'bg-rose-500'
                            } opacity-0 group-hover:opacity-100 transition-opacity`} />
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>

              {/* Table Footer */}
              <div className="px-6 py-3.5 border-t border-white/5 flex items-center justify-between">
                <p className="text-[10px] text-slate-500">
                  Showing {filteredStudents.length} of {students.length} students
                </p>
                {students.length > 0 && (
                  <div className="flex items-center gap-2">
                    <AnimatePresence>
                      {Object.values(marks).some(v => v !== 'present') && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => {
                            playClick();
                            const newMarks = { ...marks };
                            Object.keys(newMarks).forEach(k => newMarks[k] = 'present');
                            setMarks(newMarks);
                          }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
                        >
                          <Check size={12} />
                          Mark All Present
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Attendance Summary */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Daily Summary</h3>
              <div className="space-y-4">
                {[
                  { label: 'Present', count: daySummary.present, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                  { label: 'Late', count: daySummary.late, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                  { label: 'Absent', count: daySummary.absent, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
                  { label: 'Unmarked', count: daySummary.none, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
                  { label: 'Total', count: students.length, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl ${item.bg} border ${item.border}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${item.color}`}>{item.label}</span>
                    <span className={`text-2xl font-black ${item.color}`}>{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => { playClick(); const newMarks = {}; students.forEach(s => { newMarks[s._id ?? s.id] = 'present'; }); setMarks(newMarks); }}
                  className="w-full text-slate-300 hover:text-white hover:bg-white/5 justify-start py-3 px-4 text-sm"
                >
                  <Check size={14} className="mr-3 opacity-60" />
                  Mark All Present
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { playClick(); const newMarks = {}; students.forEach(s => { newMarks[s._id ?? s.id] = 'absent'; }); setMarks(newMarks); }}
                  className="w-full text-slate-300 hover:text-white hover:bg-white/5 justify-start py-3 px-4 text-sm"
                >
                  <X size={14} className="mr-3 opacity-60" />
                  Mark All Absent
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleExport}
                  disabled={loading || submitting}
                  className="w-full text-slate-300 hover:text-white hover:bg-white/5 justify-start py-3 px-4 text-sm"
                >
                  <Download size={14} className="mr-3 opacity-60" />
                  Export Report
                </Button>
              </div>
            </Card>

            {/* Month Calendar */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calendar</h3>
                <div className="flex gap-1">
                  <button onClick={() => { playClick(); setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)); }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => { playClick(); setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)); }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-300 mb-3">
                {visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-[8px] font-bold text-slate-500 text-center py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((dObj, i) => {
                  const dateStr = dObj.toISOString().split('T')[0];
                  const isCurrentMonth = dObj.getMonth() === visibleMonth.getMonth();
                  const isSelected = dateStr === selectedDate;
                  const isFuture = dObj > new Date();
                  return (
                    <button
                      key={i}
                      onClick={() => { if (!isFuture) { playClick(); setSelectedDate(dateStr); } }}
                      disabled={isFuture}
                      className={`aspect-square rounded-lg text-[9px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/80 text-white shadow-lg shadow-blue-500/30'
                          : isCurrentMonth
                            ? 'border-transparent text-slate-400 hover:bg-white/5'
                            : 'border-transparent text-slate-600/40'
                      } ${isFuture ? 'opacity-30' : ''}`}
                    >
                      <span>{dObj.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <StatusBadge status="present" size="sm" />
            <span className="text-[10px] text-slate-500">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="late" size="sm" />
            <span className="text-[10px] text-slate-500">Late ({"≤"}15 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="absent" size="sm" />
            <span className="text-[10px] text-slate-500">Absent</span>
          </div>
          <span className="text-[10px] text-slate-600 mx-2">|</span>
          <span className="text-[10px] text-slate-600">
            <ArrowUp size={10} className="inline mr-0.5" /> Rate: {attendanceRate}%
          </span>
        </div>
      </motion.div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirm(false)}
        title="Publish Attendance?"
        message={`${selectedClass} on ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
      />
    </div>
  );
};