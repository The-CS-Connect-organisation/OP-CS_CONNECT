import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
  FileText, Plus, Save, Send, Eye, Clock, Globe,
  BarChart3, CheckCircle, XCircle, Users, Percent,
  Award, Download, Edit, PlusCircle
} from 'lucide-react';

interface Exam {
  id: string; title: string; subject: string; date: string;
  totalMarks: number; status: string;
}
interface StudentResult {
  studentId: string; studentName: string; marks: number; totalMarks: number;
}
interface OnlineExam {
  id: string; title: string; duration: number; status: 'draft' | 'published';
}
interface ExamAnalytics {
  passPercentage: number; averageMarks: number; totalStudents: number;
  passed: number; failed: number; gradeDistribution: { grade: string; count: number }[];
}

export default function TeacherExamResults() {
  const [activeTab, setActiveTab] = useState('exam-results');

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [results, setResults] = useState<StudentResult[]>([]);
  const [marksEntries, setMarksEntries] = useState<Record<string, number>>({});
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  const [graceExamId, setGraceExamId] = useState('');
  const [graceResults, setGraceResults] = useState<StudentResult[]>([]);
  const [graceMarks, setGraceMarks] = useState<Record<string, { marks: number; reason: string }>>({});
  const [showGraceForm, setShowGraceForm] = useState<Record<string, boolean>>({});

  const [onlineExams, setOnlineExams] = useState<OnlineExam[]>([]);
  const [loadingOnline, setLoadingOnline] = useState(true);
  const [showOnlineForm, setShowOnlineForm] = useState(false);
  const [onlineForm, setOnlineForm] = useState({ title: '', duration: 60, subject: 'Math', class: '10-A' });

  const [analyticsExamId, setAnalyticsExamId] = useState('');
  const [analytics, setAnalytics] = useState<ExamAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    loadExams();
    loadOnlineExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoadingExams(true);
      const data = await api.getExams();
      setExams(Array.isArray(data) ? data : []);
    } catch {} finally { setLoadingExams(false); }
  };

  const loadOnlineExams = async () => {
    try {
      setLoadingOnline(true);
      const data = await api.getExams({ type: 'online' });
      setOnlineExams(Array.isArray(data) ? data : []);
    } catch {} finally { setLoadingOnline(false); }
  };

  const loadResults = async (examId: string) => {
    if (!examId) { setResults([]); return; }
    try {
      setLoadingResults(true);
      const data = await api.getExamResults(examId);
      const list = Array.isArray(data) ? data : [];
      setResults(list);
      const marks: Record<string, number> = {};
      list.forEach((r: StudentResult) => { marks[r.studentId] = r.marks || 0; });
      setMarksEntries(marks);
    } catch { setResults([]); } finally { setLoadingResults(false); }
  };

  const loadGraceResults = async (examId: string) => {
    if (!examId) { setGraceResults([]); return; }
    try {
      const data = await api.getExamResults(examId);
      setGraceResults(Array.isArray(data) ? data : []);
    } catch { setGraceResults([]); }
  };

  const loadAnalytics = async (examId: string) => {
    if (!examId) { setAnalytics(null); return; }
    try {
      setLoadingAnalytics(true);
      const data = await api.getExamAnalytics(examId);
      setAnalytics(data);
    } catch { setAnalytics(null); } finally { setLoadingAnalytics(false); }
  };

  const handleSubmitResults = async () => {
    if (!selectedExam) return;
    try {
      const entries = Object.entries(marksEntries).map(([studentId, marks]) => ({ studentId, marks }));
      await api.enterExamResult(selectedExam, { entries });
      alert('Results saved successfully');
    } catch {}
  };

  const handlePublishResults = async () => {
    if (!selectedExam) return;
    try {
      await api.publishExamResults(selectedExam);
      alert('Results published successfully');
    } catch {}
  };

  const handleApplyGrace = async (studentId: string) => {
    const grace = graceMarks[studentId];
    if (!grace || !graceExamId) return;
    try {
      await api.applyGraceMarks(graceExamId, { studentId, marks: grace.marks, reason: grace.reason });
      setShowGraceForm(prev => ({ ...prev, [studentId]: false }));
      setGraceMarks(prev => { const n = { ...prev }; delete n[studentId]; return n; });
      await loadGraceResults(graceExamId);
      alert('Grace marks applied');
    } catch {}
  };

  const handleCreateOnlineExam = async () => {
    if (!onlineForm.title.trim()) return;
    try {
      const data = await api.createOnlineExam(onlineForm);
      setOnlineExams(prev => [...prev, data]);
      setOnlineForm({ title: '', duration: 60, subject: 'Math', class: '10-A' });
      setShowOnlineForm(false);
    } catch {}
  };

  const totalMarks = results.length > 0 ? results[0].totalMarks : 100;

  const skeletonRows = () => (
    <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exam Results</h1>
          <p className="text-muted-foreground">Manage exam results, grace marks, and analytics</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="exam-results"><FileText className="w-4 h-4 mr-1" />Exam Results</TabsTrigger>
          <TabsTrigger value="grace-marks"><Award className="w-4 h-4 mr-1" />Grace Marks</TabsTrigger>
          <TabsTrigger value="online-exams"><Globe className="w-4 h-4 mr-1" />Online Exams</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-1" />Result Analytics</TabsTrigger>
        </TabsList>

        {/* Exam Results */}
        <TabsContent value="exam-results">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Exam</label>
            <select
              value={selectedExam}
              onChange={e => { setSelectedExam(e.target.value); loadResults(e.target.value); }}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            >
              <option value="">Choose an exam...</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.title} ({ex.subject})</option>
              ))}
            </select>
          </div>

          {selectedExam && (
            <>
              <div className="flex gap-2 mb-4">
                <Button onClick={handleSubmitResults}><Save className="w-4 h-4 mr-2" />Save Results</Button>
                <Button variant="secondary" onClick={handlePublishResults}><Send className="w-4 h-4 mr-2" />Publish</Button>
              </div>

              {loadingResults ? skeletonRows() : (
                <div className="space-y-3">
                  {results.map(r => (
                    <Card key={r.studentId} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-orange-500" />
                          <div>
                            <h3 className="font-semibold">{r.studentName}</h3>
                            <p className="text-xs text-muted-foreground">ID: {r.studentId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            className="w-24 text-center"
                            value={marksEntries[r.studentId] ?? ''}
                            onChange={e => setMarksEntries(prev => ({ ...prev, [r.studentId]: parseFloat(e.target.value) || 0 }))}
                            min={0}
                            max={totalMarks}
                          />
                          <span className="text-sm text-muted-foreground">/ {totalMarks}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {results.length === 0 && !loadingResults && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results yet</h3>
                  <p className="text-muted-foreground">Select an exam with results to view</p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Grace Marks */}
        <TabsContent value="grace-marks">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Exam</label>
            <select
              value={graceExamId}
              onChange={e => { setGraceExamId(e.target.value); loadGraceResults(e.target.value); }}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            >
              <option value="">Choose an exam...</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.title} ({ex.subject})</option>
              ))}
            </select>
          </div>

          {graceExamId && (
            graceResults.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results</h3>
                <p className="text-muted-foreground">No results found for this exam</p>
              </div>
            ) : (
              <div className="space-y-3">
                {graceResults.map(r => (
                  <Card key={r.studentId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{r.studentName}</h3>
                        <p className="text-sm text-muted-foreground">Current: {r.marks} / {r.totalMarks}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {showGraceForm[r.studentId] ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Marks"
                              className="w-20"
                              value={graceMarks[r.studentId]?.marks ?? ''}
                              onChange={e => setGraceMarks(prev => ({ ...prev, [r.studentId]: { ...prev[r.studentId], marks: parseFloat(e.target.value) || 0, reason: prev[r.studentId]?.reason || '' } }))}
                            />
                            <Input
                              placeholder="Reason"
                              className="w-40"
                              value={graceMarks[r.studentId]?.reason ?? ''}
                              onChange={e => setGraceMarks(prev => ({ ...prev, [r.studentId]: { ...prev[r.studentId], marks: prev[r.studentId]?.marks || 0, reason: e.target.value } }))}
                            />
                            <Button size="sm" onClick={() => handleApplyGrace(r.studentId)}><Save className="w-3 h-3 mr-1" />Apply</Button>
                            <Button size="sm" variant="outline" onClick={() => setShowGraceForm(prev => ({ ...prev, [r.studentId]: false }))}>Cancel</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setShowGraceForm(prev => ({ ...prev, [r.studentId]: true }))}>
                            <PlusCircle className="w-4 h-4 mr-1" />Grace Marks
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}
        </TabsContent>

        {/* Online Exams */}
        <TabsContent value="online-exams">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowOnlineForm(true)}><Plus className="w-4 h-4 mr-2" />Create Online Exam</Button>
          </div>

          {showOnlineForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">Create Online Exam</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Exam Title" value={onlineForm.title} onChange={e => setOnlineForm({ ...onlineForm, title: e.target.value })} />
                <select value={onlineForm.subject} onChange={e => setOnlineForm({ ...onlineForm, subject: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  {['Math', 'Science', 'English', 'History', 'Geography', 'Art'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={onlineForm.class} onChange={e => setOnlineForm({ ...onlineForm, class: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  {['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Input type="number" placeholder="Duration (minutes)" value={onlineForm.duration} onChange={e => setOnlineForm({ ...onlineForm, duration: parseInt(e.target.value) || 60 })} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateOnlineExam}><Save className="w-4 h-4 mr-2" />Create</Button>
                <Button variant="outline" onClick={() => setShowOnlineForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loadingOnline ? skeletonRows() : onlineExams.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No online exams</h3>
              <p className="text-muted-foreground">Create your first online exam</p>
            </div>
          ) : (
            <div className="space-y-4">
              {onlineExams.map(exam => (
                <Card key={exam.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold">{exam.title}</h3>
                        <Badge variant={exam.status === 'published' ? 'success' : 'warning'}>{exam.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{exam.duration} min</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" />Questions</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Result Analytics */}
        <TabsContent value="analytics">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Exam</label>
            <select
              value={analyticsExamId}
              onChange={e => { setAnalyticsExamId(e.target.value); loadAnalytics(e.target.value); }}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            >
              <option value="">Choose an exam...</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.title} ({ex.subject})</option>
              ))}
            </select>
          </div>

          {loadingAnalytics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : analytics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Percent className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pass Percentage</p>
                      <p className="text-2xl font-bold">{analytics.passPercentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Average Marks</p>
                      <p className="text-2xl font-bold">{analytics.averageMarks.toFixed(1)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold">{analytics.totalStudents}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex gap-4 mb-6">
                <Card className="p-4 flex-1">
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Passed: {analytics.passed}</span>
                  </div>
                </Card>
                <Card className="p-4 flex-1">
                  <div className="flex items-center gap-2 text-red-500">
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Failed: {analytics.failed}</span>
                  </div>
                </Card>
              </div>

              {analytics.gradeDistribution && analytics.gradeDistribution.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Grade Distribution</h3>
                  <div className="space-y-3">
                    {analytics.gradeDistribution.map((g, i) => {
                      const maxCount = Math.max(...analytics.gradeDistribution.map(x => x.count), 1);
                      const pct = (g.count / maxCount) * 100;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-12 text-sm font-medium">{g.grade}</span>
                          <div className="flex-1 h-6 bg-accent rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-10 text-sm text-right text-muted-foreground">{g.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No analytics</h3>
              <p className="text-muted-foreground">Select an exam to view analytics</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
