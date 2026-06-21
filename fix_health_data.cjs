const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminHealth.tsx', 'utf8');

content = content.replace(
  /const \[records, setRecords\] = useState<HealthRecord\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [records, setRecords] = useState<HealthRecord[]>([\n  { id: 'hr1', studentName: 'Rahul Sharma', condition: 'Asthma', medication: 'Inhaler as needed', allergies: 'Peanuts', bloodType: 'O+', notes: 'Keep inhaler in backpack' }\n]);"
);

content = content.replace(
  /const \[immunisations, setImmunisations\] = useState<Immunisation\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [immunisations, setImmunisations] = useState<Immunisation[]>([\n  { id: 'im1', studentName: 'Priya Patel', vaccine: 'COVID-19', dateGiven: '2025-10-15', dose: 'Booster', nextDue: '2026-10-15', administeredBy: 'Dr. Smith' }\n]);"
);

content = content.replace(
  /const \[ieps, setIeps\] = useState<IEP\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [ieps, setIeps] = useState<IEP[]>([\n  { id: 'iep1', studentName: 'Aarav Kumar', disability: 'Dyslexia', accommodations: 'Extra time on tests', goals: 'Improve reading fluency', reviewDate: '2026-08-01', status: 'active' }\n]);"
);

content = content.replace(
  /const \[screenings, setScreenings\] = useState<Screening\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [screenings, setScreenings] = useState<Screening[]>([\n  { id: 'sc1', studentName: 'Rahul Sharma', type: 'Vision', date: '2026-05-10', result: 'Pass - 20/20', notes: 'No issues detected' }\n]);"
);

content = content.replace(
  /const \[visits, setVisits\] = useState<NurseVisit\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [visits, setVisits] = useState<NurseVisit[]>([\n  { id: 'nv1', studentName: 'Sneha Gupta', date: '2026-06-20', time: '10:30 AM', reason: 'Headache', treatment: 'Rest & Paracetamol', nurse: 'Nurse Jane', status: 'resolved' }\n]);"
);

fs.writeFileSync('src/pages/admin/AdminHealth.tsx', content);
