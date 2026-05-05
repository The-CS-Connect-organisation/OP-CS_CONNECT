import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Trash2, Loader2, Plus } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

/**
 * @component NotificationCenter
 * @description Automated notifications management with trigger configuration and real backend history
 * @param {Object} user - Current user object
 * @param {Function} addToast - Toast notification function
 */

const NotificationTrigger = ({ trigger, onToggle, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="nova-card p-4 flex items-center justify-between"
  >
    <div className="flex-1">
      <h4 className="text-sm font-semibold text-gray-900">{trigger.name}</h4>
      <p className="text-xs text-gray-500 mt-1">{trigger.description}</p>
      {trigger.settings && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(trigger.settings).map(([k, v]) => (
            <span key={k} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">{k}: {v}</span>
          ))}
        </div>
      )}
    </div>
    <div className="flex items-center gap-2 ml-4">
      <button
        onClick={() => onToggle(trigger.id)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${trigger.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
      >
        {trigger.enabled ? 'On' : 'Off'}
      </button>
      <button
        onClick={() => onDelete(trigger.id)}
        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </motion.div>
);

export const NotificationCenter = ({ user, addToast }) => {
  const [activeTab, setActiveTab] = useState('triggers');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [triggers, setTriggers] = useState([
    { id: 'due-date', name: 'Assignment Due Date', description: 'Notify when assignment due date is approaching', enabled: true, settings: { interval: '1 day before' } },
    { id: 'low-grade', name: 'Low Grade Submitted', description: 'Notify when student submits grade below threshold', enabled: true, settings: { threshold: 'Below 60%' } },
    { id: 'high-absence', name: 'High Absence Rate', description: 'Notify when student has multiple absences', enabled: true, settings: { threshold: '3+ absences in 2 weeks' } },
    { id: 'no-submission', name: 'No Submission by Deadline', description: 'Notify when assignment deadline passes without submission', enabled: true, settings: { interval: 'At deadline' } },
  ]);
  const [newTrigger, setNewTrigger] = useState({ name: '', description: '', interval: '1 day before' });
  const [creating, setCreating] = useState(false);

  // Load notifications when history tab is active
  useEffect(() => {
    if (activeTab !== 'history') return;
    let alive = true;
    (async () => {
      try {
        setLoadingHistory(true);
        const [notifRes, countRes] = await Promise.allSettled([
          teacherApi.getNotifications(),
          teacherApi.getUnreadCount(),
        ]);
        if (!alive) return;
        if (notifRes.status === 'fulfilled') {
          const d = notifRes.value?.data?.data ?? notifRes.value?.data ?? [];
          setNotifications(Array.isArray(d) ? d : d.notifications ?? []);
        }
        if (countRes.status === 'fulfilled') {
          const d = countRes.value?.data?.data ?? countRes.value?.data ?? {};
          setUnreadCount(d.count ?? d.unreadCount ?? 0);
        }
      } catch (err) {
        if (!alive) return;
        addToast?.('Failed to load notifications', 'error');
      } finally {
        if (alive) setLoadingHistory(false);
      }
    })();
    return () => { alive = false; };
  }, [activeTab]);

  const handleToggleTrigger = (id) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
    const t = triggers.find(t => t.id === id);
    addToast?.(`${t?.name} ${!t?.enabled ? 'enabled' : 'disabled'}`, 'success');
  };

  const handleDeleteTrigger = (id) => {
    setTriggers(prev => prev.filter(t => t.id !== id));
    addToast?.('Trigger deleted', 'success');
  };

  const handleAddTrigger = () => {
    if (!newTrigger.name.trim()) return;
    setTriggers(prev => [...prev, {
      id: `trigger-${Date.now()}`,
      name: newTrigger.name,
      description: newTrigger.description,
      enabled: true,
      settings: { interval: newTrigger.interval },
    }]);
    setNewTrigger({ name: '', description: '', interval: '1 day before' });
    addToast?.('Trigger created', 'success');
  };

  const handleCreateNotification = async () => {
    try {
      setCreating(true);
      await teacherApi.createNotification({
        title: 'Manual Notification',
        message: 'Sent from Notification Center',
        type: 'general',
      });
      addToast?.('Notification sent', 'success');
    } catch (err) {
      addToast?.('Failed to send notification', 'error');
    } finally {
      setCreating(false);
    }
  };

  const enabledCount = triggers.filter(t => t.enabled).length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell size={32} className="text-blue-500" />
            Notification Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure automated notifications and view history</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleCreateNotification} disabled={creating} className="rounded-xl">
          {creating ? 'Sending...' : 'Send Notification'}
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-2 border-b border-gray-200">
        {['triggers', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            {tab === 'triggers' ? 'Notification Triggers' : `History${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </motion.div>

      {/* Triggers Tab */}
      {activeTab === 'triggers' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="nova-card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Active Triggers</h3>
                <p className="text-xs text-gray-600 mt-1">{enabledCount} of {triggers.length} triggers enabled</p>
              </div>
              <div className="text-3xl font-bold text-blue-600">{enabledCount}</div>
            </div>
          </motion.div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600">Configured Triggers</h3>
            <AnimatePresence>
              {triggers.map(trigger => (
                <NotificationTrigger key={trigger.id} trigger={trigger} onToggle={handleToggleTrigger} onDelete={handleDeleteTrigger} />
              ))}
            </AnimatePresence>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="nova-card p-6">
            <h3 className="text-sm font-semibold mb-4 text-gray-600">Create New Trigger</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Trigger Name</label>
                <input type="text" value={newTrigger.name} onChange={e => setNewTrigger(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Weekly Grade Report" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Description</label>
                <textarea value={newTrigger.description} onChange={e => setNewTrigger(p => ({ ...p, description: e.target.value }))} placeholder="Describe what this trigger does..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" rows="2" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Reminder Interval</label>
                <select value={newTrigger.interval} onChange={e => setNewTrigger(p => ({ ...p, interval: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                  <option>1 hour before</option>
                  <option>1 day before</option>
                  <option>2 days before</option>
                  <option>1 week before</option>
                  <option>At deadline</option>
                </select>
              </div>
              <Button variant="primary" onClick={handleAddTrigger} className="w-full rounded-lg">Create Trigger</Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-600">Recent Notifications</h3>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-blue-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center border border-dashed rounded-xl border-gray-200">
              <Bell size={40} className="mx-auto mb-4 text-gray-200" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((n, idx) => (
                <motion.div
                  key={n._id ?? n.id ?? idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`nova-card p-4 flex items-start justify-between ${n.read ? 'opacity-60' : 'border-l-4 border-l-blue-500'}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <p className="text-xs text-gray-600">{n.message ?? n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.read && (
                    <button className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all ml-4" title="Mark as read">
                      <CheckCircle size={16} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </div>
  );
};
