const fs = require('fs');

// 1. AdminActivities.tsx
let act = fs.readFileSync('src/pages/admin/AdminActivities.tsx', 'utf8');
act = act.replace(
  "const [trips, setTrips] = useState<FieldTrip[]>([\n  { id: 'ft1', title: 'Science Museum Visit', destination: 'City Science Center', date: '2026-07-10', departureTime: '08:00 AM', returnTime: '03:00 PM', cost: 500, status: 'approved' }\n]);",
  "const [trips, setTrips] = useState<FieldTrip[]>([\n  { id: 'ft1', title: 'Science Museum Visit', destination: 'City Science Center', date: '2026-07-10', departureTime: '08:00 AM', returnTime: '03:00 PM', cost: 500, status: 'approved', consentCount: 45, totalStudents: 60 }\n]);"
);
fs.writeFileSync('src/pages/admin/AdminActivities.tsx', act);

// 2. AdminAnalytics.tsx
let ana = fs.readFileSync('src/pages/admin/AdminAnalytics.tsx', 'utf8');
if (!ana.includes('import { apiFetch }')) {
  ana = ana.replace("import { api } from '../../lib/api';", "import { api, apiFetch } from '../../lib/api';");
}
ana = ana.replace(/api\.apiFetch/g, "apiFetch");
ana = ana.replace(/catch\(err =>/g, "catch((err: any) =>");
fs.writeFileSync('src/pages/admin/AdminAnalytics.tsx', ana);

// 3. AdminDiscipline.tsx
let disc = fs.readFileSync('src/pages/admin/AdminDiscipline.tsx', 'utf8');
disc = disc.replace(
  "const [incidents, setIncidents] = useState<DisciplineIncident[]>([\n  { id: 'di1', studentName: 'Rohan Verma', date: '2026-06-18', type: 'Disruptive', description: 'Disrupting class repeatedly', severity: 'Medium', status: 'resolved', reportedBy: 'Mr. Smith' }\n]);",
  "const [incidents, setIncidents] = useState<DisciplineIncident[]>([\n  { id: 'di1', studentName: 'Rohan Verma', date: '2026-06-18', type: 'Disruptive', description: 'Disrupting class repeatedly', severity: 'Medium', status: 'resolved', reportedBy: 'Mr. Smith', action: 'Warning' }\n]);"
);
fs.writeFileSync('src/pages/admin/AdminDiscipline.tsx', disc);

// 4. AdminFacilities.tsx
let fac = fs.readFileSync('src/pages/admin/AdminFacilities.tsx', 'utf8');
fac = fac.replace(
  "createdAt: '2026-06-20' },\n",
  "createdAt: '2026-06-20', completedAt: undefined },\n"
);
fac = fac.replace(
  "createdAt: '2026-06-19' }\n",
  "createdAt: '2026-06-19', completedAt: undefined }\n"
);
fs.writeFileSync('src/pages/admin/AdminFacilities.tsx', fac);

// 5. AdminFees.tsx
let fees = fs.readFileSync('src/pages/admin/AdminFees.tsx', 'utf8');
// remove 'type' from dummy feeheads
fees = fees.replace(/, type: 'mandatory'/g, "");
fees = fees.replace(/, type: 'optional'/g, "");
// fix Defaulters array
fees = fees.replace(
  "id: 'def1', studentId: 'u1', studentName: 'Rahul Sharma', class: '10-A', totalDue: 15000, overdueDays: 12",
  "id: 'def1', studentId: 'u1', studentName: 'Rahul Sharma', class: '10-A', totalDue: 15000, overdueDays: 12, outstanding: 15000, months: 1, callStatus: 'pending'"
);
fees = fees.replace(
  "id: f.id,\n        studentId: f.studentId,\n        studentName: f.studentName || 'Unknown Student',\n        class: f.class || 'N/A',\n        totalDue: f.amount,\n        overdueDays: Math.floor((Date.now() - new Date(f.dueDate).getTime()) / (1000 * 3600 * 24)) || 15\n      }));",
  "id: f.id,\n        studentId: f.studentId,\n        studentName: f.studentName || 'Unknown Student',\n        class: f.class || 'N/A',\n        totalDue: f.amount,\n        overdueDays: Math.floor((Date.now() - new Date(f.dueDate).getTime()) / (1000 * 3600 * 24)) || 15,\n        outstanding: f.amount,\n        months: 1,\n        callStatus: 'pending'\n      }));"
);
fees = fees.replace(
  "const data = await res.json().catch(() => ({}));\n        setError(data?.message ?? `Error ${res.status}`);",
  "setError('Error');"
);
fs.writeFileSync('src/pages/admin/AdminFees.tsx', fees);

// 6. AdminSIS.tsx
let sis = fs.readFileSync('src/pages/admin/AdminSIS.tsx', 'utf8');
if (!sis.includes('import { apiFetch }')) {
  sis = sis.replace("import { api } from '../../lib/api';", "import { api, apiFetch } from '../../lib/api';");
}
sis = sis.replace(/api\.apiFetch/g, "apiFetch");
fs.writeFileSync('src/pages/admin/AdminSIS.tsx', sis);

