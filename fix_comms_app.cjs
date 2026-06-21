const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `<Route path="messages" element={<StudentMessages />} />`,
  `<Route path="comms-hub" element={<CommunicationHub />} />`
);

code = code.replace(
  `const StudentMessages = lazy(() => import('./pages/student/Messages'))\n`,
  ``
);

fs.writeFileSync('src/App.tsx', code);
