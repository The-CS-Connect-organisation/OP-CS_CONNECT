import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bus, Clock, Navigation, Activity, Search, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { busService } from '../../../services/busService';
import { useSound } from '../../../hooks/useSound';
import { getSocket } from '../../../utils/socketClient';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { request } from '../../../utils/apiClient';

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

const busIcon = createBusIcon();
const userIcon = createUserIcon();

// Map bounds setter component
const MapBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
};

// Calculate distance between two coordinates in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

export const BusTracking = ({ user, addToast }) => {
  const { playClick } = useSound();
  const [searchInput, setSearchInput] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  // Get user's location on mount
  useEffect(() => {
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
      setUserLocation({ latitude: 17.4967, longitude: 78.3614 });
    }
  }, []);

  // Real-time location updates via Socket.io
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedBus) return;

    const handleLocationUpdate = (data) => {
      if (data.busId === selectedBus.id) {
        setBusData(prevBus => ({
          ...prevBus,
          current_location: data.location,
          last_updated: data.location.timestamp
        }));

        // Recalculate distance
        if (userLocation?.latitude && userLocation?.longitude && data.location?.latitude && data.location?.longitude) {
          const dist = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            data.location.latitude,
            data.location.longitude
          );
          setDistance(dist);
        }
      }
    };

    socket.on('bus:location-updated', handleLocationUpdate);

    return () => {
      socket.off('bus:location-updated', handleLocationUpdate);
    };
  }, [selectedBus, userLocation]);

  const searchBus = async () => {
    if (!searchInput.trim()) {
      setError('Please enter a bus number');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedBus(null);
    setBusData(null);
    setDistance(null);

    try {
      // Search for bus by bus number
      const allBuses = await busService.listBuses();
      const foundBus = allBuses.find(b => b.bus_number?.toString() === searchInput.trim());

      if (!foundBus) {
        setError(`Bus number ${searchInput} not found`);
        setLoading(false);
        return;
      }

      // Check if bus is assigned to a driver (active)
      if (!foundBus.driver_id) {
        setError(`Bus ${searchInput} is not currently assigned to any driver`);
        setLoading(false);
        return;
      }

      // Get driver info
      let driverInfo = null;
      try {
        const driverResponse = await request(`/school/users/${foundBus.driver_id}`);
        driverInfo = driverResponse?.user || driverResponse;
      } catch (err) {
        console.log('Could not fetch driver info:', err);
      }

      // Set bus data with driver info
      const busWithDriver = {
        ...foundBus,
        driver_info: driverInfo,
        is_active: !!foundBus.driver_id
      };

      setSelectedBus(foundBus);
      setBusData(busWithDriver);

      // Calculate distance if bus has location
      if (userLocation?.latitude && userLocation?.longitude && foundBus.current_location?.latitude && foundBus.current_location?.longitude) {
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          foundBus.current_location.latitude,
          foundBus.current_location.longitude
        );
        setDistance(dist);
      }

      addToast?.(`Bus ${searchInput} found and tracking started`, 'success');
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for bus. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchBus();
    }
  };

  // Calculate map bounds
  const getMapBounds = () => {
    const positions = [];
    
    if (userLocation?.latitude && userLocation?.longitude) {
      positions.push([userLocation.latitude, userLocation.longitude]);
    }
    
    if (busData?.current_location?.latitude && busData?.current_location?.longitude) {
      positions.push([busData.current_location.latitude, busData.current_location.longitude]);
    }
    
    if (positions.length === 0) {
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

  const mapBounds = getMapBounds();
  const center = userLocation?.latitude && userLocation?.longitude
    ? [userLocation.latitude, userLocation.longitude]
    : [17.4967, 78.3614];

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pt-4 pb-12 px-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-4">
          <Bus className="text-gray-600" size={48} />
          Bus Tracking
        </h1>
        <p className="text-sm text-gray-500 mt-2">Enter a bus number to track its location in real-time</p>
      </motion.div>

      {/* Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Enter bus number (e.g., 101, 102)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={searchBus}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={18} />
                Search
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 rounded-2xl p-4 border border-red-200 flex items-start gap-3"
        >
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-red-900">{error}</p>
            <p className="text-sm text-red-700 mt-1">Make sure the bus number is correct and the bus is assigned to a driver.</p>
          </div>
        </motion.div>
      )}

      {/* Bus Tracking Results */}
      {selectedBus && busData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Map View */}
          <div className="lg:col-span-8">
            <Card className="p-0 border-gray-100 bg-white overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Live Location</h3>
                </div>
                <Badge variant="rose" className="font-mono text-[9px]">
                  <Activity size={10} className="mr-1 animate-pulse" /> LIVE
                </Badge>
              </div>
              
              <div className="h-[500px] relative">
                {busData?.current_location?.latitude && busData?.current_location?.longitude ? (
                  <MapContainer
                    center={center}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                  >
                    <MapBounds bounds={mapBounds} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Bus marker */}
                    <Marker
                      position={[busData.current_location.latitude, busData.current_location.longitude]}
                      icon={busIcon}
                    >
                      <Popup>
                        <div className="font-sans">
                          <p className="font-bold text-sm">{busData.bus_number}</p>
                          <p className="text-xs text-gray-600">{busData.license_plate}</p>
                          {busData.driver_info && (
                            <p className="text-xs text-gray-600 mt-1">Driver: {busData.driver_info.name}</p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* User location marker */}
                    {userLocation?.latitude && userLocation?.longitude && (
                      <Marker
                        position={[userLocation.latitude, userLocation.longitude]}
                        icon={userIcon}
                      >
                        <Popup>
                          <div className="font-sans">
                            <p className="font-bold text-sm">Your Location</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <MapPin className="mx-auto mb-3 text-gray-400" size={40} />
                      <p className="text-sm text-gray-500">Bus location not available</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Bus Details */}
          <div className="lg:col-span-4 space-y-4">
            {/* Status Card */}
            <Card className="p-6 border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Bus Status</h3>
                <Badge variant="rose" className="font-mono text-[9px]">
                  ACTIVE
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Bus Number</p>
                  <p className="text-2xl font-bold text-gray-900">{busData.bus_number}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">License Plate</p>
                  <p className="text-lg font-semibold text-gray-700">{busData.license_plate}</p>
                </div>

                {distance && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Distance from You</p>
                    <p className="text-2xl font-bold text-blue-600">{distance} km</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Driver Info */}
            {busData.driver_info && (
              <Card className="p-6 border-gray-100 bg-white shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Driver Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Name</p>
                    <p className="text-base font-semibold text-gray-900">{busData.driver_info.name}</p>
                  </div>
                  
                  {busData.driver_info.email && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Email</p>
                      <p className="text-sm text-gray-700">{busData.driver_info.email}</p>
                    </div>
                  )}
                  
                  {busData.driver_info.phone && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Phone</p>
                      <p className="text-sm text-gray-700">{busData.driver_info.phone}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Location Details */}
            {busData.current_location && (
              <Card className="p-6 border-gray-100 bg-white shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Location Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Coordinates</p>
                    <p className="text-xs font-mono text-gray-700">
                      {busData.current_location.latitude.toFixed(4)}, {busData.current_location.longitude.toFixed(4)}
                    </p>
                  </div>
                  
                  {busData.current_location.speed > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Speed</p>
                      <p className="text-base font-semibold text-gray-900">{busData.current_location.speed} km/h</p>
                    </div>
                  )}
                  
                  {busData.last_updated && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Last Updated</p>
                      <p className="text-sm text-gray-700">
                        {new Date(busData.last_updated).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!selectedBus && !error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border border-blue-100 text-center"
        >
          <Bus className="mx-auto mb-4 text-blue-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Tracking a Bus</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Enter a bus number above to see its real-time location, driver information, and distance from your current location.
          </p>
        </motion.div>
      )}
    </div>
  );
};
