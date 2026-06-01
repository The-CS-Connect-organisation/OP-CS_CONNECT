import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  UtensilsCrossed, ShoppingCart, Package, Users,
  Calendar, AlertTriangle, Apple, ChefHat
} from 'lucide-react';

interface Menu {
  id: string; name: string; date: string; items: string[]; price: number; category: string; status: string;
}
interface Preorder {
  id: string; studentName: string; menuName: string; quantity: number; date: string; status: string;
}
interface InventoryItem {
  id: string; name: string; quantity: number; unit: string; minThreshold: number;
}
interface FSM {
  id: string; studentName: string; eligible: boolean; startDate: string; endDate: string;
}

export default function ManagerFoodService() {
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [fsm, setFsm] = useState<FSM[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [m, p, i, f] = await Promise.all([
          api.getMenus().catch(() => []),
          api.getPreorders().catch(() => []),
          api.getFoodInventory().catch(() => []),
          api.getFSMEligibility().catch(() => []),
        ]);
        setMenus(Array.isArray(m) ? m : []);
        setPreorders(Array.isArray(p) ? p : []);
        setInventory(Array.isArray(i) ? i : []);
        setFsm(Array.isArray(f) ? f : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badgeVariant = (status: string) => {
    const map: Record<string, string> = {
      active: 'success', archived: 'secondary', confirmed: 'success',
      cancelled: 'destructive', collected: 'info',
    };
    return (map[status] || 'default') as any;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  const todayMenu = menus.filter(m =>
    m.date && new Date(m.date).toDateString() === new Date().toDateString()
  );

  const lowStock = inventory.filter(i => i.quantity <= i.minThreshold);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Food Service Overview</h1>
        <p className="text-muted-foreground">Menus, preorders, inventory & FSM</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><UtensilsCrossed className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{menus.length}</p><p className="text-sm text-muted-foreground">Menus This Week</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><ShoppingCart className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{preorders.filter(p => p.status === 'confirmed').length}</p><p className="text-sm text-muted-foreground">Preorders Today</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Package className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{lowStock.length}</p><p className="text-sm text-muted-foreground">Low Stock Items</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{fsm.filter(f => f.eligible).length}</p><p className="text-sm text-muted-foreground">FSM Students</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Apple className="w-4 h-4 text-orange-500" />Today's Menu</h3>
          {todayMenu.length === 0 ? <p className="text-muted-foreground text-center py-6">No menu set for today</p> : (
            <div className="space-y-3">
              {todayMenu.map(m => (
                <div key={m.id} className="p-3 bg-accent rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{m.name}</p>
                    <Badge variant={badgeVariant(m.status)}>{m.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{m.category} &bull; ${m.price}</p>
                  {m.items && m.items.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.items.map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-background rounded text-xs text-muted-foreground">{item}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" />Low Stock Alerts</h3>
          {lowStock.length === 0 ? <p className="text-muted-foreground text-center py-6">All items well stocked</p> : (
            <div className="space-y-3">
              {lowStock.slice(0, 5).map(i => (
                <div key={i.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div><p className="font-medium text-sm">{i.name}</p><p className="text-xs text-muted-foreground">Min threshold: {i.minThreshold} {i.unit}</p></div>
                  <Badge variant="destructive">{i.quantity} {i.unit}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

