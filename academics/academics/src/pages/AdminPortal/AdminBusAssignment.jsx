import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bus,
  Users,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

import { BusTracking } from '../AcademicPortal/Student/BusTracking';

/**
 * @component AdminBusAssignment
 * @description Admin panel for managing bus assignments to drivers
 */
const AdminBusAssignment = ({ user, addToast }) => {
  const { data: drivers } = useStore(KEYS.USERS, []);
  const { data: buses, update: updateBuses } = useStore('buses', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments');

  // Filter drivers to only show driver role
  const driverList = drivers.filter(d => d.role === 'driver');

  // Filter buses based on search
  const filteredBuses = buses.filter(bus =>
    bus.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.route?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignBus = (driver, bus) => {
    // Update bus with driver assignment
    const updatedBuses = buses.map(b =>
      b.id === bus.id ? { ...b, assignedDriver: driver.id, driverName: driver.name } : b
    );
    updateBuses(updatedBuses);
    addToast?.(`Bus ${bus.busNumber} assigned to ${driver.name}`, 'success');
    setShowAssignModal(false);
    setSelectedDriver(null);
  };

  const handleUnassignBus = (bus) => {
    const updatedBuses = buses.map(b =>
      b.id === bus.id ? { ...b, assignedDriver: null, driverName: null } : b
    );
    updateBuses(updatedBuses);
    addToast?.(`Bus ${bus.busNumber} unassigned`, 'success');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Bus Assignment & Tracking
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage bus assignments and track live locations
          </p>
        </div>
        {activeTab === 'assignments' && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2"
            style={{ background: 'var(--primary)' }}
          >
            <Plus size={16} />
            New Assignment
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'assignments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          style={activeTab === 'assignments' ? { color: 'var(--primary)', borderColor: 'var(--primary)' } : { color: 'var(--text-secondary)' }}
        >
          Assignments
        </button>
        <button
          onClick={() => setActiveTab('tracking')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'tracking'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          style={activeTab === 'tracking' ? { color: 'var(--primary)', borderColor: 'var(--primary)' } : { color: 'var(--text-secondary)' }}
        >
          Live Tracking
        </button>
      </div>

      {activeTab === 'assignments' ? (
        <>
          {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Bus}
          label="Total Buses"
          value={buses.length}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Available Drivers"
          value={driverList.length}
          color="bg-green-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Assigned Buses"
          value={buses.filter(b => b.assignedDriver).length}
          color="bg-purple-500"
        />
      </div>

      {/* Buses List */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Buses
          </h2>
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-3" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search buses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {filteredBuses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bus size={48} style={{ color: 'var(--text-muted)' }} className="mb-3 opacity-50" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              No buses found
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Buses will appear here once they are added to the system
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBuses.map((bus) => (
              <motion.div
                key={bus.id}
                className="flex items-center justify-between p-4 rounded-xl border"
                style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Bus size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {bus.busNumber || 'Bus ' + bus.id}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <MapPin size={12} />
                        {bus.route || 'No route'}
                      </span>
                      {bus.assignedDriver && (
                        <span className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
                          <CheckCircle size={12} />
                          {bus.driverName || 'Assigned'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDriver(bus);
                      setShowAssignModal(true);
                    }}
                    className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={16} className="text-blue-600" />
                  </button>
                  {bus.assignedDriver && (
                    <button
                      onClick={() => handleUnassignBus(bus)}
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Assign Bus to Driver
            </h2>

            {driverList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle size={48} style={{ color: 'var(--text-muted)' }} className="mb-3 opacity-50" />
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  No drivers available
                </p>
                <p className="text-xs mt-1 text-center" style={{ color: 'var(--text-muted)' }}>
                  Please add drivers to the system first
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {driverList.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => {
                      if (selectedDriver?.id) {
                        handleAssignBus(driver, selectedDriver);
                      }
                    }}
                    className="w-full p-3 rounded-lg border text-left hover:bg-blue-50 transition-colors"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {driver.name}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {driver.email}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedDriver(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border text-sm font-medium"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
        </>
      ) : (
        <BusTracking user={user} />
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </h3>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  </div>
);

export default AdminBusAssignment;
