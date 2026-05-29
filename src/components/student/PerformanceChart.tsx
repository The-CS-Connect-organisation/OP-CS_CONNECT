
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { normalizeAcademicPercentage } from '@/lib/utils';

const PerformanceChart = ({ grades, attendancePercent }) => {
  const performanceData = grades.map((g: any) => ({
    month: g.subject?.slice(0, 4) || '??',
    score: normalizeAcademicPercentage(g.overall || 0),
    attendance: attendancePercent,
  }));

  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={performanceData}>
        <defs>
          <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[60, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            fontSize: '12px',
          }}
        />
        <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#gpaGradient)" strokeWidth={2} name="Score %" />
        <Area type="monotone" dataKey="attendance" stroke="#10b9.81" fill="url(#attGradient)" strokeWidth={2} name="Attendance" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default React.memo(PerformanceChart);
