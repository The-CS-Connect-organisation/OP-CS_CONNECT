const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminDiscipline.tsx', 'utf8');

content = content.replace(
  /const \[incidents, setIncidents\] = useState<DisciplineIncident\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [incidents, setIncidents] = useState<DisciplineIncident[]>([\n  { id: 'di1', studentName: 'Rohan Verma', date: '2026-06-18', type: 'Disruptive', description: 'Disrupting class repeatedly', severity: 'Medium', status: 'resolved', reportedBy: 'Mr. Smith' }\n]);"
);

content = content.replace(
  /const \[bips, setBips\] = useState<BIP\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [bips, setBips] = useState<BIP[]>([\n  { id: 'bip1', studentName: 'Aman Singh', targetBehaviours: 'Interrupting, Out of seat', strategies: 'Token economy', goals: 'Stay in seat for 30 mins', startDate: '2026-04-10', reviewDate: '2026-07-10', status: 'active' }\n]);"
);

content = content.replace(
  /const \[detentions, setDetentions\] = useState<Detention\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [detentions, setDetentions] = useState<Detention[]>([\n  { id: 'det1', studentName: 'Rohan Verma', date: '2026-06-20', time: '15:30', duration: '1 hr', reason: 'Late assignments', assignedBy: 'Ms. Johnson', status: 'scheduled' }\n]);"
);

content = content.replace(
  /const \[positive, setPositive\] = useState<PositiveBehaviour\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [positive, setPositive] = useState<PositiveBehaviour[]>([\n  { id: 'pb1', studentName: 'Priya Patel', date: '2026-06-19', behaviour: 'Leadership', description: 'Helped organize the class project', recognisedBy: 'Mr. Smith', points: 5 }\n]);"
);

fs.writeFileSync('src/pages/admin/AdminDiscipline.tsx', content);
