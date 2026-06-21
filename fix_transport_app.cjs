const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `const AdminTransport = lazy(() => import('./pages/admin/AdminTransport'))\n`,
  ``
);
code = code.replace(
  `const ManagerTransport = lazy(() => import('./pages/manager/ManagerTransport'))\n`,
  ``
);
code = code.replace(
  `<Route path="transport" element={<AdminTransport />} />\n`,
  ``
);
code = code.replace(
  `<Route path="transport" element={<ManagerTransport />} />\n`,
  ``
);

fs.writeFileSync('src/App.tsx', code);
