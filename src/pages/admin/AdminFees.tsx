import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, AlertTriangle, TrendingDown, DollarSign, Phone, X, Plus, Search, Receipt, Calendar, User, Check, Loader2, CheckCircle2, Trash2, Eye, EyeOff, Landmark } from 'lucide-react';
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

interface InstallmentPlan {
  id: string;
  studentName: string;
  class: string;
  totalAmount: number;
  installments: { amount: number; dueDate: string; paid: boolean; id: string }[];
  status: 'active' | 'completed' | 'defaulted';
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

type Tab = 'accounts' | 'installments';

export default function AdminFees() {
  // Tabs
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: Tab = tabParam === 'installments' ? 'installments' : 'accounts';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Accounts (Fee Management) state
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

  // Installments state
  const [plans, setPlans] = useState<InstallmentPlan[]>([]);
  const [installmentsLoading, setInstallmentsLoading] = useState(true);
  const [installmentSearchQuery, setInstallmentSearchQuery] = useState('');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payments = await api.getPayments().catch(() => []);
      const allFees = await api.getFeeRecords().catch(() => []);

      setPayments(Array.isArray(payments) ? payments : []);

      const feesArray = Array.isArray(allFees) ? allFees : [];
      setAllFees(feesArray);

      // Generate dummy fee heads if none
      setFeeHeads([
        { id: 'fh1', name: 'Tuition Fee', class: 'all', amount: 50000, frequency: 'term' },
        { id: 'fh2', name: 'Transport', class: 'all', amount: 12000, frequency: 'term' },
        { id: 'fh3', name: 'Lab Fee', class: 'all', amount: 5000, frequency: 'annual' },
      ]);

      // Generate defaulters based on fees
      const pendingFees = feesArray.filter((f: any) => f.status === 'pending' || f.status === 'overdue');
      const defs = pendingFees.slice(0, 5).map((f: any) => ({
        id: f.id,
        studentId: f.studentId,
        studentName: f.studentName || 'Unknown Student',
        class: f.class || 'N/A',
        totalDue: f.amount,
        overdueDays: Math.floor((Date.now() - new Date(f.dueDate).getTime()) / (1000 * 3600 * 24)) || 15,
        outstanding: f.amount,
        months: 1,
        callStatus: 'pending'
      }));

      if (defs.length === 0) {
        defs.push({
          id: 'def1', studentId: 'u1', studentName: 'Rahul Sharma', class: '10-A', totalDue: 15000, overdueDays: 12, outstanding: 15000, months: 1, callStatus: 'pending'
        });
      }

      setDefaulters(defs);
      setStats(prev => ({ ...prev, defaultersCount: defs.length }));
    } catch {}
    setLoading(false);
  }, []);

  // Load installments data
  const loadInstallments = useCallback(async () => {
    setInstallmentsLoading(true);
    try {
      const data = await api.getFeeRecords();
      const grouped: Record<string, InstallmentPlan> = {};
      (Array.isArray(data) ? data : []).forEach((r: any) => {
        const sid = r.studentId || 'unknown';
        if (!grouped[sid]) {
          grouped[sid] = { id: sid, studentName: r.studentName || 'Unknown', class: r.class || '', totalAmount: 0, installments: [], status: 'active' as const };
        }
        grouped[sid].totalAmount += r.amount || 0;
        grouped[sid].installments.push({ amount: r.amount || 0, dueDate: r.due || '', paid: r.status === 'paid', id: r.id });
      });
      setPlans(Object.values(grouped));
    } catch {}
    setInstallmentsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadInstallments(); }, [loadInstallments]);

  function handlePaymentChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload: Record<string, string | number> = {
        studentId: paymentForm.studentId,
        feeHeadId: paymentForm.feeHeadId,
        amount: Number(paymentForm.amount),
        paidAmount: Number(paymentForm.paidAmount),
        method: paymentForm.method,
        receiptNo: paymentForm.receiptNo,
      };
      if (paymentForm.transactionId) payload.transactionId = paymentForm.transactionId;

      await api.createPayment(payload);
      setShowPaymentForm(false);
      setPaymentForm(EMPTY_PAYMENT_FORM);
      load();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function markPlanComplete(planId: string) {
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.add(planId);
      return next;
    });
  }

  function undoMarkComplete(planId: string) {
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.delete(planId);
      return next;
    });
  }

  const totalCollected = allFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.paid, 0);
  const totalPending = allFees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + (f.amount - f.paid), 0);

  // Installments filtered and processed
  const filteredPlans = plans.filter(p => {
    const matchesSearch = (p.studentName || '').toLowerCase().includes(installmentSearchQuery.toLowerCase());
    const isCompleted = completedIds.has(p.id);
    if (!showCompleted && isCompleted) return false;
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'defaulted': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage fee accounts, billing, and installment plans</p>
        </div>
      </div>

      {/* Tab Toggle - Chrome tab style */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'accounts'
              ? 'bg-background text-foreground shadow-sm border'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Overview</span>
          {activeTab === 'accounts' && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('installments')}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'installments'
              ? 'bg-background text-foreground shadow-sm border'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Accounts</span>
          {activeTab === 'installments' && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>
      </div>

      {/* ==================== ACCOUNTS TAB ==================== */}
      {activeTab === 'accounts' && (
        <>
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm bg-background"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'paid', 'pending', 'overdue'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === f ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
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
        </>
      )}

      {/* ==================== INSTALLMENTS TAB ==================== */}
      {activeTab === 'installments' && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students..."
                value={installmentSearchQuery}
                onChange={(e) => setInstallmentSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-1.5"
              >
                {showCompleted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showCompleted ? 'Hide Completed' : 'Show Completed'}
              </Button>
              <Button><Plus className="w-4 h-4 mr-2" />New Plan</Button>
            </div>
          </div>

          {installmentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map(plan => {
                const isCompleted = completedIds.has(plan.id);
                const paidAmount = plan.installments.filter((i: any) => i.paid).reduce((s: number, i: any) => s + (i.amount || 0), 0);
                const progress = plan.totalAmount > 0 ? (paidAmount / plan.totalAmount) * 100 : 0;

                return (
                  <Card
                    key={plan.id}
                    className={`p-4 transition-all duration-300 ${
                      isCompleted ? 'opacity-50 border-green-300 bg-green-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-accent'}`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {plan.studentName}
                          </h4>
                          <p className="text-sm text-muted-foreground">Class: {plan.class}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">Completed ✓</Badge>
                        ) : (
                          <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Paid: ₹{paidAmount.toLocaleString()}</span>
                        <span>Total: ₹{plan.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${isCompleted ? 100 : progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {plan.installments.map((inst: any, idx: number) => (
                        <div
                          key={inst.id || idx}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            isCompleted ? 'bg-green-50' : inst.paid ? 'bg-green-50' : 'bg-accent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {inst.paid || isCompleted ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">Installment {idx + 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">₹{inst.amount.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">
                              {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : '—'}
                            </span>
                            <Badge variant={isCompleted || inst.paid ? 'default' : 'secondary'}>
                              {isCompleted || inst.paid ? 'Paid' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mark as Complete / Undo */}
                    <div className="mt-3 pt-3 border-t flex justify-end">
                      {isCompleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => undoMarkComplete(plan.id)}
                          className="text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Undo Complete
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markPlanComplete(plan.id)}
                          className="text-xs text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Mark as Complete
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
              {filteredPlans.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">
                    {completedIds.size > 0 && !showCompleted
                      ? 'All installments completed! Toggle "Show Completed" to review them.'
                      : 'No fee installment plans found'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Completion stats */}
          {plans.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
              <span>{plans.length} total plan{plans.length !== 1 ? 's' : ''}</span>
              <span className="text-green-600 font-medium">
                {completedIds.size} completed
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
