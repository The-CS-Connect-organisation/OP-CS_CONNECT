import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Calendar, Plus, MapPin, Clock, Users, Edit, Trash2, X, Search, Tag, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: string;
  status: string;
}

const EMPTY_FORM = {
  title: '', description: '', date: '', time: '',
  location: '', attendees: 0, type: 'academic', status: 'upcoming',
};

export default function ManagerEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[ManagerEvents] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.updateEvent(editingId, form);
      } else {
        await api.createEvent(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      loadEvents();
    } catch (err) {
      console.error('[ManagerEvents] Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('[ManagerEvents] Failed to delete:', err);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      location: event.location || '',
      attendees: event.attendees || 0,
      type: event.type || 'academic',
      status: event.status || 'upcoming',
    });
    setShowForm(true);
  };

  const filteredEvents = events.filter(e =>
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingCount = events.filter(e => e.status === 'upcoming' || e.status === 'scheduled').length;
  const completedCount = events.filter(e => e.status === 'completed').length;
  const totalAttendees = events.reduce((s, e) => s + (e.attendees || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">School events & activities management</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />New Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-orange-500" />
            <div><p className="text-2xl font-bold stat-value">{events.length}</p><p className="text-sm text-muted-foreground">Total Events</p></div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-blue-500" />
            <div><p className="text-2xl font-bold stat-value">{upcomingCount}</p><p className="text-sm text-muted-foreground">Upcoming</p></div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-500" />
            <div><p className="text-2xl font-bold stat-value">{totalAttendees}</p><p className="text-sm text-muted-foreground">Total Attendees</p></div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <Tag className="w-8 h-8 text-purple-500" />
            <div><p className="text-2xl font-bold stat-value">{completedCount}</p><p className="text-sm text-muted-foreground">Completed</p></div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Event' : 'New Event'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="Annual Sports Day" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[80px]" placeholder="Event description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="School Auditorium" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="meeting">Meeting</option>
                    <option value="holiday">Holiday</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Attendees</label>
                  <input type="number" min="0" value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: Number(e.target.value) }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={saving || !form.title}>
                  {saving ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border rounded-lg">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No events found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(event => {
            const isPast = new Date(event.date) < new Date();
            return (
              <Card key={event.id} className={`p-4 card-hover ${isPast && event.status !== 'cancelled' ? 'opacity-75' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      event.type === 'sports' ? 'bg-green-50 text-green-600' :
                      event.type === 'cultural' ? 'bg-purple-50 text-purple-600' :
                      event.type === 'meeting' ? 'bg-blue-50 text-blue-600' :
                      event.type === 'holiday' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <Badge variant="secondary" className="text-[10px]">{event.type}</Badge>
                    </div>
                  </div>
                  <Badge className={
                    event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                    event.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                    event.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }>{event.status}</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                )}
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} attendees</span>
                  </div>
                </div>
                <div className="flex justify-end gap-1 mt-3 pt-3 border-t">
                  <button onClick={() => handleEdit(event)} className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(event.id)} className="p-1.5 hover:bg-red-100 rounded text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
