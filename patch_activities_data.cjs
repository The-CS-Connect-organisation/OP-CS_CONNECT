const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminActivities.tsx', 'utf8');

content = content.replace(
  "const [clubs, setClubs] = useState<Club[]>([]);",
  "const [clubs, setClubs] = useState<Club[]>([\n  { id: 'c1', name: 'Robotics Club', category: 'technology', advisor: 'Mr. David', president: 'Rahul Sharma', memberCount: 45, status: 'active', meetingDay: 'Friday' }\n]);"
);

content = content.replace(
  "const [activities, setActivities] = useState<ClubActivity[]>([]);",
  "const [activities, setActivities] = useState<ClubActivity[]>([\n  { id: 'ca1', clubId: 'c1', name: 'Hackathon Prep', date: '2026-06-25', time: '15:00', location: 'Computer Lab 1', status: 'upcoming' }\n]);"
);

content = content.replace(
  "const [trips, setTrips] = useState<FieldTrip[]>([]);",
  "const [trips, setTrips] = useState<FieldTrip[]>([\n  { id: 'ft1', name: 'Science Museum Visit', destination: 'City Science Center', date: '2026-07-10', grades: ['8', '9'], organizer: 'Ms. Johnson', status: 'approved', cost: 500, capacity: 60, enrolled: 45 }\n]);"
);

content = content.replace(
  "const [elections, setElections] = useState<Election[]>([]);",
  "const [elections, setElections] = useState<Election[]>([\n  { id: 'el1', title: 'Student Council President', year: '2026', status: 'active', startDate: '2026-06-20', endDate: '2026-06-27' }\n]);"
);

content = content.replace(
  "const [results, setResults] = useState<Candidate[]>([]);",
  "const [results, setResults] = useState<Candidate[]>([\n  { id: 'cd1', electionId: 'el1', studentName: 'Aman Singh', position: 'President', votes: 120, status: 'active' },\n  { id: 'cd2', electionId: 'el1', studentName: 'Neha Sharma', position: 'President', votes: 95, status: 'active' }\n]);"
);

content = content.replace(
  "const [hours, setHours] = useState<ServiceHour[]>([]);",
  "const [hours, setHours] = useState<ServiceHour[]>([\n  { id: 'sh1', studentName: 'Priya Patel', activityName: 'Campus Cleanup', hours: 5, date: '2026-06-05', supervisor: 'Mr. Smith', status: 'approved' }\n]);"
);

fs.writeFileSync('src/pages/admin/AdminActivities.tsx', content);
