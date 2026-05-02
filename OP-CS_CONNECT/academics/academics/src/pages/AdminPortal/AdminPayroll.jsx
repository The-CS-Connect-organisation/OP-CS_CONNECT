import { useState } from 'react';
import { Banknote, Users, TrendingUp, Download } from 'lucide-react';

const AdminPayroll = ({ user, addToast }) => {
  const [stats] = useState({
    totalPayroll: 458000,
    pendingPayments: 12500,
    processedThisMonth: 445500,
    employeeCount: 85,
  });

  const [payrollItems] = useState([
    { id: 1, name: 'Sarah Wilson', role: 'Teacher', salary: 5500, status: 'paid', date: '2024-04-01' },
    { id: 2, name: 'John Smith', role: 'Teacher', salary: 5200, status: 'paid', date: '2024-04-01' },
    { id: 3, name: 'Emily Brown', role: 'Teacher', salary: 5800, status: 'pending', date: '2024-04-01' },
    { id: 4, name: 'Michael Lee', role: 'Admin', salary: 6200, status: 'paid', date: '2024-04-01' },
    { id: 5, name: 'David Chen', role: 'Staff', salary: 4800, status: 'pending', date: '2024-04-01' },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Payroll & HR</h1>
        <button className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2"
          style={{ background: 'var(--primary)' }}>
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
              <Banknote size={20} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mt-4" style={{ color: 'var(--text-primary)' }}>${stats.totalPayroll.toLocaleString()}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Payroll</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mt-4" style={{ color: 'var(--text-primary)' }}>${stats.pendingPayments.toLocaleString()}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Pending Payments</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mt-4" style={{ color: 'var(--text-primary)' }}>{stats.employeeCount}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Employees</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Banknote size={20} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mt-4" style={{ color: 'var(--text-primary)' }}>${stats.processedThisMonth.toLocaleString()}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Processed This Month</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Payroll Items</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Role</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Salary</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrollItems.map((item) => (
              <tr key={item.id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</td>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{item.role}</td>
                <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>${item.salary.toLocaleString()}</td>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{item.date}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    item.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{item.status}</span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-sm font-medium" style={{ color: 'var(--primary)' }} onClick={() => addToast?.('Process payment', 'info')}>
                    Process
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayroll;