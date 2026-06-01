import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Users, TreePine, Vote, Briefcase,
  Calendar, MapPin, Star, Clock
} from 'lucide-react';

interface Club {
  id: string; name: string; category: string; memberCount: number; status: string;
}
interface FieldTrip {
  id: string; name: string; destination: string; date: string; status: string;
}
interface Election {
  id: string; title: string; deadline: string; status: string;
}
interface ServiceHour {
  id: string; studentName: string; hours: number; activity: string; date: string;
}
interface ClubActivity {
  id: string; clubId: string; name: string; date: string;
}

export default function ManagerActivities() {
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [fieldTrips, setFieldTrips] = useState<FieldTrip[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [serviceHours, setServiceHours] = useState<ServiceHour[]>([]);
  const [activities, setActivities] = useState<ClubActivity[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [c, f, e, s, a] = await Promise.all([
          api.getClubsExtended().catch(() => []),
          api.getFieldTrips().catch(() => []),
          api.getElections().catch(() => []),
          api.getServiceHours().catch(() => []),
          api.getClubActivities().catch(() => []),
        ]);
        setClubs(Array.isArray(c) ? c : []);
        setFieldTrips(Array.isArray(f) ? f : []);
        setElections(Array.isArray(e) ? e : []);
        setServiceHours(Array.isArray(s) ? s : []);
        setActivities(Array.isArray(a) ? a : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badgeVariant = (status: string) => {
    const map: Record<string, string> = {
      active: 'success', inactive: 'secondary', upcoming: 'info', completed: 'success',
      cancelled: 'destructive', open: 'warning', closed: 'secondary',
    };
    return (map[status] || 'default') as any;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activities Overview</h1>
        <p className="text-muted-foreground">Clubs, field trips, elections & service hours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{clubs.filter(c => c.status === 'active').length}</p><p className="text-sm text-muted-foreground">Active Clubs</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><TreePine className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{fieldTrips.filter(f => f.status === 'upcoming').length}</p><p className="text-sm text-muted-foreground">Upcoming Field Trips</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Vote className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{elections.filter(e => e.status === 'open').length}</p><p className="text-sm text-muted-foreground">Active Elections</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Briefcase className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{serviceHours.reduce((sum, s) => sum + (s.hours || 0), 0)}</p><p className="text-sm text-muted-foreground">Service Hours Logged</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-orange-500" />Recent Activities</h3>
          {activities.length === 0 ? <p className="text-muted-foreground text-center py-6">No activities</p> : (
            <div className="space-y-3">
              {activities.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <p className="font-medium text-sm">{a.name}</p>
                  <span className="text-xs text-muted-foreground">{a.date ? new Date(a.date).toLocaleDateString() : ''}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" />Active Clubs</h3>
          {clubs.filter(c => c.status === 'active').length === 0 ? <p className="text-muted-foreground text-center py-6">No active clubs</p> : (
            <div className="space-y-3">
              {clubs.filter(c => c.status === 'active').map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div><p className="font-medium text-sm">{c.name}</p><p className="text-xs text-muted-foreground">{c.category}</p></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground"><Users className="w-3 h-3 inline mr-1" />{c.memberCount || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

