import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Wallet, DollarSign, Calendar, User, Search } from 'lucide-react';
import { api } from '../../lib/api';

interface PayrollRecord {
  id: string;
  employeeName: string;
  role: string;
  salary: number;
  netPay: number;
  month: string;
  status: string;
}

const mockRecords: PayrollRecord[] = [
  { id: '1', employeeName: 'Mr. Smith', role: 'Teacher', salary: 5000, netPay: 4500, month: 'May 2026', status: 'paid' },
  { id: '2', employeeName: 'Ms. Johnson', role: 'Teacher', salary: 5000, netPay: 4500, month: 'May 2026', status: 'paid' },
  { id: '3', employeeName: 'John Doe', role: 'Driver', salary: 3000, netPay: 2700, month: 'May 2026', status: 'pending' },
];

export default function ManagerPayroll() {
  const [records, setRecords] = useState<PayrollRecord[]>(mockRecords);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadPayroll() {
      try {
        const data = await api.getPayrollRecords();
        setRecords(data);
      } catch (err) {
        console.error('[ManagerPayroll] Failed to load:', err);
      }
    }
    loadPayroll();
  }, []);

  const filteredRecords = records.filter(r => r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPayroll = filteredRecords.reduce((sum, r) => sum + r.netPay, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payroll & HR</h1>
        <p className="text-muted-foreground">Staff payroll</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">${totalPayroll.toLocaleString()}</p><p className="text-sm text-muted-foreground">Total Payroll</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><User className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{records.length}</p><p className="text-sm text-muted-foreground">Employees</p></div></div></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
      </div>

      <div className="space-y-3">
        {filteredRecords.map(record => (
          <Card key={record.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{record.employeeName}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{record.role}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{record.month}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${record.netPay.toLocaleString()}</p>
                <Badge className={record.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>{record.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
