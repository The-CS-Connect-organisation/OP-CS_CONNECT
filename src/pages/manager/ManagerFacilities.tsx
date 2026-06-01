import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Building2, DoorOpen, Wrench, ClipboardCheck,
  Calendar, AlertTriangle, Clock, Hammer
} from 'lucide-react';

interface Building {
  id: string; name: string; floors: number; rooms: number;
}
interface Room {
  id: string; name: string; building: string; capacity: number; status: string;
}
interface WorkOrder {
  id: string; title: string; location: string; priority: string; status: string; date: string;
}
interface Inspection {
  id: string; area: string; date: string; status: string; inspector: string;
}

export default function ManagerFacilities() {
  const [loading, setLoading] = useState(true);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [b, r, w, i] = await Promise.all([
          api.getBuildings().catch(() => []),
          api.getFacilityRooms().catch(() => []),
          api.getWorkOrders().catch(() => []),
          api.getInspections().catch(() => []),
        ]);
        setBuildings(Array.isArray(b) ? b : []);
        setRooms(Array.isArray(r) ? r : []);
        setWorkOrders(Array.isArray(w) ? w : []);
        setInspections(Array.isArray(i) ? i : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badgeVariant = (status: string) => {
    const map: Record<string, string> = {
      open: 'warning', 'in-progress': 'info', completed: 'success', pending: 'warning',
      scheduled: 'info', passed: 'success', failed: 'destructive',
      low: 'info', medium: 'warning', high: 'destructive', urgent: 'destructive',
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
        <h1 className="text-2xl font-bold">Facilities Overview</h1>
        <p className="text-muted-foreground">Buildings, rooms, work orders & inspections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><Building2 className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{buildings.length}</p><p className="text-sm text-muted-foreground">Buildings</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><DoorOpen className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{rooms.filter(r => r.status === 'active' || !r.status).length}</p><p className="text-sm text-muted-foreground">Rooms</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Wrench className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{workOrders.filter(w => w.status === 'open' || w.status === 'in-progress' || w.status === 'pending').length}</p><p className="text-sm text-muted-foreground">Open Work Orders</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><ClipboardCheck className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{inspections.filter(i => i.status === 'scheduled' || i.status === 'pending').length}</p><p className="text-sm text-muted-foreground">Inspections Due</p></div></div></Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Hammer className="w-4 h-4 text-orange-500" />Recent Work Orders</h3>
        {workOrders.length === 0 ? <p className="text-muted-foreground text-center py-6">No work orders</p> : (
          <div className="space-y-3">
            {workOrders.slice(0, 5).map(w => (
              <div key={w.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="font-medium text-sm">{w.title}</p>
                  <p className="text-xs text-muted-foreground">{w.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant(w.priority)}>{w.priority}</Badge>
                  <Badge variant={badgeVariant(w.status)}>{w.status}</Badge>
                  <span className="text-xs text-muted-foreground">{w.date ? new Date(w.date).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500" />Upcoming Inspections</h3>
        {inspections.filter(i => i.status === 'scheduled' || i.status === 'pending').length === 0 ? <p className="text-muted-foreground text-center py-6">No upcoming inspections</p> : (
          <div className="space-y-3">
            {inspections.filter(i => i.status === 'scheduled' || i.status === 'pending').slice(0, 5).map(i => (
              <div key={i.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="font-medium text-sm">{i.area}</p>
                  <p className="text-xs text-muted-foreground">Inspector: {i.inspector || 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant(i.status)}>{i.status}</Badge>
                  <span className="text-xs text-muted-foreground">{i.date ? new Date(i.date).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

