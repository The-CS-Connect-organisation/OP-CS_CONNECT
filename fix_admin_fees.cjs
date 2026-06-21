const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminFees.tsx', 'utf8');

// Replace the broken code block
const badCode = `
      const res = { ok: true }; await api.createPayment(payload); // 
        method: 'POST',
        headers: { Authorization: \`Bearer \${localStorage.getItem('accessToken')}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
`;

const goodCode = `
      await api.createPayment(payload);
      const res = { ok: true };
      if (res.ok) {
`;

content = content.replace(badCode.trim(), goodCode.trim());

fs.writeFileSync('src/pages/admin/AdminFees.tsx', content);
