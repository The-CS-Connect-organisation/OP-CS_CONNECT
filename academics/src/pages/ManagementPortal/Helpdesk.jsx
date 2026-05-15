import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Plus, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, X, Search, Filter } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';
import { Select } from '../../components/ui/Select';

export function Helpdesk({ user, addToast }) {
  const [tickets, setTickets] = useState([]);
  const [devices, setDevices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' });
  const [showForm, setShowForm] = useState(false);
  const [showDeviceRequest, setShowDeviceRequest] = useState(false);
  const [formData, setFormData] = useState({ subject: '', description: '', category: 'software', priority: 'medium', deviceId: '' });
  const [deviceRequest, setDeviceRequest] = useState({ deviceType: 'laptop', quantity: 1, reason: '', requestedDate: new Date().toISOString().split('T')[0] });

  useEffect(() => { loadTickets(); loadDevices(); }, []);

  const loadTickets = async () => {
    try { setLoading(true); const res = await teacherApi.getTickets(); if (res?.success) setTickets(res.tickets || []); }
    catch (e) { addToast?.('Failed to load tickets', 'error'); }
    finally { setLoading(false); }
  };

  const loadDevices = async () => {
    try { const res = await teacherApi.getDeviceInventory(); if (res?.success) setDevices(res.inventory); }
    catch { /* Device inventory is admin-only, ignore */ }
  };

  const handleCreateTicket = async () => {
    if (!formData.subject || !formData.description) { addToast?.('Subject and description required', 'error'); return; }
    try {
      await teacherApi.createTicket(formData);
      addToast?.('Ticket created successfully', 'success');
      setShowForm(false);
      setFormData({ subject: '', description: '', category: 'software', priority: 'medium', deviceId: '' });
      loadTickets();
    } catch (e) { addToast?.('Failed to create ticket', 'error'); }
  };

  const handleResolve = async (ticketId) => {
    const resolution = prompt('Resolution notes:');
    if (!resolution) return;
    try {
      await teacherApi.resolveTicket(ticketId, { resolution });
      addToast?.('Ticket resolved', 'success');
      loadTickets();
    } catch (e) { addToast?.('Failed to resolve', 'error'); }
  };

  const handleRequestDevice = async () => {
    if (!deviceRequest.reason || deviceRequest.reason.length < 10) { addToast?.('Reason must be at least 10 characters', 'error'); return; }
    try {
      await teacherApi.requestDevice(deviceRequest);
      addToast?.('Device request submitted', 'success');
      setShowDeviceRequest(false);
      loadDevices();
    } catch (e) { addToast?.('Failed to submit request', 'error'); }
  };

  const priorityColors = { urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/30', high: 'bg-orange-500/10 text-orange-400 border-orange-500/30', medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30', low: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
  const statusColors = { open: 'bg-slate-500/10 text-slate-400 border-slate-500/30', in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/30', pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30', resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', closed: 'bg-slate-700/20 text-slate-400 border-slate-600/30' };

  const filteredTickets = tickets.filter(t =>
    (!filters.status || t.status === filters.status) &&
    (!filters.priority || t.priority === filters.priority) &&
    (!filters.category || t.category === filters.category)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">IT Helpdesk & Device Ticketing</h2>
          <p className="text-sm text-slate-400 mt-1">Submit and track support tickets</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowDeviceRequest(true)} className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg flex items-center gap-2">
            <Plus size={16} /> Request Device
          </button>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <Headphones size={16} /> New Ticket
          </button>
        </div>
      </div>

      {/* Device Summary */}
      {devices && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatPill icon={Headphones} label="Total Devices" value={devices.total || 0} gradient="from-blue-500 to-indigo-500" glow="shadow-blue-500/10" />
          <StatPill icon={CheckCircle} label="Available" value={devices.available || 0} gradient="from-emerald-500 to-teal-500" glow="shadow-emerald-500/10" />
          <StatPill icon={RefreshCw} label="In Use" value={devices.assigned || 0} gradient="from-amber-500 to-orange-500" glow="shadow-amber-500/10" />
          <StatPill icon={AlertTriangle} label="Maintenance" value={devices.maintenance || 0} gradient="from-rose-500 to-red-500" glow="shadow-rose-500/10" />
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Search className="w-4 h-4 text-slate-500" />
          <Select options={['', 'open', 'in_progress', 'pending', 'resolved', 'closed']} labels={['All Status', 'Open', 'In Progress', 'Pending', 'Resolved', 'Closed']} value={filters.status} onChange={v => setFilters({ ...filters, status: v })} className="w-36" />
          <Select options={['', 'low', 'medium', 'high', 'urgent']} labels={['All Priority', 'Low', 'Medium', 'High', 'Urgent']} value={filters.priority} onChange={v => setFilters({ ...filters, priority: v })} className="w-32" />
          <Select options={['', 'hardware', 'software', 'network', 'account', 'general']} labels={['All Categories', 'Hardware', 'Software', 'Network', 'Account', 'General']} value={filters.category} onChange={v => setFilters({ ...filters, category: v })} className="w-36" />
          <span className="text-xs text-slate-500 ml-auto">{filteredTickets.length} tickets</span>
        </div>
      </Card>

      {/* Ticket List */}
      <Card>
        <h3 className="text-sm font-bold text-slate-300 mb-4">Support Tickets</h3>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Headphones size={32} className="mx-auto mb-3 opacity-30" />
            <p>No tickets found</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTickets.map((ticket) => (
                <motion.div key={ticket.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-white/5 backdrop-blur-sm border-slate-700/40 hover:border-slate-600 transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${priorityColors[ticket.priority] || 'bg-slate-800'}`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white truncate">{ticket.subject}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[ticket.status]}`}>{ticket.status}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">{ticket.description?.substring(0, 80)}{ticket.description?.length > 80 ? '...' : ''}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className={`capitalize ${priorityColors[ticket.priority].split(' ')[1]}`}>{ticket.priority}</span>
                      <span>{ticket.category}</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket.assignedToName && <span>🔧 {ticket.assignedToName}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                      <button onClick={() => handleResolve(ticket.id)} className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/30 transition-colors">Resolve</button>
                    )}
                    {user?.role === 'admin' && (
                      <button className="text-slate-500 hover:text-slate-300"><XCircle size={14} /></button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">New Support Ticket</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="Subject" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the issue..." rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <Select options={['hardware', 'software', 'network', 'account', 'general']} labels={['Hardware', 'Software', 'Network', 'Account', 'General']} value={formData.category} onChange={v => setFormData({ ...formData, category: v })} className="w-full" />
                  <Select options={['low', 'medium', 'high', 'urgent']} labels={['Low', 'Medium', 'High', 'Urgent']} value={formData.priority} onChange={v => setFormData({ ...formData, priority: v })} className="w-full" />
                </div>
                <button onClick={handleCreateTicket} className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all">Submit Ticket</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device Request Modal */}
      <AnimatePresence>
        {showDeviceRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Request Device</h3>
                <button onClick={() => setShowDeviceRequest(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <Select options={['laptop', 'tablet', 'desktop', 'printer', 'projector', 'other']} labels={['Laptop', 'Tablet', 'Desktop', 'Printer', 'Projector', 'Other']} value={deviceRequest.deviceType} onChange={v => setDeviceRequest({ ...deviceRequest, deviceType: v })} className="w-full" />
                <input type="number" min="1" max="100" value={deviceRequest.quantity} onChange={e => setDeviceRequest({ ...deviceRequest, quantity: parseInt(e.target.value) || 1 })} placeholder="Quantity" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400" />
                <input type="date" value={deviceRequest.requestedDate} onChange={e => setDeviceRequest({ ...deviceRequest, requestedDate: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white focus:outline-none focus:border-emerald-500" />
                <textarea value={deviceRequest.reason} onChange={e => setDeviceRequest({ ...deviceRequest, reason: e.target.value })} placeholder="Reason for request (min 10 chars)..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 resize-none" />
                <button onClick={handleRequestDevice} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                  <Plus size={18} /> Submit Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, gradient, glow }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`relative overflow-hidden rounded-2xl p-4 ${gradient} border ${glow} shadow-lg`}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/5 -mr-3 -mt-3" />
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-sm">
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
          <p className="text-[10px] font-semibold text-white/70 uppercase tracking-widest">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}