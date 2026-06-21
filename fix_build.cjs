const fs = require('fs');

// 1. Fix nav-config.ts
let nav = fs.readFileSync('src/lib/nav-config.ts', 'utf8');
nav = nav.replace(/\{\s*\]\n\};\n\nexport const roleGradients/s, "  ]\n};\n\nexport const roleGradients");
// Also make sure it's valid:
// {
//      label: 'Library',
//      items: [
//        { icon: BookCopy, label: 'Library Management', path: '/manager/library' },
//      ]
//    },
//  ]
// };
nav = nav.replace(/,\n    {\n  \]\n\};\n/s, "\n  ]\n};\n");
nav = nav.replace(/,\n    {\n}\n\nexport const roleGradients/s, "\n  ]\n};\n\nexport const roleGradients");
fs.writeFileSync('src/lib/nav-config.ts', nav);

// 2. Fix AdminFees.tsx
let fees = fs.readFileSync('src/pages/admin/AdminFees.tsx', 'utf8');

const badFees = `
      const res = { ok: true }; await api.createPayment(payload); // 
        method: 'POST',
        headers: { Authorization: \`Bearer \${localStorage.getItem('accessToken')}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
`;

if (fees.includes(badFees)) {
  fees = fees.replace(badFees, "      await api.createPayment(payload);\n      const res = { ok: true };\n      if (res.ok) {\n");
} else {
  // Try regex
  fees = fees.replace(/const res = \{ ok: true \}; await api\.createPayment\(payload\); \/\/ [\s\S]*?\}\);/s, "await api.createPayment(payload);\n      const res = { ok: true };");
}

fs.writeFileSync('src/pages/admin/AdminFees.tsx', fees);
