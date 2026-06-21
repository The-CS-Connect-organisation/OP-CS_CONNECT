import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Bus, MapPin, Clock, Navigation, Phone, User } from 'lucide-react';

export default function ParentBusTracking() {
  const { user } = useAuthStore();
  const children: { id: string; name: string }[] = user?.children
    ? (Array.isArray(user.children) ? user.children.map((c: any) => typeof c === 'string' ? { id: c, name: `Child` } : c) : [])
    : [];
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(children[0]?.id || '');
  const [busInfo, setBusInfo] = useState({
    routeName: '',
    busNumber: '',
    driverName: '',
    driverPhone: '',
    currentLocation: '',
    estimatedArrival: '',
    status: 'on-time' as string,
    stops: [] as { name: string; time: string; reached: boolean }[],
  });

  useEffect(() => {
    if (!selectedChild) return;
    loadBusInfo();
    const interval = setInterval(loadBusInfo, 30000);
    return () => clearInterval(interval);
  }, [selectedChild]);

  const loadBusInfo = async () => {
    try {
      setLoading(true);
      const data = await api.getChildBusTracking(selectedChild);
      const r = data || {};
      setBusInfo({
        routeName: r.routeName || r.name || 'Bus Route',
        busNumber: r.busNumber || r.bus || 'N/A',
        driverName: r.driverName || r.driver || 'Unknown',
        driverPhone: r.driverPhone || r.phone || 'N/A',
        currentLocation: r.currentLocation?.address ?? r.currentLocation ?? 'Unknown',
        estimatedArrival: r.estimatedArrival || '--:--',
        status: r.status || 'on-time',
        stops: Array.isArray(r.stops)
          ? r.stops.map((s: any) => typeof s === 'string' ? { name: s, time: '--:--', reached: false } : s)
          : [],
      });
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'bg-green-100 text-green-700';
      case 'delayed': return 'bg-red-100 text-red-700';
      case 'arrived': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bus Tracking</h1>
          <p className="text-muted-foreground">Live bus tracking</p>
        </div>
        {children.length > 1 && (
        <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Bus className="w-8 h-8 text-orange-500" />
              <div>
                <h2 className="text-xl font-bold">{busInfo.routeName}</h2>
                <p className="text-sm text-muted-foreground">Bus #{busInfo.busNumber}</p>
              </div>
            </div>
            <Badge className={getStatusColor(busInfo.status)}>{busInfo.status}</Badge>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                <User className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">{busInfo.driverName}</p>
                  <p className="text-sm text-muted-foreground">Driver</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                <Phone className="w-5 h-5 text-orange-500" />
                <p className="font-medium">{busInfo.driverPhone}</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                <MapPin className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">{busInfo.currentLocation}</p>
                  <p className="text-sm text-muted-foreground">Current Location</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">{busInfo.estimatedArrival}</p>
                  <p className="text-sm text-muted-foreground">Estimated Arrival</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Route Stops</h3>
            <div className="space-y-3">
              {busInfo.stops.map((stop, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${stop.reached ? 'bg-green-50' : 'bg-accent'}`}>
                  <div className={`w-3 h-3 rounded-full ${stop.reached ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1">
                    <p className="font-medium">{stop.name}</p>
                    <p className="text-sm text-muted-foreground">{stop.time}</p>
                  </div>
                  {stop.reached && <Badge variant="secondary">Reached</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
