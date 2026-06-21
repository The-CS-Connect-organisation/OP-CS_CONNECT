import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Eye, Calendar, User, Search } from 'lucide-react';
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

export default function ManagerAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadAuditLog() {
      try {
        const data = await apiFetch('/audit-log');
        setEntries(data);
      } catch (err) {
        console.error('[ManagerAuditLog] Failed to load:', err);
      }
    }
    loadAuditLog();
  }, []);
  const filteredEntries = entries.filter(e => e.user.toLowerCase().includes(searchQuery.toLowerCase()) || e.details.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">System audit trail</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
      </div>

      <div className="space-y-3">
        {filteredEntries.map(entry => (
          <Card key={entry.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"><Eye className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <h4 className="font-semibold">{entry.action}</h4>
                  <p className="text-sm text-muted-foreground">{entry.details}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><User className="w-4 h-4" />{entry.user}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{entry.timestamp}</span>
                    <span>IP: {entry.ip}</span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary">{entry.role}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
