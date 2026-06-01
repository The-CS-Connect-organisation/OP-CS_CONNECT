import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Workflow, CheckSquare, Building2, Users,
  Settings, Clock, Server, Globe
} from 'lucide-react';

interface Workflow {
  id: string; name: string; trigger: string; status: string; lastRun: string;
}
interface SystemTask {
  id: string; title: string; assignee: string; priority: string; status: string; dueDate: string;
}
interface ManagedSchool {
  id: string; name: string; domain: string; status: string;
}
interface CRMContact {
  id: string; name: string; email: string; status: string; lastContact: string;
}

export default function ManagerPlatform() {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [tasks, setTasks] = useState<SystemTask[]>([]);
  const [schools, setSchools] = useState<ManagedSchool[]>([]);
  const [crm, setCrm] = useState<CRMContact[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [w, t, s, c] = await Promise.all([
          api.getWorkflows().catch(() => []),
          api.getSystemTasks().catch(() => []),
          api.getManagedSchools().catch(() => []),
          api.getCRMContacts().catch(() => []),
        ]);
        setWorkflows(Array.isArray(w) ? w : []);
        setTasks(Array.isArray(t) ? t : []);
        setSchools(Array.isArray(s) ? s : []);
        setCrm(Array.isArray(c) ? c : []);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badgeVariant = (status: string) => {
    const map: Record<string, string> = {
      active: 'success', inactive: 'secondary', pending: 'warning',
      completed: 'success', failed: 'destructive', running: 'info',
      low: 'info', medium: 'warning', high: 'destructive', urgent: 'destructive',
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
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground">Workflows, tasks, schools & CRM</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><Workflow className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{workflows.filter(w => w.status === 'active').length}</p><p className="text-sm text-muted-foreground">Active Workflows</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><CheckSquare className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending' || t.status === 'active').length}</p><p className="text-sm text-muted-foreground">Pending Tasks</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Building2 className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{schools.filter(s => s.status === 'active').length}</p><p className="text-sm text-muted-foreground">Managed Schools</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-bold">{crm.length}</p><p className="text-sm text-muted-foreground">CRM Contacts</p></div></div></Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" />Recent Tasks</h3>
        {tasks.length === 0 ? <p className="text-muted-foreground text-center py-6">No tasks</p> : (
          <div className="space-y-3">
            {tasks.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.assignee || 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant(t.priority)}>{t.priority}</Badge>
                  <Badge variant={badgeVariant(t.status)}>{t.status}</Badge>
                  {t.dueDate && <span className="text-xs text-muted-foreground">{new Date(t.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-orange-500" />Workflows</h3>
          {workflows.length === 0 ? <p className="text-muted-foreground text-center py-6">No workflows configured</p> : (
            <div className="space-y-3">
              {workflows.slice(0, 5).map(w => (
                <div key={w.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{w.name}</p>
                    <p className="text-xs text-muted-foreground">Trigger: {w.trigger}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={badgeVariant(w.status)}>{w.status}</Badge>
                    {w.lastRun && <span className="text-xs text-muted-foreground">{new Date(w.lastRun).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-orange-500" />System Config Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="text-sm font-medium">Managed Schools</span>
              <Badge variant="info">{schools.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="text-sm font-medium">Active Workflows</span>
              <Badge variant="success">{workflows.filter(w => w.status === 'active').length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="text-sm font-medium">CRM Contacts</span>
              <Badge variant="info">{crm.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="text-sm font-medium">Pending Tasks</span>
              <Badge variant="warning">{tasks.filter(t => t.status === 'pending').length}</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

