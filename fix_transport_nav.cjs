const fs = require('fs');
let code = fs.readFileSync('src/lib/nav-config.ts', 'utf8');

// Remove AdminTransport
code = code.replace(
  `        { icon: Truck, label: 'Transport', path: '/admin/transport' },\n`,
  ``
);

// Rename AdminBusAssignment label to "Transport / Buses"
code = code.replace(
  `{ icon: Bus, label: 'Bus Assignment', path: '/admin/bus-assignment' }`,
  `{ icon: Bus, label: 'Transport / Buses', path: '/admin/bus-assignment' }`
);

// Same for Manager
code = code.replace(
  `        { icon: Truck, label: 'Transport', path: '/manager/transport' },\n`,
  ``
);
code = code.replace(
  `        { icon: Truck, label: 'Transport', path: '/manager/transport' },\n`,
  ``
);
code = code.replace(
  `{ icon: Bus, label: 'Bus Assignment', path: '/manager/bus-assignment' }`,
  `{ icon: Bus, label: 'Transport / Buses', path: '/manager/bus-assignment' }`
);

fs.writeFileSync('src/lib/nav-config.ts', code);
