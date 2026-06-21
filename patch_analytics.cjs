const fs = require('fs');

// Patch backend
let backendContent = fs.readFileSync('../OP-CS_CONNECT_-Backend-/src/routes/analytics.ts', 'utf8');

const classAnalyticsRoute = `
// GET /api/analytics/class/:id
router.get('/class/:id', async (req: Request, res: Response) => {
    try {
        const classId = req.params.id;
        const users = await listData('users');
        const students = users.filter((u: any) => u.role === 'student' && (u.classId === classId || u.class === classId));
        
        // Mocked response for now since we don't have grades hooked up fully yet
        const analytics = {
            classAverage: 85,
            topScore: 98,
            atRiskCount: students.length > 5 ? 2 : 0,
            complianceScore: 92,
            totalStudents: students.length,
            attendanceRate: 94
        };
        
        res.json({ success: true, analytics });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
`;

backendContent = backendContent.replace("export default router;", classAnalyticsRoute + "\nexport default router;");
fs.writeFileSync('../OP-CS_CONNECT_-Backend-/src/routes/analytics.ts', backendContent);

// Patch frontend
let frontendContent = fs.readFileSync('src/pages/admin/AdminAnalytics.tsx', 'utf8');
frontendContent = frontendContent.replace(
  "fetch(`/api/v1/analytics/class/${selectedClassId}`, {",
  "api.apiFetch(`/analytics/class/${selectedClassId}`, {"
);
frontendContent = frontendContent.replace(
  "headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },",
  ""
);
frontendContent = frontendContent.replace(
  "}).then(res => res.ok ? res.json() : null)",
  "}).catch(() => null)"
);
fs.writeFileSync('src/pages/admin/AdminAnalytics.tsx', frontendContent);
