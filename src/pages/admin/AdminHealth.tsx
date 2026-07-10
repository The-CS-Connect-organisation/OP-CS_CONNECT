import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { BottomSheet, PickerSheet } from '../../components/ui/BottomSheet';
import {
  Stethoscope,
  Syringe,
  FileText,
  Activity,
  Plus,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  Filter,
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  class?: string;
}

interface Incident {
  id: string;
  studentName: string;
  studentId: string;
  reason: string;
  reasonNote: string;
  assistanceGiven: string;
  hospitalName: string;
  hospitalContact: string;
  status: string;
  timestamp: string;
  staffName: string;
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

type SubSection = 'incidents' | 'immunisations' | 'ieps' | 'screenings';

const REASONS = ['Fever', 'Injury', 'Allergy', 'Checkup', 'Other'] as const;
const STATUS_OPTIONS = ['Resolved', 'Under Observation', 'Referred', 'Follow-up Needed'] as const;

export default function AdminHealth() {
  const user = useAuthStore((s) => s.user);
  const [isMobile, setIsMobile] = useState(false);

  const [loading, setLoading] = useState(true);
  const [subSection, setSubSection] = useState<SubSection>('incidents');
  const [students, setStudents] = useState<Student[]>([]);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [immunisations, setImmunisations] = useState<Immunisation[]>([]);
  const [ieps, setIeps] = useState<IEP[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    reason: 'Fever',
    reasonNote: '',
    assistanceGiven: '',
    hospitalName: '',
    hospitalContact: '',
    status: 'Resolved',
  });

  // filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // mobile picker sheets
  const [showSubNavSheet, setShowSubNavSheet] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showReasonPicker, setShowReasonPicker] = useState(false);
  const [showFormStudentPicker, setShowFormStudentPicker] = useState(false);
  const [showFormReasonPicker, setShowFormReasonPicker] = useState(false);
  const [showFormStatusPicker, setShowFormStatusPicker] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [studs, recs, imm, iepData, scr] = await Promise.all([
        api.getStudents().catch(() => []),
        api.getHealthRecords().catch(() => []),
        api.getImmunisations().catch(() => []),
        api.getIEPs().catch(() => []),
        api.getScreenings().catch(() => []),
      ]);
      setStudents(Array.isArray(studs) ? studs : []);
      setIncidents(Array.isArray(recs) ? mapToIncidents(recs) : []);
      setImmunisations(Array.isArray(imm) ? imm : []);
      setIeps(Array.isArray(iepData) ? iepData : []);
      setScreenings(Array.isArray(scr) ? scr : []);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const mapToIncidents = (data: any[]): Incident[] =>
    data.map((r: any) => ({
      id: r.id || crypto.randomUUID(),
      studentName: r.studentName || r.student_name || '',
      studentId: r.studentId || r.student_id || '',
      reason: r.reason || r.condition || '',
      reasonNote: r.reasonNote || r.reason_note || '',
      assistanceGiven: r.assistanceGiven || r.assistance_given || r.medication || '',
      hospitalName: r.hospitalName || r.hospital_name || '',
      hospitalContact: r.hospitalContact || r.hospital_contact || '',
      status: r.status || 'Resolved',
      timestamp: r.timestamp || r.createdAt || r.created_at || new Date().toISOString(),
      staffName: r.staffName || r.staff_name || r.nurse || '',
    }));

  const handleCreateIncident = async () => {
    const student = students.find((s) => s.id === form.studentId);
    const payload = {
      studentName: student?.name || '',
      studentId: form.studentId,
      reason: form.reason,
      reasonNote: form.reasonNote,
      assistanceGiven: form.assistanceGiven,
      hospitalName: form.hospitalName,
      hospitalContact: form.hospitalContact,
      status: form.status,
      timestamp: new Date().toISOString(),
      staffName: user?.name || '',
    };
    try {
      const created = await api.createHealthRecord(payload);
      setIncidents((prev) => [mapToIncidents([created])[0] || { ...payload, id: crypto.randomUUID() }, ...prev]);
      setShowForm(false);
      resetForm();
    } catch {
      setIncidents((prev) => [{ ...payload, id: crypto.randomUUID() }, ...prev]);
      setShowForm(false);
      resetForm();
    }
  };

  const resetForm = () =>
    setForm({ studentId: '', reason: 'Fever', reasonNote: '', assistanceGiven: '', hospitalName: '', hospitalContact: '', status: 'Resolved' });

  const openForm = () => {
    resetForm();
    setShowForm(true);
  };

  const filteredIncidents = incidents.filter((i) => {
    if (search && !i.studentName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && i.status !== statusFilter) return false;
    if (reasonFilter && i.reason !== reasonFilter) return false;
    if (dateFilter) {
      const d = new Date(i.timestamp).toISOString().slice(0, 10);
      if (d !== dateFilter) return false;
    }
    return true;
  });

  const filterBySearch = <T extends { studentName?: string }>(items: T[]): T[] =>
    items.filter((i) => i.studentName?.toLowerCase().includes(search.toLowerCase()));

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Resolved: 'success',
      'Under Observation': 'warning',
      Referred: 'destructive',
      'Follow-up Needed': 'warning',
      active: 'success',
      inactive: 'secondary',
      completed: 'success',
    };
    return <Badge variant={(map[status] || 'default') as any}>{status}</Badge>;
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const subNavItems: { key: SubSection; label: string; icon: React.ReactNode }[] = [
    { key: 'incidents', label: 'Incident Log', icon: <Stethoscope className="w-4 h-4 shrink-0" /> },
    { key: 'immunisations', label: 'Immunisations', icon: <Syringe className="w-4 h-4 shrink-0" /> },
    { key: 'ieps', label: 'IEP Plans', icon: <FileText className="w-4 h-4 shrink-0" /> },
    { key: 'screenings', label: 'Screenings', icon: <Activity className="w-4 h-4 shrink-0" /> },
  ];

  const currentSubNav = subNavItems.find((i) => i.key === subSection);
  const selectedStudent = students.find((s) => s.id === form.studentId);

  // --- shared form content (used by both Modal and BottomSheet) ---
  const formContent = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Student *</label>
        {isMobile ? (
          <>
            <button
              onClick={() => setShowFormStudentPicker(true)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm flex items-center justify-between"
            >
              <span className={selectedStudent ? '' : 'text-muted-foreground'}>
                {selectedStudent ? `${selectedStudent.name}${selectedStudent.class ? ` (${selectedStudent.class})` : ''}` : 'Select student...'}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
            <PickerSheet
              isOpen={showFormStudentPicker}
              onClose={() => setShowFormStudentPicker(false)}
              title="Select Student"
              options={students.map((s) => ({ label: `${s.name}${s.class ? ` (${s.class})` : ''}`, value: s.id }))}
              value={form.studentId}
              onChange={(v) => setForm({ ...form, studentId: v })}
            />
          </>
        ) : (
          <select
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select student...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}{s.class ? ` (${s.class})` : ''}</option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Reason / Complaint *</label>
        {isMobile ? (
          <>
            <button
              onClick={() => setShowFormReasonPicker(true)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm flex items-center justify-between"
            >
              <span>{form.reason}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
            <PickerSheet
              isOpen={showFormReasonPicker}
              onClose={() => setShowFormReasonPicker(false)}
              title="Select Reason"
              options={[...REASONS]}
              value={form.reason}
              onChange={(v) => setForm({ ...form, reason: v })}
            />
          </>
        ) : (
          <select
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Additional note (optional)</label>
        <Input
          placeholder="e.g. mild fever since morning"
          value={form.reasonNote}
          onChange={(e) => setForm({ ...form, reasonNote: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Assistance Given</label>
        <Textarea
          placeholder="e.g. first aid, medication given, rest, sent home..."
          value={form.assistanceGiven}
          onChange={(e) => setForm({ ...form, assistanceGiven: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Hospital Referral (optional)</label>
        <Input
          placeholder="Hospital name"
          value={form.hospitalName}
          onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
        />
        {form.hospitalName && (
          <Input
            placeholder="Doctor / Contact"
            value={form.hospitalContact}
            onChange={(e) => setForm({ ...form, hospitalContact: e.target.value })}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Status *</label>
        {isMobile ? (
          <>
            <button
              onClick={() => setShowFormStatusPicker(true)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm flex items-center justify-between"
            >
              <span>{form.status}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
            <PickerSheet
              isOpen={showFormStatusPicker}
              onClose={() => setShowFormStatusPicker(false)}
              title="Select Status"
              options={[...STATUS_OPTIONS]}
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
            />
          </>
        ) : (
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
        <span>Staff: <strong>{user?.name || 'Unknown'}</strong></span>
        <span>Date: <strong>{new Date().toLocaleDateString('en-IN')}</strong></span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button onClick={handleCreateIncident} disabled={!form.studentId} className="w-full sm:w-auto">
          Log Incident
        </Button>
        <Button variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto">
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-w-0 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold">Health Services</h1>
        <p className="text-sm text-muted-foreground">Health incident log & records</p>
      </div>

      {/* secondary navigation buttons (desktop) */}
      <div className="hidden sm:flex items-center gap-1 overflow-x-auto flex-nowrap scrollbar-thin pb-px">
        {subNavItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setSubSection(item.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              subSection === item.key
                ? 'bg-orange-500/10 text-orange-600'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* mobile secondary nav as bottom sheet trigger */}
      <div className="sm:hidden">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setShowSubNavSheet(true)}
        >
          <span className="flex items-center gap-2">
            {currentSubNav?.icon}
            {currentSubNav?.label}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
        <BottomSheet
          isOpen={showSubNavSheet}
          onClose={() => setShowSubNavSheet(false)}
          title="Select Section"
        >
          <div className="space-y-1">
            {subNavItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setSubSection(item.key); setShowSubNavSheet(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                  subSection === item.key
                    ? 'bg-orange-500/10 text-orange-600 font-medium'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </BottomSheet>
      </div>

      {subSection === 'incidents' && (
        <>
          {/* filters + new button */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by student name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={openForm} className="shrink-0">
                <Plus className="w-4 h-4 mr-1.5" />
                New Record
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              {/* status filter */}
              {isMobile ? (
                <>
                  <button
                    onClick={() => setShowStatusPicker(true)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs min-w-0 max-w-[130px] flex items-center gap-1"
                  >
                    <span className="truncate">{statusFilter || 'All Status'}</span>
                    <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
                  </button>
                  <PickerSheet
                    isOpen={showStatusPicker}
                    onClose={() => setShowStatusPicker(false)}
                    title="Filter by Status"
                    options={['', ...STATUS_OPTIONS]}
                    value={statusFilter}
                    onChange={(v) => setStatusFilter(v)}
                  />
                </>
              ) : (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs min-w-0 max-w-[130px]"
                >
                  <option value="">All Status</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
              {/* reason filter */}
              {isMobile ? (
                <>
                  <button
                    onClick={() => setShowReasonPicker(true)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs min-w-0 max-w-[120px] flex items-center gap-1"
                  >
                    <span className="truncate">{reasonFilter || 'All Reasons'}</span>
                    <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
                  </button>
                  <PickerSheet
                    isOpen={showReasonPicker}
                    onClose={() => setShowReasonPicker(false)}
                    title="Filter by Reason"
                    options={['', ...REASONS]}
                    value={reasonFilter}
                    onChange={(v) => setReasonFilter(v)}
                  />
                </>
              ) : (
                <select
                  value={reasonFilter}
                  onChange={(e) => setReasonFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs min-w-0 max-w-[120px]"
                >
                  <option value="">All Reasons</option>
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              )}
              <div className="relative min-w-0 max-w-[150px]">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
              {(search || statusFilter || reasonFilter || dateFilter) && (
                <button
                  onClick={() => { setSearch(''); setStatusFilter(''); setReasonFilter(''); setDateFilter(''); }}
                  className="text-orange-600 hover:underline text-xs whitespace-nowrap"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
          ) : filteredIncidents.length === 0 ? (
            <p className="text-muted-foreground text-center py-12 text-sm">No incidents found</p>
          ) : (
            <div className="space-y-3">
              {filteredIncidents.map((inc) => (
                <Card key={inc.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm sm:text-base truncate min-w-0">{inc.studentName}</h4>
                      {statusBadge(inc.status)}
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs sm:text-sm">
                      <span className="font-medium text-muted-foreground shrink-0">Reason:</span>
                      <span>{inc.reason}</span>
                      {inc.reasonNote && (
                        <span className="text-muted-foreground truncate min-w-0">&mdash; {inc.reasonNote}</span>
                      )}
                    </div>
                    {inc.assistanceGiven && (
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs sm:text-sm">
                        <span className="font-medium text-muted-foreground shrink-0">Assistance:</span>
                        <span className="text-muted-foreground truncate min-w-0">{inc.assistanceGiven}</span>
                      </div>
                    )}
                    {inc.hospitalName && (
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs sm:text-sm">
                        <span className="font-medium text-muted-foreground shrink-0">Referred to:</span>
                        <span className="text-muted-foreground truncate min-w-0">{inc.hospitalName}</span>
                        {inc.hospitalContact && <span className="text-muted-foreground">({inc.hospitalContact})</span>}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1 border-t border-border/50 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {formatDate(inc.timestamp)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 shrink-0" />
                        {formatTime(inc.timestamp)}
                      </span>
                      {inc.staffName && <span>by {inc.staffName}</span>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* new incident - bottom sheet on mobile, modal on desktop */}
          {isMobile ? (
            <BottomSheet
              isOpen={showForm}
              onClose={() => setShowForm(false)}
              title="New Health Incident"
            >
              {formContent}
            </BottomSheet>
          ) : (
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Health Incident" size="md">
              {formContent}
            </Modal>
          )}
        </>
      )}

      {subSection === 'immunisations' && (
        <ImmunisationsView
          loading={loading}
          items={immunisations}
          search={search}
          onSearch={setSearch}
          filterBySearch={filterBySearch}
          statusBadge={statusBadge}
        />
      )}

      {subSection === 'ieps' && (
        <IEPsView
          loading={loading}
          items={ieps}
          search={search}
          onSearch={setSearch}
          filterBySearch={filterBySearch}
          statusBadge={statusBadge}
        />
      )}

      {subSection === 'screenings' && (
        <ScreeningsView
          loading={loading}
          items={screenings}
          search={search}
          onSearch={setSearch}
          filterBySearch={filterBySearch}
        />
      )}
    </div>
  );
}

function ImmunisationsView({
  loading,
  items,
  search,
  onSearch,
  filterBySearch,
  statusBadge,
}: {
  loading: boolean;
  items: Immunisation[];
  search: string;
  onSearch: (v: string) => void;
  filterBySearch: <T extends { studentName?: string }>(items: T[]) => T[];
  statusBadge: (s: string) => React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-muted-foreground">{items.length} immunisation(s)</p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Search..." value={search} onChange={(e) => onSearch(e.target.value)} className="pl-10" />
      </div>
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : filterBySearch(items).length === 0 ? (
        <p className="text-muted-foreground text-center py-12 text-sm">No immunisations found</p>
      ) : (
        <div className="space-y-3">
          {filterBySearch(items).map((i) => (
            <Card key={i.id} className="p-4">
              <div className="flex items-start justify-between gap-2 flex-wrap min-w-0">
                <div className="flex items-start gap-3 min-w-0">
                  <Syringe className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm truncate">{i.studentName}</h4>
                    <p className="text-xs sm:text-sm truncate"><span className="font-medium">{i.vaccine}</span> — {i.dose}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span>Given: {i.dateGiven}</span>
                      {i.nextDue && <span>Next: {i.nextDue}</span>}
                      <span className="truncate">By: {i.administeredBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function IEPsView({
  loading,
  items,
  search,
  onSearch,
  filterBySearch,
  statusBadge,
}: {
  loading: boolean;
  items: IEP[];
  search: string;
  onSearch: (v: string) => void;
  filterBySearch: <T extends { studentName?: string }>(items: T[]) => T[];
  statusBadge: (s: string) => React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-muted-foreground">{items.length} IEP(s)</p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Search..." value={search} onChange={(e) => onSearch(e.target.value)} className="pl-10" />
      </div>
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : filterBySearch(items).length === 0 ? (
        <p className="text-muted-foreground text-center py-12 text-sm">No IEPs found</p>
      ) : (
        <div className="space-y-3">
          {filterBySearch(items).map((i) => (
            <Card key={i.id} className="p-4">
              <div className="flex items-start justify-between gap-2 flex-wrap min-w-0">
                <div className="flex items-start gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm truncate">{i.studentName}</h4>
                    <p className="text-xs sm:text-sm"><span className="font-medium">Condition:</span> {i.disability}</p>
                    <p className="text-xs text-muted-foreground truncate"><span className="font-medium">Accommodations:</span> {i.accommodations}</p>
                    <p className="text-xs text-muted-foreground truncate"><span className="font-medium">Goals:</span> {i.goals}</p>
                    <p className="text-xs text-muted-foreground mt-1">Review: {i.reviewDate}</p>
                  </div>
                </div>
                <div className="shrink-0">{statusBadge(i.status)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ScreeningsView({
  loading,
  items,
  search,
  onSearch,
  filterBySearch,
}: {
  loading: boolean;
  items: Screening[];
  search: string;
  onSearch: (v: string) => void;
  filterBySearch: <T extends { studentName?: string }>(items: T[]) => T[];
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-muted-foreground">{items.length} screening(s)</p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Search..." value={search} onChange={(e) => onSearch(e.target.value)} className="pl-10" />
      </div>
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : filterBySearch(items).length === 0 ? (
        <p className="text-muted-foreground text-center py-12 text-sm">No screenings found</p>
      ) : (
        <div className="space-y-3">
          {filterBySearch(items).map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start gap-3 min-w-0">
                <Activity className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm truncate">{s.studentName}</h4>
                  <p className="text-xs sm:text-sm truncate"><span className="font-medium">{s.type}</span> — {s.result}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.date}</p>
                  {s.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{s.notes}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
