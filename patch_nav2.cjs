const fs = require('fs');
let content = fs.readFileSync('src/lib/nav-config.ts', 'utf8');

content = content.replace(/label: 'My Children',\s*items: \[/, "label: 'My Children',\n      items: [\n        { icon: BookOpen, label: 'Homework', path: '/parent/homework' },");
fs.writeFileSync('src/lib/nav-config.ts', content);
