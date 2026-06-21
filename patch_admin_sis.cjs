const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminSIS.tsx', 'utf8');

// Replace raw fetch with apiFetch
content = content.replace(/const r = await fetch\('\/api\/v1\/classes', \{ headers: h \}\);/g, "const r = { ok: true, json: async () => await api.apiFetch('/v1/classes') };");
content = content.replace(/const r = await fetch\('\/api\/v1\/sections', \{ headers: h \}\);/g, "const r = { ok: true, json: async () => await api.apiFetch('/v1/sections') };");
content = content.replace(/const res = await fetch\(`\/api\/v1\/students\?\$\{params\}`.*?\);/g, "const data = await api.apiFetch(`/v1/students?${params}`); const res = { ok: true, json: async () => data };");
content = content.replace(/const res = await fetch\('\/api\/v1\/students', .*?\);/g, "const data = await api.apiFetch('/v1/students'); const res = { ok: true, json: async () => data };");

// Fix the sections fetch in fetchSections
content = content.replace(/fetch\(`\/api\/v1\/sections\?classId=\$\{filterClassId\}`.*?\)\s*\.then\(res => res\.json\(\)\)/g, "api.apiFetch(`/v1/sections?classId=${filterClassId}`)");
content = content.replace(/fetch\(`\/api\/v1\/sections\?classId=\$\{form\.classId\}`.*?\)\s*\.then\(res => res\.json\(\)\)/g, "api.apiFetch(`/v1/sections?classId=${form.classId}`)");

fs.writeFileSync('src/pages/admin/AdminSIS.tsx', content);
