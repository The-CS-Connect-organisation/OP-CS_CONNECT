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
  Settings, Cog, Globe, Database, Workflow, Briefcase, Handshake,
  Plus, Search, Edit2, Trash2, CheckCircle, XCircle, FileText, Building,
  Network, Server, Shield, Users, BookOpen,
} from 'lucide-react';

interface Workflow {
  id: string; name: string; description: string; steps: number; status: string; category: string;
}
interface SystemTask {
  id: string; title: string; description: string; assignee: string; priority: string; status: string; dueDate: string;
}
interface ManagedSchool {
  id: string; name: string; domain: string; status: string; students: number; staff: number;
}
interface Household {
  id: string; name: string; address: string; headName: string; members: number; phone: string;
}
interface SystemSurvey {
  id: string; title: string; description: string; status: string; responses: number;
}
interface CRMContact {
  id: string; name: string; email: string; phone: string; company: string; status: string; notes: string;
}
interface PlatformDocument {
  id: string; name: string; type: string; size: string; uploadedBy: string; date: string;
}
interface BulkOperation {
  id: string; name: string; type: string; status: string; records: number; completed: number;
}

export default function AdminPlatform() {
  const [activeTab, setActiveTab] = useState('workflows');
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Administration</h1>
        <p className="text-muted-foreground">Workflows, system config, multi-tenant, CRM and more</p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="schools">Multi-Tenant Schools</TabsTrigger>
          <TabsTrigger value="households">Households</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>
        <TabsContent value="workflows"><WorkflowsTab /></TabsContent>
        <TabsContent value="tasks"><TasksTab /></TabsContent>
        <TabsContent value="config"><ConfigTab /></TabsContent>
        <TabsContent value="schools"><SchoolsTab /></TabsContent>
        <TabsContent value="households"><HouseholdsTab /></TabsContent>
        <TabsContent value="surveys"><SurveysTab /></TabsContent>
        <TabsContent value="crm"><CRMTab /></TabsContent>
        <TabsContent value="documents"><DocumentsTab /></TabsContent>
        <TabsContent value="bulk"><BulkTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function WorkflowsTab() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', steps: 0, category: '', status: 'active' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getWorkflows(); setWorkflows(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load workflows'); }
    finally { setLoading(false); }
  };

  const filtered = workflows.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) { await api.updateWorkflow(editingId, formData); }
      else { await api.createWorkflow(formData); }
      setShowCreate(false); setEditingId(null);
      setFormData({ name: '', description: '', steps: 0, category: '', status: 'active' });
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
          <Input placeholder="Search workflows..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', description: '', steps: 0, category: '', status: 'active' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Workflow
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(w => (
          <Card key={w.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Workflow className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{w.name}</h4>
                    <Badge variant={w.status === 'active' ? 'success' : 'secondary'}>{w.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    {w.category && <Badge variant="outline">{w.category}</Badge>}
                    <span>{w.steps || 0} step(s)</span>
                  </div>
                  {w.description && <p className="text-sm text-muted-foreground mt-1">{w.description}</p>}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setEditingId(w.id); setFormData({ name: w.name, description: w.description || '', steps: w.steps || 0, category: w.category || '', status: w.status }); setShowCreate(true); }}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No workflows found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Workflow' : 'Add Workflow'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Steps</label>
              <Input type="number" value={formData.steps || ''} onChange={e => setFormData(f => ({ ...f, steps: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Workflow</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TasksTab() {
  const [tasks, setTasks] = useState<SystemTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getSystemTasks(); setTasks(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const filtered = tasks.filter(t => filter === 'all' || t.status === filter);

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) { await api.updateSystemTask(editingId, formData); }
      else { await api.createSystemTask(formData); }
      setShowCreate(false); setEditingId(null);
      setFormData({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleComplete = async (id: string) => {
    try { setError(''); await api.completeSystemTask(id); load(); }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <div className="flex-1" />
        <Button onClick={() => { setEditingId(null); setFormData({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Task
        </Button>
      </div>
      <div className="space-y-3">
        {filtered.map(t => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{t.title}</h4>
                    <Badge variant={t.priority === 'high' ? 'destructive' : t.priority === 'medium' ? 'warning' : 'info'}>{t.priority}</Badge>
                    <Badge variant={t.status === 'completed' ? 'success' : t.status === 'in-progress' ? 'info' : 'warning'}>{t.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    {t.assignee && <span>Assigned to: {t.assignee}</span>}
                    {t.dueDate && <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                  </div>
                  {t.description && <p className="text-sm text-muted-foreground mt-1">{t.description}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                {t.status !== 'completed' && (
                  <Button size="sm" variant="outline" onClick={() => handleComplete(t.id)}>
                    <CheckCircle className="w-4 h-4 mr-1" />Complete
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(t.id); setFormData({ title: t.title, description: t.description || '', assignee: t.assignee || '', priority: t.priority, dueDate: t.dueDate || '' }); setShowCreate(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No tasks found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Task' : 'Add Task'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Assignee</label>
              <Input value={formData.assignee} onChange={e => setFormData(f => ({ ...f, assignee: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select value={formData.priority} onChange={e => setFormData(f => ({ ...f, priority: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input type="date" value={formData.dueDate} onChange={e => setFormData(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Task</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ConfigTab() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getSystemConfig(); setConfig(d || {}); }
    catch { setError('Failed to load config'); }
    finally { setLoading(false); }
  };

  const handleSet = async () => {
    try {
      setError('');
      await api.setSystemConfig({ [key]: value });
      setKey('');
      setValue('');
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Cog className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold">Set Configuration</h3>
        </div>
        <div className="flex gap-3">
          <Input placeholder="Key" value={key} onChange={e => setKey(e.target.value)} className="flex-1" />
          <Input placeholder="Value" value={value} onChange={e => setValue(e.target.value)} className="flex-1" />
          <Button onClick={handleSet} disabled={!key || !value}>Set</Button>
        </div>
      </Card>
      <div className="space-y-2">
        {Object.entries(config).map(([k, v]) => (
          <Card key={k} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <code className="text-sm font-mono bg-orange-50 px-2 py-0.5 rounded">{k}</code>
                <span className="text-sm text-muted-foreground ml-2">{String(v)}</span>
              </div>
            </div>
          </Card>
        ))}
        {Object.keys(config).length === 0 && <p className="text-center text-muted-foreground py-8">No configuration entries</p>}
      </div>
    </div>
  );
}

function SchoolsTab() {
  const [schools, setSchools] = useState<ManagedSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', domain: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getManagedSchools(); setSchools(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load schools'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.addManagedSchool(formData);
      setShowCreate(false);
      setFormData({ name: '', domain: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => { setFormData({ name: '', domain: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add School
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schools.map(s => (
          <Card key={s.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-semibold">{s.name}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Globe className="w-3 h-3" />
                  <span>{s.domain || 'No domain'}</span>
                  <Badge variant={s.status === 'active' ? 'success' : 'secondary'}>{s.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>{s.students || 0} students</span>
                  <span>•</span>
                  <span>{s.staff || 0} staff</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {schools.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No managed schools found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Managed School" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">School Name</label>
            <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Domain</label>
            <Input value={formData.domain} onChange={e => setFormData(f => ({ ...f, domain: e.target.value }))} placeholder="school.example.com" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add School</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function HouseholdsTab() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', headName: '', phone: '' });
  const [error, setError] = useState('');
  const [memberHousehold, setMemberHousehold] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({ userId: '', role: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getHouseholds(); setHouseholds(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load households'); }
    finally { setLoading(false); }
  };

  const filtered = households.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.headName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) { await api.updateHousehold(editingId, formData); }
      else { await api.createHousehold(formData); }
      setShowCreate(false); setEditingId(null);
      setFormData({ name: '', address: '', headName: '', phone: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleAddMember = async () => {
    try {
      setError('');
      if (memberHousehold) {
        await api.addHouseholdMember(memberHousehold, memberForm);
        setMemberForm({ userId: '', role: '' });
        load();
      }
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search households..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', address: '', headName: '', phone: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Household
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(h => (
          <Card key={h.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{h.name}</h4>
                  <div className="text-sm text-muted-foreground mt-1">
                    {h.headName && <span>Head: {h.headName}</span>}
                    {h.phone && <span>{h.headName ? ' • ' : ''}{h.phone}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {h.address && <span>{h.address} • </span>}
                    <span>{h.members || 0} member(s)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => { setMemberHousehold(h.id); setMemberForm({ userId: '', role: '' }); }}>
                  <Users className="w-4 h-4 mr-1" />Members
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(h.id); setFormData({ name: h.name, address: h.address || '', headName: h.headName || '', phone: h.phone || '' }); setShowCreate(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No households found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Household' : 'Add Household'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Household Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Head Name</label>
              <Input value={formData.headName} onChange={e => setFormData(f => ({ ...f, headName: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Household</Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={memberHousehold !== null} onClose={() => setMemberHousehold(null)} title="Add Household Member" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">User ID</label>
              <Input value={memberForm.userId} onChange={e => setMemberForm(f => ({ ...f, userId: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Input value={memberForm.role} onChange={e => setMemberForm(f => ({ ...f, role: e.target.value }))} placeholder="parent/guardian/student" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setMemberHousehold(null)}>Cancel</Button>
            <Button onClick={handleAddMember}>Add Member</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SurveysTab() {
  const [surveys, setSurveys] = useState<SystemSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'active' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getSystemSurveys(); setSurveys(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load surveys'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createSystemSurvey(formData);
      setShowCreate(false);
      setFormData({ title: '', description: '', status: 'active' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => { setFormData({ title: '', description: '', status: 'active' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Survey
        </Button>
      </div>
      <div className="space-y-3">
        {surveys.map(s => (
          <Card key={s.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{s.title}</h4>
                  <Badge variant={s.status === 'active' ? 'success' : 'secondary'}>{s.status}</Badge>
                </div>
                {s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}
                <p className="text-xs text-muted-foreground mt-1">{s.responses || 0} response(s)</p>
              </div>
            </div>
          </Card>
        ))}
        {surveys.length === 0 && <p className="text-center text-muted-foreground py-8">No surveys found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Survey" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Survey</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CRMTab() {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', status: 'active', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getCRMContacts(); setContacts(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load contacts'); }
    finally { setLoading(false); }
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) { await api.updateCRMContact(editingId, formData); }
      else { await api.createCRMContact(formData); }
      setShowCreate(false); setEditingId(null);
      setFormData({ name: '', email: '', phone: '', company: '', status: 'active', notes: '' });
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
          <Input placeholder="Search contacts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', company: '', status: 'active', notes: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Contact
        </Button>
      </div>
      <div className="space-y-3">
        {filtered.map(c => (
          <Card key={c.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{c.name}</h4>
                    <Badge variant={c.status === 'active' ? 'success' : c.status === 'lead' ? 'info' : 'secondary'}>{c.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {c.email && <span>{c.email}</span>}
                    {c.phone && <span>{c.email ? ' • ' : ''}{c.phone}</span>}
                    {c.company && <span>{c.email || c.phone ? ' • ' : ''}{c.company}</span>}
                  </div>
                  {c.notes && <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setEditingId(c.id); setFormData({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '', status: c.status, notes: c.notes || '' }); setShowCreate(true); }}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No CRM contacts found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Contact' : 'Add Contact'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Company</label>
              <Input value={formData.company} onChange={e => setFormData(f => ({ ...f, company: e.target.value }))} />
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
          <div>
            <label className="text-sm font-medium">Status</label>
            <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="lead">Lead</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Contact</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DocumentsTab() {
  const [documents, setDocuments] = useState<PlatformDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: '', size: '', uploadedBy: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getPlatformDocuments(); setDocuments(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load documents'); }
    finally { setLoading(false); }
  };

  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = async () => {
    try {
      setError('');
      await api.uploadPlatformDocument(formData);
      setShowUpload(false);
      setFormData({ name: '', type: '', size: '', uploadedBy: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleDelete = async (id: string) => {
    try { setError(''); await api.deletePlatformDocument(id); load(); }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setFormData({ name: '', type: '', size: '', uploadedBy: '' }); setShowUpload(true); }}>
          <Plus className="w-4 h-4 mr-2" />Upload Document
        </Button>
      </div>
      <div className="space-y-3">
        {filtered.map(d => (
          <Card key={d.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{d.name}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    {d.type && <Badge variant="outline">{d.type}</Badge>}
                    {d.size && <span>{d.size}</span>}
                    {d.uploadedBy && <span>by {d.uploadedBy}</span>}
                  </div>
                  {d.date && <p className="text-xs text-muted-foreground mt-1">{new Date(d.date).toLocaleDateString()}</p>}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No documents found</p>}
      </div>
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Document Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Input value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))} placeholder="PDF, DOC, etc." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Size</label>
              <Input value={formData.size} onChange={e => setFormData(f => ({ ...f, size: e.target.value }))} placeholder="e.g. 2.5 MB" />
            </div>
            <div>
              <label className="text-sm font-medium">Uploaded By</label>
              <Input value={formData.uploadedBy} onChange={e => setFormData(f => ({ ...f, uploadedBy: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
            <Button onClick={handleUpload}>Upload</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function BulkTab() {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: '', records: 0 });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getBulkOperations(); setOperations(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load bulk operations'); }
    finally { setLoading(false); }
  };

  const handleExecute = async () => {
    try {
      setError('');
      await api.executeBulkOperation(formData);
      setShowCreate(false);
      setFormData({ name: '', type: '', records: 0 });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => { setFormData({ name: '', type: '', records: 0 }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Execute Operation
        </Button>
      </div>
      <div className="space-y-3">
        {operations.map(o => (
          <Card key={o.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{o.name}</h4>
                    <Badge variant="outline">{o.type}</Badge>
                    <Badge variant={o.status === 'completed' ? 'success' : o.status === 'running' ? 'info' : 'warning'}>{o.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span>{o.completed || 0} / {o.records || 0} records processed</span>
                  </div>
                  {(o.records || 0) > 0 && (
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2 max-w-xs">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.round(((o.completed || 0) / (o.records || 1)) * 100)}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {operations.length === 0 && <p className="text-center text-muted-foreground py-8">No bulk operations found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Execute Bulk Operation" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Operation Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Input value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))} placeholder="import/export/update" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Records</label>
            <Input type="number" value={formData.records || ''} onChange={e => setFormData(f => ({ ...f, records: Number(e.target.value) }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleExecute}>Execute</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
