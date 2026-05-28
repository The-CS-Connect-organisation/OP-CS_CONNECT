import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Heart, Syringe, Brain, Stethoscope,
  Calendar, User, AlertTriangle, Activity
} from 'lucide-react';

interface HealthRecord {
  id: string; studentName: string; type: string; date: string; notes: string;
}
interface Immunisation {
  id: string; studentName: string; vaccine: string; dueDate: string; status: string;
}
interface IEP {
  id: string; studentName: string; condition: string; status: string;
}
interface NurseVisit {
  id: string; studentName: string; reason: string; date: string; followUp: boolean;
}

export default function ManagerHealth() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [immunisations, setImmunisations] = useState<Immunisation[]>([]);
  const [ieps, setIeps] = useState<IEP[]>([]);
  const [visits, setVisits] = useState<NurseVisit[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [r, i, e, v] = await Promise.all([
          api.getHealthRecords().catch(() => []),
          api.getImmunisations().catch(() => []),
          api.getIEPs().catch(() => []),
          api.getNurseVisits().catch(() => []),
        ]);
        setRecords(Array.isArray(r) ? r : []);
        setImmunisations(Array.isArray(i) ? i : []);
        setIeps(Array.isArray(e) ? e : []);
        setVisits(Array.isArray(v) ? v : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badgeVariant = (status: string) => {
    const map: Record<string, string> = {
      completed: 'success', pending: 'warning', overdue: 'destructive',
      active: 'success', inactive: 'secondary',
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
        <h1 className="text-2xl font-bold">Health Overview</h1>
        <p className="text-muted-foreground">Health records, immunisations, IEPs & nurse visits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><Heart className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{records.length}</p><p className="text-sm text-muted-foreground">Health Records</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Syringe className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{immunisations.filter(i => i.status === 'pending' || i.status === 'overdue').length}</p><p className="text-sm text-muted-foreground">Immunisations Due</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Brain className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{ieps.filter(e => e.status === 'active').length}</p><p className="text-sm text-muted-foreground">Active IEPs</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Stethoscope className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{visits.length}</p><p className="text-sm text-muted-foreground">Nurse Visits</p></div></div></Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-orange-500" />Recent Health Records</h3>
        {records.length === 0 ? <p className="text-muted-foreground text-center py-6">No health records</p> : (
          <div className="space-y-3">
            {records.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-orange-500" />
                  <div><p className="font-medium text-sm">{r.studentName}</p><p className="text-xs text-muted-foreground">{r.type}{r.notes ? ` &bull; ${r.notes}` : ''}</p></div>
                </div>
                <span className="text-xs text-muted-foreground">{r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" />Upcoming Immunisations</h3>
        {immunisations.filter(i => i.status === 'pending' || i.status === 'overdue').length === 0 ? <p className="text-muted-foreground text-center py-6">No immunisations due</p> : (
          <div className="space-y-3">
            {immunisations.filter(i => i.status === 'pending' || i.status === 'overdue').slice(0, 5).map(i => (
              <div key={i.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="font-medium text-sm">{i.studentName}</p>
                  <p className="text-xs text-muted-foreground">{i.vaccine}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant(i.status)}>{i.status}</Badge>
                  <span className="text-xs text-muted-foreground">Due: {i.dueDate ? new Date(i.dueDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
