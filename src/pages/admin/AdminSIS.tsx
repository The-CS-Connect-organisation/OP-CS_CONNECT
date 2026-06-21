import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Search, Users, BookOpen, BarChart3, Calendar, FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { api, apiFetch } from '../../lib/api';

interface StudentRow {
  id: string;
  admissionNo: string;
  rollNo?: number;
  firstName: string;
  lastName: string;
  email: string;
  class: string | { name: string; id: string };
  section: string | { name: string; id: string };
  gender?: string;
  dateOfBirth?: string;
  status?: string;
}

interface ClassOption { id: string; name: string; grade: number; }
interface SectionOption { id: string; name: string; }

const EMPTY_FORM = {
  admissionNo: '', firstName: '', lastName: '', email: '',
  classId: '', sectionId: '', dateOfBirth: '', gender: 'MALE',
};

export default function AdminSIS() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [formSections, setFormSections] = useState<SectionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [filterClassId, setFilterClassId] = useState('');
  const [filterSectionId, setFilterSectionId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Overview stats
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalSections, setTotalSections] = useState(0);

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken')}` });

  useEffect(() => {
    const timer = setTimeout(async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const h = { Authorization: `Bearer ${token}` };

      try {
        const r = { ok: true, json: async () => await apiFetch('/v1/classes') };
        if (r.ok) {
          const data = await r.json();
          const list = Array.isArray(data) ? data : [];
          setClasses(list);
          setTotalClasses(list.length);
        }
      } catch {}

      // Fetch all sections count
      try {
        const r = { ok: true, json: async () => await apiFetch('/v1/sections') };
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data)) setTotalSections(data.length);
        }
      } catch {}
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Load sections for filter
  useEffect(() => {
    if (!filterClassId) { setSections([]); setFilterSectionId(''); return; }
    const token = localStorage.getItem('accessToken');
    fetch(`/api/v1/sections?classId=${filterClassId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : []).then(setSections).catch(() => setSections([]));
  }, [filterClassId]);

  // Load sections for form
  useEffect(() => {
    if (!form.classId) { setFormSections([]); return; }
    fetch(`/api/v1/sections?classId=${form.classId}`, { headers: getHeaders() })
      .then(r => r.ok ? r.json() : []).then(setFormSections).catch(() => setFormSections([]));
  }, [form.classId]);

  const fetchStudents = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (filterClassId) params.set('classId', filterClassId);
      if (filterSectionId) params.set('sectionId', filterSectionId);
      params.set('limit', '500');
      const data = await apiFetch(`/v1/students?${params}`); const res = { ok: true, json: async () => data };
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch {}
    setLoading(false);
  }, [filterClassId, filterSectionId]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filtered = students.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const admission = (s.admissionNo || '').toLowerCase();
    const emailAddr = (s.email || '').toLowerCase();
    return name.includes(q) || admission.includes(q) || emailAddr.includes(q);
  });

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === 'classId') setForm(prev => ({ ...prev, classId: value, sectionId: '' }));
    else setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/v1/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm(EMPTY_FORM);
        fetchStudents();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message ?? `Error ${res.status}`);
      }
    } catch {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  const getClassBreakdown = () => {
    const breakdown: Record<string, number> = {};
    students.forEach(s => {
      const cls = typeof s.class === 'object' ? s.class?.name : (s.class || 'Unassigned');
      breakdown[cls] = (breakdown[cls] || 0) + 1;
    });
    return Object.entries(breakdown).sort(([a], [b]) => a.localeCompare(b));
  };

  const classBreakdown = getClassBreakdown();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Information System</h1>
        <p className="text-muted-foreground">Comprehensive student records, class & section management</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{totalClasses}</p>
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{totalSections}</p>
                  <p className="text-sm text-muted-foreground">Sections</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{new Date().getFullYear()}</p>
                  <p className="text-sm text-muted-foreground">Academic Year</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Students by Class</h3>
              {classBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No data</p>
              ) : (
                <div className="space-y-3">
                  {classBreakdown.map(([cls, count]) => (
                    <div key={cls} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{cls}</span>
                      <Badge variant="secondary">{count} student{count !== 1 ? 's' : ''}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Enrolled</span>
                  <span className="font-bold text-lg">{students.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Classes</span>
                  <span className="font-bold text-lg">{totalClasses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sections</span>
                  <span className="font-bold text-lg">{totalSections}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Students/Class</span>
                  <span className="font-bold text-lg">
                    {totalClasses > 0 ? Math.round(students.length / totalClasses) : 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Student Records</h2>
            <Button onClick={() => { setShowForm(v => !v); setError(''); }}>
              {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {showForm ? 'Cancel' : 'Add Student'}
            </Button>
          </div>

          {/* Add Student Form */}
          {showForm && (
            <Card className="p-6 mb-6 border-2 border-primary/20">
              <h2 className="text-lg font-semibold mb-4">New Student</h2>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Admission No *</label>
                    <input required name="admissionNo" value={form.admissionNo} onChange={handleFormChange} placeholder="MIS-2026-001" className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <input required name="firstName" value={form.firstName} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <input required name="lastName" value={form.lastName} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input required type="email" name="email" value={form.email} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                    <input required type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender *</label>
                    <select name="gender" value={form.gender} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Class *</label>
                    <select required name="classId" value={form.classId} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                      <option value="">Select class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Section *</label>
                    <select required name="sectionId" value={form.sectionId} onChange={handleFormChange} disabled={!form.classId} className="w-full border rounded-md px-3 py-2 text-sm bg-background disabled:opacity-50">
                      <option value="">Select section</option>
                      {formSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Add Student'}</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Filters */}
          <div className="bg-card rounded-lg border p-4 mb-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Class</label>
              <select value={filterClassId} onChange={e => { setFilterClassId(e.target.value); setFilterSectionId(''); }} className="border rounded-md px-3 py-2 text-sm min-w-[150px] bg-background">
                <option value="">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Section</label>
              <select value={filterSectionId} onChange={e => setFilterSectionId(e.target.value)} disabled={!filterClassId} className="border rounded-md px-3 py-2 text-sm min-w-[120px] disabled:opacity-50 bg-background">
                <option value="">All Sections</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name, admission no, email..." className="w-full border rounded-md pl-9 pr-3 py-2 text-sm bg-background" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <div className="bg-card rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Roll</th>
                    <th className="text-left p-3 font-medium">Admission No</th>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Class</th>
                    <th className="text-left p-3 font-medium">Section</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {students.length === 0 ? 'No students found. Add a student to get started.' : 'No matching students.'}
                    </td></tr>
                  ) : (
                    filtered.map(s => (
                      <tr key={s.id} className="border-t hover:bg-muted/50">
                        <td className="p-3">{s.rollNo || '-'}</td>
                        <td className="p-3 font-mono text-xs">{s.admissionNo}</td>
                        <td className="p-3 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="p-3">{typeof s.class === 'object' ? s.class?.name : s.class}</td>
                        <td className="p-3">{typeof s.section === 'object' ? s.section?.name : s.section}</td>
                        <td className="p-3 text-muted-foreground">{s.email}</td>
                        <td className="p-3">
                          <Badge variant={s.status === 'active' ? 'success' : 'secondary'} className="text-[10px]">
                            {s.status || 'active'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="classes">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Class Overview</h3>
            {classBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <div className="space-y-3">
                {classBreakdown.map(([cls, count]) => (
                  <div key={cls} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{cls}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{count} students</Badge>
                      <Button size="sm" variant="outline" onClick={() => { setFilterClassId(cls); setActiveTab('students'); }}>
                        View Students
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
