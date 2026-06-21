const fs = require('fs');
let content = fs.readFileSync('src/lib/nav-config.ts', 'utf8');

// We will just inject it into an existing section for each role.

// Student - under Community
content = content.replace(
  "label: 'Community',\n      items: [",
  "label: 'Community',\n      items: [\n        { icon: MessageSquare, label: 'Messages', path: '/student/messages' },"
);

// Teacher - under Communication or Teaching
if (content.includes("label: 'Communication',")) {
  content = content.replace(
    "label: 'Communication',\n      items: [",
    "label: 'Communication',\n      items: [\n        { icon: MessageSquare, label: 'Messages', path: '/teacher/messages' },"
  );
} else {
  content = content.replace(
    "label: 'Teaching',\n      items: [",
    "label: 'Teaching',\n      items: [\n        { icon: MessageSquare, label: 'Messages', path: '/teacher/messages' },"
  );
}

// Admin - under ERP & CRM or Management
content = content.replace(
  "label: 'Management',\n      items: [",
  "label: 'Management',\n      items: [\n        { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },"
);

// Parent - under My Children
content = content.replace(
  "label: 'My Children',\n      items: [",
  "label: 'My Children',\n      items: [\n        { icon: MessageSquare, label: 'Messages', path: '/parent/messages' },"
);

// Manager - under Operations
content = content.replace(
  "label: 'Operations',\n      items: [",
  "label: 'Operations',\n      items: [\n        { icon: MessageSquare, label: 'Messages', path: '/manager/messages' },"
);

fs.writeFileSync('src/lib/nav-config.ts', content);
