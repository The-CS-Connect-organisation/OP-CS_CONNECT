const fs = require('fs');
let content = fs.readFileSync('src/lib/nav-config.ts', 'utf8');

// Add Homework under Academics / Academic / Teaching
content = content.replace(/label: 'Academics',\s*items: \[/, "label: 'Academics',\n      items: [\n        { icon: BookOpen, label: 'Homework', path: '/student/homework' },");
content = content.replace(/label: 'Teaching',\s*items: \[/, "label: 'Teaching',\n      items: [\n        { icon: BookOpen, label: 'Homework', path: '/teacher/homework' },");
content = content.replace(/label: 'Academic',\s*items: \[/, "label: 'Academic',\n      items: [\n        { icon: BookOpen, label: 'Homework', path: '/admin/homework' },");

fs.writeFileSync('src/lib/nav-config.ts', content);
