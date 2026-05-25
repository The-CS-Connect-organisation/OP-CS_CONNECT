import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Eye, Calendar, User, FileText, Search, DollarSign } from 'lucide-react';

interface FeeRecord {
  id: string;
  studentName: string;
  class: string;
  amount: number;
  paid: number;
  dueDate: string;
  status: string;
  type: string;
}

const mockFees: FeeRecord[] = [
  { id: '1', studentName: 'Alice Johnson', class: '10-A', amount: 5000, paid: 5000, dueDate: '2026-05-01', status: 'paid', type: 'tuition' },
  { id: '2', studentName: 'Bob Williams', class: '11-B', amount: 3000, paid: 1500, dueDate: '2026-06-01', status: 'pending', type: 'tuition' },
  { id: '3', studentName: 'Carol Davis', class: '9-A', amount: 1000, paid: 0, dueDate: '2026-04-15', status: 'overdue', type: 'transport' },
];

export default function ManagerFees() {
  const [fees] = useState<FeeRecord[]>(mockFees);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredFees = fees.filter(f => f.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalCollected = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.paid, 0);
  const totalPending = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + (f.amount - f.paid), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fees & Billing</h1>
        <p className="text-muted-foreground">Fee management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">${totalCollected.toLocaleString()}</p><p className="text-sm text-muted-foreground">Collected</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">${totalPending.toLocaleString()}</p><p className="text-sm text-muted-foreground">Pending</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{fees.length}</p><p className="text-sm text-muted-foreground">Total Records</p></div></div></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
      </div>

      <div className="space-y-3">
        {filteredFees.map(fee => (
          <Card key={fee.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{fee.studentName}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Class: {fee.class}</span><span>•</span><span>Type: {fee.type}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${fee.amount}</p>
                <p className="text-sm text-muted-foreground">Paid: ${fee.paid}</p>
                <Badge className={fee.status === 'paid' ? 'bg-green-100 text-green-700' : fee.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}>{fee.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
