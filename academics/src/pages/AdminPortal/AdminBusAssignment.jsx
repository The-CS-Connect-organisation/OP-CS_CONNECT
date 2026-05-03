import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, Users, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { busService } from '../../services/busService';
import { request } from '../../utils/apiClient';

const AdminBusAssignment = ({ user, addToast }) => {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [busData, driverData] = await Promise.all([
        busService.listBuses(),
        request('/school/users?role=driver').catch(() => ({ users: [] })),
      ]);
      
      setBuses(Array.isArray(busData) ? busData : busData?.items ?? []);
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
            <p className="text-sm text-gray-500 mt-1">Click a driver to assign them a bus</p>
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
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
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
      </motion.div>

      {/* Drivers List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Users size={20} className="text-gray-600" />
          Drivers
        </h2>

        {drivers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No drivers found</p>
            <p className="text-sm mt-1">Create driver accounts in User Management first</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map(driver => {
              const assignedBus = buses.find(b => b.driver_id === driver.id);
              return (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all cursor-pointer hover:shadow-md"
                >
                  {/* Driver Info */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{driver.email}</p>
                  </div>

                  {/* Current Assignment */}
                  {assignedBus ? (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-xs text-green-600 font-semibold mb-1">Currently Assigned</p>
                      <p className="text-sm font-bold text-green-700">{assignedBus.bus_number}</p>
                      <p className="text-xs text-green-600 mt-1">{assignedBus.license_plate}</p>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-xs text-gray-600 font-semibold">No bus assigned</p>
                    </div>
                  )}

                  {/* Available Buses Dropdown */}
                  <div className="space-y-2">
                    {buses.filter(b => !b.driver_id || b.driver_id === driver.id).length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-2">All buses assigned</p>
                    ) : (
                      buses
                        .filter(b => !b.driver_id || b.driver_id === driver.id)
                        .map(bus => (
                          <button
                            key={bus.id}
                            onClick={() => assignBusToDriver(bus.id, driver.id)}
                            disabled={assigning === bus.id}
                            className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              bus.driver_id === driver.id
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                            } disabled:opacity-50`}
                          >
                            {assigning === bus.id ? (
                              <span className="flex items-center justify-center gap-1">
                                <Loader2 size={12} className="animate-spin" />
                                Assigning...
                              </span>
                            ) : (
                              `${bus.bus_number} - ${bus.license_plate}`
                            )}
                          </button>
                        ))
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

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
