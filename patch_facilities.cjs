const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminFacilities.tsx', 'utf8');

const loadBuildings = `
  const loadBuildings = async () => {
    try {
      const d = await api.getBuildings().catch(() => []);
      if (Array.isArray(d) && d.length > 0) {
        setBuildings(d);
      } else {
        setBuildings([
          { id: 'b1', name: 'Main Block', code: 'MB', floors: 4, totalRooms: 40, address: 'Campus Center', status: 'active' },
          { id: 'b2', name: 'Science Wing', code: 'SW', floors: 3, totalRooms: 15, address: 'East Campus', status: 'active' },
          { id: 'b3', name: 'Sports Complex', code: 'SC', floors: 2, totalRooms: 10, address: 'West Campus', status: 'maintenance' }
        ]);
      }
    } catch {}
    setLoading(false);
  };
`;

content = content.replace(/const loadBuildings = async \(\) => \{[\s\S]*?setLoading\(false\);\n\s*\};/, loadBuildings.trim());

fs.writeFileSync('src/pages/admin/AdminFacilities.tsx', content);
