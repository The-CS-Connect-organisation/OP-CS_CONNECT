const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminDiscipline.tsx', 'utf8');

content = content.replace(
  "const [incidents, setIncidents] = useState<DisciplineIncident[]>([]);",
  "const [incidents, setIncidents] = useState<DisciplineIncident[]>([\n  { id: 'di1', studentName: 'Rohan Verma', date: '2026-06-18', category: 'disruptive', description: 'Disrupting class repeatedly', reportedBy: 'Mr. Smith', actionTaken: 'Warning issued', status: 'resolved' }\n]);"
);

content = content.replace(
  "const [bips, setBips] = useState<BIP[]>([]);",
  "const [bips, setBips] = useState<BIP[]>([\n  { id: 'bip1', studentName: 'Aman Singh', createdDate: '2026-04-10', targetBehaviors: ['Interrupting', 'Out of seat'], interventions: ['Token economy'], status: 'active', reviewDate: '2026-07-10' }\n]);"
);

content = content.replace(
  "const [detentions, setDetentions] = useState<Detention[]>([]);",
  "const [detentions, setDetentions] = useState<Detention[]>([\n  { id: 'det1', studentName: 'Rohan Verma', date: '2026-06-20', time: '15:30', reason: 'Late assignments', supervisor: 'Ms. Johnson', status: 'scheduled' }\n]);"
);

content = content.replace(
  "const [positive, setPositive] = useState<PositiveBehaviour[]>([]);",
  "const [positive, setPositive] = useState<PositiveBehaviour[]>([\n  { id: 'pb1', studentName: 'Priya Patel', date: '2026-06-19', category: 'leadership', description: 'Helped organize the class project', awardedBy: 'Mr. Smith', points: 5 }\n]);"
);

fs.writeFileSync('src/pages/admin/AdminDiscipline.tsx', content);
