import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { MessageSquare, Calendar, User } from 'lucide-react';

export default function ParentCounselling() {
  const { user } = useAuthStore();
  const children: { id: string; name: string }[] = user?.children
    ? (Array.isArray(user.children) ? user.children.map((c: any) => typeof c === 'string' ? { id: c, name: 'Child' } : c) : [])
    : [];
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCounsellingSessions().then((d: any) => {
      setSessions(Array.isArray(d) ? d : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Counselling Services</h1>
        <p className="text-muted-foreground">Guidance and support for your children</p>
      </div>
      {loading ? (
        <Skeleton className="h-32" />
      ) : sessions.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No counselling sessions</h3>
          <p className="text-muted-foreground">Contact the school counsellor to discuss your child's needs.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((s: any) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-orange-500" />
                <span className="font-medium">{s.studentName || s.counsellor || 'Session'}</span>
              </div>
              <p className="text-sm text-muted-foreground">{s.notes || s.description || ''}</p>
              {s.date && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(s.date).toLocaleDateString()}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
