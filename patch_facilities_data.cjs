const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminFacilities.tsx', 'utf8');

// We already patched buildings. Let's patch others.
// The states are:
// const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
// const [inspections, setInspections] = useState<Inspection[]>([]);
// const [energyReadings, setEnergyReadings] = useState<EnergyLog[]>([]);
// const [supplies, setSupplies] = useState<SupplyItem[]>([]);
// const [cleaningSchedules, setCleaningSchedules] = useState<CleaningSchedule[]>([]);

content = content.replace(
  "const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);",
  "const [workOrders, setWorkOrders] = useState<WorkOrder[]>([\n  { id: 'wo1', title: 'AC Repair', description: 'AC not cooling in Room 101', priority: 'high', status: 'pending', requestedBy: 'Mr. Smith', buildingId: 'b1', roomId: 'r1', createdAt: '2026-06-20' },\n  { id: 'wo2', title: 'Broken Window', description: 'Window latch broken', priority: 'medium', status: 'in-progress', requestedBy: 'Ms. Johnson', buildingId: 'b2', roomId: 'r2', createdAt: '2026-06-19' }\n]);"
);

content = content.replace(
  "const [inspections, setInspections] = useState<Inspection[]>([]);",
  "const [inspections, setInspections] = useState<Inspection[]>([\n  { id: 'i1', buildingId: 'b1', inspector: 'John Doe', date: '2026-06-15', status: 'passed', notes: 'All clear' },\n  { id: 'i2', buildingId: 'b2', inspector: 'Jane Smith', date: '2026-06-18', status: 'failed', notes: 'Fire extinguisher expired' }\n]);"
);

content = content.replace(
  "const [energyReadings, setEnergyReadings] = useState<EnergyLog[]>([]);",
  "const [energyReadings, setEnergyReadings] = useState<EnergyLog[]>([\n  { id: 'e1', buildingId: 'b1', date: '2026-06-01', electricityKwh: 450, waterLiters: 1200, cost: 5000 },\n  { id: 'e2', buildingId: 'b2', date: '2026-06-01', electricityKwh: 320, waterLiters: 800, cost: 3500 }\n]);"
);

content = content.replace(
  "const [supplies, setSupplies] = useState<SupplyItem[]>([]);",
  "const [supplies, setSupplies] = useState<SupplyItem[]>([\n  { id: 's1', name: 'Whiteboard Markers', category: 'stationery', quantity: 50, unit: 'boxes', reorderPoint: 20, lastRestocked: '2026-05-10' },\n  { id: 's2', name: 'Hand Sanitizer', category: 'cleaning', quantity: 15, unit: 'bottles', reorderPoint: 30, lastRestocked: '2026-04-20' }\n]);"
);

content = content.replace(
  "const [cleaningSchedules, setCleaningSchedules] = useState<CleaningSchedule[]>([]);",
  "const [cleaningSchedules, setCleaningSchedules] = useState<CleaningSchedule[]>([\n  { id: 'c1', area: 'Main Block - Ground Floor', frequency: 'daily', assignedTo: 'Cleaning Staff A', lastCompleted: '2026-06-20', nextScheduled: '2026-06-21' },\n  { id: 'c2', area: 'Science Lab', frequency: 'weekly', assignedTo: 'Cleaning Staff B', lastCompleted: '2026-06-15', nextScheduled: '2026-06-22' }\n]);"
);

fs.writeFileSync('src/pages/admin/AdminFacilities.tsx', content);
