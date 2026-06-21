import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreditCard, DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface FeeRecord {
  id: string;
  description: string;
  amount: number;
  paid: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  type: 'tuition' | 'transport' | 'activity' | 'exam';
}

export default function ParentFees() {
  const { user } = useAuthStore();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState('child1');

  useEffect(() => {
    loadFees();
  }, [selectedChild]);

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await api.getChildFees(selectedChild);
      setFees(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paid, 0);
  const totalPending = totalAmount - totalPaid;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fee Management</h1>
          <p className="text-muted-foreground">Fee payments & receipts</p>
        </div>
        <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          <option value="child1">Child 1</option>
          <option value="child2">Child 2</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Fees</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">${totalPaid.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Paid</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">${totalPending.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {fees.map(fee => (
            <Card key={fee.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{fee.description}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
