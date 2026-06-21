import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import {
  Users, Trophy, GraduationCap, BookOpen, Vote, Bus, Utensils, Star,
  ClipboardCheck, Activity, Calendar, Plus, Search, Filter, CheckCircle,
  XCircle, Eye, Edit2, Trash2, UserPlus, UserMinus, FileText, Award,
  Target, Briefcase, Share2, ExternalLink, RefreshCw
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  class?: string;
}

interface Portfolio {
  id: string;
  studentId: string;
  studentName: string;
  summary: string;
  lastUpdated: string;
  shared: boolean;
}

interface Reflection {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
}

interface PortfolioAchievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
}

interface Endorsement {
  id: string;
  endorser: string;
  skill: string;
  comment: string;
  date: string;
}

interface CollegeApp {
  id: string;
  university: string;
  program: string;
  status: string;
  deadline: string;
  notes: string;
}

interface Resume {
  id: string;
  content: string;
  lastUpdated: string;
}

interface CareerReadiness {
  id: string;
  skill: string;
  level: string;
  notes: string;
  date: string;
}

export default function AdminPortfolio() {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Portfolio</h1>
        <p className="text-muted-foreground">Manage student e-portfolios, reflections, achievements, and more</p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview"><Eye className="w-4 h-4 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="reflections"><FileText className="w-4 h-4 mr-1" />Reflections</TabsTrigger>
          <TabsTrigger value="achievements"><Award className="w-4 h-4 mr-1" />Achievements</TabsTrigger>
          <TabsTrigger value="endorsements"><Star className="w-4 h-4 mr-1" />Endorsements</TabsTrigger>
          <TabsTrigger value="college-apps"><GraduationCap className="w-4 h-4 mr-1" />College Apps</TabsTrigger>
          <TabsTrigger value="resume"><FileText className="w-4 h-4 mr-1" />Resume</TabsTrigger>
          <TabsTrigger value="career-readiness"><Briefcase className="w-4 h-4 mr-1" />Career Readiness</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="reflections"><ReflectionsTab /></TabsContent>
        <TabsContent value="achievements"><AchievementsTab /></TabsContent>
        <TabsContent value="endorsements"><EndorsementsTab /></TabsContent>
        <TabsContent value="college-apps"><CollegeAppsTab /></TabsContent>
        <TabsContent value="resume"><ResumeTab /></TabsContent>
        <TabsContent value="career-readiness"><CareerReadinessTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function StudentSelector({ selected, onChange }: { selected: string; onChange: (id: string) => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const d = await api.getStudents(); setStudents(Array.isArray(d) ? d : []); }
      catch (err) { console.error('[AdminPortfolio] Failed to load students:', err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <Skeleton className="h-10 w-64" />;

  return (
    <select value={selected} onChange={e => onChange(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-64">
      <option value="">Select a student...</option>
      {students.map(s => (
        <option key={s.id} value={s.id}>{s.name} {s.class ? `(${s.class})` : ''}</option>
      ))}
    </select>
  );
}

function OverviewTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [achievements, setAchievements] = useState<PortfolioAchievement[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [collegeApps, setCollegeApps] = useState<CollegeApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try { const d = await api.getStudents(); setStudents(Array.isArray(d) ? d : []); }
      catch (err) { console.error('[AdminPortfolio] Failed to load students:', err); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const loadPortfolio = async () => {
      try {
        setLoading(true);
        setError('');
        const [p, r, a, e, c] = await Promise.all([
          api.getStudentPortfolio(selectedStudent),
          api.getReflections(selectedStudent),
          api.getStudent(selectedStudent).then(() => api.addPortfolioAchievement).catch(() => null),
          api.getEndorsements(selectedStudent),
          api.getCollegeApps(selectedStudent),
        ]);
        setPortfolio(p);
        setReflections(Array.isArray(r) ? r : []);
        setAchievements(Array.isArray(a) ? a : []);
        setEndorsements(Array.isArray(e) ? e : []);
        setCollegeApps(Array.isArray(c) ? c : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load portfolio');
        setPortfolio(null);
      } finally {
        setLoading(false);
      }
    };
    loadPortfolio();
  }, [selectedStudent]);

  const handleShare = async () => {
    if (!selectedStudent) return;
    try {
      await api.sharePortfolio(selectedStudent);
      setPortfolio(prev => prev ? { ...prev, shared: true } : null);
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium whitespace-nowrap">Select Student:</label>
        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex-1 max-w-md">
          <option value="">Choose a student...</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} {s.class ? `(${s.class})` : ''}</option>
          ))}
        </select>
        {portfolio && (
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" />{portfolio.shared ? 'Shared' : 'Share'}
          </Button>
        )}
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      {!selectedStudent && (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Select a student to view their portfolio</p>
        </Card>
      )}

      {loading && <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>}

      {selectedStudent && !loading && portfolio && (
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-orange-500" />
              <h4 className="font-semibold">Portfolio</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{portfolio.summary || 'No summary'}</p>
            <p className="text-xs text-muted-foreground">Updated: {portfolio.lastUpdated ? new Date(portfolio.lastUpdated).toLocaleDateString() : 'N/A'}</p>
            <Badge variant={portfolio.shared ? 'success' : 'secondary'} className="mt-2">{portfolio.shared ? 'Shared' : 'Private'}</Badge>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold">Reflections</h4>
            </div>
            <p className="text-3xl font-bold">{reflections.length}</p>
            <p className="text-sm text-muted-foreground">total reflections</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-500" />
              <h4 className="font-semibold">Achievements</h4>
            </div>
            <p className="text-3xl font-bold">{achievements.length}</p>
            <p className="text-sm text-muted-foreground">total achievements</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold">Endorsements</h4>
            </div>
            <p className="text-3xl font-bold">{endorsements.length}</p>
            <p className="text-sm text-muted-foreground">total endorsements</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold">College Apps</h4>
            </div>
            <p className="text-3xl font-bold">{collegeApps.length}</p>
            <p className="text-sm text-muted-foreground">total applications</p>
          </Card>
        </div>
      )}

      {selectedStudent && !loading && !portfolio && !error && (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No portfolio data found for this student</p>
        </Card>
      )}
    </div>
  );
}

function ReflectionsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', type: 'academic' });
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try { const d = await api.getStudents(); setStudents(Array.isArray(d) ? d : []); }
      catch (err) { console.error('[AdminPortfolio] Failed to load students:', err); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const load = async () => {
      try { setLoading(true); const d = await api.getReflections(selectedStudent); setReflections(Array.isArray(d) ? d : []); }
      catch { setError('Failed to load reflections'); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedStudent]);

  const handleSubmit = async () => {
    if (!selectedStudent) return;
    try {
      setError('');
      await api.addReflection(selectedStudent, formData);
      setShowForm(false);
      setFormData({ title: '', content: '', type: 'academic' });
      const d = await api.getReflections(selectedStudent);
      setReflections(Array.isArray(d) ? d : []);
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium whitespace-nowrap">Student:</label>
        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex-1 max-w-md">
          <option value="">Choose a student...</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} {s.class ? `(${s.class})` : ''}</option>
          ))}
        </select>
        {selectedStudent && (
          <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Reflection</Button>
        )}
      </div>

      {loading && <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>}

      {!loading && selectedStudent && (
        <div className="space-y-3">
          {reflections.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" />
                    <h4 className="font-semibold">{r.title}</h4>
                    <Badge variant="info">{r.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.date ? new Date(r.date).toLocaleDateString() : ''}</p>
                </div>
              </div>
            </Card>
          ))}
          {reflections.length === 0 && <p className="text-center text-muted-foreground py-8">No reflections found</p>}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Reflection">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Type</label>
            <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="academic">Academic</option>
              <option value="personal">Personal</option>
              <option value="career">Career</option>
              <option value="extracurricular">Extracurricular</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Content</label>
            <Textarea value={formData.content} onChange={e => setFormData(f => ({ ...f, content: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AchievementsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [achievements, setAchievements] = useState<PortfolioAchievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', type: 'academic', date: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try { const d = await api.getStudents(); setStudents(Array.isArray(d) ? d : []); }
      catch (err) { console.error('[AdminPortfolio] Failed to load students:', err); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const load = async () => {
      try {
        setLoading(true);
        const p = await api.getStudentPortfolio(selectedStudent);
        setAchievements(p?.achievements || []);
      } catch { setError('Failed to load achievements'); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedStudent]);

  const handleSubmit = async () => {
    if (!selectedStudent) return;
    try {
      setError('');
      await api.addPortfolioAchievement(selectedStudent, formData);
      setShowForm(false);
      setFormData({ title: '', description: '', type: 'academic', date: '' });
      const p = await api.getStudentPortfolio(selectedStudent);
      setAchievements(p?.achievements || []);
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium whitespace-nowrap">Student:</label>
        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex-1 max-w-md">
          <option value="">Choose a student...</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} {s.class ? `(${s.class})` : ''}</option>
          ))}
        </select>
        {selectedStudent && (
          <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Achievement</Button>
        )}
      </div>

      {loading && <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>}

      {!loading && selectedStudent && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map(a => (
            <Card key={a.id} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h4 className="font-semibold">{a.title}</h4>
                <Badge variant="info">{a.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{a.description}</p>
              {a.date && <p className="text-xs text-muted-foreground mt-2">{new Date(a.date).toLocaleDateString()}</p>}
            </Card>
          ))}
          {achievements.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No achievements found</p>}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Achievement">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="academic">Academic</option>
                <option value="sports">Sports</option>
                <option value="arts">Arts</option>
                <option value="community">Community</option>
                <option value="leadership">Leadership</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EndorsementsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ endorser: '', skill: '', comment: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try { const d = await api.getStudents(); setStudents(Array.isArray(d) ? d : []); }
      catch (err) { console.error('[AdminPortfolio] Failed to load students:', err); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const load = async () => {
      try { setLoading(true); const d = await api.getEndorsements(selectedStudent); setEndorsements(Array.isArray(d) ? d : []); }
      catch { setError('Failed to load endorsements'); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedStudent]);

  const handleSubmit = async () => {
    if (!selectedStudent) return;
    try {
      setError('');
      await api.addEndorsement(selectedStudent, formData);
      setShowForm(false);
      setFormData({ endorser: '', skill: '', comment: '' });
      const d = await api.getEndorsements(selectedStudent);
      setEndorsements(Array.isArray(d) ? d : []);
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium whitespace-nowrap">Student:</label>
        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex-1 max-w-md">
          <option value="">Choose a student...</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} {s.class ? `(${s.class})` : ''}</option>
          ))}
        </select>
        {selectedStudent && (
          <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Endorsement</Button>
        )}
      </div>

      {loading && <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>}

      {!loading && selectedStudent && (
        <div className="space-y-3">
          {endorsements.map(e => (
            <Card key={e.id} className="p-4">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{e.skill}</h4>
                    <Badge variant="secondary">{e.endorser}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{e.comment}</p>
                  {e.date && <p className="text-xs text-muted-foreground mt-1">{new Date(e.date).toLocaleDateString()}</p>}
                </div>
              </div>
            </Card>
          ))}
          {endorsements.length === 0 && <p className="text-center text-muted-foreground py-8">No endorsements found</p>}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Endorsement">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Endorser</label>
              <Input value={formData.endorser} onChange={e => setFormData(f => ({ ...f, endorser: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Skill</label>
              <Input value={formData.skill} onChange={e => setFormData(f => ({ ...f, skill: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Comment</label>
            <Textarea value={formData.comment} onChange={e => setFormData(f => ({ ...f, comment: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CollegeAppsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [apps, setApps] = useState<CollegeApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ university: '', program: '', deadline: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try { const d = await api.getStudents(); setStudents(Array.isArray(d) ? d : []); }
      catch (err) { console.error('[AdminPortfolio] Failed to load students:', err); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const load = async () => {
      try { setLoading(true); const d = await api.getCollegeApps(selectedStudent); setApps(Array.isArray(d) ? d : []); }
      catch { setError('Failed to load college applications'); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedStudent]);

  const handleSubmit = async () => {
    if (!selectedStudent) return;
    try {
      setError('');
      await api.addCollegeApp(selectedStudent, formData);
      setShowForm(false);
      setFormData({ university: '', program: '', deadline: '', notes: '' });
      const d = await api.getCollegeApps(selectedStudent);
      setApps(Array.isArray(d) ? d : []);
    } catch (e: any) { setError(e.message); }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      setError('');
      await api.updateCollegeAppStatus(id, { status });
      if (selectedStudent) {
        const d = await api.getCollegeApps(selectedStudent);
        setApps(Array.isArray(d) ? d : []);
      }
    } catch (e: any) { setError(e.message); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'submitted': return 'info';
      case 'reviewing': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'destructive';
      case 'waitlisted': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium whitespace-nowrap">Student:</label>
        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex-1 max-w-md">
          <option value="">Choose a student...</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} {s.class ? `(${s.class})` : ''}</option>
          ))}
        </select>
        {selectedStudent && (
          <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Application</Button>
        )}
      </div>

      {loading && <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>}

      {!loading && selectedStudent && (
        <div className="space-y-3">
          {apps.map(a => (
            <Card key={a.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-green-500" />
                  <div>
                    <h4 className="font-semibold">{a.university}</h4>
                    <p className="text-sm text-muted-foreground">{a.program}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      {a.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Deadline: {new Date(a.deadline).toLocaleDateString()}</span>}
                      {a.notes && <span>{a.notes}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={a.status} onChange={e => handleStatusUpdate(a.id, e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="waitlisted">Waitlisted</option>
                  </select>
                  <Badge variant={getStatusColor(a.status)}>{a.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
          {apps.length === 0 && <p className="text-center text-muted-foreground py-8">No college applications found</p>}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add College Application">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">University</label>
              <Input value={formData.university} onChange={e => setFormData(f => ({ ...f, university: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Program</label>
              <Input value={formData.program} onChange={e => setFormData(f => ({ ...f, program: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Deadline</label>
            <Input type="date" value={formData.deadline} onChange={e => setFormData(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ResumeTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try { const d = await api.getStudents(); setStudents(Array.isArray(d) ? d : []); }
      catch (err) { console.error('[AdminPortfolio] Failed to load students:', err); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const d = await api.getResume(selectedStudent);
        if (d) {
          setResume(d);
          setContent(d.content || '');
        } else {
          setResume(null);
          setContent('');
        }
      } catch { setError('Failed to load resume'); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedStudent]);

  const handleSave = async () => {
    if (!selectedStudent) return;
    try {
      setSaving(true);
      setError('');
      await api.updateResume(selectedStudent, { content });
      setSaving(false);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium whitespace-nowrap">Student:</label>
        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex-1 max-w-md">
          <option value="">Choose a student...</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} {s.class ? `(${s.class})` : ''}</option>
          ))}
        </select>
      </div>

      {loading && <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>}

      {!loading && selectedStudent && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              <h4 className="font-semibold">Resume {resume && `(Updated: ${resume.lastUpdated ? new Date(resume.lastUpdated).toLocaleDateString() : 'N/A'})`}</h4>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <Textarea value={content} onChange={e => setContent(e.target.value)} className="min-h-[300px]" placeholder="Enter resume content..." />
        </Card>
      )}

      {!loading && !selectedStudent && (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Select a student to view/edit their resume</p>
        </Card>
      )}
    </div>
  );
}

function CareerReadinessTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [readiness, setReadiness] = useState<CareerReadiness[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ skill: '', level: 'beginner', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try { const d = await api.getStudents(); setStudents(Array.isArray(d) ? d : []); }
      catch (err) { console.error('[AdminPortfolio] Failed to load students:', err); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const load = async () => {
      try { setLoading(true); const d = await api.getCareerReadiness(selectedStudent); setReadiness(Array.isArray(d) ? d : []); }
      catch { setError('Failed to load career readiness'); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedStudent]);

  const handleSubmit = async () => {
    if (!selectedStudent) return;
    try {
      setError('');
      await api.addCareerReadiness(selectedStudent, formData);
      setShowForm(false);
      setFormData({ skill: '', level: 'beginner', notes: '' });
      const d = await api.getCareerReadiness(selectedStudent);
      setReadiness(Array.isArray(d) ? d : []);
    } catch (e: any) { setError(e.message); }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'success';
      case 'advanced': return 'info';
      case 'intermediate': return 'warning';
      case 'beginner': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium whitespace-nowrap">Student:</label>
        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex-1 max-w-md">
          <option value="">Choose a student...</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} {s.class ? `(${s.class})` : ''}</option>
          ))}
        </select>
        {selectedStudent && (
          <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Skill</Button>
        )}
      </div>

      {loading && <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>}

      {!loading && selectedStudent && (
        <div className="space-y-3">
          {readiness.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-orange-500" />
                  <div>
                    <h4 className="font-semibold">{r.skill}</h4>
                    {r.notes && <p className="text-sm text-muted-foreground">{r.notes}</p>}
                    {r.date && <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</p>}
                  </div>
                </div>
                <Badge variant={getLevelColor(r.level)}>{r.level}</Badge>
              </div>
            </Card>
          ))}
          {readiness.length === 0 && <p className="text-center text-muted-foreground py-8">No career readiness data found</p>}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Career Skill">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Skill</label>
            <Input value={formData.skill} onChange={e => setFormData(f => ({ ...f, skill: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Level</label>
            <select value={formData.level} onChange={e => setFormData(f => ({ ...f, level: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

