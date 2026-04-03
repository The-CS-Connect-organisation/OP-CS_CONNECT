import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Check, X, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const MarkAttendance = ({ user, addToast }) => {
  const { data: users } = useStore(KEYS.USERS, []);
  const { data: attendance, add, update } = useStore(KEYS.ATTENDANCE, []);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [marks, setMarks] = useState({});

  const students = useMemo(
    () => users.filter(u => u.role === 'student' && u.class === selectedClass),
    [users, selectedClass]
  );

  const subjects = user.subjects || ['General'];

  const statusConfig = {
    present: { icon: Check, color: 'from-emerald-500 to-teal-500', label: 'Present' },
    absent: { icon: X, color: 'from-red-500 to-pink-500', label: 'Absent' },
    late: { icon: Minus, color: 'from-amber-500 to-yellow-500', label: 'Late' },
  };

  const getAggregatedStatusForStudent = (studentId, date) => {
    const recs = attendance.filter(a => a.studentId === studentId && a.date === date);
    if (recs.length === 0) return 'none';
    const statuses = recs.map(r => r.status);
    // precedence: absent > late > present
    if (statuses.includes('absent')) return 'absent';
    if (statuses.includes('late')) return 'late';
    if (statuses.includes('present')) return 'present';
    return 'none';
  };

  const daySummary = useMemo(() => {
    const map = {
      present: [],
      late: [],
      absent: [],
      none: [],
    };
    for (const s of students) {
      const status = getAggregatedStatusForStudent(s.id, selectedDate);
      map[status]?.push(s);
    }
    return map;
  }, [students, attendance, selectedDate]);

  useEffect(() => {
    // When class/date changes, prefill marks from existing attendance so the panel feels consistent.
    const next = {};
    for (const s of students) {
      const status = getAggregatedStatusForStudent(s.id, selectedDate);
      if (status !== 'none') next[s.id] = status;
    }
    setMarks(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedClass]);

  const handleMark = (studentId, status) => {
    setMarks(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = () => {
    // Upsert attendance records: update if same (studentId + date + subject), else add.
    let changedCount = 0;
    for (const subject of subjects) {
      for (const student of students) {
        const status = marks[student.id] || 'present';
        const existing = attendance.find(
          a => a.studentId === student.id && a.date === selectedDate && a.subject === subject
        );
        const payload = {
          studentId: student.id,
          date: selectedDate,
          subject,
          status,
        };
        if (existing) {
          update(existing.id, payload);
        } else {
          add({
            id: `att-${student.id}-${selectedDate}-${subject}-${Date.now()}`,
            ...payload,
          });
        }
        changedCount++;
      }
    }

    addToast?.(`Attendance saved for ${selectedClass} on ${selectedDate}.`, 'success');
    setMarks({});
  };

  const monthDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const first = new Date(year, month, 1);
    const firstWeekday = first.getDay(); // 0=Sun..6=Sat

    const startDate = new Date(year, month, 1 - firstWeekday);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      cells.push(d);
    }
    return cells;
  }, [visibleMonth]);

  const getDayIndicator = (dateObj) => {
    const dateStr = dateObj.toISOString().split('T')[0];
    // For indicators we compute quickly per class/date.
    const studentsIds = new Set(students.map(s => s.id));
    const recs = attendance.filter(a => a.date === dateStr && studentsIds.has(a.studentId));
    if (recs.length === 0) return { tone: 'gray', text: '' };

    // Aggregate per student precedence.
    let absentCount = 0;
    let lateCount = 0;
    let presentCount = 0;
    for (const s of students) {
      const st = getAggregatedStatusForStudent(s.id, dateStr);
      if (st === 'absent') absentCount++;
      else if (st === 'late') lateCount++;
      else if (st === 'present') presentCount++;
    }

    if (absentCount > 0) return { tone: 'red', text: `A ${absentCount}` };
    if (lateCount > 0) return { tone: 'orange', text: `L ${lateCount}` };
    if (presentCount > 0) return { tone: 'green', text: `P ${presentCount}` };
    return { tone: 'gray', text: '' };
  };

  const monthLabel = visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <CheckSquare className="text-primary-500" /> Attendance Panel
        </h1>
        <p className="text-gray-500 mt-1">Pick a day, then mark present/late/absent for the whole class.</p>
      </motion.div>

      <Card className="flex flex-col md:flex-row gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="input-field"
          >
            <option value="10-A">10-A</option>
            <option value="10-B">10-B</option>
          </select>
        </div>
        <div className="flex-1" />
        <Button variant="primary" onClick={handleSubmit} className="w-full md:w-auto">
          Save Attendance
        </Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="font-semibold text-gray-800 dark:text-white">{monthLabel}</div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  const d = new Date(visibleMonth);
                  d.setMonth(d.getMonth() - 1);
                  setVisibleMonth(d);
                }}
                title="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="p-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  const d = new Date(visibleMonth);
                  d.setMonth(d.getMonth() + 1);
                  setVisibleMonth(d);
                }}
                title="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((dObj) => {
              const day = dObj.getDate();
              const dateStr = dObj.toISOString().split('T')[0];
              const isCurrentMonth = dObj.getMonth() === visibleMonth.getMonth();
              const isSelected = dateStr === selectedDate;
              const indicator = getDayIndicator(dObj);

              const badgeClass =
                indicator.tone === 'red'
                  ? 'bg-red-500 text-white'
                  : indicator.tone === 'orange'
                    ? 'bg-orange-500 text-white'
                    : indicator.tone === 'green'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300';

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-2 rounded-xl border text-sm transition-colors ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : isCurrentMonth
                        ? 'border-gray-200 dark:border-gray-700 bg-white/0 dark:bg-white/0'
                        : 'border-gray-100 dark:border-gray-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{day}</span>
                    {indicator.text ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeClass}`}>
                        {indicator.text.split(' ')[0]}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Summary for {selectedDate}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Present/late/absent is calculated across all teacher subjects for the day.
                </p>
              </div>
              <Badge color="blue">{selectedClass}</Badge>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge color="green">{daySummary.present.length} Present</Badge>
              <Badge color="yellow">{daySummary.late.length} Late</Badge>
              <Badge color="red">{daySummary.absent.length} Absent</Badge>
              {daySummary.none.length > 0 && <Badge color="gray">{daySummary.none.length} Not marked</Badge>}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Present</p>
                <p className="text-sm text-gray-800 dark:text-gray-100 mt-1 line-clamp-2">
                  {daySummary.present.slice(0, 5).map(s => s.rollNo || s.name).join(', ')}
                  {daySummary.present.length > 5 ? ` +${daySummary.present.length - 5} more` : ''}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Late</p>
                <p className="text-sm text-gray-800 dark:text-gray-100 mt-1 line-clamp-2">
                  {daySummary.late.slice(0, 5).map(s => s.rollNo || s.name).join(', ')}
                  {daySummary.late.length > 5 ? ` +${daySummary.late.length - 5} more` : ''}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Absent</p>
                <p className="text-sm text-gray-800 dark:text-gray-100 mt-1 line-clamp-2">
                  {daySummary.absent.slice(0, 5).map(s => s.rollNo || s.name).join(', ')}
                  {daySummary.absent.length > 5 ? ` +${daySummary.absent.length - 5} more` : ''}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid gap-3">
            {students.map((student, idx) => {
              const current = marks[student.id] || getAggregatedStatusForStudent(student.id, selectedDate);
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card className="flex items-center gap-4 p-4">
                    <span className="text-2xl">{student.avatar}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.rollNo}</p>
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(statusConfig).map(([status, config]) => {
                        const Icon = config.icon;
                        const isActive = current === status;
                        return (
                          <motion.button
                            key={status}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleMark(student.id, status)}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all ${
                              isActive
                                ? `bg-gradient-to-br ${config.color} shadow-lg`
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                            }`}
                            title={config.label}
                          >
                            <Icon size={18} />
                          </motion.button>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
