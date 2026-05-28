import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Users, Megaphone, Calendar, Heart,
  Newspaper, Vote, Star, MessageCircle
} from 'lucide-react';

interface AlumniProfile {
  id: string; name: string; graduationYear: number; occupation: string; status: string;
}
interface Campaign {
  id: string; title: string; goal: number; raised: number; status: string; deadline: string;
}
interface CommunityEvent {
  id: string; title: string; date: string; type: string; status: string;
}
interface CommunityPoll {
  id: string; question: string; totalVotes: number; status: string;
}
interface AlumniNews {
  id: string; title: string; date: string; category: string;
}

export default function ManagerAlumni() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [news, setNews] = useState<AlumniNews[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [p, c, e, pl, n] = await Promise.all([
          api.getAlumniProfiles().catch(() => []),
          api.getCampaigns().catch(() => []),
          api.getCommunityEvents().catch(() => []),
          api.getCommunityPolls().catch(() => []),
          api.getAlumniNews().catch(() => []),
        ]);
        setProfiles(Array.isArray(p) ? p : []);
        setCampaigns(Array.isArray(c) ? c : []);
        setEvents(Array.isArray(e) ? e : []);
        setPolls(Array.isArray(pl) ? pl : []);
        setNews(Array.isArray(n) ? n : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badgeVariant = (status: string) => {
    const map: Record<string, string> = {
      active: 'success', inactive: 'secondary', completed: 'success',
      upcoming: 'info', ongoing: 'warning', cancelled: 'destructive',
      published: 'success', draft: 'secondary',
    };
    return (map[status] || 'default') as any;
  };

  const engagementScore = profiles.length > 0
    ? Math.round((events.filter(e => e.status === 'completed').length / Math.max(profiles.length, 1)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alumni Overview</h1>
        <p className="text-muted-foreground">Profiles, campaigns, events & community</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{profiles.length}</p><p className="text-sm text-muted-foreground">Registered Alumni</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Megaphone className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p><p className="text-sm text-muted-foreground">Active Campaigns</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Calendar className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{events.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length}</p><p className="text-sm text-muted-foreground">Upcoming Events</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Heart className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{engagementScore}%</p><p className="text-sm text-muted-foreground">Engagement Score</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Newspaper className="w-4 h-4 text-orange-500" />Recent News</h3>
          {news.length === 0 ? <p className="text-muted-foreground text-center py-6">No alumni news</p> : (
            <div className="space-y-3">
              {news.slice(0, 5).map(n => (
                <div key={n.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.category}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{n.date ? new Date(n.date).toLocaleDateString() : ''}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Vote className="w-4 h-4 text-orange-500" />Active Polls</h3>
          {polls.filter(p => p.status === 'active' || p.status === 'ongoing').length === 0 ? <p className="text-muted-foreground text-center py-6">No active polls</p> : (
            <div className="space-y-3">
              {polls.filter(p => p.status === 'active' || p.status === 'ongoing').slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{p.question}</p>
                    <p className="text-xs text-muted-foreground">{p.totalVotes || 0} votes</p>
                  </div>
                  <Badge variant="warning">{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
