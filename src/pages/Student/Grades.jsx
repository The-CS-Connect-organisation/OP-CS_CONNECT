import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, BookOpen } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MarksChart, SubjectWiseChart } from '../../components/charts/MarksChart';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const Grades = ({ user }) => {
  const { data: marks } = useStore(KEYS.MARKS, []);
  const myMarks = marks.filter(m => m.studentId === user.id);

  const overallAvg = useMemo(() => {
    if (myMarks.length === 0) return 0;
    return Math.round(myMarks.reduce((a, b) => a + b.marksObtained, 0) / myMarks.length);
  }, [myMarks]);

  const gradeDistribution = useMemo(() => {
    const dist = {};
    myMarks.forEach(m => { dist[m.grade] = (dist[m.grade] || 0) + 1; });
    return dist;
  }, [myMarks]);

  const exams = useMemo(() => {
    const examMap = {};
    myMarks.forEach(m => {
      if (!examMap[m.examName]) examMap[m.examName] = { name: m.examName, date: m.date, subjects: [] };
      examMap[m.examName].subjects.push(m);
    });
    return Object.values(examMap);
  }, [myMarks]);

  const gradeColors = { 'A+': 'green', 'A': 'green', 'B+': 'blue', 'B': 'blue', 'C': 'orange', 'F': 'red' };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <Award className="text-primary-500" /> Grades & Performance
        </h1>
        <p className="text-gray-500 mt-1">Your academic performance overview</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mx-auto mb-3">
              <TrendingUp size={28} />
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{overallAvg}%</p>
            <p className="text-sm text-gray-500">Overall Average</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white mx-auto mb-3">
              <BookOpen size={28} />
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{myMarks.length}</p>
            <p className="text-sm text-gray-500">Total Exams</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white mx-auto mb-3">
              <Award size={28} />
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{Object.keys(gradeDistribution).length}</p>
            <p className="text-sm text-gray-500">Unique Grades</p>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card><MarksChart data={myMarks} title="Marks Trend Over Exams" /></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card><SubjectWiseChart data={myMarks} /></Card>
        </motion.div>
      </div>

      {/* Exam Results Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Exam Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Exam</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Subject</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Marks</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Grade</th>
                </tr>
              </thead>
              <tbody>
                {myMarks.map((m, idx) => (
                  <motion.tr key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + idx * 0.03 }}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-white">{m.examName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{m.subject}</td>
                    <td className="py-3 px-4 text-sm text-center font-medium text-gray-800 dark:text-white">{m.marksObtained}/{m.totalMarks}</td>
                    <td className="py-3 px-4 text-center"><Badge color={gradeColors[m.grade] || 'gray'}>{m.grade}</Badge></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
