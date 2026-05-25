import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Landmark, DollarSign, TrendingUp, TrendingDown, Calendar, Search } from 'lucide-react';

interface AccountRecord {
  id: string;
  description: string;
  type: 'income' | 'expense';
  category: 'tuition' | 'salary' | 'maintenance' | 'transport' | 'utilities' | 'other';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export default function AdminAccounts() {
  const [records, setRecords] = useState<AccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await api.getAccountRecords();
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Accounts</h1>
        <p className="text-muted-foreground">Account management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">${totalIncome.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Income</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">${totalExpense.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Landmark className="w-8 h-8 text-orange-500" />
            <div>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>${balance.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Balance</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
        </div>
        <div className="flex gap-2">
          {['all', 'income', 'expense'].map(f => (
            <button key={f} onClick={() => setFilterType(f as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === f ? 'bg-orange-500 text-white' : 'bg-accent hover:bg-accent/80'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map(record => (
            <Card key={record.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{record.description}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{record.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${record.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {record.type === 'income' ? '+' : '-'}${record.amount.toLocaleString()}
                  </p>
                  <Badge variant="secondary">{record.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
