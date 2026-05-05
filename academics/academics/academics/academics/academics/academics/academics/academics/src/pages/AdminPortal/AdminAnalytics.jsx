import { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

const AdminAnalytics = ({ user, addToast }) => {
  const [selectedPeriod] = useState('This Month');
  
  const metrics = [
    { name: 'Student Performance', value: '87%', trend: '+5%', icon: TrendingUp, color: 'bg-green-500' },
    { name: 'Teacher Efficiency', value: '92%', trend: '+3%', icon: Users, color: 'bg-blue-500' },
    { name: 'Fee Collection', value: '89%', trend: '+8%', icon: DollarSign, color: 'bg-yellow-500' },
    { name: 'Overall Growth', value: '94%', trend: '+12%', icon: BarChart3, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics Dashboard</h1>
        <select className="px-4 py-2 rounded-xl border text-sm" style={{ borderColor: 'var(--border-color)' }}>
          <option>This Week</option>
          <option>This Month</option>
          <option>This Quarter</option>
          <option>This Year</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${metric.color} flex items-center justify-center`}>
                <metric.icon size={20} className="text-white" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">{metric.trend}</span>
            </div>
            <h3 className="text-2xl font-bold mt-4" style={{ color: 'var(--text-primary)' }}>{metric.value}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{metric.name}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-color)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Detailed Reports</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Analytics charts and graphs will be displayed here. Connect to backend API for real data.</p>
      </div>
    </div>
  );
};

export default AdminAnalytics;