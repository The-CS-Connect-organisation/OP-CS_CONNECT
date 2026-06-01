import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Plus, MapPin, Calendar, User, Check, Archive } from 'lucide-react';
import { api } from '@/lib/api';

interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  location: string;
  date: string;
  reportedBy: string;
  status: 'active' | 'claimed' | 'archived';
  image?: string;
}

const mockItems: LostFoundItem[] = [
  { id: '1', title: 'Blue backpack', description: 'Found near gymnasium', type: 'found', location: 'Gymnasium', date: '2026-05-15', reportedBy: 'Staff', status: 'active' },
  { id: '2', title: 'Math textbook', description: 'Lost in library', type: 'lost', location: 'Library', date: '2026-05-14', reportedBy: 'Student', status: 'active' },
  { id: '3', title: 'Water bottle', description: 'Found in cafeteria', type: 'found', location: 'Cafeteria', date: '2026-05-13', reportedBy: 'Teacher', status: 'claimed' },
];

export default function AdminLostFound() {
  const [items, setItems] = useState<LostFoundItem[]>(mockItems);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getLostFoundItems();
        if (Array.isArray(data)) setItems(data);
      } catch (err) { console.error('[AdminLostFound] Failed to load:', err); }
    })();
  }, []);

  const handleClaim = async (id: string) => {
    const prev = items;
    try {
      await api.claimLostFoundItem(id);
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'claimed' as const } : i));
    } catch (err) {
      console.error('[AdminLostFound] Failed to claim item:', err);
      setItems(prev);
    }
  };

  const handleArchive = async (id: string) => {
    const prev = items;
    try {
      await api.archiveLostFoundItem(id);
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'archived' as const } : i));
    } catch (err) {
      console.error('[AdminLostFound] Failed to archive item:', err);
      setItems(prev);
    }
  };

  const filteredItems = items.filter(i => filter === 'all' || i.type === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lost & Found</h1>
          <p className="text-muted-foreground">Track lost & found items</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Report Item</Button>
      </div>

      <div className="flex gap-2">
        {['all', 'lost', 'found'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-accent hover:bg-accent/80'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
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
            {item.status === 'active' && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => handleClaim(item.id)}><Check className="w-4 h-4 mr-1" />Mark Claimed</Button>
                <Button size="sm" variant="outline" onClick={() => handleArchive(item.id)}><Archive className="w-4 h-4 mr-1" />Archive</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

