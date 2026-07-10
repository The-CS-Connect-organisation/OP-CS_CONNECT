import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { getSocket } from '@/lib/socket';
import { Bus, MapPin, Clock, Navigation, Phone, AlertCircle, Locate, User } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const busIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface BusData {
  id: string;
  routeName: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  estimatedArrival: string;
  status: 'on-time' | 'delayed' | 'arrived';
  stops: { name: string; time: string; reached: boolean }[];
  onLeave?: boolean;
}

interface Location {
  lat: number;
  lng: number;
}

export default function StudentBusTracking() {
  const { user } = useAuthStore();
  const [routes, setRoutes] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [busLocation, setBusLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    loadRoutes();
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 17.3850, lng: 78.4867 }),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation({ lat: 17.3850, lng: 78.4867 });
    }
  }, []);

  const loadRoutes = async () => {
    try {
      const data = await api.getRoutes();
      const mapped = Array.isArray(data) ? data.map((r: any) => ({
        id: r.id,
        routeName: r.name || r.routeName || 'Unnamed Route',
        busNumber: r.bus || r.busNumber || 'N/A',
        driverName: r.driver || r.driverName || 'Unknown',
        driverPhone: r.driverPhone || r.phone || 'N/A',
        estimatedArrival: r.estimatedArrival || '--:--',
        status: r.status || 'on-time',
        onLeave: !!r.onLeave,
        stops: Array.isArray(r.stops)
          ? r.stops.map((s: any) => typeof s === 'string' ? { name: s, time: '--:--', reached: false } : s)
          : [],
      })) : [];
      // Show route(s) where this student is in the students array, or fall back to user.routeId
      const myRoutes = mapped.filter(r =>
        (Array.isArray(r.students) && r.students.includes(user?.id)) ||
        r.id === user?.routeId
      );
      setRoutes(myRoutes);
      if (myRoutes.length === 1) {
        setSelectedRoute(myRoutes[0].id);
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to bus location when a route is selected
  useEffect(() => {
    // Always clear the previous route's location so a route with no live GPS
    // feed doesn't keep showing the last route's bus position.
    setBusLocation(null);
    setDistance(null);

    if (!selectedRoute) {
      return;
    }

    const socket = getSocket();
    socket.emit('bus:subscribe', selectedRoute);

    const handler = (loc: Location) => {
      setBusLocation(loc);
      if (userLocation) {
        setDistance(haversineDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng));
      }
    };

    // Service status (driver on leave) updates in real time.
    const statusHandler = (s: { onLeave: boolean }) => {
      setRoutes(prev => prev.map(r => (r.id === selectedRoute ? { ...r, onLeave: s.onLeave } : r)));
      if (s.onLeave) {
        setBusLocation(null);
        setDistance(null);
      }
    };

    socket.on(`bus:location:${selectedRoute}`, handler);
    socket.on(`bus:status:${selectedRoute}`, statusHandler);
    return () => {
      socket.off(`bus:location:${selectedRoute}`, handler);
      socket.off(`bus:status:${selectedRoute}`, statusHandler);
    };
  }, [selectedRoute, userLocation]);

  const selectedBus = routes.find(r => r.id === selectedRoute);

  console.log('Routes:', routes);
  console.log('Selected route:', selectedRoute);

  useEffect(() => {
    console.log('SelectedBus changed:', selectedBus);
  }, [selectedBus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'bg-green-100 text-green-700';
      case 'delayed': return 'bg-red-100 text-red-700';
      case 'arrived': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const mapCenter: [number, number] = busLocation
    ? [busLocation.lat, busLocation.lng]
    : userLocation
    ? [userLocation.lat, userLocation.lng]
    : [17.3850, 78.4867];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Live Bus Tracking</h1>
        <p className="text-muted-foreground">Real-time GPS bus location & distance</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Route list */}
          <div className="md:col-span-1 space-y-4">
            {routes.map(route => (
                  <Card
                    key={route.id}
                    className={`p-4 cursor-pointer transition-colors ${selectedRoute === route.id ? 'border-orange-500 bg-orange-50/30' : 'hover:border-orange-200'}`}
                    onClick={() => {
                      console.log('Clicked route:', route.id);
                      setSelectedRoute(route.id);
                      console.log('Selected route set to:', route.id);
                    }}
                  >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bus className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold">{route.routeName}</h3>
                  </div>
                  {route.onLeave
                    ? <Badge className="bg-amber-100 text-amber-700">no service</Badge>
                    : <Badge className={getStatusColor(route.status)}>{route.status}</Badge>}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{route.driverName}</span>
                  </div>
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

          {/* Map & details */}
          <div className="md:col-span-2 space-y-4">
            {selectedBus ? (
              <>
                {selectedBus.onLeave && (
                  <Card className="p-4 border-amber-300 bg-amber-50/50">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-amber-800">No service today</p>
                        <p className="text-sm text-amber-700">The driver for this route is on leave, so the bus is not being tracked right now.</p>
                      </div>
                    </div>
                  </Card>
                )}
                {/* Live Map */}
                <Card className="overflow-hidden">
                  <div className="h-[400px]">
                    <MapContainer
                      center={mapCenter}
                      zoom={14}
                      className="h-full w-full"
                      ref={mapRef}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapUpdater center={mapCenter} />
                      {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                          <Popup>Your Location</Popup>
                        </Marker>
                      )}
                      {busLocation && (
                        <Marker position={[busLocation.lat, busLocation.lng]} icon={busIcon}>
                          <Popup>
                            <strong>{selectedBus.routeName}</strong><br />
                            Bus #{selectedBus.busNumber}
                          </Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                </Card>

                {/* Info bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <MapPin className="w-8 h-8 text-orange-500 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Bus Location</p>
                        <p className="text-sm font-medium">
                          {busLocation
                            ? `${busLocation.lat.toFixed(4)}, ${busLocation.lng.toFixed(4)}`
                            : 'Waiting for GPS...'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Locate className="w-8 h-8 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Distance</p>
                        <p className="text-sm font-medium">
                          {distance !== null
                            ? distance < 1
                              ? `${(distance * 1000).toFixed(0)} m`
                              : `${distance.toFixed(2)} km`
                            : '---'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Clock className="w-8 h-8 text-green-500 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">ETA</p>
                        <p className="text-sm font-medium">{selectedBus.estimatedArrival}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Driver & Stops */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {selectedBus.routeName} <span className="text-sm text-muted-foreground">(Bus #{selectedBus.busNumber})</span>
                      </CardTitle>
                      <Badge className={getStatusColor(selectedBus.status)}>{selectedBus.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-sm text-muted-foreground">Driver</p>
                        <p className="font-medium">{selectedBus.driverName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">{selectedBus.driverPhone}</span>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wider">Route Stops</h4>
                    <div className="space-y-2">
                      {selectedBus.stops.map((stop, idx) => (
                        <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-lg ${stop.reached ? 'bg-green-50' : 'bg-accent'}`}>
                          <div className={`w-3 h-3 rounded-full ${stop.reached ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{stop.name}</p>
                            <p className="text-xs text-muted-foreground">{stop.time}</p>
                          </div>
                          {stop.reached && <Badge variant="secondary">Reached</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center">
                <Bus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a bus route</h3>
                <p className="text-muted-foreground">Click on a route from the list to see live tracking on the map</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
