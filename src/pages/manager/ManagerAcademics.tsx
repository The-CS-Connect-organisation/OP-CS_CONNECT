import { useState, useEffect } from 'react';
import { api, apiFetch } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { normalizeAcademicPercentage, formatPercentage } from '@/lib/utils';
import { GraduationCap, Users, BarChart3, TrendingUp, BookOpen, Calendar, Plus, Edit, Trash2, X, Check, Search } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  className?: string;
  teacherId?: string;
  teacherName?: string;
  isElective: boolean;
}

interface Curriculum {
  id: string;
  name: string;
  subject: string;
  grade: string;
  topics: string[];
  hours: number;
}

interface Syllabus {
  id: string;
  title: string;
  subject: string;
  class: string;
  term: string;
  topics: string[];
  completionStatus: string;
}

interface ClassPerf {
  class: string;
  avg: number;
  totalStudents: number;
}

export default function ManagerAcademics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Overview data
  const [stats, setStats] = useState({
    totalClasses: 0, totalStudents: 0, totalTeachers: 0,
    avgGpa: 0, attendanceRate: 0,
    classPerformance: [] as ClassPerf[],
    upcomingExams: [] as { title: string; date: string; class: string }[],
  });

  // Subjects
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', classId: '', isElective: false });

  // Curriculum
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [showCurriculumForm, setShowCurriculumForm] = useState(false);
  const [curriculumForm, setCurriculumForm] = useState({ name: '', subject: '', grade: '', topics: '', hours: 0 });

  // Syllabus
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [showSyllabusForm, setShowSyllabusForm] = useState(false);
  const [syllabusForm, setSyllabusForm] = useState({ title: '', subject: '', class: '', term: '', topics: '' });

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadOverview();
    loadClasses();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const data = await api.getManagerAcademics();
      if (data) setStats(data);
    } catch (err) {
      console.error('[ManagerAcademics] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const data = await api.getStudents();
      if (Array.isArray(data)) {
        const unique = [...new Map(data.map((s: any) => [s.classId || s.class, { id: s.classId || s.class, name: typeof s.class === 'object' ? s.class?.name : s.class }])).values()] as any;
        setClasses(unique.filter((c: any) => c.name));
      }
    } catch {}
  };

  const loadSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch {}
  };

  const loadCurricula = async () => {
    try {
      const data = await api.getCourses();
      setCurricula(Array.isArray(data) ? data.map((c: any) => ({
        id: c.id,
        name: c.name || c.title,
        subject: c.subject || '',
        grade: c.grade || c.class || '',
        topics: c.topics || c.syllabus || [],
        hours: c.hours || c.duration || 0,
      })) : []);
    } catch {}
  };

  const loadSyllabuses = async () => {
    try {
      const data = await api.getExams();
      setSyllabuses(Array.isArray(data) ? data.map((e: any) => ({
        id: e.id,
        title: e.title || e.syllabusTitle,
        subject: e.subject || '',
        class: e.class || '',
        term: e.term || e.type || '',
        topics: e.topics || [],
        completionStatus: e.status || 'pending',
      })) : []);
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'subjects') loadSubjects();
    if (activeTab === 'curriculum') loadCurricula();
    if (activeTab === 'syllabus') loadSyllabuses();
  }, [activeTab]);

  async function handleSubjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...subjectForm };
      if (editingSubject) {
        await apiFetch(`/subjects/${editingSubject.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/subjects', { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowSubjectForm(false);
      setEditingSubject(null);
      setSubjectForm({ name: '', code: '', classId: '', isElective: false });
      loadSubjects();
    } catch (err) {
      console.error('[ManagerAcademics] Subject save failed:', err);
    }
  }

  async function handleDeleteSubject(id: string) {
    try {
      await apiFetch(`/subjects/${id}`, { method: 'DELETE' });
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('[ManagerAcademics] Failed to delete subject:', err);
    }
  }

  const filteredSubjects = subjects.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCurricula = curricula.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSyllabuses = syllabuses.filter(s =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Academics</h1>
        <p className="text-muted-foreground">Academic performance, subjects, curriculum & syllabus management</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-2" />Overview</TabsTrigger>
          <TabsTrigger value="subjects"><BookOpen className="w-4 h-4 mr-2" />Subjects</TabsTrigger>
          <TabsTrigger value="curriculum"><GraduationCap className="w-4 h-4 mr-2" />Curriculum</TabsTrigger>
          <TabsTrigger value="syllabus"><Calendar className="w-4 h-4 mr-2" />Syllabus</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 card-hover">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-orange-500" />
                    <div><p className="text-2xl font-bold stat-value">{stats.totalClasses}</p><p className="text-sm text-muted-foreground">Classes</p></div>
                  </div>
                </Card>
                <Card className="p-4 card-hover">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-orange-500" />
                    <div><p className="text-2xl font-bold stat-value">{stats.totalStudents}</p><p className="text-sm text-muted-foreground">Students</p></div>
                  </div>
                </Card>
                <Card className="p-4 card-hover">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-orange-500" />
                    <div><p className="text-2xl font-bold stat-value">{formatPercentage(normalizeAcademicPercentage(stats.avgGpa))}</p><p className="text-sm text-muted-foreground">Avg Academic %</p></div>
                  </div>
                </Card>
                <Card className="p-4 card-hover">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                    <div><p className="text-2xl font-bold stat-value">{stats.attendanceRate}%</p><p className="text-sm text-muted-foreground">Attendance</p></div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Class Performance</h3>
                  {stats.classPerformance.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No data available</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.classPerformance.map(cls => (
                        <div key={cls.class} className="flex items-center justify-between">
                          <span className="text-sm">{cls.class} <span className="text-muted-foreground">({cls.totalStudents} students)</span></span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-accent rounded-full">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${cls.avg}%` }} />
                            </div>
                            <span className="text-sm font-medium">{cls.avg}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Upcoming Exams</h3>
                  {stats.upcomingExams.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No upcoming exams</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.upcomingExams.map((exam, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                          <div>
                            <p className="font-medium">{exam.title}</p>
                            <p className="text-xs text-muted-foreground">{exam.class}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">{new Date(exam.date).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search subjects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-md text-sm bg-background" />
            </div>
            <Button onClick={() => { setEditingSubject(null); setSubjectForm({ name: '', code: '', classId: '', isElective: false }); setShowSubjectForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Subject
            </Button>
          </div>

          {/* Subject Form Modal */}
          <Modal isOpen={showSubjectForm} onClose={() => setShowSubjectForm(false)} title={editingSubject ? 'Edit Subject' : 'Add Subject'}>
            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Subject Name *</label>
                  <input required value={subjectForm.name} onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="Mathematics" />
                </div>
                <div>
                  <label className="text-sm font-medium">Subject Code *</label>
                  <input required value={subjectForm.code} onChange={e => setSubjectForm(f => ({ ...f, code: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="MTH-101" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Class</label>
                <select value={subjectForm.classId} onChange={e => setSubjectForm(f => ({ ...f, classId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                  <option value="">Select class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isElective" checked={subjectForm.isElective} onChange={e => setSubjectForm(f => ({ ...f, isElective: e.target.checked }))} className="h-4 w-4" />
                <label htmlFor="isElective" className="text-sm">Elective subject</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowSubjectForm(false)}>Cancel</Button>
                <Button type="submit">{editingSubject ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </Modal>

          <div className="space-y-2">
            {filteredSubjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No subjects found. Add one to get started.</p>
            ) : (
              filteredSubjects.map(s => (
                <div key={s.id} className="bg-card border rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{s.name}</span>
                        <Badge variant="outline" className="text-xs">{s.code}</Badge>
                        {s.isElective && <Badge variant="warning" className="text-xs">Elective</Badge>}
                      </div>
                      {s.className && <p className="text-xs text-muted-foreground">{s.className}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingSubject(s); setSubjectForm({ name: s.name, code: s.code, classId: s.classId || '', isElective: s.isElective }); setShowSubjectForm(true); }} className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteSubject(s.id)} className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search curriculum..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-md text-sm bg-background" />
            </div>
            <Button onClick={() => { setCurriculumForm({ name: '', subject: '', grade: '', topics: '', hours: 0 }); setShowCurriculumForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Curriculum
            </Button>
          </div>

          <Modal isOpen={showCurriculumForm} onClose={() => setShowCurriculumForm(false)} title="Add Curriculum">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Name</label><input value={curriculumForm.name} onChange={e => setCurriculumForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
                <div><label className="text-sm font-medium">Subject</label><input value={curriculumForm.subject} onChange={e => setCurriculumForm(f => ({ ...f, subject: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Grade</label><input value={curriculumForm.grade} onChange={e => setCurriculumForm(f => ({ ...f, grade: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
                <div><label className="text-sm font-medium">Hours</label><input type="number" value={curriculumForm.hours} onChange={e => setCurriculumForm(f => ({ ...f, hours: Number(e.target.value) }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
              </div>
              <div><label className="text-sm font-medium">Topics (comma separated)</label><textarea value={curriculumForm.topics} onChange={e => setCurriculumForm(f => ({ ...f, topics: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[80px]" placeholder="Topic 1, Topic 2, Topic 3" /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCurriculumForm(false)}>Cancel</Button>
                <Button onClick={() => {
                  console.log('[ManagerAcademics] Curriculum save:', curriculumForm);
                  setShowCurriculumForm(false);
                  alert('Curriculum feature - backend integration pending. Data logged to console.');
                }}>Save</Button>
              </div>
            </div>
          </Modal>

          <div className="space-y-2">
            {filteredCurricula.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No curriculum entries</p>
            ) : (
              filteredCurricula.map(c => (
                <div key={c.id} className="bg-card border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold">{c.name}</span>
                      <Badge variant="secondary">{c.subject}</Badge>
                      <Badge variant="outline">Grade {c.grade}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{c.hours}h</span>
                  </div>
                  {c.topics && c.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {c.topics.map((topic: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-accent rounded text-xs text-muted-foreground">{topic}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Syllabus Tab */}
        <TabsContent value="syllabus">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search syllabus..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-md text-sm bg-background" />
            </div>
            <Button onClick={() => { setSyllabusForm({ title: '', subject: '', class: '', term: '', topics: '' }); setShowSyllabusForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Syllabus
            </Button>
          </div>

          <Modal isOpen={showSyllabusForm} onClose={() => setShowSyllabusForm(false)} title="Add Syllabus">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Title</label><input value={syllabusForm.title} onChange={e => setSyllabusForm(f => ({ ...f, title: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
                <div><label className="text-sm font-medium">Subject</label><input value={syllabusForm.subject} onChange={e => setSyllabusForm(f => ({ ...f, subject: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Class</label><input value={syllabusForm.class} onChange={e => setSyllabusForm(f => ({ ...f, class: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
                <div><label className="text-sm font-medium">Term</label><input value={syllabusForm.term} onChange={e => setSyllabusForm(f => ({ ...f, term: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
              </div>
              <div><label className="text-sm font-medium">Topics (comma separated)</label><textarea value={syllabusForm.topics} onChange={e => setSyllabusForm(f => ({ ...f, topics: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[80px]" /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSyllabusForm(false)}>Cancel</Button>
                <Button onClick={() => {
                  console.log('[ManagerAcademics] Syllabus save:', syllabusForm);
                  setShowSyllabusForm(false);
                  alert('Syllabus feature - backend integration pending. Data logged to console.');
                }}>Save</Button>
              </div>
            </div>
          </Modal>

          <div className="space-y-2">
            {filteredSyllabuses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No syllabus entries</p>
            ) : (
              filteredSyllabuses.map(s => (
                <div key={s.id} className="bg-card border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold">{s.title}</span>
                      <Badge variant="secondary">{s.subject}</Badge>
                      <Badge variant="outline">{s.class}</Badge>
                      <span className="text-xs text-muted-foreground">Term: {s.term}</span>
                    </div>
                    <Badge variant={s.completionStatus === 'completed' ? 'success' : s.completionStatus === 'in-progress' ? 'warning' : 'secondary'}>{s.completionStatus}</Badge>
                  </div>
                  {s.topics && s.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {s.topics.map((topic: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-accent rounded text-xs text-muted-foreground">{topic}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
