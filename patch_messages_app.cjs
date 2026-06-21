const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const routeStr = '<Route path="messages" element={<QuickMessenger />} />\n            ';

// Student
content = content.replace(
  '<Route path="homework" element={<Homework />} />',
  routeStr + '<Route path="homework" element={<Homework />} />'
);

// Admin
content = content.replace(
  '<Route path="analytics" element={<AdminAnalytics />} />',
  routeStr + '<Route path="analytics" element={<AdminAnalytics />} />'
);

// Parent
content = content.replace(
  '<Route path="attendance" element={<ParentAttendance />} />',
  routeStr + '<Route path="attendance" element={<ParentAttendance />} />'
);

fs.writeFileSync('src/App.tsx', content);
