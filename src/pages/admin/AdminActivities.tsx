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
  Trophy, Users, GraduationCap, BookOpen, Vote, Bus, Utensils, Star,
  ClipboardCheck, Activity, Calendar, Plus, Search, Filter, CheckCircle,
  XCircle, Eye, Edit2, Trash2, UserPlus, UserMinus, HandMetal, Clock, Award
} from 'lucide-react';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  advisor: string;
  meetingSchedule: string;
  memberCount: number;
  members?: { id: string; name: string }[];
}

interface ClubActivity {
  id: string;
  clubId: string;
  clubName: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

interface FieldTrip {
  id: string;
  title: string;
  destination: string;
  date: string;
  departureTime: string;
  returnTime: string;
  cost: number;
  status: string;
  consentCount: number;
  totalStudents: number;
}

interface Election {
  id: string;
  title: string;
  position: string;
  status: string;
  startDate: string;
  endDate: string;
  candidates: Candidate[];
  totalVotes: number;
}

interface Candidate {
  id: string;
  name: string;
  manifesto: string;
  votes: number;
}

interface ServiceHour {
  id: string;
  studentName: string;
  organization: string;
  hours: number;
  date: string;
  description: string;
  verified: boolean;
}

export default function AdminActivities() {
  const [activeTab, setActiveTab] = useState('clubs');
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activities & Events</h1>
        <p className="text-muted-foreground">Manage clubs, field trips, elections, and service hours</p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="clubs"><Trophy className="w-4 h-4 mr-1" />Clubs</TabsTrigger>
          <TabsTrigger value="field-trips"><Bus className="w-4 h-4 mr-1" />Field Trips</TabsTrigger>
          <TabsTrigger value="elections"><Vote className="w-4 h-4 mr-1" />Elections</TabsTrigger>
          <TabsTrigger value="service-hours"><Clock className="w-4 h-4 mr-1" />Service Hours</TabsTrigger>
        </TabsList>
        <TabsContent value="clubs"><ClubsTab /></TabsContent>
        <TabsContent value="field-trips"><FieldTripsTab /></TabsContent>
        <TabsContent value="elections"><ElectionsTab /></TabsContent>
        <TabsContent value="service-hours"><ServiceHoursTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ClubsTab() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activities, setActivities] = useState<ClubActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', category: '', advisor: '', meetingSchedule: '' });
  const [showMembers, setShowMembers] = useState<Club | null>(null);
  const [memberInput, setMemberInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [c, a] = await Promise.all([api.getClubsExtended(), api.getClubActivities()]);
      setClubs(Array.isArray(c) ? c : []);
      setActivities(Array.isArray(a) ? a : []);
    } catch { setError('Failed to load clubs'); }
    finally { setLoading(false); }
  };

  const filtered = clubs.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.advisor.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) await api.updateClubExtended(editingId, formData);
      else await api.createClubExtended(formData);
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', category: '', advisor: '', meetingSchedule: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleAddMember = async () => {
    if (!showMembers || !memberInput.trim()) return;
    try {
      await api.addClubMember(showMembers.id, memberInput.trim());
      setMemberInput('');
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleRemoveMember = async (studentId: string) => {
    if (!showMembers) return;
    try {
      await api.removeClubMember(showMembers.id, studentId);
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
          <Input placeholder="Search clubs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', description: '', category: '', advisor: '', meetingSchedule: '' }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Club
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(c => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="font-semibold">{c.name}</h4>
                  <p className="text-xs text-muted-foreground">{c.category} • {c.advisor}</p>
                </div>
              </div>
              <Badge variant="info">{c.memberCount} members</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{c.description}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Calendar className="w-3 h-3" />{c.meetingSchedule}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowMembers(c)}>
                <Users className="w-3 h-3 mr-1" />Members
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingId(c.id); setFormData({ name: c.name, description: c.description, category: c.category, advisor: c.advisor, meetingSchedule: c.meetingSchedule }); setShowForm(true); }}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No clubs found</p>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingId ? 'Edit Club' : 'Add Club'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Advisor</label>
              <Input value={formData.advisor} onChange={e => setFormData(f => ({ ...f, advisor: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Meeting Schedule</label>
            <Input value={formData.meetingSchedule} onChange={e => setFormData(f => ({ ...f, meetingSchedule: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!showMembers} onClose={() => setShowMembers(null)} title={`${showMembers?.name || ''} - Members`}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Student ID..." value={memberInput} onChange={e => setMemberInput(e.target.value)} />
            <Button size="sm" onClick={handleAddMember}><UserPlus className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {showMembers?.members?.map(m => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/50">
                <span className="text-sm">{m.name}</span>
                <Button size="sm" variant="ghost" onClick={() => handleRemoveMember(m.id)}>
                  <UserMinus className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
            {(!showMembers?.members || showMembers.members.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FieldTripsTab() {
  const [trips, setTrips] = useState<FieldTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', destination: '', date: '', departureTime: '', returnTime: '', cost: 0, status: 'planned' });
  const [consentStudentId, setConsentStudentId] = useState('');
  const [consentTripId, setConsentTripId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getFieldTrips(); setTrips(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load field trips'); }
    finally { setLoading(false); }
  };

  const filtered = trips.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) await api.updateFieldTrip(editingId, formData);
      else await api.createFieldTrip(formData);
      setShowForm(false);
      setEditingId(null);
      setFormData({ title: '', destination: '', date: '', departureTime: '', returnTime: '', cost: 0, status: 'planned' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleConsent = async () => {
    if (!consentTripId || !consentStudentId.trim()) return;
    try {
      await api.recordFieldTripConsent(consentTripId, consentStudentId.trim());
      setConsentStudentId('');
      setConsentTripId(null);
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
          <Input placeholder="Search trips..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ title: '', destination: '', date: '', departureTime: '', returnTime: '', cost: 0, status: 'planned' }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Trip
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map(t => (
          <Card key={t.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Bus className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="font-semibold">{t.title}</h4>
                  <p className="text-sm text-muted-foreground">{t.destination}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</span>
                    <span>{t.departureTime} - {t.returnTime}</span>
                    <span>${t.cost}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={t.status === 'completed' ? 'success' : t.status === 'cancelled' ? 'destructive' : 'info'}>{t.status}</Badge>
                <span className="text-xs text-muted-foreground">{t.consentCount}/{t.totalStudents} consent</span>
                <Button size="sm" variant="ghost" onClick={() => { setConsentTripId(t.id); }}>
                  <ClipboardCheck className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(t.id); setFormData({ title: t.title, destination: t.destination, date: t.date, departureTime: t.departureTime, returnTime: t.returnTime, cost: t.cost, status: t.status }); setShowForm(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No field trips found</p>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingId ? 'Edit Field Trip' : 'Add Field Trip'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Destination</label>
              <Input value={formData.destination} onChange={e => setFormData(f => ({ ...f, destination: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <Input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Departure</label>
              <Input type="time" value={formData.departureTime} onChange={e => setFormData(f => ({ ...f, departureTime: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Return</label>
              <Input type="time" value={formData.returnTime} onChange={e => setFormData(f => ({ ...f, returnTime: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cost ($)</label>
              <Input type="number" value={formData.cost || ''} onChange={e => setFormData(f => ({ ...f, cost: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="planned">Planned</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!consentTripId} onClose={() => setConsentTripId(null)} title="Record Consent">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Student ID</label>
            <Input placeholder="Enter student ID..." value={consentStudentId} onChange={e => setConsentStudentId(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConsentTripId(null)}>Cancel</Button>
            <Button onClick={handleConsent}>Record Consent</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ElectionsTab() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', position: '', startDate: '', endDate: '' });
  const [showNominate, setShowNominate] = useState<Election | null>(null);
  const [nominateData, setNominateData] = useState({ name: '', manifesto: '' });
  const [showVote, setShowVote] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [voterId, setVoterId] = useState('');
  const [showResults, setShowResults] = useState<Election | null>(null);
  const [results, setResults] = useState<Candidate[]>([]);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getElections(); setElections(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load elections'); }
    finally { setLoading(false); }
  };

  const filtered = elections.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      setError('');
      await api.createElection(formData);
      setShowForm(false);
      setFormData({ title: '', position: '', startDate: '', endDate: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleNominate = async () => {
    if (!showNominate) return;
    try {
      setError('');
      await api.nominateCandidate(showNominate.id, nominateData);
      setShowNominate(null);
      setNominateData({ name: '', manifesto: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleVote = async () => {
    if (!showVote || !selectedCandidate || !voterId.trim()) return;
    try {
      setError('');
      await api.castVote(showVote.id, { candidateId: selectedCandidate, voterId: voterId.trim() });
      setShowVote(null);
      setSelectedCandidate('');
      setVoterId('');
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleResults = async (election: Election) => {
    try {
      setError('');
      const r = await api.getElectionResults(election.id);
      setResults(Array.isArray(r) ? r : []);
      setShowResults(election);
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search elections..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Create Election</Button>
      </div>

      <div className="space-y-3">
        {filtered.map(e => (
          <Card key={e.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Vote className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="font-semibold">{e.title}</h4>
                  <p className="text-sm text-muted-foreground">{e.position}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{e.startDate ? new Date(e.startDate).toLocaleDateString() : ''} - {e.endDate ? new Date(e.endDate).toLocaleDateString() : ''}</span>
                    <span>{e.totalVotes} votes</span>
                    <span>{e.candidates?.length || 0} candidates</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={e.status === 'active' ? 'success' : e.status === 'completed' ? 'info' : 'warning'}>{e.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => { setShowNominate(e); setNominateData({ name: '', manifesto: '' }); }}>
                  <UserPlus className="w-3 h-3 mr-1" />Nominate
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setShowVote(e); setSelectedCandidate(''); setVoterId(''); }}>
                  <CheckCircle className="w-3 h-3 mr-1" />Vote
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleResults(e)}>
                  <Award className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No elections found</p>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Election">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Position</label>
            <Input value={formData.position} onChange={e => setFormData(f => ({ ...f, position: e.target.value }))} />
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
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!showNominate} onClose={() => setShowNominate(null)} title={`Nominate - ${showNominate?.title || ''}`}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Candidate Name</label>
            <Input value={nominateData.name} onChange={e => setNominateData(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Manifesto</label>
            <Textarea value={nominateData.manifesto} onChange={e => setNominateData(f => ({ ...f, manifesto: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowNominate(null)}>Cancel</Button>
            <Button onClick={handleNominate}>Nominate</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!showVote} onClose={() => setShowVote(null)} title={`Cast Vote - ${showVote?.title || ''}`}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Voter ID</label>
            <Input placeholder="Enter voter ID..." value={voterId} onChange={e => setVoterId(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Select Candidate</label>
            <div className="space-y-2 mt-1">
              {showVote?.candidates?.map(c => (
                <label key={c.id} className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-accent/50">
                  <input type="radio" name="candidate" value={c.id} checked={selectedCandidate === c.id} onChange={e => setSelectedCandidate(e.target.value)} className="accent-orange-500" />
                  <div>
                    <span className="text-sm font-medium">{c.name}</span>
                    {c.manifesto && <p className="text-xs text-muted-foreground">{c.manifesto}</p>}
                  </div>
                </label>
              ))}
              {(!showVote?.candidates || showVote.candidates.length === 0) && (
                <p className="text-sm text-muted-foreground">No candidates yet</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowVote(null)}>Cancel</Button>
            <Button onClick={handleVote} disabled={!selectedCandidate || !voterId.trim()}>Cast Vote</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!showResults} onClose={() => setShowResults(null)} title={`Results - ${showResults?.title || ''}`} size="lg">
        <div className="space-y-4">
          {results.map((c, i) => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-orange-500">#{i + 1}</span>
                <div>
                  <p className="font-medium">{c.name}</p>
                  {c.manifesto && <p className="text-xs text-muted-foreground">{c.manifesto}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{c.votes}</p>
                <p className="text-xs text-muted-foreground">votes</p>
              </div>
            </div>
          ))}
          {results.length === 0 && <p className="text-center text-muted-foreground py-4">No results available</p>}
        </div>
      </Modal>
    </div>
  );
}

function ServiceHoursTab() {
  const [hours, setHours] = useState<ServiceHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ studentName: '', organization: '', hours: 0, date: '', description: '', verified: false });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getServiceHours(); setHours(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load service hours'); }
    finally { setLoading(false); }
  };

  const filtered = hours.filter(h =>
    h.studentName.toLowerCase().includes(search.toLowerCase()) ||
    h.organization.toLowerCase().includes(search.toLowerCase())
  );

  const totalHours = filtered.reduce((sum, h) => sum + h.hours, 0);

  const handleSubmit = async () => {
    try {
      setError('');
      await api.logServiceHours(formData);
      setShowForm(false);
      setFormData({ studentName: '', organization: '', hours: 0, date: '', description: '', verified: false });
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
          <Input placeholder="Search service hours..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Log Hours</Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Clock className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-2xl font-bold">{totalHours}</p>
            <p className="text-sm text-muted-foreground">Total Service Hours</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.map(h => (
          <Card key={h.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="font-semibold">{h.studentName}</h4>
                  <p className="text-sm text-muted-foreground">{h.organization}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{h.date ? new Date(h.date).toLocaleDateString() : 'N/A'}</span>
                    {h.description && <span>{h.description}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={h.verified ? 'success' : 'warning'}>{h.verified ? 'Verified' : 'Pending'}</Badge>
                <span className="text-lg font-bold text-orange-500">{h.hours}h</span>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No service hours found</p>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Log Service Hours">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Student Name</label>
              <Input value={formData.studentName} onChange={e => setFormData(f => ({ ...f, studentName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Organization</label>
              <Input value={formData.organization} onChange={e => setFormData(f => ({ ...f, organization: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Hours</label>
              <Input type="number" value={formData.hours || ''} onChange={e => setFormData(f => ({ ...f, hours: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formData.verified} onChange={e => setFormData(f => ({ ...f, verified: e.target.checked }))} className="accent-orange-500" />
            <label className="text-sm font-medium">Verified</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Log Hours</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
