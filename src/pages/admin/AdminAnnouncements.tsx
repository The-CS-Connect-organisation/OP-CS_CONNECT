import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Megaphone, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'academic';
  author: string;
  createdAt: string;
  expiresAt?: string;
  priority: 'low' | 'medium' | 'high';
  audience?: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'general' as Announcement['type'], priority: 'medium' as Announcement['priority'], expiresAt: '', audience: 'all' as 'all' | 'students' | 'teachers' | 'parents' | 'staff' });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await api.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[AdminAnnouncements] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    const prev = announcements;
    try {
      const newAnnouncement = await api.createAnnouncement(form);
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setForm({ title: '', content: '', type: 'general', priority: 'medium', expiresAt: '', audience: 'all' });
      setShowForm(false);
    } catch (err) {
      console.error('[AdminAnnouncements] Failed to create:', err);
      setAnnouncements(prev);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = announcements;
    try {
      await api.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('[AdminAnnouncements] Failed to delete:', err);
      setAnnouncements(prev);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'event': return 'bg-orange-100 text-orange-700';
      case 'academic': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">School-wide announcements</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Create Announcement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="px-3 py-2 rounded-lg border bg-background">
              <option value="general">General</option>
              <option value="urgent">Urgent</option>
              <option value="event">Event</option>
              <option value="academic">Academic</option>
            </select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })} className="px-3 py-2 rounded-lg border bg-background">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as any })} className="px-3 py-2 rounded-lg border bg-background">
              <option value="all">All Roles</option>
              <option value="students">Students Only</option>
              <option value="teachers">Teachers Only</option>
              <option value="parents">Parents Only</option>
              <option value="staff">Staff/Admin Only</option>
            </select>
            <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="px-3 py-2 rounded-lg border bg-background md:col-span-2" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <div className="space-y-4">
          {announcements.map(announcement => (
            <Card key={announcement.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Megaphone className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                    <Badge className={getTypeColor(announcement.type)}>{announcement.type}</Badge>
                    {announcement.priority === 'high' && <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />High Priority</Badge>}
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 capitalize border-purple-200">To: {announcement.audience || 'all'}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By: {announcement.author}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    {announcement.expiresAt && <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(announcement.id)} className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
