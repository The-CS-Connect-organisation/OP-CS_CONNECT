import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Plus, MapPin, Calendar, User, Check, Archive } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

export default function StudentLostAndFound() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    try {
      const data = await api.getLostFoundItems();
      setItems(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !location.trim()) return;
    setSubmitting(true);
    try {
      await api.createLostFoundItem({
        title,
        description,
        type,
        location,
        reportedBy: user?.name || 'Unknown',
        date: new Date().toISOString(),
        status: 'active',
      });
      setTitle('');
      setDescription('');
      setLocation('');
      setShowForm(false);
      refresh();
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const filteredItems = items.filter(i => filter === 'all' || i.type === filter);

  if (loading) return <div className="p-6"><Card className="p-8 animate-pulse h-48" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lost & Found</h1>
          <p className="text-muted-foreground">Report or find lost items</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Report Item'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4 border-orange-200">
          <h3 className="font-semibold text-lg">Report an Item</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setType('lost')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'lost' ? 'bg-red-100 text-red-700 border-2 border-red-300' : 'bg-accent'}`}
            >
              I Lost Something
            </button>
            <button
              onClick={() => setType('found')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'found' ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-accent'}`}
            >
              I Found Something
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Item Name</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What is the item?"
              className="w-full px-3 py-2 rounded-lg border bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Color, brand, distinguishing features..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border bg-background resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Where was it lost/found?"
              className="w-full px-3 py-2 rounded-lg border bg-background"
            />
          </div>
          <Button onClick={handleSubmit} disabled={submitting || !title.trim() || !location.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </Card>
      )}

      <div className="flex gap-2">
        {['all', 'lost', 'found'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-accent hover:bg-accent/80'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map(item => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <Badge className={item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>{item.type}</Badge>
              <Badge variant="secondary">{item.status}</Badge>
            </div>
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{item.location}</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(item.date).toLocaleDateString()}</div>
              <div className="flex items-center gap-2"><User className="w-4 h-4" />{item.reportedBy}</div>
            </div>
          </Card>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-2">
            <Card className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">Click "Report Item" to report a lost or found item.</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
