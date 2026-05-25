import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Bus, Users, MapPin, Clock, AlertCircle } from 'lucide-react';

export default function ManagerTransport() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeRoutes: 0,
    totalStudents: 0,
    onTimeRate: 0,
    routes: [] as { name: string; busNumber: string; students: number; status: string }[],
    issues: [] as { bus: string; issue: string; time: string }[],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getManagerTransport();
      if (data) setStats(data);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transport</h1>
        <p className="text-muted-foreground">Bus & transport management</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4"><div className="flex items-center gap-3"><Bus className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.totalBuses}</p><p className="text-sm text-muted-foreground">Total Buses</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><MapPin className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.activeRoutes}</p><p className="text-sm text-muted-foreground">Active Routes</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.totalStudents}</p><p className="text-sm text-muted-foreground">Students</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{stats.onTimeRate}%</p><p className="text-sm text-muted-foreground">On-Time Rate</p></div></div></Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Routes</h3>
              <div className="space-y-3">
                {stats.routes.map((route, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div><p className="font-medium">{route.name}</p><p className="text-sm text-muted-foreground">Bus #{route.busNumber}</p></div>
                    <div className="text-right"><p className="text-sm">{route.students} students</p><Badge variant="secondary">{route.status}</Badge></div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Recent Issues</h3>
              <div className="space-y-3">
                {stats.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div><p className="font-medium">{issue.issue}</p><p className="text-sm text-muted-foreground">{issue.bus} • {issue.time}</p></div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
