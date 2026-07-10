import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { BottomSheet, PickerSheet } from '../../components/ui/BottomSheet';
import {
  Trophy, Medal, Users, Shirt, Stethoscope, GraduationCap,
  Plus, Search, Edit2, CheckCircle, XCircle, UserPlus, UserMinus,
  Dumbbell, Footprints, Award, Flag, CalendarDays, MapPin,
  ChevronDown, Filter, Star,
} from 'lucide-react';

interface Student {
  id: string; name: string; firstName?: string; lastName?: string;
  class?: string | { name: string }; rollNo?: number;
}
interface SportProgramme {
  id: string; name: string; sport: string; description: string; season: string; status: string;
}
interface Team {
  id: string; name: string; sport: string; programmeId: string; ageGroup: string;
  roster: { id: string; name: string; position: string }[];
}
interface Game {
  id: string; homeTeam: string; awayTeam: string; date: string; location: string;
  homeScore?: number; awayScore?: number; status: string;
}
interface Coach {
  id: string; name: string; sport: string; email: string; phone: string; certification: string;
}
interface EquipmentItem {
  id: string; name: string; category: string; quantity: number; condition: string; notes: string;
}
interface Injury {
  id: string; playerName: string; injuryType: string; date: string; severity: string; status: string; notes: string;
}
interface MedicalClearance {
  id: string; playerName: string; clearanceDate: string; expiryDate: string; clearedBy: string; notes: string;
}
interface SportEvent {
  id: string; name: string; sport: string; date: string; venue: string;
  allottedAthletes: { studentId: string; name: string }[];
}
interface Award {
  id: string; studentName: string; sport: string; awardName: string; date: string; level: string; notes: string;
}

type SubSection = 'athletes' | 'programmes' | 'events' | 'awards' | 'equipment' | 'medical' | 'stats';

export default function AdminAthletics() {
  const [isMobile, setIsMobile] = useState(false);
  const [subSection, setSubSection] = useState<SubSection>('athletes');
  const [showSubNavSheet, setShowSubNavSheet] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const subNavItems: { key: SubSection; label: string; icon: React.ReactNode }[] = [
    { key: 'athletes', label: 'Athlete Profiles', icon: <Users className="w-4 h-4 shrink-0" /> },
    { key: 'programmes', label: 'Programmes & Teams', icon: <Trophy className="w-4 h-4 shrink-0" /> },
    { key: 'events', label: 'Events & Allotment', icon: <CalendarDays className="w-4 h-4 shrink-0" /> },
    { key: 'awards', label: 'Awards', icon: <Star className="w-4 h-4 shrink-0" /> },
    { key: 'equipment', label: 'Equipment', icon: <Dumbbell className="w-4 h-4 shrink-0" /> },
    { key: 'medical', label: 'Medical', icon: <Stethoscope className="w-4 h-4 shrink-0" /> },
    { key: 'stats', label: 'Statistics', icon: <Award className="w-4 h-4 shrink-0" /> },
  ];

  const currentSubNav = subNavItems.find((i) => i.key === subSection);

  return (
    <div className="min-w-0 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold">Athletics Management</h1>
        <p className="text-sm text-muted-foreground">Athlete profiles, events, awards, equipment and more</p>
      </div>

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

      <div className="sm:hidden">
        <Button variant="outline" className="w-full justify-between" onClick={() => setShowSubNavSheet(true)}>
          <span className="flex items-center gap-2">
            {currentSubNav?.icon}
            {currentSubNav?.label}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
        <BottomSheet isOpen={showSubNavSheet} onClose={() => setShowSubNavSheet(false)} title="Select Section">
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

      {subSection === 'athletes' && <AthletesSection />}
      {subSection === 'programmes' && <ProgrammesSection />}
      {subSection === 'events' && <EventsSection />}
      {subSection === 'awards' && <AwardsSection />}
      {subSection === 'equipment' && <EquipmentSection />}
      {subSection === 'medical' && <MedicalSection />}
      {subSection === 'stats' && <StatsSection />}
    </div>
  );
}

function AthletesSection() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [s, t] = await Promise.all([api.getStudents().catch(() => []), api.getTeams().catch(() => [])]);
      const mapped = (Array.isArray(s) ? s : []).map((stu: any) => ({
        id: stu.id,
        name: stu.name || `${stu.firstName || ''} ${stu.lastName || ''}`.trim(),
        firstName: stu.firstName,
        lastName: stu.lastName,
        class: stu.class,
        rollNo: stu.rollNo,
      }));
      setStudents(mapped);
      setTeams(Array.isArray(t) ? t : []);
    } catch {
      //
    } finally { setLoading(false); }
  };

  const getStudentSports = (studentId: string): string[] => {
    const sports = new Set<string>();
    teams.forEach(t => {
      if (t.roster?.some(r => r.id === studentId)) sports.add(t.sport);
    });
    return Array.from(sports);
  };

  const getStudentTeams = (studentId: string): Team[] =>
    teams.filter(t => t.roster?.some(r => r.id === studentId));

  const athleteCount = teams.reduce((acc, t) => acc + (t.roster?.length || 0), 0);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getStudentSports(s.id).some(sp => sp.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="text-xs sm:text-sm text-muted-foreground">
        {students.length} student(s) · {athleteCount} athlete(s) in teams
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Search by name or sport..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
      </div>
      <div className="space-y-3">
        {filtered.map(s => {
          const sports = getStudentSports(s.id);
          const studentTeams = getStudentTeams(s.id);
          return (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold truncate">{s.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {typeof s.class === 'object' && s.class ? (s.class as any).name : s.class || 'N/A'}
                      {s.rollNo ? ` · Roll ${s.rollNo}` : ''}
                    </p>
                    {sports.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {sports.map(sp => <Badge key={sp} variant="outline" className="text-xs">{sp}</Badge>)}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1.5">Not assigned to any team</p>
                    )}
                    {studentTeams.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Teams: {studentTeams.map(t => t.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No students found</p>}
      </div>
    </div>
  );
}

function ProgrammesSection() {
  const [programmes, setProgrammes] = useState<SportProgramme[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', sport: '', description: '', season: '', status: 'active' });
  const [error, setError] = useState('');

  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', sport: '', programmeId: '', ageGroup: '' });
  const [teamEditId, setTeamEditId] = useState<string | null>(null);
  const [rosterTeam, setRosterTeam] = useState<Team | null>(null);
  const [showRoster, setShowRoster] = useState(false);
  const [rosterForm, setRosterForm] = useState({ studentId: '', name: '', position: '' });

  const [showCoachForm, setShowCoachForm] = useState(false);
  const [coachForm, setCoachForm] = useState({ name: '', sport: '', email: '', phone: '', certification: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [p, t, c] = await Promise.all([
        api.getSportProgrammes().catch(() => []),
        api.getTeams().catch(() => []),
        api.getCoaches().catch(() => []),
      ]);
      setProgrammes(Array.isArray(p) ? p : []);
      setTeams(Array.isArray(t) ? t : []);
      setCoaches(Array.isArray(c) ? c : []);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const filteredProgrammes = programmes.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProgrammeSubmit = async () => {
    try {
      setError('');
      if (editingId) { await api.updateSportProgramme(editingId, formData); }
      else { await api.createSportProgramme(formData); }
      setShowCreate(false); setEditingId(null);
      setFormData({ name: '', sport: '', description: '', season: '', status: 'active' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleTeamSubmit = async () => {
    try {
      setError('');
      if (teamEditId) { await api.updateTeam(teamEditId, teamForm); }
      else { await api.createTeam(teamForm); }
      setShowTeamForm(false); setTeamEditId(null);
      setTeamForm({ name: '', sport: '', programmeId: '', ageGroup: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleAddRoster = async () => {
    try {
      setError('');
      if (rosterTeam) {
        await api.addPlayerToRoster(rosterTeam.id, rosterForm);
        setRosterForm({ studentId: '', name: '', position: '' });
        load();
      }
    } catch (e: any) { setError(e.message); }
  };

  const handleRemoveRoster = async (studentId: string) => {
    try {
      setError('');
      if (rosterTeam) {
        await api.removePlayerFromRoster(rosterTeam.id, studentId);
        load();
      }
    } catch (e: any) { setError(e.message); }
  };

  const handleCoachSubmit = async () => {
    try {
      setError('');
      await api.addCoach(coachForm);
      setShowCoachForm(false);
      setCoachForm({ name: '', sport: '', email: '', phone: '', certification: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2"><Trophy className="w-4 h-4 text-orange-500" /> Sport Programmes</h3>
          <Button size="sm" onClick={() => { setEditingId(null); setFormData({ name: '', sport: '', description: '', season: '', status: 'active' }); setShowCreate(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Programme
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search programmes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredProgrammes.map(p => (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold truncate">{p.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Badge variant="outline">{p.sport}</Badge>
                      {p.season && <span className="flex items-center gap-1 text-xs"><CalendarDays className="w-3 h-3" />{p.season}</span>}
                    </div>
                    {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant={p.status === 'active' ? 'success' : 'secondary'}>{p.status}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingId(p.id); setFormData({ name: p.name, sport: p.sport, description: p.description || '', season: p.season || '', status: p.status }); setShowCreate(true); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filteredProgrammes.length === 0 && <p className="text-center text-muted-foreground py-4 col-span-2">No programmes found</p>}
        </div>
      </div>

      <div className="border-t border-border/50 pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-orange-500" /> Teams & Rosters</h3>
          <Button size="sm" onClick={() => { setTeamEditId(null); setTeamForm({ name: '', sport: '', programmeId: '', ageGroup: '' }); setShowTeamForm(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Team
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.sport.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold truncate">{t.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Badge variant="outline">{t.sport}</Badge>
                      {t.ageGroup && <span>{t.ageGroup}</span>}
                      <span>{t.roster?.length || 0} player(s)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => { setRosterTeam(t); setRosterForm({ studentId: '', name: '', position: '' }); setShowRoster(true); }}>
                    <Users className="w-4 h-4 mr-1" />Roster
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setTeamEditId(t.id); setTeamForm({ name: t.name, sport: t.sport, programmeId: t.programmeId || '', ageGroup: t.ageGroup || '' }); setShowTeamForm(true); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {teams.length === 0 && <p className="text-center text-muted-foreground py-4 col-span-2">No teams found</p>}
        </div>
      </div>

      <div className="border-t border-border/50 pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2"><GraduationCap className="w-4 h-4 text-orange-500" /> Coaches</h3>
          <Button size="sm" onClick={() => { setCoachForm({ name: '', sport: '', email: '', phone: '', certification: '' }); setShowCoachForm(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Coach
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {coaches.map(c => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold truncate">{c.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Badge variant="outline">{c.sport}</Badge>
                    {c.certification && <span>• {c.certification}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {c.email && <span>{c.email}</span>}
                    {c.phone && <span>{c.email ? ' • ' : ''}{c.phone}</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {coaches.length === 0 && <p className="text-center text-muted-foreground py-4 col-span-2">No coaches found</p>}
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Programme' : 'Add Programme'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Name</label><Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Sport</label><Input value={formData.sport} onChange={e => setFormData(f => ({ ...f, sport: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Season</label><Input value={formData.season} onChange={e => setFormData(f => ({ ...f, season: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Status</label>
              <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="active">Active</option><option value="inactive">Inactive</option><option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div><label className="text-sm font-medium">Description</label><Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleProgrammeSubmit}>{editingId ? 'Update' : 'Add'} Programme</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showTeamForm} onClose={() => setShowTeamForm(false)} title={teamEditId ? 'Edit Team' : 'Add Team'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Team Name</label><Input value={teamForm.name} onChange={e => setTeamForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Sport</label><Input value={teamForm.sport} onChange={e => setTeamForm(f => ({ ...f, sport: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Programme</label>
              <select value={teamForm.programmeId} onChange={e => setTeamForm(f => ({ ...f, programmeId: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select programme</option>
                {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-medium">Age Group</label><Input value={teamForm.ageGroup} onChange={e => setTeamForm(f => ({ ...f, ageGroup: e.target.value }))} /></div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowTeamForm(false)}>Cancel</Button>
            <Button onClick={handleTeamSubmit}>{teamEditId ? 'Update' : 'Add'} Team</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRoster} onClose={() => setShowRoster(false)} title={`Roster: ${rosterTeam?.name || ''}`} size="lg">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input placeholder="Student Name" value={rosterForm.name} onChange={e => setRosterForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="flex-1">
              <Input placeholder="Position" value={rosterForm.position} onChange={e => setRosterForm(f => ({ ...f, position: e.target.value }))} />
            </div>
            <Button size="sm" onClick={handleAddRoster}><UserPlus className="w-4 h-4 mr-1" />Add</Button>
          </div>
          <div className="space-y-2">
            {rosterTeam?.roster?.map(r => (
              <Card key={r.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <Footprints className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.position || 'No position'}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveRoster(r.id)}>
                    <UserMinus className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
            {(!rosterTeam?.roster || rosterTeam.roster.length === 0) && <p className="text-center text-muted-foreground py-4">No players in roster</p>}
          </div>
        </div>
      </Modal>

      <Modal isOpen={showCoachForm} onClose={() => setShowCoachForm(false)} title="Add Coach" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Name</label><Input value={coachForm.name} onChange={e => setCoachForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Sport</label><Input value={coachForm.sport} onChange={e => setCoachForm(f => ({ ...f, sport: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Email</label><Input type="email" value={coachForm.email} onChange={e => setCoachForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Phone</label><Input value={coachForm.phone} onChange={e => setCoachForm(f => ({ ...f, phone: e.target.value }))} /></div>
          </div>
          <div><label className="text-sm font-medium">Certification</label><Input value={coachForm.certification} onChange={e => setCoachForm(f => ({ ...f, certification: e.target.value }))} /></div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCoachForm(false)}>Cancel</Button>
            <Button onClick={handleCoachSubmit}>Add Coach</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EventsSection() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sportEvents, setSportEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [showGameForm, setShowGameForm] = useState(false);
  const [gameForm, setGameForm] = useState({ homeTeam: '', awayTeam: '', date: '', location: '' });
  const [showResult, setShowResult] = useState<string | null>(null);
  const [resultForm, setResultForm] = useState({ homeScore: 0, awayScore: 0 });

  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ name: '', sport: '', date: '', venue: '' });
  const [allotEvent, setAllotEvent] = useState<string | null>(null);
  const [allotForm, setAllotForm] = useState({ studentId: '', name: '' });

  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [g, t, e] = await Promise.all([api.getGames().catch(() => []), api.getTeams().catch(() => []), Promise.resolve([])]);
      setGames(Array.isArray(g) ? g : []);
      setTeams(Array.isArray(t) ? t : []);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const filteredGames = games.filter(g => filter === 'all' || g.status === filter);

  const handleCreateGame = async () => {
    try {
      setError('');
      await api.scheduleGame(gameForm);
      setShowGameForm(false);
      setGameForm({ homeTeam: '', awayTeam: '', date: '', location: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleRecordResult = async () => {
    try {
      setError('');
      if (showResult) {
        await api.recordGameResult(showResult, resultForm);
        setShowResult(null);
        setResultForm({ homeScore: 0, awayScore: 0 });
        load();
      }
    } catch (e: any) { setError(e.message); }
  };

  const handleCreateEvent = async () => {
    const newEvent: SportEvent = {
      id: crypto.randomUUID(), name: eventForm.name, sport: eventForm.sport,
      date: eventForm.date, venue: eventForm.venue, allottedAthletes: [],
    };
    setSportEvents(prev => [...prev, newEvent]);
    setShowEventForm(false);
    setEventForm({ name: '', sport: '', date: '', venue: '' });
  };

  const handleAllotAthlete = async () => {
    if (!allotEvent || !allotForm.name) return;
    setSportEvents(prev => prev.map(e =>
      e.id === allotEvent
        ? { ...e, allottedAthletes: [...e.allottedAthletes, { studentId: allotForm.studentId || crypto.randomUUID(), name: allotForm.name }] }
        : e
    ));
    setAllotForm({ studentId: '', name: '' });
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2"><CalendarDays className="w-4 h-4 text-orange-500" /> Sport Events</h3>
          <Button size="sm" onClick={() => { setEventForm({ name: '', sport: '', date: '', venue: '' }); setShowEventForm(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Event
          </Button>
        </div>
        <div className="space-y-3">
          {sportEvents.length === 0 && games.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No events scheduled</p>
          )}
          {sportEvents.map(ev => (
            <Card key={ev.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold truncate">{ev.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                      <Badge variant="outline">{ev.sport}</Badge>
                      {ev.date && <span>{new Date(ev.date).toLocaleDateString()}</span>}
                      {ev.venue && <span>· {ev.venue}</span>}
                    </div>
                    {ev.allottedAthletes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {ev.allottedAthletes.map(a => (
                          <Badge key={a.studentId} variant="secondary" className="text-xs">{a.name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="shrink-0" onClick={() => { setAllotEvent(ev.id); setAllotForm({ studentId: '', name: '' }); }}>
                  <UserPlus className="w-4 h-4 mr-1" />Allot
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="border-t border-border/50 pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2"><Footprints className="w-4 h-4 text-orange-500" /> Games & Schedule</h3>
          <div className="flex gap-2">
            <select value={filter} onChange={e => setFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button size="sm" onClick={() => { setGameForm({ homeTeam: '', awayTeam: '', date: '', location: '' }); setShowGameForm(true); }}>
              <Plus className="w-4 h-4 mr-1" />Schedule
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {filteredGames.map(g => (
            <Card key={g.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Footprints className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold truncate">{g.homeTeam} vs {g.awayTeam}</h4>
                      <Badge variant={g.status === 'completed' ? 'success' : g.status === 'scheduled' ? 'info' : 'secondary'} className="shrink-0">{g.status}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3 shrink-0" />{g.date ? new Date(g.date).toLocaleDateString() : 'TBD'}</span>
                      {g.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{g.location}</span>}
                      {g.homeScore !== undefined && <span>Score: {g.homeScore} - {g.awayScore}</span>}
                    </div>
                  </div>
                </div>
                {g.status === 'scheduled' && (
                  <Button size="sm" variant="outline" className="shrink-0" onClick={() => { setShowResult(g.id); setResultForm({ homeScore: 0, awayScore: 0 }); }}>
                    <Flag className="w-4 h-4 mr-1" />Result
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {filteredGames.length === 0 && sportEvents.length === 0 && <p className="text-center text-muted-foreground py-4">No games found</p>}
        </div>
      </div>

      <Modal isOpen={showGameForm} onClose={() => setShowGameForm(false)} title="Schedule Game" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Home Team</label>
              <select value={gameForm.homeTeam} onChange={e => setGameForm(f => ({ ...f, homeTeam: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-medium">Away Team</label>
              <select value={gameForm.awayTeam} onChange={e => setGameForm(f => ({ ...f, awayTeam: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Date</label><Input type="datetime-local" value={gameForm.date} onChange={e => setGameForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Location</label><Input value={gameForm.location} onChange={e => setGameForm(f => ({ ...f, location: e.target.value }))} /></div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowGameForm(false)}>Cancel</Button>
            <Button onClick={handleCreateGame}>Schedule Game</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showResult !== null} onClose={() => setShowResult(null)} title="Record Result" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Home Score</label><Input type="number" value={resultForm.homeScore} onChange={e => setResultForm(f => ({ ...f, homeScore: Number(e.target.value) }))} /></div>
            <div><label className="text-sm font-medium">Away Score</label><Input type="number" value={resultForm.awayScore} onChange={e => setResultForm(f => ({ ...f, awayScore: Number(e.target.value) }))} /></div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowResult(null)}>Cancel</Button>
            <Button onClick={handleRecordResult}>Save Result</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEventForm} onClose={() => setShowEventForm(false)} title="Add Sport Event" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Event Name</label><Input value={eventForm.name} onChange={e => setEventForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Sport</label><Input value={eventForm.sport} onChange={e => setEventForm(f => ({ ...f, sport: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Date</label><Input type="date" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Venue</label><Input value={eventForm.venue} onChange={e => setEventForm(f => ({ ...f, venue: e.target.value }))} /></div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowEventForm(false)}>Cancel</Button>
            <Button onClick={handleCreateEvent}>Add Event</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={allotEvent !== null} onClose={() => setAllotEvent(null)} title="Allot Athlete" size="md">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input placeholder="Athlete name" value={allotForm.name} onChange={e => setAllotForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <Button onClick={handleAllotAthlete}><UserPlus className="w-4 h-4 mr-1" />Allot</Button>
          </div>
          {allotEvent && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Allotted athletes:</p>
              {sportEvents.find(e => e.id === allotEvent)?.allottedAthletes.map(a => (
                <div key={a.studentId} className="flex items-center justify-between text-sm py-1">
                  <span>{a.name}</span>
                </div>
              ))}
              {(sportEvents.find(e => e.id === allotEvent)?.allottedAthletes.length || 0) === 0 && (
                <p className="text-xs text-muted-foreground">None yet</p>
              )}
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-end pt-2">
            <Button variant="outline" onClick={() => setAllotEvent(null)}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AwardsSection() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ studentName: '', sport: '', awardName: '', date: '', level: 'school', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('eduvault-athletics-awards');
      if (saved) setAwards(JSON.parse(saved));
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  const saveAwards = (updated: Award[]) => {
    setAwards(updated);
    localStorage.setItem('eduvault-athletics-awards', JSON.stringify(updated));
  };

  const filtered = awards.filter(a =>
    a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.awardName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!formData.studentName || !formData.awardName) return;
    const newAward: Award = { id: crypto.randomUUID(), ...formData };
    saveAwards([newAward, ...awards]);
    setShowCreate(false);
    setFormData({ studentName: '', sport: '', awardName: '', date: '', level: 'school', notes: '' });
  };

  const handleDelete = (id: string) => {
    saveAwards(awards.filter(a => a.id !== id));
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search awards..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setFormData({ studentName: '', sport: '', awardName: '', date: '', level: 'school', notes: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Award
        </Button>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground">{awards.length} award(s)</p>
      <div className="space-y-3">
        {filtered.map(a => {
          const levelColors: Record<string, string> = {
            school: 'info', district: 'success', regional: 'warning',
            national: 'destructive', international: 'default',
          };
          return (
            <Card key={a.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Medal className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold truncate">{a.awardName}</h4>
                    <p className="text-sm truncate">{a.studentName} · {a.sport || 'Sport'}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Badge variant={(levelColors[a.level] || 'info') as any}>{a.level}</Badge>
                      {a.date && <span>{new Date(a.date).toLocaleDateString()}</span>}
                    </div>
                    {a.notes && <p className="text-xs text-muted-foreground mt-1">{a.notes}</p>}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)} className="shrink-0">
                  <XCircle className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No awards found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Award" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Student Name *</label><Input value={formData.studentName} onChange={e => setFormData(f => ({ ...f, studentName: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Sport</label><Input value={formData.sport} onChange={e => setFormData(f => ({ ...f, sport: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Award Name *</label><Input value={formData.awardName} onChange={e => setFormData(f => ({ ...f, awardName: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Date</label><Input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} /></div>
          </div>
          <div>
            <label className="text-sm font-medium">Level</label>
            <select value={formData.level} onChange={e => setFormData(f => ({ ...f, level: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="school">School</option>
              <option value="district">District</option>
              <option value="regional">Regional</option>
              <option value="national">National</option>
              <option value="international">International</option>
            </select>
          </div>
          <div><label className="text-sm font-medium">Notes</label><Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Award</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EquipmentSection() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', category: '', quantity: 0, condition: 'good', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getSportsEquipment(); setEquipment(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load equipment'); }
    finally { setLoading(false); }
  };

  const filtered = equipment.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) { await api.updateSportsEquipment(editingId, formData); }
      else { await api.addSportsEquipment(formData); }
      setShowCreate(false); setEditingId(null);
      setFormData({ name: '', category: '', quantity: 0, condition: 'good', notes: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search equipment..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', category: '', quantity: 0, condition: 'good', notes: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Equipment
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(eq => (
          <Card key={eq.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-5 h-5 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold truncate">{eq.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Badge variant="outline">{eq.category}</Badge>
                    <span>Qty: {eq.quantity}</span>
                  </div>
                  <Badge variant={eq.condition === 'good' ? 'success' : eq.condition === 'fair' ? 'warning' : 'destructive'} className="mt-1">{eq.condition}</Badge>
                  {eq.notes && <p className="text-xs text-muted-foreground mt-1">{eq.notes}</p>}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="shrink-0" onClick={() => { setEditingId(eq.id); setFormData({ name: eq.name, category: eq.category, quantity: eq.quantity, condition: eq.condition, notes: eq.notes || '' }); setShowCreate(true); }}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No equipment found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Equipment' : 'Add Equipment'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Name</label><Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Category</label><Input value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Quantity</label><Input type="number" value={formData.quantity || ''} onChange={e => setFormData(f => ({ ...f, quantity: Number(e.target.value) }))} /></div>
            <div><label className="text-sm font-medium">Condition</label>
              <select value={formData.condition} onChange={e => setFormData(f => ({ ...f, condition: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option><option value="damaged">Damaged</option>
              </select>
            </div>
          </div>
          <div><label className="text-sm font-medium">Notes</label><Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Equipment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MedicalSection() {
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [clearances, setClearances] = useState<MedicalClearance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [showInjuryForm, setShowInjuryForm] = useState(false);
  const [injuryForm, setInjuryForm] = useState({ playerName: '', injuryType: '', date: '', severity: 'minor', notes: '' });
  const [showClearanceForm, setShowClearanceForm] = useState(false);
  const [clearanceForm, setClearanceForm] = useState({ playerName: '', clearanceDate: '', expiryDate: '', clearedBy: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [i, c] = await Promise.all([api.getSportsInjuries().catch(() => []), api.getMedicalClearances().catch(() => [])]);
      setInjuries(Array.isArray(i) ? i : []);
      setClearances(Array.isArray(c) ? c : []);
    } catch { setError('Failed to load medical data'); }
    finally { setLoading(false); }
  };

  const filteredInjuries = injuries.filter(i => filter === 'all' || i.status === filter);

  const handleCreateInjury = async () => {
    try { setError(''); await api.logSportsInjury(injuryForm); setShowInjuryForm(false); setInjuryForm({ playerName: '', injuryType: '', date: '', severity: 'minor', notes: '' }); load(); }
    catch (e: any) { setError(e.message); }
  };

  const handleClearInjury = async (id: string) => {
    try { setError(''); await api.clearInjury(id); load(); }
    catch (e: any) { setError(e.message); }
  };

  const handleCreateClearance = async () => {
    try { setError(''); await api.addMedicalClearance(clearanceForm); setShowClearanceForm(false); setClearanceForm({ playerName: '', clearanceDate: '', expiryDate: '', clearedBy: '', notes: '' }); load(); }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2"><Stethoscope className="w-4 h-4 text-red-500" /> Injuries</h3>
          <div className="flex gap-2">
            <select value={filter} onChange={e => setFilter(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
              <option value="all">All</option><option value="active">Active</option><option value="cleared">Cleared</option>
            </select>
            <Button size="sm" onClick={() => { setInjuryForm({ playerName: '', injuryType: '', date: new Date().toISOString().split('T')[0], severity: 'minor', notes: '' }); setShowInjuryForm(true); }}>
              <Plus className="w-4 h-4 mr-1" />Log Injury
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {filteredInjuries.map(inj => (
            <Card key={inj.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold truncate">{inj.playerName}</h4>
                      <Badge variant="outline">{inj.injuryType}</Badge>
                      <Badge variant={inj.severity === 'severe' ? 'destructive' : inj.severity === 'moderate' ? 'warning' : 'info'}>{inj.severity}</Badge>
                      <Badge variant={inj.status === 'active' ? 'warning' : 'success'}>{inj.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span>{inj.date ? new Date(inj.date).toLocaleDateString() : ''}</span>
                      {inj.notes && <span> • {inj.notes}</span>}
                    </div>
                  </div>
                </div>
                {inj.status === 'active' && (
                  <Button size="sm" variant="outline" className="shrink-0" onClick={() => handleClearInjury(inj.id)}>
                    <CheckCircle className="w-4 h-4 mr-1" />Clear
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {filteredInjuries.length === 0 && <p className="text-center text-muted-foreground py-4">No injuries found</p>}
        </div>
      </div>

      <div className="border-t border-border/50 pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Medical Clearances</h3>
          <Button size="sm" onClick={() => { setClearanceForm({ playerName: '', clearanceDate: '', expiryDate: '', clearedBy: '', notes: '' }); setShowClearanceForm(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Clearance
          </Button>
        </div>
        <div className="space-y-3">
          {clearances.map(cl => (
            <Card key={cl.id} className="p-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold truncate">{cl.playerName}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span>Cleared: {cl.clearanceDate ? new Date(cl.clearanceDate).toLocaleDateString() : 'N/A'}</span>
                    <span>Expires: {cl.expiryDate ? new Date(cl.expiryDate).toLocaleDateString() : 'N/A'}</span>
                    {cl.clearedBy && <span>by {cl.clearedBy}</span>}
                  </div>
                  {cl.notes && <p className="text-xs text-muted-foreground mt-1">{cl.notes}</p>}
                </div>
              </div>
            </Card>
          ))}
          {clearances.length === 0 && <p className="text-center text-muted-foreground py-4">No medical clearances found</p>}
        </div>
      </div>

      <Modal isOpen={showInjuryForm} onClose={() => setShowInjuryForm(false)} title="Log Injury" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Player Name</label><Input value={injuryForm.playerName} onChange={e => setInjuryForm(f => ({ ...f, playerName: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Injury Type</label><Input value={injuryForm.injuryType} onChange={e => setInjuryForm(f => ({ ...f, injuryType: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Date</label><Input type="date" value={injuryForm.date} onChange={e => setInjuryForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Severity</label>
              <select value={injuryForm.severity} onChange={e => setInjuryForm(f => ({ ...f, severity: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="minor">Minor</option><option value="moderate">Moderate</option><option value="severe">Severe</option>
              </select>
            </div>
          </div>
          <div><label className="text-sm font-medium">Notes</label><Textarea value={injuryForm.notes} onChange={e => setInjuryForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowInjuryForm(false)}>Cancel</Button>
            <Button onClick={handleCreateInjury}>Log Injury</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showClearanceForm} onClose={() => setShowClearanceForm(false)} title="Add Medical Clearance" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Player Name</label><Input value={clearanceForm.playerName} onChange={e => setClearanceForm(f => ({ ...f, playerName: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Cleared By</label><Input value={clearanceForm.clearedBy} onChange={e => setClearanceForm(f => ({ ...f, clearedBy: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Clearance Date</label><Input type="date" value={clearanceForm.clearanceDate} onChange={e => setClearanceForm(f => ({ ...f, clearanceDate: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Expiry Date</label><Input type="date" value={clearanceForm.expiryDate} onChange={e => setClearanceForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
          </div>
          <div><label className="text-sm font-medium">Notes</label><Textarea value={clearanceForm.notes} onChange={e => setClearanceForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowClearanceForm(false)}>Cancel</Button>
            <Button onClick={handleCreateClearance}>Add Clearance</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatsSection() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teamStats, setTeamStats] = useState<any>(null);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadTeams(); }, []);
  useEffect(() => { if (selectedTeam) loadTeamStats(); }, [selectedTeam]);
  useEffect(() => { if (selectedTeam && selectedPlayer) loadPlayerStats(); }, [selectedPlayer]);

  const loadTeams = async () => {
    try { setLoading(true); const d = await api.getTeams(); setTeams(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load teams'); }
    finally { setLoading(false); }
  };

  const loadTeamStats = async () => {
    try { setLoading(true); const d = await api.getTeamStats(selectedTeam); setTeamStats(d); }
    catch { setError('Failed to load team stats'); }
    finally { setLoading(false); }
  };

  const loadPlayerStats = async () => {
    try { setLoading(true); const d = await api.getPlayerStats(selectedTeam, selectedPlayer); setPlayerStats(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load player stats'); }
    finally { setLoading(false); }
  };

  if (loading && !selectedTeam) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <select value={selectedTeam} onChange={e => { setSelectedTeam(e.target.value); setSelectedPlayer(''); }} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Select team</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {selectedTeam && (
          <div className="flex-1">
            <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">All players</option>
              {teams.find(t => t.id === selectedTeam)?.roster?.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {!selectedTeam ? (
        <p className="text-center text-muted-foreground py-8">Select a team to view statistics</p>
      ) : loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-4">
          {teamStats && (
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-6 h-6 text-orange-500" />
                <h3 className="font-semibold">Team Statistics</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(teamStats).filter(([k]) => k !== 'id').map(([key, val]) => (
                  <div key={key} className="text-center p-3 rounded-lg bg-orange-50">
                    <p className="text-2xl font-bold text-orange-600">{String(val)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {selectedPlayer && playerStats.length > 0 && playerStats.map((ps, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Medal className="w-6 h-6 text-orange-500" />
                <h3 className="font-semibold">Player Stats</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(ps).filter(([k]) => k !== 'id' && k !== 'playerId').map(([key, val]) => (
                  <div key={key} className="text-center p-3 rounded-lg bg-orange-50">
                    <p className="text-2xl font-bold text-orange-600">{String(val)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          {selectedPlayer && playerStats.length === 0 && <p className="text-center text-muted-foreground py-4">No player stats available</p>}
        </div>
      )}
    </div>
  );
}
