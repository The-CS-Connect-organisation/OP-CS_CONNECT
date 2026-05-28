import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Bus, Route, Users, Clock,
  AlertTriangle, MapPin, Truck, Calendar
} from 'lucide-react';

interface TransportRoute {
  id: string; name: string; vehicleIds: string[]; stops: number; students: number; status: string;
}
interface Vehicle {
  id: string; registration: string; model: string; capacity: number; status: string;
}
interface Driver {
  id: string; name: string; license: string; routeId: string; status: string;
}
interface Delay {
  id: string; route: string; reason: string; duration: string; date: string;
}

export default function ManagerTransport() {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [delays, setDelays] = useState<Delay[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [r, v, d, dl] = await Promise.all([
          api.getTransportRoutes().catch(() => []),
          api.getFleetVehicles().catch(() => []),
          api.getDrivers().catch(() => []),
          api.getDelays().catch(() => []),
        ]);
        setRoutes(Array.isArray(r) ? r : []);
        setVehicles(Array.isArray(v) ? v : []);
        setDrivers(Array.isArray(d) ? d : []);
        setDelays(Array.isArray(dl) ? dl : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badgeVariant = (status: string) => {
    const map: Record<string, string> = {
      active: 'success', inactive: 'secondary', maintenance: 'warning',
      on_route: 'success', off_duty: 'secondary', available: 'info',
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
        <h1 className="text-2xl font-bold">Transport Overview</h1>
        <p className="text-muted-foreground">Routes, vehicles, drivers & delays</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><Route className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{routes.filter(r => r.status === 'active').length}</p><p className="text-sm text-muted-foreground">Active Routes</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Bus className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'active').length}</p><p className="text-sm text-muted-foreground">Active Vehicles</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{drivers.filter(d => d.status === 'active' || d.status === 'on_route').length}</p><p className="text-sm text-muted-foreground">Active Drivers</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><AlertTriangle className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{delays.length}</p><p className="text-sm text-muted-foreground">Delays This Week</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" />Route List</h3>
          {routes.length === 0 ? <p className="text-muted-foreground text-center py-6">No routes</p> : (
            <div className="space-y-3">
              {routes.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-muted-foreground">{r.stops || 0} stops &bull; {r.students || 0} students</p></div>
                  <Badge variant={badgeVariant(r.status)}>{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-orange-500" />Vehicle Status</h3>
          {vehicles.length === 0 ? <p className="text-muted-foreground text-center py-6">No vehicles</p> : (
            <div className="space-y-3">
              {vehicles.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div><p className="font-medium text-sm">{v.registration || v.model}</p><p className="text-xs text-muted-foreground">Capacity: {v.capacity || 'N/A'}</p></div>
                  <Badge variant={badgeVariant(v.status)}>{v.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}