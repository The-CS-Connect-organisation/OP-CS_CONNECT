import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bus, Clock, Navigation, Activity, Terminal, Layers, Zap, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { busService } from '../../../services/busService';
import { useSound } from '../../../hooks/useSound';
import { getSocket } from '../../../utils/socketClient';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom bus icon for Leaflet
const createBusIcon = () => {
  return L.divIcon({
    className: 'custom-bus-icon',
    html: `
      <div style="
        background: linear-gradient(135deg, #ff6b9d, #ff8fab);
        border: 3px solid white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(255, 107, 157, 0.4);
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v8"/><path d="M16 6v8"/><path d="M12 6v8"/><path d="M4 10h16"/><path d="M4 14h16"/><path d="M6 18h12"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Custom stop icon
const createStopIcon = () => {
  return L.divIcon({
    className: 'custom-stop-icon',
    html: `
      <div style="
        background: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
      ">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const busIcon = createBusIcon();
const stopIcon = createStopIcon();

// Custom user location icon
const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-icon',
    html: `
      <div style="
        background: linear-gradient(135deg, #3b82f6, #60a5fa);
        border: 3px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        animation: pulse 2s infinite;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      </style>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const userIcon = createUserIcon();

// Map bounds setter component - fixes react-leaflet v4 bounds issue
const MapBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
};

export const BusTracking = ({ user }) => {
  const { playClick } = useSound();
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadRoutes();
    // Get user's location for map centering
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to Chandanagar, Hyderabad
          setUserLocation({ latitude: 17.4967, longitude: 78.3614 });
        }
      );
    } else {
      // Default to Chandanagar, Hyderabad if geolocation not supported
      setUserLocation({ latitude: 17.4967, longitude: 78.3614 });
    }
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      loadActiveBuses(selectedRoute.id);
    }
  }, [selectedRoute]);

  // Real-time location updates via Socket.io
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleLocationUpdate = (data) => {
      if (selectedRoute && data.routeId === selectedRoute.id) {
        setBuses(prevBuses => 
          prevBuses.map(bus => 
            bus.id === data.busId 
              ? { ...bus, current_location: data.location, last_updated: data.location.timestamp }
              : bus
          )
        );
      }
    };

    socket.on('bus:location-updated', handleLocationUpdate);

    return () => {
      socket.off('bus:location-updated', handleLocationUpdate);
    };
  }, [selectedRoute]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const routesData = await busService.listRoutes({ status: 'active' });
      setRoutes(routesData);
      if (routesData.length > 0) {
        setSelectedRoute(routesData[0]);
      }
    } catch (err) {
      setError('Failed to load routes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveBuses = async (routeId) => {
    try {
      const busesData = await busService.getActiveBusesOnRoute(routeId);
      setBuses(busesData);
    } catch (err) {
      console.error('Failed to load buses:', err);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const getETA = (bus) => {
    if (!bus?.current_location) return 'Unknown';
    const lastUpdate = new Date(bus.last_updated);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastUpdate) / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 5) return `${diffMinutes} min ago`;
    return `${diffMinutes} mins ago`;
  };

  // Calculate map center and bounds based on route stops and bus locations
  const getMapBounds = () => {
    const positions = [];
    
    // Add user location if available
    if (userLocation?.latitude && userLocation?.longitude) {
      positions.push([userLocation.latitude, userLocation.longitude]);
    }
    
    // Add bus locations
    buses.forEach(bus => {
      if (bus.current_location?.latitude && bus.current_location?.longitude) {
        positions.push([bus.current_location.latitude, bus.current_location.longitude]);
      }
    });
    
    // Add stop locations
    if (selectedRoute?.stops) {
      selectedRoute.stops.forEach(stop => {
        if (stop.latitude && stop.longitude) {
          positions.push([stop.latitude, stop.longitude]);
        }
      });
    }
    
    if (positions.length === 0) {
      // Default to user location or Aarav Menon's location
      const defaultLat = userLocation?.latitude || 17.4967;
      const defaultLng = userLocation?.longitude || 78.3614;
      return [[defaultLat, defaultLng], [defaultLat, defaultLng]];
    }
    
    const lats = positions.map(p => p[0]);
    const lngs = positions.map(p => p[1]);
    
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ];
  };

  // Get route path coordinates for polyline
  const getRoutePath = () => {
    if (!selectedRoute?.stops) return [];
    return selectedRoute.stops
      .filter(stop => stop.latitude && stop.longitude)
      .map(stop => [stop.latitude, stop.longitude]);
  };

  const mapBounds = getMapBounds();
  const routePath = getRoutePath();
  const center = userLocation?.latitude && userLocation?.longitude
    ? [userLocation.latitude, userLocation.longitude]
    : selectedRoute?.stops?.[0]?.latitude && selectedRoute.stops[0]?.longitude
    ? [selectedRoute.stops[0].latitude, selectedRoute.stops[0].longitude]
    : [17.4967, 78.3614];

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-3 mb-4">
           <span className="px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-sm text-[10px] font-semibold font-mono">
             Transit_Stream
           </span>
           <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
           <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
             <Activity size={10} className="animate-pulse" /> Live_Tracking_Active
           </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
           <Bus className="text-[var(--text-muted)]" size={48} />
           Bus Tracking
        </h1>
      </motion.div>

      {loading ? (
        <Card className="p-12 flex items-center justify-center">
          <div className="text-center">
            <Bus className="animate-pulse mx-auto mb-4 text-[var(--text-muted)]" size={48} />
            <p className="text-sm text-[var(--text-muted)] font-mono">Loading transit data...</p>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-12 border-red-500/30">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
            <p className="text-sm text-[var(--text-muted)] font-mono">{error}</p>
          </div>
        </Card>
      ) : routes.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <MapPin className="mx-auto mb-4 text-[var(--text-muted)]" size={48} />
            <p className="text-sm text-[var(--text-muted)] font-mono">No active routes available</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Route Selector */}
          <div className="flex flex-wrap gap-3">
            {routes.map((route) => (
              <motion.button
                key={route.id}
                onClick={() => {
                  playClick?.();
                  setSelectedRoute(route);
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-sm border font-mono text-xs font-semibold transition-all ${
                  selectedRoute?.id === route.id
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-default)] hover:border-white/20'
                }`}
              >
                {route.name}
              </motion.button>
            ))}
          </div>

          {selectedRoute && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Map View */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="p-0 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl overflow-hidden">
                  <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Terminal size={16} className="text-[var(--text-muted)]" />
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Live Map</h3>
                    </div>
                    <Badge variant="rose" className="font-mono text-[9px] shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                      <Activity size={10} className="mr-1 animate-pulse" /> LIVE
                    </Badge>
                  </div>
                  
                  <div className="h-[500px] relative">
                    <MapContainer
                      center={center}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={true}
                    >
                      <MapBounds bounds={mapBounds} />
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* Route path polyline */}
                      {routePath.length > 1 && (
                        <Polyline
                          positions={routePath}
                          color="#ff6b9d"
                          weight={4}
                          opacity={0.7}
                          dashArray="10, 10"
                        />
                      )}
                      
                      {/* Route stops */}
                      {selectedRoute.stops?.map((stop, idx) => 
                        stop.latitude && stop.longitude ? (
                          <Marker
                            key={`stop-${idx}`}
                            position={[stop.latitude, stop.longitude]}
                            icon={stopIcon}
                          >
                            <Popup>
                              <div className="font-sans">
                                <p className="font-bold text-sm">{stop.name || `Stop ${idx + 1}`}</p>
                                {stop.time && <p className="text-xs text-gray-600">{formatTime(stop.time)}</p>}
                                {idx === 0 && <Badge variant="rose" className="mt-2 font-mono text-[9px]">START</Badge>}
                                {idx === selectedRoute.stops.length - 1 && <Badge variant="default" className="mt-2 font-mono text-[9px]">END</Badge>}
                              </div>
                            </Popup>
                          </Marker>
                        ) : null
                      )}
                      
                      {/* Bus markers */}
                      {buses.map(bus => 
                        bus.current_location?.latitude && bus.current_location?.longitude ? (
                          <Marker
                            key={bus.id}
                            position={[bus.current_location.latitude, bus.current_location.longitude]}
                            icon={busIcon}
                          >
                            <Popup>
                              <div className="font-sans">
                                <p className="font-bold text-sm">{bus.bus_number}</p>
                                <p className="text-xs text-gray-600">{bus.license_plate}</p>
                                <div className="mt-2 pt-2 border-t">
                                  <p className="text-xs text-gray-500">Updated: {getETA(bus)}</p>
                                  {bus.current_location.speed > 0 && (
                                    <p className="text-xs text-gray-500">Speed: {bus.current_location.speed} km/h</p>
                                  )}
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        ) : null
                      )}
                      
                      {/* User location marker */}
                      {userLocation?.latitude && userLocation?.longitude && (
                        <Marker
                          position={[userLocation.latitude, userLocation.longitude]}
                          icon={userIcon}
                        >
                          <Popup>
                            <div className="font-sans">
                              <p className="font-bold text-sm">Your Location</p>
                              <p className="text-xs text-gray-600">
                                {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                </Card>

                {/* Route Details */}
                <Card className="p-6 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Terminal size={16} className="text-[var(--text-muted)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Route Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-bold text-[var(--text-primary)] mb-1">{selectedRoute.name}</h4>
                      <p className="text-sm text-[var(--text-muted)]">{selectedRoute.description || 'No description available'}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-[var(--bg-elevated)] p-3 rounded-sm border border-[var(--border-default)]">
                        <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">Start Time</p>
                        <p className="text-base font-bold text-[var(--text-primary)] font-mono">{formatTime(selectedRoute.start_time)}</p>
                      </div>
                      <div className="bg-[var(--bg-elevated)] p-3 rounded-sm border border-[var(--border-default)]">
                        <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">End Time</p>
                        <p className="text-base font-bold text-[var(--text-primary)] font-mono">{formatTime(selectedRoute.end_time)}</p>
                      </div>
                      <div className="bg-[var(--bg-elevated)] p-3 rounded-sm border border-[var(--border-default)]">
                        <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">Distance</p>
                        <p className="text-base font-bold text-[var(--text-primary)] font-mono">{selectedRoute.total_distance || 0} km</p>
                      </div>
                      <div className="bg-[var(--bg-elevated)] p-3 rounded-sm border border-[var(--border-default)]">
                        <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">Duration</p>
                        <p className="text-base font-bold text-[var(--text-primary)] font-mono">{selectedRoute.estimated_duration || 0} min</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Active Buses */}
              <div className="lg:col-span-4">
                <Card className="p-8 border-[var(--border-default)] bg-[var(--bg-elevated)]">
                  <h3 className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-widest mb-6 flex items-center gap-2">
                    <Activity size={14} className="text-[var(--text-muted)]" /> Active_Units
                  </h3>
                  <div className="space-y-4">
                    {buses.length > 0 ? (
                      buses.map((bus, idx) => (
                        <motion.div
                          key={bus.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-4 bg-nova-base/50 rounded-sm border border-[var(--border-default)] hover:border-white/20 transition-all"
                          onMouseEnter={() => playClick?.()}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-bold text-[var(--text-primary)] font-mono">{bus.bus_number}</p>
                              <p className="text-xs text-[var(--text-muted)]">{bus.license_plate}</p>
                            </div>
                            <Badge variant="rose" className="font-mono text-[9px] shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                              ACTIVE
                            </Badge>
                          </div>
                          
                          {bus.current_location ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                <MapPin size={12} />
                                <span className="font-mono">
                                  {bus.current_location.latitude.toFixed(4)}, {bus.current_location.longitude.toFixed(4)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                <Clock size={12} />
                                <span className="font-mono">{getETA(bus)}</span>
                              </div>
                              {bus.current_location.speed > 0 && (
                                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                  <Navigation size={12} />
                                  <span className="font-mono">{bus.current_location.speed} km/h</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-[var(--text-muted)] font-mono">Location not available</p>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Bus className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" size={32} />
                        <p className="text-xs text-[var(--text-muted)] font-mono">No active buses on this route</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
