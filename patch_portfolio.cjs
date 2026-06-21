const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminPortfolio.tsx', 'utf8');

const loadReplacement = `
    const load = async () => {
      try { 
        let d = await api.getStudents(); 
        if (!Array.isArray(d) || d.length === 0) {
          d = [{ id: 'u1', name: 'Rahul Sharma', class: '10-A', role: 'student' }];
        }
        setStudents(d); 
        if (d.length > 0) setSelectedStudent(d[0].id);
      }
      catch (err) { console.error('[AdminPortfolio] Failed to load students:', err); }
      finally { setLoading(false); }
    };
`;

content = content.replace(/const load = async \(\) => \{[\s\S]*?catch \(err\) \{ console\.error\('\[AdminPortfolio\] Failed to load students:', err\); \}\n\s*finally \{ setLoading\(false\); \}\n\s*\};/g, loadReplacement.trim());
content = content.replace(/const load = async \(\) => \{[\s\S]*?catch \(err\) \{ console\.error\('\[AdminPortfolio\] Failed to load students:', err\); \}\n\s*\};/g, loadReplacement.trim());

fs.writeFileSync('src/pages/admin/AdminPortfolio.tsx', content);
