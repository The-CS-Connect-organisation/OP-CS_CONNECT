import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { useAuthStore } from "@/lib/store";
import { api, apiFetch } from "@/lib/api";import { normalizeAcademicPercentage, formatPercentage } from '@/lib/utils';import {
  GraduationCap, Download, FileText, Loader2, Search,
  ChevronDown, Printer, BarChart3, BookOpen, Star,
  TrendingUp, TrendingDown, Minus, Eye, Filter
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { getAvatarUrl, getInitials } from "@/lib/avatar";

const CLASSES = ["10-A", "10-B"];
const TERMS = ["Term 1", "Term 2", "Final"];

export default function ReportCards() {
  const { user } = useAuthStore();
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<Record<string, any[]>>({});
  const [attendance, setAttendance] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/students?class=${selectedClass}`);
        const studentData = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
        setStudents(studentData);

        const gradesMap: Record<string, any[]> = {};
        const attendanceMap: Record<string, any[]> = {};
        for (const s of studentData) {
          try {
            const gRes = await apiFetch(`/students/${s.id}/grades`);
            gradesMap[s.id] = Array.isArray(gRes) ? gRes : Array.isArray(gRes.data) ? gRes.data : [];
          } catch { gradesMap[s.id] = []; }
          try {
            const aRes = await apiFetch(`/students/${s.id}/attendance`);
            attendanceMap[s.id] = Array.isArray(aRes) ? aRes : Array.isArray(aRes.data) ? aRes.data : [];
          } catch { attendanceMap[s.id] = []; }
        }
        setGrades(gradesMap);
        setAttendance(attendanceMap);
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedClass]);

  const getStudentGPA = (studentId: string) => {
    const g = grades[studentId] || [];
    if (g.length === 0) return 0;
    const total = g.reduce((sum: number, item: any) => sum + (item.marks || 0), 0);
    return normalizeAcademicPercentage(total / g.length);
  };

  const getStudentAttendance = (studentId: string) => {
    const a = attendance[studentId] || [];
    if (a.length === 0) return 0;
    const present = a.filter((r: any) => r.status === "present" || r.status === "late").length;
    return Math.round((present / a.length) * 100);
  };

  const getGradeFromMarks = (marks: number) => {
    if (marks >= 90) return "A+";
    if (marks >= 80) return "A";
    if (marks >= 70) return "B+";
    if (marks >= 60) return "B";
    if (marks >= 50) return "C";
    return "D";
  };

  const getTrend = (studentId: string) => {
    const g = grades[studentId] || [];
    if (g.length < 2) return "neutral";
    const avg = g.reduce((s: number, item: any) => s + (item.marks || 0), 0) / g.length;
    return avg >= 80 ? "up" : avg >= 60 ? "neutral" : "down";
  };

  const handleDownloadReport = (student: any) => {
    const studentGrades = grades[student.id] || [];
    const att = getStudentAttendance(student.id);
    const score = getStudentGPA(student.id);

    let csv = "Subject,Grade,Marks\n";
    studentGrades.forEach((g: any) => {
      csv += `${g.subject},${g.grade || getGradeFromMarks(g.marks)},${g.marks}\n`;
    });
    csv += `\nOverall Percentage,${formatPercentage(score)}\n`;
    csv += `Attendance,${att}%\n`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Report_${student.name}_${selectedTerm}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = (student: any) => {
    const studentGrades = grades[student.id] || [];
    const att = getStudentAttendance(student.id);
    const score = getStudentGPA(student.id);

    const printContent = `
      <html><head><title>Report Card - ${student.name}</title>
      <style>body{font-family:system-ui;padding:40px}h1{color:#1a1a2e}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f5f5f5}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1a1a2e;padding-bottom:20px;margin-bottom:30px}.stats{display:flex;gap:30px;margin:20px 0}</style></head>
      <body>
        <div class="header"><div><h1>Cornerstone International School</h1><p>Report Card - ${selectedTerm}</p></div><div><p style="text-align:right"><strong>${student.name}</strong><br/>Class: ${student.class || selectedClass}<br/>ID: ${student.id}</p></div></div>
        <div class="stats"><div><strong>Overall Percentage:</strong> ${formatPercentage(score)}</div><div><strong>Attendance:</strong> ${att}%</div></div>
        <table><tr><th>Subject</th><th>Grade</th><th>Marks</th></tr>
        ${studentGrades.map((g: any) => `<tr><td>${g.subject}</td><td>${g.grade || getGradeFromMarks(g.marks)}</td><td>${g.marks}</td></tr>`).join("")}
        </table>
        <p style="margin-top:30px;color:#666">Generated on ${new Date().toLocaleDateString()}</p>
      </body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(printContent); w.document.close(); w.print(); }
  };

  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentStudent = students.find((s) => s.id === selectedStudent);
  const currentGrades = selectedStudent ? (grades[selectedStudent] || []) : [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200 inline-block mb-2">Teaching</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <GraduationCap className="text-orange-500" size={32} />
          Report Cards
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Generate and download student report cards</p>
      </motion.div>

      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search student..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
          {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}
          className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
          {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Student List */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
          ) : filteredStudents.length === 0 ? (
            <Card className="p-8 text-center"><p className="text-sm text-muted-foreground">No students found</p></Card>
          ) : (
            filteredStudents.map((student) => {
              const gpa = getStudentGPA(student.id);
              const att = getStudentAttendance(student.id);
              const trend = getTrend(student.id);
              const isSelected = selectedStudent === student.id;
              return (
                <motion.div key={student.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={`p-4 cursor-pointer transition-all hover:shadow-lg ${isSelected ? "border-orange-500 border-2 bg-orange-50/30" : "hover:border-orange-200"}`}
                    onClick={() => setSelectedStudent(student.id)}>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 rounded-xl">
                        <AvatarImage src={getAvatarUrl(student)} className="rounded-xl" />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-sm rounded-xl">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{student.name}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{student.class}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-lg font-bold">{formatPercentage(gpa)}</p>
                          <p className="text-[9px] text-muted-foreground uppercase">Score</p>
                        </div>
                        {trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                        {trend === "down" && <TrendingDown className="w-4 h-4 text-rose-500" />}
                        {trend === "neutral" && <Minus className="w-4 h-4 text-amber-500" />}
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Attendance: <span className={`font-bold ${att >= 90 ? "text-emerald-600" : att >= 75 ? "text-amber-600" : "text-rose-600"}`}>{att}%</span></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Subjects: <span className="font-bold">{(grades[student.id] || []).length}</span></span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Report Card Preview */}
        <div className="lg:col-span-7">
          {!selectedStudent ? (
            <Card className="p-12 text-center">
              <GraduationCap className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-muted-foreground">Select a student</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">Click on a student to preview their report card</p>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="overflow-hidden">
                {/* Report Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Cornerstone International School</h2>
                      <p className="text-sm opacity-80 mt-1">Academic Report Card - {selectedTerm}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handlePrintReport(currentStudent)} className="text-white hover:bg-white/20">
                        <Printer className="w-4 h-4 mr-1" /> Print
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadReport(currentStudent)} className="text-white hover:bg-white/20">
                        <Download className="w-4 h-4 mr-1" /> CSV
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Student Info */}
                  <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-xl">
                    <Avatar className="w-14 h-14 rounded-xl">
                      <AvatarImage src={getAvatarUrl(currentStudent)} className="rounded-xl" />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-lg rounded-xl">
                        {getInitials(currentStudent?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold">{currentStudent?.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">Class: <span className="font-bold text-foreground">{currentStudent?.class || selectedClass}</span></span>
                        <span className="text-xs text-muted-foreground">ID: <span className="font-bold text-foreground">{currentStudent?.id}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-orange-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-orange-600">{formatPercentage(getStudentGPA(selectedStudent))}</p>
                      <p className="text-[10px] text-orange-500 uppercase tracking-widest font-bold mt-1">Academic %</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-emerald-600">{getStudentAttendance(selectedStudent)}%</p>
                      <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mt-1">Attendance</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-orange-600">{currentGrades.length}</p>
                      <p className="text-[10px] text-orange-500 uppercase tracking-widest font-bold mt-1">Subjects</p>
                    </div>
                  </div>

                  {/* Grades Table */}
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Subject Grades</h4>
                    <DataTable
                      columns={[
                        { key: 'subject', header: 'Subject' },
                        { key: 'marks', header: 'Marks' },
                        { key: 'grade', header: 'Grade' },
                        { key: 'performance', header: 'Performance' },
                      ]}
                      data={currentGrades}
                      keyExtractor={(g: any) => g.subject}
                      striped={false}
                      renderRow={(g: any) => (
                        <>
                          <td className="px-4 py-3 text-sm font-medium">{g.subject}</td>
                          <td className="px-4 py-3 text-sm text-center font-bold">{g.marks}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              g.marks >= 90 ? "bg-emerald-100 text-emerald-700" :
                              g.marks >= 80 ? "bg-orange-100 text-blue-700" :
                              g.marks >= 70 ? "bg-amber-100 text-amber-700" :
                              g.marks >= 60 ? "bg-orange-100 text-orange-700" :
                              "bg-rose-100 text-rose-700"
                            }`}>{g.grade || getGradeFromMarks(g.marks)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-full bg-accent rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all ${
                                g.marks >= 90 ? "bg-emerald-500" :
                                g.marks >= 80 ? "bg-orange-500" :
                                g.marks >= 70 ? "bg-amber-500" :
                                g.marks >= 60 ? "bg-orange-500" :
                                "bg-rose-500"
                              }`} style={{ width: `${g.marks}%` }} />
                            </div>
                          </td>
                        </>
                      )}
                    />
                  </div>

                  {/* Remarks */}
                  <div className="p-4 bg-accent/30 rounded-xl">
                    <h4 className="text-sm font-bold mb-2">Teacher Remarks</h4>
                    <p className="text-sm text-muted-foreground">
                       {getStudentGPA(selectedStudent) >= 90
                        ? "Excellent performance! Keep up the great work and continue to challenge yourself."
                        : getStudentGPA(selectedStudent) >= 75
                          ? "Good performance overall. Focus on weaker subjects to improve your academic percentage."
                          : "Needs improvement. Please attend extra help sessions and focus on consistent study habits."}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
