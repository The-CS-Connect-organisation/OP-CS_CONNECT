import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  HeartPulse, MessageSquare, ClipboardList, Shield,
  Calendar, User, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';

interface Session {
  id: string; studentName: string; counsellor: string; date: string; type: string; status: string;
}
interface Referral {
  id: string; studentName: string; referredBy: string; reason: string; priority: string; status: string; date: string;
}
interface CarePlan {
  id: string; studentName: string; goals: string; reviewDate: string; status: string;
}
interface Grievance {
  id: string; studentName: string; subject: string; status: string; date: string;
}

export default function ManagerCounselling() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [s, r, c, g] = await Promise.all([
          api.getCounsellingSessions().catch(() => []),
          api.getReferrals().catch(() => []),
          api.getCarePlans().catch(() => []),
          api.getGrievances().catch(() => []),
        ]);
        setSessions(Array.isArray(s) ? s : []);
        setReferrals(Array.isArray(r) ? r : []);
        setCarePlans(Array.isArray(c) ? c : []);
        setGrievances(Array.isArray(g) ? g : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badgeVariant = (status: string) => {
    const map: Record<string, string> = {
      scheduled: 'info', completed: 'success', cancelled: 'destructive',
      active: 'success', inactive: 'secondary', resolved: 'success',
      pending: 'warning', open: 'warning', closed: 'secondary',
      low: 'info', medium: 'warning', high: 'destructive',
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
        <h1 className="text-2xl font-bold">Counselling Overview</h1>
        <p className="text-muted-foreground">Sessions, referrals, care plans & grievances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><HeartPulse className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{sessions.filter(s => s.status === 'scheduled' || s.status === 'completed').length}</p><p className="text-sm text-muted-foreground">Total Sessions</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><MessageSquare className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{referrals.filter(r => r.status === 'pending').length}</p><p className="text-sm text-muted-foreground">Pending Referrals</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><ClipboardList className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{carePlans.filter(p => p.status === 'active').length}</p><p className="text-sm text-muted-foreground">Active Care Plans</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Shield className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{grievances.filter(g => g.status === 'open').length}</p><p className="text-sm text-muted-foreground">Open Grievances</p></div></div></Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" />Recent Sessions</h3>
        {sessions.length === 0 ? <p className="text-muted-foreground text-center py-6">No sessions recorded</p> : (
          <div className="space-y-3">
            {sessions.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-orange-500" />
                  <div><p className="font-medium text-sm">{s.studentName}</p><p className="text-xs text-muted-foreground">{s.counsellor} &bull; {s.type}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground"><Calendar className="w-3 h-3 inline mr-1" />{s.date ? new Date(s.date).toLocaleDateString() : 'N/A'}</span>
                  <Badge variant={badgeVariant(s.status)}>{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" />Pending Referrals</h3>
        {referrals.filter(r => r.status === 'pending').length === 0 ? <p className="text-muted-foreground text-center py-6">No pending referrals</p> : (
          <div className="space-y-3">
            {referrals.filter(r => r.status === 'pending').map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="font-medium text-sm">{r.studentName}</p>
                  <p className="text-xs text-muted-foreground">Referred by: {r.referredBy} &bull; {r.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant(r.priority)}>{r.priority}</Badge>
                  <span className="text-xs text-muted-foreground">{r.date ? new Date(r.date).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

