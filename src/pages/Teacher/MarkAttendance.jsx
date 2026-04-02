import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Check, X, Minus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const MarkAttendance = ({ user, addToast }) => {
  const { data: users } = useStore(KEYS.USERS, []);
  const { data: attendance, add } = useStore(KEYS.ATTENDANCE, []);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [marks, setMarks] = useState({});

  const students = users.filter(u => u.role === 'student' && u.class === selectedClass);

  const handleMark = (studentId, status) => {
    setMarks(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = () => {
    const subjects = user.subjects || ['General'];
    subjects.forEach(subject => {
      students.forEach(student => {
        const status = marks[student.id] || 'present';
        add({
          id: `att-${student.id}-${selectedDate}-${subject}-${Date.now()}`,
          studentId: student.id,
          date: selectedDate,
          subject,
          status
        });
      });
    });
    setMarks({});
    addToast(`Attendance marked for ${selectedClass} on ${selectedDate} ✅`, 'success');
  };

  const statusConfig = {
    present: { icon: Check, color: 'from-emerald-500 to-teal-500', label: 'Present' },
    absent: { icon: X, color: 'from-red-500 to-pink-500', label: 'Absent' },
    late: { icon: Minus, color: 'from-amber-500 to-yellow-500', label: 'Late' },
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <CheckSquare className="text-primary-500" /> Mark Attendance
        </h1>
        <p className="text-gray-500 mt-1">Record daily attendance for your class</p>
      </motion.div>

      <Card className="flex flex-col md:flex-row gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="input-field">
            <option value="10-A">10-A</option>
            <option value="10-B">10-B</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button variant="primary" onClick={handleSubmit}>Save Attendance</Button>
        </div>
      </Card>

      <div className="grid gap-3">
        {students.map((student, idx) => (
          <motion.div key={student.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card className="flex items-center gap-4">
              <span className="text-2xl">{student.avatar}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">{student.name}</p>
                <p className="text-sm text-gray-500">{student.rollNo}</p>
              </div>
              <div className="flex gap-2">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const Icon = config.icon;
                  const isActive = marks[student.id] === status;
                  return (
                    <motion.button key={status} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleMark(student.id, status)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all ${
                        isActive ? `bg-gradient-to-br ${config.color} shadow-lg` : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}
                      title={config.label}
                    >
                      <Icon size={18} />
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
