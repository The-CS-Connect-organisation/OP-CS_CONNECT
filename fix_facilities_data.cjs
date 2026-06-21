const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminFacilities.tsx', 'utf8');

content = content.replace(
  /const \[workOrders, setWorkOrders\] = useState<WorkOrder\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [workOrders, setWorkOrders] = useState<WorkOrder[]>([\n  { id: 'wo1', title: 'AC Repair', description: 'AC not cooling in Room 101', priority: 'high', status: 'open', assignedTo: 'Maintenance Team', location: 'Room 101', createdAt: '2026-06-20' },\n  { id: 'wo2', title: 'Broken Window', description: 'Window latch broken', priority: 'medium', status: 'in-progress', assignedTo: 'John Doe', location: 'Room 102', createdAt: '2026-06-19' }\n]);"
);

content = content.replace(
  /const \[inspections, setInspections\] = useState<Inspection\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [inspections, setInspections] = useState<Inspection[]>([\n  { id: 'i1', title: 'Fire Safety Check', area: 'Main Block', conductedBy: 'John Doe', date: '2026-06-15', findings: 'All extinguishers up to date.', rating: 'pass', nextDue: '2026-12-15' },\n  { id: 'i2', title: 'HVAC Inspection', area: 'Science Wing', conductedBy: 'Jane Smith', date: '2026-06-18', findings: 'Filter replacement needed.', rating: 'conditional', nextDue: '2026-09-18' }\n]);"
);

content = content.replace(
  /const \[energyReadings, setEnergyReadings\] = useState<EnergyLog\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [energyReadings, setEnergyReadings] = useState<EnergyReading[]>([\n  { id: 'e1', meterId: 'm1', location: 'Main Block', reading: 450, unit: 'kWh', recordedAt: '2026-06-01', type: 'electricity' },\n  { id: 'e2', meterId: 'm2', location: 'Science Wing', reading: 1200, unit: 'Liters', recordedAt: '2026-06-01', type: 'water' }\n]);"
);

content = content.replace(
  /const \[supplies, setSupplies\] = useState<SupplyItem\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [supplies, setSupplies] = useState<SupplyItem[]>([\n  { id: 's1', name: 'Whiteboard Markers', category: 'stationery', quantity: 50, minThreshold: 20, unit: 'boxes', lastRestocked: '2026-05-10' },\n  { id: 's2', name: 'Hand Sanitizer', category: 'cleaning', quantity: 15, minThreshold: 30, unit: 'bottles', lastRestocked: '2026-04-20' }\n]);"
);

content = content.replace(
  /const \[cleaningSchedules, setCleaningSchedules\] = useState<CleaningSchedule\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [cleaningSchedules, setCleaningSchedules] = useState<CleaningSchedule[]>([\n  { id: 'c1', area: 'Main Block - Ground Floor', assignedTo: 'Cleaning Staff A', frequency: 'daily', lastCleaned: '2026-06-20', nextDue: '2026-06-21', status: 'completed' },\n  { id: 'c2', area: 'Science Lab', assignedTo: 'Cleaning Staff B', frequency: 'weekly', lastCleaned: '2026-06-15', nextDue: '2026-06-22', status: 'pending' }\n]);"
);

fs.writeFileSync('src/pages/admin/AdminFacilities.tsx', content);
