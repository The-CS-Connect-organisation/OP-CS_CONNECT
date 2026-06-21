import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export const FinanceChart = ({ data }: { data: { name: string; income: number; expense: number }[] }) => {
  return (
    <div className="bg-card rounded-xl border w-full h-full p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Finance Overview</h1>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tick={{ fill: "#9ca3af" }} tickLine={false} tickMargin={10} />
            <YAxis axisLine={false} tick={{ fill: "#9ca3af" }} tickLine={false} tickMargin={20} />
            <Tooltip contentStyle={{ borderRadius: "10px", borderColor: "#e5e7eb", backgroundColor: "var(--background)", color: "var(--foreground)" }} />
            <Legend align="center" verticalAlign="top" wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }} />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const AttendanceChart = ({ data }: { data: { name: string; present: number; absent: number }[] }) => {
  return (
    <div className="bg-card rounded-xl border w-full h-full p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Attendance Trends</h1>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={20} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tick={{ fill: "#9ca3af" }} tickLine={false} tickMargin={10} />
            <YAxis axisLine={false} tick={{ fill: "#9ca3af" }} tickLine={false} tickMargin={20} />
            <Tooltip contentStyle={{ borderRadius: "10px", borderColor: "#e5e7eb", backgroundColor: "var(--background)", color: "var(--foreground)" }} />
            <Legend align="left" verticalAlign="top" wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }} />
            <Bar dataKey="present" fill="#f59e0b" legendType="circle" radius={[10, 10, 0, 0]} />
            <Bar dataKey="absent" fill="#3b82f6" legendType="circle" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};