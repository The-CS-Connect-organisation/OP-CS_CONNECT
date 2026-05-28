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
  Scale,
  Shield,
  AlertTriangle,
  UserCheck,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Clock,
  BookOpen,
} from 'lucide-react';

interface DisciplineIncident {
  id: string;
  studentName: string;
  date: string;
  type: string;
  description: string;
  severity: string;
  status: string;
  reportedBy: string;
  action: string;
}

interface BIP {
  id: string;
  studentName: string;
  targetBehaviours: string;
  strategies: string;
  goals: string;
  startDate: string;
  reviewDate: string;
  status: string;
}

interface Detention {
  id: string;
  studentName: string;
  date: string;
  time: string;
  duration: string;
  reason: string;
  assignedBy: string;
  status: string;
}

interface PositiveBehaviour {
  id: string;
  studentName: string;
  date: string;
  behaviour: string;
  description: string;
  recognisedBy: string;
  points: number;
}

export default function AdminDiscipline() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incidents');
  const [search, setSearch] = useState('');

  const [incidents, setIncidents] = useState<DisciplineIncident[]>([]);
  const [bips, setBips] = useState<BIP[]>([]);
  const [detentions, setDetentions] = useState<Detention[]>([]);
  const [positive, setPositive] = useState<PositiveBehaviour[]>([]);

  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [editIncident, setEditIncident] = useState<DisciplineIncident | null>(null);
  const [incidentForm, setIncidentForm] = useState({ studentName: '', date: '', type: '', description: '', severity: 'medium', reportedBy: '', action: '' });

  const [showBIPForm, setShowBIPForm] = useState(false);
  const [editBIP, setEditBIP] = useState<BIP | null>(null);
  const [bipForm, setBipForm] = useState({ studentName: '', targetBehaviours: '', strategies: '', goals: '', startDate: '', reviewDate: '', status: 'active' });

  const [showDetentionForm, setShowDetentionForm] = useState(false);
  const [detentionForm, setDetentionForm] = useState({ studentName: '', date: '', time: '', duration: '', reason: '', assignedBy: '' });

  const [showPositiveForm, setShowPositiveForm] = useState(false);
  const [positiveForm, setPositiveForm] = useState({ studentName: '', date: '', behaviour: '', description: '', recognisedBy: '', points: 0 });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [inc, bipData, det, pos] = await Promise.all([
        api.getDisciplineIncidents(),
        api.getBIPs(),
        api.getDetentions(),
        api.getPositiveBehaviour(),
      ]);
      setIncidents(Array.isArray(inc) ? inc : []);
      setBips(Array.isArray(bipData) ? bipData : []);
      setDetentions(Array.isArray(det) ? det : []);
      setPositive(Array.isArray(pos) ? pos : []);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIncident = async () => {
    try {
      if (editIncident) {
        const updated = await api.updateDisciplineIncident(editIncident.id, incidentForm);
        setIncidents(prev => prev.map(i => i.id === editIncident.id ? updated : i));
      } else {
        const created = await api.createDisciplineIncident(incidentForm);
        setIncidents(prev => [...prev, created]);
      }
      setShowIncidentForm(false);
      setEditIncident(null);
      setIncidentForm({ studentName: '', date: '', type: '', description: '', severity: 'medium', reportedBy: '', action: '' });
    } catch {
      //
    }
  };

  const openEditIncident = (inc: DisciplineIncident) => {
    setEditIncident(inc);
    setIncidentForm({
      studentName: inc.studentName,
      date: inc.date,
      type: inc.type,
      description: inc.description,
      severity: inc.severity,
      reportedBy: inc.reportedBy,
      action: inc.action,
    });
    setShowIncidentForm(true);
  };

  const handleResolveIncident = async (id: string) => {
    try {
      const updated = await api.resolveDisciplineIncident(id, { status: 'resolved' });
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
    } catch {
      //
    }
  };

  const handleSaveBIP = async () => {
    try {
      if (editBIP) {
        const updated = await api.updateBIP(editBIP.id, bipForm);
        setBips(prev => prev.map(b => b.id === editBIP.id ? updated : b));
      } else {
        const created = await api.createBIP(bipForm);
        setBips(prev => [...prev, created]);
      }
      setShowBIPForm(false);
      setEditBIP(null);
      setBipForm({ studentName: '', targetBehaviours: '', strategies: '', goals: '', startDate: '', reviewDate: '', status: 'active' });
    } catch {
      //
    }
  };

  const openEditBIP = (bip: BIP) => {
    setEditBIP(bip);
    setBipForm({
      studentName: bip.studentName,
      targetBehaviours: bip.targetBehaviours,
      strategies: bip.strategies,
      goals: bip.goals,
      startDate: bip.startDate,
      reviewDate: bip.reviewDate,
      status: bip.status,
    });
    setShowBIPForm(true);
  };

  const handleCreateDetention = async () => {
    try {
      const created = await api.createDetention(detentionForm);
      setDetentions(prev => [...prev, created]);
      setShowDetentionForm(false);
      setDetentionForm({ studentName: '', date: '', time: '', duration: '', reason: '', assignedBy: '' });
    } catch {
      //
    }
  };

  const handleDetentionAction = async (id: string, action: string) => {
    try {
      const updated = await api.updateDetentionStatus(id, action);
      setDetentions(prev => prev.map(d => d.id === id ? updated : d));
    } catch {
      //
    }
  };

  const handleCreatePositive = async () => {
    try {
      const created = await api.createPositiveBehaviour(positiveForm);
      setPositive(prev => [...prev, created]);
      setShowPositiveForm(false);
      setPositiveForm({ studentName: '', date: '', behaviour: '', description: '', recognisedBy: '', points: 0 });
    } catch {
      //
    }
  };

  const filterBySearch = <T extends { studentName?: string }>(items: T[]): T[] =>
    items.filter(i => i.studentName?.toLowerCase().includes(search.toLowerCase()));

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'success', inactive: 'secondary', completed: 'success',
      pending: 'warning', resolved: 'success', scheduled: 'info',
      served: 'success', 'not-served': 'destructive',
      low: 'info', medium: 'warning', high: 'destructive', critical: 'destructive',
    };
    return <Badge variant={(map[status] || 'default') as any}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Discipline</h1>
        <p className="text-muted-foreground">Incidents, BIPs, detentions & positive behaviour</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="bips">BIP Plans</TabsTrigger>
          <TabsTrigger value="detentions">Detentions</TabsTrigger>
          <TabsTrigger value="positive">Positive Behaviour</TabsTrigger>
        </TabsList>

        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <TabsContent value="incidents">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{incidents.length} incident(s)</p>
            <Button onClick={() => { setEditIncident(null); setIncidentForm({ studentName: '', date: '', type: '', description: '', severity: 'medium', reportedBy: '', action: '' }); setShowIncidentForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />New Incident
            </Button>
          </div>

          {showIncidentForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">{editIncident ? 'Edit Incident' : 'New Discipline Incident'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Student Name" value={incidentForm.studentName} onChange={(e) => setIncidentForm({ ...incidentForm, studentName: e.target.value })} />
                <Input type="date" value={incidentForm.date} onChange={(e) => setIncidentForm({ ...incidentForm, date: e.target.value })} />
                <Input placeholder="Type (e.g. disruption, bullying)" value={incidentForm.type} onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value })} />
                <Input placeholder="Reported By" value={incidentForm.reportedBy} onChange={(e) => setIncidentForm({ ...incidentForm, reportedBy: e.target.value })} />
                <div className="md:col-span-2">
                  <Textarea placeholder="Description" value={incidentForm.description} onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })} />
                </div>
                <select value={incidentForm.severity} onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <Input placeholder="Action Taken" value={incidentForm.action} onChange={(e) => setIncidentForm({ ...incidentForm, action: e.target.value })} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveIncident}>{editIncident ? 'Update' : 'Create'}</Button>
                <Button variant="outline" onClick={() => { setShowIncidentForm(false); setEditIncident(null); }}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
          ) : (
            <div className="space-y-3">
              {filterBySearch(incidents).map(i => (
                <Card key={i.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">{i.studentName}</h4>
                        <p className="text-sm"><span className="font-medium">{i.type}</span></p>
                        <p className="text-sm text-muted-foreground">{i.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{i.date}</span>
                          <span>Reported by: {i.reportedBy}</span>
                          {i.action && <span>Action: {i.action}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(i.severity)}
                      {statusBadge(i.status)}
                      {i.status !== 'resolved' && (
                        <button onClick={() => handleResolveIncident(i.id)} className="p-1.5 hover:bg-green-100 rounded text-green-500"><CheckCircle className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => openEditIncident(i)} className="p-1.5 hover:bg-orange-100 rounded text-orange-500"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </Card>
              ))}
              {filterBySearch(incidents).length === 0 && <p className="text-muted-foreground text-center py-8">No incidents found</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bips">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{bips.length} BIP(s)</p>
            <Button onClick={() => { setEditBIP(null); setBipForm({ studentName: '', targetBehaviours: '', strategies: '', goals: '', startDate: '', reviewDate: '', status: 'active' }); setShowBIPForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />New BIP
            </Button>
          </div>

          {showBIPForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">{editBIP ? 'Edit BIP' : 'New Behaviour Intervention Plan'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Student Name" value={bipForm.studentName} onChange={(e) => setBipForm({ ...bipForm, studentName: e.target.value })} />
                <Input type="date" value={bipForm.startDate} onChange={(e) => setBipForm({ ...bipForm, startDate: e.target.value })} placeholder="Start Date" />
                <div className="md:col-span-2">
                  <Textarea placeholder="Target Behaviours" value={bipForm.targetBehaviours} onChange={(e) => setBipForm({ ...bipForm, targetBehaviours: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Textarea placeholder="Intervention Strategies" value={bipForm.strategies} onChange={(e) => setBipForm({ ...bipForm, strategies: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Textarea placeholder="Goals" value={bipForm.goals} onChange={(e) => setBipForm({ ...bipForm, goals: e.target.value })} />
                </div>
                <Input type="date" value={bipForm.reviewDate} onChange={(e) => setBipForm({ ...bipForm, reviewDate: e.target.value })} placeholder="Review Date" />
                <select value={bipForm.status} onChange={(e) => setBipForm({ ...bipForm, status: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveBIP}>{editBIP ? 'Update' : 'Create'}</Button>
                <Button variant="outline" onClick={() => { setShowBIPForm(false); setEditBIP(null); }}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
          ) : (
            <div className="space-y-3">
              {filterBySearch(bips).map(b => (
                <Card key={b.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">{b.studentName}</h4>
                        <p className="text-sm"><span className="font-medium">Target Behaviours:</span> {b.targetBehaviours}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-medium">Strategies:</span> {b.strategies}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-medium">Goals:</span> {b.goals}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>Start: {b.startDate}</span>
                          <span>Review: {b.reviewDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(b.status)}
                      <button onClick={() => openEditBIP(b)} className="p-1.5 hover:bg-orange-100 rounded text-orange-500"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </Card>
              ))}
              {filterBySearch(bips).length === 0 && <p className="text-muted-foreground text-center py-8">No BIPs found</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="detentions">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{detentions.length} detention(s)</p>
            <Button onClick={() => setShowDetentionForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Detention
            </Button>
          </div>

          {showDetentionForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Detention</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Student Name" value={detentionForm.studentName} onChange={(e) => setDetentionForm({ ...detentionForm, studentName: e.target.value })} />
                <Input type="date" value={detentionForm.date} onChange={(e) => setDetentionForm({ ...detentionForm, date: e.target.value })} />
                <Input type="time" value={detentionForm.time} onChange={(e) => setDetentionForm({ ...detentionForm, time: e.target.value })} />
                <Input placeholder="Duration (e.g. 30 min)" value={detentionForm.duration} onChange={(e) => setDetentionForm({ ...detentionForm, duration: e.target.value })} />
                <div className="md:col-span-2">
                  <Textarea placeholder="Reason" value={detentionForm.reason} onChange={(e) => setDetentionForm({ ...detentionForm, reason: e.target.value })} />
                </div>
                <Input placeholder="Assigned By" value={detentionForm.assignedBy} onChange={(e) => setDetentionForm({ ...detentionForm, assignedBy: e.target.value })} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateDetention}>Create</Button>
                <Button variant="outline" onClick={() => setShowDetentionForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : (
            <div className="space-y-3">
              {filterBySearch(detentions).map(d => (
                <Card key={d.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">{d.studentName}</h4>
                        <p className="text-sm">{d.reason}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{d.date}</span>
                          <span>{d.time}</span>
                          <span>{d.duration}</span>
                          <span>By: {d.assignedBy}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(d.status)}
                      {d.status === 'scheduled' && (
                        <>
                          <button onClick={() => handleDetentionAction(d.id, 'serve')} className="p-1.5 hover:bg-green-100 rounded text-green-500"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleDetentionAction(d.id, 'cancel')} className="p-1.5 hover:bg-red-100 rounded text-red-500"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {filterBySearch(detentions).length === 0 && <p className="text-muted-foreground text-center py-8">No detentions found</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="positive">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{positive.length} record(s)</p>
            <Button onClick={() => setShowPositiveForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Record
            </Button>
          </div>

          {showPositiveForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Positive Behaviour Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Student Name" value={positiveForm.studentName} onChange={(e) => setPositiveForm({ ...positiveForm, studentName: e.target.value })} />
                <Input type="date" value={positiveForm.date} onChange={(e) => setPositiveForm({ ...positiveForm, date: e.target.value })} />
                <Input placeholder="Behaviour Type" value={positiveForm.behaviour} onChange={(e) => setPositiveForm({ ...positiveForm, behaviour: e.target.value })} />
                <Input type="number" placeholder="Points" value={positiveForm.points} onChange={(e) => setPositiveForm({ ...positiveForm, points: parseInt(e.target.value) || 0 })} />
                <div className="md:col-span-2">
                  <Textarea placeholder="Description" value={positiveForm.description} onChange={(e) => setPositiveForm({ ...positiveForm, description: e.target.value })} />
                </div>
                <Input placeholder="Recognised By" value={positiveForm.recognisedBy} onChange={(e) => setPositiveForm({ ...positiveForm, recognisedBy: e.target.value })} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreatePositive}>Create</Button>
                <Button variant="outline" onClick={() => setShowPositiveForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {filterBySearch(positive).map(p => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-emerald-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">{p.studentName}</h4>
                      <p className="text-sm"><span className="font-medium">{p.behaviour}</span> — {p.points} pts</p>
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.date}</span>
                        <span>Recognised by: {p.recognisedBy}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {filterBySearch(positive).length === 0 && <p className="text-muted-foreground text-center py-8">No positive behaviour records found</p>}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
