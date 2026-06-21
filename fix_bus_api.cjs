const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  `createBusAssignment: (data: any) => apiFetch('/bus/assignments', { method: 'POST', body: JSON.stringify(data) }),`,
  `createBusAssignment: (data: any) => apiFetch('/bus/assignments', { method: 'POST', body: JSON.stringify(data) }),\n  updateBusAssignment: (id: string, data: any) => apiFetch(\`/bus/assignments/\${id}\`, { method: 'PUT', body: JSON.stringify(data) }),`
);

fs.writeFileSync('src/lib/api.ts', code);
