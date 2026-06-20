import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Settings, Globe, Bell, Palette, Shield, Save, Building2, Clock, Mail, Lock, Sun, Moon } from 'lucide-react';

export default function ManagerSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const [general, setGeneral] = useState({
    schoolName: 'CS Connect Academy',
    address: '123 Education Lane, Knowledge City',
    phone: '+91 9876543210',
    email: 'info@csconnect.edu',
    language: 'English',
    timezone: 'Asia/Kolkata',
    fiscalYearStart: '2026-04-01',
    academicYear: '2026-2027',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    attendanceAlerts: true,
    feeReminders: true,
    examNotifications: true,
    circularUpdates: true,
    emergencyAlerts: true,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    passwordPolicy: 'strong',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipWhitelist: '',
    allowSelfRegistration: false,
  });

  const [branding, setBranding] = useState({
    theme: 'light',
    primaryColor: '#f97316',
    logoUrl: '',
    faviconUrl: '',
    footerText: '© 2026 CS Connect Academy. All rights reserved.',
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 800);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">System configuration and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="general"><Globe className="w-4 h-4 mr-2" />General</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><Lock className="w-4 h-4 mr-2" />Security</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="w-4 h-4 mr-2" />Branding</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-orange-500" />School Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">School Name</label>
                  <input type="text" value={general.schoolName} onChange={e => setGeneral(f => ({ ...f, schoolName: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea value={general.address} onChange={e => setGeneral(f => ({ ...f, address: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[60px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input type="text" value={general.phone} onChange={e => setGeneral(f => ({ ...f, phone: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" value={general.email} onChange={e => setGeneral(f => ({ ...f, email: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" />Regional & Academic</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <select value={general.language} onChange={e => setGeneral(f => ({ ...f, language: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                      <option>English</option><option>Hindi</option><option>Spanish</option><option>French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Timezone</label>
                    <select value={general.timezone} onChange={e => setGeneral(f => ({ ...f, timezone: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                      <option>Asia/Kolkata (UTC+5:30)</option><option>UTC+0</option><option>America/New_York</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Academic Year</label>
                    <input type="text" value={general.academicYear} onChange={e => setGeneral(f => ({ ...f, academicYear: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fiscal Year Start</label>
                    <input type="date" value={general.fiscalYearStart} onChange={e => setGeneral(f => ({ ...f, fiscalYearStart: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-orange-500" />Notification Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="text-sm font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={value} onChange={() => toggleNotification(key as keyof typeof notifications)} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-orange-500" />Security Policies</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div><p className="text-sm font-medium">Two-Factor Authentication</p><p className="text-xs text-muted-foreground">Require 2FA for all admin & manager accounts</p></div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={security.twoFactorAuth} onChange={e => setSecurity(f => ({ ...f, twoFactorAuth: e.target.checked }))} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password Policy</label>
                  <select value={security.passwordPolicy} onChange={e => setSecurity(f => ({ ...f, passwordPolicy: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                    <option value="basic">Basic (6+ chars)</option>
                    <option value="medium">Medium (8+ chars, 1 number)</option>
                    <option value="strong">Strong (10+ chars, 1 upper, 1 number, 1 special)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Session Timeout (min)</label>
                    <input type="number" min="5" max="120" value={security.sessionTimeout} onChange={e => setSecurity(f => ({ ...f, sessionTimeout: Number(e.target.value) }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Login Attempts</label>
                    <input type="number" min="3" max="10" value={security.maxLoginAttempts} onChange={e => setSecurity(f => ({ ...f, maxLoginAttempts: Number(e.target.value) }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-orange-500" />Access Control</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">IP Whitelist (comma separated)</label>
                  <textarea value={security.ipWhitelist} onChange={e => setSecurity(f => ({ ...f, ipWhitelist: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[60px]" placeholder="192.168.1.1, 10.0.0.1" />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty to allow all IPs</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div><p className="text-sm font-medium">Allow Self-Registration</p><p className="text-xs text-muted-foreground">Let users create accounts without admin approval</p></div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={security.allowSelfRegistration} onChange={e => setSecurity(f => ({ ...f, allowSelfRegistration: e.target.checked }))} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Palette className="w-4 h-4 text-orange-500" />Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Default Theme</label>
                  <div className="flex gap-3">
                    <button onClick={() => setBranding(f => ({ ...f, theme: 'light' }))} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${branding.theme === 'light' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-input bg-background'}`}>
                      <Sun className="w-4 h-4" /> Light
                    </button>
                    <button onClick={() => setBranding(f => ({ ...f, theme: 'dark' }))} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${branding.theme === 'dark' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-input bg-background'}`}>
                      <Moon className="w-4 h-4" /> Dark
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={branding.primaryColor} onChange={e => setBranding(f => ({ ...f, primaryColor: e.target.value }))} className="w-12 h-10 rounded border cursor-pointer" />
                    <input type="text" value={branding.primaryColor} onChange={e => setBranding(f => ({ ...f, primaryColor: e.target.value }))} className="flex-1 border rounded-md px-3 py-2 text-sm bg-background font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Footer Text</label>
                  <input type="text" value={branding.footerText} onChange={e => setBranding(f => ({ ...f, footerText: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-orange-500" />Brand Assets</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Logo URL</label>
                  <input type="text" value={branding.logoUrl} onChange={e => setBranding(f => ({ ...f, logoUrl: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="https://example.com/logo.png" />
                  {branding.logoUrl && (
                    <div className="mt-2 p-3 bg-accent rounded-lg flex items-center gap-3">
                      <img src={branding.logoUrl} alt="Logo preview" className="w-12 h-12 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-xs text-muted-foreground">Logo preview</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Favicon URL</label>
                  <input type="text" value={branding.faviconUrl} onChange={e => setBranding(f => ({ ...f, faviconUrl: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm bg-background" placeholder="https://example.com/favicon.ico" />
                </div>
                <div className="p-4 bg-accent rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Preview</p>
                  <div className="flex items-center gap-2">
                    {branding.logoUrl ? (
                      <img src={branding.logoUrl} alt="" className="w-8 h-8 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center text-white font-bold text-xs">CS</div>
                    )}
                    <span className="text-sm font-semibold" style={{ color: branding.primaryColor }}>{general.schoolName}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
