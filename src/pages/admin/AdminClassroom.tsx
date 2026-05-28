import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  FileText,
  GraduationCap,
  BookMarked,
  PenTool,
  Award,
  Users,
  DoorOpen,
  ClipboardList,
} from 'lucide-react';

interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  class: string;
  objectives: string;
  status: 'draft' | 'published' | 'archived';
}

interface Rubric {
  id: string;
  name: string;
  subject: string;
  criteria: string[];
}

interface Course {
  id: string;
  name: string;
  code: string;
  teacher: string;
  credits: number;
}

interface Lesson {
  id: string;
  title: string;
  courseId: string;
  content: string;
  duration: number;
}

interface Exercise {
  id: string;
  title: string;
  subject: string;
  questions: number;
}

interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  issueDate: string;
}

interface Program {
  id: string;
  name: string;
  description: string;
  coordinator: string;
}

interface PeerReview {
  id: string;
  assignmentId: string;
  reviewer: string;
 reviewee: string;
  score: number;
  comments: string;
}

interface HallPass {
  id: string;
  studentName: string;
  reason: string;
  destination: string;
  issuedAt: string;
  status: 'active' | 'ended';
}

interface ProgressNote {
  id: string;
  studentId: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
}

export default function AdminClassroom() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plans');

  // Lesson Plans
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState({ title: '', subject: '', class: '', objectives: '', status: 'draft' as const });

  // Rubrics
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [showRubricForm, setShowRubricForm] = useState(false);
  const [rubricForm, setRubricForm] = useState({ name: '', subject: '', criteria: '' });

  // Courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ name: '', code: '', teacher: '', credits: 3 });
  const [editingCourse, setEditingCourse] = useState<string | null>(null);

  // Lessons
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', duration: 45 });

  // Exercises
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({ title: '', subject: '', questions: 5 });

  // Certificates
  const [certStudentId, setCertStudentId] = useState('');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm] = useState({ studentId: '', studentName: '', type: 'completion' });

  // Programs
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [programForm, setProgramForm] = useState({ name: '', description: '', coordinator: '' });

  // Peer Review
  const [peerAssignmentId, setPeerAssignmentId] = useState('');
  const [peerReviews, setPeerReviews] = useState<PeerReview[]>([]);

  // Hall Passes
  const [hallPasses, setHallPasses] = useState<HallPass[]>([]);

  // Progress Notes
  const [progressStudentId, setProgressStudentId] = useState('');
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [progressForm, setProgressForm] = useState({ content: '', category: 'academic', author: 'Admin' });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [plans, rubs, crs, exs, progs, passes] = await Promise.all([
        api.getLessonPlans(),
        api.getRubrics(),
        api.getCourses(),
        api.getExercises(),
        api.getPrograms(),
        api.getHallPasses(),
      ]);
      setLessonPlans(Array.isArray(plans) ? plans : []);
      setRubrics(Array.isArray(rubs) ? rubs : []);
      setCourses(Array.isArray(crs) ? crs : []);
      setExercises(Array.isArray(exs) ? exs : []);
      setPrograms(Array.isArray(progs) ? progs : []);
      setHallPasses(Array.isArray(passes) ? passes : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  // Lesson Plans
  const handleCreatePlan = async () => {
    try {
      const created = await api.createLessonPlan(planForm);
      setLessonPlans(prev => [...prev, created]);
      setShowPlanForm(false);
      setPlanForm({ title: '', subject: '', class: '', objectives: '', status: 'draft' });
    } catch {
      // error
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await api.deleteLessonPlan(id);
      setLessonPlans(prev => prev.filter(p => p.id !== id));
    } catch {
      // error
    }
  };

  // Rubrics
  const handleCreateRubric = async () => {
    try {
      const created = await api.createRubric({ ...rubricForm, criteria: rubricForm.criteria.split(',').map(s => s.trim()).filter(Boolean) });
      setRubrics(prev => [...prev, created]);
      setShowRubricForm(false);
      setRubricForm({ name: '', subject: '', criteria: '' });
    } catch {
      // error
    }
  };

  // Courses
  const handleCreateCourse = async () => {
    try {
      if (editingCourse) {
        const updated = await api.updateCourse(editingCourse, courseForm);
        setCourses(prev => prev.map(c => c.id === editingCourse ? updated : c));
        setEditingCourse(null);
      } else {
        const created = await api.createCourse(courseForm);
        setCourses(prev => [...prev, created]);
      }
      setShowCourseForm(false);
      setCourseForm({ name: '', code: '', teacher: '', credits: 3 });
    } catch {
      // error
    }
  };

  const handleEditCourse = (course: Course) => {
    setCourseForm({ name: course.name, code: course.code, teacher: course.teacher, credits: course.credits });
    setEditingCourse(course.id);
    setShowCourseForm(true);
  };

  // Lessons
  const handleLoadLessons = async () => {
    if (!selectedCourseId) return;
    try {
      const data = await api.getLessons(selectedCourseId);
      setLessons(Array.isArray(data) ? data : []);
    } catch {
      // error
    }
  };

  const handleCreateLesson = async () => {
    try {
      const created = await api.createLesson(selectedCourseId, lessonForm);
      setLessons(prev => [...prev, created]);
      setShowLessonForm(false);
      setLessonForm({ title: '', content: '', duration: 45 });
    } catch {
      // error
    }
  };

  // Exercises
  const handleCreateExercise = async () => {
    try {
      const created = await api.createExercise(exerciseForm);
      setExercises(prev => [...prev, created]);
      setShowExerciseForm(false);
      setExerciseForm({ title: '', subject: '', questions: 5 });
    } catch {
      // error
    }
  };

  // Certificates
  const handleLoadCertificates = async () => {
    if (!certStudentId.trim()) return;
    try {
      const data = await api.getCertificates(certStudentId);
      setCertificates(Array.isArray(data) ? data : []);
    } catch {
      // error
    }
  };

  const handleIssueCertificate = async () => {
    try {
      const created = await api.issueCertificate(certForm);
      setCertificates(prev => [...prev, created]);
      setShowCertForm(false);
      setCertForm({ studentId: '', studentName: '', type: 'completion' });
    } catch {
      // error
    }
  };

  // Programs
  const handleCreateProgram = async () => {
    try {
      const created = await api.createProgram(programForm);
      setPrograms(prev => [...prev, created]);
      setShowProgramForm(false);
      setProgramForm({ name: '', description: '', coordinator: '' });
    } catch {
      // error
    }
  };

  // Peer Review
  const handleLoadPeerReviews = async () => {
    if (!peerAssignmentId.trim()) return;
    try {
      const data = await api.getPeerReviews(peerAssignmentId);
      setPeerReviews(Array.isArray(data) ? data : []);
    } catch {
      // error
    }
  };

  // Hall Passes
  const handleEndPass = async (id: string) => {
    try {
      await api.endHallPass(id);
      setHallPasses(prev => prev.map(p => p.id === id ? { ...p, status: 'ended' as const } : p));
    } catch {
      // error
    }
  };

  // Progress Notes
  const handleLoadProgressNotes = async () => {
    if (!progressStudentId.trim()) return;
    try {
      const data = await api.getProgressNotes(progressStudentId);
      setProgressNotes(Array.isArray(data) ? data : []);
    } catch {
      // error
    }
  };

  const handleCreateProgressNote = async () => {
    try {
      const created = await api.createProgressNote(progressStudentId, progressForm);
      setProgressNotes(prev => [...prev, created]);
      setShowProgressForm(false);
      setProgressForm({ content: '', category: 'academic', author: 'Admin' });
    } catch {
      // error
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Classroom Management</h1>
        <p className="text-muted-foreground">Lesson plans, courses, rubrics & more</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="plans">Lesson Plans</TabsTrigger>
          <TabsTrigger value="rubrics">Rubrics</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="peerreview">Peer Review</TabsTrigger>
          <TabsTrigger value="hallpasses">Hall Passes</TabsTrigger>
          <TabsTrigger value="progress">Progress Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{lessonPlans.length} plan(s)</p>
            <Button onClick={() => setShowPlanForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Plan
            </Button>
          </div>

          {showPlanForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Lesson Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Title" value={planForm.title} onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Subject" value={planForm.subject} onChange={(e) => setPlanForm({ ...planForm, subject: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Class" value={planForm.class} onChange={(e) => setPlanForm({ ...planForm, class: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <select value={planForm.status} onChange={(e) => setPlanForm({ ...planForm, status: e.target.value as any })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <textarea placeholder="Objectives" value={planForm.objectives} onChange={(e) => setPlanForm({ ...planForm, objectives: e.target.value })} className="px-3 py-2 rounded-lg border bg-background col-span-2" rows={3} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreatePlan}>Create</Button>
                <Button variant="outline" onClick={() => setShowPlanForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : (
            <div className="space-y-3">
              {lessonPlans.map(p => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">{p.title}</h4>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{p.subject}</span>
                          <span>•</span>
                          <span>{p.class}</span>
                        </div>
                        {p.objectives && <p className="text-sm text-muted-foreground mt-1">{p.objectives}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.status === 'published' ? 'success' : p.status === 'archived' ? 'secondary' : 'warning'}>{p.status}</Badge>
                      <button onClick={() => handleDeletePlan(p.id)} className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </Card>
              ))}
              {lessonPlans.length === 0 && <p className="text-muted-foreground text-center py-8">No lesson plans</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rubrics">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{rubrics.length} rubric(s)</p>
            <Button onClick={() => setShowRubricForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Rubric
            </Button>
          </div>

          {showRubricForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Rubric</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Name" value={rubricForm.name} onChange={(e) => setRubricForm({ ...rubricForm, name: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Subject" value={rubricForm.subject} onChange={(e) => setRubricForm({ ...rubricForm, subject: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Criteria (comma separated)" value={rubricForm.criteria} onChange={(e) => setRubricForm({ ...rubricForm, criteria: e.target.value })} className="px-3 py-2 rounded-lg border bg-background col-span-2" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateRubric}>Create</Button>
                <Button variant="outline" onClick={() => setShowRubricForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {rubrics.map(r => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <ClipboardList className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">{r.name}</h4>
                      <p className="text-sm text-muted-foreground">{r.subject}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {r.criteria?.map((c, i) => <Badge key={i} variant="secondary">{c}</Badge>)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {rubrics.length === 0 && <p className="text-muted-foreground text-center py-8">No rubrics</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{courses.length} course(s)</p>
            <Button onClick={() => { setShowCourseForm(true); setEditingCourse(null); setCourseForm({ name: '', code: '', teacher: '', credits: 3 }); }}>
              <Plus className="w-4 h-4 mr-2" />New Course
            </Button>
          </div>

          {showCourseForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">{editingCourse ? 'Edit Course' : 'New Course'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Course Name" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Course Code" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Teacher" value={courseForm.teacher} onChange={(e) => setCourseForm({ ...courseForm, teacher: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="number" placeholder="Credits" value={courseForm.credits} onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) || 3 })} className="px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateCourse}>{editingCourse ? 'Update' : 'Create'}</Button>
                <Button variant="outline" onClick={() => setShowCourseForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {courses.map(c => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookMarked className="w-5 h-5 text-orange-500" />
                      <div>
                        <h4 className="font-semibold">{c.name}</h4>
                        <p className="text-sm text-muted-foreground">{c.code} | {c.teacher} | {c.credits} credits</p>
                      </div>
                    </div>
                    <button onClick={() => handleEditCourse(c)} className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                  </div>
                </Card>
              ))}
              {courses.length === 0 && <p className="text-muted-foreground text-center py-8">No courses</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lessons">
          <div className="flex gap-4 mb-4">
            <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="px-4 py-2 rounded-lg border bg-background flex-1">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
            <Button onClick={handleLoadLessons}><FileText className="w-4 h-4 mr-2" />Load Lessons</Button>
            {selectedCourseId && (
              <Button onClick={() => setShowLessonForm(true)}>
                <Plus className="w-4 h-4 mr-2" />Add Lesson
              </Button>
            )}
          </div>

          {showLessonForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Lesson</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Title" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="number" placeholder="Duration (min)" value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 45 })} className="px-3 py-2 rounded-lg border bg-background" />
                <textarea placeholder="Content" value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} className="px-3 py-2 rounded-lg border bg-background col-span-2" rows={3} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateLesson}>Create</Button>
                <Button variant="outline" onClick={() => setShowLessonForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {lessons.map(l => (
              <Card key={l.id} className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <div>
                    <h4 className="font-semibold">{l.title}</h4>
                    <p className="text-sm text-muted-foreground">{l.duration} min | Course: {selectedCourseId}</p>
                    {l.content && <p className="text-sm text-muted-foreground mt-1">{l.content}</p>}
                  </div>
                </div>
              </Card>
            ))}
            {selectedCourseId && lessons.length === 0 && <p className="text-muted-foreground text-center py-4">No lessons for this course</p>}
          </div>
        </TabsContent>

        <TabsContent value="exercises">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{exercises.length} exercise(s)</p>
            <Button onClick={() => setShowExerciseForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Exercise
            </Button>
          </div>

          {showExerciseForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Exercise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Title" value={exerciseForm.title} onChange={(e) => setExerciseForm({ ...exerciseForm, title: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Subject" value={exerciseForm.subject} onChange={(e) => setExerciseForm({ ...exerciseForm, subject: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="number" placeholder="Number of Questions" value={exerciseForm.questions} onChange={(e) => setExerciseForm({ ...exerciseForm, questions: parseInt(e.target.value) || 5 })} className="px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateExercise}>Create</Button>
                <Button variant="outline" onClick={() => setShowExerciseForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : (
            <div className="space-y-3">
              {exercises.map(e => (
                <Card key={e.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <PenTool className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{e.title}</h4>
                      <p className="text-sm text-muted-foreground">{e.subject} | {e.questions} questions</p>
                    </div>
                  </div>
                </Card>
              ))}
              {exercises.length === 0 && <p className="text-muted-foreground text-center py-8">No exercises</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="certificates">
          <div className="flex gap-4 mb-4">
            <input type="text" placeholder="Student ID" value={certStudentId} onChange={(e) => setCertStudentId(e.target.value)} className="px-3 py-2 rounded-lg border bg-background flex-1" />
            <Button onClick={handleLoadCertificates}><Award className="w-4 h-4 mr-2" />Load</Button>
            <Button onClick={() => setShowCertForm(true)}>
              <Plus className="w-4 h-4 mr-2" />Issue Certificate
            </Button>
          </div>

          {showCertForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">Issue Certificate</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Student ID" value={certForm.studentId} onChange={(e) => setCertForm({ ...certForm, studentId: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Student Name" value={certForm.studentName} onChange={(e) => setCertForm({ ...certForm, studentName: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <select value={certForm.type} onChange={(e) => setCertForm({ ...certForm, type: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="completion">Completion</option>
                  <option value="achievement">Achievement</option>
                  <option value="participation">Participation</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleIssueCertificate}>Issue</Button>
                <Button variant="outline" onClick={() => setShowCertForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {certificates.map(c => (
              <Card key={c.id} className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-orange-500" />
                  <div>
                    <h4 className="font-semibold">{c.studentName}</h4>
                    <p className="text-sm text-muted-foreground">{c.type} | {new Date(c.issueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            ))}
            {certStudentId && certificates.length === 0 && <p className="text-muted-foreground text-center py-4">No certificates for this student</p>}
          </div>
        </TabsContent>

        <TabsContent value="programs">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{programs.length} program(s)</p>
            <Button onClick={() => setShowProgramForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Program
            </Button>
          </div>

          {showProgramForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Program</h3>
              <div className="grid grid-cols-1 gap-4">
                <input type="text" placeholder="Program Name" value={programForm.name} onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Coordinator" value={programForm.coordinator} onChange={(e) => setProgramForm({ ...programForm, coordinator: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <textarea placeholder="Description" value={programForm.description} onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" rows={3} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateProgram}>Create</Button>
                <Button variant="outline" onClick={() => setShowProgramForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {programs.map(p => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{p.name}</h4>
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                      <p className="text-xs text-muted-foreground">Coordinator: {p.coordinator}</p>
                    </div>
                  </div>
                </Card>
              ))}
              {programs.length === 0 && <p className="text-muted-foreground text-center py-8">No programs</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="peerreview">
          <div className="flex gap-4 mb-4">
            <input type="text" placeholder="Assignment ID" value={peerAssignmentId} onChange={(e) => setPeerAssignmentId(e.target.value)} className="px-3 py-2 rounded-lg border bg-background flex-1" />
            <Button onClick={handleLoadPeerReviews}><Users className="w-4 h-4 mr-2" />Load Reviews</Button>
          </div>

          <div className="space-y-3">
            {peerReviews.map(pr => (
              <Card key={pr.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{pr.reviewer} → {pr.reviewee}</h4>
                      <p className="text-sm text-muted-foreground">{pr.comments}</p>
                    </div>
                  </div>
                  <Badge variant="info">Score: {pr.score}</Badge>
                </div>
              </Card>
            ))}
            {peerAssignmentId && peerReviews.length === 0 && <p className="text-muted-foreground text-center py-4">No peer reviews for this assignment</p>}
          </div>
        </TabsContent>

        <TabsContent value="hallpasses">
          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {hallPasses.map(p => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DoorOpen className="w-5 h-5 text-orange-500" />
                      <div>
                        <h4 className="font-semibold">{p.studentName}</h4>
                        <p className="text-sm text-muted-foreground">{p.reason} → {p.destination}</p>
                        <p className="text-xs text-muted-foreground">{new Date(p.issuedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.status === 'active' ? 'warning' : 'secondary'}>{p.status}</Badge>
                      {p.status === 'active' && (
                        <Button size="sm" variant="outline" onClick={() => handleEndPass(p.id)}>End Pass</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {hallPasses.length === 0 && <p className="text-muted-foreground text-center py-8">No active hall passes</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress">
          <div className="flex gap-4 mb-4">
            <input type="text" placeholder="Student ID" value={progressStudentId} onChange={(e) => setProgressStudentId(e.target.value)} className="px-3 py-2 rounded-lg border bg-background flex-1" />
            <Button onClick={handleLoadProgressNotes}><ClipboardList className="w-4 h-4 mr-2" />Load Notes</Button>
            <Button onClick={() => setShowProgressForm(true)}>
              <Plus className="w-4 h-4 mr-2" />Add Note
            </Button>
          </div>

          {showProgressForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Progress Note</h3>
              <div className="grid grid-cols-1 gap-4">
                <select value={progressForm.category} onChange={(e) => setProgressForm({ ...progressForm, category: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="academic">Academic</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="attendance">Attendance</option>
                  <option value="general">General</option>
                </select>
                <textarea placeholder="Content" value={progressForm.content} onChange={(e) => setProgressForm({ ...progressForm, content: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" rows={3} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateProgressNote}>Save</Button>
                <Button variant="outline" onClick={() => setShowProgressForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {progressNotes.map(n => (
              <Card key={n.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p>{n.content}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Badge variant="secondary">{n.category}</Badge>
                      <span>{n.author}</span>
                      <span>•</span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {progressStudentId && progressNotes.length === 0 && <p className="text-muted-foreground text-center py-4">No progress notes for this student</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
