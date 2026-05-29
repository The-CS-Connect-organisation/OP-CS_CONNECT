
import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

const AttendancePieChart = ({ attendancePercent }) => {
  const pieData = [
    { name: 'Present', value: attendancePercent, color: '#10b981' },
    { name: 'Absent', value: 100 - attendancePercent, color: '#ef4444' },
  ];

  return (
    <ResponsiveContainer width="100%" height={176}>
      <PieChart>
        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default React.memo(AttendancePieChart);
