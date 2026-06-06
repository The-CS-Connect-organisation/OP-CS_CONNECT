import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, AlertTriangle, Eye, Check, X, Calendar, User, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface Report {
  id: string;
  title: string;
  description: string;
  reportedBy: string;
  date: string;
  category: 'bullying' | 'safety' | 'maintenance' | 'other';
  status: 'pending' | 'reviewed' | 'resolved';
  anonymous: boolean;
}

export default function AdminAnonymousReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getAnonymousReports();
        if (Array.isArray(data)) setReports(data);
      } catch (err) { console.error('[AdminAnonymousReports] Failed to load:', err); }
    })();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    const prev = reports;
    try {
      await api.updateAnonymousReportStatus(id, status);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: status as Report['status'] } : r));
    } catch (err) {
      console.error('[AdminAnonymousReports] Failed to update status:', err);
      setReports(prev);
    }
  };

  const filteredReports = reports.filter(r => filter === 'all' || r.status === filter);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bullying': return 'bg-red-100 text-red-700';
      case 'safety': return 'bg-orange-100 text-orange-700';
      case 'maintenance': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Anonymous Reports</h1>
        <p className="text-muted-foreground">View anonymous reports</p>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'reviewed', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-accent hover:bg-accent/80'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredReports.map(report => (
          <Card key={report.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-lg">{report.title}</h3>
                  <Badge className={getCategoryColor(report.category)}>{report.category}</Badge>
                  {report.anonymous && <Badge variant="outline">Anonymous</Badge>}
                </div>
                <p className="text-muted-foreground mb-2">{report.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="w-4 h-4" />{report.reportedBy}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(report.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-accent rounded"><Eye className="w-4 h-4" /></button>
                {report.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatus(report.id, 'reviewed')} className="p-2 hover:bg-green-100 rounded text-green-500"><Check className="w-4 h-4" /></button>
                    <button onClick={() => handleStatus(report.id, 'resolved')} className="p-2 hover:bg-red-100 rounded text-red-500"><X className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
