import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import {
  BookOpen, Plus, Search, TrendingUp, TrendingDown,
  DollarSign, BarChart3, Repeat, RefreshCw, Wrench,
  PieChart, CheckCircle, X, Edit, Users, CreditCard,
  Package, Calendar,
} from 'lucide-react';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  normalBalance: 'debit' | 'credit';
  children?: Account[];
}

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debits: { account: string; amount: number }[];
  credits: { account: string; amount: number }[];
  totalDebit: number;
  totalCredit: number;
}

interface Budget {
  id: string;
  name: string;
  category: string;
  allocated: number;
  spent: number;
  fiscalYear: string;
  status: string;
}

interface FinancialAid {
  id: string;
  studentName: string;
  amount: number;
  type: string;
  status: string;
  date: string;
}

interface ProcurementOrder {
  id: string;
  vendor: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: string;
  date: string;
}

interface RecurringInvoice {
  id: string;
  name: string;
  frequency: string;
  template: string;
  target: string;
  amount: number;
  nextDate: string;
  active: boolean;
}

interface FeeAutomation {
  id: string;
  name: string;
  conditions: string;
  amount: number;
  applyTo: string;
  active: boolean;
}

interface SpendingData {
  category: string;
  amount: number;
  percentage: number;
}

export default function AdminFinanceFull() {
  const [activeTab, setActiveTab] = useState('chart-of-accounts');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Full Finance</h1>
        <p className="text-muted-foreground">Chart of accounts, ledgers, budgets and analytics</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="chart-of-accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="general-ledger">General Ledger</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="financial-aid">Financial Aid</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="recurring-invoices">Recurring Invoices</TabsTrigger>
          <TabsTrigger value="fee-automation">Fee Automation</TabsTrigger>
          <TabsTrigger value="spending-analytics">Spending Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="chart-of-accounts"><ChartOfAccountsTab /></TabsContent>
        <TabsContent value="general-ledger"><GeneralLedgerTab /></TabsContent>
        <TabsContent value="budgets"><BudgetsTab /></TabsContent>
        <TabsContent value="financial-aid"><FinancialAidTab /></TabsContent>
        <TabsContent value="procurement"><ProcurementTab /></TabsContent>
        <TabsContent value="recurring-invoices"><RecurringInvoicesTab /></TabsContent>
        <TabsContent value="fee-automation"><FeeAutomationTab /></TabsContent>
        <TabsContent value="spending-analytics"><SpendingAnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ChartOfAccountsTab() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ code: '', name: '', type: 'asset' as Account['type'], normalBalance: 'debit' as Account['normalBalance'] });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getChartOfAccounts(); setAccounts(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load chart of accounts'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createAccount(formData);
      setShowCreate(false);
      setFormData({ code: '', name: '', type: 'asset', normalBalance: 'debit' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const renderAccountTree = (items: Account[], depth = 0) =>
    items.map(acc => (
      <div key={acc.id}>
        <div className="flex items-center justify-between py-2 px-3 hover:bg-accent rounded" style={{ marginLeft: depth * 20 }}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-500" />
            <span className="font-mono text-xs text-muted-foreground">{acc.code}</span>
            <span className="font-medium">{acc.name}</span>
            <Badge variant="outline">{acc.type}</Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            <Badge variant="secondary">{acc.normalBalance}</Badge>
          </div>
        </div>
        {acc.children && renderAccountTree(acc.children, depth + 1)}
      </div>
    ));

  const typeColors: Record<string, string> = {
    asset: 'bg-blue-100 text-blue-700',
    liability: 'bg-orange-100 text-orange-700',
    equity: 'bg-green-100 text-green-700',
    revenue: 'bg-purple-100 text-purple-700',
    expense: 'bg-red-100 text-red-700',
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{accounts.length} accounts</p>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Create Account</Button>
      </div>
      <Card className="divide-y">
        {accounts.length > 0 ? renderAccountTree(accounts) : <p className="p-4 text-center text-muted-foreground">No accounts found</p>}
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Account">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Code</label>
              <Input value={formData.code} onChange={e => setFormData(f => ({ ...f, code: e.target.value }))} placeholder="e.g. 1000" />
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value as Account['type'] }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Normal Balance</label>
              <select value={formData.normalBalance} onChange={e => setFormData(f => ({ ...f, normalBalance: e.target.value as Account['normalBalance'] }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Account</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function GeneralLedgerTab() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    debits: [{ account: '', amount: 0 }],
    credits: [{ account: '', amount: 0 }],
  });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getJournalEntries(); setEntries(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load journal entries'); }
    finally { setLoading(false); }
  };

  const totalDebit = formData.debits.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const totalCredit = formData.credits.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  const handleCreate = async () => {
    try {
      setError('');
      if (totalDebit !== totalCredit) { setError('Debits must equal credits'); return; }
      await api.createJournalEntry({
        ...formData,
        debits: formData.debits.filter(d => d.account && d.amount > 0),
        credits: formData.credits.filter(c => c.account && c.amount > 0),
        totalDebit,
        totalCredit,
      });
      setShowCreate(false);
      setFormData({ date: new Date().toISOString().split('T')[0], description: '', debits: [{ account: '', amount: 0 }], credits: [{ account: '', amount: 0 }] });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Create Journal Entry</Button>
      </div>
      <div className="space-y-3">
        {entries.map(entry => (
          <Card key={entry.id} className="p-4">
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{entry.description}</h4>
                <span className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-600 mb-1">Debits</p>
                {entry.debits.map((d, i) => (
                  <div key={i} className="flex justify-between text-muted-foreground">
                    <span>{d.account}</span>
                    <span>${d.amount}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-medium text-red-600 mb-1">Credits</p>
                {entry.credits.map((c, i) => (
                  <div key={i} className="flex justify-between text-muted-foreground">
                    <span>{c.account}</span>
                    <span>${c.amount}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
              <span>Total Debit: ${entry.totalDebit}</span>
              <span>Total Credit: ${entry.totalCredit}</span>
            </div>
          </Card>
        ))}
        {entries.length === 0 && <p className="text-center text-muted-foreground py-8">No journal entries found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Journal Entry" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2"><TrendingDown className="w-4 h-4 text-green-500" />Debits</label>
            {formData.debits.map((d, idx) => (
              <div key={idx} className="flex gap-2 mt-2">
                <Input placeholder="Account" value={d.account} onChange={e => { const arr = [...formData.debits]; arr[idx] = { ...arr[idx], account: e.target.value }; setFormData(f => ({ ...f, debits: arr })); }} className="flex-1" />
                <Input type="number" placeholder="Amount" value={d.amount || ''} onChange={e => { const arr = [...formData.debits]; arr[idx] = { ...arr[idx], amount: Number(e.target.value) }; setFormData(f => ({ ...f, debits: arr })); }} className="w-32" />
                {idx > 0 && <Button variant="ghost" size="icon" onClick={() => setFormData(f => ({ ...f, debits: f.debits.filter((_, i) => i !== idx) }))}><X className="w-4 h-4" /></Button>}
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setFormData(f => ({ ...f, debits: [...f.debits, { account: '', amount: 0 }] }))}><Plus className="w-3 h-3 mr-1" />Add Debit</Button>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4 text-red-500" />Credits</label>
            {formData.credits.map((c, idx) => (
              <div key={idx} className="flex gap-2 mt-2">
                <Input placeholder="Account" value={c.account} onChange={e => { const arr = [...formData.credits]; arr[idx] = { ...arr[idx], account: e.target.value }; setFormData(f => ({ ...f, credits: arr })); }} className="flex-1" />
                <Input type="number" placeholder="Amount" value={c.amount || ''} onChange={e => { const arr = [...formData.credits]; arr[idx] = { ...arr[idx], amount: Number(e.target.value) }; setFormData(f => ({ ...f, credits: arr })); }} className="w-32" />
                {idx > 0 && <Button variant="ghost" size="icon" onClick={() => setFormData(f => ({ ...f, credits: f.credits.filter((_, i) => i !== idx) }))}><X className="w-4 h-4" /></Button>}
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setFormData(f => ({ ...f, credits: [...f.credits, { account: '', amount: 0 }] }))}><Plus className="w-3 h-3 mr-1" />Add Credit</Button>
          </div>

          <div className="flex justify-between text-sm p-2 bg-accent rounded">
            <span>Total Debits: <strong>${totalDebit}</strong></span>
            <span>Total Credits: <strong>${totalCredit}</strong></span>
            <span className={totalDebit === totalCredit ? 'text-green-600' : 'text-red-600'}>
              {totalDebit === totalCredit ? 'Balanced' : `Difference: $${Math.abs(totalDebit - totalCredit)}`}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Entry</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function BudgetsTab() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', category: '', allocated: 0, spent: 0, fiscalYear: new Date().getFullYear().toString() });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getBudgets(); setBudgets(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load budgets'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) {
        await api.updateBudget(editingId, formData);
      } else {
        await api.createBudget(formData);
      }
      setShowCreate(false);
      setEditingId(null);
      setFormData({ name: '', category: '', allocated: 0, spent: 0, fiscalYear: new Date().getFullYear().toString() });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', category: '', allocated: 0, spent: 0, fiscalYear: new Date().getFullYear().toString() }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Create Budget
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map(b => {
          const pct = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0;
          return (
            <Card key={b.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{b.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{b.category}</Badge>
                    <span>FY {b.fiscalYear}</span>
                  </div>
                </div>
                <Badge variant={b.status === 'active' ? 'success' : 'secondary'}>{b.status}</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Allocated: <strong>${b.allocated.toLocaleString()}</strong></span>
                  <span className="text-muted-foreground">Spent: <strong>${b.spent.toLocaleString()}</strong></span>
                </div>
                <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{pct}% used</span>
                  <span className="text-muted-foreground">Remaining: ${(b.allocated - b.spent).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(b.id); setFormData({ name: b.name, category: b.category, allocated: b.allocated, spent: b.spent, fiscalYear: b.fiscalYear }); setShowCreate(true); }}>
                  <Edit className="w-3 h-3 mr-1" />Edit
                </Button>
              </div>
            </Card>
          );
        })}
        {budgets.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No budgets found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Budget' : 'Create Budget'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select category</option>
                <option value="operations">Operations</option>
                <option value="academics">Academics</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="technology">Technology</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Allocated ($)</label>
              <Input type="number" value={formData.allocated || ''} onChange={e => setFormData(f => ({ ...f, allocated: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Spent ($)</label>
              <Input type="number" value={formData.spent || ''} onChange={e => setFormData(f => ({ ...f, spent: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Fiscal Year</label>
              <Input value={formData.fiscalYear} onChange={e => setFormData(f => ({ ...f, fiscalYear: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Create'} Budget</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FinancialAidTab() {
  const [aids, setAids] = useState<FinancialAid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ studentName: '', amount: 0, type: 'scholarship' });
  const [error, setError] = useState('');
  const userId = localStorage.getItem('eduvault-user-id') || '';

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getFinancialAid(); setAids(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load financial aid applications'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createFinancialAid(formData);
      setShowCreate(false);
      setFormData({ studentName: '', amount: 0, type: 'scholarship' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleApprove = async (id: string) => {
    try { setError(''); await api.approveFinancialAid(id, userId); load(); }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Add Application</Button>
      </div>
      <div className="space-y-3">
        {aids.map(a => (
          <Card key={a.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">{a.studentName}</h4>
                  <Badge variant="outline">{a.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{new Date(a.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="text-lg font-bold">${a.amount.toLocaleString()}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={a.status === 'approved' ? 'success' : a.status === 'pending' ? 'warning' : 'destructive'}>{a.status}</Badge>
                  {a.status === 'pending' && (
                    <Button size="sm" variant="outline" onClick={() => handleApprove(a.id)}>
                      <CheckCircle className="w-3 h-3 mr-1" />Approve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {aids.length === 0 && <p className="text-center text-muted-foreground py-8">No financial aid applications found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Financial Aid Application">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Student Name</label>
            <Input value={formData.studentName} onChange={e => setFormData(f => ({ ...f, studentName: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" value={formData.amount || ''} onChange={e => setFormData(f => ({ ...f, amount: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="scholarship">Scholarship</option>
                <option value="grant">Grant</option>
                <option value="bursary">Bursary</option>
                <option value="loan">Loan</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Submit Application</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ProcurementTab() {
  const [orders, setOrders] = useState<ProcurementOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ vendor: '', items: [{ name: '', qty: 1, price: 0 }] });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getProcurementOrders(); setOrders(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load procurement orders'); }
    finally { setLoading(false); }
  };

  const getTotal = () => formData.items.reduce((s, i) => s + ((Number(i.qty) || 0) * (Number(i.price) || 0)), 0);

  const handleCreate = async () => {
    try {
      setError('');
      const items = formData.items.filter(i => i.name);
      await api.createProcurementOrder({ ...formData, items, total: getTotal() });
      setShowCreate(false);
      setFormData({ vendor: '', items: [{ name: '', qty: 1, price: 0 }] });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />New Order</Button>
      </div>
      <div className="space-y-3">
        {orders.map(o => (
          <Card key={o.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">{o.vendor}</h4>
                  <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'pending' ? 'warning' : o.status === 'approved' ? 'info' : 'secondary'}>{o.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {o.items.map((item, i) => (
                    <span key={i}>{item.name} x{item.qty} (${item.price}){i < o.items.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{new Date(o.date).toLocaleDateString()}</p>
              </div>
              <p className="text-lg font-bold">${o.total.toLocaleString()}</p>
            </div>
          </Card>
        ))}
        {orders.length === 0 && <p className="text-center text-muted-foreground py-8">No procurement orders found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Procurement Order">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Vendor</label>
            <Input value={formData.vendor} onChange={e => setFormData(f => ({ ...f, vendor: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Items</label>
            {formData.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mt-2">
                <Input placeholder="Item name" value={item.name} onChange={e => { const items = [...formData.items]; items[idx] = { ...items[idx], name: e.target.value }; setFormData(f => ({ ...f, items })); }} className="flex-1" />
                <Input type="number" placeholder="Qty" value={item.qty || ''} onChange={e => { const items = [...formData.items]; items[idx] = { ...items[idx], qty: Number(e.target.value) }; setFormData(f => ({ ...f, items })); }} className="w-20" />
                <Input type="number" placeholder="Price" value={item.price || ''} onChange={e => { const items = [...formData.items]; items[idx] = { ...items[idx], price: Number(e.target.value) }; setFormData(f => ({ ...f, items })); }} className="w-24" />
                <span className="flex items-center text-sm font-medium w-20">${(item.qty * item.price)}</span>
                {idx > 0 && <Button variant="ghost" size="icon" onClick={() => setFormData(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}><X className="w-4 h-4" /></Button>}
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setFormData(f => ({ ...f, items: [...f.items, { name: '', qty: 1, price: 0 }] }))}><Plus className="w-3 h-3 mr-1" />Add Item</Button>
          </div>
          <div className="flex justify-between text-sm p-2 bg-accent rounded">
            <span>Total</span>
            <strong>${getTotal()}</strong>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Order</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function RecurringInvoicesTab() {
  const [invoices, setInvoices] = useState<RecurringInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', frequency: 'monthly', template: '', target: '', amount: 0 });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getRecurringInvoices(); setInvoices(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load recurring invoices'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createRecurringInvoice(formData);
      setShowCreate(false);
      setFormData({ name: '', frequency: 'monthly', template: '', target: '', amount: 0 });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Add Recurring Invoice</Button>
      </div>
      <div className="space-y-3">
        {invoices.map(ri => (
          <Card key={ri.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">{ri.name}</h4>
                  <Badge variant={ri.active ? 'success' : 'secondary'}>{ri.active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span>Every {ri.frequency}</span>
                  <span>•</span>
                  <span>Template: {ri.template}</span>
                  <span>•</span>
                  <span>Target: {ri.target}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Next: {ri.nextDate ? new Date(ri.nextDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              <p className="text-lg font-bold">${ri.amount.toLocaleString()}</p>
            </div>
          </Card>
        ))}
        {invoices.length === 0 && <p className="text-center text-muted-foreground py-8">No recurring invoices configured</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Recurring Invoice">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select value={formData.frequency} onChange={e => setFormData(f => ({ ...f, frequency: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Template</label>
              <Input value={formData.template} onChange={e => setFormData(f => ({ ...f, template: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Target</label>
              <Input value={formData.target} onChange={e => setFormData(f => ({ ...f, target: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input type="number" value={formData.amount || ''} onChange={e => setFormData(f => ({ ...f, amount: Number(e.target.value) }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Recurring Invoice</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FeeAutomationTab() {
  const [rules, setRules] = useState<FeeAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', conditions: '', amount: 0, applyTo: 'all' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getFeeAutomation(); setRules(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load fee automation rules'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createFeeAutomation(formData);
      setShowCreate(false);
      setFormData({ name: '', conditions: '', amount: 0, applyTo: 'all' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Add Rule</Button>
      </div>
      <div className="space-y-3">
        {rules.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">{r.name}</h4>
                  <Badge variant={r.active ? 'success' : 'secondary'}>{r.active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>Conditions: {r.conditions}</span>
                  <span>•</span>
                  <span>Apply to: {r.applyTo}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${r.amount}</p>
              </div>
            </div>
          </Card>
        ))}
        {rules.length === 0 && <p className="text-center text-muted-foreground py-8">No fee automation rules found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Fee Automation Rule">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Rule Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" value={formData.amount || ''} onChange={e => setFormData(f => ({ ...f, amount: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Conditions</label>
            <Input value={formData.conditions} onChange={e => setFormData(f => ({ ...f, conditions: e.target.value }))} placeholder="e.g. overdue > 30 days" />
          </div>
          <div>
            <label className="text-sm font-medium">Apply To</label>
            <select value={formData.applyTo} onChange={e => setFormData(f => ({ ...f, applyTo: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="all">All Students</option>
              <option value="class">Specific Class</option>
              <option value="individual">Individual</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Rule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SpendingAnalyticsTab() {
  const [data, setData] = useState<SpendingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [month]);

  const load = async () => {
    try { setLoading(true); const d = await api.getSpendingAnalytics(month); setData(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load spending analytics'); }
    finally { setLoading(false); }
  };

  const amounts = data.map(d => Number(d.amount)).filter(n => !isNaN(n));
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 1;

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex items-center gap-4">
        <PieChart className="w-5 h-5 text-orange-500" />
        <h3 className="font-semibold">Spending by Category</h3>
        <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-48 ml-auto" />
      </div>

      <Card className="p-6">
        {data.length > 0 ? (
          <div className="space-y-4">
            {data.map(item => (
              <div key={item.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{item.category}</span>
                  <div className="text-right">
                    <span className="font-semibold">${item.amount.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-2">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-4 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all"
                    style={{ width: `${(item.amount / maxAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-4 border-t flex justify-between text-sm text-muted-foreground">
              <span>Total: <strong>${data.reduce((s, d) => s + d.amount, 0).toLocaleString()}</strong></span>
              <span>Month: {month}</span>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No spending data available for this month</p>
        )}
      </Card>
    </div>
  );
}
