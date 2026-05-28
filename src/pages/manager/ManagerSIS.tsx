import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Users, Plus, Edit, Trash2, ListOrdered, ArrowRight, Home, Key, GraduationCap, FileText } from 'lucide-react';

interface CustomField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface StudentTransfer {
  id: string;
  studentName: string;
  fromSchool: string;
  toSchool: string;
  date: string;
  reason: string;
  status: string;
}

interface Family {
  id: string;
  name: string;
  students: number;
  parentName: string;
  phone: string;
  email: string;
}

interface Locker {
  id: string;
  number: string;
  location: string;
  assignedTo: string;
  combination: string;
}

interface Promotion {
  id: string;
  fromClass: string;
  toClass: string;
  academicYear: string;
  studentCount: number;
  status: string;
}

interface TransferCertificate {
  id: string;
  studentName: string;
  className: string;
  issueDate: string;
  reason: string;
  status: string;
}

export default function ManagerSIS() {
  const [activeTab, setActiveTab] = useState('fields');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Information System</h1>
        <p className="text-muted-foreground">Manage student data, transfers, families, lockers, promotions & TC</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="fields"><ListOrdered className="w-4 h-4 mr-2" />Custom Fields</TabsTrigger>
          <TabsTrigger value="transfers"><ArrowRight className="w-4 h-4 mr-2" />Transfers</TabsTrigger>
          <TabsTrigger value="families"><Home className="w-4 h-4 mr-2" />Families</TabsTrigger>
          <TabsTrigger value="lockers"><Key className="w-4 h-4 mr-2" />Lockers</TabsTrigger>
          <TabsTrigger value="promotions"><GraduationCap className="w-4 h-4 mr-2" />Promotions</TabsTrigger>
          <TabsTrigger value="tc"><FileText className="w-4 h-4 mr-2" />TC</TabsTrigger>
        </TabsList>

        <TabsContent value="fields"><CustomFieldsTab /></TabsContent>
        <TabsContent value="transfers"><TransfersTab /></TabsContent>
        <TabsContent value="families"><FamiliesTab /></TabsContent>
        <TabsContent value="lockers"><LockersTab /></TabsContent>
        <TabsContent value="promotions"><PromotionsTab /></TabsContent>
        <TabsContent value="tc"><TransferCertificatesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function CustomFieldsTab() {
  const [loading, setLoading] = useState(false);
  const [entityType, setEntityType] = useState('student');
  const [fields, setFields] = useState<CustomField[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', type: 'text', required: false, options: '' });

  const entityTypes = ['student', 'teacher', 'staff', 'parent'];

  useEffect(() => {
    loadFields();
  }, [entityType]);

  const loadFields = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomFields(entityType);
      setFields(Array.isArray(data) ? data : []);
    } catch {
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async () => {
    if (!form.label) return;
    try {
      const updated = [...fields, { id: Date.now().toString(), label: form.label, type: form.type, required: form.required, options: form.options ? form.options.split(',').map(o => o.trim()) : undefined }];
      await api.setCustomFields(entityType, updated);
      setFields(updated);
      setForm({ label: '', type: 'text', required: false, options: '' });
      setShowForm(false);
    } catch { }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          {entityTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Field</Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Add Custom Field</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Field label" value={form.label} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background">
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Select</option>
              <option value="boolean">Yes/No</option>
            </select>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.required} onChange={(e) => setForm(f => ({ ...f, required: e.target.checked }))} className="rounded border" /> Required</label>
            {form.type === 'select' && (
              <input type="text" placeholder="Options (comma separated)" value={form.options} onChange={(e) => setForm(f => ({ ...f, options: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background md:col-span-3" />
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAddField}>Add</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setForm({ label: '', type: 'text', required: false, options: '' }); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="space-y-2">
          {fields.map(f => (
            <Card key={f.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="info">{f.type}</Badge>
                <span className="font-medium">{f.label}</span>
                {f.required && <Badge variant="destructive">Required</Badge>}
              </div>
              <button className="p-1 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
            </Card>
          ))}
          {fields.length === 0 && <p className="text-center text-muted-foreground py-8">No custom fields for {entityType}</p>}
        </div>
      )}
    </div>
  );
}

function TransfersTab() {
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<StudentTransfer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentName: '', fromSchool: '', toSchool: '', date: '', reason: '' });

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentTransfers();
      setTransfers(Array.isArray(data) ? data : []);
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.studentName) return;
    try {
      const data = await api.createStudentTransfer({ ...form, status: 'pending' });
      setTransfers(prev => [...prev, data]);
      setForm({ studentName: '', fromSchool: '', toSchool: '', date: '', reason: '' });
      setShowForm(false);
    } catch { }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{transfers.length} transfer(s)</p>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />New Transfer</Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Create Transfer</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Student name" value={form.studentName} onChange={(e) => setForm(f => ({ ...f, studentName: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="From school" value={form.fromSchool} onChange={(e) => setForm(f => ({ ...f, fromSchool: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="To school" value={form.toSchool} onChange={(e) => setForm(f => ({ ...f, toSchool: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Reason" value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background md:col-span-2" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setForm({ studentName: '', fromSchool: '', toSchool: '', date: '', reason: '' }); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {transfers.map(t => (
            <Card key={t.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{t.studentName}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{t.fromSchool}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>{t.toSchool}</span>
                    <span className="mx-1">|</span>
                    <span>{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {t.reason && <p className="text-sm text-muted-foreground mt-1">{t.reason}</p>}
                </div>
                <Badge className={t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}>{t.status}</Badge>
              </div>
            </Card>
          ))}
          {transfers.length === 0 && <p className="text-center text-muted-foreground py-8">No transfers</p>}
        </div>
      )}
    </div>
  );
}

function FamiliesTab() {
  const [loading, setLoading] = useState(true);
  const [families, setFamilies] = useState<Family[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Family | null>(null);
  const [form, setForm] = useState({ name: '', parentName: '', phone: '', email: '' });

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      const data = await api.getFamilies();
      setFamilies(Array.isArray(data) ? data : []);
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) return;
    try {
      if (editing) {
        await api.updateFamily(editing.id, form);
        setFamilies(prev => prev.map(f => f.id === editing.id ? { ...f, ...form } : f));
      } else {
        const data = await api.createFamily(form);
        setFamilies(prev => [...prev, data]);
      }
      setForm({ name: '', parentName: '', phone: '', email: '' });
      setShowForm(false);
      setEditing(null);
    } catch { }
  };

  const handleEdit = (fam: Family) => {
    setEditing(fam);
    setForm({ name: fam.name, parentName: fam.parentName, phone: fam.phone, email: fam.email });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{families.length} famil(ies)</p>
        <Button onClick={() => { setEditing(null); setForm({ name: '', parentName: '', phone: '', email: '' }); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />Add Family</Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">{editing ? 'Edit' : 'Add'} Family</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Family name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Parent name" value={form.parentName} onChange={(e) => setForm(f => ({ ...f, parentName: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); setForm({ name: '', parentName: '', phone: '', email: '' }); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {families.map(f => (
            <Card key={f.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{f.name}</h4>
                <button onClick={() => handleEdit(f)} className="p-1 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Parent: {f.parentName}</p>
                <p>{f.phone} {f.email && `| ${f.email}`}</p>
                <Badge variant="secondary">{f.students} student(s)</Badge>
              </div>
            </Card>
          ))}
          {families.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No families</p>}
        </div>
      )}
    </div>
  );
}

function LockersTab() {
  const [loading, setLoading] = useState(true);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ number: '', location: '', assignedTo: '', combination: '' });

  useEffect(() => {
    loadLockers();
  }, []);

  const loadLockers = async () => {
    try {
      setLoading(true);
      const data = await api.getLockers();
      setLockers(Array.isArray(data) ? data : []);
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!form.number) return;
    try {
      const data = await api.assignLocker(form);
      setLockers(prev => [...prev, data]);
      setForm({ number: '', location: '', assignedTo: '', combination: '' });
      setShowForm(false);
    } catch { }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{lockers.length} locker(s)</p>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Assign Locker</Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Assign Locker</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Locker number" value={form.number} onChange={(e) => setForm(f => ({ ...f, number: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Assigned to (student)" value={form.assignedTo} onChange={(e) => setForm(f => ({ ...f, assignedTo: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Combination" value={form.combination} onChange={(e) => setForm(f => ({ ...f, combination: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAssign}>Assign</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setForm({ number: '', location: '', assignedTo: '', combination: '' }); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lockers.map(l => (
            <Card key={l.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">Locker {l.number}</h4>
                  <p className="text-sm text-muted-foreground">{l.location}</p>
                </div>
                <Key className="w-5 h-5 text-orange-500" />
              </div>
              <div className="mt-2 text-sm">
                {l.assignedTo ? (
                  <Badge variant="success">Assigned: {l.assignedTo}</Badge>
                ) : (
                  <Badge variant="secondary">Available</Badge>
                )}
              </div>
            </Card>
          ))}
          {lockers.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-3">No lockers</p>}
        </div>
      )}
    </div>
  );
}

function PromotionsTab() {
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fromClass: '', toClass: '', academicYear: '', studentIds: '' });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await api.getPromotions();
      setPromotions(Array.isArray(data) ? data : []);
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.fromClass || !form.toClass) return;
    try {
      const data = await api.createPromotion({
        ...form,
        studentIds: form.studentIds.split(',').map(s => s.trim()).filter(Boolean),
      });
      setPromotions(prev => [...prev, data]);
      setForm({ fromClass: '', toClass: '', academicYear: '', studentIds: '' });
      setShowForm(false);
    } catch { }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{promotions.length} promotion(s)</p>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />New Promotion</Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Create Promotion Batch</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="From class" value={form.fromClass} onChange={(e) => setForm(f => ({ ...f, fromClass: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="To class" value={form.toClass} onChange={(e) => setForm(f => ({ ...f, toClass: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Academic year" value={form.academicYear} onChange={(e) => setForm(f => ({ ...f, academicYear: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Student IDs (comma separated)" value={form.studentIds} onChange={(e) => setForm(f => ({ ...f, studentIds: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setForm({ fromClass: '', toClass: '', academicYear: '', studentIds: '' }); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {promotions.map(p => (
            <Card key={p.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <GraduationCap className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.fromClass}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{p.toClass}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{p.academicYear} | {p.studentCount} student(s)</p>
                  </div>
                </div>
                <Badge className={p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>{p.status}</Badge>
              </div>
            </Card>
          ))}
          {promotions.length === 0 && <p className="text-center text-muted-foreground py-8">No promotions</p>}
        </div>
      )}
    </div>
  );
}

function TransferCertificatesTab() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<TransferCertificate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentName: '', className: '', issueDate: '', reason: '' });

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await api.getTransferCertificates();
      setCertificates(Array.isArray(data) ? data : []);
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleIssue = async () => {
    if (!form.studentName) return;
    try {
      const data = await api.issueTransferCertificate({ ...form, status: 'issued' });
      setCertificates(prev => [...prev, data]);
      setForm({ studentName: '', className: '', issueDate: '', reason: '' });
      setShowForm(false);
    } catch { }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{certificates.length} certificate(s)</p>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Issue TC</Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Issue Transfer Certificate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Student name" value={form.studentName} onChange={(e) => setForm(f => ({ ...f, studentName: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Class" value={form.className} onChange={(e) => setForm(f => ({ ...f, className: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="date" value={form.issueDate} onChange={(e) => setForm(f => ({ ...f, issueDate: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Reason" value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))} className="px-3 py-2 rounded-lg border bg-background" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleIssue}>Issue</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setForm({ studentName: '', className: '', issueDate: '', reason: '' }); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {certificates.map(c => (
            <Card key={c.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{c.studentName}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="secondary">{c.className}</Badge>
                    <span>{c.issueDate ? new Date(c.issueDate).toLocaleDateString() : 'N/A'}</span>
                    {c.reason && <span>{c.reason}</span>}
                  </div>
                </div>
                <Badge className={c.status === 'issued' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>{c.status}</Badge>
              </div>
            </Card>
          ))}
          {certificates.length === 0 && <p className="text-center text-muted-foreground py-8">No certificates issued</p>}
        </div>
      )}
    </div>
  );
}
