import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
  Bell, AlertTriangle, Shield, Mail, Languages, Plus, Search,
  Check, X, Send, MessageSquare, Eye, Globe, AlertCircle
} from 'lucide-react';

interface PushNotification {
  id: string; title: string; body: string; targetRole: string;
  targetClass?: string; sentAt: string; status: string;
}
interface EmergencyAlert {
  id: string; title: string; message: string; severity: string;
  targetAudience: string; createdAt: string; status: string;
}
interface ModerationItem {
  id: string; contentType: string; content: string;
  reportedBy: string; reason: string; status: string; createdAt: string;
}
interface EmailLog {
  id: string; to: string; subject: string; body: string;
  status: string; sentAt: string;
}
interface Translation {
  id: string; key: string; locale: string; value: string;
}

export default function ManagerComms() {
  const [tab, setTab] = useState('push');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, e, m, el, t] = await Promise.all([
        api.getPushNotifications(), api.getEmergencyAlerts(),
        api.getModerationQueue(), api.getEmailLogs(), api.getTranslations(),
      ]);
      setPushNotifications(Array.isArray(p) ? p : []);
      setEmergencyAlerts(Array.isArray(e) ? e : []);
      setModerationQueue(Array.isArray(m) ? m : []);
      setEmailLogs(Array.isArray(el) ? el : []);
      setTranslations(Array.isArray(t) ? t : []);
    } catch { /* error */ } finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (tab === 'push') {
        await api.sendPushNotification(form);
        const data = await api.getPushNotifications();
        setPushNotifications(Array.isArray(data) ? data : []);
      } else if (tab === 'emergency') {
        await api.createEmergencyAlert(form);
        const data = await api.getEmergencyAlerts();
        setEmergencyAlerts(Array.isArray(data) ? data : []);
      } else if (tab === 'email') {
        await api.sendEmail(form);
        const data = await api.getEmailLogs();
        setEmailLogs(Array.isArray(data) ? data : []);
      } else if (tab === 'translations') {
        await api.createTranslation(form);
        const data = await api.getTranslations();
        setTranslations(Array.isArray(data) ? data : []);
      }
      setShowForm(false);
      setForm({});
    } catch { /* error */ }
  };

  const handleModerate = async (id: string, action: string) => {
    try {
      await api.moderateContent(id, action, 'manager');
      setModerationQueue(prev => prev.map(m => m.id === id ? { ...m, status: action } : m));
    } catch { /* error */ }
  };

  const getForm = () => {
    switch (tab) {
      case 'push':
        return (
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} />
            <Textarea placeholder="Body" value={form.body || ''} onChange={e => setForm({...form, body: e.target.value})} />
            <Input placeholder="Target Role (e.g. student, teacher, parent)" value={form.targetRole || ''} onChange={e => setForm({...form, targetRole: e.target.value})} />
            <Input placeholder="Target Class (optional)" value={form.targetClass || ''} onChange={e => setForm({...form, targetClass: e.target.value})} />
          </div>
        );
      case 'emergency':
        return (
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} />
            <Textarea placeholder="Message" value={form.message || ''} onChange={e => setForm({...form, message: e.target.value})} />
            <Input placeholder="Severity (critical, high, medium, low)" value={form.severity || ''} onChange={e => setForm({...form, severity: e.target.value})} />
            <Input placeholder="Target Audience" value={form.targetAudience || ''} onChange={e => setForm({...form, targetAudience: e.target.value})} />
          </div>
        );
      case 'email':
        return (
          <div className="space-y-3">
            <Input placeholder="To (comma separated)" value={form.to || ''} onChange={e => setForm({...form, to: e.target.value})} />
            <Input placeholder="Subject" value={form.subject || ''} onChange={e => setForm({...form, subject: e.target.value})} />
            <Textarea placeholder="Body" value={form.body || ''} onChange={e => setForm({...form, body: e.target.value})} />
          </div>
        );
      case 'translations':
        return (
          <div className="space-y-3">
            <Input placeholder="Key (e.g. welcome_message)" value={form.key || ''} onChange={e => setForm({...form, key: e.target.value})} />
            <Input placeholder="Locale (e.g. en, fr, es)" value={form.locale || ''} onChange={e => setForm({...form, locale: e.target.value})} />
            <Textarea placeholder="Value" value={form.value || ''} onChange={e => setForm({...form, value: e.target.value})} />
          </div>
        );
      default:
        return null;
    }
  };

  const showComposeButton = ['push', 'email'].includes(tab);
  const showCreateButton = ['emergency', 'translations'].includes(tab);

  if (loading) return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Communications</h1><p className="text-muted-foreground">Manage communications</p></div>
      <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Communications</h1>
          <p className="text-muted-foreground">Manage communications</p>
        </div>
        <div className="flex gap-2">
          {showComposeButton && (
            <Button onClick={() => { setForm({}); setShowForm(true); }}>
              <Send className="w-4 h-4 mr-2" />Compose
            </Button>
          )}
          {showCreateButton && (
            <Button onClick={() => { setForm({}); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />Create
            </Button>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="push"><Bell className="w-4 h-4 mr-1" />Push</TabsTrigger>
          <TabsTrigger value="emergency"><AlertTriangle className="w-4 h-4 mr-1" />Emergency</TabsTrigger>
          <TabsTrigger value="moderation"><Shield className="w-4 h-4 mr-1" />Moderation</TabsTrigger>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-1" />Email</TabsTrigger>
          <TabsTrigger value="translations"><Languages className="w-4 h-4 mr-1" />Translations</TabsTrigger>
        </TabsList>

        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {showForm && (
          <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-4">
              {tab === 'push' && 'Send Push Notification'}
              {tab === 'emergency' && 'Create Emergency Alert'}
              {tab === 'email' && 'Send Email'}
              {tab === 'translations' && 'Add Translation'}
            </h3>
            {getForm()}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave}>
                {tab === 'push' || tab === 'email' ? <><Send className="w-4 h-4 mr-2" />Send</> : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setForm({}); }}>Cancel</Button>
            </div>
          </Card>
        )}

        <TabsContent value="push" className="space-y-3">
          {pushNotifications.filter(p => p.title?.toLowerCase().includes(search.toLowerCase())).map(pn => (
            <Card key={pn.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <h4 className="font-semibold">{pn.title}</h4>
                    <Badge variant="secondary">{pn.targetRole}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pn.body}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{pn.targetClass && `Class: ${pn.targetClass}`}</span>
                    <span>{new Date(pn.sentAt).toLocaleString()}</span>
                    <Badge variant={pn.status === 'sent' ? 'success' : 'warning'} className="text-xs">{pn.status}</Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {pushNotifications.length === 0 && <p className="text-center text-muted-foreground py-8">No push notifications</p>}
        </TabsContent>

        <TabsContent value="emergency" className="space-y-3">
          {emergencyAlerts.filter(e => e.title?.toLowerCase().includes(search.toLowerCase())).map(ea => {
            const severityColors: Record<string, string> = {
              critical: 'border-red-500 bg-red-50 dark:bg-red-950/20',
              high: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
              medium: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
              low: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
            };
            const severityBadgeVariants: Record<string, string> = {
              critical: 'destructive',
              high: 'warning',
              medium: 'warning',
              low: 'secondary',
            };
            return (
              <Card key={ea.id} className={`p-4 border-2 ${severityColors[ea.severity] || ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className={`w-5 h-5 ${ea.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                      <h4 className="font-semibold">{ea.title}</h4>
                      <Badge variant={(severityBadgeVariants[ea.severity] || 'secondary') as any}>{ea.severity}</Badge>
                    </div>
                    <p className="text-sm">{ea.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>Target: {ea.targetAudience}</span>
                      <span>{new Date(ea.createdAt).toLocaleString()}</span>
                      <Badge variant="outline">{ea.status}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          {emergencyAlerts.length === 0 && <p className="text-center text-muted-foreground py-8">No emergency alerts</p>}
        </TabsContent>

        <TabsContent value="moderation" className="space-y-3">
          {moderationQueue.filter(m => m.content?.toLowerCase().includes(search.toLowerCase())).map(item => (
            <Card key={item.id} className={`p-4 ${item.status === 'pending' ? 'border-amber-300' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <h4 className="font-semibold">{item.contentType}</h4>
                    <Badge variant={item.status === 'pending' ? 'warning' : item.status === 'approved' ? 'success' : 'destructive'}>{item.status}</Badge>
                  </div>
                  <p className="text-sm bg-accent p-2 rounded mb-2">{item.content}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Reported by: {item.reportedBy}</span>
                    <span>Reason: {item.reason}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {item.status === 'pending' && (
                  <div className="flex gap-1 ml-4">
                    <Button size="sm" variant="outline" onClick={() => handleModerate(item.id, 'approved')} className="text-green-600 border-green-300"><Check className="w-4 h-4 mr-1" />Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => handleModerate(item.id, 'rejected')} className="text-red-600 border-red-300"><X className="w-4 h-4 mr-1" />Reject</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {moderationQueue.length === 0 && <p className="text-center text-muted-foreground py-8">No items in queue</p>}
        </TabsContent>

        <TabsContent value="email" className="space-y-3">
          {emailLogs.filter(e => e.subject?.toLowerCase().includes(search.toLowerCase()) || e.to?.toLowerCase().includes(search.toLowerCase())).map(email => (
            <Card key={email.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <h4 className="font-semibold">{email.subject}</h4>
                    <Badge variant={email.status === 'sent' ? 'success' : email.status === 'failed' ? 'destructive' : 'warning'}>{email.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">To: {email.to}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(email.sentAt).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          ))}
          {emailLogs.length === 0 && <p className="text-center text-muted-foreground py-8">No emails sent</p>}
        </TabsContent>

        <TabsContent value="translations" className="space-y-3">
          {translations.filter(t => t.key?.toLowerCase().includes(search.toLowerCase()) || t.value?.toLowerCase().includes(search.toLowerCase())).map(tr => (
            <Card key={tr.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-orange-500" />
                    <h4 className="font-semibold font-mono text-sm">{tr.key}</h4>
                    <Badge variant="secondary">{tr.locale}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tr.value}</p>
                </div>
              </div>
            </Card>
          ))}
          {translations.length === 0 && <p className="text-center text-muted-foreground py-8">No translations</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
