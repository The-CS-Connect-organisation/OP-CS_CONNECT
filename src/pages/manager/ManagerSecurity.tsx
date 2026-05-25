import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Shield, Lock, Eye, Key, AlertTriangle, Check } from 'lucide-react';

export default function ManagerSecurity() {
  const [settings] = useState({
    twoFactorEnabled: true,
    passwordExpiry: '90 days',
    sessionTimeout: '30 minutes',
    failedLoginAttempts: 3,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    recentAlerts: [
      { id: '1', message: 'Failed login attempt from unknown IP', time: '2 hours ago', severity: 'high' },
      { id: '2', message: 'Password changed for user admin', time: '1 day ago', severity: 'medium' },
      { id: '3', message: 'New device logged in', time: '2 days ago', severity: 'low' },
    ],
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-muted-foreground">Security settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-orange-500" />Security Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="text-sm">Two-Factor Authentication</span>
              <Badge className={settings.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="text-sm">Password Expiry</span>
              <span className="text-sm font-medium">{settings.passwordExpiry}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="text-sm">Session Timeout</span>
              <span className="text-sm font-medium">{settings.sessionTimeout}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="text-sm">Failed Login Attempts</span>
              <span className="text-sm font-medium">{settings.failedLoginAttempts}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" />Recent Alerts</h3>
          <div className="space-y-3">
            {settings.recentAlerts.map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                {alert.severity === 'high' ? <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" /> : alert.severity === 'medium' ? <Eye className="w-5 h-5 text-orange-500 mt-0.5" /> : <Check className="w-5 h-5 text-green-500 mt-0.5" />}
                <div>
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
