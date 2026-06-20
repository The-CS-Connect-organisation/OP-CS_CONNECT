const fs = require('fs');
let code = fs.readFileSync('src/lib/nav-config.ts', 'utf8');

// Remove Admin Scheduling
code = code.replace(
  `        { icon: Clock, label: 'Scheduling', path: '/admin/scheduling' },\n`,
  ``
);

// Remove Manager Scheduling
code = code.replace(
  `      label: 'Scheduling & SIS',\n      items: [\n        { icon: Calendar, label: 'Scheduling', path: '/manager/scheduling' },`,
  `      label: 'SIS',\n      items: [`
);

fs.writeFileSync('src/lib/nav-config.ts', code);
