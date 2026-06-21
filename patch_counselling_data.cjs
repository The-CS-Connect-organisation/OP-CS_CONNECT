const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminCounselling.tsx', 'utf8');

content = content.replace(
  "const [sessions, setSessions] = useState<CounsellingSession[]>([]);",
  "const [sessions, setSessions] = useState<CounsellingSession[]>([\n  { id: 's1', studentName: 'Rahul Sharma', counsellor: 'Dr. Emily', date: '2026-06-18', type: 'academic', notes: 'Discussed study plan for exams', status: 'completed' },\n  { id: 's2', studentName: 'Priya Patel', counsellor: 'Mr. David', date: '2026-06-22', type: 'behavioral', notes: 'Initial intake session', status: 'scheduled' }\n]);"
);

content = content.replace(
  "const [referrals, setReferrals] = useState<Referral[]>([]);",
  "const [referrals, setReferrals] = useState<Referral[]>([\n  { id: 'r1', studentName: 'Aarav Kumar', referredBy: 'Ms. Johnson', date: '2026-06-15', reason: 'Declining academic performance', status: 'pending', priority: 'high' }\n]);"
);

content = content.replace(
  "const [carePlans, setCarePlans] = useState<CarePlan[]>([]);",
  "const [carePlans, setCarePlans] = useState<CarePlan[]>([\n  { id: 'cp1', studentName: 'Sneha Gupta', createdBy: 'Dr. Emily', startDate: '2026-05-01', reviewDate: '2026-07-01', goals: ['Improve attendance', 'Weekly check-ins'], status: 'active' }\n]);"
);

content = content.replace(
  "const [grievances, setGrievances] = useState<Grievance[]>([]);",
  "const [grievances, setGrievances] = useState<Grievance[]>([\n  { id: 'g1', submittedBy: 'Anonymous', category: 'bullying', date: '2026-06-10', description: 'Incident in the cafeteria', status: 'investigating' }\n]);"
);

fs.writeFileSync('src/pages/admin/AdminCounselling.tsx', content);
