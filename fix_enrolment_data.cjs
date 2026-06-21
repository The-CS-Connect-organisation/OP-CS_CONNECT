const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminEnrolment.tsx', 'utf8');

content = content.replace(
  /const \[apps, setApps\] = useState<EnrolmentApplication\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [apps, setApps] = useState<EnrolmentApplication[]>([\n  { id: 'app1', studentName: 'Karan Mehra', studentId: 'u123', grade: '11-Science', status: 'under-review', submittedDate: '2026-06-01', documents: ['Transcripts', 'ID'], notes: 'Missing recommendation letter' }\n]);"
);

content = content.replace(
  /const \[offers, setOffers\] = useState<AdmissionOffer\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [offers, setOffers] = useState<AdmissionOffer[]>([\n  { id: 'off1', studentName: 'Sanya Gupta', studentId: 'u124', program: 'Regular', tuitionFee: 50000, status: 'accepted', offerDate: '2026-06-15', responseDeadline: '2026-06-30' }\n]);"
);

content = content.replace(
  /const \[waitlist, setWaitlist\] = useState<WaitlistEntry\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([\n  { id: 'wl1', studentName: 'Arjun Reddy', studentId: 'u125', priority: 1, status: 'active', addedDate: '2026-05-20', notes: 'Sibling already enrolled' }\n]);"
);

content = content.replace(
  /const \[capacities, setCapacities\] = useState<SchoolCapacity\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [capacities, setCapacities] = useState<SchoolCapacity[]>([\n  { id: 'cap1', grade: '10-A', capacity: 40, enrolled: 38, available: 2 }\n]);"
);

content = content.replace(
  /const \[withdrawals, setWithdrawals\] = useState<Withdrawal\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([\n  { id: 'wd1', studentName: 'Neha Sharma', studentId: 'u126', reason: 'Relocation', date: '2026-06-10', status: 'pending', processedDate: '' }\n]);"
);

content = content.replace(
  /const \[tours, setTours\] = useState<SchoolTour\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [tours, setTours] = useState<SchoolTour[]>([\n  { id: 't1', studentName: 'Verma Family', studentId: 'N/A', date: '2026-06-25', time: '10:00 AM', status: 'scheduled', notes: 'Interested in sports facilities' }\n]);"
);

content = content.replace(
  /const \[scholarships, setScholarships\] = useState<Scholarship\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [scholarships, setScholarships] = useState<Scholarship[]>([\n  { id: 'sch1', name: 'Academic Excellence', amount: 20000, criteria: 'Above 95% overall', deadline: '2026-08-01', available: 5, awarded: 2 }\n]);"
);

fs.writeFileSync('src/pages/admin/AdminEnrolment.tsx', content);
