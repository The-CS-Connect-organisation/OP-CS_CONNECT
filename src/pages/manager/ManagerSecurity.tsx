import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Shield, AlertTriangle, Eye, Check, Lock, Users, Activity, Key, Globe, Server, Clock } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  details: string;
  ip: string;
}

export default function ManagerSecurity() {
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState<AuditEntry[]>([]);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/audit-log').catch(() => []);
      const list = Array.isArray(data) ? data : [];
      setRecentAlerts(list.slice(-10).reverse());
    } catch {
      setRecentAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const securityPolicies = [
    { label: 'Password Policy', value: 'Strong (10+ chars)', icon: Key, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Two-Factor Auth', value: 'Optional', icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Session Timeout', value: '30 minutes', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Max Login Attempts', value: '5', icon: Lock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'IP Whitelist', value: 'Not configured', icon: Globe, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'Audit Logging', value: 'Enabled', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Data Encryption', value: 'AES-256 at rest', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'User Sessions', value: `${recentAlerts.filter(a => a.action?.toLowerCase().includes('login')).length} active`, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  if (loading) return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-40" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
          <Shield className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Security monitoring, policies & audit trail</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-500" />
            <div><p className="text-2xl font-bold stat-value">{securityPolicies.filter(p => p.value !== 'Not configured').length}/{securityPolicies.length}</p><p className="text-sm text-muted-foreground">Policies Active</p></div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-orange-500" />
            <div><p className="text-2xl font-bold stat-value">{recentAlerts.length}</p><p className="text-sm text-muted-foreground">Recent Events</p></div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div><p className="text-2xl font-bold stat-value">{recentAlerts.filter(a => a.action?.toLowerCase().includes('fail') || a.details?.toLowerCase().includes('fail')).length}</p><p className="text-sm text-muted-foreground">Failed Attempts</p></div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <Check className="w-8 h-8 text-blue-500" />
            <div><p className="text-2xl font-bold stat-value">{recentAlerts.filter(a => a.action?.toLowerCase().includes('login') || a.action?.toLowerCase().includes('success')).length}</p><p className="text-sm text-muted-foreground">Successful Logins</p></div>
          </div>
        </Card>
      </div>

      {/* Security Policies Grid */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-orange-500" />Security Policies</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {securityPolicies.map(policy => {
            const Icon = policy.icon;
            return (
              <div key={policy.label} className={`p-3 rounded-xl ${policy.bg} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${policy.color}`} />
                  <span className="text-xs font-medium text-muted-foreground">{policy.label}</span>
                </div>
                <p className={`text-sm font-semibold ${policy.color}`}>{policy.value}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Security Events */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-orange-500" />Recent Security Events</h3>
        {recentAlerts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No security events recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {recentAlerts.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-accent rounded-lg hover:bg-accent/70 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    entry.action?.toLowerCase().includes('fail') || entry.action?.toLowerCase().includes('error') || entry.action?.toLowerCase().includes('delete')
                      ? 'bg-red-50 text-red-500'
                      : entry.action?.toLowerCase().includes('login') || entry.action?.toLowerCase().includes('create') || entry.action?.toLowerCase().includes('update')
                      ? 'bg-green-50 text-green-500'
                      : 'bg-orange-50 text-orange-500'
                  }`}>
                    {entry.action?.toLowerCase().includes('fail') || entry.action?.toLowerCase().includes('error') ? <AlertTriangle className="w-4 h-4" /> :
                     entry.action?.toLowerCase().includes('login') || entry.action?.toLowerCase().includes('success') ? <Check className="w-4 h-4" /> :
                     <Eye className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{entry.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{entry.user} &middot; {entry.details}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <Badge variant="secondary" className="text-[10px]">{entry.role}</Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
