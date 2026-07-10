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
  Stethoscope,
  HeartPulse,
  Syringe,
  FileText,
  Activity,
  User,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface HealthRecord {
  id: string;
  studentName: string;
  condition: string;
  medication: string;
  allergies: string;
  bloodType: string;
  notes: string;
}

interface Immunisation {
  id: string;
  studentName: string;
  vaccine: string;
  dateGiven: string;
  dose: string;
  nextDue: string;
  administeredBy: string;
}

interface IEP {
  id: string;
  studentName: string;
  disability: string;
  accommodations: string;
  goals: string;
  reviewDate: string;
  status: string;
}

interface Screening {
  id: string;
  studentName: string;
  type: string;
  date: string;
  result: string;
  notes: string;
}

interface NurseVisit {
  id: string;
  studentName: string;
  date: string;
  time: string;
  reason: string;
  treatment: string;
  nurse: string;
  status: string;
}

export default function AdminHealth() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('records');
  const [search, setSearch] = useState('');

  const [records, setRecords] = useState<HealthRecord[]>([
  { id: 'hr1', studentName: 'Rahul Sharma', condition: 'Asthma', medication: 'Inhaler as needed', allergies: 'Peanuts', bloodType: 'O+', notes: 'Keep inhaler in backpack' }
]);
  const [immunisations, setImmunisations] = useState<Immunisation[]>([
  { id: 'im1', studentName: 'Priya Patel', vaccine: 'COVID-19', dateGiven: '2025-10-15', dose: 'Booster', nextDue: '2026-10-15', administeredBy: 'Dr. Smith' }
]);
  const [ieps, setIeps] = useState<IEP[]>([
  { id: 'iep1', studentName: 'Aarav Kumar', disability: 'Dyslexia', accommodations: 'Extra time on tests', goals: 'Improve reading fluency', reviewDate: '2026-08-01', status: 'active' }
]);
  const [screenings, setScreenings] = useState<Screening[]>([
  { id: 'sc1', studentName: 'Rahul Sharma', type: 'Vision', date: '2026-05-10', result: 'Pass - 20/20', notes: 'No issues detected' }
]);
  const [visits, setVisits] = useState<NurseVisit[]>([
  { id: 'nv1', studentName: 'Sneha Gupta', date: '2026-06-20', time: '10:30 AM', reason: 'Headache', treatment: 'Rest & Paracetamol', nurse: 'Nurse Jane', status: 'resolved' }
]);

  const [showRecordForm, setShowRecordForm] = useState(false);
  const [editRecord, setEditRecord] = useState<HealthRecord | null>(null);
  const [recordForm, setRecordForm] = useState({ studentName: '', condition: '', medication: '', allergies: '', bloodType: '', notes: '' });

  const [showImmunisationForm, setShowImmunisationForm] = useState(false);
  const [immunisationForm, setImmunisationForm] = useState({ studentName: '', vaccine: '', dateGiven: '', dose: '', nextDue: '', administeredBy: '' });

  const [showIEPForm, setShowIEPForm] = useState(false);
  const [editIEP, setEditIEP] = useState<IEP | null>(null);
  const [iepForm, setIepForm] = useState({ studentName: '', disability: '', accommodations: '', goals: '', reviewDate: '', status: 'active' });

  const [showScreeningForm, setShowScreeningForm] = useState(false);
  const [screeningForm, setScreeningForm] = useState({ studentName: '', type: '', date: '', result: '', notes: '' });

  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitForm, setVisitForm] = useState({ studentName: '', date: '', time: '', reason: '', treatment: '', nurse: '', status: 'completed' });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [recs, imm, iepData, scr, nv] = await Promise.all([
        api.getHealthRecords(),
        api.getImmunisations(),
        api.getIEPs(),
        api.getScreenings(),
        api.getNurseVisits(),
      ]);
      setRecords(Array.isArray(recs) ? recs : []);
      setImmunisations(Array.isArray(imm) ? imm : []);
      setIeps(Array.isArray(iepData) ? iepData : []);
      setScreenings(Array.isArray(scr) ? scr : []);
      setVisits(Array.isArray(nv) ? nv : []);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecord = async () => {
    try {
      if (editRecord) {
        const updated = await api.updateHealthRecord(editRecord.id, recordForm);
        setRecords(prev => prev.map(r => r.id === editRecord.id ? updated : r));
      } else {
        const created = await api.createHealthRecord(recordForm);
        setRecords(prev => [...prev, created]);
      }
      setShowRecordForm(false);
      setEditRecord(null);
      setRecordForm({ studentName: '', condition: '', medication: '', allergies: '', bloodType: '', notes: '' });
    } catch {
      //
    }
  };

  const openEditRecord = (rec: HealthRecord) => {
    setEditRecord(rec);
    setRecordForm({
      studentName: rec.studentName,
      condition: rec.condition,
      medication: rec.medication,
      allergies: rec.allergies,
      bloodType: rec.bloodType,
      notes: rec.notes,
    });
    setShowRecordForm(true);
  };

  const handleCreateImmunisation = async () => {
    try {
      const created = await api.createImmunisation(immunisationForm);
      setImmunisations(prev => [...prev, created]);
      setShowImmunisationForm(false);
      setImmunisationForm({ studentName: '', vaccine: '', dateGiven: '', dose: '', nextDue: '', administeredBy: '' });
    } catch {
      //
    }
  };

  const handleSaveIEP = async () => {
    try {
      if (editIEP) {
        const updated = await api.updateIEP(editIEP.id, iepForm);
        setIeps(prev => prev.map(i => i.id === editIEP.id ? updated : i));
      } else {
        const created = await api.createIEP(iepForm);
        setIeps(prev => [...prev, created]);
      }
      setShowIEPForm(false);
      setEditIEP(null);
      setIepForm({ studentName: '', disability: '', accommodations: '', goals: '', reviewDate: '', status: 'active' });
    } catch {
      //
    }
  };

  const openEditIEP = (iep: IEP) => {
    setEditIEP(iep);
    setIepForm({
      studentName: iep.studentName,
      disability: iep.disability,
      accommodations: iep.accommodations,
      goals: iep.goals,
      reviewDate: iep.reviewDate,
      status: iep.status,
    });
    setShowIEPForm(true);
  };

  const handleCreateScreening = async () => {
    try {
      const created = await api.createScreening(screeningForm);
      setScreenings(prev => [...prev, created]);
      setShowScreeningForm(false);
      setScreeningForm({ studentName: '', type: '', date: '', result: '', notes: '' });
    } catch {
      //
    }
  };

  const handleCreateVisit = async () => {
    try {
      const created = await api.createNurseVisit(visitForm);
      setVisits(prev => [...prev, created]);
      setShowVisitForm(false);
      setVisitForm({ studentName: '', date: '', time: '', reason: '', treatment: '', nurse: '', status: 'completed' });
    } catch {
      //
    }
  };

  const filterBySearch = <T extends { studentName?: string }>(items: T[]): T[] =>
    items.filter(i => i.studentName?.toLowerCase().includes(search.toLowerCase()));

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'success', inactive: 'secondary', completed: 'success',
      'follow-up': 'warning', referred: 'destructive', pending: 'warning',
    };
    return <Badge variant={(map[status] || 'default') as any}>{status}</Badge>;
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Health Services</h1>
        <p className="text-muted-foreground">Health records, immunisations, IEPs, screenings & nurse visits</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="overflow-x-auto flex-nowrap gap-1 scrollbar-thin pb-px">
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="immunisations">Immunisations</TabsTrigger>
          <TabsTrigger value="ieps">IEP Plans</TabsTrigger>
          <TabsTrigger value="screenings">Screenings / Vitals</TabsTrigger>
          <TabsTrigger value="visits">Nurse Visits</TabsTrigger>
        </TabsList>

        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <TabsContent value="records">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <p className="text-muted-foreground">{records.length} record(s)</p>
            <Button onClick={() => { setEditRecord(null); setRecordForm({ studentName: '', condition: '', medication: '', allergies: '', bloodType: '', notes: '' }); setShowRecordForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />New Record
            </Button>
          </div>

          {showRecordForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">{editRecord ? 'Edit Health Record' : 'New Health Record'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Student Name" value={recordForm.studentName} onChange={(e) => setRecordForm({ ...recordForm, studentName: e.target.value })} />
                <Input placeholder="Condition" value={recordForm.condition} onChange={(e) => setRecordForm({ ...recordForm, condition: e.target.value })} />
                <Input placeholder="Medication" value={recordForm.medication} onChange={(e) => setRecordForm({ ...recordForm, medication: e.target.value })} />
                <Input placeholder="Allergies" value={recordForm.allergies} onChange={(e) => setRecordForm({ ...recordForm, allergies: e.target.value })} />
                <Input placeholder="Blood Type" value={recordForm.bloodType} onChange={(e) => setRecordForm({ ...recordForm, bloodType: e.target.value })} />
                <div className="md:col-span-2">
                  <Textarea placeholder="Notes" value={recordForm.notes} onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveRecord}>{editRecord ? 'Update' : 'Create'}</Button>
                <Button variant="outline" onClick={() => { setShowRecordForm(false); setEditRecord(null); }}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : (
            <div className="space-y-3">
              {filterBySearch(records).map(r => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <HeartPulse className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">{r.studentName}</h4>
                        <p className="text-sm"><span className="font-medium">Condition:</span> {r.condition}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-medium">Medication:</span> {r.medication}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-medium">Allergies:</span> {r.allergies}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-medium">Blood:</span> {r.bloodType}</p>
                        {r.notes && <p className="text-sm text-muted-foreground mt-1">{r.notes}</p>}
                      </div>
                    </div>
                    <button onClick={() => openEditRecord(r)} className="p-1.5 hover:bg-orange-100 rounded text-orange-500 shrink-0"><Edit2 className="w-4 h-4" /></button>
                  </div>
                </Card>
              ))}
              {filterBySearch(records).length === 0 && <p className="text-muted-foreground text-center py-8">No records found</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="immunisations">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <p className="text-muted-foreground">{immunisations.length} immunisation(s)</p>
            <Button onClick={() => setShowImmunisationForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Immunisation
            </Button>
          </div>

          {showImmunisationForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Immunisation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Student Name" value={immunisationForm.studentName} onChange={(e) => setImmunisationForm({ ...immunisationForm, studentName: e.target.value })} />
                <Input placeholder="Vaccine" value={immunisationForm.vaccine} onChange={(e) => setImmunisationForm({ ...immunisationForm, vaccine: e.target.value })} />
                <Input type="date" value={immunisationForm.dateGiven} onChange={(e) => setImmunisationForm({ ...immunisationForm, dateGiven: e.target.value })} placeholder="Date Given" />
                <Input placeholder="Dose (e.g. 1st, Booster)" value={immunisationForm.dose} onChange={(e) => setImmunisationForm({ ...immunisationForm, dose: e.target.value })} />
                <Input type="date" value={immunisationForm.nextDue} onChange={(e) => setImmunisationForm({ ...immunisationForm, nextDue: e.target.value })} placeholder="Next Due" />
                <Input placeholder="Administered By" value={immunisationForm.administeredBy} onChange={(e) => setImmunisationForm({ ...immunisationForm, administeredBy: e.target.value })} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateImmunisation}>Create</Button>
                <Button variant="outline" onClick={() => setShowImmunisationForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {filterBySearch(immunisations).map(i => (
                <Card key={i.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Syringe className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">{i.studentName}</h4>
                        <p className="text-sm"><span className="font-medium">{i.vaccine}</span> — {i.dose}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                          <span>Given: {i.dateGiven}</span>
                          {i.nextDue && <span>Next: {i.nextDue}</span>}
                          <span>By: {i.administeredBy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {filterBySearch(immunisations).length === 0 && <p className="text-muted-foreground text-center py-8">No immunisations found</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ieps">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <p className="text-muted-foreground">{ieps.length} IEP(s)</p>
            <Button onClick={() => { setEditIEP(null); setIepForm({ studentName: '', disability: '', accommodations: '', goals: '', reviewDate: '', status: 'active' }); setShowIEPForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />New IEP
            </Button>
          </div>

          {showIEPForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">{editIEP ? 'Edit IEP' : 'New IEP'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Student Name" value={iepForm.studentName} onChange={(e) => setIepForm({ ...iepForm, studentName: e.target.value })} />
                <Input placeholder="Disability / Condition" value={iepForm.disability} onChange={(e) => setIepForm({ ...iepForm, disability: e.target.value })} />
                <div className="md:col-span-2">
                  <Textarea placeholder="Accommodations" value={iepForm.accommodations} onChange={(e) => setIepForm({ ...iepForm, accommodations: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Textarea placeholder="Goals" value={iepForm.goals} onChange={(e) => setIepForm({ ...iepForm, goals: e.target.value })} />
                </div>
                <Input type="date" value={iepForm.reviewDate} onChange={(e) => setIepForm({ ...iepForm, reviewDate: e.target.value })} placeholder="Review Date" />
                <select value={iepForm.status} onChange={(e) => setIepForm({ ...iepForm, status: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveIEP}>{editIEP ? 'Update' : 'Create'}</Button>
                <Button variant="outline" onClick={() => { setShowIEPForm(false); setEditIEP(null); }}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : (
            <div className="space-y-3">
              {filterBySearch(ieps).map(i => (
                <Card key={i.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">{i.studentName}</h4>
                        <p className="text-sm"><span className="font-medium">Disability:</span> {i.disability}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-medium">Accommodations:</span> {i.accommodations}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-medium">Goals:</span> {i.goals}</p>
                        <p className="text-xs text-muted-foreground mt-1">Review: {i.reviewDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(i.status)}
                      <button onClick={() => openEditIEP(i)} className="p-1.5 hover:bg-orange-100 rounded text-orange-500"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </Card>
              ))}
              {filterBySearch(ieps).length === 0 && <p className="text-muted-foreground text-center py-8">No IEPs found</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="screenings">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <p className="text-muted-foreground">{screenings.length} screening(s)</p>
            <Button onClick={() => setShowScreeningForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Screening
            </Button>
          </div>

          {showScreeningForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Screening / Vitals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Student Name" value={screeningForm.studentName} onChange={(e) => setScreeningForm({ ...screeningForm, studentName: e.target.value })} />
                <Input placeholder="Type (e.g. Vision, Hearing, BMI)" value={screeningForm.type} onChange={(e) => setScreeningForm({ ...screeningForm, type: e.target.value })} />
                <Input type="date" value={screeningForm.date} onChange={(e) => setScreeningForm({ ...screeningForm, date: e.target.value })} />
                <Input placeholder="Result" value={screeningForm.result} onChange={(e) => setScreeningForm({ ...screeningForm, result: e.target.value })} />
                <div className="md:col-span-2">
                  <Textarea placeholder="Notes" value={screeningForm.notes} onChange={(e) => setScreeningForm({ ...screeningForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateScreening}>Create</Button>
                <Button variant="outline" onClick={() => setShowScreeningForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {filterBySearch(screenings).map(s => (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">{s.studentName}</h4>
                      <p className="text-sm"><span className="font-medium">{s.type}</span> — {s.result}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.date}</p>
                      {s.notes && <p className="text-sm text-muted-foreground mt-1">{s.notes}</p>}
                    </div>
                  </div>
                </Card>
              ))}
              {filterBySearch(screenings).length === 0 && <p className="text-muted-foreground text-center py-8">No screenings found</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="visits">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <p className="text-muted-foreground">{visits.length} visit(s)</p>
            <Button onClick={() => setShowVisitForm(true)}>
              <Plus className="w-4 h-4 mr-2" />New Visit
            </Button>
          </div>

          {showVisitForm && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-4">New Nurse Visit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Student Name" value={visitForm.studentName} onChange={(e) => setVisitForm({ ...visitForm, studentName: e.target.value })} />
                <Input type="date" value={visitForm.date} onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })} />
                <Input type="time" value={visitForm.time} onChange={(e) => setVisitForm({ ...visitForm, time: e.target.value })} />
                <Input placeholder="Reason" value={visitForm.reason} onChange={(e) => setVisitForm({ ...visitForm, reason: e.target.value })} />
                <Input placeholder="Treatment" value={visitForm.treatment} onChange={(e) => setVisitForm({ ...visitForm, treatment: e.target.value })} />
                <Input placeholder="Nurse" value={visitForm.nurse} onChange={(e) => setVisitForm({ ...visitForm, nurse: e.target.value })} />
                <select value={visitForm.status} onChange={(e) => setVisitForm({ ...visitForm, status: e.target.value })} className="px-3 py-2 rounded-lg border bg-background">
                  <option value="completed">Completed</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="referred">Referred</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateVisit}>Create</Button>
                <Button variant="outline" onClick={() => setShowVisitForm(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : (
            <div className="space-y-3">
              {filterBySearch(visits).map(v => (
                <Card key={v.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Stethoscope className="w-5 h-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">{v.studentName}</h4>
                        <p className="text-sm"><span className="font-medium">Reason:</span> {v.reason}</p>
                        <p className="text-sm text-muted-foreground"><span className="font-medium">Treatment:</span> {v.treatment}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{v.date}</span>
                          <span>{v.time}</span>
                          <span>{v.nurse}</span>
                        </div>
                      </div>
                    </div>
                    {statusBadge(v.status)}
                  </div>
                </Card>
              ))}
              {filterBySearch(visits).length === 0 && <p className="text-muted-foreground text-center py-8">No nurse visits found</p>}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
