import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  AlertTriangle, FileText, Clock, ThumbsUp,
  Calendar, User, Shield
} from 'lucide-react';

interface Incident {
  id: string; studentName: string; type: string; date: string; severity: string; status: string;
}
interface BIP {
  id: string; studentName: string; goal: string; status: string;
}
interface Detention {
  id: string; studentName: string; date: string; reason: string; status: string;
}
interface PositiveBehaviour {
  id: string; studentName: string; behaviour: string; date: string;
}

export default function ManagerDiscipline() {
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [bips, setBips] = useState<BIP[]>([]);
  const [detentions, setDetentions] = useState<Detention[]>([]);
  const [positive, setPositive] = useState<PositiveBehaviour[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [i, b, d, p] = await Promise.all([
          api.getDisciplineIncidents().catch(() => []),
          api.getBIPs().catch(() => []),
          api.getDetentions().catch(() => []),
          api.getPositiveBehaviour().catch(() => []),
        ]);
        setIncidents(Array.isArray(i) ? i : []);
        setBips(Array.isArray(b) ? b : []);
        setDetentions(Array.isArray(d) ? d : []);
        setPositive(Array.isArray(p) ? p : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badgeVariant = (status: string) => {
    const map: Record<string, string> = {
      resolved: 'success', pending: 'warning', open: 'warning', closed: 'secondary',
      active: 'success', inactive: 'secondary', served: 'success', scheduled: 'info',
      low: 'info', medium: 'warning', high: 'destructive',
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
        <h1 className="text-2xl font-bold">Discipline Overview</h1>
        <p className="text-muted-foreground">Incidents, BIPs, detentions & positive behaviour</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><AlertTriangle className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{incidents.filter(i => i.status === 'open' || i.status === 'pending').length}</p><p className="text-sm text-muted-foreground">Open Incidents</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><FileText className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{bips.filter(b => b.status === 'active').length}</p><p className="text-sm text-muted-foreground">Active BIPs</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{detentions.filter(d => d.status === 'scheduled').length}</p><p className="text-sm text-muted-foreground">Scheduled Detentions</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><ThumbsUp className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{positive.length}</p><p className="text-sm text-muted-foreground">Positive Records</p></div></div></Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-orange-500" />Recent Incidents</h3>
        {incidents.length === 0 ? <p className="text-muted-foreground text-center py-6">No incidents recorded</p> : (
          <div className="space-y-3">
            {incidents.slice(0, 5).map(i => (
              <div key={i.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-orange-500" />
                  <div><p className="font-medium text-sm">{i.studentName}</p><p className="text-xs text-muted-foreground">{i.type}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant(i.severity)}>{i.severity}</Badge>
                  <Badge variant={badgeVariant(i.status)}>{i.status}</Badge>
                  <span className="text-xs text-muted-foreground">{i.date ? new Date(i.date).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" />Detention Summary</h3>
        {detentions.length === 0 ? <p className="text-muted-foreground text-center py-6">No detentions</p> : (
          <div className="space-y-3">
            {detentions.slice(0, 5).map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="font-medium text-sm">{d.studentName}</p>
                  <p className="text-xs text-muted-foreground">{d.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant(d.status)}>{d.status}</Badge>
                  <span className="text-xs text-muted-foreground">{d.date ? new Date(d.date).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
