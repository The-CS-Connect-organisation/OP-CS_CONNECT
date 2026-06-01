import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Bus, MapPin, Clock, Navigation, Phone, AlertCircle } from 'lucide-react';

interface BusRoute {
  id: string;
  routeName: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  currentLocation: { lat: number; lng: number; address: string };
  estimatedArrival: string;
  status: 'on-time' | 'delayed' | 'arrived';
  stops: { name: string; time: string; reached: boolean }[];
}

export default function StudentBusTracking() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  useEffect(() => {
    loadRoutes();
    const interval = setInterval(loadRoutes, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await api.getRoutes();
      const mapped = Array.isArray(data) ? data.map((r: any) => ({
        id: r.id,
        routeName: r.name || r.routeName || 'Unnamed Route',
        busNumber: r.bus || r.busNumber || 'N/A',
        driverName: r.driver || r.driverName || 'Unknown',
        driverPhone: r.driverPhone || r.phone || 'N/A',
        currentLocation: r.currentLocation || { lat: 0, lng: 0, address: r.stops?.[0] || 'Unknown' },
        estimatedArrival: r.estimatedArrival || '--:--',
        status: r.status || 'on-time',
        stops: Array.isArray(r.stops)
          ? r.stops.map((s: any) => typeof s === 'string' ? { name: s, time: '--:--', reached: false } : s)
          : [],
      })) : [];
      setRoutes(mapped);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const selectedBus = routes.find(r => r.id === selectedRoute);

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
      <div>
        <h1 className="text-2xl font-bold">Bus Tracking</h1>
        <p className="text-muted-foreground">Live bus location & ETA</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            {routes.map(route => (
              <Card
                key={route.id}
                className={`p-4 cursor-pointer transition-colors ${selectedRoute === route.id ? 'border-orange-500 bg-orange-50/30' : 'hover:border-orange-200'}`}
                onClick={() => setSelectedRoute(route.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bus className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold">{route.routeName}</h3>
                  </div>
                  <Badge className={getStatusColor(route.status)}>{route.status}</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    <span>Bus #{route.busNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>ETA: {route.estimatedArrival}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="md:col-span-2">
            {selectedBus ? (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{selectedBus.routeName}</h2>
                  <Badge className={getStatusColor(selectedBus.status)}>{selectedBus.status}</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-accent rounded-lg">
                    <p className="text-sm text-muted-foreground">Driver</p>
                    <p className="font-medium">{selectedBus.driverName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">{selectedBus.driverPhone}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-accent rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Location</p>
                    <p className="font-medium">{selectedBus.currentLocation.address}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">ETA: {selectedBus.estimatedArrival}</span>
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold mb-3">Route Stops</h3>
                <div className="space-y-3">
                  {selectedBus.stops.map((stop, idx) => (
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
            ) : (
              <Card className="p-8 text-center">
                <Bus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a bus route</h3>
                <p className="text-muted-foreground">Click on a route to see live tracking details</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}