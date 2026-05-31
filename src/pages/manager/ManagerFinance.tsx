import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/utils';
import { Wallet, DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export default function ManagerFinance() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    feeCollection: { collected: 0, pending: 0 },
    payroll: 0,
    monthlyTrend: [] as { month: string; revenue: number; expenses: number }[],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getManagerFinance();
      if (data) setStats(data);
    } catch (err) {
      console.error('[ManagerFinance] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance</h1>
        <p className="text-muted-foreground">Financial overview</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p><p className="text-sm text-muted-foreground">Revenue</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><TrendingDown className="w-8 h-8 text-red-500" /><div><p className="text-2xl font-bold">{formatCurrency(stats.expenses)}</p><p className="text-sm text-muted-foreground">Expenses</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><Wallet className="w-8 h-8 text-orange-500" /><div><p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(stats.profit)}</p><p className="text-sm text-muted-foreground">Profit</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><BarChart3 className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{formatCurrency(stats.payroll)}</p><p className="text-sm text-muted-foreground">Payroll</p></div></div></Card>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Monthly Trend</h3>
            <div className="space-y-3">
              {stats.monthlyTrend.map(month => (
                <div key={month.month} className="p-3 bg-accent rounded-lg">
                  <p className="font-medium mb-2">{month.month}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1"><span>Revenue</span><span className="text-green-500">{formatCurrency(month.revenue)}</span></div>
                      <div className="w-full h-2 bg-background rounded-full"><div className="h-full bg-green-500 rounded-full" style={{ width: `${(month.revenue / stats.revenue) * 100}%` }} /></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1"><span>Expenses</span><span className="text-red-500">{formatCurrency(month.expenses)}</span></div>
                      <div className="w-full h-2 bg-background rounded-full"><div className="h-full bg-red-500 rounded-full" style={{ width: `${(month.expenses / stats.expenses) * 100}%` }} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
