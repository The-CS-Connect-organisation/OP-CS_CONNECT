import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { HeartPulse, Calendar, FileText } from 'lucide-react';

export default function StudentHealth() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHealthRecords().then((d: any) => {
      setRecords(Array.isArray(d) ? d : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Health Services</h1>
        <p className="text-muted-foreground">Medical records and appointments</p>
      </div>
      {loading ? (
        <Skeleton className="h-32" />
      ) : records.length === 0 ? (
        <Card className="p-8 text-center">
          <HeartPulse className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No health records</h3>
          <p className="text-muted-foreground">Visit the school clinic for medical assistance. Records will appear here after your first visit.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{r.type || r.recordType || 'Health Record'}</span>
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
