import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Receipt, Search, Calendar, DollarSign, User, Plus, Check } from 'lucide-react';

interface InstallmentPlan {
  id: string;
  studentName: string;
  class: string;
  totalAmount: number;
  installments: { amount: number; dueDate: string; paid: boolean }[];
  status: 'active' | 'completed' | 'defaulted';
}

const mockPlans: InstallmentPlan[] = [
  { id: '1', studentName: 'Alice Johnson', class: '10-A', totalAmount: 5000, installments: [{ amount: 1250, dueDate: '2026-06-01', paid: true }, { amount: 1250, dueDate: '2026-07-01', paid: false }, { amount: 1250, dueDate: '2026-08-01', paid: false }, { amount: 1250, dueDate: '2026-09-01', paid: false }], status: 'active' },
  { id: '2', studentName: 'Bob Williams', class: '11-B', totalAmount: 3000, installments: [{ amount: 1000, dueDate: '2026-05-01', paid: true }, { amount: 1000, dueDate: '2026-06-01', paid: true }, { amount: 1000, dueDate: '2026-07-01', paid: false }], status: 'active' },
];

export default function AdminFeeInstallments() {
  const [plans] = useState<InstallmentPlan[]>(mockPlans);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = plans.filter(p => p.studentName.toLowerCase().includes(searchQuery.toLowerCase()));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'defaulted': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fee Installments</h1>
          <p className="text-muted-foreground">Manage fee installment plans</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />New Plan</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
      </div>

      <div className="space-y-4">
        {filteredPlans.map(plan => {
          const paidAmount = plan.installments.filter(i => i.paid).reduce((sum, i) => sum + i.amount, 0);
          const progress = (paidAmount / plan.totalAmount) * 100;
          return (
            <Card key={plan.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{plan.studentName}</h4>
                  <p className="text-sm text-muted-foreground">Class: {plan.class}</p>
                </div>
                <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Paid: ${paidAmount.toLocaleString()}</span>
                  <span>Total: ${plan.totalAmount.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-accent rounded-full">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                {plan.installments.map((inst, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-accent rounded-lg">
                    <div className="flex items-center gap-2">
                      {inst.paid ? <Check className="w-4 h-4 text-green-500" /> : <Calendar className="w-4 h-4 text-muted-foreground" />}
                      <span className="text-sm">Installment {idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">${inst.amount.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{new Date(inst.dueDate).toLocaleDateString()}</span>
                      <Badge variant="secondary">{inst.paid ? 'Paid' : 'Pending'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
