import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bus, Phone, Mail, MapPin, Shield, Edit2, Save, X, Camera } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../services/apiClient';
import { getDataMode, DATA_MODES } from '../../config/dataMode';

/**
 * @component DriverProfile
 * @description Driver profile page showing personal info, assigned bus, license details
 * @param {Object} user - Current user object
 * @param {Function} addToast - Toast notification function
 */
export const DriverProfile = ({ user, addToast }) => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    licenseNumber: '',
    licenseExpiry: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (getDataMode() === DATA_MODES.REMOTE_API) {
        const payload = await apiRequest('/auth/me', { method: 'GET' });
        const data = payload?.user || payload;
        setProfile(data);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          licenseNumber: data.licenseNumber || data.license_number || '',
          licenseExpiry: data.licenseExpiry || data.license_expiry || '',
          emergencyContact: data.emergencyContact || data.emergency_contact || '',
          emergencyPhone: data.emergencyPhone || data.emergency_phone || '',
        });
      } else {
        // Local demo fallback
        setProfile(user);
        setForm({
          name: user.name || '',
          phone: user.phone || '',
          address: user.address || '',
          licenseNumber: user.licenseNumber || '',
          licenseExpiry: user.licenseExpiry || '',
          emergencyContact: user.emergencyContact || '',
          emergencyPhone: user.emergencyPhone || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setProfile(user);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (getDataMode() === DATA_MODES.REMOTE_API) {
        await apiRequest('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      }
      setProfile(prev => ({ ...prev, ...form }));
      setEditing(false);
      addToast?.('Profile updated successfully', 'success');
    } catch (err) {
      addToast?.(err?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Bus className="animate-pulse mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-sm text-gray-500 font-mono">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[900px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="nova-card p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-orange-100 to-transparent blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {(profile?.name || user?.name || 'D')[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile?.name || user?.name}</h1>
              <Badge variant="default" className="bg-orange-100 text-orange-700 border-orange-200">
                Driver
              </Badge>
            </div>
            <p className="text-sm text-gray-500">{profile?.email || user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Bus size={14} className="text-orange-500" />
              <span className="text-sm font-semibold text-gray-700">
                Bus: {profile?.busNumber || user?.busNumber || 'Not Assigned'}
              </span>
            </div>
          </div>

          <Button
            variant={editing ? 'secondary' : 'primary'}
            icon={editing ? X : Edit2}
            onClick={() => setEditing(!editing)}
            className="rounded-xl"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="nova-card p-6"
      >
        <h3 className="text-sm font-semibold text-gray-600 mb-5 flex items-center gap-2">
          <User size={14} />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'name', icon: User },
            { label: 'Phone Number', key: 'phone', icon: Phone },
            { label: 'Address', key: 'address', icon: MapPin },
            { label: 'Email', key: 'email', icon: Mail, readOnly: true, value: profile?.email || user?.email },
          ].map(({ label, key, icon: Icon, readOnly, value }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Icon size={11} />
                {label}
              </label>
              {editing && !readOnly ? (
                <input
                  type="text"
                  value={form[key] || ''}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  {value || form[key] || '—'}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* License Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="nova-card p-6"
      >
        <h3 className="text-sm font-semibold text-gray-600 mb-5 flex items-center gap-2">
          <Shield size={14} />
          License Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'License Number', key: 'licenseNumber' },
            { label: 'License Expiry', key: 'licenseExpiry', type: 'date' },
          ].map(({ label, key, type = 'text' }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
              {editing ? (
                <input
                  type={type}
                  value={form[key] || ''}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  {form[key] || '—'}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Emergency Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="nova-card p-6"
      >
        <h3 className="text-sm font-semibold text-gray-600 mb-5 flex items-center gap-2">
          <Phone size={14} />
          Emergency Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Contact Name', key: 'emergencyContact' },
            { label: 'Contact Phone', key: 'emergencyPhone' },
          ].map(({ label, key }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
              {editing ? (
                <input
                  type="text"
                  value={form[key] || ''}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  {form[key] || '—'}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Assigned Bus Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="nova-card p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100"
      >
        <h3 className="text-sm font-semibold text-gray-600 mb-5 flex items-center gap-2">
          <Bus size={14} />
          Assigned Bus
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Bus Number', value: profile?.busNumber || user?.busNumber || '—' },
            { label: 'License Plate', value: profile?.licensePlate || user?.licensePlate || '—' },
            { label: 'Route', value: profile?.route || user?.route || '—' },
            { label: 'Status', value: 'Active' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-4 bg-white rounded-xl border border-orange-100 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</p>
              <p className="text-base font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end gap-3"
        >
          <Button variant="secondary" onClick={() => setEditing(false)} className="rounded-xl px-6">
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl px-6 bg-orange-500 hover:bg-orange-600"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </motion.div>
      )}
    </div>
  );
};
