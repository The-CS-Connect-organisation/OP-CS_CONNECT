const fs = require('fs');
let code = fs.readFileSync('src/pages/student/Dashboard.tsx', 'utf8');

// Add announcements to useDataStore destructuring
code = code.replace(
  `const { grades, attendance, assignments, subjects, fees, clubs, timetable, events, isLoading, fetchStudentData } = useDataStore()`,
  `const { grades, attendance, assignments, subjects, fees, clubs, timetable, events, announcements = [], isLoading, fetchStudentData } = useDataStore()`
);

// Add API import
code = code.replace(
  `import { cn, formatCurrency, normalizeAcademicPercentage, formatPercentage } from '@/lib/utils'`,
  `import { cn, formatCurrency, normalizeAcademicPercentage, formatPercentage } from '@/lib/utils'\nimport { api } from '@/lib/api'`
);

// Add state for announcements
code = code.replace(
  `const [showAI, setShowAI] = useState(false)`,
  `const [showAI, setShowAI] = useState(false)\n  const [recentAnns, setRecentAnns] = useState<any[]>([])`
);

// Fetch announcements
code = code.replace(
  `if (user?.id) fetchStudentData(user.id)\n  }, [user?.id, fetchStudentData])`,
  `if (user?.id) fetchStudentData(user.id)\n    api.getAnnouncements().then((data: any) => {\n      if (Array.isArray(data)) {\n        setRecentAnns(data.filter(a => !a.audience || a.audience === 'all' || a.audience === 'students').slice(0, 3));\n      }\n    })\n  }, [user?.id, fetchStudentData])`
);

// We need to add the Announcements pane. Let's put it next to Quick Stats or in the Activities & Fees grid.
// Let's replace the Hero section paragraph with announcements? No, let's add it below Quick Stats.
const annPane = `

        {/* Recent Announcements */}
        <motion.div variants={itemVariants}>
          <Card glow>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">📢</span> Recent Announcements
                </CardTitle>
                <button onClick={() => navigate('/student/announcements')} className="text-xs text-primary hover:underline">View All</button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAnns.length > 0 ? recentAnns.map((ann: any) => (
                <div key={ann.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{ann.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{ann.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(ann.createdAt).toLocaleDateString()}</p>
                  </div>
                  {ann.priority === 'high' && <Badge variant="destructive" className="flex-shrink-0">High</Badge>}
                </div>
              )) : (
                <div className="text-center py-4 text-muted-foreground text-sm">No recent announcements</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
`;

code = code.replace(
  `{/* Main Content Grid */}`,
  annPane + `\n        {/* Main Content Grid */}`
);

fs.writeFileSync('src/pages/student/Dashboard.tsx', code);
