import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Bus, Plus, User, MapPin, Phone, Search } from 'lucide-react';
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

export default function ManagerBusAssignment() {
  const [buses, setBuses] = useState<BusAssignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadBusAssignments() {
      try {
        const data = await api.getBusAssignments();
        setBuses(data);
      } catch (err) {
        console.error('[ManagerBusAssignment] Failed to load:', err);
      }
    }
    loadBusAssignments();
  }, []);
  const filteredBuses = buses.filter(b => b.routeName.toLowerCase().includes(searchQuery.toLowerCase()) || b.driverName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bus Assignment</h1>
          <p className="text-muted-foreground">Manage bus routes</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Add Bus</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search routes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
        {filteredBuses.map(bus => (
          <Card key={bus.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bus className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="font-semibold">Bus #{bus.busNumber}</h3>
                  <p className="text-sm text-muted-foreground">{bus.routeName}</p>
                </div>
              </div>
              <Badge className={bus.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>{bus.status}</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /><span>{bus.driverName}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{bus.driverPhone}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{bus.assignedStudents}/{bus.capacity} students</span></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

