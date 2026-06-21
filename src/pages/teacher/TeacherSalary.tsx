import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { DollarSign, Calendar, User, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/store';

interface PayrollEntry {
  id: string;
  employeeName: string;
  staffName?: string;
  salary: number;
  basicPay?: number;
  deductions: number;
  netPay: number;
  month: string;
  status: string;
}

export default function TeacherSalary() {
  const { user } = useAuthStore();
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayroll() {
      try {
        const data = await api.getPayroll();
        if (Array.isArray(data)) {
          // Filter entries matching the current user's name
          const userName = user?.name || '';
          const userFirstName = userName.split(' ')[0];
          setPayrollEntries(data.filter((e: any) =>
            (e.employeeName || e.staffName || '').toLowerCase().includes(userFirstName.toLowerCase())
          ));
        }
      } catch (err) {
        console.error('[TeacherSalary] Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayroll();
  }, [user?.name]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  const latestEntry = payrollEntries[payrollEntries.length - 1];
  const totalEarned = payrollEntries.reduce((sum, e) => sum + (Number(e.netPay) || 0), 0);
  const paidCount = payrollEntries.filter(e => e.status === 'paid').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Salary</h1>
        <p className="text-muted-foreground">Payroll and compensation details</p>
      </div>

      {payrollEntries.length === 0 ? (
        <Card className="p-8 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium">No payroll data available</p>
          <p className="text-sm text-muted-foreground mt-1">
            Salary information will appear here once payroll has been processed.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">${totalEarned.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{payrollEntries.length}</p>
                  <p className="text-sm text-muted-foreground">Pay Periods</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Wallet className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{paidCount}/{payrollEntries.length}</p>
                  <p className="text-sm text-muted-foreground">Paid</p>
                </div>
              </div>
            </Card>
          </div>

          {latestEntry && (
            <Card className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Latest Pay Period
                </h3>
                <Badge variant="success" className="text-sm px-3 py-1">
                  {latestEntry.status === 'paid' ? '✓ Paid' : latestEntry.status}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Month</p>
                  <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {latestEntry.month}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base Salary</p>
                  <p className="text-lg font-semibold mt-1">
                    ${(latestEntry.salary || latestEntry.basicPay || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Pay</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ${(latestEntry.netPay || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              {latestEntry.deductions > 0 && (
                <div className="mt-3 p-3 bg-amber-500/5 rounded-lg flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-muted-foreground">
                    Deductions: ${latestEntry.deductions.toLocaleString()}
                  </span>
                </div>
              )}
            </Card>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold">Payment History</h3>
            {[...payrollEntries].reverse().map(entry => (
              <Card key={entry.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{entry.month}</h4>
                    <div className="text-sm text-muted-foreground">
                      <span>Base: ${(entry.salary || entry.basicPay || 0).toLocaleString()}</span>
                      {entry.deductions > 0 && <span> • Deductions: ${entry.deductions.toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">${entry.netPay.toLocaleString()}</p>
                    <Badge variant={entry.status === 'paid' ? 'success' : 'secondary'}>
                      {entry.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
