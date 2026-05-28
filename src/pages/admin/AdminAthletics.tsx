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
  Trophy, Medal, Users, Shirt, Stethoscope, GraduationCap,
  Plus, Search, Edit2, CheckCircle, XCircle, UserPlus, UserMinus,
  Dumbbell, Footprints, Award, Flag, CalendarDays, MapPin,
} from 'lucide-react';

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

export default function AdminAthletics() {
  const [activeTab, setActiveTab] = useState('programmes');
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Athletics Management</h1>
        <p className="text-muted-foreground">Sport programmes, teams, games, equipment and more</p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="programmes">Programmes</TabsTrigger>
          <TabsTrigger value="teams">Teams & Roster</TabsTrigger>
          <TabsTrigger value="games">Games/Schedule</TabsTrigger>
          <TabsTrigger value="coaches">Coaches</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="injuries">Injuries</TabsTrigger>
          <TabsTrigger value="clearances">Medical Clearances</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="programmes"><ProgrammesTab /></TabsContent>
        <TabsContent value="teams"><TeamsTab /></TabsContent>
        <TabsContent value="games"><GamesTab /></TabsContent>
        <TabsContent value="coaches"><CoachesTab /></TabsContent>
        <TabsContent value="equipment"><EquipmentTab /></TabsContent>
        <TabsContent value="injuries"><InjuriesTab /></TabsContent>
        <TabsContent value="clearances"><ClearancesTab /></TabsContent>
        <TabsContent value="stats"><StatsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ProgrammesTab() {
  const [programmes, setProgrammes] = useState<SportProgramme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', sport: '', description: '', season: '', status: 'active' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getSportProgrammes(); setProgrammes(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load programmes'); }
    finally { setLoading(false); }
  };

  const filtered = programmes.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) { await api.updateSportProgramme(editingId, formData); }
      else { await api.createSportProgramme(formData); }
      setShowCreate(false); setEditingId(null);
      setFormData({ name: '', sport: '', description: '', season: '', status: 'active' });
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
          <Input placeholder="Search programmes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', sport: '', description: '', season: '', status: 'active' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Programme
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <Card key={p.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{p.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Badge variant="outline">{p.sport}</Badge>
                    {p.season && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{p.season}</span>}
                  </div>
                  {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={p.status === 'active' ? 'success' : 'secondary'}>{p.status}</Badge>
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(p.id); setFormData({ name: p.name, sport: p.sport, description: p.description || '', season: p.season || '', status: p.status }); setShowCreate(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No programmes found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Programme' : 'Add Programme'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Sport</label>
              <Input value={formData.sport} onChange={e => setFormData(f => ({ ...f, sport: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Season</label>
              <Input value={formData.season} onChange={e => setFormData(f => ({ ...f, season: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Programme</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [programmes, setProgrammes] = useState<SportProgramme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', sport: '', programmeId: '', ageGroup: '' });
  const [error, setError] = useState('');
  const [rosterTeam, setRosterTeam] = useState<Team | null>(null);
  const [showRoster, setShowRoster] = useState(false);
  const [rosterForm, setRosterForm] = useState({ studentId: '', name: '', position: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [d, p] = await Promise.all([api.getTeams(), api.getSportProgrammes()]);
      setTeams(Array.isArray(d) ? d : []);
      setProgrammes(Array.isArray(p) ? p : []);
    } catch { setError('Failed to load teams'); }
    finally { setLoading(false); }
  };

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) { await api.updateTeam(editingId, formData); }
      else { await api.createTeam(formData); }
      setShowCreate(false); setEditingId(null);
      setFormData({ name: '', sport: '', programmeId: '', ageGroup: '' });
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

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search teams..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', sport: '', programmeId: '', ageGroup: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Team
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(t => (
          <Card key={t.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{t.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Badge variant="outline">{t.sport}</Badge>
                    {t.ageGroup && <span>{t.ageGroup}</span>}
                    <span>•</span>
                    <span>{t.roster?.length || 0} player(s)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => { setRosterTeam(t); setRosterForm({ studentId: '', name: '', position: '' }); setShowRoster(true); }}>
                  <Users className="w-4 h-4 mr-1" />Roster
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(t.id); setFormData({ name: t.name, sport: t.sport, programmeId: t.programmeId || '', ageGroup: t.ageGroup || '' }); setShowCreate(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No teams found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Team' : 'Add Team'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Team Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Sport</label>
              <Input value={formData.sport} onChange={e => setFormData(f => ({ ...f, sport: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Programme</label>
              <select value={formData.programmeId} onChange={e => setFormData(f => ({ ...f, programmeId: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select programme</option>
                {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Age Group</label>
              <Input value={formData.ageGroup} onChange={e => setFormData(f => ({ ...f, ageGroup: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Team</Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={showRoster} onClose={() => setShowRoster(false)} title={`Roster: ${rosterTeam?.name || ''}`} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Student ID" value={rosterForm.studentId} onChange={e => setRosterForm(f => ({ ...f, studentId: e.target.value }))} />
            <Input placeholder="Name" value={rosterForm.name} onChange={e => setRosterForm(f => ({ ...f, name: e.target.value }))} />
            <div className="flex gap-2">
              <Input placeholder="Position" value={rosterForm.position} onChange={e => setRosterForm(f => ({ ...f, position: e.target.value }))} />
              <Button size="sm" onClick={handleAddRoster}><UserPlus className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="space-y-2">
            {rosterTeam?.roster?.map(r => (
              <Card key={r.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Footprints className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.position || 'No position'}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveRoster(r.id)}><UserMinus className="w-4 h-4 text-red-500" /></Button>
                </div>
              </Card>
            ))}
            {(!rosterTeam?.roster || rosterTeam.roster.length === 0) && <p className="text-center text-muted-foreground py-4">No players in roster</p>}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function GamesTab() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showResult, setShowResult] = useState<string | null>(null);
  const [formData, setFormData] = useState({ homeTeam: '', awayTeam: '', date: '', location: '' });
  const [resultForm, setResultForm] = useState({ homeScore: 0, awayScore: 0 });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [d, t] = await Promise.all([api.getGames(), api.getTeams()]);
      setGames(Array.isArray(d) ? d : []);
      setTeams(Array.isArray(t) ? t : []);
    } catch { setError('Failed to load games'); }
    finally { setLoading(false); }
  };

  const filtered = games.filter(g => filter === 'all' || g.status === filter);

  const handleCreate = async () => {
    try {
      setError('');
      await api.scheduleGame(formData);
      setShowCreate(false);
      setFormData({ homeTeam: '', awayTeam: '', date: '', location: '' });
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

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All Games</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex-1" />
        <Button onClick={() => { setFormData({ homeTeam: '', awayTeam: '', date: '', location: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Schedule Game
        </Button>
      </div>
      <div className="space-y-3">
        {filtered.map(g => (
          <Card key={g.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Footprints className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{g.homeTeam} vs {g.awayTeam}</h4>
                    <Badge variant={g.status === 'completed' ? 'success' : g.status === 'scheduled' ? 'info' : 'secondary'}>{g.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{g.date ? new Date(g.date).toLocaleDateString() : 'TBD'}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{g.location || 'TBD'}</span>
                    {g.homeScore !== undefined && <span>Score: {g.homeScore} - {g.awayScore}</span>}
                  </div>
                </div>
              </div>
              {g.status === 'scheduled' && (
                <Button size="sm" variant="outline" onClick={() => { setShowResult(g.id); setResultForm({ homeScore: 0, awayScore: 0 }); }}>
                  <Flag className="w-4 h-4 mr-1" />Record Result
                </Button>
              )}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No games found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Schedule Game" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Home Team</label>
              <select value={formData.homeTeam} onChange={e => setFormData(f => ({ ...f, homeTeam: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Away Team</label>
              <select value={formData.awayTeam} onChange={e => setFormData(f => ({ ...f, awayTeam: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="datetime-local" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Schedule Game</Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={showResult !== null} onClose={() => setShowResult(null)} title="Record Result" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Home Score</label>
              <Input type="number" value={resultForm.homeScore} onChange={e => setResultForm(f => ({ ...f, homeScore: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Away Score</label>
              <Input type="number" value={resultForm.awayScore} onChange={e => setResultForm(f => ({ ...f, awayScore: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowResult(null)}>Cancel</Button>
            <Button onClick={handleRecordResult}>Save Result</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CoachesTab() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', sport: '', email: '', phone: '', certification: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getCoaches(); setCoaches(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load coaches'); }
    finally { setLoading(false); }
  };

  const filtered = coaches.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      setError('');
      await api.addCoach(formData);
      setShowCreate(false);
      setFormData({ name: '', sport: '', email: '', phone: '', certification: '' });
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
          <Input placeholder="Search coaches..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setFormData({ name: '', sport: '', email: '', phone: '', certification: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Coach
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(c => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-semibold">{c.name}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Badge variant="outline">{c.sport}</Badge>
                  {c.certification && <span>• {c.certification}</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {c.email && <span>{c.email}</span>}
                  {c.phone && <span>{c.email ? ' • ' : ''}{c.phone}</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No coaches found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Coach" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Sport</label>
              <Input value={formData.sport} onChange={e => setFormData(f => ({ ...f, sport: e.target.value }))} />
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
            <label className="text-sm font-medium">Certification</label>
            <Input value={formData.certification} onChange={e => setFormData(f => ({ ...f, certification: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Coach</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EquipmentTab() {
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
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search equipment..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', category: '', quantity: 0, condition: 'good', notes: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Equipment
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(eq => (
          <Card key={eq.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{eq.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Badge variant="outline">{eq.category}</Badge>
                    <span>Qty: {eq.quantity}</span>
                  </div>
                  <Badge variant={eq.condition === 'good' ? 'success' : eq.condition === 'fair' ? 'warning' : 'destructive'} className="mt-1">{eq.condition}</Badge>
                  {eq.notes && <p className="text-xs text-muted-foreground mt-1">{eq.notes}</p>}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setEditingId(eq.id); setFormData({ name: eq.name, category: eq.category, quantity: eq.quantity, condition: eq.condition, notes: eq.notes || '' }); setShowCreate(true); }}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-3">No equipment found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Equipment' : 'Add Equipment'} size="lg">
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
              <label className="text-sm font-medium">Quantity</label>
              <Input type="number" value={formData.quantity || ''} onChange={e => setFormData(f => ({ ...f, quantity: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Condition</label>
              <select value={formData.condition} onChange={e => setFormData(f => ({ ...f, condition: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Equipment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InjuriesTab() {
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ playerName: '', injuryType: '', date: '', severity: 'minor', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getSportsInjuries(); setInjuries(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load injuries'); }
    finally { setLoading(false); }
  };

  const filtered = injuries.filter(i => filter === 'all' || i.status === filter);

  const handleCreate = async () => {
    try {
      setError('');
      await api.logSportsInjury(formData);
      setShowCreate(false);
      setFormData({ playerName: '', injuryType: '', date: '', severity: 'minor', notes: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleClear = async (id: string) => {
    try {
      setError('');
      await api.clearInjury(id);
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All Injuries</option>
          <option value="active">Active</option>
          <option value="cleared">Cleared</option>
        </select>
        <div className="flex-1" />
        <Button onClick={() => { setFormData({ playerName: '', injuryType: '', date: new Date().toISOString().split('T')[0], severity: 'minor', notes: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Log Injury
        </Button>
      </div>
      <div className="space-y-3">
        {filtered.map(inj => (
          <Card key={inj.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{inj.playerName}</h4>
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
                <Button size="sm" variant="outline" onClick={() => handleClear(inj.id)}>
                  <CheckCircle className="w-4 h-4 mr-1" />Clear
                </Button>
              )}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No injuries found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Log Injury" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Player Name</label>
              <Input value={formData.playerName} onChange={e => setFormData(f => ({ ...f, playerName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Injury Type</label>
              <Input value={formData.injuryType} onChange={e => setFormData(f => ({ ...f, injuryType: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Severity</label>
              <select value={formData.severity} onChange={e => setFormData(f => ({ ...f, severity: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Log Injury</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ClearancesTab() {
  const [clearances, setClearances] = useState<MedicalClearance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ playerName: '', clearanceDate: '', expiryDate: '', clearedBy: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getMedicalClearances(); setClearances(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load clearances'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.addMedicalClearance(formData);
      setShowCreate(false);
      setFormData({ playerName: '', clearanceDate: '', expiryDate: '', clearedBy: '', notes: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => { setFormData({ playerName: '', clearanceDate: '', expiryDate: '', clearedBy: '', notes: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Clearance
        </Button>
      </div>
      <div className="space-y-3">
        {clearances.map(cl => (
          <Card key={cl.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold">{cl.playerName}</h4>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span>Cleared: {cl.clearanceDate ? new Date(cl.clearanceDate).toLocaleDateString() : 'N/A'}</span>
                  <span>•</span>
                  <span>Expires: {cl.expiryDate ? new Date(cl.expiryDate).toLocaleDateString() : 'N/A'}</span>
                  {cl.clearedBy && <span>• Cleared by: {cl.clearedBy}</span>}
                </div>
                {cl.notes && <p className="text-xs text-muted-foreground mt-1">{cl.notes}</p>}
              </div>
            </div>
          </Card>
        ))}
        {clearances.length === 0 && <p className="text-center text-muted-foreground py-8">No medical clearances found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Medical Clearance" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Player Name</label>
              <Input value={formData.playerName} onChange={e => setFormData(f => ({ ...f, playerName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Cleared By</label>
              <Input value={formData.clearedBy} onChange={e => setFormData(f => ({ ...f, clearedBy: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Clearance Date</label>
              <Input type="date" value={formData.clearanceDate} onChange={e => setFormData(f => ({ ...f, clearanceDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Expiry Date</label>
              <Input type="date" value={formData.expiryDate} onChange={e => setFormData(f => ({ ...f, expiryDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Clearance</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatsTab() {
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
      <div className="flex gap-4">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
