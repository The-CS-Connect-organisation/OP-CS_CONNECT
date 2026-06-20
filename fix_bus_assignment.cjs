const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminBusAssignment.tsx', 'utf8');

// We need to fetch students, and add a modal/dropdown to assign students.
code = code.replace(
  `const [loading, setLoading] = useState(true);`,
  `const [loading, setLoading] = useState(true);\n  const [students, setStudents] = useState<any[]>([]);\n  const [assigningBusId, setAssigningBusId] = useState<string | null>(null);`
);

code = code.replace(
  `const list = Array.isArray(data) ? data : [];`,
  `const list = Array.isArray(data) ? data : [];\n      const stds = await api.getUsers({ role: 'student' }).catch(() => []);\n      setStudents(Array.isArray(stds) ? stds : []);`
);

code = code.replace(
  `status: b.status || 'active',`,
  `status: b.status || 'active',\n        students: Array.isArray(b.students) ? b.students : [],`
);

const handleAssignStudent = `
  const handleAssignStudent = async (busId: string, studentId: string) => {
    try {
      const bus = buses.find(b => b.id === busId);
      if (!bus) return;
      
      let newStudents = [...(bus as any).students];
      if (newStudents.includes(studentId)) {
        newStudents = newStudents.filter(id => id !== studentId);
      } else {
        newStudents.push(studentId);
      }
      
      // optimistically update
      setBuses(prev => prev.map(b => b.id === busId ? { ...b, students: newStudents, assignedStudents: newStudents.length } : b));
      
      await api.updateBusAssignment(busId, { students: newStudents });
    } catch (err) {
      console.error(err);
    }
  };
`;

code = code.replace(
  `const getStatusColor = (status: string) => {`,
  handleAssignStudent + `\n  const getStatusColor = (status: string) => {`
);

const assignButton = `
              <div className="flex items-center justify-between gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => setAssigningBusId(assigningBusId === bus.id ? null : bus.id)}>
                  {assigningBusId === bus.id ? 'Done' : 'Assign Students'}
                </Button>
`;

code = code.replace(
  `<div className="flex items-center justify-between gap-2 mt-3">`,
  assignButton
);

const assignDropdown = `
              {assigningBusId === bus.id && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2 max-h-40 overflow-y-auto">
                  <p className="text-xs font-semibold mb-2">Select Students</p>
                  {students.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={((bus as any).students || []).includes(s.id)}
                        onChange={() => handleAssignStudent(bus.id, s.id)}
                        className="rounded border-gray-300"
                      />
                      {s.name} ({s.class || 'No Class'})
                    </label>
                  ))}
                </div>
              )}
            </Card>
`;

code = code.replace(
  `            </Card>`,
  assignDropdown
);

fs.writeFileSync('src/pages/admin/AdminBusAssignment.tsx', code);
