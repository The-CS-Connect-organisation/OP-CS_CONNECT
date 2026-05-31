import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import {
  FileText, Plus, Search, Edit, Trash2, Download, Send,
  DollarSign, Calendar, CreditCard, Receipt, Percent,
  Clock, Ban, CheckCircle, AlertTriangle, X, TrendingUp,
} from 'lucide-react';

interface LineItem {
  description: string;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  studentName: string;
  studentId: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issuedDate: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  client: string;
  total: number;
  status: string;
  items: LineItem[];
}

interface Payment {
  id: string;
  studentName: string;
  amount: number;
  method: string;
  transactionId: string;
  date: string;
  status: string;
}

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  paidTo: string;
  date: string;
  status: string;
}

interface Concession {
  id: string;
  studentName: string;
  type: string;
  amount: number;
  reason: string;
  date: string;
}

interface LateFee {
  id: string;
  name: string;
  rate: number;
  gracePeriod: number;
  maxFee: number;
  active: boolean;
}

interface PaymentPlan {
  id: string;
  studentName: string;
  totalAmount: number;
  installments: number;
  installmentAmount: number;
  frequency: string;
  status: string;
}

export default function AdminInvoicing() {
  const [activeTab, setActiveTab] = useState('invoices');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoicing & Billing</h1>
        <p className="text-muted-foreground">Manage invoices, quotes, payments and more</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="concessions">Concessions</TabsTrigger>
          <TabsTrigger value="late-fees">Late Fees</TabsTrigger>
          <TabsTrigger value="payment-plans">Payment Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices"><InvoicesTab /></TabsContent>
        <TabsContent value="quotes"><QuotesTab /></TabsContent>
        <TabsContent value="payments"><PaymentsTab /></TabsContent>
        <TabsContent value="expenses"><ExpensesTab /></TabsContent>
        <TabsContent value="concessions"><ConcessionsTab /></TabsContent>
        <TabsContent value="late-fees"><LateFeesTab /></TabsContent>
        <TabsContent value="payment-plans"><PaymentPlansTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    studentId: '', studentName: '', dueDate: '', tax: 0,
    items: [{ description: '', amount: 0 }] as LineItem[],
  });
  const [paymentData, setPaymentData] = useState({ amount: 0, method: 'cash', date: new Date().toISOString().split('T')[0] });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getInvoices(); setInvoices(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load invoices'); }
    finally { setLoading(false); }
  };

  const getSubtotal = () => formData.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const getTaxAmount = () => { const sub = getSubtotal(); return sub * (Number(formData.tax) || 0) / 100; };
  const getTotal = () => { const sub = getSubtotal(); return sub + getTaxAmount(); };

  const handleCreate = async () => {
    try {
      setError('');
      const sub = getSubtotal();
      const taxAmount = getTaxAmount();
      await api.createInvoice({
        studentId: formData.studentId,
        studentName: formData.studentName,
        items: formData.items.filter(i => i.description),
        subtotal: sub,
        tax: taxAmount,
        total: sub + taxAmount,
        dueDate: formData.dueDate,
      });
      setShowCreate(false);
      setFormData({ studentId: '', studentName: '', dueDate: '', tax: 0, items: [{ description: '', amount: 0 }] });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    try { await api.deleteInvoice(id); load(); }
    catch (e: any) { setError(e.message); }
  };

  const handleRecordPayment = async (id: string) => {
    try {
      setError('');
      await api.recordInvoicePayment(id, paymentData);
      setShowRecordPayment(null);
      setPaymentData({ amount: 0, method: 'cash', date: new Date().toISOString().split('T')[0] });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleSend = async (id: string) => {
    try { await api.sendInvoice(id); load(); }
    catch (e: any) { setError(e.message); }
  };

  const filtered = invoices.filter(i =>
    (i.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.studentName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'paid': return <Badge variant="success">Paid</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'overdue': return <Badge variant="destructive">Overdue</Badge>;
      case 'cancelled': return <Badge variant="secondary">Cancelled</Badge>;
      default: return <Badge>{s}</Badge>;
    }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <Card className="p-3 bg-red-50 border-red-200 text-red-700 text-sm">{error}</Card>}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Create Invoice</Button>
      </div>

      <div className="space-y-3">
        {filtered.map(inv => (
          <Card key={inv.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">{inv.invoiceNumber}</h4>
                  {getStatusBadge(inv.status)}
                </div>
                <p className="text-sm text-muted-foreground">{inv.studentName}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Issued: {new Date(inv.issuedDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                </div>
                {inv.items.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {inv.items.map((item, idx) => (
                      <span key={idx}>{item.description} (${item.amount}){idx < inv.items.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="text-lg font-bold">${inv.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Subtotal: ${inv.subtotal} | Tax: ${inv.tax} | Total: ${inv.total}</p>
                <div className="flex gap-1 mt-1">
                  {inv.status === 'pending' || inv.status === 'overdue' ? (
                    <Button size="sm" variant="outline" onClick={() => { setShowRecordPayment(inv.id); setPaymentData(p => ({ ...p, amount: inv.total })); }}>
                      <DollarSign className="w-3 h-3 mr-1" />Pay
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" onClick={() => handleSend(inv.id)}><Send className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={api.downloadInvoicePdf(inv.id)} target="_blank" rel="noopener noreferrer"><Download className="w-3 h-3" /></a>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(inv.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No invoices found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Invoice" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Student ID</label>
              <Input value={formData.studentId} onChange={e => setFormData(f => ({ ...f, studentId: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Student Name</label>
              <Input value={formData.studentName} onChange={e => setFormData(f => ({ ...f, studentName: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Due Date</label>
            <Input type="date" value={formData.dueDate} onChange={e => setFormData(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Line Items</label>
            {formData.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mt-2">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={e => {
                    const items = [...formData.items];
                    items[idx] = { ...items[idx], description: e.target.value };
                    setFormData(f => ({ ...f, items }));
                  }}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={item.amount || ''}
                  onChange={e => {
                    const items = [...formData.items];
                    items[idx] = { ...items[idx], amount: Number(e.target.value) };
                    setFormData(f => ({ ...f, items }));
                  }}
                  className="w-32"
                />
                {idx > 0 && (
                  <Button variant="ghost" size="icon" onClick={() => setFormData(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setFormData(f => ({ ...f, items: [...f.items, { description: '', amount: 0 }] }))}>
              <Plus className="w-3 h-3 mr-1" />Add Item
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tax Rate (%)</label>
              <Input type="number" min="0" max="100" value={formData.tax || ''} onChange={e => setFormData(f => ({ ...f, tax: Number(e.target.value) }))} />
              {formData.tax > 0 && <p className="text-xs text-muted-foreground mt-1">Tax amount: ₹{getTaxAmount().toFixed(2)}</p>}
            </div>
            <div className="flex items-end">
              <div className="p-2 rounded bg-accent w-full text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold">${getTotal()}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Invoice</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!showRecordPayment} onClose={() => setShowRecordPayment(null)} title="Record Payment">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input type="number" value={paymentData.amount || ''} onChange={e => setPaymentData(p => ({ ...p, amount: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Method</label>
            <select value={paymentData.method} onChange={e => setPaymentData(p => ({ ...p, method: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank">Bank Transfer</option>
              <option value="mobile">Mobile Money</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <Input type="date" value={paymentData.date} onChange={e => setPaymentData(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowRecordPayment(null)}>Cancel</Button>
            <Button onClick={() => showRecordPayment && handleRecordPayment(showRecordPayment)}>Record Payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function QuotesTab() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ client: '', items: [{ description: '', amount: 0 }] as LineItem[] });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getQuotes(); setQuotes(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load quotes'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      const items = formData.items.filter(i => i.description);
      const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
      await api.createQuote({ client: formData.client, items, total });
      setShowCreate(false);
      setFormData({ client: '', items: [{ description: '', amount: 0 }] });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleConvert = async (id: string) => {
    try { setError(''); await api.convertQuoteToInvoice(id); load(); }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Create Quote</Button>
      </div>
      <div className="space-y-3">
        {quotes.map(q => (
          <Card key={q.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">{q.quoteNumber}</h4>
                  <Badge variant="outline">{q.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{q.client}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {q.items?.map((item, i) => (
                    <span key={i}>{item.description} (${item.amount}){i < q.items.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="text-lg font-bold">${q.total.toLocaleString()}</p>
                <Button size="sm" variant="outline" onClick={() => handleConvert(q.id)}>
                  <TrendingUp className="w-3 h-3 mr-1" />Convert to Invoice
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {quotes.length === 0 && <p className="text-center text-muted-foreground py-8">No quotes found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Quote">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Client</label>
            <Input value={formData.client} onChange={e => setFormData(f => ({ ...f, client: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Items</label>
            {formData.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mt-2">
                <Input placeholder="Description" value={item.description} onChange={e => { const items = [...formData.items]; items[idx] = { ...items[idx], description: e.target.value }; setFormData(f => ({ ...f, items })); }} className="flex-1" />
                <Input type="number" placeholder="Amount" value={item.amount || ''} onChange={e => { const items = [...formData.items]; items[idx] = { ...items[idx], amount: Number(e.target.value) }; setFormData(f => ({ ...f, items })); }} className="w-32" />
                {idx > 0 && <Button variant="ghost" size="icon" onClick={() => setFormData(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}><X className="w-4 h-4" /></Button>}
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setFormData(f => ({ ...f, items: [...f.items, { description: '', amount: 0 }] }))}><Plus className="w-3 h-3 mr-1" />Add Item</Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Quote</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ studentName: '', amount: 0, method: 'cash', transactionId: '', date: new Date().toISOString().split('T')[0] });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getPayments(); setPayments(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load payments'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createPayment(formData);
      setShowCreate(false);
      setFormData({ studentName: '', amount: 0, method: 'cash', transactionId: '', date: new Date().toISOString().split('T')[0] });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const filtered = payments.filter(p => {
    const m = (p.studentName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const f = !methodFilter || p.method === methodFilter;
    return m && f;
  });

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search payments..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="px-3 py-2 rounded-md border bg-background text-sm">
          <option value="">All Methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank">Bank Transfer</option>
          <option value="mobile">Mobile Money</option>
          <option value="cheque">Cheque</option>
        </select>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Record Payment</Button>
      </div>
      <div className="space-y-3">
        {filtered.map(p => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-500" />
                  <h4 className="font-semibold">{p.studentName}</h4>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{p.method}</span>
                  <span>•</span>
                  <span>ID: {p.transactionId}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">+${p.amount.toLocaleString()}</p>
                <Badge variant={p.status === 'completed' ? 'success' : 'warning'}>{p.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No payments found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Record Payment">
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
              <label className="text-sm font-medium">Method</label>
              <select value={formData.method} onChange={e => setFormData(f => ({ ...f, method: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile">Mobile Money</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Transaction ID</label>
              <Input value={formData.transactionId} onChange={e => setFormData(f => ({ ...f, transactionId: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Record Payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ExpensesTab() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ description: '', category: '', amount: 0, paidTo: '', date: new Date().toISOString().split('T')[0] });
  const [error, setError] = useState('');
  const userId = localStorage.getItem('eduvault-user-id') || '';

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getExpenses(); setExpenses(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load expenses'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingId) {
        await api.updateExpense(editingId, formData);
      } else {
        await api.createExpense(formData);
      }
      setShowCreate(false);
      setEditingId(null);
      setFormData({ description: '', category: '', amount: 0, paidTo: '', date: new Date().toISOString().split('T')[0] });
      load();
    } catch (e: any) { setError(e.message); }
  };

  const handleApprove = async (id: string) => {
    try { setError(''); await api.approveExpense(id, userId); load(); }
    catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => { setEditingId(null); setFormData({ description: '', category: '', amount: 0, paidTo: '', date: new Date().toISOString().split('T')[0] }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Expense
        </Button>
      </div>
      <div className="space-y-3">
        {expenses.map(e => (
          <Card key={e.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{e.description}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{e.category}</Badge>
                  <span>•</span>
                  <span>Paid to: {e.paidTo}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(e.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="text-lg font-bold text-red-500">-${e.amount.toLocaleString()}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={e.status === 'approved' ? 'success' : e.status === 'pending' ? 'warning' : 'secondary'}>{e.status}</Badge>
                  {e.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleApprove(e.id)}><CheckCircle className="w-3 h-3 mr-1" />Approve</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(e.id); setFormData({ description: e.description, category: e.category, amount: e.amount, paidTo: e.paidTo, date: e.date }); setShowCreate(true); }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {expenses.length === 0 && <p className="text-center text-muted-foreground py-8">No expenses found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editingId ? 'Edit Expense' : 'Add Expense'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select category</option>
                <option value="utilities">Utilities</option>
                <option value="supplies">Supplies</option>
                <option value="maintenance">Maintenance</option>
                <option value="salary">Salary</option>
                <option value="transport">Transport</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" value={formData.amount || ''} onChange={e => setFormData(f => ({ ...f, amount: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Paid To</label>
              <Input value={formData.paidTo} onChange={e => setFormData(f => ({ ...f, paidTo: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Expense</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ConcessionsTab() {
  const [concessions, setConcessions] = useState<Concession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ studentName: '', type: '', amount: 0, reason: '' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getConcessions(); setConcessions(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load concessions'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createConcession(formData);
      setShowCreate(false);
      setFormData({ studentName: '', type: '', amount: 0, reason: '' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Add Concession</Button>
      </div>
      <div className="space-y-3">
        {concessions.map(c => (
          <Card key={c.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">{c.studentName}</h4>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{c.type}</span>
                  <span> • {c.reason}</span>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(c.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-500">-${c.amount.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        ))}
        {concessions.length === 0 && <p className="text-center text-muted-foreground py-8">No concessions found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Concession">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Student Name</label>
            <Input value={formData.studentName} onChange={e => setFormData(f => ({ ...f, studentName: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select type</option>
                <option value="scholarship">Scholarship</option>
                <option value="sibling">Sibling Discount</option>
                <option value="financial">Financial Hardship</option>
                <option value="merit">Merit</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" value={formData.amount || ''} onChange={e => setFormData(f => ({ ...f, amount: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Reason</label>
            <Textarea value={formData.reason} onChange={e => setFormData(f => ({ ...f, reason: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Concession</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function LateFeesTab() {
  const [lateFees, setLateFees] = useState<LateFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', rate: 0, gracePeriod: 0, maxFee: 0 });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getLateFees(); setLateFees(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load late fee rules'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      await api.createLateFee(formData);
      setShowCreate(false);
      setFormData({ name: '', rate: 0, gracePeriod: 0, maxFee: 0 });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Add Late Fee Rule</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lateFees.map(lf => (
          <Card key={lf.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h4 className="font-semibold">{lf.name}</h4>
              </div>
              <Badge variant={lf.active ? 'success' : 'secondary'}>{lf.active ? 'Active' : 'Inactive'}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Rate</p>
                <p className="font-semibold">{lf.rate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Grace Period</p>
                <p className="font-semibold">{lf.gracePeriod} days</p>
              </div>
              <div>
                <p className="text-muted-foreground">Max Fee</p>
                <p className="font-semibold">${lf.maxFee}</p>
              </div>
            </div>
          </Card>
        ))}
        {lateFees.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-2">No late fee rules found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Late Fee Rule">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Rule Name</label>
            <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Rate (%)</label>
              <Input type="number" value={formData.rate || ''} onChange={e => setFormData(f => ({ ...f, rate: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Grace Period (days)</label>
              <Input type="number" value={formData.gracePeriod || ''} onChange={e => setFormData(f => ({ ...f, gracePeriod: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Max Fee ($)</label>
              <Input type="number" value={formData.maxFee || ''} onChange={e => setFormData(f => ({ ...f, maxFee: Number(e.target.value) }))} />
            </div>
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

function PaymentPlansTab() {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ studentName: '', totalAmount: 0, installments: 1, frequency: 'monthly' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); const d = await api.getPaymentPlans(); setPlans(Array.isArray(d) ? d : []); }
    catch { setError('Failed to load payment plans'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      const installmentAmount = formData.installments > 0 ? formData.totalAmount / formData.installments : formData.totalAmount;
      await api.createPaymentPlan({ ...formData, installmentAmount });
      setShowCreate(false);
      setFormData({ studentName: '', totalAmount: 0, installments: 1, frequency: 'monthly' });
      load();
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Create Payment Plan</Button>
      </div>
      <div className="space-y-3">
        {plans.map(pp => (
          <Card key={pp.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">{pp.studentName}</h4>
                  <Badge variant={pp.status === 'active' ? 'success' : pp.status === 'completed' ? 'info' : 'secondary'}>{pp.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span>{pp.installments} installments of ${pp.installmentAmount}</span>
                  <span>•</span>
                  <span>{pp.frequency}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${pp.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">${pp.installmentAmount}/{pp.frequency}</p>
              </div>
            </div>
          </Card>
        ))}
        {plans.length === 0 && <p className="text-center text-muted-foreground py-8">No payment plans found</p>}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Payment Plan">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Student Name</label>
            <Input value={formData.studentName} onChange={e => setFormData(f => ({ ...f, studentName: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Total Amount</label>
              <Input type="number" value={formData.totalAmount || ''} onChange={e => setFormData(f => ({ ...f, totalAmount: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Installments</label>
              <Input type="number" value={formData.installments || ''} onChange={e => setFormData(f => ({ ...f, installments: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select value={formData.frequency} onChange={e => setFormData(f => ({ ...f, frequency: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
          {formData.installments > 0 && (
            <div className="p-3 bg-accent rounded text-sm">
              Installment amount: <strong>${(formData.totalAmount / formData.installments).toFixed(2)}</strong> per {formData.frequency}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Plan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
