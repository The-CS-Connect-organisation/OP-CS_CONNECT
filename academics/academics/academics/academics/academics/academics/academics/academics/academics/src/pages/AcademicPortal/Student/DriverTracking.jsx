import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bus, Navigation, Activity, Terminal, AlertCircle, CheckCircle, XCircle, Play, Pause, RotateCcw } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { busService } from '../../../services/busService';
import { useSound } from '../../../hooks/useSound';

export const DriverTracking = ({ user }) => {
  const { playClick } = useSound();
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);

  // Use driver's assigned bus number from user profile
  const busNumber = user?.busNumber || '';

  // Request location permission
  const requestLocationPermission = async () => {
    playClick();
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermission('granted');
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setSuccess('Location access granted');
        setTimeout(() => setSuccess(null), 3000);
      },
      (err) => {
        setLocationPermission('denied');
        setError('Location access denied. Please enable location permissions.');
        setTimeout(() => setError(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Start tracking
  const startTracking = async () => {
    if (!busNumber) {
      setError('No bus assigned to your account. Please contact admin.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (locationPermission !== 'granted') {
      setError('Please grant location access first');
      setTimeout(() => setError(null), 3000);
      return;
    }

    playClick();
    setIsTracking(true);
    setError(null);
    setSuccess('Tracking started');

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0,
          accuracy: position.coords.accuracy,
        };

        setCurrentLocation(location);
        setLastUpdate(new Date());

        // Send to backend
        try {
          // First, try to find the bus by bus number
          const buses = await busService.listBuses();
          const bus = buses.find(b => b.bus_number === busNumber.trim());

          if (bus) {
            await busService.updateBusLocation(bus.id, location);
            setUpdateCount(prev => prev + 1);
          } else {
            // If bus doesn't exist, we could create it or show error
            // For now, we'll just log it
            console.log('Bus not found:', busNumber);
          }
        } catch (err) {
          console.error('Failed to update location:', err);
        }
      },
      (err) => {
        setError('Failed to get location: ' + err.message);
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Stop tracking
  const stopTracking = () => {
    playClick();
    setIsTracking(false);
    setSuccess('Tracking stopped');
    setTimeout(() => setSuccess(null), 3000);

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-10 max-w-[800px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-3 mb-4">
           <span className="px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-sm text-[10px] font-semibold font-mono">
             Driver_Tracking_Stream
           </span>
           <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
           <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
             <Activity size={10} className={isTracking ? 'animate-pulse text-green-500' : ''} /> {isTracking ? 'Live_Tracking' : 'Standby'}
           </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
           <Bus className="text-[var(--text-muted)]" size={48} />
           Driver Tracking
        </h1>
      </motion.div>

      {/* Error/Success Messages */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 border-red-500/30 bg-red-50/50 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        </motion.div>
      )}

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 border-green-500/30 bg-green-50/50 flex items-center gap-3">
            <CheckCircle className="text-green-500" size={20} />
            <p className="text-sm text-green-700">{success}</p>
          </Card>
        </motion.div>
      )}

      {/* Location Permission Card */}
      {locationPermission === 'prompt' && (
        <Card className="p-8 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center mx-auto">
              <MapPin className="text-blue-500" size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Enable Location Access</h3>
              <p className="text-sm text-[var(--text-muted)]">
                We need access to your location to track the bus in real-time. Your location will be constantly updated while tracking is active.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={requestLocationPermission}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Enable Location
            </motion.button>
          </div>
        </Card>
      )}

      {locationPermission === 'denied' && (
        <Card className="p-8 border-red-500/30 bg-red-50/50">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center mx-auto">
              <XCircle className="text-red-500" size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-700 mb-2">Location Access Denied</h3>
              <p className="text-sm text-red-600">
                Please enable location permissions in your browser settings to use the tracking feature.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={requestLocationPermission}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              Try Again
            </motion.button>
          </div>
        </Card>
      )}

    {locationPermission === 'granted' && (
      <div className="space-y-6">
        {/* Bus Number Display */}
        <Card className="p-6 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <Terminal size={16} className="text-[var(--text-muted)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Bus Identification</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-default)]">
              <label className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
                Assigned Bus
              </label>
              <p className="text-xl font-bold text-[var(--text-primary)] font-mono">
                {busNumber || 'Not Assigned'}
              </p>
              {user?.licensePlate && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  License Plate: {user.licensePlate}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {!isTracking ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startTracking}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Play size={18} />
                  Start Tracking
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stopTracking}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Pause size={18} />
                  Stop Tracking
                </motion.button>
              )}
            </div>
          </div>
        </Card>

        {/* Live Location Display */}
        {currentLocation && (
          <Card className="p-6 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Terminal size={16} className="text-[var(--text-muted)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Live Location</h3>
              </div>
              <Badge variant={isTracking ? 'rose' : 'default'} className="font-mono text-[9px]">
                {isTracking ? 'LIVE' : 'PAUSED'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-default)]">
                <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">Latitude</p>
                <p className="text-lg font-bold text-[var(--text-primary)] font-mono">
                  {currentLocation?.latitude ? currentLocation.latitude.toFixed(6) : 'N/A'}
                </p>
              </div>
              <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-default)]">
                <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">Longitude</p>
                <p className="text-lg font-bold text-[var(--text-primary)] font-mono">
                  {currentLocation?.longitude ? currentLocation.longitude.toFixed(6) : 'N/A'}
                </p>
              </div>
              <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-default)]">
                <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">Speed</p>
                <p className="text-lg font-bold text-[var(--text-primary)] font-mono">
                  {(currentLocation?.speed ?? 0).toFixed(1)} km/h
                </p>
              </div>
              <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-default)]">
                <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">Accuracy</p>
                <p className="text-lg font-bold text-[var(--text-primary)] font-mono">
                  ±{(currentLocation?.accuracy ?? 0).toFixed(0)} m
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-default)] flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Navigation size={12} />
                <span>Updates sent: {updateCount}</span>
              </div>
              {lastUpdate && (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Activity size={12} />
                  <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Tracking Status */}
        {isTracking && (
          <Card className="p-6 border-green-500/30 bg-green-50/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-green-700">Actively Tracking Bus {busNumber}</p>
                <p className="text-xs text-green-600">Location is being updated in real-time</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    )}
  </div>
  );
};
