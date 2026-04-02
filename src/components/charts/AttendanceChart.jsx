import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const AttendanceChart = ({ data, title }) => {
  const chartData = data.slice(0, 14).reverse().map(d => ({
    date: d.date,
    present: d.status === 'present' ? 1 : 0,
    late: d.status === 'late' ? 1 : 0,
    absent: d.status === 'absent' ? 1 : 0,
  }));

  return (
    <div className="w-full h-64">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-gray-500" />
          <YAxis tick={{ fontSize: 10 }} className="text-gray-500" />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
          <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Late" />
          <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};