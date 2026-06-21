import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Building2, Wrench, ClipboardCheck, Zap, Droplets, Shield as ShieldIcon, Plus, Search, Filter, CheckCircle, XCircle, Edit2, Trash2, Eye, MapPin, User, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface Building {
  id: string;
  name: string;
  code: string;
  floors: number;
  totalRooms: number;
  address: string;
  status: 'active' | 'inactive' | 'maintenance';
}

interface Room {
  id: string;
  buildingId: string;
  buildingName: string;
  roomNumber: string;
  floor: number;
  type: string;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance';
}

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in-progress' | 'completed';
  assignedTo: string;
  location: string;
  createdAt: string;
  completedAt: string;
}

interface Inspection {
  id: string;
  title: string;
  area: string;
  conductedBy: string;
  date: string;
  findings: string;
  rating: 'pass' | 'conditional' | 'fail';
  nextDue: string;
}

interface EnergyReading {
  id: string;
  meterId: string;
  location: string;
  reading: number;
  unit: string;
  recordedAt: string;
  type: 'electricity' | 'water' | 'gas';
}

interface SupplyItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unit: string;
  lastRestocked: string;
}

interface CleaningSchedule {
  id: string;
  area: string;
  assignedTo: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastCleaned: string;
  nextDue: string;
  status: 'completed' | 'pending' | 'overdue';
}

interface VisitorLog {
  id: string;
  name: string;
  contact: string;
  purpose: string;
  host: string;
  checkIn: string;
  checkOut: string;
  badgeIssued: boolean;
}

interface EmergencyDrill {
  id: string;
  type: string;
  date: string;
  conductedBy: string;
  duration: number;
  participants: number;
  notes: string;
}

interface SafetyIncident {
  id: string;
  type: string;
  location: string;
  date: string;
  reportedBy: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved';
}

export default function AdminFacilities() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
  { id: 'wo1', title: 'AC Repair', description: 'AC not cooling in Room 101', priority: 'high', status: 'open', assignedTo: 'Maintenance Team', location: 'Room 101', createdAt: '2026-06-20', completedAt: undefined },
  { id: 'wo2', title: 'Broken Window', description: 'Window latch broken', priority: 'medium', status: 'in-progress', assignedTo: 'John Doe', location: 'Room 102', createdAt: '2026-06-19', completedAt: undefined }
]);
  const [inspections, setInspections] = useState<Inspection[]>([
  { id: 'i1', title: 'Fire Safety Check', area: 'Main Block', conductedBy: 'John Doe', date: '2026-06-15', findings: 'All extinguishers up to date.', rating: 'pass', nextDue: '2026-12-15' },
  { id: 'i2', title: 'HVAC Inspection', area: 'Science Wing', conductedBy: 'Jane Smith', date: '2026-06-18', findings: 'Filter replacement needed.', rating: 'conditional', nextDue: '2026-09-18' }
]);
  const [energyReadings, setEnergyReadings] = useState<EnergyReading[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([
  { id: 's1', name: 'Whiteboard Markers', category: 'stationery', quantity: 50, minThreshold: 20, unit: 'boxes', lastRestocked: '2026-05-10' },
  { id: 's2', name: 'Hand Sanitizer', category: 'cleaning', quantity: 15, minThreshold: 30, unit: 'bottles', lastRestocked: '2026-04-20' }
]);
  const [cleaningSchedules, setCleaningSchedules] = useState<CleaningSchedule[]>([
  { id: 'c1', area: 'Main Block - Ground Floor', assignedTo: 'Cleaning Staff A', frequency: 'daily', lastCleaned: '2026-06-20', nextDue: '2026-06-21', status: 'completed' },
  { id: 'c2', area: 'Science Lab', assignedTo: 'Cleaning Staff B', frequency: 'weekly', lastCleaned: '2026-06-15', nextDue: '2026-06-22', status: 'pending' }
]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [emergencyDrills, setEmergencyDrills] = useState<EmergencyDrill[]>([]);
  const [safetyIncidents, setSafetyIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('buildings');
  const [modalType, setModalType] = useState<'building' | 'room' | 'workOrder' | 'inspection' | 'energy' | 'supply' | 'cleaning' | 'visitor' | 'drill' | 'incident' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [bld, rm, wo, insp, eng, sup, cln, vis, drl, saf] = await Promise.all([
        api.getBuildings().catch(() => []),
        api.getFacilityRooms().catch(() => []),
        api.getWorkOrders().catch(() => []),
        api.getInspections().catch(() => []),
        api.getEnergyUsage().catch(() => []),
        api.getSupplyAudit().catch(() => []),
        api.getCleaningSchedules().catch(() => []),
        api.getVisitorLogs().catch(() => []),
        api.getEmergencyDrills().catch(() => []),
        api.getSafetyIncidents().catch(() => []),
      ]);
      setBuildings(Array.isArray(bld) ? bld : []);
      setRooms(Array.isArray(rm) ? rm : []);
      setWorkOrders(Array.isArray(wo) ? wo : []);
      setInspections(Array.isArray(insp) ? insp : []);
      setEnergyReadings(Array.isArray(eng) ? eng : []);
      setSupplies(Array.isArray(sup) ? sup : []);
      setCleaningSchedules(Array.isArray(cln) ? cln : []);
      setVisitorLogs(Array.isArray(vis) ? vis : []);
      setEmergencyDrills(Array.isArray(drl) ? drl : []);
      setSafetyIncidents(Array.isArray(saf) ? saf : []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: typeof modalType, data?: any) => {
    setModalType(type);
    setEditingId(data?.id || null);
    setForm(data || {});
  };

  const closeModal = () => {
    setModalType(null);
    setEditingId(null);
    setForm({});
  };

  const handleSave = async () => {
    try {
      switch (modalType) {
        case 'building':
          if (editingId) {
            await api.createBuilding(form);
          } else {
            await api.createBuilding(form);
          }
          break;
        case 'room':
          if (editingId) {
            await api.updateFacilityRoom(editingId, form);
          } else {
            await api.createFacilityRoom(form);
          }
          break;
        case 'workOrder':
          await api.createWorkOrder(form);
          break;
        case 'inspection':
          await api.createInspection(form);
          break;
        case 'energy':
          await api.logEnergyUsage(form);
          break;
        case 'supply':
          await api.updateSupplyStock(form);
          break;
        case 'cleaning':
          await api.createCleaningSchedule(form);
          break;
        case 'visitor':
          await api.logVisitor(form);
          break;
        case 'drill':
          await api.logEmergencyDrill(form);
          break;
        case 'incident':
          await api.reportSafetyIncident(form);
          break;
      }
      closeModal();
      loadAll();
    } catch {
    }
  };

  const handleCompleteWorkOrder = async (id: string) => {
    try {
      await api.completeWorkOrder(id);
      loadAll();
    } catch {
    }
  };

  const filteredBuildings = buildings.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  const filteredRooms = rooms.filter(r => r.roomNumber.toLowerCase().includes(search.toLowerCase()) || r.buildingName.toLowerCase().includes(search.toLowerCase()));
  const filteredWorkOrders = workOrders.filter(w => w.title.toLowerCase().includes(search.toLowerCase()));
  const filteredInspections = inspections.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
  const filteredSupplies = supplies.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const filteredVisitors = visitorLogs.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));
  const filteredIncidents = safetyIncidents.filter(s => s.type.toLowerCase().includes(search.toLowerCase()));

  const priorityColor = (p: string) => {
    switch (p) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'completed': case 'resolved': case 'pass': case 'available': case 'active': return 'success';
      case 'in-progress': case 'investigating': case 'conditional': case 'occupied': return 'warning';
      case 'open': case 'reported': case 'pending': case 'fail': case 'overdue': case 'maintenance': case 'inactive': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  const renderModal = () => {
    if (!modalType) return null;
    const titles: Record<string, string> = {
      building: 'Add Building',
      room: 'Add Room',
      workOrder: 'Create Work Order',
      inspection: 'New Inspection',
      energy: 'Log Energy Usage',
      supply: 'Update Supply Stock',
      cleaning: 'New Cleaning Schedule',
      visitor: 'Log Visitor',
      drill: 'Log Emergency Drill',
      incident: 'Report Safety Incident',
    };
    return (
      <Modal isOpen={!!modalType} onClose={closeModal} title={titles[modalType]} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modalType === 'building' && (
            <>
              <div className="md:col-span-2"><Input placeholder="Building Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <Input placeholder="Code" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} />
              <Input placeholder="Floors" type="number" value={form.floors || ''} onChange={e => setForm({ ...form, floors: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Total Rooms" type="number" value={form.totalRooms || ''} onChange={e => setForm({ ...form, totalRooms: parseInt(e.target.value) || 0 })} />
              <div className="md:col-span-2"><Input placeholder="Address" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            </>
          )}
          {modalType === 'room' && (
            <>
              <Input placeholder="Room Number" value={form.roomNumber || ''} onChange={e => setForm({ ...form, roomNumber: e.target.value })} />
              <Input placeholder="Floor" type="number" value={form.floor || ''} onChange={e => setForm({ ...form, floor: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Type (classroom/lab/office)" value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} />
              <Input placeholder="Capacity" type="number" value={form.capacity || ''} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Building ID" value={form.buildingId || ''} onChange={e => setForm({ ...form, buildingId: e.target.value })} />
            </>
          )}
          {modalType === 'workOrder' && (
            <>
              <div className="md:col-span-2"><Input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="md:col-span-2"><Textarea placeholder="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <Input placeholder="Location" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} />
              <Input placeholder="Assigned To" value={form.assignedTo || ''} onChange={e => setForm({ ...form, assignedTo: e.target.value })} />
            </>
          )}
          {modalType === 'inspection' && (
            <>
              <div className="md:col-span-2"><Input placeholder="Title" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <Input placeholder="Area" value={form.area || ''} onChange={e => setForm({ ...form, area: e.target.value })} />
              <Input placeholder="Conducted By" value={form.conductedBy || ''} onChange={e => setForm({ ...form, conductedBy: e.target.value })} />
              <div className="md:col-span-2"><Textarea placeholder="Findings" value={form.findings || ''} onChange={e => setForm({ ...form, findings: e.target.value })} /></div>
            </>
          )}
          {modalType === 'energy' && (
            <>
              <Input placeholder="Meter ID" value={form.meterId || ''} onChange={e => setForm({ ...form, meterId: e.target.value })} />
              <Input placeholder="Location" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} />
              <Input placeholder="Reading" type="number" value={form.reading || ''} onChange={e => setForm({ ...form, reading: parseFloat(e.target.value) || 0 })} />
              <Input placeholder="Unit (kWh/m3)" value={form.unit || ''} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </>
          )}
          {modalType === 'supply' && (
            <>
              <Input placeholder="Item Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Category" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="Quantity" type="number" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Min Threshold" type="number" value={form.minThreshold || ''} onChange={e => setForm({ ...form, minThreshold: parseInt(e.target.value) || 0 })} />
            </>
          )}
          {modalType === 'cleaning' && (
            <>
              <Input placeholder="Area" value={form.area || ''} onChange={e => setForm({ ...form, area: e.target.value })} />
              <Input placeholder="Assigned To" value={form.assignedTo || ''} onChange={e => setForm({ ...form, assignedTo: e.target.value })} />
            </>
          )}
          {modalType === 'visitor' && (
            <>
              <Input placeholder="Visitor Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Contact" value={form.contact || ''} onChange={e => setForm({ ...form, contact: e.target.value })} />
              <div className="md:col-span-2"><Input placeholder="Purpose" value={form.purpose || ''} onChange={e => setForm({ ...form, purpose: e.target.value })} /></div>
              <Input placeholder="Host" value={form.host || ''} onChange={e => setForm({ ...form, host: e.target.value })} />
            </>
          )}
          {modalType === 'drill' && (
            <>
              <Input placeholder="Drill Type (fire/earthquake/lockdown)" value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} />
              <Input placeholder="Conducted By" value={form.conductedBy || ''} onChange={e => setForm({ ...form, conductedBy: e.target.value })} />
              <Input placeholder="Duration (minutes)" type="number" value={form.duration || ''} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Participants" type="number" value={form.participants || ''} onChange={e => setForm({ ...form, participants: parseInt(e.target.value) || 0 })} />
            </>
          )}
          {modalType === 'incident' && (
            <>
              <Input placeholder="Incident Type" value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} />
              <Input placeholder="Location" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} />
              <Input placeholder="Reported By" value={form.reportedBy || ''} onChange={e => setForm({ ...form, reportedBy: e.target.value })} />
              <div className="md:col-span-2"><Textarea placeholder="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </>
          )}
        </div>
        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
        </div>
      </Modal>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Facilities Management</h1>
        <p className="text-muted-foreground">Buildings, work orders, inspections & more</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="buildings"><Building2 className="w-4 h-4 mr-1" />Buildings</TabsTrigger>
          <TabsTrigger value="workOrders"><Wrench className="w-4 h-4 mr-1" />Work Orders</TabsTrigger>
          <TabsTrigger value="inspections"><ClipboardCheck className="w-4 h-4 mr-1" />Inspections</TabsTrigger>
          <TabsTrigger value="energy"><Zap className="w-4 h-4 mr-1" />Energy</TabsTrigger>
          <TabsTrigger value="supplies"><Droplets className="w-4 h-4 mr-1" />Supplies</TabsTrigger>
          <TabsTrigger value="cleaning"><Droplets className="w-4 h-4 mr-1" />Cleaning</TabsTrigger>
          <TabsTrigger value="visitors"><User className="w-4 h-4 mr-1" />Visitors</TabsTrigger>
          <TabsTrigger value="safety"><ShieldIcon className="w-4 h-4 mr-1" />Safety</TabsTrigger>
        </TabsList>

        <TabsContent value="buildings" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search buildings..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button onClick={() => openModal('building')}><Plus className="w-4 h-4 mr-2" />Add Building</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
            {filteredBuildings.length === 0 && <p className="text-muted-foreground col-span-full">No buildings found.</p>}
            {filteredBuildings.map(b => (
              <Card key={b.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-orange-500" />
                    <div>
                      <h3 className="font-semibold">{b.name}</h3>
                      <p className="text-xs text-muted-foreground">{b.code}</p>
                    </div>
                  </div>
                  <Badge variant={statusColor(b.status) as any}>{b.status}</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <p><MapPin className="w-3 h-3 inline mr-1 text-muted-foreground" />{b.address}</p>
                  <p className="text-muted-foreground">{b.floors} floors &bull; {b.totalRooms} rooms</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openModal('room', { buildingId: b.id })}><Plus className="w-3 h-3 mr-1" />Add Room</Button>
                </div>
              </Card>
            ))}
            {buildings.length === 0 && !loading && (
              <Card className="p-8 col-span-full text-center">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No buildings registered yet.</p>
                <Button className="mt-4" onClick={() => openModal('building')}><Plus className="w-4 h-4 mr-2" />Add Building</Button>
              </Card>
            )}
          </div>
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Rooms</h3>
            <div className="space-y-2">
              {filteredRooms.length === 0 && <p className="text-muted-foreground">No rooms found.</p>}
              {filteredRooms.map(r => (
                <Card key={r.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"><Building2 className="w-4 h-4 text-orange-500" /></div>
                    <div>
                      <p className="font-medium text-sm">{r.roomNumber} - {r.type}</p>
                      <p className="text-xs text-muted-foreground">{r.buildingName} &bull; Floor {r.floor} &bull; Capacity: {r.capacity}</p>
                    </div>
                  </div>
                  <Badge variant={statusColor(r.status) as any}>{r.status}</Badge>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workOrders" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search work orders..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button onClick={() => openModal('workOrder')}><Plus className="w-4 h-4 mr-2" />New Work Order</Button>
          </div>
          <div className="space-y-3">
            {filteredWorkOrders.length === 0 && <p className="text-muted-foreground">No work orders found.</p>}
            {filteredWorkOrders.map(wo => (
              <Card key={wo.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench className="w-4 h-4 text-orange-500" />
                      <h4 className="font-semibold">{wo.title}</h4>
                      <Badge variant={priorityColor(wo.priority) as any}>{wo.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{wo.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{wo.location}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{wo.assignedTo || 'Unassigned'}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(wo.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor(wo.status) as any}>{wo.status}</Badge>
                    {wo.status !== 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => handleCompleteWorkOrder(wo.id)}>
                        <CheckCircle className="w-3 h-3 mr-1" />Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search inspections..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button onClick={() => openModal('inspection')}><Plus className="w-4 h-4 mr-2" />New Inspection</Button>
          </div>
          <div className="space-y-3">
            {filteredInspections.length === 0 && <p className="text-muted-foreground">No inspections recorded.</p>}
            {filteredInspections.map(insp => (
              <Card key={insp.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ClipboardCheck className="w-4 h-4 text-orange-500" />
                      <h4 className="font-semibold">{insp.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{insp.area} &bull; By {insp.conductedBy}</p>
                    {insp.findings && <p className="text-sm mt-2">{insp.findings}</p>}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(insp.date).toLocaleDateString()}</span>
                      {insp.nextDue && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Next: {new Date(insp.nextDue).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <Badge variant={statusColor(insp.rating) as any}>{insp.rating}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="energy" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal('energy')}><Plus className="w-4 h-4 mr-2" />Log Reading</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
            {energyReadings.length === 0 && <p className="text-muted-foreground col-span-full">No energy readings logged.</p>}
            {energyReadings.map(e => (
              <Card key={e.id} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <h4 className="font-semibold text-sm">{e.type}</h4>
                </div>
                <p className="text-lg font-bold">{e.reading} <span className="text-sm font-normal text-muted-foreground">{e.unit}</span></p>
                <p className="text-xs text-muted-foreground">{e.location} &bull; {new Date(e.recordedAt).toLocaleString()}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="supplies" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search supplies..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button onClick={() => openModal('supply')}><Plus className="w-4 h-4 mr-2" />Update Stock</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
            {filteredSupplies.length === 0 && <p className="text-muted-foreground col-span-full">No supplies tracked.</p>}
            {filteredSupplies.map(s => (
              <Card key={s.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{s.name}</h4>
                  <Badge variant={s.quantity <= s.minThreshold ? 'destructive' : 'success'}>
                    {s.quantity <= s.minThreshold ? 'Low Stock' : 'In Stock'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{s.category}</p>
                <p className="text-lg font-bold mt-1">{s.quantity} <span className="text-sm font-normal text-muted-foreground">{s.unit}</span></p>
                <p className="text-xs text-muted-foreground">Min: {s.minThreshold} {s.unit}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cleaning" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal('cleaning')}><Plus className="w-4 h-4 mr-2" />Add Schedule</Button>
          </div>
          <div className="space-y-3">
            {cleaningSchedules.length === 0 && <p className="text-muted-foreground">No cleaning schedules.</p>}
            {cleaningSchedules.map(cs => (
              <Card key={cs.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{cs.area}</h4>
                      <p className="text-sm text-muted-foreground">{cs.assignedTo} &bull; {cs.frequency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={statusColor(cs.status) as any}>{cs.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Next: {new Date(cs.nextDue).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="visitors" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search visitors..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button onClick={() => openModal('visitor')}><Plus className="w-4 h-4 mr-2" />Log Visitor</Button>
          </div>
          <div className="space-y-3">
            {filteredVisitors.length === 0 && <p className="text-muted-foreground">No visitor logs.</p>}
            {filteredVisitors.map(v => (
              <Card key={v.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{v.name}</h4>
                    <p className="text-sm text-muted-foreground">{v.contact} &bull; {v.purpose}</p>
                    <p className="text-xs text-muted-foreground">Host: {v.host}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>In: {v.checkIn ? new Date(v.checkIn).toLocaleString() : '-'}</p>
                    <p>Out: {v.checkOut ? new Date(v.checkOut).toLocaleString() : 'Not checked out'}</p>
                    <Badge variant={v.badgeIssued ? 'success' : 'secondary'} className="mt-1">{v.badgeIssued ? 'Badge Issued' : 'No Badge'}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search incidents..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button onClick={() => openModal('drill')}><Plus className="w-4 h-4 mr-2" />Log Drill</Button>
            <Button onClick={() => openModal('incident')}><AlertTriangle className="w-4 h-4 mr-2" />Report Incident</Button>
          </div>
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><ShieldIcon className="w-4 h-4" />Emergency Drills</h3>
            <div className="space-y-2 mb-6">
              {emergencyDrills.length === 0 && <p className="text-muted-foreground">No drills logged.</p>}
              {emergencyDrills.map(d => (
                <Card key={d.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldIcon className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="font-medium text-sm capitalize">{d.type} Drill</p>
                      <p className="text-xs text-muted-foreground">{d.conductedBy} &bull; {d.duration}min &bull; {d.participants} participants</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(d.date).toLocaleDateString()}</p>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Safety Incidents</h3>
            <div className="space-y-2">
              {filteredIncidents.length === 0 && <p className="text-muted-foreground">No incidents reported.</p>}
              {filteredIncidents.map(inc => (
                <Card key={inc.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <h4 className="font-semibold">{inc.type}</h4>
                        <Badge variant={priorityColor(inc.severity) as any}>{inc.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{inc.location} &bull; {new Date(inc.date).toLocaleDateString()}</p>
                      <p className="text-sm mt-1">{inc.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Reported by: {inc.reportedBy}</p>
                    </div>
                    <Badge variant={statusColor(inc.status) as any}>{inc.status}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {renderModal()}
    </div>
  );
}

