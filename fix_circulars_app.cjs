const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `const Circulars = lazy(() => import('./pages/shared/Circulars'))\n`,
  ``
);

code = code.replace(
  `<Route path="circulars" element={<Circulars />} />\n`,
  ``
);
code = code.replace(
  `<Route path="circulars" element={<Circulars />} />\n`,
  ``
);
fs.writeFileSync('src/App.tsx', code);
