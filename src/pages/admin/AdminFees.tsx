import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Landmark, DollarSign, Calendar, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';

interface FeeRecord {
  id: string;
  studentName: string;
  class: string;
  amount: number;
  paid: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  type: 'tuition' | 'transport' | 'activity' | 'exam';
}

export default function AdminFees() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await api.getFeeRecords();
      setFees(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const filteredFees = fees.filter(fee => {
    const matchesFilter = filter === 'all' || fee.status === filter;
    const matchesSearch = fee.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || fee.class.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalCollected = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.paid, 0);
  const totalPending = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + (f.amount - f.paid), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fees & Billing</h1>
        <p className="text-muted-foreground">Fee management & billing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">${totalCollected.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Collected</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">${totalPending.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Landmark className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{fees.length}</p>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
        </div>
        <div className="flex gap-2">
          {['all', 'paid', 'pending', 'overdue'].map(f => (
            <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-accent hover:bg-accent/80'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {filteredFees.map(fee => (
            <Card key={fee.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{fee.studentName}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Class: {fee.class}</span>
                    <span>•</span>
                    <span>Type: {fee.type}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${fee.amount}</p>
                  <p className="text-sm text-muted-foreground">Paid: ${fee.paid}</p>
                  <Badge className={getStatusColor(fee.status)}>{fee.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
