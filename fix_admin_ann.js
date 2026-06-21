const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminAnnouncements.tsx', 'utf8');

code = code.replace(
  `priority: 'low' | 'medium' | 'high';\n}`,
  `priority: 'low' | 'medium' | 'high';\n  audience?: 'all' | 'students' | 'teachers' | 'parents' | 'staff';\n}`
);

code = code.replace(
  `const [form, setForm] = useState({ title: '', content: '', type: 'general' as Announcement['type'], priority: 'medium' as Announcement['priority'], expiresAt: '' });`,
  `const [form, setForm] = useState({ title: '', content: '', type: 'general' as Announcement['type'], priority: 'medium' as Announcement['priority'], expiresAt: '', audience: 'all' as 'all' | 'students' | 'teachers' | 'parents' | 'staff' });`
);

code = code.replace(
  `setForm({ title: '', content: '', type: 'general', priority: 'medium', expiresAt: '' });`,
  `setForm({ title: '', content: '', type: 'general', priority: 'medium', expiresAt: '', audience: 'all' });`
);

code = code.replace(
  `<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })} className="px-3 py-2 rounded-lg border bg-background">`,
  `<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })} className="px-3 py-2 rounded-lg border bg-background">`
);

code = code.replace(
  `<input type="date" value={form.expiresAt}`,
  `<select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as any })} className="px-3 py-2 rounded-lg border bg-background">
              <option value="all">All Roles</option>
              <option value="students">Students Only</option>
              <option value="teachers">Teachers Only</option>
              <option value="parents">Parents Only</option>
              <option value="staff">Staff/Admin Only</option>
            </select>
            <input type="date" value={form.expiresAt}`
);

code = code.replace(
  `{announcement.priority === 'high' && <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />High Priority</Badge>}`,
  `{announcement.priority === 'high' && <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />High Priority</Badge>}
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 capitalize">To: {announcement.audience || 'all'}</Badge>`
);

fs.writeFileSync('src/pages/admin/AdminAnnouncements.tsx', code);
