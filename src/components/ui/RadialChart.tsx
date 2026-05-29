import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

interface RadialChartProps {
  data: { name: string; value: number; color?: string }[];
  title: string;
  innerRadius?: number;
  outerRadius?: number;
}

export function RadialChart({ data, title, innerRadius = 50, outerRadius = 90 }: RadialChartProps) {
  return (
    <div className="bg-card rounded-xl border w-full h-full p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }}
              formatter={(value: number) => [value, 'Count']}
            />
            <Legend
              align="center"
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GenderBreakdownChart({ male, female, other = 0 }: { male: number; female: number; other?: number }) {
  const data = [
    { name: 'Male', value: male, color: '#3b82f6' },
    { name: 'Female', value: female, color: '#ec4899' },
  ];
  if (other > 0) data.push({ name: 'Other', value: other, color: '#8b5cf6' });
  return <RadialChart data={data} title="Gender Breakdown" />;
}

export function DemographicPieChart({ data, title }: { data: { name: string; value: number }[]; title: string }) {
  const colored = data.map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }));
  return <RadialChart data={colored} title={title} innerRadius={0} outerRadius={100} />;
}
