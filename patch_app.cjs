const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const importStr = "const Homework = lazy(() => import('./pages/shared/Homework'))\n";
content = content.replace("const StudentDashboard", importStr + "const StudentDashboard");

const studentRoute = '<Route path="homework" element={<Homework />} />\n            <Route path="assignments"';
content = content.replace('<Route path="assignments"', studentRoute);

const teacherRoute = '<Route path="homework" element={<Homework />} />\n            <Route path="assignments"';
content = content.replace('<Route path="assignments"', teacherRoute);

const adminRoute = '<Route path="homework" element={<Homework />} />\n            <Route path="analytics"';
content = content.replace('<Route path="analytics"', adminRoute);

const parentRoute = '<Route path="homework" element={<Homework />} />\n            <Route path="attendance"';
content = content.replace('<Route path="attendance"', parentRoute);

fs.writeFileSync('src/App.tsx', content);
