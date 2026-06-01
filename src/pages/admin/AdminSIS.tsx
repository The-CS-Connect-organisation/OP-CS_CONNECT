import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Users,
  Key,
  FileText,
  GraduationCap,
  ArrowUp,
  BookOpen,
  Check,
  X,
  BarChart3,
  Calendar,
  Clipboard,
} from 'lucide-react';

interface CustomField {
  id: string;
  fieldName: string;
  fieldType: string;
  required: boolean;
}

interface StudentTransfer {
  id: string;
  studentId: string;
  fromClass: string;
  toClass: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

interface Family {
  id: string;
  name: string;
  parentName: string;
  parentPhone: string;
  students: string[];
}

interface Locker {
  id: string;
  number: string;
  location: string;
  assignedTo: string;
  status: 'available' | 'assigned';
}

interface StudentNote {
  id: string;
  studentId: string;
  content: string;
  author: string;
  createdAt: string;
}

interface GraduationStatus {
  studentId: string;
  eligible: boolean;
  graduated: boolean;
  year: number;
}

interface Promotion {
  id: string;
  studentId: string;
  fromClass: string;
  toClass: string;
  academicYear: string;
  status: string;
}

interface TransferCertificate {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  issueDate: string;
  status: string;
}

export default function AdminSIS() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Overview data
  const [students, setStudents] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [enrolments, setEnrolments] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  // Custom Fields
  const [entityType, setEntityType] = useState('student');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [fieldForm, setFieldForm] = useState({ fieldName: '', fieldType: 'text', required: false });

  // Transfers
  const [transfers, setTransfers] = useState<StudentTransfer[]>([]);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferForm, setTransferForm] = useState({ studentId: '', fromClass: '', toClass: '', reason: '' });

  // Families
  const [families, setFamilies] = useState<Family[]>([]);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [familyForm, setFamilyForm] = useState({ name: '', parentName: '', parentPhone: '', students: '' });

  // Lockers
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [assignForm, setAssignForm] = useState({ lockerId: '', studentId: '' });

  // Student Notes
  const [noteStudentId, setNoteStudentId] = useState('');
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [notesLoaded, setNotesLoaded] = useState(false);

  // Graduation
  const [gradStudentId, setGradStudentId] = useState('');
  const [gradStatus, setGradStatus] = useState<GraduationStatus | null>(null);

  // Promotions
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [promotionForm, setPromotionForm] = useState({ fromClass: '', toClass: '', academicYear: '' });

  // TC
  const [tcs, setTcs] = useState<TransferCertificate[]>([]);
  const [showTcForm, setShowTcForm] = useState(false);
  const [tcForm, setTcForm] = useState({ studentId: '', studentName: '', class: '' });

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    const safe = (p: Promise<any>) => p.then((r: any) => Array.isArray(r) ? r : []).catch(() => []);

    const results = await Promise.allSettled([
      safe(api.getUsers({ role: 'student' })),
      safe(api.getCourses()),
      safe(api.getEnrolmentApplications()),
      safe((api as any).getAttendance()),
      safe(api.getCustomFields('student')),
      safe(api.getStudentTransfers()),
      safe(api.getFamilies()),
      safe(api.getLockers()),
      safe(api.getPromotions()),
      safe(api.getTransferCertificates()),
    ]);

    const getValue = (idx: number) =>
      results[idx]?.status === 'fulfilled' ? results[idx].value : [];

    setStudents(getValue(0));
    setClassesList(getValue(1));
    setEnrolments(getValue(2));
    setAttendanceRecords(getValue(3));
    setCustomFields(getValue(4));
    setTransfers(getValue(5));
    setFamilies(getValue(6));
    setLockers(getValue(7));
    setPromotions(getValue(8));
    setTcs(getValue(9));
    setLoading(false);
  };

  // Custom Fields
  const handleEntityTypeChange = async (et: string) => {
    setEntityType(et);
    try {
      const data = await api.getCustomFields(et);
      setCustomFields(Array.isArray(data) ? data : []);
    } catch {
      // error
    }
  };

  const handleAddField = async () => {
    try {
      const updated = await api.setCustomFields(entityType, [...customFields, fieldForm]);
      setCustomFields(Array.isArray(updated) ? updated : []);
      setShowFieldForm(false);
      setFieldForm({ fieldName: '', fieldType: 'text', required: false });
    } catch {
      // error
    }
  };

  // Transfers
  const handleCreateTransfer = async () => {
    try {
      const created = await api.createStudentTransfer(transferForm);
      setTransfers(prev => [...prev, created]);
      setShowTransferForm(false);
      setTransferForm({ studentId: '', fromClass: '', toClass: '', reason: '' });
    } catch {
      // error
    }
  };

  const handleTransferStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const updated = await api.updateStudentTransfer(id, { status });
      setTransfers(prev => prev.map(t => t.id === id ? updated : t));
    } catch {
      // error
    }
  };

  // Families
  const handleCreateFamily = async () => {
    try {
      const created = await api.createFamily({ ...familyForm, students: familyForm.students.split(',').map(s => s.trim()).filter(Boolean) });
      setFamilies(prev => [...prev, created]);
      setShowFamilyForm(false);
      setFamilyForm({ name: '', parentName: '', parentPhone: '', students: '' });
    } catch {
      // error
    }
  };

  // Lockers
  const handleAssignLocker = async () => {
    try {
      await api.assignLocker(assignForm);
      const updated = await api.getLockers();
      setLockers(Array.isArray(updated) ? updated : []);
      setAssignForm({ lockerId: '', studentId: '' });
    } catch {
      // error
    }
  };

  // Student Notes
  const handleLoadNotes = async () => {
    if (!noteStudentId.trim()) return;
    try {
      const data = await api.getStudentNotes(noteStudentId);
      setNotes(Array.isArray(data) ? data : []);
      setNotesLoaded(true);
    } catch {
      // error
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const created = await api.createStudentNote(noteStudentId, { content: newNote, author: 'Admin' });
      setNotes(prev => [...prev, { ...created, studentId: noteStudentId, createdAt: new Date().toISOString() }]);
      setNewNote('');
    } catch {
      // error
    }
  };

  // Graduation
  const handleCheckGraduation = async () => {
    if (!gradStudentId.trim()) return;
    try {
      const data = await api.getGraduationStatus(gradStudentId);
      setGradStatus(data);
    } catch {
      // error
    }
  };

  const handleSetGraduation = async () => {
    if (!gradStudentId.trim()) return;
    try {
      const updated = await api.setGraduationStatus(gradStudentId, { graduated: true, year: new Date().getFullYear() });
      setGradStatus(updated);
    } catch {
      // error
    }
  };

  // Promotions
  const handleCreatePromotion = async () => {
    try {
      const created = await api.createPromotion(promotionForm);
      setPromotions(prev => [...prev, created]);
      setShowPromotionForm(false);
      setPromotionForm({ fromClass: '', toClass: '', academicYear: '' });
    } catch {
      // error
    }
  };

  // TC
  const handleIssueTC = async () => {
    try {
      const created = await api.issueTransferCertificate({ ...tcForm, issueDate: new Date().toISOString() });
      setTcs(prev => [...prev, created]);
      setShowTcForm(false);
      setTcForm({ studentId: '', studentName: '', class: '' });
    } catch {
      // error
    }
  };

  const totalStudents = students.length;
  const totalClasses = classesList.length;
  const totalEnrolments = enrolments.length;
  const presentCount = attendanceRecords.filter((a: any) => a.status === 'present').length;
  const attendanceRate = attendanceRecords.length > 0
    ? Math.round((presentCount / attendanceRecords.length) * 100)
    : 0;

  const classBreakdown = students.reduce<Record<string, number>>((acc, s) => {
    const cls = s.class || s.className || s.grade || 'Unassigned';
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Information System</h1>
        <p className="text-muted-foreground">SIS management</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="families">Families</TabsTrigger>
          <TabsTrigger value="lockers">Lockers</TabsTrigger>
          <TabsTrigger value="notes">Student Notes</TabsTrigger>
          <TabsTrigger value="graduation">Graduation</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="tc">Transfer Certs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{totalStudents}</p>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{totalClasses}</p>
                      <p className="text-sm text-muted-foreground">Total Classes</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{totalEnrolments}</p>
                      <p className="text-sm text-muted-foreground">Enrolments</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{attendanceRecords.length > 0 ? `${attendanceRate}%` : 'No data'}</p>
                      <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="p-4 lg:col-span-2">
                  <h3 className="font-semibold mb-4">Students ({totalStudents})</h3>
                  {students.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No data</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2 py-1">
                        <div className="col-span-3">ID</div>
                        <div className="col-span-4">Name</div>
                        <div className="col-span-3">Class</div>
                        <div className="col-span-2">Status</div>
                      </div>
                      {students.slice(0, 50).map((s: any) => (
                        <div key={s.id} className="grid grid-cols-12 gap-2 items-center px-2 py-2 rounded-lg hover:bg-muted/50 text-sm">
                          <div className="col-span-3 font-mono text-xs truncate">{s.id}</div>
                          <div className="col-span-4 font-medium truncate">{s.name || s.firstName + ' ' + (s.lastName || '') || s.email || 'Unknown'}</div>
                          <div className="col-span-3 truncate">{s.class || s.className || s.grade || '-'}</div>
                          <div className="col-span-2">
                            <Badge variant={s.status === 'active' ? 'success' : 'secondary'} className="text-[10px]">
                              {s.status || 'active'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {students.length > 50 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Showing 50 of {students.length} students
                        </p>
                      )}
                    </div>
                  )}
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Classes</h3>
                  {Object.keys(classBreakdown).length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No data</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(classBreakdown)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([cls, count]) => (
                          <div key={cls} className="flex items-center justify-between">
                            <span className="text-sm">{cls}</span>
                            <Badge variant="secondary">{count} student{count !== 1 ? 's' : ''}</Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="fields">
          <div className="flex items-center justify-between mb-4">
            <select value={entityType} onChange={(e) => handleEntityTypeChange(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <Button onClick={() => setShowFieldForm(true)}>
              <Plus className="w-4 h-4 mr-2" />Add Field
            </Button>
          </div>

          {showFieldForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Custom Field</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Field Name" value={fieldForm.fieldName} onChange={(e) => setFieldForm({ ...fieldForm, fieldName: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <select value={fieldForm.fieldType} onChange={(e) => setFieldForm({ ...fieldForm, fieldType: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={fieldForm.required} onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })} />
                  Required
                </label>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddField}>Add</Button>
                <Button variant="outline" onClick={() => setShowFieldForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : (
            <div className="space-y-3">
              {customFields.map(f => (
                <Card key={f.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{f.fieldName}</h4>
                      <p className="text-sm text-muted-foreground">Type: {f.fieldType} | Required: {f.required ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </Card>
              ))}
              {customFields.length === 0 && <p className="text-muted-foreground text-center py-8">No custom fields</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transfers">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{transfers.length} transfer(s)</p>
            <Button onClick={() => setShowTransferForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Transfer
            </Button>
          </div>

          {showTransferForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Transfer Request</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Student ID" value={transferForm.studentId} onChange={(e) => setTransferForm({ ...transferForm, studentId: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="From Class" value={transferForm.fromClass} onChange={(e) => setTransferForm({ ...transferForm, fromClass: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="To Class" value={transferForm.toClass} onChange={(e) => setTransferForm({ ...transferForm, toClass: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Reason" value={transferForm.reason} onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateTransfer}>Create</Button>
                <Button variant="outline" onClick={() => setShowTransferForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {transfers.map(t => (
                <Card key={t.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserPlus className="w-5 h-5 text-orange-500" />
                      <div>
                        <h4 className="font-semibold">Student {t.studentId}</h4>
                        <p className="text-sm text-muted-foreground">{t.fromClass} → {t.toClass} | {t.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={t.status === 'approved' ? 'success' : t.status === 'rejected' ? 'destructive' : 'warning'}>{t.status}</Badge>
                      {t.status === 'pending' && (
                        <>
                          <button onClick={() => handleTransferStatus(t.id, 'approved')} className="p-2 hover:bg-green-100 rounded text-green-500"><Check className="w-4 h-4" /></button>
                          <button onClick={() => handleTransferStatus(t.id, 'rejected')} className="p-2 hover:bg-red-100 rounded text-red-500"><X className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {transfers.length === 0 && <p className="text-muted-foreground text-center py-8">No transfers</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="families">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{families.length} famil(y/ies)</p>
            <Button onClick={() => setShowFamilyForm(true)}>
              <Plus className="w-4 h-4 mr-2" />Add Family
            </Button>
          </div>

          {showFamilyForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Family</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Family Name" value={familyForm.name} onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Parent Name" value={familyForm.parentName} onChange={(e) => setFamilyForm({ ...familyForm, parentName: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Parent Phone" value={familyForm.parentPhone} onChange={(e) => setFamilyForm({ ...familyForm, parentPhone: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Student IDs (comma separated)" value={familyForm.students} onChange={(e) => setFamilyForm({ ...familyForm, students: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateFamily}>Create</Button>
                <Button variant="outline" onClick={() => setShowFamilyForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {families.map(f => (
                <Card key={f.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{f.name}</h4>
                      <p className="text-sm text-muted-foreground">{f.parentName} | {f.parentPhone}</p>
                      <p className="text-xs text-muted-foreground">Students: {f.students?.join(', ')}</p>
                    </div>
                  </div>
                </Card>
              ))}
              {families.length === 0 && <p className="text-muted-foreground text-center py-8">No families</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lockers">
          <div className="flex items-center gap-4 mb-4">
            <select value={assignForm.lockerId} onChange={(e) => setAssignForm({ ...assignForm, lockerId: e.target.value })} className="px-4 py-2 rounded-lg border bg-background flex-1">
              <option value="">Select Locker</option>
              {lockers.filter(l => l.status === 'available').map(l => <option key={l.id} value={l.id}>{l.number} ({l.location})</option>)}
            </select>
            <input type="text" placeholder="Student ID" value={assignForm.studentId} onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <Button onClick={handleAssignLocker}><Key className="w-4 h-4 mr-2" />Assign</Button>
          </div>

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lockers.map(l => (
                <Card key={l.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-orange-500" />
                      <div>
                        <h4 className="font-semibold">Locker {l.number}</h4>
                        <p className="text-xs text-muted-foreground">{l.location}</p>
                      </div>
                    </div>
                    <Badge variant={l.status === 'available' ? 'success' : 'secondary'}>{l.status}</Badge>
                  </div>
                  {l.assignedTo && <p className="text-xs text-muted-foreground mt-2">Assigned to: {l.assignedTo}</p>}
                </Card>
              ))}
              {lockers.length === 0 && <p className="text-muted-foreground text-center py-8 col-span-full">No lockers</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes">
          <div className="flex gap-4 mb-4">
            <input type="text" placeholder="Student ID" value={noteStudentId} onChange={(e) => setNoteStudentId(e.target.value)} className="px-3 py-2 rounded-lg border bg-background flex-1" />
            <Button onClick={handleLoadNotes}><FileText className="w-4 h-4 mr-2" />Load Notes</Button>
          </div>

          {notesLoaded && (
            <>
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="Add a note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="px-3 py-2 rounded-lg border bg-background flex-1" />
                <Button onClick={handleAddNote}><Plus className="w-4 h-4 mr-2" />Add</Button>
              </div>

              <div className="space-y-3">
                {notes.map(n => (
                  <Card key={n.id} className="p-4">
                    <p>{n.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{n.author} • {new Date(n.createdAt).toLocaleString()}</p>
                  </Card>
                ))}
                {notes.length === 0 && <p className="text-muted-foreground text-center py-8">No notes for this student</p>}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="graduation">
          <div className="flex gap-4 mb-4">
            <input type="text" placeholder="Student ID" value={gradStudentId} onChange={(e) => setGradStudentId(e.target.value)} className="px-3 py-2 rounded-lg border bg-background flex-1" />
            <Button onClick={handleCheckGraduation}><GraduationCap className="w-4 h-4 mr-2" />Check Status</Button>
          </div>

          {gradStatus && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-orange-500" />
                  <div>
                    <h4 className="font-semibold">Student {gradStatus.studentId}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant={gradStatus.eligible ? 'success' : 'warning'}>{gradStatus.eligible ? 'Eligible' : 'Not Eligible'}</Badge>
                      <Badge variant={gradStatus.graduated ? 'success' : 'secondary'}>{gradStatus.graduated ? 'Graduated' : 'Not Graduated'}</Badge>
                      {gradStatus.year && <span>Year: {gradStatus.year}</span>}
                    </div>
                  </div>
                </div>
                {!gradStatus.graduated && gradStatus.eligible && (
                  <Button onClick={handleSetGraduation}><GraduationCap className="w-4 h-4 mr-2" />Mark Graduated</Button>
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="promotions">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{promotions.length} promotion(s)</p>
            <Button onClick={() => setShowPromotionForm(true)}>
              <Plus className="w-4 h-4 mr-2" />Batch Promote
            </Button>
          </div>

          {showPromotionForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">Batch Promotion</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="From Class" value={promotionForm.fromClass} onChange={(e) => setPromotionForm({ ...promotionForm, fromClass: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="To Class" value={promotionForm.toClass} onChange={(e) => setPromotionForm({ ...promotionForm, toClass: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Academic Year" value={promotionForm.academicYear} onChange={(e) => setPromotionForm({ ...promotionForm, academicYear: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreatePromotion}>Promote</Button>
                <Button variant="outline" onClick={() => setShowPromotionForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : (
            <div className="space-y-3">
              {promotions.map(p => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <ArrowUp className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">Student {p.studentId}</h4>
                      <p className="text-sm text-muted-foreground">{p.fromClass} → {p.toClass} ({p.academicYear})</p>
                    </div>
                    <Badge variant="secondary">{p.status}</Badge>
                  </div>
                </Card>
              ))}
              {promotions.length === 0 && <p className="text-muted-foreground text-center py-8">No promotions</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tc">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{tcs.length} certificate(s)</p>
            <Button onClick={() => setShowTcForm(true)}>
              <Plus className="w-4 h-4 mr-2" />Issue TC
            </Button>
          </div>

          {showTcForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">Issue Transfer Certificate</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Student ID" value={tcForm.studentId} onChange={(e) => setTcForm({ ...tcForm, studentId: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Student Name" value={tcForm.studentName} onChange={(e) => setTcForm({ ...tcForm, studentName: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
                <input type="text" placeholder="Class" value={tcForm.class} onChange={(e) => setTcForm({ ...tcForm, class: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleIssueTC}>Issue</Button>
                <Button variant="outline" onClick={() => setShowTcForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : (
            <div className="space-y-3">
              {tcs.map(tc => (
                <Card key={tc.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{tc.studentName}</h4>
                      <p className="text-sm text-muted-foreground">ID: {tc.studentId} | Class: {tc.class}</p>
                      <p className="text-xs text-muted-foreground">Issued: {new Date(tc.issueDate).toLocaleDateString()} | Status: {tc.status}</p>
                    </div>
                  </div>
                </Card>
              ))}
              {tcs.length === 0 && <p className="text-muted-foreground text-center py-8">No transfer certificates</p>}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

