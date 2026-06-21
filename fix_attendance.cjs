const fs = require('fs');
let code = fs.readFileSync('src/pages/teacher/MarkAttendance.tsx', 'utf8');

code = code.replace(
  `const data = Array.isArray(res.data) ? res.data : [];`,
  `const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];`
);

fs.writeFileSync('src/pages/teacher/MarkAttendance.tsx', code);
