const fs = require('fs');
let code = fs.readFileSync('src/lib/nav-config.ts', 'utf8');

// Replace /student/messages with /student/comms-hub
code = code.replace(
  `{ icon: MessageSquare, label: 'Messages', path: '/student/messages' }`,
  `{ icon: Radio, label: 'Comms Hub', path: '/student/comms-hub' }`
);

// Remove Circulars everywhere
code = code.replace(
  `        { icon: FileText, label: 'Circulars', path: '/admin/circulars' },\n`,
  ``
);
code = code.replace(
  `        { icon: FileText, label: 'Circulars', path: '/manager/circulars' },\n`,
  ``
);

fs.writeFileSync('src/lib/nav-config.ts', code);
