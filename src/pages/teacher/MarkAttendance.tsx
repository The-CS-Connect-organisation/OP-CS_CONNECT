import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/lib/store";
import { api, apiFetch } from "@/lib/api";
import {
  Check, X, Clock, ChevronLeft, ChevronRight, Users, Zap,
  Search, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { getAvatarUrl, getInitials } from "@/lib/avatar";

const statusConfig: Record<string, { icon: React.ElementType; color: string; activeColor: string; label: string }> = {
  present: { icon: Check, color: "text-slate-400", activeColor: "bg-emerald-600 text-white shadow-emerald-600/20", label: "Present" },
  late: { icon: Clock, color: "text-slate-400", activeColor: "bg-amber-500 text-white shadow-amber-500/20", label: "Late" },
  absent: { icon: X, color: "text-slate-400", activeColor: "bg-rose-600 text-white shadow-rose-600/20", label: "Absent" },
};

const CLASSES = ["10-A", "10-B", "11-A", "11-B"];

export default function MarkAttendance() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.getClassAttendance(selectedClass, selectedDate);
        if (!alive) return;
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setStudents(data);
        const initialMarks: Record<string, string> = {};
        data.forEach((s: any) => {
          initialMarks[s.id] = s.status && s.status !== "unmarked" ? s.status : "present";
        });
        setMarks(initialMarks);
        setSubmitted(false);
      } catch {
        setStudents([]);
        setMarks({});
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedClass, selectedDate]);

  const daySummary = useMemo(() => {
    const map: Record<string, number> = { present: 0, late: 0, absent: 0, unmarked: 0 };
    students.forEach((s) => {
      const status = marks[s.id] || "unmarked";
      map[status] = (map[status] || 0) + 1;
    });
    return map;
  }, [students, marks]);

  const handleMark = (studentId: string, status: string) => {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: string) => {
    const newMarks: Record<string, string> = {};
    students.forEach((s) => { newMarks[s.id] = status; });
    setMarks(newMarks);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const entries = students.map((s) => ({
        studentId: s.id,
        status: marks[s.id] || "present",
      }));
      await api.markAttendance({ class: selectedClass, date: selectedDate, entries });
      setSubmitted(true);
    } catch {
      // error
    } finally {
      setSubmitting(false);
    }
  };

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

  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200">
            Teaching
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Users className="text-orange-500" size={32} />
          Mark Attendance
        </h1>
      </motion.div>

      {/* Controls */}
      <Card className="flex flex-col md:flex-row gap-4 p-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-orange-500 transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-orange-500 transition-all min-w-[140px]"
          >
            {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1 flex-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-all"
            />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <Button variant="outline" size="sm" onClick={() => handleMarkAll("present")} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
            All Present
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="bg-orange-500 hover:bg-orange-600 text-white min-w-[160px] rounded-xl shadow-lg shadow-orange-500/20"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            {submitting ? "Saving..." : "Save Records"}
          </Button>
        </div>
      </Card>

      {submitted && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Attendance saved successfully for {selectedClass} on {selectedDate}</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest">
                {visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex gap-1">
                <button onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-[9px] font-bold text-muted-foreground uppercase text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((dObj) => {
                const dateStr = dObj.toISOString().split("T")[0];
                const isCurrentMonth = dObj.getMonth() === visibleMonth.getMonth();
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === new Date().toISOString().split("T")[0];
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-lg text-[10px] font-bold transition-all flex items-center justify-center border ${
                      isSelected
                        ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                        : isToday
                          ? "border-orange-200 bg-orange-50 text-orange-600"
                          : isCurrentMonth
                            ? "border-transparent text-foreground hover:bg-accent"
                            : "border-transparent opacity-20"
                    }`}
                  >
                    {dObj.getDate()}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-4">
            <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-4">Daily Summary</h4>
            <div className="space-y-3">
              {[
                { label: "Present", count: daySummary.present, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Late", count: daySummary.late, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Absent", count: daySummary.absent, color: "text-rose-600", bg: "bg-rose-50" },
                { label: "Unmarked", count: daySummary.unmarked, color: "text-slate-400", bg: "bg-slate-50" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{String(item.count).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                {students.length > 0 && [
                  { pct: (daySummary.present / students.length) * 100, bg: "bg-emerald-500" },
                  { pct: (daySummary.late / students.length) * 100, bg: "bg-amber-500" },
                  { pct: (daySummary.absent / students.length) * 100, bg: "bg-rose-500" },
                ].map((seg, i) => (
                  <div key={i} className={`${seg.bg} transition-all`} style={{ width: `${seg.pct}%` }} />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Student List */}
        <div className="lg:col-span-8 space-y-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-3 text-orange-500 animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading students...</p>
              </motion.div>
            ) : filteredStudents.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center border border-dashed border-border rounded-2xl">
                <Search size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No students found in {selectedClass}</p>
              </motion.div>
            ) : (
              filteredStudents.map((student, idx) => {
                const id = student.id;
                const current = marks[id] || "present";
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card className="flex flex-wrap items-center gap-4 p-3 hover:shadow-md transition-all group">
                      <Avatar className="w-10 h-10 rounded-xl">
                        <AvatarImage src={getAvatarUrl(student)} className="rounded-xl" />
                        <AvatarFallback className="bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 font-bold text-sm rounded-xl group-hover:from-orange-200 group-hover:to-amber-200 transition-all">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate">{student.name}</h4>
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-0.5">
                          ID: {id} &middot; {student.class}
                        </p>
                      </div>
                      <div className="flex gap-1.5 p-1 bg-accent/50 rounded-xl border border-border/50">
                        {Object.entries(statusConfig).map(([status, config]) => {
                          const Icon = config.icon;
                          const isActive = current === status;
                          return (
                            <button
                              key={status}
                              onClick={() => handleMark(id, status)}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                isActive
                                  ? `${config.activeColor} shadow-lg scale-110`
                                  : `${config.color} hover:bg-background hover:text-foreground`
                              }`}
                              title={config.label}
                            >
                              <Icon size={16} />
                            </button>
                          );
                        })}
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}