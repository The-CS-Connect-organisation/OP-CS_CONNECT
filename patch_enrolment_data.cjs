const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminEnrolment.tsx', 'utf8');

content = content.replace(
  "const [apps, setApps] = useState<EnrolmentApplication[]>([]);",
  "const [apps, setApps] = useState<EnrolmentApplication[]>([\n  { id: 'app1', applicantName: 'Karan Mehra', gradeApplied: '11-Science', applicationDate: '2026-06-01', status: 'under-review', email: 'parent@example.com', phone: '9876543210' }\n]);"
);

content = content.replace(
  "const [offers, setOffers] = useState<AdmissionOffer[]>([]);",
  "const [offers, setOffers] = useState<AdmissionOffer[]>([\n  { id: 'off1', applicantName: 'Sanya Gupta', grade: '9-A', offerDate: '2026-06-15', deadlineDate: '2026-06-30', status: 'accepted' }\n]);"
);

content = content.replace(
  "const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);",
  "const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([\n  { id: 'wl1', applicantName: 'Arjun Reddy', grade: '10-A', dateAdded: '2026-05-20', priority: 'medium', status: 'active' }\n]);"
);

content = content.replace(
  "const [capacities, setCapacities] = useState<SchoolCapacity[]>([]);",
  "const [capacities, setCapacities] = useState<SchoolCapacity[]>([\n  { id: 'cap1', grade: '10-A', currentEnrolled: 38, maxCapacity: 40, waitlistCount: 2 }\n]);"
);

content = content.replace(
  "const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);",
  "const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([\n  { id: 'wd1', studentName: 'Neha Sharma', grade: '8-B', requestDate: '2026-06-10', expectedDate: '2026-07-01', reason: 'Relocation', status: 'pending' }\n]);"
);

content = content.replace(
  "const [tours, setTours] = useState<SchoolTour[]>([]);",
  "const [tours, setTours] = useState<SchoolTour[]>([\n  { id: 't1', date: '2026-06-25', time: '10:00 AM', familyName: 'Verma Family', attendees: 3, guideName: 'Mr. Smith', status: 'scheduled' }\n]);"
);

content = content.replace(
  "const [scholarships, setScholarships] = useState<Scholarship[]>([]);",
  "const [scholarships, setScholarships] = useState<Scholarship[]>([\n  { id: 'sch1', studentName: 'Priya Patel', type: 'Academic Excellence', amount: 20000, awardDate: '2026-04-01', status: 'active' }\n]);"
);

fs.writeFileSync('src/pages/admin/AdminEnrolment.tsx', content);
