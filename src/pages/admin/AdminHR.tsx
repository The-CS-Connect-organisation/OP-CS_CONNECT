import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import {
  Users, Search, Plus, User, Mail, Phone, Calendar,
  Briefcase, Clock, Award, BookOpen, Star, Target,
  ClipboardList, DollarSign, CheckCircle, X, Edit,
  BarChart3, MapPin,
} from 'lucide-react';

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  employeeId: string;
  joinDate: string;
  qualification: string;
  userId: string;
  email: string;
  phone: string;
}

interface StaffPosition {
  id: string;
  title: string;
  department: string;
  minSalary: number;
  maxSalary: number;
  requirements: string;
}

interface Leave {
  id: string;
  staffName: string;
  staffId: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  expiryDate: string;
  staffName: string;
}

interface TrainingSession {
  id: string;
  title: string;
  date: string;
  attendees: number;
  status: string;
}

interface Appraisal {
  id: string;
  staffName: string;
  rating: number;
  comments: string;
  date: string;
}

interface Recruitment {
  id: string;
  position: string;
  department: string;
  status: string;
  applicants: number;
  description: string;
}

interface OnboardingTask {
  id: string;
  staffName: string;
  task: string;
  status: string;
  dueDate: string;
}

interface PayrollEntry {
  id: string;
  staffName: string;
  salary: number;
  deductions: number;
  netPay: number;
  month: string;
  status: string;
}

export default function AdminHR() {
  const [activeTab, setActiveTab] = useState('staff-directory');
  const [summary, setSummary] = useState({ teachers: 0, staff: 0, pendingLeaves: 0, attendancePresent: 0, attendanceTotal: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.allSettled([
      api.getUsers(),
      api.getStaffDirectory(),
      api.getLeaveRequests(),
      api.getTeacherAttendance(today),
    ]).then(([usersResult, _staffResult, leavesResult, attendanceResult]) => {
      const users = usersResult.status === 'fulfilled' ? (Array.isArray(usersResult.value) ? usersResult.value : []) : [];
      const leaves = leavesResult.status === 'fulfilled' ? (Array.isArray(leavesResult.value) ? leavesResult.value : []) : [];
      const attendance = attendanceResult.status === 'fulfilled' ? (Array.isArray(attendanceResult.value) ? attendanceResult.value : []) : [];
      setSummary({
        teachers: users.filter((u: any) => u.role === 'teacher').length,
        staff: users.filter((u: any) => ['staff', 'admin', 'librarian', 'coordinator', 'manager'].includes(u.role)).length,
        pendingLeaves: leaves.filter((l: any) => l.status === 'pending').length,
        attendancePresent: attendance.filter((a: any) => a.status === 'present').length,
        attendanceTotal: attendance.length,
      });
      setSummaryLoading(false);
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Human Resources</h1>
        <p className="text-muted-foreground">Staff management, payroll, recruitment and more</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <Card className="p-4">
          {summaryLoading ? <Skeleton className="h-16" /> : (
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{summary.attendancePresent}/{summary.attendanceTotal}</p>
                <p className="text-sm text-muted-foreground">Present Today</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="staff-directory">Staff Directory</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="appraisals">Appraisals</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="staff-directory"><StaffDirectoryTab /></TabsContent>
        <TabsContent value="positions"><PositionsTab /></TabsContent>
        <TabsContent value="leave"><LeaveTab /></TabsContent>
        <TabsContent value="certifications"><CertificationsTab /></TabsContent>
        <TabsContent value="training"><TrainingTab /></TabsContent>
        <TabsContent value="appraisals"><AppraisalsTab /></TabsContent>
        <TabsContent value="recruitment"><RecruitmentTab /></TabsContent>
        <TabsContent value="onboarding"><OnboardingTab /></TabsContent>
        <TabsContent value="payroll"><PayrollTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function StaffDirectoryTab() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', department: '', position: '',
    employeeId: '', joinDate: '', qualification: '', userId: '',
    email: '', phone: '',
  });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getStaffDirectory(); setStaff(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load staff directory'); }
    finally { setLoading(false); }
  };

  const filteredStaff = staff.filter(s =>
    ((s.firstName || '') + ' ' + (s.lastName || '')).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) {
        await api.updateStaff(editingId, formData);
      } else {
        await api.createStaff(formData);
      }
      setShowCreate(false);
      setEditingId(null);
      setFormData({ firstName: '', lastName: '', department: '', position: '', employeeId: '', joinDate: '', qualification: '', userId: '', email: '', phone: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search staff..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ firstName: '', lastName: '', department: '', position: '', employeeId: '', joinDate: '', qualification: '', userId: '', email: '', phone: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Staff
        </Button>
      </div>
      <div className="space-y-3">
        {filteredStaff.map(s => (
          <Card key={s.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{s.firstName} {s.lastName}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{s.position}</span>
                    <span>•</span>
                    <span>{s.department}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</span>
                    {s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>ID: {s.employeeId}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined: {s.joinDate ? new Date(s.joinDate).toLocaleDateString() : 'N/A'}</span>
                    {s.qualification && <span>• {s.qualification}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(s.id); setFormData({ firstName: s.firstName, lastName: s.lastName, department: s.department, position: s.position, employeeId: s.employeeId, joinDate: s.joinDate, qualification: s.qualification || '', userId: s.userId, email: s.email, phone: s.phone || '' }); setShowCreate(true); }}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filteredStaff.length === 0 && <p className="text-center text-muted-foreground py-8">No staff found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Staff' : 'Add Staff'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <Input value={formData.firstName} onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input value={formData.lastName} onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Department</label>
              <select value={formData.department} onChange={e => setFormData(f => ({ ...f, department: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select department</option>
                <option value="academics">Academics</option>
                <option value="administration">Administration</option>
                <option value="finance">Finance</option>
                <option value="transport">Transport</option>
                <option value="library">Library</option>
                <option value="maintenance">Maintenance</option>
                <option value="sports">Sports</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Position</label>
              <Input value={formData.position} onChange={e => setFormData(f => ({ ...f, position: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Employee ID</label>
              <Input value={formData.employeeId} onChange={e => setFormData(f => ({ ...f, employeeId: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Join Date</label>
              <Input type="date" value={formData.joinDate} onChange={e => setFormData(f => ({ ...f, joinDate: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Qualification</label>
              <Input value={formData.qualification} onChange={e => setFormData(f => ({ ...f, qualification: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">User ID</label>
              <Input value={formData.userId} onChange={e => setFormData(f => ({ ...f, userId: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Staff</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PositionsTab() {
  const [positions, setPositions] = useState<StaffPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: '', department: '', minSalary: 0, maxSalary: 0, requirements: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getStaffPositions(); setPositions(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load positions'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createStaffPosition(formData);
      setShowCreate(false);
      setFormData({ title: '', department: '', minSalary: 0, maxSalary: 0, requirements: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Add Position</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {positions.map(p => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-orange-500" />
              <h4 className="font-semibold">{p.title}</h4>
              <Badge variant="outline">{p.department}</Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />Salary Range: ${p.minSalary.toLocaleString()} - ${p.maxSalary.toLocaleString()}</span>
            </div>
            {p.requirements && <p className="text-xs text-muted-foreground">{p.requirements}</p>}
          </Card>
        ))}
        {positions.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No positions found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Position">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <select value={formData.department} onChange={e => setFormData(f => ({ ...f, department: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select department</option>
                <option value="academics">Academics</option>
                <option value="administration">Administration</option>
                <option value="finance">Finance</option>
                <option value="transport">Transport</option>
                <option value="library">Library</option>
                <option value="maintenance">Maintenance</option>
                <option value="sports">Sports</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Min Salary</label>
              <Input type="number" value={formData.minSalary || ''} onChange={e => setFormData(f => ({ ...f, minSalary: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Max Salary</label>
              <Input type="number" value={formData.maxSalary || ''} onChange={e => setFormData(f => ({ ...f, maxSalary: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Requirements</label>
            <Textarea value={formData.requirements} onChange={e => setFormData(f => ({ ...f, requirements: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Position</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function LeaveTab() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffFilter, setStaffFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ staffId: '', staffName: '', type: 'annual', startDate: '', endDate: '', reason: '' });
  const [error, setError] = useState('');
  const userId = localStorage.getItem('eduvault-user-id') || '';

  useEffect(() => { load(); }, [staffFilter]);

  const load = async () => {
    try {
      setLoading(true);
      const [d, staff] = await Promise.all([
        api.getStaffLeave(staffFilter || undefined),
        api.getStaffDirectory(),
      ]);
      setLeaves(Array.isArray(d) ? d : []);
      setStaffList(Array.isArray(staff) ? staff : []);
    } catch { setError('Failed to load leave records'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createStaffLeave(formData);
      setShowCreate(false);
      setFormData({ staffId: '', staffName: '', type: 'annual', startDate: '', endDate: '', reason: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleApprove = async (id: string, action: 'approve' | 'reject') => {
    try {
      setError('');
      await api.approveStaffLeave(id, userId);
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <div className="flex-1">
          <select value={staffFilter} onChange={e => setStaffFilter(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Staff</option>
            {staffList.map(s => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
            ))}
          </select>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Request Leave</Button>
      </div>
      <div className="space-y-3">
        {leaves.map(l => {
          const days = l.startDate && l.endDate ? Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
          return (
            <Card key={l.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <h4 className="font-semibold">{l.staffName}</h4>
                    <Badge variant="outline">{l.type}</Badge>
                    <Badge variant={l.status === 'approved' ? 'success' : l.status === 'pending' ? 'warning' : 'destructive'}>{l.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{days} day(s)</span>
                    {l.reason && <span>• {l.reason}</span>}
                  </div>
                </div>
                {l.status === 'pending' && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleApprove(l.id, 'approve')}>
                      <CheckCircle className="w-3 h-3 mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleApprove(l.id, 'reject')}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        {leaves.length === 0 && <p className="text-center text-muted-foreground py-8">No leave records found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Request Leave">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Staff</label>
              <select value={formData.staffId} onChange={e => {
                const s = staffList.find(st => st.id === e.target.value);
                setFormData(f => ({ ...f, staffId: e.target.value, staffName: s ? `${s.firstName} ${s.lastName}` : '' }));
              }} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select staff</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="annual">Annual</option>
                <option value="sick">Sick</option>
                <option value="personal">Personal</option>
                <option value="maternity">Maternity</option>
                <option value="paternity">Paternity</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={formData.startDate} onChange={e => setFormData(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" value={formData.endDate} onChange={e => setFormData(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Reason</label>
            <Textarea value={formData.reason} onChange={e => setFormData(f => ({ ...f, reason: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Submit Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CertificationsTab() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', issuer: '', expiryDate: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadStaff(); }, []);

  useEffect(() => { if (selectedStaff) loadCerts(); }, [selectedStaff]);

  const loadStaff = async () => {
    try { const d = await api.getStaffDirectory(); setStaffList(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load staff'); }
    finally { setLoading(false); }
  };

  const loadCerts = async () => {
    try { setLoading(true); const d = await api.getCertifications(selectedStaff); setCertifications(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load certifications'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createCertification(selectedStaff, formData);
      setShowCreate(false);
      setFormData({ name: '', issuer: '', expiryDate: '' });
      loadCerts();
    } catch (e: any) { setError(e.message); }
  };

  if (loading && !selectedStaff) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <div className="flex-1">
          <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Select staff member</option>
            {staffList.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
          </select>
        </div>
        {selectedStaff && (
          <Button onClick={() => { setFormData({ name: '', issuer: '', expiryDate: '' }); setShowCreate(true); }}>
            <Plus className="w-4 h-4 mr-2" />Add Certification
          </Button>
        )}
      </div>

      {!selectedStaff ? (
        <p className="text-center text-muted-foreground py-8">Select a staff member to view certifications</p>
      ) : loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {certifications.map(c => (
            <Card key={c.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-500" />
                    <h4 className="font-semibold">{c.name}</h4>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>Issuer: {c.issuer}</span>
                    <span> • Expiry: {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Never'}</span>
                  </div>
                </div>
                <Badge variant={c.expiryDate && new Date(c.expiryDate) < new Date() ? 'destructive' : 'success'}>
                  {c.expiryDate && new Date(c.expiryDate) < new Date() ? 'Expired' : 'Valid'}
                </Badge>
              </div>
            </Card>
          ))}
          {certifications.length === 0 && <p className="text-center text-muted-foreground py-8">No certifications found</p>}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Certification">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Certification Name</label>
            <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Issuer</label>
              <Input value={formData.issuer} onChange={e => setFormData(f => ({ ...f, issuer: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Expiry Date</label>
              <Input type="date" value={formData.expiryDate} onChange={e => setFormData(f => ({ ...f, expiryDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Certification</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TrainingTab() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', attendees: 0 });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getTrainingSessions(); setSessions(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load training sessions'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createTrainingSession(formData);
      setShowCreate(false);
      setFormData({ title: '', date: '', attendees: 0 });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Add Training</Button>
      </div>
      <div className="space-y-3">
        {sessions.map(ts => (
          <Card key={ts.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">{ts.title}</h4>
                  <Badge variant={ts.status === 'completed' ? 'success' : ts.status === 'ongoing' ? 'info' : 'warning'}>{ts.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ts.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ts.attendees} attendees</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {sessions.length === 0 && <p className="text-center text-muted-foreground py-8">No training sessions found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Training Session">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Attendees</label>
              <Input type="number" value={formData.attendees || ''} onChange={e => setFormData(f => ({ ...f, attendees: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Training</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AppraisalsTab() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, comments: '', date: new Date().toISOString().split('T')[0] });
  const [error, setError] = useState('');

  useEffect(() => { loadStaff(); }, []);

  useEffect(() => { if (selectedStaff) loadAppraisals(); }, [selectedStaff]);

  const loadStaff = async () => {
    try { const d = await api.getStaffDirectory(); setStaffList(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load staff'); }
    finally { setLoading(false); }
  };

  const loadAppraisals = async () => {
    try { setLoading(true); const d = await api.getAppraisals(selectedStaff); setAppraisals(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load appraisals'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createAppraisal(selectedStaff, { ...formData, staffId: selectedStaff });
      setShowCreate(false);
      setFormData({ rating: 5, comments: '', date: new Date().toISOString().split('T')[0] });
      loadAppraisals();
    } catch (e: any) { setError(e.message); }
  };

  if (loading && !selectedStaff) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <div className="flex-1">
          <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Select staff member</option>
            {staffList.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
          </select>
        </div>
        {selectedStaff && (
          <Button onClick={() => { setFormData({ rating: 5, comments: '', date: new Date().toISOString().split('T')[0] }); setShowCreate(true); }}>
            <Plus className="w-4 h-4 mr-2" />Add Appraisal
          </Button>
        )}
      </div>

      {!selectedStaff ? (
        <p className="text-center text-muted-foreground py-8">Select a staff member to view appraisals</p>
      ) : loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {appraisals.map(a => (
            <Card key={a.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold">{a.staffName}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-3 h-3 ${i <= a.rating ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  {a.comments && <p className="text-sm text-muted-foreground">{a.comments}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(a.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{a.rating}/5</p>
                </div>
              </div>
            </Card>
          ))}
          {appraisals.length === 0 && <p className="text-center text-muted-foreground py-8">No appraisals found</p>}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Appraisal">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Rating (1-5)</label>
            <Input type="number" min={1} max={5} value={formData.rating || ''} onChange={e => setFormData(f => ({ ...f, rating: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Comments</label>
            <Textarea value={formData.comments} onChange={e => setFormData(f => ({ ...f, comments: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <Input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Appraisal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function RecruitmentTab() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ position: '', department: '', description: '', applicants: 0 });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getRecruitments(); setRecruitments(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load recruitments'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) {
        await api.updateRecruitment(editingId, formData);
      } else {
        await api.createRecruitment(formData);
      }
      setShowCreate(false);
      setEditingId(null);
      setFormData({ position: '', department: '', description: '', applicants: 0 });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => { setEditingId(null); setFormData({ position: '', department: '', description: '', applicants: 0 }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Opening
        </Button>
      </div>
      <div className="space-y-3">
        {recruitments.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">{r.position}</h4>
                  <Badge variant="outline">{r.department}</Badge>
                  <Badge variant={r.status === 'open' ? 'success' : r.status === 'closed' ? 'secondary' : 'warning'}>{r.status}</Badge>
                </div>
                {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Users className="w-3 h-3" />
                  <span>{r.applicants} applicant(s)</span>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setEditingId(r.id); setFormData({ position: r.position, department: r.department, description: r.description || '', applicants: r.applicants }); setShowCreate(true); }}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {recruitments.length === 0 && <p className="text-center text-muted-foreground py-8">No job openings found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Opening' : 'Add Opening'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Position</label>
              <Input value={formData.position} onChange={e => setFormData(f => ({ ...f, position: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <select value={formData.department} onChange={e => setFormData(f => ({ ...f, department: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select department</option>
                <option value="academics">Academics</option>
                <option value="administration">Administration</option>
                <option value="finance">Finance</option>
                <option value="transport">Transport</option>
                <option value="library">Library</option>
                <option value="maintenance">Maintenance</option>
                <option value="sports">Sports</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Applicants</label>
            <Input type="number" value={formData.applicants || ''} onChange={e => setFormData(f => ({ ...f, applicants: Number(e.target.value) }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Opening</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function OnboardingTab() {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ staffName: '', task: '', dueDate: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getOnboardingTasks(); setTasks(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load onboarding tasks'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createOnboardingTask(formData);
      setShowCreate(false);
      setFormData({ staffName: '', task: '', dueDate: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Add Task</Button>
      </div>
      <div className="space-y-3">
        {tasks.map(t => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">{t.task}</h4>
                  <Badge variant={t.status === 'completed' ? 'success' : t.status === 'in-progress' ? 'info' : 'warning'}>{t.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <User className="w-3 h-3" />
                  <span>{t.staffName}</span>
                  {t.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {tasks.length === 0 && <p className="text-center text-muted-foreground py-8">No onboarding tasks found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Onboarding Task">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Staff Name</label>
            <Input value={formData.staffName} onChange={e => setFormData(f => ({ ...f, staffName: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Task</label>
            <Input value={formData.task} onChange={e => setFormData(f => ({ ...f, task: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Due Date</label>
            <Input type="date" value={formData.dueDate} onChange={e => setFormData(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Task</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PayrollTab() {
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ staffName: '', salary: 0, deductions: 0 });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [selectedMonth]);

  const load = async () => {
    try { setLoading(true); const d = await api.getPayroll(selectedMonth); setEntries(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load payroll'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createPayrollEntry({
        ...formData,
        netPay: formData.salary - formData.deductions,
        month: selectedMonth,
      });
      setShowCreate(false);
      setFormData({ staffName: '', salary: 0, deductions: 0 });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleProcess = async () => {
    try { setError(''); await api.processPayroll(selectedMonth); load(); }
    catch (e: any) { setError(e.message); }
  };

  const totalPayroll = entries.reduce((s, e) => s + (Number(e.netPay) || 0), 0);
  const paidCount = entries.filter(e => e.status === 'paid').length;

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">${totalPayroll.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Payroll</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-sm text-muted-foreground">Staff</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{paidCount}/{entries.length}</p>
              <p className="text-sm text-muted-foreground">Paid</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <Input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-48" />
        <div className="flex-1" />
        <Button variant="outline" onClick={handleProcess}>
          <BarChart3 className="w-4 h-4 mr-2" />Process Month
        </Button>
        <Button onClick={() => { setFormData({ staffName: '', salary: 0, deductions: 0 }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Entry
        </Button>
      </div>

      <div className="space-y-3">
        {entries.map(e => (
          <Card key={e.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{e.staffName}</h4>
                <div className="text-sm text-muted-foreground">
                  <span>Salary: ${e.salary.toLocaleString()}</span>
                  <span> • Deductions: ${e.deductions.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="text-lg font-bold text-green-600">${e.netPay.toLocaleString()}</p>
                <Badge variant={e.status === 'paid' ? 'success' : e.status === 'processing' ? 'info' : 'warning'}>{e.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
        {entries.length === 0 && <p className="text-center text-muted-foreground py-8">No payroll entries for {selectedMonth}</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Payroll Entry">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Staff Name</label>
            <Input value={formData.staffName} onChange={e => setFormData(f => ({ ...f, staffName: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Salary</label>
              <Input type="number" value={formData.salary || ''} onChange={e => setFormData(f => ({ ...f, salary: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Deductions</label>
              <Input type="number" value={formData.deductions || ''} onChange={e => setFormData(f => ({ ...f, deductions: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="p-3 bg-accent rounded text-sm flex justify-between">
            <span>Net Pay</span>
            <strong>${(formData.salary - formData.deductions).toLocaleString()}</strong>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Entry</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
