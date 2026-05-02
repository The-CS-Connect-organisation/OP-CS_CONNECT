import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bus, Users, MapPin, CheckCircle, Plus, Edit2, Trash2,
  Search, X, Route, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import { busService } from '../../services/busService';
import { request } from '../../utils/apiClient';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
      <Icon size={20} className="text-white" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    <p className="text-xs mt-1 text-gray-500">{label}</p>
  </div>
);

const AdminBusAssignment = ({ user, addToast }) => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showCreateBus, setShowCreateBus] = useState(false);
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);

  // Forms
  const [busForm, setBusForm] = useState({ bus_number: '', license_plate: '', capacity: 40, route_id: '', driver_id: '' });
  const [routeForm, setRouteForm] = useState({ name: '', description: '', start_time: '07:00', end_time: '09:00', total_distance: 0, estimated_duration: 0 });
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [busData, routeData, userData] = await Promise.all([
        busService.listBuses(),
        busService.listRoutes(),
        request('/school/users?role=driver').catch(() => ({ users: [] })),
      ]);
      setBuses(Array.isArray(busData) ? busData : busData?.items ?? []);
      setRoutes(Array.isArray(routeData) ? routeData : routeData?.items ?? []);
      const allUsers = userData?.users ?? userData?.items ?? [];
      setDrivers(allUsers.filter(u => u.role === 'driver'));
    } catch (err) {
      console.error(err);
      addToast?.('Failed to load bus data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleCreateBus = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newBus = await busService.createBus({ ...busForm, status: 'active' });
      setBuses(prev => [newBus?.bus ?? newBus, ...prev]);
      setShowCreateBus(false);
      setBusForm({ bus_number: '', license_plate: '', capacity: 40, route_id: '', driver_id: '' });
      addToast?.('Bus created successfully', 'success');
      // If driver assigned, update driver profile
      if (busForm.driver_id) {
        await request(`/bus/drivers/${busForm.driver_id}/assign`, {
          method: 'PATCH',
          body: JSON.stringify({ bus_number: busForm.bus_number, bus_id: newBus?.bus?.id ?? newBus?.id }),
        }).catch(() => {});
      }
    } catch (err) {
      addToast?.('Failed to create bus', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newRoute = await busService.createRoute({ ...routeForm, status: 'active', stops: [] });
      setRoutes(prev => [newRoute?.route ?? newRoute, ...prev]);
      setShowCreateRoute(false);
      setRouteForm({ name: '', description: '', start_time: '07:00', end_time: '09:00', total_distance: 0, estimated_duration: 0 });
      addToast?.('Route created successfully', 'success');
    } catch (err) {
      addToast?.('Failed to create route', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignDriver = async (driverId) => {
    if (!selectedBus) return;
    setSaving(true);
    try {
      const driver = drivers.find(d => d.id === driverId);
      // Update bus with driver
      await request(`/bus/buses/${selectedBus.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ driverId }),
      });
      // Update driver profile
      await request(`/bus/driver-profile/${driverId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          bus_number: selectedBus.bus_number,
          bus_id: selectedBus.id,
          route_id: selectedBus.route_id,
        }),
      }).catch(() => {});
      setBuses(prev => prev.map(b => b.id === selectedBus.id ? { ...b, driver_id: driverId, driverName: driver?.name } : b));
      setShowAssignModal(false);
      setSelectedBus(null);
      addToast?.(`Bus ${selectedBus.bus_number} assigned to ${driver?.name}`, 'success');
    } catch (err) {
      addToast?.('Failed to assign driver', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBus = async (busId) => {
    try {
      await request(`/bus/buses/${busId}`, { method: 'DELETE' });
      setBuses(prev => prev.filter(b => b.id !== busId));
      addToast?.('Bus deleted', 'success');
    } catch {
      addToast?.('Failed to delete bus', 'error');
    }
  };

  const filteredBuses = buses.filter(b =>
    b.bus_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.license_plate?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const assignedCount = buses.filter(b => b.driver_id).length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bus Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create routes, add buses, and assign drivers</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadAll} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw size={18} className="text-gray-600" />
          </button>
          <button onClick={() => setShowCreateRoute(true)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Route size={16} /> New Route
          </button>
          <button onClick={() => setShowCreateBus(true)} className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium flex items-center gap-2 hover:bg-gray-800">
            <Plus size={16} /> Add Bus
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Bus} label="Total Buses" value={loading ? '—' : buses.length} color="bg-blue-500" />
        <StatCard icon={Route} label="Active Routes" value={loading ? '—' : routes.length} color="bg-emerald-500" />
        <StatCard icon={Users} label="Drivers" value={loading ? '—' : drivers.length} color="bg-violet-500" />
        <StatCard icon={CheckCircle} label="Assigned" value={loading ? '—' : assignedCount} color="bg-amber-500" />
      </div>

      {/* Routes */}
      {routes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Route size={18} className="text-emerald-500" /> Active Routes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {routes.map(route => (
              <div key={route.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <p className="font-semibold text-sm text-gray-900">{route.name}</p>
                <p className="text-xs text-gray-500 mt-1">{route.description || 'No description'}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>{route.start_time} – {route.end_time}</span>
                  <span>{route.total_distance} km</span>
                  <span>{route.stops?.length ?? 0} stops</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buses */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Buses</h2>
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search buses..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bus size={48} className="mb-3 opacity-30" />
            <p className="font-medium text-sm">No buses yet</p>
            <p className="text-xs mt-1">Click "Add Bus" to create your first bus</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBuses.map(bus => {
              const route = routes.find(r => r.id === bus.route_id);
              const driver = drivers.find(d => d.id === bus.driver_id);
              return (
                <motion.div
                  key={bus.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Bus size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-gray-900">{bus.bus_number}</h3>
                        <span className="text-xs text-gray-400">{bus.license_plate}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bus.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {bus.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        {route && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={11} /> {route.name}
                          </span>
                        )}
                        {driver ? (
                          <span className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            <CheckCircle size={11} /> {driver.name}
                          </span>
                        ) : (
                          <span className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            <AlertCircle size={11} /> No driver assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedBus(bus); setShowAssignModal(true); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      {driver ? 'Reassign' : 'Assign Driver'}
                    </button>
                    <button
                      onClick={() => handleDeleteBus(bus.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Bus Modal */}
      <AnimatePresence>
        {showCreateBus && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Add New Bus</h2>
                <button onClick={() => setShowCreateBus(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateBus} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Bus Number *</label>
                  <input required value={busForm.bus_number} onChange={e => setBusForm(p => ({ ...p, bus_number: e.target.value }))}
                    placeholder="e.g. CS-001" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">License Plate *</label>
                  <input required value={busForm.license_plate} onChange={e => setBusForm(p => ({ ...p, license_plate: e.target.value }))}
                    placeholder="e.g. TS-09-EA-1234" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Capacity</label>
                  <input type="number" value={busForm.capacity} onChange={e => setBusForm(p => ({ ...p, capacity: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Assign Route</label>
                  <select value={busForm.route_id} onChange={e => setBusForm(p => ({ ...p, route_id: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <option value="">— No route —</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Assign Driver</label>
                  <select value={busForm.driver_id} onChange={e => setBusForm(p => ({ ...p, driver_id: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <option value="">— No driver —</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.email})</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateBus(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : null} Create Bus
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Route Modal */}
      <AnimatePresence>
        {showCreateRoute && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Create New Route</h2>
                <button onClick={() => setShowCreateRoute(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateRoute} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Route Name *</label>
                  <input required value={routeForm.name} onChange={e => setRouteForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Chandanagar Route A" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</label>
                  <input value={routeForm.description} onChange={e => setRouteForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Time</label>
                    <input type="time" value={routeForm.start_time} onChange={e => setRouteForm(p => ({ ...p, start_time: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">End Time</label>
                    <input type="time" value={routeForm.end_time} onChange={e => setRouteForm(p => ({ ...p, end_time: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Distance (km)</label>
                    <input type="number" value={routeForm.total_distance} onChange={e => setRouteForm(p => ({ ...p, total_distance: Number(e.target.value) }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration (min)</label>
                    <input type="number" value={routeForm.estimated_duration} onChange={e => setRouteForm(p => ({ ...p, estimated_duration: Number(e.target.value) }))}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateRoute(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : null} Create Route
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Driver Modal */}
      <AnimatePresence>
        {showAssignModal && selectedBus && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Assign Driver</h2>
                  <p className="text-sm text-gray-500">Bus: {selectedBus.bus_number}</p>
                </div>
                <button onClick={() => { setShowAssignModal(false); setSelectedBus(null); }} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              {drivers.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-400">
                  <AlertCircle size={40} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">No drivers found</p>
                  <p className="text-xs mt-1">Add driver accounts first via User Management</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {drivers.map(driver => (
                    <button key={driver.id} onClick={() => handleAssignDriver(driver.id)} disabled={saving}
                      className={`w-full p-3 rounded-xl border text-left hover:border-gray-900 hover:bg-gray-50 transition-all ${selectedBus.driver_id === driver.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{driver.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{driver.email}</p>
                        </div>
                        {selectedBus.driver_id === driver.id && (
                          <CheckCircle size={18} className="text-green-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBusAssignment;
