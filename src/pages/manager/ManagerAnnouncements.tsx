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
  type: string;
  author: string;
  createdAt: string;
  priority: string;
}

export default function ManagerAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await api.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">School announcements</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />New Announcement</Button>
      </div>

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
                    <Badge variant="secondary">{announcement.type}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By: {announcement.author}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(announcement.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
