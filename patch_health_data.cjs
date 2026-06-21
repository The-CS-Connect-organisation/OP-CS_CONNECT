const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminHealth.tsx', 'utf8');

content = content.replace(
  "const [records, setRecords] = useState<HealthRecord[]>([]);",
  "const [records, setRecords] = useState<HealthRecord[]>([\n  { id: 'hr1', studentName: 'Rahul Sharma', bloodGroup: 'O+', allergies: ['Peanuts'], medicalConditions: ['Asthma'], emergencyContact: 'Rajesh Sharma - 9876543210' }\n]);"
);

content = content.replace(
  "const [immunisations, setImmunisations] = useState<Immunisation[]>([]);",
  "const [immunisations, setImmunisations] = useState<Immunisation[]>([\n  { id: 'im1', studentName: 'Priya Patel', vaccineName: 'COVID-19', dateGiven: '2025-10-15', nextDueDate: '2026-10-15', status: 'completed' }\n]);"
);

content = content.replace(
  "const [ieps, setIeps] = useState<IEP[]>([]);",
  "const [ieps, setIeps] = useState<IEP[]>([\n  { id: 'iep1', studentName: 'Aarav Kumar', condition: 'Dyslexia', accommodations: ['Extra time on tests'], reviewDate: '2026-08-01', status: 'active' }\n]);"
);

content = content.replace(
  "const [screenings, setScreenings] = useState<Screening[]>([]);",
  "const [screenings, setScreenings] = useState<Screening[]>([\n  { id: 'sc1', date: '2026-05-10', type: 'Vision', grades: ['10-A', '10-B'], conductedBy: 'School Nurse', status: 'completed' }\n]);"
);

content = content.replace(
  "const [visits, setVisits] = useState<NurseVisit[]>([]);",
  "const [visits, setVisits] = useState<NurseVisit[]>([\n  { id: 'nv1', studentName: 'Sneha Gupta', date: '2026-06-20', time: '10:30 AM', reason: 'Headache', actionTaken: 'Rest & Medication', status: 'resolved' }\n]);"
);

fs.writeFileSync('src/pages/admin/AdminHealth.tsx', content);
