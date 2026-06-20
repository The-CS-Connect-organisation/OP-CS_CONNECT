import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Bus, Plus, User, MapPin, Phone, Search, Edit, Trash2, X, Wrench, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';

interface BusAssignment {
  id: string;
  busNumber: string;
  routeName: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  assignedStudents: number;
  status: string;
}

const EMPTY_FORM = {
  busNumber: '', routeName: '', driverName: '', driverPhone: '',
  capacity: 40, status: 'active',
};

export default function ManagerBusAssignment() {
  const [buses, setBuses] = useState<BusAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadBuses(); }, []);

  const loadBuses = async () => {
    try {
      setLoading(true);
      const data = await api.getBusAssignments();
      setBuses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[ManagerBusAssignment] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.busNumber) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.updateBusAssignment(editingId, form);
        setBuses(prev => prev.map(b => b.id === editingId ? { ...b, ...form } : b));
      } else {
        const res = await api.createBusAssignment(form);
        setBuses(prev => [...prev, res]);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error('[ManagerBusAssignment] Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bus assignment?')) return;
    try {
      await api.deleteBusAssignment(id);
      setBuses(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('[ManagerBusAssignment] Failed to delete:', err);
    }
  };

  const handleEdit = (bus: BusAssignment) => {
    setEditingId(bus.id);
    setForm({
      busNumber: bus.busNumber,
      routeName: bus.routeName || '',
      driverName: bus.driverName || '',
      driverPhone: bus.driverPhone || '',
      capacity: bus.capacity || 40,
      status: bus.status || 'active',
    });
    setShowForm(true);
  };

  const toggleStatus = async (bus: BusAssignment) => {
    const newStatus = bus.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateBusAssignment(bus.id, { ...bus, status: newStatus });
      setBuses(prev => prev.map(b => b.id === bus.id ? { ...b, status: newStatus } : b));
    } catch {}
  };

  const filteredBuses = buses.filter(b =>
    b.busNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.routeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.driverName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = buses.filter(b => b.status === 'active').length;
  const totalCapacity = buses.reduce((s, b) => s + (b.capacity || 0), 0);
  const totalAssigned = buses.reduce((s, b) => s + (b.assignedStudents || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bus Assignment</h1>
          <p className="text-muted-foreground">Manage school bus fleet, routes & driver assignments</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Bus
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <Bus className="w-8 h-8 text-orange-500" />
            <div><p className="text-2xl font-bold stat-value">{buses.length}</p><p className="text-sm text-muted-foreground">Total Buses</p></div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-green-500" />
            <div><p className="text-2xl font-bold stat-value">{activeCount}</p><p className="text-sm text-muted-foreground">Active Buses</p></div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-blue-500" />
            <div><p className="text-2xl font-bold stat-value">{totalAssigned}/{totalCapacity}</p><p className="text-sm text-muted-foreground">Students Assigned</p></div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-yellow-500" />
            <div><p className="text-2xl font-bold stat-value">{buses.filter(b => b.status === 'inactive').length}</p><p className="text-sm text-muted-foreground">Inactive/Maintenance</p></div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search by bus number, route or driver..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
      </div>

      {/* Add/Edit Bus Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Bus' : 'Add Bus'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bus Number *</label>
                  <input required value={form.busNumber} onChange={e => setForm(f => ({ ...f, busNumber: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="KA-01-1234" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <input type="number" min="1" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Route Name</label>
                <input value={form.routeName} onChange={e => setForm(f => ({ ...f, routeName: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="Route 1 - City Center" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Driver Name</label>
                  <input value={form.driverName} onChange={e => setForm(f => ({ ...f, driverName: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="Rajesh Kumar" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Driver Phone</label>
                  <input value={form.driverPhone} onChange={e => setForm(f => ({ ...f, driverPhone: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="+91 9876543210" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive / Maintenance</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving || !form.busNumber}>
                  {saving ? 'Saving...' : editingId ? 'Update Bus' : 'Add Bus'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bus Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : filteredBuses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border rounded-lg">
          <Bus className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No buses found. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuses.map(bus => {
            const occupancyPct = bus.capacity > 0 ? Math.round(((bus.assignedStudents || 0) / bus.capacity) * 100) : 0;
            return (
              <Card key={bus.id} className="p-4 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bus.status === 'active' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <Bus className={`w-5 h-5 ${bus.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Bus #{bus.busNumber}</h3>
                      <p className="text-xs text-muted-foreground">{bus.routeName || 'No route assigned'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleStatus(bus)} title="Toggle status">
                      {bus.status === 'active' ? (
                        <Badge variant="success" className="text-[10px] cursor-pointer">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] cursor-pointer">Inactive</Badge>
                      )}
                    </button>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className={occupancyPct > 90 ? 'text-red-600 font-medium' : 'text-green-600'}>{bus.assignedStudents || 0}/{bus.capacity}</span>
                  </div>
                  <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${occupancyPct > 90 ? 'bg-red-500' : occupancyPct > 75 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min(occupancyPct, 100)}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  {bus.driverName && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{bus.driverName}</span>
                    </div>
                  )}
                  {bus.driverPhone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{bus.driverPhone}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-1 mt-3 pt-3 border-t">
                  <button onClick={() => handleEdit(bus)} className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(bus.id)} className="p-1.5 hover:bg-red-100 rounded text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
