import { motion } from 'framer-motion';
import { Bus, MapPin, Activity, Navigation, Clock, Terminal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DriverTracking } from '../AcademicPortal/Student/DriverTracking';

export const DriverDashboard = ({ user }) => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="nova-card p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-orange-100 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gradient-to-tr from-yellow-100 to-transparent blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-600 border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Driver Portal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              <Bus size={10} />
              {user.busNumber || 'Not Assigned'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 mb-3 text-gray-900">
            <span className="w-1 h-10 rounded-full bg-gradient-to-b from-orange-500 to-yellow-500" />
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <div className="flex flex-wrap gap-2 mt-4">
            {user.licensePlate && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                Plate: {user.licensePlate}
              </span>
            )}
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Bus className="text-orange-600" size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Bus Number</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">{user.busNumber || 'Not Assigned'}</span>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <MapPin className="text-blue-600" size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">Ready</span>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Activity className="text-green-600" size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tracking</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">Active</span>
        </Card>
      </div>

      {/* Driver Tracking Section */}
      <Card className="p-0 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={16} className="text-[var(--text-muted)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Location Tracking</h3>
          </div>
          <Badge variant="rose" className="font-mono text-[9px]">
            <Activity size={10} className="mr-1 animate-pulse" /> LIVE
          </Badge>
        </div>
        <div className="p-6">
          <DriverTracking />
        </div>
      </Card>
    </div>
  );
};
