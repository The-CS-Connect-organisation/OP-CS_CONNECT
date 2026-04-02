import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Area, AreaChart, Line, Cell, PieChart, Pie 
} from 'recharts';

// Chart 1: Marks Trend (Line/Area Chart)
export const MarksChart = ({ data, title }) => {
  const chartData = data.map(d => ({
    exam: d.examName,
    marks: d.marksObtained,
    total: d.totalMarks,
  }));

  return (
    <div className="w-full h-64">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="exam" tick={{ fontSize: 10 }} className="text-gray-500" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} className="text-gray-500" />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          <Area type="monotone" dataKey="marks" stroke="#8b5cf6" fill="url(#colorMarks)" strokeWidth={3} name="Marks" />
          <Line type="monotone" dataKey="total" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} name="Total" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 2: Subject-wise Performance (Bar Chart) ← This one was broken!
export const SubjectWiseChart = ({ data }) => {
  const chartData = data.reduce((acc, curr) => {
    const existing = acc.find(a => a.subject === curr.subject);
    if (existing) {
      existing.total += curr.marksObtained;
      existing.count += 1;
    } else {
      acc.push({ subject: curr.subject, total: curr.marksObtained, count: 1 });
    }
    return acc;
  }, []).map(d => ({ ...d, average: Math.round(d.total / d.count) }));

  return (
    <div className="w-full h-64">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Subject-wise Performance</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="subject" tick={{ fontSize: 10 }} className="text-gray-500" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} className="text-gray-500" />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
          <Bar dataKey="average" fill="url(#gradientBar)" radius={[8, 8, 0, 0]} name="Average %" />
          <defs>
            <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};