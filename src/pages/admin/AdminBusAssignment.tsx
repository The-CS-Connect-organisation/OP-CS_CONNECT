import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Bus, Plus, Trash2, User, MapPin, Phone } from 'lucide-react';

interface BusAssignment {
  id: string;
  busNumber: string;
  routeName: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  assignedStudents: number;
  stops: string[];
  status: 'active' | 'inactive' | 'maintenance';
}

export default function AdminBusAssignment() {
  const [buses, setBuses] = useState<BusAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ busNumber: '', routeName: '', driverName: '', driverPhone: '', capacity: 40, stops: '' });

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      setLoading(true);
      const data = await api.getBusAssignments();
      setBuses(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.busNumber.trim()) return;
    try {
      const newBus = await api.createBusAssignment({ ...form, stops: form.stops.split(',').map(s => s.trim()).filter(Boolean) });
      setBuses(prev => [...prev, newBus]);
      setForm({ busNumber: '', routeName: '', driverName: '', driverPhone: '', capacity: 40, stops: '' });
      setShowForm(false);
    } catch {
      // error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBusAssignment(id);
      setBuses(prev => prev.filter(b => b.id !== id));
    } catch {
      // error
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'maintenance': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bus Assignment</h1>
          <p className="text-muted-foreground">Manage bus routes & assignments</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Bus
        </Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Add Bus Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Bus Number" value={form.busNumber} onChange={(e) => setForm({ ...form, busNumber: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Route Name" value={form.routeName} onChange={(e) => setForm({ ...form, routeName: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Driver Name" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Driver Phone" value={form.driverPhone} onChange={(e) => setForm({ ...form, driverPhone: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 40 })} className="px-3 py-2 rounded-lg border bg-background" />
            <input type="text" placeholder="Stops (comma separated)" value={form.stops} onChange={(e) => setForm({ ...form, stops: e.target.value })} className="px-3 py-2 rounded-lg border bg-background" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreate}>Add</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buses.map(bus => (
            <Card key={bus.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bus className="w-6 h-6 text-orange-500" />
                  <div>
                    <h3 className="font-semibold">Bus #{bus.busNumber}</h3>
                    <p className="text-sm text-muted-foreground">{bus.routeName}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(bus.status)}>{bus.status}</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{bus.driverName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{bus.driverPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{bus.assignedStudents}/{bus.capacity} students</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleDelete(bus.id)} className="text-sm text-red-500 hover:underline">Remove</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
