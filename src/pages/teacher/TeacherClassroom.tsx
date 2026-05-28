import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Textarea } from '../../components/ui/Textarea';
import {
  BookOpen, Dumbbell, ListChecks, GraduationCap, DoorOpen,
  StickyNote, Award, Plus, Edit, Trash2, Eye, X, Save, FileText, Clock, Users, CheckCircle, XCircle
} from 'lucide-react';

interface LessonPlan {
  id: string; title: string; subject: string; class: string;
  status: 'active' | 'completed'; week: number; objectives: string[];
}
interface Exercise {
  id: string; title: string; subject: string; class: string;
  questionCount: number; maxScore: number; questions?: any[];
}
interface Rubric {
  id: string; name: string; criteria: string[]; scale: number;
}
interface Course {
  id: string; name: string; code: string; teacher: string; credits: number;
}
interface HallPass {
  id: string; student: string; destination: string; timeOut: string; active: boolean;
}
interface ProgressNote {
  id: string; studentId: string; content: string; createdAt: string;
}
interface Certificate {
  id: string; studentId: string; title: string; issuedAt: string;
}

export default function TeacherClassroom() {
  const [activeTab, setActiveTab] = useState('lesson-plans');

  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [hallPasses, setHallPasses] = useState<HallPass[]>([]);
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [certStudentId, setCertStudentId] = useState('');
  const [students, setStudents] = useState<any[]>([]);

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', subject: 'Math', class: '10-A', status: 'active' as const, week: 1, objectives: '' });
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({ title: '', subject: 'Math', class: '10-A', questionCount: 0, maxScore: 100 });
  const [showRubricForm, setShowRubricForm] = useState(false);
  const [rubricForm, setRubricForm] = useState({ name: '', criteria: '', scale: 5 });
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ name: '', code: '', credits: 3 });
  const [noteContent, setNoteContent] = useState('');
  const [certForm, setCertForm] = useState({ title: '', studentId: '' });
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    loadData();
    loadStudents();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plans, exs, rubs, crs, passes, certs] = await Promise.all([
        api.getLessonPlans(),
        api.getExercises(),
        api.getRubrics(),
        api.getCourses(),
        api.getHallPasses(),
        api.getCertificates('all'),
      ]);
      setLessonPlans(Array.isArray(plans) ? plans : []);
      setExercises(Array.isArray(exs) ? exs : []);
      setRubrics(Array.isArray(rubs) ? rubs : []);
      setCourses(Array.isArray(crs) ? crs : []);
      setHallPasses(Array.isArray(passes) ? passes.filter((p: any) => p.active !== false) : []);
      setCertificates(Array.isArray(certs) ? certs : []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch {}
  };

  const loadProgressNotes = async (studentId: string) => {
    if (!studentId) { setProgressNotes([]); return; }
    try {
      const data = await api.getProgressNotes(studentId);
      setProgressNotes(Array.isArray(data) ? data : []);
    } catch { setProgressNotes([]); }
  };

  const loadCertificates = async (studentId: string) => {
    if (!studentId || studentId === 'all') { setCertificates([]); return; }
    try {
      const data = await api.getCertificates(studentId);
      setCertificates(Array.isArray(data) ? data : []);
    } catch { setCertificates([]); }
  };

  const handleCreateLesson = async () => {
    if (!lessonForm.title.trim()) return;
    try {
      const data = await api.createLessonPlan({
        ...lessonForm,
        objectives: lessonForm.objectives.split(',').map(s => s.trim()).filter(Boolean),
      });
      setLessonPlans(prev => [...prev, data]);
      setLessonForm({ title: '', subject: 'Math', class: '10-A', status: 'active', week: 1, objectives: '' });
      setShowLessonForm(false);
    } catch {}
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      await api.deleteLessonPlan(id);
      setLessonPlans(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  const handleCreateExercise = async () => {
    if (!exerciseForm.title.trim()) return;
    try {
      const data = await api.createExercise(exerciseForm);
      setExercises(prev => [...prev, data]);
      setExerciseForm({ title: '', subject: 'Math', class: '10-A', questionCount: 0, maxScore: 100 });
      setShowExerciseForm(false);
    } catch {}
  };

  const handleCreateRubric = async () => {
    if (!rubricForm.name.trim()) return;
    try {
      const data = await api.createRubric({
        name: rubricForm.name,
        criteria: rubricForm.criteria.split(',').map(s => s.trim()).filter(Boolean),
        scale: rubricForm.scale,
      });
      setRubrics(prev => [...prev, data]);
      setRubricForm({ name: '', criteria: '', scale: 5 });
      setShowRubricForm(false);
    } catch {}
  };

  const handleCreateCourse = async () => {
    if (!courseForm.name.trim() || !courseForm.code.trim()) return;
    try {
      const data = await api.createCourse(courseForm);
      setCourses(prev => [...prev, data]);
      setCourseForm({ name: '', code: '', credits: 3 });
      setShowCourseForm(false);
    } catch {}
  };

  const handleEndPass = async (id: string) => {
    try {
      await api.endHallPass(id);
      setHallPasses(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  const handleCreateNote = async () => {
    if (!selectedStudent || !noteContent.trim()) return;
    try {
      const data = await api.createProgressNote(selectedStudent, { content: noteContent });
      setProgressNotes(prev => [data, ...prev]);
      setNoteContent('');
    } catch {}
  };

  const handleIssueCertificate = async () => {
    if (!certForm.studentId || !certForm.title.trim()) return;
    try {
      const data = await api.issueCertificate(certForm);
      setCertificates(prev => [data, ...prev]);
      setCertForm({ title: '', studentId: '' });
    } catch {}
  };

  const skeletonRows = () => (
    <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
  );

  const emptyState = (icon: React.ReactNode, message: string, sub?: string) => (
    <div className="text-center py-12">
      <div className="w-12 h-12 mx-auto text-muted-foreground mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      {sub && <p className="text-muted-foreground">{sub}</p>}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teacher Classroom</h1>
          <p className="text-muted-foreground">Manage your classroom activities</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="lesson-plans"><BookOpen className="w-4 h-4 mr-1" />Lesson Plans</TabsTrigger>
          <TabsTrigger value="exercises"><Dumbbell className="w-4 h-4 mr-1" />Exercises</TabsTrigger>
          <TabsTrigger value="rubrics"><ListChecks className="w-4 h-4 mr-1" />Rubrics</TabsTrigger>
          <TabsTrigger value="courses"><GraduationCap className="w-4 h-4 mr-1" />Courses</TabsTrigger>
          <TabsTrigger value="hall-passes"><DoorOpen className="w-4 h-4 mr-1" />Hall Passes</TabsTrigger>
          <TabsTrigger value="progress-notes"><StickyNote className="w-4 h-4 mr-1" />Progress Notes</TabsTrigger>
          <TabsTrigger value="certificates"><Award className="w-4 h-4 mr-1" />Certificates</TabsTrigger>
        </TabsList>

        {/* Lesson Plans */}
        <TabsContent value="lesson-plans">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowLessonForm(true)}><Plus className="w-4 h-4 mr-2" />New Lesson Plan</Button>
          </div>
          {showLessonForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">Create Lesson Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Title" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} />
                <select value={lessonForm.subject} onChange={e => setLessonForm({ ...lessonForm, subject: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  {['Math', 'Science', 'English', 'History', 'Geography', 'Art'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={lessonForm.class} onChange={e => setLessonForm({ ...lessonForm, class: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  {['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Input type="number" placeholder="Week" value={lessonForm.week} onChange={e => setLessonForm({ ...lessonForm, week: parseInt(e.target.value) || 1 })} />
                <div className="md:col-span-2">
                  <Input placeholder="Objectives (comma separated)" value={lessonForm.objectives} onChange={e => setLessonForm({ ...lessonForm, objectives: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateLesson}><Save className="w-4 h-4 mr-2" />Create</Button>
                <Button variant="outline" onClick={() => setShowLessonForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}
          {loading ? skeletonRows() : lessonPlans.length === 0 ? emptyState(<BookOpen className="w-12 h-12" />, 'No lesson plans') : (
            <div className="space-y-4">
              {lessonPlans.map(plan => (
                <Card key={plan.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold">{plan.title}</h3>
                        <Badge variant={plan.status === 'active' ? 'success' : 'secondary'}>{plan.status}</Badge>
                        <Badge variant="outline">{plan.class}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.subject} · Week {plan.week}</p>
                      {plan.objectives?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {plan.objectives.map((obj, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />{obj}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteLesson(plan.id)} className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Exercises */}
        <TabsContent value="exercises">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowExerciseForm(true)}><Plus className="w-4 h-4 mr-2" />New Exercise</Button>
          </div>
          {showExerciseForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">Create Exercise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Title" value={exerciseForm.title} onChange={e => setExerciseForm({ ...exerciseForm, title: e.target.value })} />
                <select value={exerciseForm.subject} onChange={e => setExerciseForm({ ...exerciseForm, subject: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  {['Math', 'Science', 'English', 'History', 'Geography', 'Art'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={exerciseForm.class} onChange={e => setExerciseForm({ ...exerciseForm, class: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  {['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Input type="number" placeholder="Question Count" value={exerciseForm.questionCount || ''} onChange={e => setExerciseForm({ ...exerciseForm, questionCount: parseInt(e.target.value) || 0 })} />
                <Input type="number" placeholder="Max Score" value={exerciseForm.maxScore} onChange={e => setExerciseForm({ ...exerciseForm, maxScore: parseInt(e.target.value) || 100 })} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateExercise}><Save className="w-4 h-4 mr-2" />Create</Button>
                <Button variant="outline" onClick={() => setShowExerciseForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}
          {loading ? skeletonRows() : exercises.length === 0 ? emptyState(<Dumbbell className="w-12 h-12" />, 'No exercises') : (
            <div className="space-y-4">
              {exercises.map(ex => (
                <Card key={ex.id} className="p-4 cursor-pointer hover:border-orange-500/50" onClick={() => setSelectedExercise(ex)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold">{ex.title}</h3>
                        <Badge variant="outline">{ex.class}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ex.subject}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><FileText className="w-4 h-4" />{ex.questionCount} questions</span>
                      <span className="flex items-center gap-1"><Award className="w-4 h-4" />{ex.maxScore} pts</span>
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {selectedExercise && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedExercise(null)}>
              <Card className="p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{selectedExercise.title}</h3>
                  <button onClick={() => setSelectedExercise(null)} className="p-1 hover:bg-accent rounded"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Subject: {selectedExercise.subject}</p>
                  <p className="text-sm text-muted-foreground">Class: {selectedExercise.class}</p>
                  <p className="text-sm text-muted-foreground">Questions: {selectedExercise.questionCount}</p>
                  <p className="text-sm text-muted-foreground">Max Score: {selectedExercise.maxScore}</p>
                  {selectedExercise.questions && selectedExercise.questions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Questions</h4>
                      {selectedExercise.questions.map((q, i) => (
                        <div key={i} className="p-3 bg-accent rounded-lg mb-2 text-sm">{q.text || q.question}</div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Rubrics */}
        <TabsContent value="rubrics">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowRubricForm(true)}><Plus className="w-4 h-4 mr-2" />New Rubric</Button>
          </div>
          {showRubricForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">Create Rubric</h3>
              <div className="grid grid-cols-1 gap-4">
                <Input placeholder="Rubric Name" value={rubricForm.name} onChange={e => setRubricForm({ ...rubricForm, name: e.target.value })} />
                <Input placeholder="Criteria (comma separated)" value={rubricForm.criteria} onChange={e => setRubricForm({ ...rubricForm, criteria: e.target.value })} />
                <Input type="number" placeholder="Scale (e.g. 5)" value={rubricForm.scale} onChange={e => setRubricForm({ ...rubricForm, scale: parseInt(e.target.value) || 5 })} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateRubric}><Save className="w-4 h-4 mr-2" />Create</Button>
                <Button variant="outline" onClick={() => setShowRubricForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}
          {loading ? skeletonRows() : rubrics.length === 0 ? emptyState(<ListChecks className="w-12 h-12" />, 'No rubrics') : (
            <div className="space-y-4">
              {rubrics.map(rubric => (
                <Card key={rubric.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <ListChecks className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold">{rubric.name}</h3>
                        <Badge variant="secondary">{rubric.scale}-point scale</Badge>
                      </div>
                      {rubric.criteria?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {rubric.criteria.map((c, i) => (
                            <Badge key={i} variant="outline">{c}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Courses */}
        <TabsContent value="courses">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowCourseForm(true)}><Plus className="w-4 h-4 mr-2" />New Course</Button>
          </div>
          {showCourseForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">Create Course</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Course Name" value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} />
                <Input placeholder="Course Code" value={courseForm.code} onChange={e => setCourseForm({ ...courseForm, code: e.target.value })} />
                <Input type="number" placeholder="Credits" value={courseForm.credits} onChange={e => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) || 3 })} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateCourse}><Save className="w-4 h-4 mr-2" />Create</Button>
                <Button variant="outline" onClick={() => setShowCourseForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}
          {loading ? skeletonRows() : courses.length === 0 ? emptyState(<GraduationCap className="w-12 h-12" />, 'No courses') : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map(course => (
                <Card key={course.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold">{course.name}</h3>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Code: {course.code}</p>
                    <p>Teacher: {course.teacher}</p>
                    <p>Credits: {course.credits}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Hall Passes */}
        <TabsContent value="hall-passes">
          <p className="text-sm text-muted-foreground mb-4">Currently active hall passes</p>
          {loading ? skeletonRows() : hallPasses.length === 0 ? emptyState(<DoorOpen className="w-12 h-12" />, 'No active passes') : (
            <div className="space-y-4">
              {hallPasses.map(pass => (
                <Card key={pass.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <DoorOpen className="w-5 h-5 text-orange-500" />
                      <div>
                        <h3 className="font-semibold">{pass.student}</h3>
                        <p className="text-sm text-muted-foreground">To: {pass.destination} · {pass.timeOut}</p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleEndPass(pass.id)}>
                      <X className="w-4 h-4 mr-1" />End Pass
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Progress Notes */}
        <TabsContent value="progress-notes">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Student</label>
            <select
              value={selectedStudent}
              onChange={e => { setSelectedStudent(e.target.value); loadProgressNotes(e.target.value); }}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            >
              <option value="">Choose a student...</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.class || 'N/A'})</option>
              ))}
            </select>
          </div>
          {selectedStudent && (
            <>
              <div className="flex gap-2 mb-4">
                <Textarea
                  placeholder="Write a progress note..."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleCreateNote} className="self-end"><Save className="w-4 h-4 mr-2" />Add Note</Button>
              </div>
              {progressNotes.length === 0 ? emptyState(<StickyNote className="w-12 h-12" />, 'No notes yet') : (
                <div className="space-y-3">
                  {progressNotes.map(note => (
                    <Card key={note.id} className="p-4">
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(note.createdAt).toLocaleString()}</p>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
          {!selectedStudent && (
            <div className="text-center py-12 text-muted-foreground">Select a student to view progress notes</div>
          )}
        </TabsContent>

        {/* Certificates */}
        <TabsContent value="certificates">
          <div className="mb-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Issue Certificate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Certificate Title" value={certForm.title} onChange={e => setCertForm({ ...certForm, title: e.target.value })} />
                <select value={certForm.studentId} onChange={e => setCertForm({ ...certForm, studentId: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="">Select student...</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.class || 'N/A'})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleIssueCertificate}><Award className="w-4 h-4 mr-2" />Issue Certificate</Button>
              </div>
            </Card>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">View certificates by student</label>
            <select
              value={certStudentId}
              onChange={e => { setCertStudentId(e.target.value); loadCertificates(e.target.value); }}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            >
              <option value="">Choose a student...</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.class || 'N/A'})</option>
              ))}
            </select>
          </div>
          {certStudentId && (
            certificates.length === 0 ? emptyState(<Award className="w-12 h-12" />, 'No certificates for this student') : (
              <div className="space-y-3">
                {certificates.map(cert => (
                  <Card key={cert.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-orange-500" />
                      <div>
                        <h3 className="font-semibold">{cert.title}</h3>
                        <p className="text-sm text-muted-foreground">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
