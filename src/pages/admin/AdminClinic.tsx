import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Stethoscope, Calendar, User, Clock, Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface ClinicVisit {
  id: string;
  studentName: string;
  class: string;
  reason: string;
  treatment: string;
  date: string;
  time: string;
  nurse: string;
  status: 'completed' | 'follow-up' | 'referred';
}

export default function AdminClinic() {
  const [visits, setVisits] = useState<ClinicVisit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getClinicVisits();
        if (Array.isArray(data)) setVisits(data);
      } catch (err) { console.error('[AdminClinic] Failed to load:', err); }
    })();
  }, []);

  const filteredVisits = visits.filter(v => v.studentName.toLowerCase().includes(searchQuery.toLowerCase()));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'follow-up': return 'bg-orange-100 text-orange-700';
      case 'referred': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">School Clinic</h1>
          <p className="text-muted-foreground">Clinic visit records</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />New Visit</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
      </div>

      <div className="space-y-3">
        {filteredVisits.map(visit => (
          <Card key={visit.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{visit.studentName}</h4>
                  <p className="text-sm text-muted-foreground">Class: {visit.class}</p>
                  <p className="text-sm mt-1"><span className="font-medium">Reason:</span> {visit.reason}</p>
                  <p className="text-sm"><span className="font-medium">Treatment:</span> {visit.treatment}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(visit.status)}>{visit.status}</Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(visit.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{visit.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{visit.nurse}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
