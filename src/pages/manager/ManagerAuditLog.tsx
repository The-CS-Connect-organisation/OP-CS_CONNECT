import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Eye, Calendar, User, Search } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  details: string;
  ip: string;
}

const mockEntries: AuditEntry[] = [
  { id: '1', action: 'User Created', user: 'Admin', role: 'admin', timestamp: '2026-05-15 10:30', details: 'Created new teacher account for John Doe', ip: '192.168.1.100' },
  { id: '2', action: 'Grade Updated', user: 'Mr. Smith', role: 'teacher', timestamp: '2026-05-15 09:45', details: 'Updated math grades for class 10-A', ip: '192.168.1.101' },
  { id: '3', action: 'Fee Payment', user: 'Parent A', role: 'parent', timestamp: '2026-05-14 14:20', details: 'Paid tuition fee $2500', ip: '10.0.0.50' },
  { id: '4', action: 'Login Failed', user: 'Unknown', role: 'unknown', timestamp: '2026-05-14 03:15', details: 'Failed login attempt - invalid credentials', ip: '203.0.113.50' },
  { id: '5', action: 'Settings Changed', user: 'Manager', role: 'manager', timestamp: '2026-05-13 16:00', details: 'Updated school name and timezone', ip: '192.168.1.1' },
];

export default function ManagerAuditLog() {
  const [entries] = useState<AuditEntry[]>(mockEntries);
  const [searchQuery, setSearchQuery] = useState('');
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
