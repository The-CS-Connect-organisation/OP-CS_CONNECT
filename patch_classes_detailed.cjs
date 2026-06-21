const fs = require('fs');
let content = fs.readFileSync('../OP-CS_CONNECT_-Backend-/src/routes/classes.ts', 'utf8');

const detailedRoute = `
router.get('/detailed', async (req, res) => {
  try {
    const classes = await listData('classes');
    const sections = await listData('sections');
    const subjects = await listData('subjects');
    const users = await listData('users');

    const result = (classes || []).map((cls: any) => {
      const clsSections = (sections || []).filter((s: any) => s.classId === cls.id);
      const clsSubjects = (subjects || []).filter((s: any) => s.classId === cls.id);
      
      const studentsInClass = (users || []).filter((u: any) => u.role === 'student' && u.classId === cls.id);

      return {
        ...cls,
        sections: clsSections,
        subjects: clsSubjects,
        sectionCount: clsSections.length,
        studentCount: studentsInClass.length
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch detailed classes' });
  }
});
`;

content = content.replace("router.get('/', async (req, res) => {", detailedRoute + "\nrouter.get('/', async (req, res) => {");
fs.writeFileSync('../OP-CS_CONNECT_-Backend-/src/routes/classes.ts', content);
