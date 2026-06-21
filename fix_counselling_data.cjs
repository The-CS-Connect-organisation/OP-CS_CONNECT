const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminCounselling.tsx', 'utf8');

content = content.replace(
  /const \[carePlans, setCarePlans\] = useState<CarePlan\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [carePlans, setCarePlans] = useState<CarePlan[]>([\n  { id: 'cp1', studentName: 'Sneha Gupta', goals: 'Improve attendance', interventions: 'Weekly check-ins', reviewDate: '2026-07-01', status: 'active' }\n]);"
);

content = content.replace(
  /const \[grievances, setGrievances\] = useState<Grievance\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [grievances, setGrievances] = useState<Grievance[]>([\n  { id: 'g1', studentName: 'Anonymous', subject: 'Bullying Incident', description: 'Incident in the cafeteria', status: 'investigating', date: '2026-06-10' }\n]);"
);

fs.writeFileSync('src/pages/admin/AdminCounselling.tsx', content);
