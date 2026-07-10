import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../../components/ui/Dialog';
import { formatCurrency } from '../../lib/utils';
import { Wallet, DollarSign, TrendingUp, TrendingDown, BarChart3, Plus, Search, Calendar, ArrowUpRight, ArrowDownRight, PiggyBank, Receipt, CreditCard } from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  paymentMethod: string;
  reference: string;
  status: string;
}

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  fiscalYear: string;
}

interface MonthlyTrend {
  month: string;
  revenue: number;
  expenses: number;
}

const categoryColors: Record<string, string> = {
  tuition: 'bg-blue-100 text-blue-700',
  fees: 'bg-green-100 text-green-700',
  salary: 'bg-orange-100 text-orange-700',
  utilities: 'bg-yellow-100 text-yellow-700',
  supplies: 'bg-purple-100 text-purple-700',
  maintenance: 'bg-red-100 text-red-700',
  transport: 'bg-cyan-100 text-cyan-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function ManagerFinance() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState({
    revenue: 0, expenses: 0, profit: 0,
    feeCollection: { collected: 0, pending: 0 },
    payroll: 0,
    monthlyTrend: [] as MonthlyTrend[],
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    description: '', amount: 0, type: 'income' as 'income' | 'expense',
    category: '', date: '', paymentMethod: 'cash', reference: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [finData, payData, expData] = await Promise.all([
        api.getManagerFinance().catch(() => null),
        api.getPayments().catch(() => []),
        api.getExpenses().catch(() => []),
      ]);
      if (finData) setStats(prev => ({ ...prev, ...finData }));

      const allTxns: Transaction[] = [
        ...(Array.isArray(payData) ? payData.map((p: any) => ({
          id: p.id,
          description: `Payment from ${p.studentName || p.studentId}`,
          amount: p.amount || 0,
          type: 'income' as const,
          category: 'fees',
          date: p.date || p.paidAt || '',
          paymentMethod: p.method || 'cash',
          reference: p.reference || '',
          status: 'completed',
        })) : []),
        ...(Array.isArray(expData) ? expData.map((e: any) => ({
          id: e.id,
          description: e.description,
          amount: e.amount || 0,
          type: 'expense' as const,
          category: e.category || 'other',
          date: e.date || '',
          paymentMethod: 'cash',
          reference: '',
          status: e.status || 'pending',
        })) : []),
      ];
      setTransactions(allTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      const budgetData = await api.getBudgets().catch(() => []);
      setBudgets(Array.isArray(budgetData) ? budgetData : []);
    } catch {}
    setLoading(false);
  };

  const handleCreateTransaction = async () => {
    try {
      if (transactionForm.type === 'income') {
        await api.createPayment({
          studentId: 'manual',
          amount: transactionForm.amount,
          method: transactionForm.paymentMethod,
          date: transactionForm.date,
          reference: transactionForm.reference,
        });
      } else {
        await api.createExpense({
          description: transactionForm.description,
          amount: transactionForm.amount,
          category: transactionForm.category,
          date: transactionForm.date,
        });
      }
      setShowTransactionForm(false);
      setTransactionForm({ description: '', amount: 0, type: 'income', category: '', date: '', paymentMethod: 'cash', reference: '' });
      loadData();
    } catch (err) {
      console.error('[ManagerFinance] Failed to create transaction:', err);
    }
  };

  const filteredTransactions = transactions.filter(t =>
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  if (loading) return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Finance</h1><p className="text-muted-foreground">Financial overview & transactions</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance</h1>
        <p className="text-muted-foreground">Financial overview, transactions & budgets</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-2" />Overview</TabsTrigger>
          <TabsTrigger value="transactions"><Receipt className="w-4 h-4 mr-2" />Transactions</TabsTrigger>
          <TabsTrigger value="budgets"><PiggyBank className="w-4 h-4 mr-2" />Budgets</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 card-hover">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50"><DollarSign className="w-6 h-6 text-green-600" /></div>
                <div><p className="text-sm text-muted-foreground">Revenue</p><p className="text-2xl font-bold stat-value">{formatCurrency(stats.revenue)}</p></div>
              </div>
            </Card>
            <Card className="p-4 card-hover">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50"><TrendingDown className="w-6 h-6 text-red-600" /></div>
                <div><p className="text-sm text-muted-foreground">Expenses</p><p className="text-2xl font-bold stat-value">{formatCurrency(stats.expenses)}</p></div>
              </div>
            </Card>
            <Card className="p-4 card-hover">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stats.profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}><Wallet className={`w-6 h-6 ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`} /></div>
                <div><p className="text-sm text-muted-foreground">Profit</p><p className="text-2xl font-bold stat-value">{formatCurrency(stats.profit)}</p></div>
              </div>
            </Card>
            <Card className="p-4 card-hover">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50"><BarChart3 className="w-6 h-6 text-orange-600" /></div>
                <div><p className="text-sm text-muted-foreground">Payroll</p><p className="text-2xl font-bold stat-value">{formatCurrency(stats.payroll)}</p></div>
              </div>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Monthly Trend</h3>
            {stats.monthlyTrend.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <div className="space-y-3">
                {stats.monthlyTrend.map(month => (
                  <div key={month.month} className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{month.month}</span>
                      <span className={`text-sm font-medium ${month.revenue - month.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(month.revenue - month.expenses)}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1"><span>Revenue</span><span className="text-green-600">{formatCurrency(month.revenue)}</span></div>
                        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.revenue > 0 ? (month.revenue / stats.revenue) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1"><span>Expenses</span><span className="text-red-600">{formatCurrency(month.expenses)}</span></div>
                        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${stats.expenses > 0 ? (month.expenses / stats.expenses) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Fee Collection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-orange-500" />Fee Collection</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Collected</span>
                  <span className="font-bold text-lg text-green-600">{formatCurrency(stats.feeCollection?.collected || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-bold text-lg text-orange-600">{formatCurrency(stats.feeCollection?.pending || 0)}</span>
                </div>
                <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{
                    width: `${(stats.feeCollection?.collected || 0) + (stats.feeCollection?.pending || 0) > 0
                      ? ((stats.feeCollection?.collected || 0) / ((stats.feeCollection?.collected || 0) + (stats.feeCollection?.pending || 0))) * 100
                      : 0}%`
                  }} />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange-500" />Cash Flow Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Total Income</span>
                  <span className="font-bold text-green-600">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Total Expenses</span>
                  <span className="font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                  <span className="text-sm font-medium">Net Cash Flow</span>
                  <span className={`font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalIncome - totalExpenses)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search transactions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Transaction</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record Transaction</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium">Type</label>
                      <select value={transactionForm.type} onChange={e => setTransactionForm({ ...transactionForm, type: e.target.value as 'income' | 'expense' })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="income">Income</option><option value="expense">Expense</option>
                      </select>
                    </div>
                    <div><label className="text-sm font-medium">Category</label>
                      <select value={transactionForm.category} onChange={e => setTransactionForm({ ...transactionForm, category: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select</option>
                        <option value="tuition">Tuition</option><option value="fees">Fees</option>
                        <option value="salary">Salary</option><option value="utilities">Utilities</option>
                        <option value="supplies">Supplies</option><option value="maintenance">Maintenance</option>
                        <option value="transport">Transport</option><option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div><label className="text-sm font-medium">Description</label><Input value={transactionForm.description} onChange={e => setTransactionForm({ ...transactionForm, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium">Amount</label><Input type="number" value={transactionForm.amount} onChange={e => setTransactionForm({ ...transactionForm, amount: Number(e.target.value) })} /></div>
                    <div><label className="text-sm font-medium">Date</label><Input type="date" value={transactionForm.date} onChange={e => setTransactionForm({ ...transactionForm, date: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium">Payment Method</label>
                      <select value={transactionForm.paymentMethod} onChange={e => setTransactionForm({ ...transactionForm, paymentMethod: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="cash">Cash</option><option value="card">Card</option>
                        <option value="transfer">Transfer</option><option value="cheque">Cheque</option>
                      </select>
                    </div>
                    <div><label className="text-sm font-medium">Reference</label><Input value={transactionForm.reference} onChange={e => setTransactionForm({ ...transactionForm, reference: e.target.value })} /></div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleCreateTransaction}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary chips */}
          <div className="flex gap-3 mb-4">
            <div className="px-3 py-1.5 bg-green-50 rounded-full text-sm font-medium text-green-700 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> Income: {formatCurrency(totalIncome)}
            </div>
            <div className="px-3 py-1.5 bg-red-50 rounded-full text-sm font-medium text-red-700 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" /> Expenses: {formatCurrency(totalExpenses)}
            </div>
          </div>

          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions found</p>
            ) : (
              filteredTransactions.map(t => (
                <div key={t.id} className="bg-card border rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                      {t.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <ArrowDownRight className="w-4 h-4 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryColors[t.category] || 'bg-gray-100 text-gray-700'}`}>{t.category}</span>
                        {t.date && <span>{new Date(t.date).toLocaleDateString()}</span>}
                        <span className="capitalize">{t.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <Badge variant={t.status === 'completed' || t.status === 'approved' ? 'success' : t.status === 'pending' ? 'warning' : 'secondary'} className="text-[10px]">{t.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                <p>No budgets configured yet.</p>
              </div>
            ) : (
              budgets.map(b => {
                const pct = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0;
                return (
                  <Card key={b.id} className="p-4 card-hover">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="capitalize">{b.category}</Badge>
                      <span className="text-xs text-muted-foreground">{b.fiscalYear}</span>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(b.allocated)}</p>
                    <p className="text-xs text-muted-foreground mb-2">Allocated Budget</p>
                    <div className="w-full h-2 bg-accent rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 75 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Spent: {formatCurrency(b.spent)}</span>
                      <span className={b.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(b.remaining)} left</span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
