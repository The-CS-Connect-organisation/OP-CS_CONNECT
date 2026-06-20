import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Shield, AlertTriangle, Eye, Check } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function ManagerSecurity() {
  const [settings, setSettings] = useState<{[key: string]: any}>({ securitySettings: [], recentAlerts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSecurity() {
      try {
        const data = await apiFetch('/audit-log');
        if (data) setSettings(prev => ({ ...prev, recentAlerts: Array.isArray(data) ? data.slice(-5).reverse() : [] }));
      } catch (err) {
        console.error('[ManagerSecurity] Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSecurity();
  }, []);

  if (loading) return <div className="p-6"><p className="text-muted-foreground">Loading security settings...</p></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-muted-foreground">Security settings</p>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-orange-500" />Security Overview</h3>
        <p className="text-sm text-muted-foreground">Security monitoring and audit trail available in the Audit Log section. Configure security policies from the admin panel.</p>
      </Card>
    </div>
  );
}
