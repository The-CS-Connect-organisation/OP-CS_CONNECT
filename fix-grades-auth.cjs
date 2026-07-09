const fs = require('fs');
const path = 'backend-copy/src/index.ts';
let content = fs.readFileSync(path, 'utf8');

const oldCode = `app.post('/api/grades/enter', async (req, res) => {
  try {
    const { studentId, subject, grade, marks } = req.body;
    const existing = await getData(\`grades/\${studentId}\`);
    const records = existing ? Object.values(existing) : [];
    const idx = records.findIndex((r: any) => r.subject === subject);
    if (idx >= 0) {
      records[idx] = { subject, grade, marks };
    } else {
      records.push({ subject, grade, marks });
    }
    await setData(\`grades/\${studentId}\`, records);
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enter grades' });
  }
});`;

const newCode = `app.post('/api/grades/enter', authMiddleware, async (req, res) => {
  try {
    const requester = (req as any).user;
    if (!['admin', 'teacher', 'principal'].includes(requester?.role)) {
      return res.status(403).json({ error: 'Only teachers can enter grades' });
    }
    const { studentId, subject, grade, marks } = req.body;
    const existing = await getData(\`grades/\${studentId}\`);
    const records = existing ? Object.values(existing) : [];
    const idx = records.findIndex((r: any) => r.subject === subject);
    if (idx >= 0) {
      records[idx] = { subject, grade, marks };
    } else {
      records.push({ subject, grade, marks });
    }
    await setData(\`grades/\${studentId}\`, records);
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enter grades' });
  }
});`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS: Grades endpoint updated with authMiddleware and teacher role check');
} else {
  console.log('FAILED: Could not find exact match');
  // Try with different line endings
  const oldCodeCRLF = oldCode.replace(/\n/g, '\r\n');
  if (content.includes(oldCodeCRLF)) {
    content = content.replace(oldCodeCRLF, newCode.replace(/\n/g, '\r\n'));
    fs.writeFileSync(path, content, 'utf8');
    console.log('SUCCESS (CRLF): Grades endpoint updated');
  } else {
    console.log('FAILED: No match found even with CRLF');
    // Print context around the endpoint
    const idx = content.indexOf("'/api/grades/enter'");
    if (idx >= 0) {
      console.log('Context:', JSON.stringify(content.substring(idx - 2, idx + 500)));
    }
  }
}
