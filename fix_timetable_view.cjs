const fs = require('fs');
let code = fs.readFileSync('src/components/timetable/TimetableView.tsx', 'utf8');

// Replace standard destructuring of timeSlots to dynamically compute from entries if available
const patch = `  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const hasEntries = entries.length > 0;

  // Extract unique times from entries to support arbitrary seed data format, fallback to default
  const actualTimeSlots = hasEntries 
    ? Array.from(new Set(entries.map(e => e.time))).sort() 
    : timeSlots;`;

code = code.replace(
  `  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);\n  const hasEntries = entries.length > 0;`,
  patch
);

code = code.replace(
  `timeSlots={timeSlots}`,
  `timeSlots={actualTimeSlots}`
);

// Do it for KanbanView too
code = code.replace(
  `timeSlots={timeSlots}`,
  `timeSlots={actualTimeSlots}`
);

fs.writeFileSync('src/components/timetable/TimetableView.tsx', code);
