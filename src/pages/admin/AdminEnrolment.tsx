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
  Target, Briefcase, Share2, ExternalLink, RefreshCw, Building2,
  Clock, DollarSign, Mail, Phone, Home, School, UserCheck, UserX
} from 'lucide-react';

interface EnrolmentApplication {
  id: string;
  studentName: string;
  studentId: string;
  grade: string;
  status: string;
  submittedDate: string;
  documents: string[];
  notes: string;
}

interface AdmissionOffer {
  id: string;
  studentName: string;
  studentId: string;
  program: string;
  tuitionFee: number;
  status: string;
  offerDate: string;
  responseDeadline: string;
}

interface WaitlistEntry {
  id: string;
  studentName: string;
  studentId: string;
  priority: number;
  status: string;
  addedDate: string;
  notes: string;
}

interface SchoolCapacity {
  id: string;
  grade: string;
  capacity: number;
  enrolled: number;
  available: number;
}

interface Withdrawal {
  id: string;
  studentName: string;
  studentId: string;
  reason: string;
  date: string;
  status: string;
  processedDate: string;
}

interface SchoolTour {
  id: string;
  studentName: string;
  studentId: string;
  date: string;
  time: string;
  status: string;
  notes: string;
}

interface Scholarship {
  id: string;
  name: string;
  amount: number;
  criteria: string;
  deadline: string;
  available: number;
  awarded: number;
}

export default function AdminEnrolment() {
  const [activeTab, setActiveTab] = useState('applications');
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Enrolment Management</h1>
        <p className="text-muted-foreground">Manage applications, offers, waitlist, capacity, and more</p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="applications"><FileText className="w-4 h-4 mr-1" />Applications</TabsTrigger>
          <TabsTrigger value="offers"><Award className="w-4 h-4 mr-1" />Offers</TabsTrigger>
          <TabsTrigger value="waitlist"><Clock className="w-4 h-4 mr-1" />Waitlist</TabsTrigger>
          <TabsTrigger value="capacity"><Building2 className="w-4 h-4 mr-1" />Capacity</TabsTrigger>
          <TabsTrigger value="withdrawals"><UserX className="w-4 h-4 mr-1" />Withdrawals</TabsTrigger>
          <TabsTrigger value="tours"><Bus className="w-4 h-4 mr-1" />Tours</TabsTrigger>
          <TabsTrigger value="scholarships"><DollarSign className="w-4 h-4 mr-1" />Scholarships</TabsTrigger>
        </TabsList>
        <TabsContent value="applications"><ApplicationsTab /></TabsContent>
        <TabsContent value="offers"><OffersTab /></TabsContent>
        <TabsContent value="waitlist"><WaitlistTab /></TabsContent>
        <TabsContent value="capacity"><CapacityTab /></TabsContent>
        <TabsContent value="withdrawals"><WithdrawalsTab /></TabsContent>
        <TabsContent value="tours"><ToursTab /></TabsContent>
        <TabsContent value="scholarships"><ScholarshipsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ApplicationsTab() {
  const [apps, setApps] = useState<EnrolmentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ studentName: '', studentId: '', grade: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getEnrolmentApplications(); setApps(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load applications'); }
    finally { setLoading(false); }
  };

  const filtered = apps.filter(a =>
    a.studentName.toLowerCase().includes(search.toLowerCase()) ||
    a.studentId.toLowerCase().includes(search.toLowerCase()) ||
    a.grade.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) await api.updateEnrolmentApplication(editingId, formData);
      else await api.createEnrolmentApplication(formData);
      setShowForm(false);
      setEditingId(null);
      setFormData({ studentName: '', studentId: '', grade: '', notes: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleProcess = async (id: string, action: string) => {
    try { setError(''); await api.processEnrolmentApplication(id, action); load(); }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search applications..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ studentName: '', studentId: '', grade: '', notes: '' }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Application
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map(a => (
          <Card key={a.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="font-semibold">{a.studentName}</h4>
                  <p className="text-sm text-muted-foreground">ID: {a.studentId} • Grade: {a.grade}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{a.submittedDate ? new Date(a.submittedDate).toLocaleDateString() : 'N/A'}</span>
                    {a.notes && <span>{a.notes}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={a.status === 'approved' ? 'success' : a.status === 'rejected' ? 'destructive' : a.status === 'reviewing' ? 'warning' : 'secondary'}>{a.status}</Badge>
                <div className="flex gap-1">
                  {a.status === 'pending' && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleProcess(a.id, 'approve')}><CheckCircle className="w-4 h-4 text-green-500" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleProcess(a.id, 'reject')}><XCircle className="w-4 h-4 text-red-500" /></Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => { setEditingId(a.id); setFormData({ studentName: a.studentName, studentId: a.studentId, grade: a.grade, notes: a.notes || '' }); setShowForm(true); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No applications found</p>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingId ? 'Edit Application' : 'Add Application'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Student Name</label>
              <Input value={formData.studentName} onChange={e => setFormData(f => ({ ...f, studentName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Student ID</label>
              <Input value={formData.studentId} onChange={e => setFormData(f => ({ ...f, studentId: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Grade</label>
            <Input value={formData.grade} onChange={e => setFormData(f => ({ ...f, grade: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function OffersTab() {
  const [offers, setOffers] = useState<AdmissionOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ studentName: '', studentId: '', program: '', tuitionFee: 0, responseDeadline: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getAdmissionOffers(); setOffers(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load offers'); }
    finally { setLoading(false); }
  };

  const filtered = offers.filter(o =>
    o.studentName.toLowerCase().includes(search.toLowerCase()) ||
    o.studentId.toLowerCase().includes(search.toLowerCase()) ||
    o.program.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      setError('');
      await api.createAdmissionOffer(formData);
      setShowForm(false);
      setFormData({ studentName: '', studentId: '', program: '', tuitionFee: 0, responseDeadline: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleRespond = async (id: string, action: string) => {
    try { setError(''); await api.respondToOffer(id, action); load(); }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search offers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setFormData({ studentName: '', studentId: '', program: '', tuitionFee: 0, responseDeadline: '' }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />Create Offer
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map(o => (
          <Card key={o.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="font-semibold">{o.studentName}</h4>
                  <p className="text-sm text-muted-foreground">ID: {o.studentId} • Program: {o.program}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Offered: {o.offerDate ? new Date(o.offerDate).toLocaleDateString() : 'N/A'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Deadline: {o.responseDeadline ? new Date(o.responseDeadline).toLocaleDateString() : 'N/A'}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{o.tuitionFee?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={o.status === 'accepted' ? 'success' : o.status === 'declined' ? 'destructive' : o.status === 'pending' ? 'warning' : 'secondary'}>{o.status}</Badge>
                {o.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleRespond(o.id, 'accept')}><CheckCircle className="w-3 h-3 mr-1" />Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => handleRespond(o.id, 'decline')}><XCircle className="w-3 h-3 mr-1" />Decline</Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No offers found</p>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Admission Offer">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Student Name</label>
              <Input value={formData.studentName} onChange={e => setFormData(f => ({ ...f, studentName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Student ID</label>
              <Input value={formData.studentId} onChange={e => setFormData(f => ({ ...f, studentId: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Program</label>
            <Input value={formData.program} onChange={e => setFormData(f => ({ ...f, program: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tuition Fee ($)</label>
              <Input type="number" value={formData.tuitionFee || ''} onChange={e => setFormData(f => ({ ...f, tuitionFee: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Response Deadline</label>
              <Input type="date" value={formData.responseDeadline} onChange={e => setFormData(f => ({ ...f, responseDeadline: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Offer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function WaitlistTab() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ studentName: '', studentId: '', priority: 0, notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getWaitlist(); setWaitlist(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load waitlist'); }
    finally { setLoading(false); }
  };

  const filtered = waitlist.filter(w =>
    w.studentName.toLowerCase().includes(search.toLowerCase()) ||
    w.studentId.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    try {
      setError('');
      await api.addWaitlist(formData);
      setShowForm(false);
      setFormData({ studentName: '', studentId: '', priority: 0, notes: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleUpdatePriority = async (id: string, priority: number) => {
    try { setError(''); await api.updateWaitlistPriority(id, { priority }); load(); }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search waitlist..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add to Waitlist</Button>
      </div>

      <div className="space-y-3">
        {filtered.sort((a, b) => a.priority - b.priority).map(w => (
          <Card key={w.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="font-semibold">{w.studentName}</h4>
                  <p className="text-sm text-muted-foreground">ID: {w.studentId}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Added: {w.addedDate ? new Date(w.addedDate).toLocaleDateString() : 'N/A'}</span>
                    {w.notes && <span>{w.notes}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleUpdatePriority(w.id, Math.max(0, w.priority - 1))}>-</Button>
                  <Badge variant="info">Priority: {w.priority}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => handleUpdatePriority(w.id, w.priority + 1)}>+</Button>
                </div>
                <Badge variant={w.status === 'pending' ? 'warning' : w.status === 'offered' ? 'success' : 'secondary'}>{w.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No waitlist entries found</p>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add to Waitlist">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Student Name</label>
              <Input value={formData.studentName} onChange={e => setFormData(f => ({ ...f, studentName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Student ID</label>
              <Input value={formData.studentId} onChange={e => setFormData(f => ({ ...f, studentId: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Priority (lower = higher)</label>
            <Input type="number" value={formData.priority || ''} onChange={e => setFormData(f => ({ ...f, priority: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CapacityTab() {
  const [capacities, setCapacities] = useState<SchoolCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ grade: '', capacity: 0 });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getSchoolCapacity(); setCapacities(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load capacity'); }
    finally { setLoading(false); }
  };

  const handleSet = async () => {
    try {
      setError('');
      await api.setSchoolCapacity(formData);
      setShowForm(false);
      setFormData({ grade: '', capacity: 0 });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Set Capacity</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
        {capacities.map(c => {
          const pct = c.capacity > 0 ? Math.round((c.enrolled / c.capacity) * 100) : 0;
          return (
            <Card key={c.id || c.grade} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-orange-500" />
                <h4 className="font-semibold">Grade {c.grade}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium">{c.capacity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Enrolled</span>
                  <span className="font-medium">{c.enrolled}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-medium">{c.available}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-accent overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <p className="text-xs text-muted-foreground text-right">{pct}% filled</p>
              </div>
            </Card>
          );
        })}
        {capacities.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-3">No capacity data found</p>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Set School Capacity">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Grade</label>
            <Input value={formData.grade} onChange={e => setFormData(f => ({ ...f, grade: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Capacity</label>
            <Input type="number" value={formData.capacity || ''} onChange={e => setFormData(f => ({ ...f, capacity: Number(e.target.value) }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSet}>Set</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function WithdrawalsTab() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ studentName: '', studentId: '', reason: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getWithdrawals(); setWithdrawals(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load withdrawals'); }
    finally { setLoading(false); }
  };

  const filtered = withdrawals.filter(w =>
    w.studentName.toLowerCase().includes(search.toLowerCase()) ||
    w.studentId.toLowerCase().includes(search.toLowerCase())
  );

  const handleProcess = async () => {
    try {
      setError('');
      await api.processWithdrawal(formData);
      setShowForm(false);
      setFormData({ studentName: '', studentId: '', reason: '' });
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
          <Input placeholder="Search withdrawals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => setShowForm(true)}><UserX className="w-4 h-4 mr-2" />Process Withdrawal</Button>
      </div>

      <div className="space-y-3">
        {filtered.map(w => (
          <Card key={w.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <UserX className="w-5 h-5 text-red-500" />
                <div>
                  <h4 className="font-semibold">{w.studentName}</h4>
                  <p className="text-sm text-muted-foreground">ID: {w.studentId}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Date: {w.date ? new Date(w.date).toLocaleDateString() : 'N/A'}</span>
                    {w.reason && <span>Reason: {w.reason}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={w.status === 'processed' ? 'success' : 'warning'}>{w.status}</Badge>
                {w.processedDate && <span className="text-xs text-muted-foreground">{new Date(w.processedDate).toLocaleDateString()}</span>}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No withdrawals found</p>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Process Withdrawal">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Student Name</label>
              <Input value={formData.studentName} onChange={e => setFormData(f => ({ ...f, studentName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Student ID</label>
              <Input value={formData.studentId} onChange={e => setFormData(f => ({ ...f, studentId: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Reason</label>
            <Textarea value={formData.reason} onChange={e => setFormData(f => ({ ...f, reason: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleProcess}>Process</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ToursTab() {
  const [tours, setTours] = useState<SchoolTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ studentName: '', studentId: '', date: '', time: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getSchoolTours(); setTours(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load tours'); }
    finally { setLoading(false); }
  };

  const filtered = tours.filter(t =>
    t.studentName.toLowerCase().includes(search.toLowerCase()) ||
    t.studentId.toLowerCase().includes(search.toLowerCase())
  );

  const handleBook = async () => {
    try {
      setError('');
      await api.bookSchoolTour(formData);
      setShowForm(false);
      setFormData({ studentName: '', studentId: '', date: '', time: '', notes: '' });
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
          <Input placeholder="Search tours..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Book Tour</Button>
      </div>

      <div className="space-y-3">
        {filtered.map(t => (
          <Card key={t.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Bus className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="font-semibold">{t.studentName}</h4>
                  <p className="text-sm text-muted-foreground">ID: {t.studentId}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.time}</span>
                    {t.notes && <span>{t.notes}</span>}
                  </div>
                </div>
              </div>
              <Badge variant={t.status === 'confirmed' ? 'success' : t.status === 'completed' ? 'info' : 'warning'}>{t.status}</Badge>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No tours found</p>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Book School Tour">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Student Name</label>
              <Input value={formData.studentName} onChange={e => setFormData(f => ({ ...f, studentName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Student ID</label>
              <Input value={formData.studentId} onChange={e => setFormData(f => ({ ...f, studentId: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Time</label>
              <Input type="time" value={formData.time} onChange={e => setFormData(f => ({ ...f, time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleBook}>Book Tour</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ScholarshipsTab() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: 0, criteria: '', deadline: '', available: 0 });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getScholarships(); setScholarships(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load scholarships'); }
    finally { setLoading(false); }
  };

  const filtered = scholarships.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      setError('');
      await api.createScholarship(formData);
      setShowForm(false);
      setFormData({ name: '', amount: 0, criteria: '', deadline: '', available: 0 });
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
          <Input placeholder="Search scholarships..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Create Scholarship</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(s => (
          <Card key={s.id} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-orange-500" />
              <h4 className="font-semibold">{s.name}</h4>
            </div>
            <div className="text-2xl font-bold text-orange-500 mb-2">${s.amount?.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{s.criteria}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Deadline: {s.deadline ? new Date(s.deadline).toLocaleDateString() : 'N/A'}</span>
              <span>{s.awarded}/{s.available} awarded</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-accent mt-2 overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${s.available > 0 ? Math.round((s.awarded / s.available) * 100) : 0}%` }} />
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No scholarships found</p>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Scholarship">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Amount ($)</label>
              <Input type="number" value={formData.amount || ''} onChange={e => setFormData(f => ({ ...f, amount: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Available Slots</label>
              <Input type="number" value={formData.available || ''} onChange={e => setFormData(f => ({ ...f, available: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Criteria</label>
            <Textarea value={formData.criteria} onChange={e => setFormData(f => ({ ...f, criteria: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Deadline</label>
            <Input type="date" value={formData.deadline} onChange={e => setFormData(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

