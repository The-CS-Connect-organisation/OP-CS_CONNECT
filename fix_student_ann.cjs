const fs = require('fs');
let code = fs.readFileSync('src/pages/student/Announcements.tsx', 'utf8');

code = code.replace(
  `approvedBy?: string\n}`,
  `approvedBy?: string\n  audience?: string\n}`
);

code = code.replace(
  `const data = await api.getAnnouncements()\n      setAnnouncements(Array.isArray(data) ? data : [])`,
  `const data = await api.getAnnouncements()\n      setAnnouncements(Array.isArray(data) ? data.filter(a => !a.audience || a.audience === 'all' || a.audience === 'students') : [])`
);

code = code.replace(
  `{getPriorityBadge(ann.priority)}`,
  `{getPriorityBadge(ann.priority)}\n                              <Badge variant="outline" className="bg-purple-100 text-purple-700 capitalize border-purple-200">To: {ann.audience || 'all'}</Badge>`
);

code = code.replace(
  `{getPriorityBadge(selectedAnn.priority)}`,
  `{getPriorityBadge(selectedAnn.priority)}\n                      <Badge variant="outline" className="bg-purple-100 text-purple-700 capitalize border-purple-200">To: {selectedAnn.audience || 'all'}</Badge>`
);

fs.writeFileSync('src/pages/student/Announcements.tsx', code);
