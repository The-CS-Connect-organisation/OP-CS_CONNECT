import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
  HeartPulse,
  MessageSquare,
  ClipboardList,
  Shield,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
} from 'lucide-react';

interface CounsellingSession {
  id: string;
  studentName: string;
  counsellor: string;
  date: string;
  type: string;
  notes: string;
  status: string;
}

interface Referral {
  id: string;
  studentName: string;
  referredBy: string;
  reason: string;
  priority: string;
  status: string;
  date: string;
}

interface CarePlan {
  id: string;
  studentName: string;
  goals: string;
  interventions: string;
  reviewDate: string;
  status: string;
}

interface Grievance {
  id: string;
  studentName: string;
  subject: string;
  description: string;
  status: string;
  date: string;
}

export default function AdminCounselling() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions');
  const [search, setSearch] = useState('');

  const [sessions, setSessions] = useState<CounsellingSession[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);

  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({ studentName: '', counsellor: '', date: '', type: '', notes: '', status: 'scheduled' });

  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralForm, setReferralForm] = useState({ studentName: '', referredBy: '', reason: '', priority: 'medium' });

  const [showCarePlanForm, setShowCarePlanForm] = useState(false);
  const [editCarePlan, setEditCarePlan] = useState<CarePlan | null>(null);
  const [carePlanForm, setCarePlanForm] = useState({ studentName: '', goals: '', interventions: '', reviewDate: '', status: 'active' });

  const [showGrievanceForm, setShowGrievanceForm] = useState(false);
  const [grievanceForm, setGrievanceForm] = useState({ studentName: '', subject: '', description: '' });

  const [editingSession, setEditingSession] = useState<CounsellingSession | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [sess, refs, plans, griev] = await Promise.all([
        api.getCounsellingSessions(),
        api.getReferrals(),
        api.getCarePlans(),
        api.getGrievances(),
      ]);
      setSessions(Array.isArray(sess) ? sess : []);
      setReferrals(Array.isArray(refs) ? refs : []);
      setCarePlans(Array.isArray(plans) ? plans : []);
      setGrievances(Array.isArray(griev) ? griev : []);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const created = await api.createCounsellingSession(sessionForm);
      setSessions(prev => [...prev, created]);
      setShowSessionForm(false);
      setSessionForm({ studentName: '', counsellor: '', date: '', type: '', notes: '', status: 'scheduled' });
    } catch {
      //
    }
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;
    try {
      const updated = await api.updateCounsellingSession(editingSession.id, sessionForm);
      setSessions(prev => prev.map(s => s.id === editingSession.id ? updated : s));
      setEditingSession(null);
      setShowSessionForm(false);
      setSessionForm({ studentName: '', counsellor: '', date: '', type: '', notes: '', status: 'scheduled' });
    } catch {
      //
    }
  };

  const openEditSession = (session: CounsellingSession) => {
    setEditingSession(session);
    setSessionForm({
      studentName: session.studentName,
      counsellor: session.counsellor,
      date: session.date,
      type: session.type,
      notes: session.notes,
      status: session.status,
    });
    setShowSessionForm(true);
  };

  const handleCreateReferral = async () => {
    try {
      const created = await api.createReferral(referralForm);
      setReferrals(prev => [...prev, created]);
      setShowReferralForm(false);
      setReferralForm({ studentName: '', referredBy: '', reason: '', priority: 'medium' });
    } catch {
      //
    }
  };

  const handleReferralAction = async (id: string, action: string) => {
    try {
      const updated = await api.updateReferralStatus(id, action);
      setReferrals(prev => prev.map(r => r.id === id ? updated : r));
    } catch {
      //
    }
  };

  const openEditCarePlan = (plan: CarePlan) => {
    setEditCarePlan(plan);
    setCarePlanForm({
      studentName: plan.studentName,
      goals: plan.goals,
      interventions: plan.interventions,
      reviewDate: plan.reviewDate,
      status: plan.status,
    });
    setShowCarePlanForm(true);
  };

  const handleSaveCarePlan = async () => {
    try {
      if (editCarePlan) {
        const updated = await api.updateCarePlan(editCarePlan.id, carePlanForm);
        setCarePlans(prev => prev.map(p => p.id === editCarePlan.id ? updated : p));
      } else {
        const created = await api.createCarePlan(carePlanForm);
        setCarePlans(prev => [...prev, created]);
      }
      setShowCarePlanForm(false);
      setEditCarePlan(null);
      setCarePlanForm({ studentName: '', goals: '', interventions: '', reviewDate: '', status: 'active' });
    } catch {
      //
    }
  };

  const handleCreateGrievance = async () => {
    try {
      const created = await api.createGrievance(grievanceForm);
      setGrievances(prev => [...prev, created]);
      setShowGrievanceForm(false);
      setGrievanceForm({ studentName: '', subject: '', description: '' });
    } catch {
      //
    }
  };

  const handleGrievanceAction = async (id: string, action: string) => {
    try {
      const updated = await api.updateGrievanceStatus(id, action);
      setGrievances(prev => prev.map(g => g.id === id ? updated : g));
    } catch {
      //
    }
  };

  const filteredSessions = sessions.filter(s =>
    s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    s.counsellor?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredReferrals = referrals.filter(r =>
    r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    r.referredBy?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCarePlans = carePlans.filter(p =>
    p.studentName?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGrievances = grievances.filter(g =>
    g.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    g.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      scheduled: 'info', completed: 'success', cancelled: 'destructive',
      active: 'success', inactive: 'secondary', resolved: 'success',
      open: 'warning', pending: 'warning', closed: 'secondary',
      low: 'info', medium: 'warning', high: 'destructive',
    };
    return <Badge variant={(map[status] || 'default') as any}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Counselling</h1>
        <p className="text-muted-foreground">Sessions, referrals, care plans & grievances</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="careplans">Care Plans</TabsTrigger>
          <TabsTrigger value="grievances">Grievances</TabsTrigger>
        </TabsList>

        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <TabsContent value="sessions">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{sessions.length} session(s)</p>
            <Button onClick={() => { setEditingSession(null); setSessionForm({ studentName: '', counsellor: '', date: '', type: '', notes: '', status: 'scheduled' }); setShowSessionForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />New Session
            </Button>
          </div>

          {showSessionForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">{editingSession ? 'Edit Session' : 'New Counselling Session'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Student Name" value={sessionForm.studentName} onChange={(e) => setSessionForm({ ...sessionForm, studentName: e.target.value })} />
                <Input placeholder="Counsellor" value={sessionForm.counsellor} onChange={(e) => setSessionForm({ ...sessionForm, counsellor: e.target.value })} />
                <Input type="date" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} />
                <Input placeholder="Type (e.g. individual, group)" value={sessionForm.type} onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value })} />
                <div className="md:col-span-2">
                  <Textarea placeholder="Notes" value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} />
                </div>
                <select value={sessionForm.status} onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={editingSession ? handleUpdateSession : handleCreateSession}>{editingSession ? 'Update' : 'Create'}</Button>
                <Button variant="outline" onClick={() => { setShowSessionForm(false); setEditingSession(null); }}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map(s => (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <HeartPulse className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">{s.studentName}</h4>
                        <p className="text-sm text-muted-foreground">{s.counsellor} — {s.type}</p>
                        <p className="text-sm text-muted-foreground mt-1">{s.date}</p>
                        {s.notes && <p className="text-sm mt-1 text-muted-foreground line-clamp-2">{s.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(s.status)}
                      <button onClick={() => openEditSession(s)} className="p-1.5 hover:bg-orange-100 rounded text-orange-500"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredSessions.length === 0 && <p className="text-muted-foreground text-center py-8">No sessions found</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="referrals">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{referrals.length} referral(s)</p>
            <Button onClick={() => setShowReferralForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Referral
            </Button>
          </div>

          {showReferralForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Referral</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Student Name" value={referralForm.studentName} onChange={(e) => setReferralForm({ ...referralForm, studentName: e.target.value })} />
                <Input placeholder="Referred By" value={referralForm.referredBy} onChange={(e) => setReferralForm({ ...referralForm, referredBy: e.target.value })} />
                <div className="md:col-span-2">
                  <Textarea placeholder="Reason for referral" value={referralForm.reason} onChange={(e) => setReferralForm({ ...referralForm, reason: e.target.value })} />
                </div>
                <select value={referralForm.priority} onChange={(e) => setReferralForm({ ...referralForm, priority: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateReferral}>Create</Button>
                <Button variant="outline" onClick={() => setShowReferralForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : (
            <div className="space-y-3">
              {filteredReferrals.map(r => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">{r.studentName}</h4>
                        <p className="text-sm text-muted-foreground">Referred by: {r.referredBy}</p>
                        <p className="text-sm mt-1">{r.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">{r.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(r.priority)}
                      {statusBadge(r.status)}
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => handleReferralAction(r.id, 'approve')} className="p-1.5 hover:bg-green-100 rounded text-green-500"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleReferralAction(r.id, 'reject')} className="p-1.5 hover:bg-red-100 rounded text-red-500"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {filteredReferrals.length === 0 && <p className="text-muted-foreground text-center py-8">No referrals found</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="careplans">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{carePlans.length} plan(s)</p>
            <Button onClick={() => { setEditCarePlan(null); setCarePlanForm({ studentName: '', goals: '', interventions: '', reviewDate: '', status: 'active' }); setShowCarePlanForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />New Care Plan
            </Button>
          </div>

          {showCarePlanForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">{editCarePlan ? 'Edit Care Plan' : 'New Care Plan'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Student Name" value={carePlanForm.studentName} onChange={(e) => setCarePlanForm({ ...carePlanForm, studentName: e.target.value })} />
                <Input type="date" value={carePlanForm.reviewDate} onChange={(e) => setCarePlanForm({ ...carePlanForm, reviewDate: e.target.value })} />
                <Textarea placeholder="Goals" value={carePlanForm.goals} onChange={(e) => setCarePlanForm({ ...carePlanForm, goals: e.target.value })} />
                <Textarea placeholder="Interventions" value={carePlanForm.interventions} onChange={(e) => setCarePlanForm({ ...carePlanForm, interventions: e.target.value })} />
                <select value={carePlanForm.status} onChange={(e) => setCarePlanForm({ ...carePlanForm, status: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveCarePlan}>{editCarePlan ? 'Update' : 'Create'}</Button>
                <Button variant="outline" onClick={() => { setShowCarePlanForm(false); setEditCarePlan(null); }}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : (
            <div className="space-y-3">
              {filteredCarePlans.map(p => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <ClipboardList className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">{p.studentName}</h4>
                        <p className="text-sm text-muted-foreground mt-1"><span className="font-medium">Goals:</span> {p.goals}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-medium">Interventions:</span> {p.interventions}</p>
                        <p className="text-xs text-muted-foreground mt-1">Review: {p.reviewDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(p.status)}
                      <button onClick={() => openEditCarePlan(p)} className="p-1.5 hover:bg-orange-100 rounded text-orange-500"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredCarePlans.length === 0 && <p className="text-muted-foreground text-center py-8">No care plans found</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="grievances">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{grievances.length} grievance(s)</p>
            <Button onClick={() => setShowGrievanceForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Grievance
            </Button>
          </div>

          {showGrievanceForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Grievance</h3>
              <div className="grid grid-cols-1 gap-4">
                <Input placeholder="Student Name" value={grievanceForm.studentName} onChange={(e) => setGrievanceForm({ ...grievanceForm, studentName: e.target.value })} />
                <Input placeholder="Subject" value={grievanceForm.subject} onChange={(e) => setGrievanceForm({ ...grievanceForm, subject: e.target.value })} />
                <Textarea placeholder="Description" value={grievanceForm.description} onChange={(e) => setGrievanceForm({ ...grievanceForm, description: e.target.value })} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateGrievance}>Create</Button>
                <Button variant="outline" onClick={() => setShowGrievanceForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : (
            <div className="space-y-3">
              {filteredGrievances.map(g => (
                <Card key={g.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">{g.studentName}</h4>
                        <p className="text-sm font-medium">{g.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1">{g.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{g.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(g.status)}
                      {g.status === 'open' && (
                        <>
                          <button onClick={() => handleGrievanceAction(g.id, 'resolve')} className="p-1.5 hover:bg-green-100 rounded text-green-500"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleGrievanceAction(g.id, 'close')} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {filteredGrievances.length === 0 && <p className="text-muted-foreground text-center py-8">No grievances found</p>}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
