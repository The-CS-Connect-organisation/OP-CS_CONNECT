import { useState } from 'react';
import { Banknote, DollarSign, TrendingUp, AlertCircle, Download } from 'lucide-react';

const AdminFees = ({ user, addToast }) => {
  const [stats] = useState({
    totalCollected: 1250000,
    pending: 85000,
    overdue: 32000,
    collectionRate: 93.6,
  });

  const [transactions] = useState([
    { id: 1, student: 'John Doe', grade: '10-A', amount: 1500, type: 'Tuition', date: '2024-04-28', status: 'paid' },
    { id: 2, student: 'Emma Wilson', grade: '9-B', amount: 1500, type: 'Tuition', date: '2024-04-27', status: 'paid' },
    { id: 3, student: 'Michael Brown', grade: '11-C', amount: 1500, type: 'Tuition', date: '2024-04-25', status: 'pending' },
    { id: 4, student: 'Sarah Johnson', grade: '10-A', amount: 500, type: 'Transport', date: '2024-04-20', status: 'overdue' },
    { id: 5, student: 'David Lee', grade: '8-A', amount: 1500, type: 'Tuition', date: '2024-04-15', status: 'overdue' },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Fees & Billing</h1>
        <button className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2"
          style={{ background: 'var(--primary)' }}>
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>${stats.totalCollected.toLocaleString()}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Collected</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center mb-3">
            <Banknote size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>${stats.pending.toLocaleString()}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Pending</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center mb-3">
            <AlertCircle size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>${stats.overdue.toLocaleString()}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Overdue</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-3">
            <TrendingUp size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.collectionRate}%</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Collection Rate</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Student</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Grade</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Type</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Amount</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-primary)' }}>{tx.student}</td>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{tx.grade}</td>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{tx.type}</td>
                <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>${tx.amount.toLocaleString()}</td>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{tx.date}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    tx.status === 'paid' ? 'bg-green-100 text-green-700' :
                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{tx.status}</span>
                </td>
                <td className="py-3 px-4">
                  {tx.status !== 'paid' && (
                    <button className="text-sm font-medium" style={{ color: 'var(--primary)' }} onClick={() => addToast?.('Send reminder', 'info')}>
                      Send Reminder
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFees;