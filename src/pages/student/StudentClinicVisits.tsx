import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Stethoscope, Plus, Calendar, User, Clock } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

export default function StudentClinicVisits() {
  const { user } = useAuthStore();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');
  const [treatment, setTreatment] = useState('');
  const [nurse, setNurse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    try {
      const data = await api.getClinicVisits();
      setVisits(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await api.createClinicVisit({
        studentName: user?.name || 'Unknown',
        class: (user as any)?.class || '',
        reason,
        treatment,
        nurse: nurse || 'School Nurse',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
      });
      setReason('');
      setTreatment('');
      setNurse('');
      setShowForm(false);
      refresh();
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'follow-up': return 'bg-orange-100 text-orange-700';
      case 'referred': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="p-6"><Card className="p-8 animate-pulse h-48" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">School Clinic</h1>
          <p className="text-muted-foreground">Log your clinic visits</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Log Visit'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4 border-orange-200">
          <h3 className="font-semibold text-lg">Log a Clinic Visit</h3>
          <p className="text-sm text-muted-foreground">Record your visit to the school clinic.</p>
          <div>
            <label className="block text-sm font-medium mb-1">Reason for Visit</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe why you visited the clinic..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border bg-background resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Treatment Given</label>
            <textarea
              value={treatment}
              onChange={e => setTreatment(e.target.value)}
              placeholder="What treatment was provided?"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border bg-background resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nurse / Attended By</label>
            <input
              type="text"
              value={nurse}
              onChange={e => setNurse(e.target.value)}
              placeholder="Nurse's name"
              className="w-full px-3 py-2 rounded-lg border bg-background"
            />
          </div>
          <Button onClick={handleSubmit} disabled={submitting || !reason.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            {submitting ? 'Saving...' : 'Log Visit'}
          </Button>
        </Card>
      )}

      <div className="space-y-3">
        {visits.length === 0 ? (
          <Card className="p-8 text-center">
            <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No visits recorded</h3>
            <p className="text-muted-foreground">Click "Log Visit" to record a clinic visit.</p>
          </Card>
        ) : (
          visits.map(visit => (
            <Card key={visit.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{visit.studentName}</h4>
                    <p className="text-sm text-muted-foreground">Class: {visit.class}</p>
                    <p className="text-sm mt-1"><span className="font-medium">Reason:</span> {visit.reason}</p>
                    {visit.treatment && <p className="text-sm"><span className="font-medium">Treatment:</span> {visit.treatment}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(visit.status)}>{visit.status}</Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(visit.date).toLocaleDateString()}</span>
                  </div>
                  {visit.time && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{visit.time}</span>
                    </div>
                  )}
                  {visit.nurse && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{visit.nurse}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
