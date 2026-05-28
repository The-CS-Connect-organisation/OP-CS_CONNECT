import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Building2, Users, Package, ShoppingCart, Settings, DollarSign, Search, Plus, Edit, Trash2, UserCheck, Phone, Mail, Hash, PackagePlus, Eye } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  type: 'vendor' | 'customer';
  creditLimit: number;
  status: 'active' | 'inactive';
}

interface Lead {
  id: string;
  name: string;
  source: 'referral' | 'website' | 'walk-in';
  status: 'new' | 'contacted' | 'converted' | 'lost';
  notes: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  category: string;
  stockQuantity: number;
}

interface OrderItem {
  product: string;
  qty: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  client: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
}

interface CompanySettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logoUrl: string;
  footer: string;
}

interface MoneyFormat {
  symbol: string;
  code: string;
  decimalPlaces: number;
  separator: string;
}

export default function AdminERP() {
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [moneyFormat, setMoneyFormat] = useState<MoneyFormat | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('clients');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [stockAdjust, setStockAdjust] = useState<Record<string, number>>({});

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [cl, ld, pr, or, co, mf] = await Promise.all([
        api.getClients(),
        api.getLeads(),
        api.getProducts(),
        api.getOrders(),
        api.getCompanySettings(),
        api.getMoneyFormat(),
      ]);
      setClients(Array.isArray(cl) ? cl : []);
      setLeads(Array.isArray(ld) ? ld : []);
      setProducts(Array.isArray(pr) ? pr : []);
      setOrders(Array.isArray(or) ? or : []);
      setCompany(co || null);
      setMoneyFormat(mf || null);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (id: string, qty: number) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;
      await api.updateProduct(id, { ...product, stockQuantity: product.stockQuantity + qty });
      loadAll();
    } catch {
      // error
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const statusOrderColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ERP Management</h1>
        <p className="text-muted-foreground">Clients, leads, products, orders & settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="clients"><Users className="w-4 h-4 mr-1" />Clients</TabsTrigger>
          <TabsTrigger value="leads"><UserCheck className="w-4 h-4 mr-1" />Leads</TabsTrigger>
          <TabsTrigger value="products"><Package className="w-4 h-4 mr-1" />Products</TabsTrigger>
          <TabsTrigger value="orders"><ShoppingCart className="w-4 h-4 mr-1" />Orders</TabsTrigger>
          <TabsTrigger value="company"><Settings className="w-4 h-4 mr-1" />Company</TabsTrigger>
          <TabsTrigger value="money"><DollarSign className="w-4 h-4 mr-1" />Money Format</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button><Plus className="w-4 h-4 mr-2" />Add Client</Button>
          </div>
          {selectedClient ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedClient.name}</h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedClient(null)}>Back</Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Contact:</span> {selectedClient.contact}</div>
                <div><span className="text-muted-foreground">Email:</span> {selectedClient.email}</div>
                <div><span className="text-muted-foreground">Type:</span> {selectedClient.type}</div>
                <div><span className="text-muted-foreground">Credit Limit:</span> ${selectedClient.creditLimit}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={selectedClient.status === 'active' ? 'success' : 'secondary'}>{selectedClient.status}</Badge></div>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredClients.map(client => (
                <Card key={client.id} className="p-4 cursor-pointer hover:border-orange-500/30" onClick={() => setSelectedClient(client)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">{client.name} <Badge variant={client.type === 'vendor' ? 'info' : 'default'}>{client.type}</Badge></h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.contact}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{client.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm">Limit: ${client.creditLimit}</p>
                      <Badge variant={client.status === 'active' ? 'success' : 'secondary'}>{client.status}</Badge>
                      <button className="p-2 hover:bg-accent rounded"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="flex justify-end">
            <Button><Plus className="w-4 h-4 mr-2" />New Lead</Button>
          </div>
          <div className="space-y-3">
            {leads.map(lead => (
              <Card key={lead.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{lead.name}</h4>
                    <p className="text-sm text-muted-foreground">Source: {lead.source} • Notes: {lead.notes}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={lead.status === 'converted' ? 'success' : lead.status === 'lost' ? 'destructive' : lead.status === 'contacted' ? 'info' : 'warning'}>{lead.status}</Badge>
                    <Button size="sm" variant="outline"><Edit className="w-4 h-4 mr-1" />Edit</Button>
                    {lead.status !== 'converted' && <Button size="sm"><UserCheck className="w-4 h-4 mr-1" />Convert</Button>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button><PackagePlus className="w-4 h-4 mr-2" />Add Product</Button>
          </div>
          <div className="space-y-3">
            {filteredProducts.map(product => (
              <Card key={product.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-muted-foreground"><Hash className="w-3 h-3 inline" />{product.sku} • {product.category} • Per {product.unit}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">${product.price}</p>
                    <div className="text-right">
                      <p className="text-sm">Stock: {product.stockQuantity}</p>
                      <div className="flex gap-1 mt-1">
                        <Button size="sm" variant="outline" onClick={() => handleAdjustStock(product.id, (stockAdjust[product.id] || 0) - 1)}>-</Button>
                        <Input type="number" className="w-16 h-8 text-sm" value={stockAdjust[product.id] ?? 0} onChange={e => setStockAdjust({ ...stockAdjust, [product.id]: parseInt(e.target.value) || 0 })} />
                        <Button size="sm" variant="outline" onClick={() => handleAdjustStock(product.id, (stockAdjust[product.id] || 0) + 1)}>+</Button>
                        <Button size="sm" onClick={() => handleAdjustStock(product.id, stockAdjust[product.id] || 0)}>Set</Button>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-end">
            <Button><Plus className="w-4 h-4 mr-2" />New Order</Button>
          </div>
          <div className="space-y-3">
            {orders.map(order => (
              <Card key={order.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">#{order.orderNumber}</h4>
                  <div className="flex items-center gap-2">
                    {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                      s !== order.status && s !== 'cancelled' && (
                        <Button key={s} size="sm" variant="outline" className="text-xs capitalize"
                          onClick={() => api.updateOrder(order.id, { ...order, status: s }).then(loadAll)}>
                          {s === 'confirmed' ? 'Confirm' : s === 'shipped' ? 'Ship' : s === 'delivered' ? 'Deliver' : ''}
                        </Button>
                      )
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p>Client: {order.client}</p>
                    <p className="text-muted-foreground">
                      Items: {order.items?.map(i => `${i.product} x${i.qty}`).join(', ')}
                    </p>
                    <p className="text-muted-foreground">Ordered: {new Date(order.orderDate).toLocaleDateString()} • Expected: {new Date(order.expectedDelivery).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total}</p>
                    <Badge className={statusOrderColors[order.status] || ''}>{order.status}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          {company && (
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Company Name</label>
                  <Input defaultValue={company.companyName} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <Input defaultValue={company.email} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <Input defaultValue={company.phone} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Website</label>
                  <Input defaultValue={company.website} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">Address</label>
                  <Input defaultValue={company.address} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Tax ID</label>
                  <Input defaultValue={company.taxId} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Logo URL</label>
                  <Input defaultValue={company.logoUrl} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">Footer</label>
                  <Input defaultValue={company.footer} />
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={() => api.updateCompanySettings(company).then(loadAll)}>Save Settings</Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="money" className="space-y-4">
          {moneyFormat && (
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Symbol</label>
                  <select defaultValue={moneyFormat.symbol} className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm">
                    <option value="₹">₹</option>
                    <option value="$">$</option>
                    <option value="€">€</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Code</label>
                  <select defaultValue={moneyFormat.code} className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm">
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Decimal Places</label>
                  <select defaultValue={moneyFormat.decimalPlaces} className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm">
                    <option value={0}>0</option>
                    <option value={2}>2</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Separator</label>
                  <select defaultValue={moneyFormat.separator} className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm">
                    <option value=".">Dot (.)</option>
                    <option value=",">Comma (,)</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={() => api.updateMoneyFormat(moneyFormat).then(loadAll)}>Save Format</Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
