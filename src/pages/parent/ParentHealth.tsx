import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { HeartPulse, Calendar, FileText } from 'lucide-react';

export default function ParentHealth() {
  const { user } = useAuthStore();
  const children: { id: string; name: string }[] = user?.children
    ? (Array.isArray(user.children) ? user.children.map((c: any) => typeof c === 'string' ? { id: c, name: 'Child' } : c) : [])
    : [];
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHealthRecords().then((d: any) => {
      setRecords(Array.isArray(d) ? d : []);
    }).catch((err) => { console.error('[ParentHealth] Failed to load:', err); }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Health Records</h1>
        <p className="text-muted-foreground">Medical information for your children</p>
      </div>
      {loading ? (
        <Skeleton className="h-32" />
      ) : records.length === 0 ? (
        <Card className="p-8 text-center">
          <HeartPulse className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No health records</h3>
          <p className="text-muted-foreground">Health records from the school clinic will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{r.type || r.recordType || 'Record'}</span>
              </div>
              <p className="text-sm text-muted-foreground">{r.description || r.notes || ''}</p>
              {r.date && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(r.date).toLocaleDateString()}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
