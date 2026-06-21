import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Receipt, Search, Calendar, DollarSign, User, Plus, Check, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminFeeInstallments() {
  const [plans, setPlans] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFeeRecords().then((data: any) => {
      // Group fee records by studentId to create installment plans
      const grouped: Record<string, any> = {};
      (Array.isArray(data) ? data : []).forEach((r: any) => {
        const sid = r.studentId || 'unknown';
        if (!grouped[sid]) {
          grouped[sid] = { id: sid, studentName: r.studentName || 'Unknown', class: r.class || '', totalAmount: 0, installments: [] as any[], status: 'active' as const };
        }
        grouped[sid].totalAmount += r.amount || 0;
        grouped[sid].installments.push({ amount: r.amount || 0, dueDate: r.due || '', paid: r.status === 'paid', id: r.id });
      });
      setPlans(Object.values(grouped));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filteredPlans = plans.filter(p => (p.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'defaulted': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="p-6"><Loader2 className="w-6 h-6 animate-spin" /></div>;

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
          const paidAmount = plan.installments.filter((i: any) => i.paid).reduce((s: number, i: any) => s + (i.amount || 0), 0);
          const progress = plan.totalAmount > 0 ? (paidAmount / plan.totalAmount) * 100 : 0;
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
                  <span>Paid: ₹{paidAmount.toLocaleString()}</span>
                  <span>Total: ₹{plan.totalAmount.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-accent rounded-full">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                {plan.installments.map((inst: any, idx: number) => (
                  <div key={inst.id || idx} className="flex items-center justify-between p-2 bg-accent rounded-lg">
                    <div className="flex items-center gap-2">
                      {inst.paid ? <Check className="w-4 h-4 text-green-500" /> : <Calendar className="w-4 h-4 text-muted-foreground" />}
                      <span className="text-sm">Installment {idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">₹{inst.amount.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : '—'}</span>
                      <Badge variant="secondary">{inst.paid ? 'Paid' : 'Pending'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
        {filteredPlans.length === 0 && <p className="text-center text-muted-foreground py-8">No fee installment plans found</p>}
      </div>
    </div>
  );
}
