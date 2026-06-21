const fs = require('fs');

// AdminFacilities.tsx
let fac = fs.readFileSync('../OP-CS_CONNECT/src/pages/admin/AdminFacilities.tsx', 'utf8');
fac = fac.replace(/completedAt: undefined/g, "completedAt: ''");
fs.writeFileSync('../OP-CS_CONNECT/src/pages/admin/AdminFacilities.tsx', fac);

// AdminFees.tsx
let fees = fs.readFileSync('../OP-CS_CONNECT/src/pages/admin/AdminFees.tsx', 'utf8');
// Fix FeeHeads missing 'class'
fees = fees.replace(/name: 'Tuition Fee', amount: 50000, frequency: 'term' \}/g, "name: 'Tuition Fee', amount: 50000, frequency: 'term', class: 'All' }");
fees = fees.replace(/name: 'Transport', amount: 12000, frequency: 'term' \}/g, "name: 'Transport', amount: 12000, frequency: 'term', class: 'All' }");
fees = fees.replace(/name: 'Lab Fee', amount: 5000, frequency: 'annual' \}/g, "name: 'Lab Fee', amount: 5000, frequency: 'annual', class: 'All' }");

// Fix res.json()
fees = fees.replace(/const data = await res\.json\(\)\.catch\(\(\) => \(\{\}\)\);\n\s*setError\(data\?\.message \?\? \`Error \$\{res\.status\}\`\);/, "setError('Failed to process payment.');");

fs.writeFileSync('../OP-CS_CONNECT/src/pages/admin/AdminFees.tsx', fees);
