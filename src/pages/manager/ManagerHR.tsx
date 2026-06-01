import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../../components/ui/Dialog';
import { Users, UserPlus, Search, Briefcase, Calendar, CheckCircle, XCircle, Award, BookOpen, Star, Target, DollarSign, Clock, Plus, Edit, FileText } from 'lucide-react';

interface StaffMember {
  id: string; firstName: string; lastName: string; department: string; position: string; employeeId: string; qualification: string; userId: string;
}
interface Position { id: string; title: string; department: string; salaryMin: number; salaryMax: number; }
interface StaffLeave { id: string; staffId: string; staffName?: string; type: string; startDate: string; endDate: string; reason: string; status: string; }
interface Certification { id: string; name: string; issuer: string; date: string; expiry: string; }
interface Training { id: string; title: string; description: string; date: string; duration: number; }
interface Appraisal { id: string; staffId: string; staffName?: string; reviewer: string; score: number; comments: string; date: string; }
interface Recruitment { id: string; position: string; department: string; description: string; requirements: string; status: string; }
interface PayrollEntry { id: string; staffId: string; staffName?: string; month: string; basicPay: number; deductions: number; netPay: number; status: string; }

export default function ManagerHR() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('staff');
  const [searchQuery, setSearchQuery] = useState('');

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [leave, setLeave] = useState<StaffLeave[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [training, setTraining] = useState<Training[]>([]);
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [payrollMonth, setPayrollMonth] = useState('');

  const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', department: '', position: '', employeeId: '', qualification: '', userId: '' });
  const [positionForm, setPositionForm] = useState({ title: '', department: '', salaryMin: 0, salaryMax: 0 });
  const [leaveForm, setLeaveForm] = useState({ staffId: '', type: '', startDate: '', endDate: '', reason: '' });
  const [certForm, setCertForm] = useState({ name: '', issuer: '', date: '', expiry: '' });
  const [trainingForm, setTrainingForm] = useState({ title: '', description: '', date: '', duration: 1 });
  const [appraisalForm, setAppraisalForm] = useState({ staffId: '', reviewer: '', score: 0, comments: '', date: '' });
  const [recruitForm, setRecruitForm] = useState({ position: '', department: '', description: '', requirements: '', status: 'open' });
  const [payrollForm, setPayrollForm] = useState({ staffId: '', month: '', basicPay: 0, deductions: 0, netPay: 0 });

  const [dialogOpen, setDialogOpen] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [staffData, positionsData, leaveData, trainingData, recruitData, payrollData] = await Promise.all([
        api.getStaffDirectory(), api.getStaffPositions(), api.getStaffLeave(), api.getTrainingSessions(), api.getRecruitments(), api.getPayroll(),
      ]);
      setStaff(Array.isArray(staffData) ? staffData : []);
      setPositions(Array.isArray(positionsData) ? positionsData : []);
      setLeave(Array.isArray(leaveData) ? leaveData : []);
      setTraining(Array.isArray(trainingData) ? trainingData : []);
      setRecruitments(Array.isArray(recruitData) ? recruitData : []);
      setPayroll(Array.isArray(payrollData) ? payrollData : []);
    } catch (err) { console.error('[ManagerHR] Failed to load data:', err); } finally { setLoading(false); }
  };

  const loadCertifications = async (staffId: string) => {
    try {
      const data = await api.getCertifications(staffId);
      setCertifications(Array.isArray(data) ? data : []);
    } catch { setCertifications([]); }
  };

  const loadAppraisals = async (staffId: string) => {
    try {
      const data = await api.getAppraisals(staffId);
      setAppraisals(Array.isArray(data) ? data : []);
    } catch { setAppraisals([]); }
  };

  const handleStaffSelected = (id: string) => {
    setSelectedStaffId(id);
    if (id) { loadCertifications(id); loadAppraisals(id); }
    else { setCertifications([]); setAppraisals([]); }
  };

  const createStaff = async () => {
    try { await api.createStaff(staffForm); await loadAll(); setDialogOpen(null); setStaffForm({ firstName: '', lastName: '', department: '', position: '', employeeId: '', qualification: '', userId: '' }); } catch (err) { console.error('[ManagerHR] Failed to create staff:', err); }
  };
  const createPosition = async () => {
    try { await api.createStaffPosition(positionForm); await loadAll(); setDialogOpen(null); setPositionForm({ title: '', department: '', salaryMin: 0, salaryMax: 0 }); } catch (err) { console.error('[ManagerHR] Failed to create position:', err); }
  };
  const createLeave = async () => {
    try { await api.createStaffLeave(leaveForm); const data = await api.getStaffLeave(); setLeave(Array.isArray(data) ? data : []); setDialogOpen(null); setLeaveForm({ staffId: '', type: '', startDate: '', endDate: '', reason: '' }); } catch (err) { console.error('[ManagerHR] Failed to create leave:', err); }
  };
  const approveLeave = async (id: string) => {
    try { await api.approveStaffLeave(id, user?.id || ''); const data = await api.getStaffLeave(); setLeave(Array.isArray(data) ? data : []); } catch (err) { console.error('[ManagerHR] Failed to approve leave:', err); }
  };
  const createCert = async () => {
    try { await api.createCertification(selectedStaffId, certForm); await loadCertifications(selectedStaffId); setDialogOpen(null); setCertForm({ name: '', issuer: '', date: '', expiry: '' }); } catch (err) { console.error('[ManagerHR] Failed to create cert:', err); }
  };
  const createTraining = async () => {
    try { await api.createTrainingSession(trainingForm); await loadAll(); setDialogOpen(null); setTrainingForm({ title: '', description: '', date: '', duration: 1 }); } catch (err) { console.error('[ManagerHR] Failed to create training:', err); }
  };
  const createAppraisal = async () => {
    try { await api.createAppraisal(appraisalForm.staffId, appraisalForm); await loadAppraisals(appraisalForm.staffId); setDialogOpen(null); setAppraisalForm({ staffId: '', reviewer: '', score: 0, comments: '', date: '' }); } catch (err) { console.error('[ManagerHR] Failed to create appraisal:', err); }
  };
  const createRecruitment = async () => {
    try { await api.createRecruitment(recruitForm); await loadAll(); setDialogOpen(null); setRecruitForm({ position: '', department: '', description: '', requirements: '', status: 'open' }); } catch (err) { console.error('[ManagerHR] Failed to create recruitment:', err); }
  };
  const updateRecruitmentStatus = async (id: string, status: string) => {
    try { await api.updateRecruitment(id, { status }); const data = await api.getRecruitments(); setRecruitments(Array.isArray(data) ? data : []); } catch (err) { console.error('[ManagerHR] Failed to update recruitment:', err); }
  };
  const createPayrollEntry = async () => {
    try { await api.createPayrollEntry(payrollForm); await loadAll(); setDialogOpen(null); setPayrollForm({ staffId: '', month: '', basicPay: 0, deductions: 0, netPay: 0 }); } catch (err) { console.error('[ManagerHR] Failed to create payroll:', err); }
  };
  const processPayroll = async () => {
    if (!payrollMonth) return;
    try { await api.processPayroll(payrollMonth); await loadAll(); setPayrollMonth(''); } catch (err) { console.error('[ManagerHR] Failed to process payroll:', err); }
  };

  const filteredStaff = staff.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || s.department?.toLowerCase().includes(searchQuery.toLowerCase()));

  const tabs = [
    { value: 'staff', label: 'Staff Directory', icon: Users },
    { value: 'positions', label: 'Positions', icon: Briefcase },
    { value: 'leave', label: 'Leave', icon: Calendar },
    { value: 'certifications', label: 'Certifications', icon: Award },
    { value: 'training', label: 'Training', icon: BookOpen },
    { value: 'appraisals', label: 'Appraisals', icon: Star },
    { value: 'recruitment', label: 'Recruitment', icon: Target },
    { value: 'payroll', label: 'Payroll', icon: DollarSign },
  ];

  if (loading) return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Human Resources</h1><p className="text-muted-foreground">Staff & HR management</p></div>
      <div className="space-y-4">{[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-20" />)}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Human Resources</h1><p className="text-muted-foreground">Staff & HR management</p></div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="overflow-x-auto flex-nowrap">
          {tabs.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 whitespace-nowrap">
              <t.icon className="w-4 h-4" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Staff Directory */}
        <TabsContent value="staff">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Dialog open={dialogOpen === 'staff'} onOpenChange={(o) => setDialogOpen(o ? 'staff' : null)}>
              <DialogTrigger asChild><Button><UserPlus className="w-4 h-4 mr-2" />Add Staff</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3 py-4">
                  <div><label className="text-sm font-medium">First Name</label><Input value={staffForm.firstName} onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Last Name</label><Input value={staffForm.lastName} onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Department</label><Input value={staffForm.department} onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Position</label><Input value={staffForm.position} onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Employee ID</label><Input value={staffForm.employeeId} onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Qualification</label><Input value={staffForm.qualification} onChange={(e) => setStaffForm({ ...staffForm, qualification: e.target.value })} /></div>
                  <div className="col-span-2"><label className="text-sm font-medium">User ID</label><Input value={staffForm.userId} onChange={(e) => setStaffForm({ ...staffForm, userId: e.target.value })} /></div>
                </div>
                <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createStaff}>Save</Button></div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {filteredStaff.map(s => (
              <Card key={s.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"><Users className="w-5 h-5 text-orange-500" /></div>
                    <div>
                      <h4 className="font-semibold">{s.firstName} {s.lastName}</h4>
                      <p className="text-sm text-muted-foreground">{s.position} &middot; {s.department}</p>
                      <p className="text-xs text-muted-foreground">ID: {s.employeeId} {s.qualification ? `| ${s.qualification}` : ''}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleStaffSelected(s.id)}><Edit className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
            {filteredStaff.length === 0 && <p className="text-muted-foreground text-center py-8">No staff found</p>}
          </div>
        </TabsContent>

        {/* Positions */}
        <TabsContent value="positions">
          <div className="flex justify-end mb-4">
            <Dialog open={dialogOpen === 'position'} onOpenChange={(o) => setDialogOpen(o ? 'position' : null)}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Position</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Position</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div><label className="text-sm font-medium">Title</label><Input value={positionForm.title} onChange={(e) => setPositionForm({ ...positionForm, title: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Department</label><Input value={positionForm.department} onChange={(e) => setPositionForm({ ...positionForm, department: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Salary Min</label><Input type="number" value={positionForm.salaryMin} onChange={(e) => setPositionForm({ ...positionForm, salaryMin: Number(e.target.value) })} /></div><div><label className="text-sm font-medium">Salary Max</label><Input type="number" value={positionForm.salaryMax} onChange={(e) => setPositionForm({ ...positionForm, salaryMax: Number(e.target.value) })} /></div></div>
                </div>
                <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createPosition}>Save</Button></div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {positions.map(p => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{p.title}</h4>
                    <p className="text-sm text-muted-foreground">{p.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${p.salaryMin?.toLocaleString()} - ${p.salaryMax?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Salary range</p>
                  </div>
                </div>
              </Card>
            ))}
            {positions.length === 0 && <p className="text-muted-foreground text-center py-8">No positions defined</p>}
          </div>
        </TabsContent>

        {/* Leave */}
        <TabsContent value="leave">
          <div className="flex justify-end mb-4">
            <Dialog open={dialogOpen === 'leave'} onOpenChange={(o) => setDialogOpen(o ? 'leave' : null)}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Request Leave</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Leave Request</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div><label className="text-sm font-medium">Staff ID</label><Input value={leaveForm.staffId} onChange={(e) => setLeaveForm({ ...leaveForm, staffId: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Type</label><select value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select type</option><option value="annual">Annual</option><option value="sick">Sick</option><option value="personal">Personal</option><option value="other">Other</option></select></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Start Date</label><Input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} /></div><div><label className="text-sm font-medium">End Date</label><Input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} /></div></div>
                  <div><label className="text-sm font-medium">Reason</label><Textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} /></div>
                </div>
                <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createLeave}>Submit</Button></div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {leave.map(l => (
              <Card key={l.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{l.staffName || l.staffId}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="capitalize">{l.type}</span><span>&middot;</span>
                      <span>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</span>
                    </div>
                    {l.reason && <p className="text-xs text-muted-foreground mt-1">{l.reason}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>{l.status}</Badge>
                    {l.status === 'pending' && (
                      <Button size="sm" variant="ghost" onClick={() => approveLeave(l.id)}><CheckCircle className="w-4 h-4 text-green-500" /></Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {leave.length === 0 && <p className="text-muted-foreground text-center py-8">No leave requests</p>}
          </div>
        </TabsContent>

        {/* Certifications */}
        <TabsContent value="certifications">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium mr-2">Select Staff:</label>
              <select value={selectedStaffId} onChange={(e) => handleStaffSelected(e.target.value)} className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Choose staff member...</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
            {selectedStaffId && (
              <Dialog open={dialogOpen === 'cert'} onOpenChange={(o) => setDialogOpen(o ? 'cert' : null)}>
                <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Certification</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Certification</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-4">
                    <div><label className="text-sm font-medium">Name</label><Input value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} /></div>
                    <div><label className="text-sm font-medium">Issuer</label><Input value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Date</label><Input type="date" value={certForm.date} onChange={(e) => setCertForm({ ...certForm, date: e.target.value })} /></div><div><label className="text-sm font-medium">Expiry</label><Input type="date" value={certForm.expiry} onChange={(e) => setCertForm({ ...certForm, expiry: e.target.value })} /></div></div>
                  </div>
                  <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createCert}>Save</Button></div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {!selectedStaffId ? (
            <p className="text-muted-foreground text-center py-8">Select a staff member to view certifications</p>
          ) : (
            <div className="space-y-3">
              {certifications.map(c => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{c.name}</h4>
                      <p className="text-sm text-muted-foreground">{c.issuer}</p>
                      <p className="text-xs text-muted-foreground">Issued: {c.date ? new Date(c.date).toLocaleDateString() : '-'} {c.expiry ? `| Expires: ${new Date(c.expiry).toLocaleDateString()}` : ''}</p>
                    </div>
                    <Award className="w-8 h-8 text-orange-400" />
                  </div>
                </Card>
              ))}
              {certifications.length === 0 && <p className="text-muted-foreground text-center py-8">No certifications</p>}
            </div>
          )}
        </TabsContent>

        {/* Training */}
        <TabsContent value="training">
          <div className="flex justify-end mb-4">
            <Dialog open={dialogOpen === 'training'} onOpenChange={(o) => setDialogOpen(o ? 'training' : null)}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Session</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Training Session</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div><label className="text-sm font-medium">Title</label><Input value={trainingForm.title} onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Description</label><Textarea value={trainingForm.description} onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Date</label><Input type="date" value={trainingForm.date} onChange={(e) => setTrainingForm({ ...trainingForm, date: e.target.value })} /></div><div><label className="text-sm font-medium">Duration (hrs)</label><Input type="number" value={trainingForm.duration} onChange={(e) => setTrainingForm({ ...trainingForm, duration: Number(e.target.value) })} /></div></div>
                </div>
                <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createTraining}>Save</Button></div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {training.map(t => (
              <Card key={t.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{t.title}</h4>
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date ? new Date(t.date).toLocaleDateString() : '-'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.duration}h</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {training.length === 0 && <p className="text-muted-foreground text-center py-8">No training sessions</p>}
          </div>
        </TabsContent>

        {/* Appraisals */}
        <TabsContent value="appraisals">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium mr-2">Select Staff:</label>
              <select value={selectedStaffId} onChange={(e) => handleStaffSelected(e.target.value)} className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Choose staff member...</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
            {selectedStaffId && (
              <Dialog open={dialogOpen === 'appraisal'} onOpenChange={(o) => setDialogOpen(o ? 'appraisal' : null)}>
                <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Appraisal</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>New Appraisal</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-4">
                    <div><label className="text-sm font-medium">Reviewer</label><Input value={appraisalForm.reviewer} onChange={(e) => setAppraisalForm({ ...appraisalForm, reviewer: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Score</label><Input type="number" value={appraisalForm.score} onChange={(e) => setAppraisalForm({ ...appraisalForm, score: Number(e.target.value) })} /></div><div><label className="text-sm font-medium">Date</label><Input type="date" value={appraisalForm.date} onChange={(e) => setAppraisalForm({ ...appraisalForm, date: e.target.value })} /></div></div>
                    <div><label className="text-sm font-medium">Comments</label><Textarea value={appraisalForm.comments} onChange={(e) => setAppraisalForm({ ...appraisalForm, comments: e.target.value })} /></div>
                  </div>
                  <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createAppraisal}>Save</Button></div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {!selectedStaffId ? (
            <p className="text-muted-foreground text-center py-8">Select a staff member to view appraisals</p>
          ) : (
            <div className="space-y-3">
              {appraisals.map(a => (
                <Card key={a.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Reviewer: {a.reviewer}</h4>
                      <p className="text-sm text-muted-foreground">{a.date ? new Date(a.date).toLocaleDateString() : '-'}</p>
                      {a.comments && <p className="text-xs text-muted-foreground mt-1">{a.comments}</p>}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(a.score / 20) ? 'text-orange-400 fill-orange-400' : 'text-muted-foreground'}`} />)}
                      </div>
                      <p className="text-sm font-medium mt-1">{a.score}/100</p>
                    </div>
                  </div>
                </Card>
              ))}
              {appraisals.length === 0 && <p className="text-muted-foreground text-center py-8">No appraisals</p>}
            </div>
          )}
        </TabsContent>

        {/* Recruitment */}
        <TabsContent value="recruitment">
          <div className="flex justify-end mb-4">
            <Dialog open={dialogOpen === 'recruit'} onOpenChange={(o) => setDialogOpen(o ? 'recruit' : null)}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Opening</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Recruitment</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Position</label><Input value={recruitForm.position} onChange={(e) => setRecruitForm({ ...recruitForm, position: e.target.value })} /></div><div><label className="text-sm font-medium">Department</label><Input value={recruitForm.department} onChange={(e) => setRecruitForm({ ...recruitForm, department: e.target.value })} /></div></div>
                  <div><label className="text-sm font-medium">Description</label><Textarea value={recruitForm.description} onChange={(e) => setRecruitForm({ ...recruitForm, description: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Requirements</label><Textarea value={recruitForm.requirements} onChange={(e) => setRecruitForm({ ...recruitForm, requirements: e.target.value })} /></div>
                </div>
                <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createRecruitment}>Save</Button></div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {recruitments.map(r => (
              <Card key={r.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{r.position}</h4>
                    <p className="text-sm text-muted-foreground">{r.department}</p>
                    {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                    {r.requirements && <p className="text-xs text-muted-foreground mt-1">Requirements: {r.requirements}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={r.status} onChange={(e) => updateRecruitmentStatus(r.id, e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                      <option value="open">Open</option><option value="in-progress">In Progress</option><option value="filled">Filled</option><option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </Card>
            ))}
            {recruitments.length === 0 && <p className="text-muted-foreground text-center py-8">No recruitments</p>}
          </div>
        </TabsContent>

        {/* Payroll */}
        <TabsContent value="payroll">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Input type="month" value={payrollMonth} onChange={(e) => setPayrollMonth(e.target.value)} className="w-48" />
              <Button variant="outline" onClick={processPayroll}><FileText className="w-4 h-4 mr-2" />Process Month</Button>
            </div>
            <Dialog open={dialogOpen === 'payroll'} onOpenChange={(o) => setDialogOpen(o ? 'payroll' : null)}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Entry</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Payroll Entry</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div><label className="text-sm font-medium">Staff ID</label><Input value={payrollForm.staffId} onChange={(e) => setPayrollForm({ ...payrollForm, staffId: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Month</label><Input type="month" value={payrollForm.month} onChange={(e) => setPayrollForm({ ...payrollForm, month: e.target.value })} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-sm font-medium">Basic Pay</label><Input type="number" value={payrollForm.basicPay} onChange={(e) => setPayrollForm({ ...payrollForm, basicPay: Number(e.target.value) })} /></div>
                    <div><label className="text-sm font-medium">Deductions</label><Input type="number" value={payrollForm.deductions} onChange={(e) => setPayrollForm({ ...payrollForm, deductions: Number(e.target.value) })} /></div>
                    <div><label className="text-sm font-medium">Net Pay</label><Input type="number" value={payrollForm.netPay} onChange={(e) => setPayrollForm({ ...payrollForm, netPay: Number(e.target.value) })} /></div>
                  </div>
                </div>
                <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createPayrollEntry}>Save</Button></div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">${payroll.filter(p => p.status === 'paid').reduce((s, p) => s + p.netPay, 0).toLocaleString()}</p><p className="text-sm text-muted-foreground">Paid</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">${payroll.filter(p => p.status === 'pending').reduce((s, p) => s + p.netPay, 0).toLocaleString()}</p><p className="text-sm text-muted-foreground">Pending</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{payroll.length}</p><p className="text-sm text-muted-foreground">Entries</p></div></div></Card>
          </div>
          <div className="space-y-3">
            {payroll.map(p => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{p.staffName || p.staffId}</h4>
                    <p className="text-sm text-muted-foreground">{p.month}</p>
                    <p className="text-xs text-muted-foreground">Basic: ${p.basicPay?.toLocaleString()} | Deductions: ${p.deductions?.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${p.netPay?.toLocaleString()}</p>
                    <Badge className={p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>{p.status}</Badge>
                  </div>
                </div>
              </Card>
            ))}
            {payroll.length === 0 && <p className="text-muted-foreground text-center py-8">No payroll entries</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
