import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import {
  Users, Search, Plus, User, Mail, Phone, Calendar,
  Briefcase, BookOpen, Star, Target, ClipboardList,
  DollarSign, CheckCircle, X, Edit, BarChart3,
} from 'lucide-react';

interface StaffProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  employeeId: string;
  dateOfJoining: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
  phone?: string;
}

interface DeptStat {
  department: string;
  count: number;
}

const DEPARTMENTS = [
  'ACADEMIC', 'ADMINISTRATION', 'ACCOUNTS', 'TRANSPORT', 'LIBRARY', 'IT', 'SPORTS', 'OTHER',
];

const DEPT_COLORS: Record<string, string> = {
  ACADEMIC: 'bg-blue-100 text-blue-700',
  ADMINISTRATION: 'bg-purple-100 text-purple-700',
  ACCOUNTS: 'bg-green-100 text-green-700',
  TRANSPORT: 'bg-orange-100 text-orange-700',
  LIBRARY: 'bg-yellow-100 text-yellow-700',
  IT: 'bg-cyan-100 text-cyan-700',
  SPORTS: 'bg-red-100 text-red-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

const EMPTY_FORM = {
  userId: '', firstName: '', lastName: '', email: '',
  employeeId: '', department: 'ACADEMIC' as string,
  designation: '', dateOfJoining: '', qualification: '',
  specialization: '', experience: '', phone: '',
};

export default function AdminHR() {
  const [activeTab, setActiveTab] = useState('staff-directory');
  const [summary, setSummary] = useState({ teachers: 0, staff: 0, pendingLeaves: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.getUsers(),
      api.getStaffDirectory(),
      api.getLeaveRequests(),
    ]).then(([usersResult]) => {
      const users = usersResult.status === 'fulfilled' ? (Array.isArray(usersResult.value) ? usersResult.value : []) : [];
      setSummary({
        teachers: users.filter((u: any) => u.role === 'teacher').length,
        staff: users.filter((u: any) => ['staff', 'admin', 'librarian', 'coordinator', 'manager'].includes(u.role)).length,
        pendingLeaves: 0,
      });
      setSummaryLoading(false);
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Human Resources</h1>
        <p className="text-muted-foreground">Staff management, profiles and department information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          {summaryLoading ? <Skeleton className="h-16" /> : (
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{summary.teachers}</p>
                <p className="text-sm text-muted-foreground">Teachers</p>
              </div>
            </div>
          )}
        </Card>
        <Card className="p-4">
          {summaryLoading ? <Skeleton className="h-16" /> : (
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{summary.staff}</p>
                <p className="text-sm text-muted-foreground">Staff</p>
              </div>
            </div>
          )}
        </Card>
        <Card className="p-4">
          {summaryLoading ? <Skeleton className="h-16" /> : (
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{summary.pendingLeaves}</p>
                <p className="text-sm text-muted-foreground">Pending Leaves</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="staff-directory">Staff Directory</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="staff-directory"><StaffDirectoryTab /></TabsContent>
        <TabsContent value="leave"><LeaveTab /></TabsContent>
        <TabsContent value="recruitment"><RecruitmentTab /></TabsContent>
        <TabsContent value="training"><TrainingTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function StaffDirectoryTab() {
  const [profiles, setProfiles] = useState<StaffProfile[]>([]);
  const [deptStats, setDeptStats] = useState<DeptStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadProfiles(); loadDeptStats(); }, [filterDept]);

  function loadProfiles() {
    setLoading(true);
    api.getStaffDirectory()
      .then(data => setProfiles(Array.isArray(data) ? data.filter((s: any) => !filterDept || s.department === filterDept) : []))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }

  function loadDeptStats() {
    api.getStaffDirectory().then(data => {
      const list = Array.isArray(data) ? data : [];
      const stats = DEPARTMENTS.map(d => ({
        department: d,
        count: list.filter((s: any) => s.department === d).length,
      })).filter(s => s.count > 0);
      setDeptStats(stats);
    }).catch(() => setDeptStats([]));
  }

  function handleSearch() {
    if (!searchQuery.trim()) { loadProfiles(); return; }
    setLoading(true);
    fetch(`/api/v1/staff-directory/search?q=${encodeURIComponent(searchQuery)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setProfiles(Array.isArray(data) ? data : []))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.firstName || !form.lastName || !form.email || !form.employeeId || !form.designation || !form.dateOfJoining) {
      setFormError('First Name, Last Name, Email, Employee ID, Designation and Date of Joining are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        employeeId: form.employeeId,
        department: form.department,
        designation: form.designation,
        dateOfJoining: form.dateOfJoining,
      };
      if (form.phone) payload.phone = form.phone;
      if (form.qualification) payload.qualification = form.qualification;
      if (form.specialization) payload.specialization = form.specialization;
      if (form.experience) payload.experience = parseInt(form.experience);
      if (form.userId) payload.userId = form.userId;

      let res;
      if (editingId) {
        res = await api.updateStaff(editingId, payload);
      } else {
        res = await api.createStaff(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      loadProfiles();
      loadDeptStats();
    } catch (e: any) {
      setFormError(e.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(profile: StaffProfile) {
    setEditingId(profile.id);
    setForm({
      userId: '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      employeeId: profile.employeeId,
      department: profile.department || 'ACADEMIC',
      designation: profile.designation,
      dateOfJoining: profile.dateOfJoining,
      qualification: profile.qualification || '',
      specialization: profile.specialization || '',
      experience: profile.experience?.toString() || '',
      phone: profile.phone || '',
    });
    setShowForm(true);
  }

  const filtered = profiles.filter(s =>
    !filterDept || s.department === filterDept
  );

  return (
    <div className="space-y-4">
      {/* Department Stats */}
      {deptStats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {deptStats.map(s => (
            <div key={s.department} className="bg-card border rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{s.count}</div>
              <div className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${DEPT_COLORS[s.department] ?? 'bg-gray-100 text-gray-700'}`}>
                {s.department}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filter + Add */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by designation, specialization..."
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm bg-background"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <button onClick={() => { setFilterDept(''); setSearchQuery(''); }} className={`px-3 py-1.5 text-xs rounded-full border ${!filterDept ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>All</button>
          {DEPARTMENTS.map(d => (
            <button key={d} onClick={() => setFilterDept(d)} className={`px-3 py-1.5 text-xs rounded-full border ${filterDept === d ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>{d}</button>
          ))}
        </div>
        <Button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Staff
        </Button>
      </div>

      {/* Staff Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No staff profiles found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                  {p.designation?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${DEPT_COLORS[p.department] || 'bg-gray-100 text-gray-700'}`}>
                      {p.department || 'OTHER'}
                    </span>
                    <span className="text-xs text-muted-foreground">#{p.employeeId}</span>
                  </div>
                  <p className="font-semibold mt-1 truncate">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{p.designation}</p>
                  {p.specialization && <p className="text-xs text-muted-foreground truncate">{p.specialization}</p>}
                </div>
                <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 pt-3 border-t space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined: {p.dateOfJoining ? new Date(p.dateOfJoining).toLocaleDateString() : 'N/A'}</div>
                {p.qualification && <div className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {p.qualification}</div>}
                {p.experience != null && <div>Experience: {p.experience} yr{p.experience !== 1 ? 's' : ''}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Staff Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Staff Profile' : 'Add Staff Profile'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">First Name *</label>
                  <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="John" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Last Name *</label>
                  <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="john@school.edu" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Employee ID *</label>
                  <input value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="EMP-001" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Department *</label>
                  <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Designation *</label>
                  <input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="Teacher / Principal..." />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Date of Joining *</label>
                  <input type="date" value={form.dateOfJoining} onChange={e => setForm(f => ({ ...f, dateOfJoining: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Qualification</label>
                  <input value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="M.Sc., B.Ed." />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Specialization</label>
                  <input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="Mathematics, Science..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Experience (years)</label>
                  <input type="number" min="0" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="5" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="+91 9876543210" />
                </div>
              </div>

              {formError && <p className="text-red-500 text-xs">{formError}</p>}

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update Profile' : 'Create Profile'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setFormError(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaveTab() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffFilter, setStaffFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ staffName: '', type: 'annual', startDate: '', endDate: '', reason: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getLeaveRequests(); setLeaves(Array.isArray(d) ? d : []); }
    catch { }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      await api.createLeaveRequest(formData);
      setShowCreate(false);
      setFormData({ staffName: '', type: 'annual', startDate: '', endDate: '', reason: '' });
      load();
    } catch {}
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Request Leave</Button>
      </div>
      <div className="space-y-3">
        {leaves.map((l: any) => (
          <Card key={l.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="font-semibold">{l.staffName || l.staff?.firstName + ' ' + (l.staff?.lastName || '')}</p>
                    <p className="text-sm text-muted-foreground">{l.type} • {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</p>
                    {l.reason && <p className="text-xs text-muted-foreground">{l.reason}</p>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={l.status === 'approved' ? 'success' : l.status === 'pending' ? 'warning' : 'destructive'}>{l.status}</Badge>
                {l.status === 'pending' && (
                  <>
                    <button className="p-1.5 hover:bg-green-100 rounded text-green-600"><CheckCircle className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-red-100 rounded text-red-600"><X className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
        {leaves.length === 0 && <p className="text-center text-muted-foreground py-8">No leave records found.</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Request Leave">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Staff Name</label>
              <input value={formData.staffName} onChange={e => setFormData(f => ({ ...f, staffName: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                <option value="annual">Annual</option>
                <option value="sick">Sick</option>
                <option value="personal">Personal</option>
                <option value="maternity">Maternity</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Start Date</label><input type="date" value={formData.startDate} onChange={e => setFormData(f => ({ ...f, startDate: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
            <div><label className="text-sm font-medium">End Date</label><input type="date" value={formData.endDate} onChange={e => setFormData(f => ({ ...f, endDate: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
          </div>
          <div><label className="text-sm font-medium">Reason</label><textarea value={formData.reason} onChange={e => setFormData(f => ({ ...f, reason: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none" rows={2} /></div>
          <Button onClick={handleCreate}>Submit Request</Button>
        </div>
      </Modal>
    </div>
  );
}

function RecruitmentTab() {
  const [recruitments, setRecruitments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ position: '', department: '', description: '', applicants: 0 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getRecruitments(); setRecruitments(Array.isArray(d) ? d : []); }
    catch {}
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      await api.createRecruitment(formData);
      setShowCreate(false);
      setFormData({ position: '', department: '', description: '', applicants: 0 });
      load();
    } catch {}
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Add Opening</Button>
      </div>
      <div className="space-y-3">
        {recruitments.map((r: any) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">{r.position}</h4>
                  <Badge variant="outline">{r.department}</Badge>
                  <Badge variant={r.status === 'open' ? 'success' : 'secondary'}>{r.status}</Badge>
                </div>
                {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
                <p className="text-xs text-muted-foreground mt-1">{r.applicants} applicant(s)</p>
              </div>
            </div>
          </Card>
        ))}
        {recruitments.length === 0 && <p className="text-center text-muted-foreground py-8">No job openings found.</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Opening">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Position</label><input value={formData.position} onChange={e => setFormData(f => ({ ...f, position: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
            <div><label className="text-sm font-medium">Department</label><select value={formData.department} onChange={e => setFormData(f => ({ ...f, department: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background"><option value="academics">Academics</option><option value="administration">Administration</option><option value="finance">Finance</option></select></div>
          </div>
          <div><label className="text-sm font-medium">Description</label><textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none" rows={2} /></div>
          <Button onClick={handleCreate}>Add Opening</Button>
        </div>
      </Modal>
    </div>
  );
}

function TrainingTab() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', attendees: 0 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getTrainingSessions(); setSessions(Array.isArray(d) ? d : []); }
    catch {}
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      await api.createTrainingSession(formData);
      setShowCreate(false);
      setFormData({ title: '', date: '', attendees: 0 });
      load();
    } catch {}
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Add Training</Button>
      </div>
      <div className="space-y-3">
        {sessions.map((ts: any) => (
          <Card key={ts.id} className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-orange-500" />
              <div>
                <h4 className="font-semibold">{ts.title}</h4>
                <p className="text-sm text-muted-foreground">{new Date(ts.date).toLocaleDateString()} • {ts.attendees} attendees</p>
              </div>
              <Badge className="ml-auto">{ts.status}</Badge>
            </div>
          </Card>
        ))}
        {sessions.length === 0 && <p className="text-center text-muted-foreground py-8">No training sessions found.</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Training Session">
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Title</label><input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Date</label><input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
            <div><label className="text-sm font-medium">Attendees</label><input type="number" value={formData.attendees || ''} onChange={e => setFormData(f => ({ ...f, attendees: Number(e.target.value) }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" /></div>
          </div>
          <Button onClick={handleCreate}>Add Training</Button>
        </div>
      </Modal>
    </div>
  );
}
