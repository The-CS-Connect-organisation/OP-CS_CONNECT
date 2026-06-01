import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  FileText, Award, Clock, UserX,
  Calendar, Building2, Users, CheckCircle
} from 'lucide-react';

interface Application {
  id: string; studentName: string; grade: string; status: string; submittedDate: string;
}
interface Offer {
  id: string; studentName: string; program: string; status: string; offerDate: string;
}
interface WaitlistEntry {
  id: string; studentName: string; priority: number; status: string;
}
interface Withdrawal {
  id: string; studentName: string; reason: string; date: string; status: string;
}
interface Capacity {
  grade: string; capacity: number; enrolled: number; available: number;
}

export default function ManagerEnrolment() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [capacity, setCapacity] = useState<Capacity[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [a, o, w, wd, c] = await Promise.all([
          api.getEnrolmentApplications().catch(() => []),
          api.getAdmissionOffers().catch(() => []),
          api.getWaitlist().catch(() => []),
          api.getWithdrawals().catch(() => []),
          api.getSchoolCapacity().catch(() => []),
        ]);
        setApplications(Array.isArray(a) ? a : []);
        setOffers(Array.isArray(o) ? o : []);
        setWaitlist(Array.isArray(w) ? w : []);
        setWithdrawals(Array.isArray(wd) ? wd : []);
        setCapacity(Array.isArray(c) ? c : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badgeVariant = (status: string) => {
    const map: Record<string, string> = {
      pending: 'warning', approved: 'success', rejected: 'destructive', reviewing: 'info',
      accepted: 'success', declined: 'destructive', processed: 'success',
    };
    return (map[status] || 'default') as any;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Enrolment Overview</h1>
        <p className="text-muted-foreground">Applications, offers, waitlist & capacity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><FileText className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{applications.filter(a => a.status === 'pending').length}</p><p className="text-sm text-muted-foreground">Pending Applications</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Award className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{offers.filter(o => o.status === 'pending').length}</p><p className="text-sm text-muted-foreground">Offers Sent</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{waitlist.length}</p><p className="text-sm text-muted-foreground">Waitlist Count</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><UserX className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{withdrawals.length}</p><p className="text-sm text-muted-foreground">Withdrawals This Month</p></div></div></Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-orange-500" />Recent Applications</h3>
        {applications.length === 0 ? <p className="text-muted-foreground text-center py-6">No applications</p> : (
          <div className="space-y-3">
            {applications.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="font-medium text-sm">{a.studentName}</p>
                  <p className="text-xs text-muted-foreground">Grade: {a.grade}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant(a.status)}>{a.status}</Badge>
                  <span className="text-xs text-muted-foreground">{a.submittedDate ? new Date(a.submittedDate).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-orange-500" />Capacity Overview</h3>
        {capacity.length === 0 ? <p className="text-muted-foreground text-center py-6">No capacity data</p> : (
          <div className="space-y-3">
            {capacity.map(c => {
              const pct = c.capacity > 0 ? Math.round((c.enrolled / c.capacity) * 100) : 0;
              return (
                <div key={c.grade} className="flex items-center gap-4 p-3 bg-accent rounded-lg">
                  <span className="text-sm font-medium w-20">Grade {c.grade}</span>
                  <div className="flex-1">
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-32 text-right">{c.enrolled}/{c.capacity} ({c.available} free)</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

