import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Wallet, DollarSign, Calendar, User, Search } from 'lucide-react';

interface PayrollRecord {
  id: string;
  employeeName: string;
  role: string;
  salary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  month: string;
  status: 'paid' | 'pending' | 'processing';
}

export default function AdminPayroll() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadRecords();
  }, [selectedMonth]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await api.getPayrollRecords(selectedMonth);
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPayroll = filteredRecords.reduce((sum, r) => sum + r.netPay, 0);
  const paidCount = filteredRecords.filter(r => r.status === 'paid').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payroll & HR</h1>
        <p className="text-muted-foreground">Staff payroll management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">${totalPayroll.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Payroll</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{records.length}</p>
              <p className="text-sm text-muted-foreground">Employees</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{paidCount}/{records.length}</p>
              <p className="text-sm text-muted-foreground">Paid</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
        </div>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-4 py-2 rounded-lg border bg-background" />
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
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
                  <p className="text-sm text-muted-foreground">Base: ${record.salary.toLocaleString()}</p>
                  <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
