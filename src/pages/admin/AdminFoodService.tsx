import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { UtensilsCrossed, ShoppingCart, ChefHat, Apple, Recycle, Plus, Search, Edit2, Trash2, Eye, DollarSign, Users, Package, ClipboardList, CreditCard, AlertTriangle } from 'lucide-react';

interface Menu {
  id: string;
  name: string;
  date: string;
  items: string[];
  price: number;
  category: 'breakfast' | 'lunch' | 'snacks';
  nutritionalInfo: string;
  status: 'active' | 'archived';
}

interface Preorder {
  id: string;
  studentName: string;
  menuId: string;
  menuName: string;
  quantity: number;
  date: string;
  status: 'confirmed' | 'cancelled' | 'collected';
  total: number;
}

interface POSTransaction {
  id: string;
  studentName: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'meal-account';
  date: string;
  status: 'completed' | 'refunded';
}

interface FoodInventory {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  supplier: string;
  expiryDate: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  category: string;
}

interface MealAccount {
  studentId: string;
  studentName: string;
  balance: number;
  lastTopup: string;
  status: 'active' | 'frozen' | 'closed';
}

interface FSMEligibility {
  id: string;
  studentName: string;
  eligible: boolean;
  startDate: string;
  endDate: string;
  notes: string;
}

interface FoodWaste {
  id: string;
  date: string;
  category: string;
  weight: number;
  reason: string;
  cost: number;
}

export default function AdminFoodService() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [posTransactions, setPOSTransactions] = useState<POSTransaction[]>([]);
  const [inventory, setInventory] = useState<FoodInventory[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealAccounts, setMealAccounts] = useState<MealAccount[]>([]);
  const [fsmEligibility, setFsmEligibility] = useState<FSMEligibility[]>([]);
  const [foodWaste, setFoodWaste] = useState<FoodWaste[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('menus');
  const [modalType, setModalType] = useState<'menu' | 'preorder' | 'pos' | 'inventory' | 'recipe' | 'mealAccount' | 'fsm' | 'waste' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [mn, po, pos, inv, rc, fsm, ws] = await Promise.all([
        api.getMenus().catch(() => []),
        api.getPreorders().catch(() => []),
        api.getPOSTransactions().catch(() => []),
        api.getFoodInventory().catch(() => []),
        api.getRecipes().catch(() => []),
        api.getFSMEligibility().catch(() => []),
        api.getFoodWaste().catch(() => []),
      ]);
      setMenus(Array.isArray(mn) ? mn : []);
      setPreorders(Array.isArray(po) ? po : []);
      setPOSTransactions(Array.isArray(pos) ? pos : []);
      setInventory(Array.isArray(inv) ? inv : []);
      setRecipes(Array.isArray(rc) ? rc : []);
      setFsmEligibility(Array.isArray(fsm) ? fsm : []);
      setFoodWaste(Array.isArray(ws) ? ws : []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: typeof modalType, data?: any) => {
    setModalType(type);
    setEditingId(data?.id || null);
    setForm(data || {});
  };

  const closeModal = () => {
    setModalType(null);
    setEditingId(null);
    setForm({});
  };

  const handleSave = async () => {
    try {
      switch (modalType) {
        case 'menu':
          if (editingId) {
            await api.updateMenu(editingId, form);
          } else {
            await api.createMenu(form);
          }
          break;
        case 'preorder':
          await api.placePreorder(form);
          break;
        case 'pos':
          await api.createPOSTransaction(form);
          break;
        case 'inventory':
          if (editingId) {
            await api.updateFoodInventory(editingId, form);
          } else {
            await api.addFoodInventory(form);
          }
          break;
        case 'recipe':
          await api.createRecipe(form);
          break;
        case 'waste':
          await api.logFoodWaste(form);
          break;
      }
      closeModal();
      loadAll();
    } catch {
    }
  };

  const handleTopup = async () => {
    try {
      await api.topupMealAccount(form.studentId, { amount: form.topupAmount });
      closeModal();
      loadAll();
    } catch {
    }
  };

  const handleCharge = async () => {
    try {
      await api.chargeMealAccount(form.studentId, { amount: form.chargeAmount });
      closeModal();
      loadAll();
    } catch {
    }
  };

  const handleFSMSave = async () => {
    try {
      await api.setFSMEligibility(form);
      closeModal();
      loadAll();
    } catch {
    }
  };

  const filteredMenus = menus.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const filteredInventory = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const filteredRecipes = recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const statusVariant = (s: string) => {
    switch (s) {
      case 'active': case 'completed': case 'confirmed': case 'collected': case 'eligible': return 'success';
      case 'archived': case 'cancelled': case 'refunded': case 'frozen': case 'closed': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  const renderModal = () => {
    if (!modalType) return null;
    const titles: Record<string, string> = {
      menu: editingId ? 'Edit Menu' : 'Create Menu',
      preorder: 'Place Pre-Order',
      pos: 'New POS Transaction',
      inventory: editingId ? 'Edit Inventory Item' : 'Add Inventory Item',
      recipe: 'Create Recipe',
      mealAccount: 'Meal Account Action',
      fsm: 'Set FSM Eligibility',
      waste: 'Log Food Waste',
    };
    return (
      <Modal isOpen={!!modalType} onClose={closeModal} title={titles[modalType]} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modalType === 'menu' && (
            <>
              <div className="md:col-span-2"><Input placeholder="Menu Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <Input placeholder="Date" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
              <Input placeholder="Price" type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              <Input placeholder="Category (breakfast/lunch/snacks)" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
              <div className="md:col-span-2"><Textarea placeholder="Items (one per line)" value={Array.isArray(form.items) ? form.items.join('\n') : (form.items || '')} onChange={e => setForm({ ...form, items: e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean) })} /></div>
              <div className="md:col-span-2"><Textarea placeholder="Nutritional Info" value={form.nutritionalInfo || ''} onChange={e => setForm({ ...form, nutritionalInfo: e.target.value })} /></div>
            </>
          )}
          {modalType === 'preorder' && (
            <>
              <Input placeholder="Student Name" value={form.studentName || ''} onChange={e => setForm({ ...form, studentName: e.target.value })} />
              <Input placeholder="Menu ID" value={form.menuId || ''} onChange={e => setForm({ ...form, menuId: e.target.value })} />
              <Input placeholder="Menu Name" value={form.menuName || ''} onChange={e => setForm({ ...form, menuName: e.target.value })} />
              <Input placeholder="Quantity" type="number" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
            </>
          )}
          {modalType === 'pos' && (
            <>
              <Input placeholder="Student Name" value={form.studentName || ''} onChange={e => setForm({ ...form, studentName: e.target.value })} />
              <Input placeholder="Payment Method (cash/card/meal-account)" value={form.paymentMethod || ''} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} />
              <div className="md:col-span-2"><Textarea placeholder="Items (JSON array)" value={form.items ? JSON.stringify(form.items) : ''} onChange={e => { try { setForm({ ...form, items: JSON.parse(e.target.value) }); } catch (err) { console.error('[AdminFoodService] Invalid JSON:', err); } }} /></div>
              <Input placeholder="Total" type="number" value={form.total || ''} onChange={e => setForm({ ...form, total: parseFloat(e.target.value) || 0 })} />
            </>
          )}
          {modalType === 'inventory' && (
            <>
              <Input placeholder="Item Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Category" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="Quantity" type="number" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Unit (kg/ltr/pcs)" value={form.unit || ''} onChange={e => setForm({ ...form, unit: e.target.value })} />
              <Input placeholder="Min Threshold" type="number" value={form.minThreshold || ''} onChange={e => setForm({ ...form, minThreshold: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Supplier" value={form.supplier || ''} onChange={e => setForm({ ...form, supplier: e.target.value })} />
              <Input placeholder="Expiry Date" type="date" value={form.expiryDate || ''} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
            </>
          )}
          {modalType === 'recipe' && (
            <>
              <div className="md:col-span-2"><Input placeholder="Recipe Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <Input placeholder="Category" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="Prep Time (min)" type="number" value={form.prepTime || ''} onChange={e => setForm({ ...form, prepTime: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Cook Time (min)" type="number" value={form.cookTime || ''} onChange={e => setForm({ ...form, cookTime: parseInt(e.target.value) || 0 })} />
              <Input placeholder="Servings" type="number" value={form.servings || ''} onChange={e => setForm({ ...form, servings: parseInt(e.target.value) || 0 })} />
              <div className="md:col-span-2"><Textarea placeholder="Ingredients (one per line)" value={Array.isArray(form.ingredients) ? form.ingredients.join('\n') : (form.ingredients || '')} onChange={e => setForm({ ...form, ingredients: e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean) })} /></div>
              <div className="md:col-span-2"><Textarea placeholder="Instructions" value={form.instructions || ''} onChange={e => setForm({ ...form, instructions: e.target.value })} /></div>
            </>
          )}
          {modalType === 'mealAccount' && (
            <>
              <Input placeholder="Student ID" value={form.studentId || ''} onChange={e => setForm({ ...form, studentId: e.target.value })} />
              <Input placeholder="Student Name" value={form.studentName || ''} onChange={e => setForm({ ...form, studentName: e.target.value })} />
              <Input placeholder="Topup Amount" type="number" value={form.topupAmount || ''} onChange={e => setForm({ ...form, topupAmount: parseFloat(e.target.value) || 0 })} />
              <Input placeholder="Charge Amount" type="number" value={form.chargeAmount || ''} onChange={e => setForm({ ...form, chargeAmount: parseFloat(e.target.value) || 0 })} />
              <div className="flex gap-2 md:col-span-2">
                <Button onClick={handleTopup}>Top Up</Button>
                <Button onClick={handleCharge} variant="destructive">Charge</Button>
              </div>
            </>
          )}
          {modalType === 'fsm' && (
            <>
              <Input placeholder="Student Name" value={form.studentName || ''} onChange={e => setForm({ ...form, studentName: e.target.value })} />
              <Input placeholder="Start Date" type="date" value={form.startDate || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              <Input placeholder="End Date" type="date" value={form.endDate || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              <div className="md:col-span-2"><Textarea placeholder="Notes" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </>
          )}
          {modalType === 'waste' && (
            <>
              <Input placeholder="Date" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
              <Input placeholder="Category" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="Weight (kg)" type="number" value={form.weight || ''} onChange={e => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })} />
              <Input placeholder="Cost" type="number" value={form.cost || ''} onChange={e => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })} />
              <div className="md:col-span-2"><Textarea placeholder="Reason" value={form.reason || ''} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
            </>
          )}
        </div>
        {modalType !== 'mealAccount' && modalType !== 'fsm' && (
          <div className="flex gap-2 mt-6">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
          </div>
        )}
        {modalType === 'fsm' && (
          <div className="flex gap-2 mt-6">
            <Button onClick={handleFSMSave}>Set Eligibility</Button>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
          </div>
        )}
      </Modal>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Food Service Management</h1>
        <p className="text-muted-foreground">Menus, pre-orders, POS, inventory & more</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="menus"><UtensilsCrossed className="w-4 h-4 mr-1" />Menus</TabsTrigger>
          <TabsTrigger value="preorders"><ShoppingCart className="w-4 h-4 mr-1" />Pre-Orders</TabsTrigger>
          <TabsTrigger value="pos"><DollarSign className="w-4 h-4 mr-1" />POS</TabsTrigger>
          <TabsTrigger value="inventory"><Package className="w-4 h-4 mr-1" />Inventory</TabsTrigger>
          <TabsTrigger value="recipes"><ChefHat className="w-4 h-4 mr-1" />Recipes</TabsTrigger>
          <TabsTrigger value="mealAccounts"><CreditCard className="w-4 h-4 mr-1" />Meal Accounts</TabsTrigger>
          <TabsTrigger value="fsm"><Users className="w-4 h-4 mr-1" />FSM</TabsTrigger>
          <TabsTrigger value="waste"><Recycle className="w-4 h-4 mr-1" />Waste</TabsTrigger>
        </TabsList>

        <TabsContent value="menus" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search menus..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button onClick={() => openModal('menu')}><Plus className="w-4 h-4 mr-2" />Create Menu</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
            {filteredMenus.length === 0 && <p className="text-muted-foreground col-span-full">No menus created.</p>}
            {filteredMenus.map(m => (
              <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{m.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{m.category}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant(m.status) as any}>{m.status}</Badge>
                </div>
                <p className="text-sm font-semibold">${m.price}</p>
                <p className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString()}</p>
                {m.items && m.items.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground">Items:</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {m.items.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {m.nutritionalInfo && <p className="text-xs text-muted-foreground mt-2">Nutrition: {m.nutritionalInfo}</p>}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openModal('menu', m)}><Edit2 className="w-3 h-3 mr-1" />Edit</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preorders" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal('preorder')}><Plus className="w-4 h-4 mr-2" />Place Pre-Order</Button>
          </div>
          <div className="space-y-3">
            {preorders.length === 0 && <p className="text-muted-foreground">No pre-orders placed.</p>}
            {preorders.map(po => (
              <Card key={po.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart className="w-4 h-4 text-orange-500" />
                      <h4 className="font-semibold">{po.studentName}</h4>
                      <Badge variant={statusVariant(po.status) as any}>{po.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{po.menuName} x{po.quantity}</p>
                    <p className="text-xs text-muted-foreground">{new Date(po.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold">${po.total}</p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pos" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal('pos')}><Plus className="w-4 h-4 mr-2" />New Transaction</Button>
          </div>
          <div className="space-y-3">
            {posTransactions.length === 0 && <p className="text-muted-foreground">No POS transactions recorded.</p>}
            {posTransactions.map(tx => (
              <Card key={tx.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <h4 className="font-semibold">{tx.studentName}</h4>
                      <Badge variant={statusVariant(tx.status) as any}>{tx.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tx.items?.map(i => `${i.name} x${i.qty}`).join(', ')}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.paymentMethod} &bull; {new Date(tx.date).toLocaleString()}</p>
                  </div>
                  <p className="font-semibold text-lg">${tx.total}</p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button onClick={() => openModal('inventory')}><Plus className="w-4 h-4 mr-2" />Add Item</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
            {filteredInventory.length === 0 && <p className="text-muted-foreground col-span-full">No inventory items.</p>}
            {filteredInventory.map(item => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <Badge variant={item.quantity <= item.minThreshold ? 'destructive' : 'success'}>
                    {item.quantity <= item.minThreshold ? 'Low' : 'OK'}
                  </Badge>
                </div>
                <p className="text-lg font-bold">{item.quantity} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></p>
                <p className="text-xs text-muted-foreground">Min: {item.minThreshold} &bull; Supplier: {item.supplier}</p>
                {item.expiryDate && <p className="text-xs text-muted-foreground">Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openModal('inventory', item)}><Edit2 className="w-3 h-3 mr-1" />Edit</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search recipes..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button onClick={() => openModal('recipe')}><Plus className="w-4 h-4 mr-2" />Create Recipe</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecipes.length === 0 && <p className="text-muted-foreground col-span-full">No recipes created.</p>}
            {filteredRecipes.map(r => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  <ChefHat className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">{r.name}</h4>
                    <p className="text-xs text-muted-foreground">{r.category} &bull; {r.servings} servings</p>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Prep:</span> {r.prepTime}min &bull; <span className="font-medium">Cook:</span> {r.cookTime}min</p>
                  {r.ingredients && r.ingredients.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Ingredients:</p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                        {r.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                      </ul>
                    </div>
                  )}
                  {r.instructions && <p className="text-xs text-muted-foreground mt-1">{r.instructions}</p>}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline"><Eye className="w-3 h-3 mr-1" />View</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mealAccounts" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal('mealAccount')}><Plus className="w-4 h-4 mr-2" />Manage Account</Button>
          </div>
          <div className="space-y-3">
            {mealAccounts.length === 0 && (
              <Card className="p-8 text-center">
                <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No meal accounts loaded.</p>
                <p className="text-xs text-muted-foreground mt-1">Search by student ID to manage their account.</p>
              </Card>
            )}
            {mealAccounts.map(ma => (
              <Card key={ma.studentId} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{ma.studentName}</h4>
                      <p className="text-xs text-muted-foreground">ID: {ma.studentId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold ${ma.balance < 0 ? 'text-red-500' : ''}">${ma.balance}</p>
                    <Badge variant={statusVariant(ma.status) as any}>{ma.status}</Badge>
                    {ma.lastTopup && <p className="text-xs text-muted-foreground">Last topup: {new Date(ma.lastTopup).toLocaleDateString()}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fsm" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal('fsm')}><Plus className="w-4 h-4 mr-2" />Set Eligibility</Button>
          </div>
          <div className="space-y-3">
            {fsmEligibility.length === 0 && <p className="text-muted-foreground">No FSM eligibility records.</p>}
            {fsmEligibility.map(fsm => (
              <Card key={fsm.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-orange-500" />
                      <h4 className="font-semibold">{fsm.studentName}</h4>
                      <Badge variant={fsm.eligible ? 'success' : 'destructive'}>{fsm.eligible ? 'Eligible' : 'Not Eligible'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(fsm.startDate).toLocaleDateString()} - {new Date(fsm.endDate).toLocaleDateString()}
                    </p>
                    {fsm.notes && <p className="text-xs text-muted-foreground mt-1">{fsm.notes}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="waste" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal('waste')}><Plus className="w-4 h-4 mr-2" />Log Waste</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
            {foodWaste.length === 0 && <p className="text-muted-foreground col-span-full">No food waste logged.</p>}
            {foodWaste.map(w => (
              <Card key={w.id} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Recycle className="w-5 h-5 text-orange-500" />
                  <h4 className="font-semibold text-sm capitalize">{w.category}</h4>
                </div>
                <p className="text-lg font-bold">{w.weight} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                <p className="text-sm text-muted-foreground">Cost: ${w.cost}</p>
                <p className="text-xs text-muted-foreground">{w.reason} &bull; {new Date(w.date).toLocaleDateString()}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {renderModal()}
    </div>
  );
}

