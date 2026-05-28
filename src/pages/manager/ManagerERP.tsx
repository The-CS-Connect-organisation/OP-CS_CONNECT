import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
  Users, Plus, Edit, Trash2, Search, DollarSign, CreditCard,
  Package, ListOrdered, Settings, Globe, Building2, Phone, MapPin,
  Mail, UserPlus, TrendingUp, X
} from 'lucide-react';

interface Client {
  id: string; name: string; contact: string; email: string;
  type: string; creditLimit: number; status: string;
}
interface Lead {
  id: string; name: string; source: string; status: string; notes: string;
}
interface Product {
  id: string; name: string; sku: string; price: number;
  stock: number; category: string;
}
interface OrderItem {
  productId: string; productName: string; quantity: number; price: number;
}
interface Order {
  id: string; orderNumber: string; clientId: string; clientName: string;
  total: number; status: string; date: string; items: OrderItem[];
}
interface CompanySettings {
  companyName: string; address: string; phone: string;
  email: string; taxId: string; logo: string;
}
interface MoneyFormat {
  symbol: string; code: string; decimalPlaces: number; separator: string;
}

export default function ManagerERP() {
  const [tab, setTab] = useState('clients');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: '', address: '', phone: '', email: '', taxId: '', logo: '',
  });
  const [moneyFormat, setMoneyFormat] = useState<MoneyFormat>({
    symbol: '$', code: 'USD', decimalPlaces: 2, separator: ',',
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [c, l, p, o] = await Promise.all([
        api.getClients(), api.getLeads(), api.getProducts(), api.getOrders(),
      ]);
      setClients(Array.isArray(c) ? c : []);
      setLeads(Array.isArray(l) ? l : []);
      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
      try {
        const cs = await api.getCompanySettings();
        if (cs) setCompanySettings(cs);
      } catch { /* error */ }
      try {
        const mf = await api.getMoneyFormat();
        if (mf) setMoneyFormat(mf);
      } catch { /* error */ }
    } catch { /* error */ } finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (tab === 'clients') {
        if (editing) {
          await api.updateClient(editing.id, form);
          setClients(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
        } else {
          const res = await api.createClient(form);
          setClients(prev => [...prev, res]);
        }
      } else if (tab === 'leads') {
        if (editing) {
          await api.updateLead(editing.id, form);
          setLeads(prev => prev.map(l => l.id === editing.id ? { ...l, ...form } : l));
        } else {
          const res = await api.createLead(form);
          setLeads(prev => [...prev, res]);
        }
      } else if (tab === 'products') {
        if (editing) {
          await api.updateProduct(editing.id, form);
          setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } : p));
        } else {
          const res = await api.createProduct(form);
          setProducts(prev => [...prev, res]);
        }
      } else if (tab === 'orders') {
        if (editing) {
          await api.updateOrder(editing.id, form);
          setOrders(prev => prev.map(o => o.id === editing.id ? { ...o, ...form } : o));
        } else {
          const res = await api.createOrder(form);
          setOrders(prev => [...prev, res]);
        }
      } else if (tab === 'company') {
        await api.updateCompanySettings(form);
        setCompanySettings(form);
      } else if (tab === 'money') {
        await api.updateMoneyFormat(form);
        setMoneyFormat(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({});
    } catch { /* error */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch { /* error */ }
  };

  const handleConvertLead = async (lead: Lead) => {
    try {
      await api.createClient({ name: lead.name, email: '', contact: '', type: 'lead', creditLimit: 0, status: 'active' });
      await api.updateLead(lead.id, { ...lead, status: 'converted' });
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'converted' } : l));
      const clientsData = await api.getClients();
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch { /* error */ }
  };

  const getFormFields = () => {
    switch (tab) {
      case 'clients':
        return (
          <div className="space-y-3">
            <Input placeholder="Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
            <Input placeholder="Contact" value={form.contact || ''} onChange={e => setForm({...form, contact: e.target.value})} />
            <Input placeholder="Email" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
            <Input placeholder="Type (e.g. school, district)" value={form.type || ''} onChange={e => setForm({...form, type: e.target.value})} />
            <Input placeholder="Credit Limit" type="number" value={form.creditLimit || ''} onChange={e => setForm({...form, creditLimit: parseFloat(e.target.value) || 0})} />
            <Input placeholder="Status" value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})} />
          </div>
        );
      case 'leads':
        return (
          <div className="space-y-3">
            <Input placeholder="Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
            <Input placeholder="Source" value={form.source || ''} onChange={e => setForm({...form, source: e.target.value})} />
            <Input placeholder="Status" value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})} />
            <Textarea placeholder="Notes" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
        );
      case 'products':
        return (
          <div className="space-y-3">
            <Input placeholder="Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
            <Input placeholder="SKU" value={form.sku || ''} onChange={e => setForm({...form, sku: e.target.value})} />
            <Input placeholder="Price" type="number" step="0.01" value={form.price || ''} onChange={e => setForm({...form, price: parseFloat(e.target.value) || 0})} />
            <Input placeholder="Stock" type="number" value={form.stock || ''} onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})} />
            <Input placeholder="Category" value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} />
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-3">
            <Input placeholder="Order Number" value={form.orderNumber || ''} onChange={e => setForm({...form, orderNumber: e.target.value})} />
            <Input placeholder="Client ID" value={form.clientId || ''} onChange={e => setForm({...form, clientId: e.target.value})} />
            <Input placeholder="Total" type="number" step="0.01" value={form.total || ''} onChange={e => setForm({...form, total: parseFloat(e.target.value) || 0})} />
            <Input placeholder="Status" value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})} />
          </div>
        );
      case 'company':
        return (
          <div className="space-y-3">
            <Input placeholder="Company Name" value={form.companyName || ''} onChange={e => setForm({...form, companyName: e.target.value})} />
            <Input placeholder="Address" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
            <Input placeholder="Phone" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
            <Input placeholder="Email" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
            <Input placeholder="Tax ID" value={form.taxId || ''} onChange={e => setForm({...form, taxId: e.target.value})} />
            <Input placeholder="Logo URL" value={form.logo || ''} onChange={e => setForm({...form, logo: e.target.value})} />
          </div>
        );
      case 'money':
        return (
          <div className="space-y-3">
            <Input placeholder="Symbol (e.g. $)" value={form.symbol || ''} onChange={e => setForm({...form, symbol: e.target.value})} />
            <Input placeholder="Code (e.g. USD)" value={form.code || ''} onChange={e => setForm({...form, code: e.target.value})} />
            <Input placeholder="Decimal Places" type="number" value={form.decimalPlaces ?? ''} onChange={e => setForm({...form, decimalPlaces: parseInt(e.target.value) || 0})} />
            <Input placeholder="Separator (e.g. ,)" value={form.separator || ''} onChange={e => setForm({...form, separator: e.target.value})} />
          </div>
        );
      default:
        return null;
    }
  };

  const showAddButton = ['clients', 'leads', 'products', 'orders'].includes(tab);
  const showSaveButton = ['company', 'money'].includes(tab);

  if (loading) return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">ERP / CRM</h1><p className="text-muted-foreground">Business management</p></div>
      <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ERP / CRM</h1>
          <p className="text-muted-foreground">Business management</p>
        </div>
        <div className="flex gap-2">
          {showAddButton && (
            <Button onClick={() => { setEditing(null); setForm({}); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add
            </Button>
          )}
          {showSaveButton && !showForm && (
            <Button onClick={() => { setForm(tab === 'company' ? companySettings : moneyFormat); setShowForm(true); }}>
              <Settings className="w-4 h-4 mr-2" />Edit Settings
            </Button>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="clients"><Users className="w-4 h-4 mr-1" />Clients</TabsTrigger>
          <TabsTrigger value="leads"><UserPlus className="w-4 h-4 mr-1" />Leads</TabsTrigger>
          <TabsTrigger value="products"><Package className="w-4 h-4 mr-1" />Products</TabsTrigger>
          <TabsTrigger value="orders"><ListOrdered className="w-4 h-4 mr-1" />Orders</TabsTrigger>
          <TabsTrigger value="company"><Building2 className="w-4 h-4 mr-1" />Company</TabsTrigger>
          <TabsTrigger value="money"><DollarSign className="w-4 h-4 mr-1" />Money</TabsTrigger>
        </TabsList>

        {(showForm || ['company', 'money'].includes(tab)) && ['clients', 'leads', 'products', 'orders'].includes(tab) && (
          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={`Search ${tab}...`} value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        )}

        {showForm && (
          <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-4">{editing ? 'Edit' : 'New'} {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}</h3>
            {getFormFields()}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); setForm({}); }}>Cancel</Button>
            </div>
          </Card>
        )}

        <TabsContent value="clients" className="space-y-3">
          {clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())).map(client => (
            <Card key={client.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{client.name}</h4>
                    <Badge variant="secondary">{client.type}</Badge>
                    <Badge variant={client.status === 'active' ? 'success' : 'secondary'}>{client.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <Mail className="w-3 h-3 inline mr-1" />{client.email}
                    {client.contact && <><Phone className="w-3 h-3 inline ml-3 mr-1" />{client.contact}</>}
                  </p>
                  {client.creditLimit > 0 && <p className="text-sm text-muted-foreground mt-1">Credit Limit: ${client.creditLimit.toLocaleString()}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(client); setForm(client); setShowForm(true); }} className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
          {clients.length === 0 && <p className="text-center text-muted-foreground py-8">No clients</p>}
        </TabsContent>

        <TabsContent value="leads" className="space-y-3">
          {leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase())).map(lead => (
            <Card key={lead.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{lead.name}</h4>
                    <Badge variant={lead.status === 'converted' ? 'success' : lead.status === 'lost' ? 'destructive' : 'warning'}>{lead.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Source: {lead.source}</p>
                  {lead.notes && <p className="text-sm text-muted-foreground mt-1">{lead.notes}</p>}
                </div>
                <div className="flex gap-1">
                  {lead.status !== 'converted' && (
                    <Button size="sm" variant="outline" onClick={() => handleConvertLead(lead)}><TrendingUp className="w-4 h-4 mr-1" />Convert</Button>
                  )}
                  <button onClick={() => { setEditing(lead); setForm(lead); setShowForm(true); }} className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
          {leads.length === 0 && <p className="text-center text-muted-foreground py-8">No leads</p>}
        </TabsContent>

        <TabsContent value="products" className="space-y-3">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())).map(product => (
            <Card key={product.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{product.name}</h4>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">SKU: {product.sku} · Price: ${product.price.toFixed(2)} · Stock: {product.stock}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(product); setForm(product); setShowForm(true); }} className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
          {products.length === 0 && <p className="text-center text-muted-foreground py-8">No products</p>}
        </TabsContent>

        <TabsContent value="orders" className="space-y-3">
          {orders.filter(o => o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.clientName?.toLowerCase().includes(search.toLowerCase())).map(order => (
            <Card key={order.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{order.orderNumber}</h4>
                    <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'destructive' : 'warning'}>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.clientName} · ${order.total?.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-accent rounded"><ListOrdered className="w-4 h-4" /></button>
                  <button onClick={() => { setEditing(order); setForm(order); setShowForm(true); }} className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                </div>
              </div>
              {selectedOrder?.id === order.id && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="text-sm font-semibold mb-2">Items</h5>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm py-1">
                      <span>{item.productName} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-end mt-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedOrder(null)}><X className="w-4 h-4 mr-1" />Close</Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
          {orders.length === 0 && <p className="text-center text-muted-foreground py-8">No orders</p>}
        </TabsContent>

        <TabsContent value="company">
          {showForm ? (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Edit Company Settings</h3>
              {getFormFields()}
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setForm({}); }}>Cancel</Button>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  {companySettings.logo && <img src={companySettings.logo} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />}
                  <div><h3 className="text-xl font-bold">{companySettings.companyName || 'Company Name'}</h3><p className="text-muted-foreground">Tax ID: {companySettings.taxId || 'N/A'}</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" />{companySettings.address || 'No address'}</div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" />{companySettings.phone || 'No phone'}</div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" />{companySettings.email || 'No email'}</div>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="money">
          {showForm ? (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Edit Money Format</h3>
              {getFormFields()}
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setForm({}); }}>Cancel</Button>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-accent rounded-lg text-center"><p className="text-2xl font-bold">{moneyFormat.symbol}</p><p className="text-sm text-muted-foreground">Symbol</p></div>
                <div className="p-4 bg-accent rounded-lg text-center"><p className="text-2xl font-bold">{moneyFormat.code}</p><p className="text-sm text-muted-foreground">Code</p></div>
                <div className="p-4 bg-accent rounded-lg text-center"><p className="text-2xl font-bold">{moneyFormat.decimalPlaces}</p><p className="text-sm text-muted-foreground">Decimals</p></div>
                <div className="p-4 bg-accent rounded-lg text-center"><p className="text-2xl font-bold">{moneyFormat.separator}</p><p className="text-sm text-muted-foreground">Separator</p></div>
              </div>
              <p className="text-center text-2xl font-bold mt-6 p-4 bg-accent rounded-lg">
                {moneyFormat.symbol}1{moneyFormat.separator}234{moneyFormat.separator}567.{moneyFormat.decimalPlaces === 2 ? '00' : '0'.repeat(moneyFormat.decimalPlaces)}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
