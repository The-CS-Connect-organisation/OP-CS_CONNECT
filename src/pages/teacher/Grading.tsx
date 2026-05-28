import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/lib/store";
import { api, apiFetch } from "@/lib/api";
import {
  FileCheck, Loader2, ChevronDown, Star, MessageSquare,
  Save, Eye, CheckCircle2, AlertTriangle, Filter
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { getAvatarUrl, getInitials } from "@/lib/avatar";

const CLASSES = ["10-A", "10-B"];

export default function Grading() {
  const { user } = useAuthStore();
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [gradingData, setGradingData] = useState<Record<string, { marks: string; feedback: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grade">("list");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [assignData, studentData] = await Promise.all([
          api.getAssignments({ class: selectedClass }),
          api.getStudents(selectedClass),
        ]);
        setAssignments(Array.isArray(assignData) ? assignData : []);
        setStudents(Array.isArray(studentData) ? studentData : []);
        if (assignData.length > 0 && !selectedAssignment) {
          setSelectedAssignment(assignData[0].id);
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedClass]);

  const currentAssignment = assignments.find((a) => a.id === selectedAssignment);

  const getStudentSubmission = (studentId: string) => {
    if (!currentAssignment) return null;
    return currentAssignment.submissions?.find((s: any) => s.studentId === studentId);
  };

  const getStudentName = (studentId: string) => {
    const s = students.find((st) => st.id === studentId);
    return s?.name || "Unknown";
  };

  const handleSaveGrade = async (studentId: string) => {
    const data = gradingData[studentId];
    if (!data || !selectedAssignment) return;
    try {
      setSaving(true);
      await api.gradeAssignment(selectedAssignment, { studentId, scoredMarks: parseInt(data.marks) || 0, feedback: data.feedback });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      const res = await api.getAssignments({ class: selectedClass });
      setAssignments(Array.isArray(res) ? res : []);
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  };

  const getGradeFromMarks = (marks: number) => {
    if (marks >= 90) return "A+";
    if (marks >= 80) return "A";
    if (marks >= 70) return "B+";
    if (marks >= 60) return "B";
    if (marks >= 50) return "C";
    return "D";
  };

  if (viewMode === "list") {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200 inline-block mb-2">
            Teaching
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileCheck className="text-orange-500" size={32} />
            Grade Submissions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Review and grade student submissions</p>
        </motion.div>

        <Card className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-orange-500"
            >
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => {
              const totalSubs = assignment.submissions?.length || 0;
              const gradedSubs = assignment.submissions?.filter((s: any) => s.scoredMarks !== undefined).length || 0;
              const pendingSubs = students.length - totalSubs;
              return (
                <motion.div key={assignment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-5 hover:shadow-lg transition-all cursor-pointer group" onClick={() => { setSelectedAssignment(assignment.id); setViewMode("grade"); }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-orange-500 transition-colors">{assignment.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className="text-[10px]">{assignment.class}</Badge>
                          <span className="text-xs text-muted-foreground">Due: {assignment.dueDate}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-bold">{gradedSubs}</span>
                          <span className="text-xs text-muted-foreground">/ {students.length} graded</span>
                        </div>
                        {pendingSubs > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-amber-600">{pendingSubs} pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-accent rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all"
                          style={{ width: `${students.length > 0 ? (gradedSubs / students.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Grading view
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => setViewMode("list")} className="mb-2">
          &larr; Back to assignments
        </Button>
        <h1 className="text-2xl font-bold">{currentAssignment?.title}</h1>
        <p className="text-sm text-muted-foreground">{currentAssignment?.class} &middot; Due: {currentAssignment?.dueDate}</p>
      </motion.div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Grade saved successfully!</span>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {students.map((student) => {
          const submission = getStudentSubmission(student.id);
          const isSubmitted = !!submission;
          const isGraded = submission?.scoredMarks !== undefined;
          const gradeData = gradingData[student.id] || {
            marks: submission?.scoredMarks?.toString() || "",
            feedback: submission?.feedback || "",
          };

          return (
            <motion.div key={student.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10 rounded-xl">
                    <AvatarImage src={getAvatarUrl(student)} className="rounded-xl" />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-sm rounded-xl">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{student.name}</h4>
                      {isGraded && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Graded</Badge>}
                      {isSubmitted && !isGraded && <Badge className="bg-orange-100 text-blue-700 text-[10px]">Submitted</Badge>}
                      {!isSubmitted && <Badge variant="outline" className="text-[10px] text-muted-foreground">Not Submitted</Badge>}
                    </div>

                    {isSubmitted && submission.content && (
                      <div className="mt-2 p-3 bg-accent/50 rounded-lg">
                        <p className="text-sm">{submission.content}</p>
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Marks</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter marks"
                          value={gradeData.marks}
                          onChange={(e) =>
                            setGradingData((prev) => ({
                              ...prev,
                              [student.id]: { ...gradeData, marks: e.target.value },
                            }))
                          }
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 mt-1"
                        />
                        {gradeData.marks && (
                          <span className="text-xs text-muted-foreground mt-1">
                            Grade: {getGradeFromMarks(parseInt(gradeData.marks))}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Feedback</label>
                        <textarea
                          placeholder="Write feedback..."
                          value={gradeData.feedback}
                          onChange={(e) =>
                            setGradingData((prev) => ({
                              ...prev,
                              [student.id]: { ...gradeData, feedback: e.target.value },
                            }))
                          }
                          rows={2}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 mt-1 resize-none"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleSaveGrade(student.id)}
                        disabled={saving || !gradeData.marks}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                        Save Grade
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
