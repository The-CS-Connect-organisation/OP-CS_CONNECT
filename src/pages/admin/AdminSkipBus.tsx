import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkipForward, Search, Calendar, User, Bus, Check, X, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface SkipRequest {
  id: string;
  studentName: string;
  class: string;
  busRoute: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  parentApproved: boolean;
}

export default function AdminSkipBus() {
  const [requests, setRequests] = useState<SkipRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getSkipBusRequests();
        if (Array.isArray(data)) setRequests(data);
      } catch (err) { console.error('[AdminSkipBus] Failed to load:', err); }
    })();
  }, []);

  const handleApprove = async (id: string) => {
    const prev = requests;
    try {
      await api.approveSkipBusRequest(id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
    } catch (err) {
      console.error('[AdminSkipBus] Failed to approve:', err);
      setRequests(prev);
    }
  };

  const handleReject = async (id: string) => {
    const prev = requests;
    try {
      await api.rejectSkipBusRequest(id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));
    } catch (err) {
      console.error('[AdminSkipBus] Failed to reject:', err);
      setRequests(prev);
    }
  };

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Skip the Bus</h1>
        <p className="text-muted-foreground">Bus skip requests</p>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-accent hover:bg-accent/80'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredRequests.map(request => (
          <Card key={request.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <SkipForward className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{request.studentName}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Class: {request.class}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Bus className="w-4 h-4" />{request.busRoute}</span>
                  </div>
                  <p className="text-sm mt-1"><span className="font-medium">Reason:</span> {request.reason}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(request.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><User className="w-4 h-4" />Parent: {request.parentApproved ? 'Approved' : 'Pending'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                {request.status === 'pending' && request.parentApproved && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleApprove(request.id)}><Check className="w-4 h-4 mr-1" />Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}><X className="w-4 h-4 mr-1" />Reject</Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
