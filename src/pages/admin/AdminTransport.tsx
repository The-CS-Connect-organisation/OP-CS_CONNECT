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
import { Truck, Bus, Car, Fuel, MapPin, Route, Users, Wrench, Plus, Search, Edit2, Trash2, Eye, CheckCircle, XCircle, AlertTriangle, Clock, Activity } from 'lucide-react';

interface TransportRoute {
  id: string;
  name: string;
  code: string;
  startPoint: string;
  endPoint: string;
  stops: string[];
  distance: number;
  status: 'active' | 'inactive' | 'suspended';
}

interface FleetVehicle {
  id: string;
  registration: string;
  model: string;
  capacity: number;
  year: number;
  status: 'active' | 'maintenance' | 'retired';
  fuelType: string;
  lastService: string;
}

interface FleetMaintenance {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  type: string;
  description: string;
  date: string;
  cost: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  technician: string;
}

interface Driver {
  id: string;
  name: string;
  license: string;
  phone: string;
  email: string;
  status: 'available' | 'on-route' | 'off-duty';
  assignedVehicle: string;
  joinDate: string;
}

interface VehicleTracking {
  vehicleId: string;
  vehicleReg: string;
  latitude: number;
  longitude: number;
  speed: number;
  lastUpdated: string;
  status: 'moving' | 'idle' | 'stopped';
}

interface RidershipRecord {
  id: string;
  routeId: string;
  routeName: string;
  date: string;
  boardings: number;
  alightings: number;
  vehicleId: string;
}

interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: 'school' | 'stop' | 'depot';
  status: 'active' | 'inactive';
}

interface DelayReport {
  id: string;
  routeId: string;
  routeName: string;
  vehicleId: string;
  reason: string;
  duration: number;
  reportedAt: string;
  status: 'active' | 'resolved';
}

interface RouteChange {
  id: string;
  routeId: string;
  routeName: string;
  description: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedAt: string;
}

export default function AdminTransport() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [maintenance, setMaintenance] = useState<FleetMaintenance[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [tracking, setTracking] = useState<VehicleTracking[]>([]);
  const [ridership, setRidership] = useState<RidershipRecord[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [delays, setDelays] = useState<DelayReport[]>([]);
  const [routeChanges, setRouteChanges] = useState<RouteChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('routes');
  const [modalType, setModalType] = useState<'route' | 'vehicle' | 'maintenance' | 'driver' | 'geofence' | 'delay' | 'routeChange' | 'ridership' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [rt, vh, mt, dr, tr, rd, gf, dl, rc] = await Promise.all([
        api.getTransportRoutes().catch(() => []),
        api.getFleetVehicles().catch(() => []),
        api.getFleetMaintenance().catch(() => []),
        api.getDrivers().catch(() => []),
        api.getVehicleTracking('').catch(() => []),
        api.getRidership().catch(() => []),
        api.getGeofences().catch(() => []),
        api.getDelays().catch(() => []),
        api.getRouteChanges().catch(() => []),
      ]);
      setRoutes(Array.isArray(rt) ? rt : []);
      setVehicles(Array.isArray(vh) ? vh : []);
      setMaintenance(Array.isArray(mt) ? mt : []);
      setDrivers(Array.isArray(dr) ? dr : []);
      setTracking(Array.isArray(tr) ? tr : []);
      setRidership(Array.isArray(rd) ? rd : []);
      setGeofences(Array.isArray(gf) ? gf : []);
      setDelays(Array.isArray(dl) ? dl : []);
      setRouteChanges(Array.isArray(rc) ? rc : []);
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
        case 'route':
          if (editingId) {
            await api.updateTransportRoute(editingId, form);
          } else {
            await api.createTransportRoute(form);
          }
          break;
        case 'vehicle':
          if (editingId) {
            await api.updateFleetVehicle(editingId, form);
          } else {
            await api.addFleetVehicle(form);
          }
          break;
        case 'maintenance':
          await api.logFleetMaintenance(form);
          break;
        case 'driver':
          if (editingId) {
            await api.updateDriver(editingId, form);
          } else {
            await api.addDriver(form);
          }
          break;
        case 'geofence':
          await api.createGeofence(form);
          break;
        case 'delay':
          await api.reportDelay(form);
          break;
        case 'ridership':
          await api.logRidership(form);
          break;
      }
      closeModal();
      loadAll();
    } catch {
    }
  };

  const handleRouteChangeAction = async (id: string, action: string) => {
    try {
      await api.processRouteChange(id, action);
      loadAll();
    } catch {
    }
  };

  const filteredRoutes = routes.filter(r => (r.name ?? '').toLowerCase().includes(search.toLowerCase()));
  const filteredVehicles = vehicles.filter(v => (v.registration ?? '').toLowerCase().includes(search.toLowerCase()));
  const filteredDrivers = drivers.filter(d => (d.name ?? '').toLowerCase().includes(search.toLowerCase()));

  const statusVariant = (s: string) => {
    switch (s) {
      case 'active': case 'available': case 'completed': case 'approved': case 'resolved': case 'moving': return 'success';
      case 'in-progress': case 'on-route': case 'pending': case 'idle': case 'scheduled': return 'warning';
      case 'inactive': case 'retired': case 'off-duty': case 'rejected': case 'stopped': case 'maintenance': case 'suspended': return 'destructive';
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
      route: editingId ? 'Edit Route' : 'Add Route',
      vehicle: editingId ? 'Edit Vehicle' : 'Add Vehicle',
      maintenance: 'Log Maintenance',
      driver: editingId ? 'Edit Driver' : 'Add Driver',
      geofence: 'Create Geofence',
      delay: 'Report Delay',
      ridership: 'Log Ridership',
    };
    return (
      <Modal isOpen={!!modalType} onClose={closeModal} title={titles[modalType]} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modalType === 'route' && (
            <>
              <div className="md:col-span-2"><Input placeholder="Route Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <Input placeholder="Code" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} />
              <Input placeholder="Distance (km)" type="number" value={form.distance || ''} onChange={e => setForm({ ...form, distance: parseFloat(e.target.value) || 0 })} />
              <Input placeholder="Start Point" value={form.startPoint || ''} onChange={e => setForm({ ...form, startPoint: e.target.value })} />
              <Input placeholder="End Point" value={form.endPoint || ''} onChange={e => setForm({ ...form, endPoint: e.target.value })} />
              <div className="md:col-span-2"><Textarea placeholder="Stops (one per line)" value={Array.isArray(form.stops) ? form.stops.join('\n') : (form.stops || '')} onChange={e => setForm({ ...form, stops: e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean) })} /></div>
            </>
          )}
          {modalType === 'vehicle' && (
            <>
              <Input placeholder="Registration Number" value={form.registration || ''} onChange={e => setForm({ ...form, registration: e.target.value })} />
              <Input placeholder="Model" value={form.model || ''} onChange={e => setForm({ ...form, model: e.target.value })} />
              <Input placeholder="Capacity" type="number" value={form.capacity || ''} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Year" type="number" value={form.year || ''} onChange={e => setForm({ ...form, year: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Fuel Type" value={form.fuelType || ''} onChange={e => setForm({ ...form, fuelType: e.target.value })} />
            </>
          )}
          {modalType === 'maintenance' && (
            <>
              <Input placeholder="Vehicle Registration" value={form.vehicleReg || ''} onChange={e => setForm({ ...form, vehicleReg: e.target.value })} />
              <Input placeholder="Type (service/repair/inspection)" value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} />
              <div className="md:col-span-2"><Textarea placeholder="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <Input placeholder="Cost" type="number" value={form.cost || ''} onChange={e => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })} />
              <Input placeholder="Technician" value={form.technician || ''} onChange={e => setForm({ ...form, technician: e.target.value })} />
            </>
          )}
          {modalType === 'driver' && (
            <>
              <Input placeholder="Full Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="License Number" value={form.license || ''} onChange={e => setForm({ ...form, license: e.target.value })} />
              <Input placeholder="Phone" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Assigned Vehicle Reg" value={form.assignedVehicle || ''} onChange={e => setForm({ ...form, assignedVehicle: e.target.value })} />
            </>
          )}
          {modalType === 'geofence' && (
            <>
              <Input placeholder="Zone Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Type (school/stop/depot)" value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} />
              <Input placeholder="Latitude" type="number" value={form.latitude || ''} onChange={e => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })} />
              <Input placeholder="Longitude" type="number" value={form.longitude || ''} onChange={e => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })} />
              <Input placeholder="Radius (meters)" type="number" value={form.radius || ''} onChange={e => setForm({ ...form, radius: parseInt(e.target.value) || 0 })} />
            </>
          )}
          {modalType === 'delay' && (
            <>
              <Input placeholder="Route Name" value={form.routeName || ''} onChange={e => setForm({ ...form, routeName: e.target.value })} />
              <Input placeholder="Vehicle ID" value={form.vehicleId || ''} onChange={e => setForm({ ...form, vehicleId: e.target.value })} />
              <div className="md:col-span-2"><Textarea placeholder="Reason" value={form.reason || ''} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
              <Input placeholder="Duration (minutes)" type="number" value={form.duration || ''} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} />
            </>
          )}
          {modalType === 'ridership' && (
            <>
              <Input placeholder="Route Name" value={form.routeName || ''} onChange={e => setForm({ ...form, routeName: e.target.value })} />
              <Input placeholder="Vehicle ID" value={form.vehicleId || ''} onChange={e => setForm({ ...form, vehicleId: e.target.value })} />
              <Input placeholder="Boardings" type="number" value={form.boardings || ''} onChange={e => setForm({ ...form, boardings: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Alightings" type="number" value={form.alightings || ''} onChange={e => setForm({ ...form, alightings: parseInt(e.target.value) || 0 })} />
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
        <h1 className="text-2xl font-bold">Transport Management</h1>
        <p className="text-muted-foreground">Routes, fleet, drivers, tracking & more</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="routes"><Route className="w-4 h-4 mr-1" />Routes</TabsTrigger>
          <TabsTrigger value="vehicles"><Bus className="w-4 h-4 mr-1" />Vehicles</TabsTrigger>
          <TabsTrigger value="maintenance"><Wrench className="w-4 h-4 mr-1" />Maintenance</TabsTrigger>
          <TabsTrigger value="drivers"><Users className="w-4 h-4 mr-1" />Drivers</TabsTrigger>
          <TabsTrigger value="tracking"><MapPin className="w-4 h-4 mr-1" />Tracking</TabsTrigger>
          <TabsTrigger value="ridership"><Activity className="w-4 h-4 mr-1" />Ridership</TabsTrigger>
          <TabsTrigger value="geofences"><MapPin className="w-4 h-4 mr-1" />Geofences</TabsTrigger>
          <TabsTrigger value="delays"><Clock className="w-4 h-4 mr-1" />Delays</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search routes..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button onClick={() => openModal('route')}><Plus className="w-4 h-4 mr-2" />Add Route</Button>
          </div>
          <div className="space-y-3">
            {filteredRoutes.length === 0 && <p className="text-muted-foreground">No routes found.</p>}
            {filteredRoutes.map(r => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Route className="w-5 h-5 text-orange-500" />
                      <h4 className="font-semibold">{r.name}</h4>
                      <Badge variant={statusVariant(r.status) as any}>{r.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.code} &bull; {r.distance}km</p>
                    <p className="text-sm mt-1"><MapPin className="w-3 h-3 inline mr-1" />{r.startPoint} &rarr; {r.endPoint}</p>
                    {r.stops && r.stops.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{r.stops.length} stops: {r.stops.join(', ')}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openModal('route', r)}><Edit2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button onClick={() => openModal('vehicle')}><Plus className="w-4 h-4 mr-2" />Add Vehicle</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
            {filteredVehicles.length === 0 && <p className="text-muted-foreground col-span-full">No vehicles found.</p>}
            {filteredVehicles.map(v => (
              <Card key={v.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bus className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{v.registration}</h4>
                      <p className="text-xs text-muted-foreground">{v.model} ({v.year})</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant(v.status) as any}>{v.status}</Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><Users className="w-3 h-3 inline mr-1 text-muted-foreground" />Capacity: {v.capacity}</p>
                  <p><Fuel className="w-3 h-3 inline mr-1 text-muted-foreground" />{v.fuelType}</p>
                  {v.lastService && <p className="text-xs text-muted-foreground">Last service: {new Date(v.lastService).toLocaleDateString()}</p>}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openModal('vehicle', v)}><Edit2 className="w-3 h-3 mr-1" />Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => openModal('maintenance', { vehicleReg: v.registration })}><Wrench className="w-3 h-3 mr-1" />Service</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal('maintenance')}><Plus className="w-4 h-4 mr-2" />Log Maintenance</Button>
          </div>
          <div className="space-y-3">
            {maintenance.length === 0 && <p className="text-muted-foreground">No maintenance records.</p>}
            {maintenance.map(m => (
              <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench className="w-4 h-4 text-orange-500" />
                      <h4 className="font-semibold">{m.type}</h4>
                      <Badge variant={statusVariant(m.status) as any}>{m.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Vehicle: {m.vehicleReg}</p>
                    <p className="text-sm mt-1">{m.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      <span>{new Date(m.date).toLocaleDateString()}</span>
                      <span>Cost: ${m.cost}</span>
                      <span>Tech: {m.technician}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button onClick={() => openModal('driver')}><Plus className="w-4 h-4 mr-2" />Add Driver</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrivers.length === 0 && <p className="text-muted-foreground col-span-full">No drivers found.</p>}
            {filteredDrivers.map(d => (
              <Card key={d.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{d.name}</h4>
                      <p className="text-xs text-muted-foreground">License: {d.license}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant(d.status) as any}>{d.status}</Badge>
                </div>
                <div className="text-sm space-y-1 ml-12">
                  <p className="text-muted-foreground">{d.phone} &bull; {d.email}</p>
                  {d.assignedVehicle && <p>Vehicle: {d.assignedVehicle}</p>}
                  <p className="text-xs text-muted-foreground">Joined: {new Date(d.joinDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 ml-12 mt-2">
                  <Button size="sm" variant="outline" onClick={() => openModal('driver', d)}><Edit2 className="w-3 h-3 mr-1" />Edit</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
            {tracking.length === 0 && (
              <Card className="p-8 col-span-full text-center">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No tracking data available.</p>
                <p className="text-xs text-muted-foreground">Vehicle positions will appear here when tracking is active.</p>
              </Card>
            )}
            {tracking.map(t => (
              <Card key={t.vehicleId} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-orange-500" />
                    <h4 className="font-semibold">{t.vehicleReg}</h4>
                  </div>
                  <Badge variant={statusVariant(t.status) as any}>{t.status}</Badge>
                </div>
                <p className="text-sm">Speed: {t.speed} km/h</p>
                <p className="text-xs text-muted-foreground">Last updated: {new Date(t.lastUpdated).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Lat: {t.latitude}, Lng: {t.longitude}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ridership" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal('ridership')}><Plus className="w-4 h-4 mr-2" />Log Ridership</Button>
          </div>
          <div className="space-y-3">
            {ridership.length === 0 && <p className="text-muted-foreground">No ridership data recorded.</p>}
            {ridership.map(r => (
              <Card key={r.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-orange-500" />
                      <h4 className="font-semibold">{r.routeName}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Vehicle: {r.vehicleId} &bull; {new Date(r.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{r.boardings} <span className="text-sm font-normal text-muted-foreground">boarded</span></p>
                    <p className="font-semibold">{r.alightings} <span className="text-sm font-normal text-muted-foreground">alighted</span></p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="geofences" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal('geofence')}><Plus className="w-4 h-4 mr-2" />Create Geofence</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
            {geofences.length === 0 && <p className="text-muted-foreground col-span-full">No geofences defined.</p>}
            {geofences.map(g => (
              <Card key={g.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{g.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{g.type}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant(g.status) as any}>{g.status}</Badge>
                </div>
                <p className="text-sm">Radius: {g.radius}m</p>
                <p className="text-xs text-muted-foreground">Lat: {g.latitude}, Lng: {g.longitude}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="delays" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal('delay')}><Plus className="w-4 h-4 mr-2" />Report Delay</Button>
          </div>
          <div className="space-y-3">
            {delays.length === 0 && <p className="text-muted-foreground">No delays reported.</p>}
            {delays.map(d => (
              <Card key={d.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-red-500" />
                      <h4 className="font-semibold">{d.routeName}</h4>
                      <Badge variant={statusVariant(d.status) as any}>{d.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{d.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Duration: {d.duration}min &bull; Vehicle: {d.vehicleId} &bull; {new Date(d.reportedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Route Change Requests</h3>
            <div className="space-y-2">
              {routeChanges.length === 0 && <p className="text-muted-foreground">No change requests.</p>}
              {routeChanges.map(rc => (
                <Card key={rc.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Route className="w-4 h-4 text-orange-500" />
                        <h4 className="font-semibold">{rc.routeName}</h4>
                        <Badge variant={statusVariant(rc.status) as any}>{rc.status}</Badge>
                      </div>
                      <p className="text-sm">{rc.description}</p>
                      <p className="text-xs text-muted-foreground">Reason: {rc.reason} &bull; By: {rc.requestedBy} &bull; {new Date(rc.requestedAt).toLocaleDateString()}</p>
                    </div>
                    {rc.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRouteChangeAction(rc.id, 'approve')}>
                          <CheckCircle className="w-3 h-3 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRouteChangeAction(rc.id, 'reject')}>
                          <XCircle className="w-3 h-3 mr-1" />Reject
                        </Button>
                      </div>
                    )}
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

