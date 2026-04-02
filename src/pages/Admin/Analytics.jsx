import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../../components/ui/Card';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export const Analytics = () => {
  const { data: users } = useStore(KEYS.USERS, []);
  const { data: attendance } = useStore(KEYS.ATTENDANCE, []);

  const stats = useMemo(() => {
    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');
    
    const classDist = {};
    students.forEach(s => {
      classDist[s.class] = (classDist[s.class] || 0) + 1;
    });
    const classData = Object.keys(classDist).map(key => ({ name: key, students: classDist[key] }));

    const totalAtt = attendance.length;
    const presentAtt = attendance.filter(a => a.status === 'present').length;
    const attRate = totalAtt ? Math.round((presentAtt / totalAtt) * 100) : 0;

    return { students: students.length, teachers: teachers.length, classData, attRate };
  }, [users, attendance]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">School Analytics 📊</h1>
        <p className="text-gray-500 mt-1">Real-time insights into school performance</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <h3 className="text-gray-500 text-sm mb-2">Total Students</h3>
          <p className="text-4xl font-bold text-primary-500">{stats.students}</p>
        </Card>
        <Card className="text-center">
          <h3 className="text-gray-500 text-sm mb-2">Total Teachers</h3>
          <p className="text-4xl font-bold text-purple-500">{stats.teachers}</p>
        </Card>
        <Card className="text-center">
          <h3 className="text-gray-500 text-sm mb-2">Avg. Attendance</h3>
          <p className="text-4xl font-bold text-emerald-500">{stats.attRate}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <h3 className="text-lg font-semibold mb-4">Student Distribution by Class</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.classData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="students" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Excellent (>90%)', value: 35 },
                    { name: 'Good (75-90%)', value: 40 },
                    { name: 'Average (50-75%)', value: 20 },
                    { name: 'Needs Help (<50%)', value: 5 },
                  ]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

