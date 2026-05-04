import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, Users, CheckCircle, AlertCircle, Loader2, RefreshCw, Link2 } from 'lucide-react';
import { request } from '../../../utils/apiClient';

const AdminBusAssignment = ({ addToast }) => {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    loadData();
    // Refresh data every 5 seconds for real-time updates
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [busData, driverData] = await Promise.all([
        request('/bus/buses').catch(() => ({ buses: [] })),
        request('/school/users?role=driver').catch(() => ({ users: [] })),
      ]);
      
      setBuses(Array.isArray(busData) ? busData : busData?.buses ?? busData?.items ?? []);
      const allUsers = driverData?.users ?? driverData?.items ?? [];
      setDrivers(allUsers.filter(u => u.role === 'driver'));
    } catch (err) {
      console.error(err);
      addToast?.('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const assignBusToDriver = async (busId, driverId) => {
    setAssigning(busId);
    try {
      const driver = drivers.find(d => d.id === driverId);
      const bus = buses.find(b => b.id === busId);

      // Update bus with driver
      await request(`/bus/buses/${busId}`, {
        method: 'PATCH',
        body: JSON.stringify({ driver_id: driverId }),
      });

      // Update local state
      setBuses(prev => prev.map(b => 
        b.id === busId ? { ...b, driver_id: driverId, driver_name: driver?.name } : b
      ));

      addToast?.(`✓ Bus ${bus?.bus_number} assigned to ${driver?.name}`, 'success');
      setShowAssignModal(false);
      setSelectedBus(null);
    } catch (err) {
      console.error(err);
      addToast?.('Failed to assign bus', 'error');
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500 font-mono text-sm">Loading buses and drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pt-2 pb-12 px-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bus Assignment</h1>
            <p className="text-sm text-gray-500 mt-1">Assign buses to drivers in real-time</p>
          </div>
          <button 
            onClick={loadData}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Bus size={20} className="text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Total Buses</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{buses.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Available Drivers</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{drivers.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-amber-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Assigned</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{buses.filter(b => b.driver_id).length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Unassigned</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{buses.filter(b => !b.driver_id).length}</p>
        </div>
      </motion.div>

      {/* No Drivers Alert */}
      {drivers.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 rounded-2xl p-6 border border-red-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle size={20} className="text-red-600" />
            <h3 className="font-semibold text-red-900">No Drivers Available</h3>
          </div>
          <p className="text-sm text-red-700">You need to create driver accounts first before assigning buses. Go to Create Account and add drivers.</p>
        </motion.div>
      )}

      {/* Buses List with Assign Button */}
      {buses.length > 0 && drivers.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Bus size={20} className="text-gray-600" />
            Buses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buses.map(bus => {
              const assignedDriver = drivers.find(d => d.id === bus.driver_id);
              return (
                <motion.div
                  key={bus.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                >
                  {/* Bus Info */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900">{bus.bus_number}</h3>
                    <p className="text-xs text-gray-500 mt-1">{bus.license_plate}</p>
                  </div>

                  {/* Current Assignment */}
                  {assignedDriver ? (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-xs text-green-600 font-semibold mb-1">Assigned to</p>
                      <p className="text-sm font-bold text-green-700">{assignedDriver.name}</p>
                      <p className="text-xs text-green-600 mt-1">{assignedDriver.email}</p>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-xs text-gray-600 font-semibold">Unassigned</p>
                    </div>
                  )}

                  {/* Assign Button */}
                  <button
                    onClick={() => {
                      setSelectedBus(bus);
                      setShowAssignModal(true);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Link2 size={14} />
                    Assign Driver
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedBus && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAssignModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Assign {selectedBus.bus_number} to Driver</h3>
            
            {drivers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No drivers available</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {drivers.map(driver => (
                  <button
                    key={driver.id}
                    onClick={() => assignBusToDriver(selectedBus.id, driver.id)}
                    disabled={assigning === selectedBus.id}
                    className="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{driver.name}</p>
                        <p className="text-xs text-gray-500">{driver.email}</p>
                      </div>
                      {assigning === selectedBus.id && (
                        <Loader2 size={16} className="animate-spin text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowAssignModal(false)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Drivers List */}
      {drivers.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Users size={20} className="text-gray-600" />
            Drivers ({drivers.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map(driver => {
              const assignedBus = buses.find(b => b.driver_id === driver.id);
              return (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                >
                  {/* Driver Info */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{driver.email}</p>
                  </div>

                  {/* Current Assignment */}
                  {assignedBus ? (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-xs text-green-600 font-semibold mb-1">Assigned Bus</p>
                      <p className="text-sm font-bold text-green-700">{assignedBus.bus_number}</p>
                      <p className="text-xs text-green-600 mt-1">{assignedBus.license_plate}</p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-xs text-amber-600 font-semibold">No bus assigned</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Unassigned Buses */}
      {buses.filter(b => !b.driver_id).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 rounded-2xl p-6 border border-amber-200"
        >
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <AlertCircle size={18} />
            Unassigned Buses ({buses.filter(b => !b.driver_id).length})
          </h3>
          <div className="space-y-2">
            {buses.filter(b => !b.driver_id).map(bus => (
              <div key={bus.id} className="text-sm text-amber-800">
                <span className="font-semibold">{bus.bus_number}</span> - {bus.license_plate}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminBusAssignment;
