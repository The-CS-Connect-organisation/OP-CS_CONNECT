import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../../components/ui/Dialog';
import { FileText, Plus, Search, DollarSign, Download, ArrowRight, CheckCircle, XCircle, Edit, Trash2, Receipt, CreditCard, TrendingDown, Percent, Clock } from 'lucide-react';

interface Invoice {
  id: string; invoiceNumber: string; studentId: string; studentName?: string; total: number; status: string; dueDate: string; items?: any[];
}
interface Quote {
  id: string; quoteNumber: string; studentId: string; studentName?: string; total: number; status: string; validUntil: string;
}
interface Payment {
  id: string; studentId: string; studentName?: string; amount: number; method: string; date: string; reference: string;
}
interface Expense {
  id: string; description: string; amount: number; category: string; date: string; status: string; approvedBy?: string;
}
interface Concession {
  id: string; studentId: string; studentName?: string; type: string; percentage: number; amount: number; reason: string;
}
interface LateFee {
  id: string; name: string; type: string; value: number; gracePeriod: number; maxFee: number;
}

const statusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', overdue: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-700', cancelled: 'bg-red-100 text-red-700', approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function ManagerInvoicing() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices');
  const [searchQuery, setSearchQuery] = useState('');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [concessions, setConcessions] = useState<Concession[]>([]);
  const [lateFees, setLateFees] = useState<LateFee[]>([]);

  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const [paymentDialogId, setPaymentDialogId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [invoiceForm, setInvoiceForm] = useState({ studentId: '', total: 0, dueDate: '', items: '' });
  const [quoteForm, setQuoteForm] = useState({ studentId: '', total: 0, validUntil: '', items: '' });
  const [paymentForm, setPaymentForm] = useState({ studentId: '', amount: 0, method: 'cash', date: '', reference: '' });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: 0, category: '', date: '' });
  const [concessionForm, setConcessionForm] = useState({ studentId: '', type: '', percentage: 0, amount: 0, reason: '' });
  const [lateFeeForm, setLateFeeForm] = useState({ name: '', type: 'fixed', value: 0, gracePeriod: 0, maxFee: 0 });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [inv, qt, pmt, exp, conc, lf] = await Promise.all([
        api.getInvoices(), api.getQuotes(), api.getPayments(), api.getExpenses(), api.getConcessions(), api.getLateFees(),
      ]);
      setInvoices(Array.isArray(inv) ? inv : []);
      setQuotes(Array.isArray(qt) ? qt : []);
      setPayments(Array.isArray(pmt) ? pmt : []);
      setExpenses(Array.isArray(exp) ? exp : []);
      setConcessions(Array.isArray(conc) ? conc : []);
      setLateFees(Array.isArray(lf) ? lf : []);
    } catch (err) { console.error('[ManagerInvoicing] Failed to load data:', err); } finally { setLoading(false); }
  };

  const createInvoice = async () => {
    try {
      await api.createInvoice({ ...invoiceForm, items: invoiceForm.items ? JSON.parse(invoiceForm.items) : [] });
      await loadAll(); setDialogOpen(null);
      setInvoiceForm({ studentId: '', total: 0, dueDate: '', items: '' });
    } catch (err) { console.error('[ManagerInvoicing] Failed to create invoice:', err); }
  };
  const deleteInvoice = async (id: string) => {
    try { await api.deleteInvoice(id); setInvoices(prev => prev.filter(i => i.id !== id)); } catch (err) { console.error('[ManagerInvoicing] Failed to delete invoice:', err); }
  };
  const recordPayment = async (id: string) => {
    try { await api.recordInvoicePayment(id, { amount: paymentAmount }); setPaymentDialogId(null); setPaymentAmount(0); await loadAll(); } catch (err) { console.error('[ManagerInvoicing] Failed to record payment:', err); }
  };
  const createQuote = async () => {
    try {
      await api.createQuote({ ...quoteForm, items: quoteForm.items ? JSON.parse(quoteForm.items) : [] });
      await loadAll(); setDialogOpen(null);
      setQuoteForm({ studentId: '', total: 0, validUntil: '', items: '' });
    } catch (err) { console.error('[ManagerInvoicing] Failed to create quote:', err); }
  };
  const convertQuote = async (id: string) => {
    try { await api.convertQuoteToInvoice(id); await loadAll(); } catch (err) { console.error('[ManagerInvoicing] Failed to convert quote:', err); }
  };
  const createPayment = async () => {
    try { await api.createPayment(paymentForm); await loadAll(); setDialogOpen(null); setPaymentForm({ studentId: '', amount: 0, method: 'cash', date: '', reference: '' }); } catch (err) { console.error('[ManagerInvoicing] Failed to create payment:', err); }
  };
  const createExpense = async () => {
    try { await api.createExpense(expenseForm); await loadAll(); setDialogOpen(null); setExpenseForm({ description: '', amount: 0, category: '', date: '' }); } catch (err) { console.error('[ManagerInvoicing] Failed to create expense:', err); }
  };
  const approveExpense = async (id: string) => {
    try { await api.approveExpense(id, 'manager'); await loadAll(); } catch (err) { console.error('[ManagerInvoicing] Failed to approve expense:', err); }
  };
  const createConcession = async () => {
    try { await api.createConcession(concessionForm); await loadAll(); setDialogOpen(null); setConcessionForm({ studentId: '', type: '', percentage: 0, amount: 0, reason: '' }); } catch (err) { console.error('[ManagerInvoicing] Failed to create concession:', err); }
  };
  const createLateFee = async () => {
    try { await api.createLateFee(lateFeeForm); await loadAll(); setDialogOpen(null); setLateFeeForm({ name: '', type: 'fixed', value: 0, gracePeriod: 0, maxFee: 0 }); } catch (err) { console.error('[ManagerInvoicing] Failed to create late fee:', err); }
  };

  const filteredInvoices = invoices.filter(i =>
    (i.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.studentName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPayments = payments.filter(p =>
    (p.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { value: 'invoices', label: 'Invoices', icon: FileText },
    { value: 'quotes', label: 'Quotes', icon: Receipt },
    { value: 'payments', label: 'Payments', icon: CreditCard },
    { value: 'expenses', label: 'Expenses', icon: TrendingDown },
    { value: 'concessions', label: 'Concessions', icon: Percent },
    { value: 'latefees', label: 'Late Fees', icon: Clock },
  ];

  if (loading) return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Invoicing & Payments</h1><p className="text-muted-foreground">Billing and financial transactions</p></div>
      <div className="space-y-4">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20" />)}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Invoicing & Payments</h1><p className="text-muted-foreground">Billing and financial transactions</p></div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="overflow-x-auto flex-nowrap">
          {tabs.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 whitespace-nowrap">
              <t.icon className="w-4 h-4" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Invoices */}
        <TabsContent value="invoices">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Dialog open={dialogOpen === 'invoice'} onOpenChange={(o) => setDialogOpen(o ? 'invoice' : null)}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Create Invoice</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div><label className="text-sm font-medium">Student ID</label><Input value={invoiceForm.studentId} onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Total</label><Input type="number" value={invoiceForm.total} onChange={(e) => setInvoiceForm({ ...invoiceForm, total: Number(e.target.value) })} /></div><div><label className="text-sm font-medium">Due Date</label><Input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} /></div></div>
                  <div><label className="text-sm font-medium">Items (JSON array)</label><Textarea value={invoiceForm.items} onChange={(e) => setInvoiceForm({ ...invoiceForm, items: e.target.value })} placeholder='[{"description":"Tuition","amount":1000}]' /></div>
                </div>
                <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createInvoice}>Save</Button></div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {filteredInvoices.map(inv => (
              <Card key={inv.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{inv.invoiceNumber || `#${inv.id.slice(0, 8)}`}</h4>
                    <p className="text-sm text-muted-foreground">{inv.studentName || inv.studentId}</p>
                    <p className="text-xs text-muted-foreground">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${inv.total?.toLocaleString()}</p>
                    <Badge className={statusColors[inv.status] || 'bg-gray-100 text-gray-700'}>{inv.status}</Badge>
                    <div className="flex items-center gap-1 mt-1">
                      <Button variant="ghost" size="sm" onClick={() => { setPaymentDialogId(inv.id); setPaymentAmount(0); }}><DollarSign className="w-4 h-4 text-green-500" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteInvoice(inv.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                      <a href={api.downloadInvoicePdf(inv.id)} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button></a>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {filteredInvoices.length === 0 && <p className="text-muted-foreground text-center py-8">No invoices</p>}
          </div>
          <Dialog open={!!paymentDialogId} onOpenChange={(o) => { if (!o) setPaymentDialogId(null); }}>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
              <div className="py-4"><label className="text-sm font-medium">Amount</label><Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} /></div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setPaymentDialogId(null)}>Cancel</Button><Button onClick={() => paymentDialogId && recordPayment(paymentDialogId)}>Record</Button></div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Quotes */}
        <TabsContent value="quotes">
          <div className="flex justify-end mb-4">
            <Dialog open={dialogOpen === 'quote'} onOpenChange={(o) => setDialogOpen(o ? 'quote' : null)}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Create Quote</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Quote</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div><label className="text-sm font-medium">Student ID</label><Input value={quoteForm.studentId} onChange={(e) => setQuoteForm({ ...quoteForm, studentId: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Total</label><Input type="number" value={quoteForm.total} onChange={(e) => setQuoteForm({ ...quoteForm, total: Number(e.target.value) })} /></div><div><label className="text-sm font-medium">Valid Until</label><Input type="date" value={quoteForm.validUntil} onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })} /></div></div>
                  <div><label className="text-sm font-medium">Items (JSON)</label><Textarea value={quoteForm.items} onChange={(e) => setQuoteForm({ ...quoteForm, items: e.target.value })} placeholder='[{"description":"Service","amount":500}]' /></div>
                </div>
                <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createQuote}>Save</Button></div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {quotes.map(q => (
              <Card key={q.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{q.quoteNumber || `#${q.id.slice(0, 8)}`}</h4>
                    <p className="text-sm text-muted-foreground">{q.studentName || q.studentId}</p>
                    <p className="text-xs text-muted-foreground">Valid until: {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${q.total?.toLocaleString()}</p>
                    <Badge className={statusColors[q.status] || 'bg-gray-100 text-gray-700'}>{q.status}</Badge>
                    {q.status !== 'converted' && (
                      <Button size="sm" variant="ghost" onClick={() => convertQuote(q.id)} className="mt-1">
                        <ArrowRight className="w-4 h-4 mr-1" />Convert
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {quotes.length === 0 && <p className="text-muted-foreground text-center py-8">No quotes</p>}
          </div>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search payments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Dialog open={dialogOpen === 'payment'} onOpenChange={(o) => setDialogOpen(o ? 'payment' : null)}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Record Payment</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div><label className="text-sm font-medium">Student ID</label><Input value={paymentForm.studentId} onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Amount</label><Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })} /></div>
                    <div><label className="text-sm font-medium">Method</label><select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="cash">Cash</option><option value="card">Card</option><option value="transfer">Transfer</option><option value="cheque">Cheque</option><option value="mobile">Mobile</option></select></div></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Date</label><Input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} /></div><div><label className="text-sm font-medium">Reference</label><Input value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} /></div></div>
                </div>
                <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createPayment}>Save</Button></div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {filteredPayments.map(p => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{p.studentName || p.studentId}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="capitalize">{p.method}</span><span>&middot;</span>
                      <span>{p.date ? new Date(p.date).toLocaleDateString() : '-'}</span>
                    </div>
                    {p.reference && <p className="text-xs text-muted-foreground">Ref: {p.reference}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-500">${p.amount?.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            ))}
            {filteredPayments.length === 0 && <p className="text-muted-foreground text-center py-8">No payments</p>}
          </div>
        </TabsContent>

        {/* Expenses */}
        <TabsContent value="expenses">
          <div className="flex justify-end mb-4">
            <Dialog open={dialogOpen === 'expense'} onOpenChange={(o) => setDialogOpen(o ? 'expense' : null)}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Expense</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div><label className="text-sm font-medium">Description</label><Input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Amount</label><Input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} /></div>
                    <div><label className="text-sm font-medium">Category</label><select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select</option><option value="utilities">Utilities</option><option value="supplies">Supplies</option><option value="maintenance">Maintenance</option><option value="travel">Travel</option><option value="other">Other</option></select></div></div>
                  <div><label className="text-sm font-medium">Date</label><Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} /></div>
                </div>
                <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createExpense}>Save</Button></div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {expenses.map(e => (
              <Card key={e.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{e.description}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{e.category}</Badge>
                      <span>{e.date ? new Date(e.date).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-500">${e.amount?.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge className={statusColors[e.status] || 'bg-gray-100 text-gray-700'}>{e.status}</Badge>
                      {e.status === 'pending' && (
                        <Button variant="ghost" size="sm" onClick={() => approveExpense(e.id)}><CheckCircle className="w-4 h-4 text-green-500" /></Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {expenses.length === 0 && <p className="text-muted-foreground text-center py-8">No expenses</p>}
          </div>
        </TabsContent>

        {/* Concessions */}
        <TabsContent value="concessions">
          <div className="flex justify-end mb-4">
            <Dialog open={dialogOpen === 'concession'} onOpenChange={(o) => setDialogOpen(o ? 'concession' : null)}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Concession</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Fee Concession</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div><label className="text-sm font-medium">Student ID</label><Input value={concessionForm.studentId} onChange={(e) => setConcessionForm({ ...concessionForm, studentId: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Type</label><select value={concessionForm.type} onChange={(e) => setConcessionForm({ ...concessionForm, type: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select</option><option value="scholarship">Scholarship</option><option value="sibling">Sibling</option><option value="merit">Merit</option><option value="need">Need-based</option><option value="other">Other</option></select></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Percentage</label><Input type="number" value={concessionForm.percentage} onChange={(e) => setConcessionForm({ ...concessionForm, percentage: Number(e.target.value) })} /></div><div><label className="text-sm font-medium">Amount</label><Input type="number" value={concessionForm.amount} onChange={(e) => setConcessionForm({ ...concessionForm, amount: Number(e.target.value) })} /></div></div>
                  <div><label className="text-sm font-medium">Reason</label><Textarea value={concessionForm.reason} onChange={(e) => setConcessionForm({ ...concessionForm, reason: e.target.value })} /></div>
                </div>
                <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createConcession}>Save</Button></div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {concessions.map(c => (
              <Card key={c.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{c.studentName || c.studentId}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{c.type}</p>
                    {c.reason && <p className="text-xs text-muted-foreground">{c.reason}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-500">
                      {c.percentage > 0 ? `${c.percentage}%` : ''}
                      {c.amount > 0 ? `${c.percentage > 0 ? ' + ' : ''}$${c.amount}` : ''}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            {concessions.length === 0 && <p className="text-muted-foreground text-center py-8">No concessions</p>}
          </div>
        </TabsContent>

        {/* Late Fees */}
        <TabsContent value="latefees">
          <div className="flex justify-end mb-4">
            <Dialog open={dialogOpen === 'latefee'} onOpenChange={(o) => setDialogOpen(o ? 'latefee' : null)}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Rule</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Late Fee Rule</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-4">
                  <div><label className="text-sm font-medium">Name</label><Input value={lateFeeForm.name} onChange={(e) => setLateFeeForm({ ...lateFeeForm, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium">Type</label><select value={lateFeeForm.type} onChange={(e) => setLateFeeForm({ ...lateFeeForm, type: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="fixed">Fixed</option><option value="percentage">Percentage</option></select></div>
                    <div><label className="text-sm font-medium">Value</label><Input type="number" value={lateFeeForm.value} onChange={(e) => setLateFeeForm({ ...lateFeeForm, value: Number(e.target.value) })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Grace Period (days)</label><Input type="number" value={lateFeeForm.gracePeriod} onChange={(e) => setLateFeeForm({ ...lateFeeForm, gracePeriod: Number(e.target.value) })} /></div><div><label className="text-sm font-medium">Max Fee</label><Input type="number" value={lateFeeForm.maxFee} onChange={(e) => setLateFeeForm({ ...lateFeeForm, maxFee: Number(e.target.value) })} /></div></div>
                </div>
                <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={createLateFee}>Save</Button></div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {lateFees.map(lf => (
              <Card key={lf.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{lf.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="capitalize">{lf.type}</Badge>
                      <span>Grace: {lf.gracePeriod}d</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-500">{lf.type === 'percentage' ? `${lf.value}%` : `$${lf.value}`}</p>
                    {lf.maxFee > 0 && <p className="text-xs text-muted-foreground">Max: ${lf.maxFee}</p>}
                  </div>
                </div>
              </Card>
            ))}
            {lateFees.length === 0 && <p className="text-muted-foreground text-center py-8">No late fee rules</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
