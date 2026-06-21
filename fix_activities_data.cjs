const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminActivities.tsx', 'utf8');

content = content.replace(
  /const \[clubs, setClubs\] = useState<Club\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [clubs, setClubs] = useState<Club[]>([\n  { id: 'c1', name: 'Robotics Club', description: 'Build and program robots', category: 'technology', advisor: 'Mr. David', meetingSchedule: 'Friday 3 PM', memberCount: 45 }\n]);"
);

content = content.replace(
  /const \[activities, setActivities\] = useState<ClubActivity\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [activities, setActivities] = useState<ClubActivity[]>([\n  { id: 'ca1', clubId: 'c1', clubName: 'Robotics Club', title: 'Hackathon Prep', description: 'Preparing for national hackathon', date: '2026-06-25', location: 'Computer Lab 1' }\n]);"
);

content = content.replace(
  /const \[trips, setTrips\] = useState<FieldTrip\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [trips, setTrips] = useState<FieldTrip[]>([\n  { id: 'ft1', title: 'Science Museum Visit', destination: 'City Science Center', date: '2026-07-10', departureTime: '08:00 AM', returnTime: '03:00 PM', cost: 500, status: 'approved' }\n]);"
);

content = content.replace(
  /const \[elections, setElections\] = useState<Election\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [elections, setElections] = useState<Election[]>([\n  { id: 'el1', title: 'Student Council President 2026', position: 'President', status: 'active', startDate: '2026-06-20', endDate: '2026-06-27', candidates: [{ id: 'cd1', name: 'Aman Singh', manifesto: 'Better school lunches', votes: 120 }, { id: 'cd2', name: 'Neha Sharma', manifesto: 'More sports events', votes: 95 }], totalVotes: 215 }\n]);"
);

content = content.replace(
  /const \[results, setResults\] = useState<Candidate\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [results, setResults] = useState<Candidate[]>([\n  { id: 'cd1', name: 'Aman Singh', manifesto: 'Better school lunches', votes: 120 },\n  { id: 'cd2', name: 'Neha Sharma', manifesto: 'More sports events', votes: 95 }\n]);"
);

content = content.replace(
  /const \[hours, setHours\] = useState<ServiceHour\[\]>\(\[\n[\s\S]*?\]\);/,
  "const [hours, setHours] = useState<ServiceHour[]>([\n  { id: 'sh1', studentName: 'Priya Patel', organization: 'City Cleanup Crew', hours: 5, date: '2026-06-05', description: 'Park cleanup', verified: true }\n]);"
);

fs.writeFileSync('src/pages/admin/AdminActivities.tsx', content);
