import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Trophy, Users, Calendar, Activity,
  Star, Medal, AlertTriangle, Siren
} from 'lucide-react';

interface Programme {
  id: string; name: string; sport: string; status: string;
}
interface Team {
  id: string; name: string; sport: string; wins: number; losses: number; draws: number;
}
interface Game {
  id: string; homeTeam: string; awayTeam: string; date: string; status: string;
}
interface Injury {
  id: string; studentName: string; sport: string; injury: string; status: string; date: string;
}

export default function ManagerAthletics() {
  const [loading, setLoading] = useState(true);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [injuries, setInjuries] = useState<Injury[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [p, t, g, i] = await Promise.all([
          api.getSportProgrammes().catch(() => []),
          api.getTeams().catch(() => []),
          api.getGames().catch(() => []),
          api.getSportsInjuries().catch(() => []),
        ]);
        setProgrammes(Array.isArray(p) ? p : []);
        setTeams(Array.isArray(t) ? t : []);
        setGames(Array.isArray(g) ? g : []);
        setInjuries(Array.isArray(i) ? i : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badgeVariant = (status: string) => {
    const map: Record<string, string> = {
      active: 'success', inactive: 'secondary', completed: 'success',
      scheduled: 'info', cancelled: 'destructive', ongoing: 'warning',
    };
    return (map[status] || 'default') as any;
  };

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
        <h1 className="text-2xl font-bold">Athletics Overview</h1>
        <p className="text-muted-foreground">Programmes, teams, games & injuries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><Trophy className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{programmes.filter(p => p.status === 'active').length}</p><p className="text-sm text-muted-foreground">Active Programmes</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{teams.length}</p><p className="text-sm text-muted-foreground">Teams</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Calendar className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{games.filter(g => g.status === 'scheduled').length}</p><p className="text-sm text-muted-foreground">Upcoming Games</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Activity className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{injuries.filter(i => i.status === 'active').length}</p><p className="text-sm text-muted-foreground">Active Injuries</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Medal className="w-4 h-4 text-orange-500" />Team Standings</h3>
          {teams.length === 0 ? <p className="text-muted-foreground text-center py-6">No teams</p> : (
            <div className="space-y-3">
              {teams.map(t => {
                const total = (t.wins || 0) + (t.losses || 0) + (t.draws || 0);
                const winPct = total > 0 ? Math.round(((t.wins || 0) / total) * 100) : 0;
                return (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.sport}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{t.wins || 0}W - {t.losses || 0}L - {t.draws || 0}D</p>
                      <p className="text-xs text-muted-foreground">{winPct}% win rate</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-orange-500" />Upcoming Schedule</h3>
          {games.filter(g => g.status === 'scheduled').length === 0 ? <p className="text-muted-foreground text-center py-6">No upcoming games</p> : (
            <div className="space-y-3">
              {games.filter(g => g.status === 'scheduled').slice(0, 5).map(g => (
                <div key={g.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{g.homeTeam} vs {g.awayTeam}</p>
                    <p className="text-xs text-muted-foreground">{g.date ? new Date(g.date).toLocaleDateString() : ''}</p>
                  </div>
                  <Badge variant="info">Upcoming</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
