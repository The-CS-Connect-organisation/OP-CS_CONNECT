import { useState, useEffect, useCallback } from 'react';
import { Banknote, DollarSign, TrendingUp, AlertCircle, Download, Loader2, Bell } from 'lucide-react';
import { request } from '../../utils/apiClient';

const AdminFees = ({ user, addToast }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(null);

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await request('/fees?limit=100');
      setFees(res.fees || res.items || []);
    } catch (err) {
      addToast?.('Failed to load fees', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFees(); }, [fetchFees]);

  // Derived stats from real data
  const stats = {
    totalCollected: fees.filter(f => f.status === 'paid').reduce((s, f) => s + (f.amount || 0), 0),
    pending: fees.filter(f => f.status === 'pending').reduce((s, f) => s + (f.amount || 0), 0),
    overdue: fees.filter(f => f.status === 'overdue').reduce((s, f) => s + (f.amount || 0), 0),
    collectionRate: fees.length > 0
      ? ((fees.filter(f => f.status === 'paid').length / fees.length) * 100).toFixed(1)
      : '0.0',
  };

  const handleSendReminder = async (feeId) => {
    setSendingReminder(feeId);
    try {
      await request(`/fees/${feeId}/send-reminder`, { method: 'POST' });
      addToast?.('Reminder sent successfully', 'success');
    } catch (err) {
      addToast?.(err?.message || 'Failed to send reminder', 'error');
    } finally {
      setSendingReminder(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Fees & Billing</h1>
        <button className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2"
          style={{ background: 'var(--primary)' }}>
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>₹{stats.totalCollected.toLocaleString()}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Collected</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center mb-3">
            <Banknote size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>₹{stats.pending.toLocaleString()}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Pending</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center mb-3">
            <AlertCircle size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>₹{stats.overdue.toLocaleString()}</h3>
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

      {/* Transactions table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Fee Records</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">{fees.length} records</span>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-gray-300" />
          </div>
        ) : fees.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Banknote size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No fee records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Student ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Term</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Due Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="py-3 px-4 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {fee.student_id?.substring(0, 12)}...
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-primary)' }}>{fee.term}</td>
                    <td className="py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      ₹{(fee.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{fee.due_date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        fee.status === 'paid' ? 'bg-green-100 text-green-700' :
                        fee.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        fee.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{fee.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      {fee.status !== 'paid' && (
                        <button
                          onClick={() => handleSendReminder(fee.id)}
                          disabled={sendingReminder === fee.id}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                          style={{ color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.08)' }}
                        >
                          {sendingReminder === fee.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Bell size={12} />
                          }
                          Send Reminder
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFees;
