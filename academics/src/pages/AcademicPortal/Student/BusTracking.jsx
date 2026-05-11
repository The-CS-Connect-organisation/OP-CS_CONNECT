import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bus, Clock, Navigation, Activity, Terminal, Layers, Zap, AlertCircle, Eye, Filter } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useSound } from '../../../hooks/useSound';
import { request } from '../../../utils/apiClient';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.your-mapbox-token-here';

const MAPBOX_STYLE = 'mapbox://styles/mapbox/navigation-night-v1';
const DEFAULT_CENTER = [78.3614, 17.4967]; // [lng, lat]
const DEFAULT_ZOOM = 13;

// SVG bus marker - rotates based on heading
const createBusMarkerEl = (heading = 0) => {
  const el = document.createElement('div');
  el.className = 'bus-marker';
  el.innerHTML = `
    <div class="bus-marker-inner" style="transform: rotate(${heading}deg)">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="url(#busGrad)" stroke="white" stroke-width="2.5"/>
        <g transform="rotate(0 16 16)">
          <path d="M10 8v10M16 8v10M22 8v10" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <path d="M8 12h16M8 18h16" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </g>
        <defs>
          <linearGradient id="busGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ff6b9d"/>
            <stop offset="100%" stop-color="#ff8fab"/>
          </linearGradient>
        </defs>
      </svg>
      <div class="bus-pulse"></div>
    </div>
  `;
  return el;
};

// SVG stop marker
const createStopMarkerEl = (isStart, isEnd) => {
  const el = document.createElement('div');
  el.className = 'stop-marker';
  const color = isStart ? '#ff6b9d' : isEnd ? '#3b82f6' : '#10b981';
  el.innerHTML = `
    <div style="
      width: 20px; height: 20px; background: ${color};
      border: 2px solid white; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px ${color}66;
    ">
      <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
    </div>
  `;
  return el;
};

// SVG user location marker
const createUserMarkerEl = () => {
  const el = document.createElement('div');
  el.className = 'user-marker';
  el.innerHTML = `
    <div style="
      width: 28px; height: 28px;
      background: linear-gradient(135deg, #3b82f6, #60a5fa);
      border: 3px solid white; border-radius: 50%;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      display: flex; align-items: center; justify-content: center;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </div>
  `;
  return el;
};

export const BusTracking = ({ user }) => {
  const { playClick } = useSound();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const animationFrameRef = useRef(null);

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState('student'); // 'student' or 'system'
  const [selectedBusId, setSelectedBusId] = useState(null);

  // Load buses from backend
  const loadBuses = useCallback(async () => {
    try {
      const data = await request({ path: '/bus/buses' });
      if (data?.items) {
        setBuses(data.items);
        // Auto-select student's bus in student view
        if (viewMode === 'student' && data.items.length > 0 && !selectedBusId) {
          setSelectedBusId(data.items[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load buses:', err);
    }
  }, [viewMode, selectedBusId]);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          // Default to Chandanagar, Hyderabad
          setUserLocation({ latitude: 17.4967, longitude: 78.3614 });
        }
      );
    } else {
      setUserLocation({ latitude: 17.4967, longitude: 78.3614 });
    }
  }, []);

  useEffect(() => {
    loadBuses();
    const interval = setInterval(loadBuses, 10000);
    return () => clearInterval(interval);
  }, [loadBuses]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      setLoading(false);
    });

    mapRef.current = map;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Animate markers smoothly using requestAnimationFrame
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const animate = () => {
      buses.forEach(bus => {
        const marker = markersRef.current[bus.id];
        if (marker && marker._pos) {
          const target = [bus.current_location.longitude, bus.current_location.latitude];
          const current = marker._pos;
          const lerpFactor = 0.08;
          const newLng = current[0] + (target[0] - current[0]) * lerpFactor;
          const newLat = current[1] + (target[1] - current[1]) * lerpFactor;
          marker.setLngLat([newLng, newLat]);
          marker._pos = [newLng, newLat];

          // Update rotation
          if (marker._el && bus.current_location.heading !== undefined) {
            const svg = marker._el.querySelector('.bus-marker-inner');
            if (svg) {
              svg.style.transform = `rotate(${bus.current_location.heading}deg)`;
            }
          }
        }
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [buses]);

  // Update markers when buses change
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // Filter buses based on view mode
    const visibleBuses = viewMode === 'student'
      ? buses.filter(b => b.id === selectedBusId)
      : buses;

    // Add bus markers
    visibleBuses.forEach(bus => {
      if (!bus.current_location?.latitude || !bus.current_location?.longitude) return;

      const el = createBusMarkerEl(bus.current_location.heading || 0);
      el.style.cursor = 'pointer';
      el.style.zIndex = '10';

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([bus.current_location.longitude, bus.current_location.latitude])
        .addTo(map);

      marker._pos = [bus.current_location.longitude, bus.current_location.latitude];
      marker._el = el;

      // Popup on click
      el.addEventListener('click', () => {
        setSelectedBusId(bus.id);
        playClick?.();
      });

      markersRef.current[bus.id] = marker;
    });

    // Add user location marker
    if (userLocation?.latitude && userLocation?.longitude) {
      const el = createUserMarkerEl();
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(map);
      markersRef.current['user'] = marker;
    }

    // Fit bounds to show all markers
    if (visibleBuses.length > 0 || userLocation) {
      const bounds = new mapboxgl.LngLatBounds();
      visibleBuses.forEach(bus => {
        if (bus.current_location?.latitude && bus.current_location?.longitude) {
          bounds.extend([bus.current_location.longitude, bus.current_location.latitude]);
        }
      });
      if (userLocation?.latitude && userLocation?.longitude) {
        bounds.extend([userLocation.longitude, userLocation.latitude]);
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
      }
    }
  }, [buses, userLocation, viewMode, selectedBusId, playClick]);

  const getHeadingDirection = (heading) => {
    if (heading === undefined || heading === null) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

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
      ) : (
        <>
          {/* View Mode Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-1">
              <button
                onClick={() => { setViewMode('student'); setSelectedBusId(buses[0]?.id || null); playClick?.(); }}
                className={`px-4 py-2 rounded-sm border font-mono text-xs font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'student'
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-default)] hover:border-white/20'
                }`}
              >
                <Filter size={14} /> My Bus
              </button>
              <button
                onClick={() => { setViewMode('system'); setSelectedBusId(null); playClick?.(); }}
                className={`px-4 py-2 rounded-sm border font-mono text-xs font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'system'
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-default)] hover:border-white/20'
                }`}
              >
                <Eye size={14} /> System View
              </button>
            </div>
            <div className="h-[1px] flex-1 bg-[var(--border-default)]" />
            <Badge variant="rose" className="font-mono text-[9px] shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              <Activity size={10} className="mr-1 animate-pulse" /> {buses.filter(b => b.status === 'active').length} ACTIVE
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Map View */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="p-0 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl overflow-hidden">
                <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal size={16} className="text-[var(--text-muted)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Live Map</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      {buses.length} buses tracked
                    </span>
                    <Badge variant="rose" className="font-mono text-[9px] shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                      <Activity size={10} className="mr-1 animate-pulse" /> LIVE
                    </Badge>
                  </div>
                </div>

                <div
                  ref={mapContainerRef}
                  className="h-[500px] w-full"
                  style={{ background: '#1a1a2e' }}
                />
              </Card>

              {/* Map Legend */}
              <Card className="p-4 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl">
                <div className="flex items-center gap-6 text-[10px] font-mono text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 border-2 border-white" />
                    <span>Active Bus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6] border-2 border-white" />
                    <span>Your Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10b981] border-2 border-white" />
                    <span>Stop</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Bus Info Cards */}
            <div className="lg:col-span-4 space-y-4">
              {buses.map((bus, idx) => (
                <motion.div
                  key={bus.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => { setSelectedBusId(bus.id); setViewMode('student'); playClick?.(); }}
                  className={`
                    p-6 rounded-sm border transition-all cursor-pointer
                    ${selectedBusId === bus.id
                      ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/50 shadow-[0_0_30px_rgba(255,107,157,0.2)]'
                      : 'bg-[var(--bg-elevated)]/80 backdrop-blur-xl border-[var(--border-default)] hover:border-white/30'
                    }
                  `}
                >
                  {/* Bus header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-lg font-bold text-[var(--text-primary)] font-mono">{bus.bus_number}</p>
                      <p className="text-xs text-[var(--text-muted)] font-mono">ID: {bus.id}</p>
                    </div>
                    <Badge
                      variant={bus.status === 'active' ? 'rose' : 'default'}
                      className="font-mono text-[9px]"
                    >
                      {bus.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>

                  {/* Status grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/30 p-3 rounded-sm">
                      <div className="flex items-center gap-1 text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">
                        <Zap size={10} /> Speed
                      </div>
                      <p className="text-lg font-bold text-[var(--text-primary)] font-mono">
                        {bus.current_location?.speed ?? '--'} <span className="text-xs text-[var(--text-muted)]">km/h</span>
                      </p>
                    </div>
                    <div className="bg-black/30 p-3 rounded-sm">
                      <div className="flex items-center gap-1 text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">
                        <Navigation size={10} /> Heading
                      </div>
                      <p className="text-lg font-bold text-[var(--text-primary)] font-mono">
                        {getHeadingDirection(bus.current_location?.heading)} <span className="text-xs text-[var(--text-muted)]">{bus.current_location?.heading ?? '--'}°</span>
                      </p>
                    </div>
                  </div>

                  {/* Coordinates */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                      <MapPin size={12} />
                      <span>
                        {bus.current_location?.latitude?.toFixed(5) ?? '--'}, {bus.current_location?.longitude?.toFixed(5) ?? '--'}
                      </span>
                    </div>
                  </div>

                  {/* Active pulse indicator */}
                  {bus.status === 'active' && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[9px] font-mono text-green-400">LIVE TRANSMISSION</span>
                    </div>
                  )}
                </motion.div>
              ))}

              {buses.length === 0 && (
                <Card className="p-8 text-center">
                  <Bus className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" size={32} />
                  <p className="text-xs text-[var(--text-muted)] font-mono">No buses available</p>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* Inject pulsing glow styles */}
      <style>{`
        .bus-marker-inner {
          transition: transform 0.3s ease;
        }
        .bus-pulse {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 40px; height: 40px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,107,157,0.4) 0%, transparent 70%);
          animation: busPulse 2s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes busPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
        }
        .mapboxgl-ctrl-attrib { display: none !important; }
        .mapboxgl-ctrl-logo { display: none !important; }
      `}</style>
    </div>
  );
};