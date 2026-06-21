import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkipForward, Calendar, User, Bus, Send } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

export default function StudentSkipBus() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [parentApproved, setParentApproved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    try {
      const [reqData, busData] = await Promise.all([
        api.getSkipBusRequests(),
        api.getRoutes().catch(() => []),
      ]);
      setRequests(Array.isArray(reqData) ? reqData : []);
      setBuses(Array.isArray(busData) ? busData : []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleSubmit = async () => {
    if (!selectedRoute || !date || !reason.trim()) return;
    setSubmitting(true);
    try {
      await api.createSkipBusRequest({
        studentName: user?.name || 'Unknown',
        class: (user as any)?.class || '',
        busRoute: selectedRoute,
        date,
        reason,
        status: 'pending',
        parentApproved,
      });
      setSelectedRoute('');
      setReason('');
      setParentApproved(false);
      setShowForm(false);
      refresh();
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const userRequests = requests.filter((r: any) => r.studentName === user?.name);

  if (loading) return <div className="p-6"><Card className="p-8 animate-pulse h-48" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skip the Bus</h1>
          <p className="text-muted-foreground">Request to skip bus service for a day</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <SkipForward className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4 border-orange-200">
          <h3 className="font-semibold text-lg">Request to Skip Bus</h3>
          <p className="text-sm text-muted-foreground">Submit a request to skip the bus for a specific day.</p>
          <div>
            <label className="block text-sm font-medium mb-1">Bus Route</label>
            <select
              value={selectedRoute}
              onChange={e => setSelectedRoute(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            >
              <option value="">Select a route...</option>
              {buses.map((b: any) => (
                <option key={b.id} value={b.name || b.id}>{b.name} ({b.bus})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Why do you need to skip the bus?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border bg-background resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="parentApproved"
              checked={parentApproved}
              onChange={e => setParentApproved(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="parentApproved" className="text-sm">My parent has approved this request</label>
          </div>
          <Button onClick={handleSubmit} disabled={submitting || !selectedRoute || !date || !reason.trim()}>
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </Card>
      )}

      <div className="space-y-3">
        {userRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <SkipForward className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No skip requests</h3>
            <p className="text-muted-foreground">Click "New Request" to request skipping the bus.</p>
          </Card>
        ) : (
          userRequests.map(request => (
            <Card key={request.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
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
                      <span className="flex items-center gap-1"><User className="w-4 h-4" />Parent: {request.parentApproved ? 'Approved ✓' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
