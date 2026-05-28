import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Bell, AlertTriangle, Shield, Mail, Languages, Send, Search, CheckCircle, XCircle, Eye, Filter, Plus } from 'lucide-react';

interface PushNotification {
  id: string;
  title: string;
  message: string;
  target: string;
  targetClass?: string;
  sentAt: string;
  readCount: number;
}

interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  target: string;
  createdAt: string;
}

interface ModerationItem {
  id: string;
  reporter: string;
  contentPreview: string;
  type: string;
  date: string;
}

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed';
  timestamp: string;
}

interface Translation {
  id: string;
  key: string;
  locale: string;
  value: string;
}

export default function AdminComms() {
  const [pushList, setPushList] = useState<PushNotification[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [modQueue, setModQueue] = useState<ModerationItem[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('push');

  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushTarget, setPushTarget] = useState('all');
  const [pushClass, setPushClass] = useState('');

  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'high' | 'medium' | 'low'>('high');
  const [alertTarget, setAlertTarget] = useState('');

  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [transKey, setTransKey] = useState('');
  const [transLocale, setTransLocale] = useState('');
  const [transValue, setTransValue] = useState('');
  const [localeFilter, setLocaleFilter] = useState('all');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [push, alertsData, mod, email, trans] = await Promise.all([
        api.getPushNotifications(),
        api.getEmergencyAlerts(),
        api.getModerationQueue(),
        api.getEmailLogs(),
        api.getTranslations(),
      ]);
      setPushList(Array.isArray(push) ? push : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setModQueue(Array.isArray(mod) ? mod : []);
      setEmailLogs(Array.isArray(email) ? email : []);
      setTranslations(Array.isArray(trans) ? trans : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleSendPush = async () => {
    try {
      await api.sendPushNotification({ title: pushTitle, message: pushMessage, targetRole: pushTarget, targetClass: pushClass || undefined });
      setPushTitle('');
      setPushMessage('');
      setPushTarget('all');
      setPushClass('');
      loadAll();
    } catch {
      // error
    }
  };

  const handleCreateAlert = async () => {
    try {
      await api.createEmergencyAlert({ title: alertTitle, message: alertMessage, severity: alertSeverity, target: alertTarget });
      setAlertTitle('');
      setAlertMessage('');
      setAlertSeverity('high');
      setAlertTarget('');
      loadAll();
    } catch {
      // error
    }
  };

  const handleSendEmail = async () => {
    try {
      await api.sendEmail({ to: emailTo, subject: emailSubject, body: emailBody });
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
      loadAll();
    } catch {
      // error
    }
  };

  const handleCreateTranslation = async () => {
    try {
      await api.createTranslation({ key: transKey, locale: transLocale, value: transValue });
      setTransKey('');
      setTransLocale('');
      setTransValue('');
      loadAll();
    } catch {
      // error
    }
  };

  const handleModerate = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const userId = localStorage.getItem('eduvault-user-id') || '';
      await api.moderateContent(id, action, userId);
      loadAll();
    } catch {
      // error
    }
  };

  const severityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    low: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  const filteredTranslations = localeFilter === 'all'
    ? translations
    : translations.filter(t => t.locale === localeFilter);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Communications</h1>
        <p className="text-muted-foreground">Push notifications, alerts, moderation, email & translations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="push"><Bell className="w-4 h-4 mr-1" />Push</TabsTrigger>
          <TabsTrigger value="alerts"><AlertTriangle className="w-4 h-4 mr-1" />Alerts</TabsTrigger>
          <TabsTrigger value="moderation"><Shield className="w-4 h-4 mr-1" />Moderation</TabsTrigger>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-1" />Email</TabsTrigger>
          <TabsTrigger value="translations"><Languages className="w-4 h-4 mr-1" />Translations</TabsTrigger>
        </TabsList>

        <TabsContent value="push" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Send Push Notification</h3>
            <div className="space-y-3">
              <Input placeholder="Title" value={pushTitle} onChange={e => setPushTitle(e.target.value)} />
              <Textarea placeholder="Message" value={pushMessage} onChange={e => setPushMessage(e.target.value)} />
              <div className="flex gap-3">
                <select value={pushTarget} onChange={e => setPushTarget(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border bg-background text-sm">
                  <option value="all">All</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="parent">Parents</option>
                </select>
                <Input placeholder="Target class (optional)" value={pushClass} onChange={e => setPushClass(e.target.value)} />
              </div>
              <Button onClick={handleSendPush}><Send className="w-4 h-4 mr-2" />Send</Button>
            </div>
          </Card>
          <div className="space-y-3">
            {pushList.map(p => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{p.title}</h4>
                    <p className="text-sm text-muted-foreground">{p.message}</p>
                    <p className="text-xs text-muted-foreground">Target: {p.target}{p.targetClass ? ` / ${p.targetClass}` : ''} • {new Date(p.sentAt).toLocaleString()}</p>
                  </div>
                  <Badge variant="info">{p.readCount} reads</Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Create Emergency Alert</h3>
            <div className="space-y-3">
              <Input placeholder="Alert title" value={alertTitle} onChange={e => setAlertTitle(e.target.value)} />
              <Textarea placeholder="Alert message" value={alertMessage} onChange={e => setAlertMessage(e.target.value)} />
              <div className="flex gap-3">
                <select value={alertSeverity} onChange={e => setAlertSeverity(e.target.value as any)} className="flex-1 px-4 py-2.5 rounded-xl border bg-background text-sm">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <Input placeholder="Target audience" value={alertTarget} onChange={e => setAlertTarget(e.target.value)} />
              </div>
              <Button onClick={handleCreateAlert} variant="destructive"><AlertTriangle className="w-4 h-4 mr-2" />Create Alert</Button>
            </div>
          </Card>
          <div className="space-y-3">
            {alerts.map(a => (
              <Card key={a.id} className="p-4 border-l-4" style={{ borderLeftColor: a.severity === 'high' ? '#ef4444' : a.severity === 'medium' ? '#f97316' : '#eab308' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{a.title}</h4>
                    <p className="text-sm text-muted-foreground">{a.message}</p>
                    <p className="text-xs text-muted-foreground">Target: {a.target} • {new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge className={severityColors[a.severity]}>{a.severity}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{modQueue.length} items in queue</p>
            <Button variant="outline" size="sm" onClick={loadAll}><Eye className="w-4 h-4 mr-1" />Refresh</Button>
          </div>
          <div className="space-y-3">
            {modQueue.map(item => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{item.reporter}</h4>
                      <Badge variant="outline">{item.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.contentPreview}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleModerate(item.id, 'approved')}><CheckCircle className="w-4 h-4 mr-1" />Approve</Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleModerate(item.id, 'rejected')}><XCircle className="w-4 h-4 mr-1" />Reject</Button>
                  </div>
                </div>
              </Card>
            ))}
            {modQueue.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No items in moderation queue</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Send Email</h3>
            <div className="space-y-3">
              <Input placeholder="To (recipient email)" value={emailTo} onChange={e => setEmailTo(e.target.value)} />
              <Input placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
              <Textarea placeholder="Email body" className="min-h-[120px]" value={emailBody} onChange={e => setEmailBody(e.target.value)} />
              <Button onClick={handleSendEmail}><Send className="w-4 h-4 mr-2" />Send Email</Button>
            </div>
          </Card>
          <div className="space-y-3">
            {emailLogs.map(log => (
              <Card key={log.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{log.subject}</h4>
                    <p className="text-sm text-muted-foreground">To: {log.recipient}</p>
                    <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                  <Badge variant={log.status === 'sent' ? 'success' : 'destructive'}>{log.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Add Translation</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Input placeholder="Key (e.g. welcome.title)" value={transKey} onChange={e => setTransKey(e.target.value)} />
                <Input placeholder="Locale (e.g. fr, es)" className="w-32" value={transLocale} onChange={e => setTransLocale(e.target.value)} />
              </div>
              <Textarea placeholder="Translation value" value={transValue} onChange={e => setTransValue(e.target.value)} />
              <Button onClick={handleCreateTranslation}><Plus className="w-4 h-4 mr-2" />Add Translation</Button>
            </div>
          </Card>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select value={localeFilter} onChange={e => setLocaleFilter(e.target.value)} className="px-4 py-2 rounded-xl border bg-background text-sm">
              <option value="all">All Locales</option>
              {[...new Set(translations.map(t => t.locale))].map(locale => (
                <option key={locale} value={locale}>{locale}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            {filteredTranslations.map(t => (
              <Card key={t.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <code className="text-sm font-mono bg-accent px-2 py-0.5 rounded">{t.key}</code>
                    <p className="text-sm text-muted-foreground mt-1">{t.value}</p>
                  </div>
                  <Badge variant="outline">{t.locale}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
