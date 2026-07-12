import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { NavSheet } from '../../components/ui/NavSheet';
import { HeartPulse, Calendar, FileText, Plus, Stethoscope } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

export default function StudentHealth() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitReason, setVisitReason] = useState('');
  const [visitTreatment, setVisitTreatment] = useState('');
  const [visitNurse, setVisitNurse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [r, v] = await Promise.all([
        api.getHealthRecords().catch(() => []),
        api.getClinicVisits().catch(() => []),
      ]);
      setRecords(Array.isArray(r) ? r : []);
      setVisits(Array.isArray(v) ? v : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleLogVisit = async () => {
    if (!visitReason.trim()) return;
    setSubmitting(true);
    try {
      await api.createClinicVisit({
        studentName: user?.name || '',
        reason: visitReason,
        treatment: visitTreatment,
        nurse: visitNurse || 'School Nurse',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
      });
      setVisitReason(''); setVisitTreatment(''); setVisitNurse('');
      setShowVisitForm(false);
      load();
    } catch {}
    setSubmitting(false);
  };

  const visitFormContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Reason for Visit *</label>
        <textarea
          value={visitReason}
          onChange={e => setVisitReason(e.target.value)}
          placeholder="Describe why you visited the clinic..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm text-gray-900 resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Treatment Given</label>
        <textarea
          value={visitTreatment}
          onChange={e => setVisitTreatment(e.target.value)}
          placeholder="What treatment was provided?"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm text-gray-900 resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nurse / Attended By</label>
        <input
          type="text"
          value={visitNurse}
          onChange={e => setVisitNurse(e.target.value)}
          placeholder="Nurse's name"
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm text-gray-900"
        />
      </div>
      <Button onClick={handleLogVisit} disabled={submitting || !visitReason.trim()}>
        <Plus className="w-4 h-4 mr-1.5" />{submitting ? 'Saving...' : 'Log Visit'}
      </Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health Services</h1>
          <p className="text-gray-900">Medical records, clinic visits and appointments</p>
        </div>
        <Button onClick={() => setShowVisitForm(true)} className="sm:hidden">
          <Plus className="w-4 h-4 mr-1.5" />Log Visit
        </Button>
        <Button onClick={() => setShowVisitForm(true)} className="hidden sm:flex">
          <Plus className="w-4 h-4 mr-1.5" />Log Visit
        </Button>
      </div>

      <NavSheet isOpen={showVisitForm} onClose={() => setShowVisitForm(false)} title="Log Clinic Visit">
        {visitFormContent}
      </NavSheet>

      {loading ? (
        <Skeleton className="h-32" />
      ) : (
        <>
          {visits.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-orange-500" />Recent Visits
              </h3>
              <div className="space-y-3">
                {visits.slice(0, 5).map((v: any) => (
                  <Card key={v.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Stethoscope className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">{v.reason}</p>
                        {v.treatment && <p className="text-xs text-gray-500 mt-0.5">{v.treatment}</p>}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(v.date).toLocaleDateString()}</span>
                          {v.nurse && <span>by {v.nurse}</span>}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />Health Records
            </h3>
            {records.length === 0 ? (
              <Card className="p-8 text-center">
                <HeartPulse className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900">No health records</h3>
                <p className="text-gray-500">Visit the school clinic for medical assistance. Records will appear here after your first visit.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {records.map((r: any) => (
                  <Card key={r.id} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-gray-900">{r.type || r.recordType || 'Health Record'}</span>
                    </div>
                    <p className="text-sm text-gray-600">{r.description || r.notes || ''}</p>
                    {r.date && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(r.date).toLocaleDateString()}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
