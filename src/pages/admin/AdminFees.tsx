import { useState, useEffect, useCallback } from 'react';
import { CreditCard, AlertTriangle, TrendingDown, DollarSign, Phone, X, Plus, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';
import { api } from '../../lib/api';

interface FeeHead {
  id: string;
  name: string;
  class: string | { name: string };
  amount: number;
  frequency: string;
}

interface Payment {
  id: string;
  studentName: string;
  class: string;
  amount: number;
  feeHead: string;
  paidAt: string;
  mode: string;
}

interface Defaulter {
  id: string;
  studentName: string;
  class: string;
  outstanding: number;
  months: number;
  callStatus: string;
}

interface StudentEntry {
  id: string;
  name: string;
  class: string;
  amount: number;
  paid: number;
  dueDate: string;
  status: string;
}

const callStatusColors: Record<string, string> = {
  NOT_CALLED: 'bg-gray-100 text-gray-700',
  CALLED: 'bg-blue-100 text-blue-700',
  PROMISED: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
};

const EMPTY_PAYMENT_FORM = {
  studentId: '',
  feeHeadId: '',
  amount: '',
  paidAmount: '',
  method: 'CASH',
  receiptNo: '',
  transactionId: '',
};

export default function AdminFees() {
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [allFees, setAllFees] = useState<StudentEntry[]>([]);
  const [stats, setStats] = useState({
    totalCollections: 0, outstanding: 0, defaultersCount: 0, todaysCollection: 0,
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [fhRes, dfRes, paymentsRes, feesRes] = await Promise.allSettled([
        fetch('/api/v1/fees/heads', { headers }),
        fetch('/api/v1/fees/defaulters', { headers }),
        api.getPayments().catch(() => []),
        api.getFeeRecords().catch(() => []),
      ]);

      if (fhRes.status === 'fulfilled' && fhRes.value.ok) {
        const data = await fhRes.value.json();
        setFeeHeads(Array.isArray(data) ? data : data.data ?? []);
      }
      if (dfRes.status === 'fulfilled' && dfRes.value.ok) {
        const data = await dfRes.value.json();
        const list: Defaulter[] = Array.isArray(data) ? data : data.data ?? [];
        setDefaulters(list);
        setStats(prev => ({ ...prev, defaultersCount: list.length }));
      }
      if (paymentsRes.status === 'fulfilled') setPayments(Array.isArray(paymentsRes.value) ? paymentsRes.value : []);
      if (feesRes.status === 'fulfilled') setAllFees(Array.isArray(feesRes.value) ? feesRes.value : []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function handlePaymentChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const payload: Record<string, string | number> = {
        studentId: paymentForm.studentId,
        feeHeadId: paymentForm.feeHeadId,
        amount: Number(paymentForm.amount),
        paidAmount: Number(paymentForm.paidAmount),
        method: paymentForm.method,
        receiptNo: paymentForm.receiptNo,
      };
      if (paymentForm.transactionId) payload.transactionId = paymentForm.transactionId;

      const res = await fetch('/api/v1/fees/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowPaymentForm(false);
        setPaymentForm(EMPTY_PAYMENT_FORM);
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message ?? `Error ${res.status}`);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const totalCollected = allFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.paid, 0);
  const totalPending = allFees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + (f.amount - f.paid), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fee Management</h1>
          <p className="text-muted-foreground">Fee structures, payments, and defaulter tracking</p>
        </div>
        <div className="flex gap-2">
          {['all', 'paid', 'pending', 'overdue'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f as any)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === f ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-md text-sm bg-background" />
        </div>
        <Button onClick={() => { setShowPaymentForm(v => !v); setError(''); }}>
          {showPaymentForm ? <X className="w-4 h-4 mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
          {showPaymentForm ? 'Cancel' : 'Record Payment'}
        </Button>
      </div>

      {/* Record Payment Form */}
      {showPaymentForm && (
        <Card className="p-6 border-2 border-primary/20">
          <h2 className="text-lg font-semibold mb-4">Record Fee Payment</h2>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}
          <form onSubmit={handlePaymentSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student ID *</label>
                <input required name="studentId" value={paymentForm.studentId} onChange={handlePaymentChange} placeholder="Student ID" className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fee Head *</label>
                <select required name="feeHeadId" value={paymentForm.feeHeadId} onChange={handlePaymentChange} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                  <option value="">Select fee head</option>
                  {feeHeads.map(fh => <option key={fh.id} value={fh.id}>{fh.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input required type="number" min="0" name="amount" value={paymentForm.amount} onChange={handlePaymentChange} placeholder="0" className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Paid Amount *</label>
                <input required type="number" min="0" name="paidAmount" value={paymentForm.paidAmount} onChange={handlePaymentChange} placeholder="0" className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method *</label>
                <select name="method" value={paymentForm.method} onChange={handlePaymentChange} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                  <option value="CASH">Cash</option>
                  <option value="ONLINE">Online</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Receipt No *</label>
                <input required name="receiptNo" value={paymentForm.receiptNo} onChange={handlePaymentChange} placeholder="RCP-2026-001" className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Transaction ID</label>
                <input name="transactionId" value={paymentForm.transactionId} onChange={handlePaymentChange} placeholder="Optional" className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => { setShowPaymentForm(false); setError(''); setPaymentForm(EMPTY_PAYMENT_FORM); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50"><DollarSign className="h-5 w-5 text-green-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Total Collections</p>
            <p className="text-xl font-bold">{formatCurrency(totalCollected)}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50"><TrendingDown className="h-5 w-5 text-red-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="text-xl font-bold">{formatCurrency(totalPending)}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-50"><AlertTriangle className="h-5 w-5 text-yellow-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Defaulters</p>
            <p className="text-xl font-bold">{stats.defaultersCount || '--'}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50"><CreditCard className="h-5 w-5 text-blue-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Total Records</p>
            <p className="text-xl font-bold">{allFees.length}</p>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fee Heads Table */}
            <Card>
              <div className="p-4 border-b"><h2 className="font-semibold">Fee Heads</h2></div>
              {feeHeads.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No fee heads configured yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-2 font-medium">Name</th>
                      <th className="text-left px-4 py-2 font-medium">Class</th>
                      <th className="text-right px-4 py-2 font-medium">Amount</th>
                      <th className="text-left px-4 py-2 font-medium">Frequency</th>
                    </tr></thead>
                    <tbody>
                      {feeHeads.map((fh: FeeHead) => (
                        <tr key={fh.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-2">{fh.name}</td>
                          <td className="px-4 py-2 text-muted-foreground">{(fh.class as any)?.name || fh.class}</td>
                          <td className="px-4 py-2 text-right font-medium">{formatCurrency(fh.amount)}</td>
                          <td className="px-4 py-2 text-muted-foreground">{fh.frequency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Recent Payments Table */}
            <Card>
              <div className="p-4 border-b"><h2 className="font-semibold">Recent Payments</h2></div>
              {payments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No payments recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-2 font-medium">Student</th>
                      <th className="text-left px-4 py-2 font-medium">Fee Head</th>
                      <th className="text-right px-4 py-2 font-medium">Amount</th>
                      <th className="text-left px-4 py-2 font-medium">Mode</th>
                    </tr></thead>
                    <tbody>
                      {payments.map((p: Payment) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-2">
                            <p className="font-medium">{p.studentName}</p>
                            <p className="text-xs text-muted-foreground">{(p.class as any)?.name || p.class}</p>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">{(p.feeHead as any)?.name || p.feeHead}</td>
                          <td className="px-4 py-2 text-right font-medium text-green-600">{formatCurrency(p.amount)}</td>
                          <td className="px-4 py-2 text-muted-foreground">{p.mode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Defaulter List */}
          <Card>
            <div className="p-4 border-b"><h2 className="font-semibold">Defaulter List</h2></div>
            {defaulters.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No defaulters found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2 font-medium">Student</th>
                    <th className="text-left px-4 py-2 font-medium">Class</th>
                    <th className="text-right px-4 py-2 font-medium">Outstanding</th>
                    <th className="text-center px-4 py-2 font-medium">Months Due</th>
                    <th className="text-center px-4 py-2 font-medium">Call Status</th>
                    <th className="text-center px-4 py-2 font-medium">Action</th>
                  </tr></thead>
                  <tbody>
                    {defaulters.map((d: Defaulter) => (
                      <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{d.studentName}</td>
                          <td className="px-4 py-2 text-muted-foreground">{(d.class as any)?.name || d.class}</td>
                        <td className="px-4 py-2 text-right font-medium text-red-600">{formatCurrency(d.outstanding)}</td>
                        <td className="px-4 py-2 text-center">{d.months}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${callStatusColors[d.callStatus] || 'bg-gray-100 text-gray-700'}`}>
                            {d.callStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline mx-auto">
                            <Phone className="h-3 w-3" /> Call
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
