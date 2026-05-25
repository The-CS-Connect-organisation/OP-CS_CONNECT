import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Settings, Globe, Bell, Palette, Save } from 'lucide-react';

export default function ManagerSettings() {
  const [settings, setSettings] = useState({
    schoolName: 'CS Connect Academy',
    language: 'English',
    timezone: 'UTC+5:30',
    emailNotifications: true,
    smsNotifications: false,
    theme: 'light',
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">System settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-orange-500" />General</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">School Name</label>
              <input type="text" value={settings.schoolName} onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background">
                <option>UTC+5:30</option>
                <option>UTC+0</option>
                <option>UTC-5</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-orange-500" />Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="text-sm">Email Notifications</span>
              <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })} className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="text-sm">SMS Notifications</span>
              <input type="checkbox" checked={settings.smsNotifications} onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })} className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-orange-500" />Appearance</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      <Button><Save className="w-4 h-4 mr-2" />Save Settings</Button>
    </div>
  );
}
