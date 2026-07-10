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
  Users, GraduationCap, Megaphone, HeartHandshake, UsersRound,
  Vote, CalendarDays, FileText, Plus, Search, Edit2,
  CheckCircle, XCircle, UserPlus, UserMinus, Handshake,
  ChevronDown, Filter, Globe, Award, MessageSquare,
} from 'lucide-react';

interface AlumniProfile {
  id: string; firstName: string; lastName: string; graduationYear: string;
  email: string; phone: string; occupation: string; company: string; bio: string;
}
interface AlumniNews {
  id: string; title: string; summary: string; content: string; author: string; date: string; status: string;
}
interface Campaign {
  id: string; name: string; description: string; goal: number; raised: number; status: string; startDate: string; endDate: string;
}
interface CommunityGroup {
  id: string; name: string; description: string; members: number; category: string;
}
interface Poll {
  id: string; question: string; options: { id: string; text: string; votes: number }[]; status: string; endDate: string;
}
interface Event {
  id: string; title: string; description: string; date: string; location: string; rsvpCount: number; status: string;
}
interface Survey {
  id: string; title: string; description: string; status: string;
}
interface PTConference {
  id: string; teacherName: string; parentName: string; date: string; time: string; status: string; notes: string;
}

type SubSection = 'profiles' | 'news' | 'campaigns' | 'community' | 'events' | 'surveys';

export default function AdminAlumni() {
  const [isMobile, setIsMobile] = useState(false);
  const [subSection, setSubSection] = useState<SubSection>('profiles');
  const [showSubNavSheet, setShowSubNavSheet] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const subNavItems: { key: SubSection; label: string; icon: React.ReactNode }[] = [
    { key: 'profiles', label: 'Alumni Profiles', icon: <GraduationCap className="w-4 h-4 shrink-0" /> },
    { key: 'news', label: 'News & Updates', icon: <Megaphone className="w-4 h-4 shrink-0" /> },
    { key: 'campaigns', label: 'Campaigns', icon: <HeartHandshake className="w-4 h-4 shrink-0" /> },
    { key: 'community', label: 'Community', icon: <UsersRound className="w-4 h-4 shrink-0" /> },
    { key: 'events', label: 'Events', icon: <CalendarDays className="w-4 h-4 shrink-0" /> },
    { key: 'surveys', label: 'Surveys & PT', icon: <FileText className="w-4 h-4 shrink-0" /> },
  ];

  const currentSubNav = subNavItems.find((i) => i.key === subSection);

  return (
    <div className="min-w-0 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold">Alumni & Community</h1>
        <p className="text-sm text-muted-foreground">Alumni profiles, engagement, campaigns, events and more</p>
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

      {subSection === 'profiles' && <ProfilesSection />}
      {subSection === 'news' && <NewsSection />}
      {subSection === 'campaigns' && <CampaignsSection />}
      {subSection === 'community' && <CommunitySection />}
      {subSection === 'events' && <EventsSection />}
      {subSection === 'surveys' && <SurveysSection />}
    </div>
  );
}

function ProfilesSection() {
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', graduationYear: '', email: '', phone: '', occupation: '', company: '', bio: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getAlumniProfiles(); setProfiles(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load alumni profiles'); }
    finally { setLoading(false); }
  };

  const filtered = profiles.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.occupation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) { await api.updateAlumniProfile(editingId, formData); }
      else { await api.createAlumniProfile(formData); }
      setShowCreate(false); setEditingId(null);
      setFormData({ firstName: '', lastName: '', graduationYear: '', email: '', phone: '', occupation: '', company: '', bio: '' });
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
          <Input placeholder="Search alumni..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ firstName: '', lastName: '', graduationYear: '', email: '', phone: '', occupation: '', company: '', bio: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Profile
        </Button>
      </div>
      <div className="space-y-3">
        {filtered.map(p => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold truncate">{p.firstName} {p.lastName}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Badge variant="outline" className="shrink-0">Class of {p.graduationYear}</Badge>
                    {p.occupation && <span className="truncate">{p.occupation}</span>}
                    {p.company && <span className="truncate">at {p.company}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {p.email && <span>{p.email}</span>}
                    {p.phone && <span>{p.email ? ' • ' : ''}{p.phone}</span>}
                  </div>
                  {p.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.bio}</p>}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="shrink-0" onClick={() => { setEditingId(p.id); setFormData({ firstName: p.firstName, lastName: p.lastName, graduationYear: p.graduationYear || '', email: p.email || '', phone: p.phone || '', occupation: p.occupation || '', company: p.company || '', bio: p.bio || '' }); setShowCreate(true); }}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No alumni profiles found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Profile' : 'Add Alumni Profile'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <Input value={formData.firstName} onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input value={formData.lastName} onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Graduation Year</label>
              <Input value={formData.graduationYear} onChange={e => setFormData(f => ({ ...f, graduationYear: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Occupation</label>
              <Input value={formData.occupation} onChange={e => setFormData(f => ({ ...f, occupation: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Company</label>
            <Input value={formData.company} onChange={e => setFormData(f => ({ ...f, company: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea value={formData.bio} onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))} />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Profile</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function NewsSection() {
  const [news, setNews] = useState<AlumniNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: '', summary: '', content: '', author: '', status: 'draft' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getAlumniNews(); setNews(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load news'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createAlumniNews(formData);
      setShowCreate(false);
      setFormData({ title: '', summary: '', content: '', author: '', status: 'draft' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => { setFormData({ title: '', summary: '', content: '', author: '', status: 'draft' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add News
        </Button>
      </div>
      <div className="space-y-3">
        {news.map(n => (
          <Card key={n.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold truncate">{n.title}</h4>
                  <Badge variant={n.status === 'published' ? 'success' : n.status === 'draft' ? 'warning' : 'secondary'} className="shrink-0">{n.status}</Badge>
                </div>
                {n.summary && <p className="text-sm text-muted-foreground mt-1">{n.summary}</p>}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                  {n.author && <span>By {n.author}</span>}
                  {n.date && <span>{new Date(n.date).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {news.length === 0 && <p className="text-center text-muted-foreground py-8">No news found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add News Article" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Author</label>
              <Input value={formData.author} onChange={e => setFormData(f => ({ ...f, author: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Summary</label>
            <Textarea value={formData.summary} onChange={e => setFormData(f => ({ ...f, summary: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Content</label>
            <Textarea value={formData.content} onChange={e => setFormData(f => ({ ...f, content: e.target.value }))} className="min-h-[120px]" />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add News</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CampaignsSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', goal: 0, startDate: '', endDate: '', status: 'active' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getCampaigns(); setCampaigns(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load campaigns'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) { await api.updateCampaign(editingId, formData); }
      else { await api.createCampaign(formData); }
      setShowCreate(false); setEditingId(null);
      setFormData({ name: '', description: '', goal: 0, startDate: '', endDate: '', status: 'active' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', description: '', goal: 0, startDate: '', endDate: '', status: 'active' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Campaign
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map(c => {
          const progress = c.goal > 0 ? Math.round((c.raised / c.goal) * 100) : 0;
          return (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold truncate">{c.name}</h4>
                      <Badge variant={c.status === 'active' ? 'success' : c.status === 'completed' ? 'info' : 'secondary'} className="shrink-0">{c.status}</Badge>
                    </div>
                    {c.description && <p className="text-sm text-muted-foreground mt-1">{c.description}</p>}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Raised: ${(c.raised || 0).toLocaleString()}</span>
                        <span>Goal: ${(c.goal || 0).toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="shrink-0" onClick={() => { setEditingId(c.id); setFormData({ name: c.name, description: c.description || '', goal: c.goal, startDate: c.startDate || '', endDate: c.endDate || '', status: c.status }); setShowCreate(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
        {campaigns.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No campaigns found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Campaign' : 'Add Campaign'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Goal Amount</label>
              <Input type="number" value={formData.goal || ''} onChange={e => setFormData(f => ({ ...f, goal: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={formData.startDate} onChange={e => setFormData(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" value={formData.endDate} onChange={e => setFormData(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Campaign</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CommunitySection() {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', category: '' });
  const [error, setError] = useState('');
  const userId = localStorage.getItem('eduvault-user-id') || '';

  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showVote, setShowVote] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [pollFormData, setPollFormData] = useState({ question: '', options: ['', ''], endDate: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [g, p] = await Promise.all([api.getCommunityGroups().catch(() => []), api.getCommunityPolls().catch(() => [])]);
      setGroups(Array.isArray(g) ? g : []);
      setPolls(Array.isArray(p) ? p : []);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = async () => {
    try { setError(''); await api.createCommunityGroup(formData); setShowCreate(false); setFormData({ name: '', description: '', category: '' }); load(); }
    catch (e: any) { setError(e.message); }
  };

  const handleJoin = async (groupId: string) => {
    try { setError(''); await api.joinCommunityGroup(groupId, userId); load(); }
    catch (e: any) { setError(e.message); }
  };

  const handleLeave = async (groupId: string) => {
    try { setError(''); await api.leaveCommunityGroup(groupId, userId); load(); }
    catch (e: any) { setError(e.message); }
  };

  const handleCreatePoll = async () => {
    try { setError(''); await api.createCommunityPoll({ ...pollFormData, options: pollFormData.options.filter(o => o.trim()) }); setShowCreatePoll(false); setPollFormData({ question: '', options: ['', ''], endDate: '' }); load(); }
    catch (e: any) { setError(e.message); }
  };

  const handleVote = async () => {
    try { setError(''); if (showVote && selectedOption) { await api.castPollVote(showVote, { optionId: selectedOption }); setShowVote(null); setSelectedOption(''); load(); } }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2"><UsersRound className="w-4 h-4 text-orange-500" /> Community Groups</h3>
          <Button size="sm" onClick={() => { setFormData({ name: '', description: '', category: '' }); setShowCreate(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Group
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search groups..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredGroups.map(g => (
            <Card key={g.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <UsersRound className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold truncate">{g.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                      {g.category && <Badge variant="outline">{g.category}</Badge>}
                      <span>{g.members || 0} member(s)</span>
                    </div>
                    {g.description && <p className="text-sm text-muted-foreground mt-1">{g.description}</p>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handleJoin(g.id)} title="Join">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleLeave(g.id)} title="Leave">
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filteredGroups.length === 0 && <p className="text-center text-muted-foreground py-4 col-span-2">No groups found</p>}
        </div>
      </div>

      <div className="border-t border-border/50 pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2"><Vote className="w-4 h-4 text-orange-500" /> Polls</h3>
          <Button size="sm" onClick={() => { setPollFormData({ question: '', options: ['', ''], endDate: '' }); setShowCreatePoll(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Poll
          </Button>
        </div>
        <div className="space-y-3">
          {polls.map(p => {
            const totalVotes = p.options?.reduce((s, o) => s + (o.votes || 0), 0) || 0;
            return (
              <Card key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <Vote className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold truncate">{p.question}</h4>
                        <Badge variant={p.status === 'active' ? 'success' : 'secondary'} className="shrink-0">{p.status}</Badge>
                        {p.endDate && <span className="text-xs text-muted-foreground">Ends: {new Date(p.endDate).toLocaleDateString()}</span>}
                      </div>
                      <div className="mt-2 space-y-2">
                        {p.options?.map(o => {
                          const pct = totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0;
                          return (
                            <div key={o.id} className="flex items-center gap-2">
                              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                                <span className="absolute inset-0 flex items-center px-2 text-xs font-medium truncate">{o.text} ({o.votes || 0})</span>
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right shrink-0">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  {p.status === 'active' && (
                    <Button size="sm" variant="outline" className="shrink-0" onClick={() => { setShowVote(p.id); setSelectedOption(''); }}>
                      <CheckCircle className="w-4 h-4 mr-1" />Vote
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
          {polls.length === 0 && <p className="text-center text-muted-foreground py-4">No polls found</p>}
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Community Group" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Group Name</label><Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Category</label><Input value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} /></div>
          </div>
          <div><label className="text-sm font-medium">Description</label><Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateGroup}>Add Group</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showCreatePoll} onClose={() => setShowCreatePoll(false)} title="Add Poll" size="lg">
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Question</label><Input value={pollFormData.question} onChange={e => setPollFormData(f => ({ ...f, question: e.target.value }))} /></div>
          <div><label className="text-sm font-medium">End Date</label><Input type="date" value={pollFormData.endDate} onChange={e => setPollFormData(f => ({ ...f, endDate: e.target.value }))} /></div>
          <div>
            <label className="text-sm font-medium">Options</label>
            {pollFormData.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2 mt-2">
                <Input value={opt} onChange={e => { const opts = [...pollFormData.options]; opts[idx] = e.target.value; setPollFormData(f => ({ ...f, options: opts })); }} placeholder={`Option ${idx + 1}`} />
                {idx === pollFormData.options.length - 1 && (
                  <Button size="sm" variant="outline" onClick={() => setPollFormData(f => ({ ...f, options: [...f.options, ''] }))}>
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreatePoll(false)}>Cancel</Button>
            <Button onClick={handleCreatePoll}>Add Poll</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showVote !== null} onClose={() => setShowVote(null)} title="Cast Vote" size="md">
        <div className="space-y-4">
          <div className="space-y-2">
            {polls.find(p => p.id === showVote)?.options?.map(o => (
              <label key={o.id} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-orange-50">
                <input type="radio" name="pollOption" value={o.id} checked={selectedOption === o.id} onChange={e => setSelectedOption(e.target.value)} className="w-4 h-4 text-orange-500" />
                <span className="text-sm">{o.text}</span>
              </label>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowVote(null)}>Cancel</Button>
            <Button onClick={handleVote} disabled={!selectedOption}>Cast Vote</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '' });
  const [error, setError] = useState('');
  const userId = localStorage.getItem('eduvault-user-id') || '';

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getCommunityEvents(); setEvents(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load events'); }
    finally { setLoading(false); }
  };

  const filtered = events.filter(e => filter === 'all' || e.status === filter);

  const handleCreate = async () => {
    try { setError(''); await api.createCommunityEvent(formData); setShowCreate(false); setFormData({ title: '', description: '', date: '', location: '' }); load(); }
    catch (e: any) { setError(e.message); }
  };

  const handleRsvp = async (eventId: string) => {
    try { setError(''); await api.rsvpEvent(eventId, { userId }); load(); }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All Events</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="sm:flex-1" />
        <Button onClick={() => { setFormData({ title: '', description: '', date: '', location: '' }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Event
        </Button>
      </div>
      <div className="space-y-3">
        {filtered.map(ev => (
          <Card key={ev.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold truncate">{ev.title}</h4>
                    <Badge variant={ev.status === 'upcoming' ? 'info' : ev.status === 'ongoing' ? 'success' : ev.status === 'completed' ? 'secondary' : 'destructive'} className="shrink-0">{ev.status}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3 shrink-0" />{ev.date ? new Date(ev.date).toLocaleDateString() : 'TBD'}</span>
                    {ev.location && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3 shrink-0" />{ev.location}</span>}
                    <span>{ev.rsvpCount || 0} RSVP(s)</span>
                  </div>
                  {ev.description && <p className="text-sm text-muted-foreground mt-1">{ev.description}</p>}
                </div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0" onClick={() => handleRsvp(ev.id)}>
                <CheckCircle className="w-4 h-4 mr-1" />RSVP
              </Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No events found</p>}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Event" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Title</label><Input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Location</label><Input value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} /></div>
          </div>
          <div><label className="text-sm font-medium">Date</label><Input type="datetime-local" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} /></div>
          <div><label className="text-sm font-medium">Description</label><Textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Event</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SurveysSection() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [conferences, setConferences] = useState<PTConference[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<Record<string, string>>({});
  const [showBook, setShowBook] = useState(false);
  const [formData, setFormData] = useState({ teacherName: '', parentName: '', date: '', time: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [s, c] = await Promise.all([api.getAlumniSurveys().catch(() => []), api.getPTConferences().catch(() => [])]);
      setSurveys(Array.isArray(s) ? s : []);
      setConferences(Array.isArray(c) ? c : []);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleSubmitSurvey = async () => {
    try { setError(''); if (selectedSurvey) { await api.submitAlumniSurvey(selectedSurvey, { responses: responseData }); setSelectedSurvey(null); setResponseData({}); } }
    catch (e: any) { setError(e.message); }
  };

  const handleBookConference = async () => {
    try { setError(''); await api.bookPTConference(formData); setShowBook(false); setFormData({ teacherName: '', parentName: '', date: '', time: '', notes: '' }); load(); }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-orange-500" /> Surveys</h3>
          <span className="text-xs text-muted-foreground">{surveys.length} survey(s)</span>
        </div>
        <div className="space-y-3">
          {surveys.map(s => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold truncate">{s.title || 'Survey'}</h4>
                    {s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}
                    <Badge variant={s.status === 'active' ? 'success' : 'secondary'} className="mt-1">{s.status || 'active'}</Badge>
                  </div>
                </div>
                {s.status !== 'closed' && (
                  <Button size="sm" variant="outline" className="shrink-0" onClick={() => setSelectedSurvey(s.id)}>
                    <CheckCircle className="w-4 h-4 mr-1" />Respond
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {surveys.length === 0 && <p className="text-center text-muted-foreground py-4">No surveys found</p>}
        </div>
      </div>

      <div className="border-t border-border/50 pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2"><Handshake className="w-4 h-4 text-orange-500" /> PT Conferences</h3>
          <Button size="sm" onClick={() => { setFormData({ teacherName: '', parentName: '', date: '', time: '', notes: '' }); setShowBook(true); }}>
            <Plus className="w-4 h-4 mr-1" />Book Conference
          </Button>
        </div>
        <div className="space-y-3">
          {conferences.map(c => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Handshake className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold truncate">{c.teacherName} & {c.parentName}</h4>
                      <Badge variant={c.status === 'scheduled' ? 'info' : c.status === 'completed' ? 'success' : 'secondary'} className="shrink-0">{c.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span>{c.date ? new Date(c.date).toLocaleDateString() : ''}</span>
                      {c.time && <span> at {c.time}</span>}
                    </div>
                    {c.notes && <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {conferences.length === 0 && <p className="text-center text-muted-foreground py-4">No conferences found</p>}
        </div>
      </div>

      <Modal isOpen={selectedSurvey !== null} onClose={() => setSelectedSurvey(null)} title="Submit Survey Response" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Provide your responses to the survey questions.</p>
          <div>
            <label className="text-sm font-medium">Your Response</label>
            <Textarea value={responseData.response || ''} onChange={e => setResponseData({ response: e.target.value })} className="min-h-[120px]" placeholder="Enter your response..." />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSelectedSurvey(null)}>Cancel</Button>
            <Button onClick={handleSubmitSurvey}>Submit Response</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBook} onClose={() => setShowBook(false)} title="Book PT Conference" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Teacher Name</label><Input value={formData.teacherName} onChange={e => setFormData(f => ({ ...f, teacherName: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Parent Name</label><Input value={formData.parentName} onChange={e => setFormData(f => ({ ...f, parentName: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Date</label><Input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Time</label><Input type="time" value={formData.time} onChange={e => setFormData(f => ({ ...f, time: e.target.value }))} /></div>
          </div>
          <div><label className="text-sm font-medium">Notes</label><Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowBook(false)}>Cancel</Button>
            <Button onClick={handleBookConference}>Book Conference</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
