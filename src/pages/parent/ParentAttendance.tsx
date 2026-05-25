import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { UserCheck, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  studentName: string;
  class: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export default function ParentAttendance() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState('child1');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadRecords();
  }, [selectedChild, selectedMonth]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await api.getChildAttendance(selectedChild, selectedMonth);
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const attendanceRate = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700';
      case 'absent': return 'bg-red-100 text-red-700';
      case 'late': return 'bg-orange-100 text-orange-700';
      case 'excused': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Child Attendance</h1>
        <p className="text-muted-foreground">View attendance records</p>
      </div>

      <div className="flex gap-4">
        <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          <option value="child1">Child 1</option>
          <option value="child2">Child 2</option>
        </select>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-4 py-2 rounded-lg border bg-background" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{attendanceRate}%</p>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{presentCount}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{absentCount}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{lateCount}</p>
              <p className="text-sm text-muted-foreground">Late</p>
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="space-y-3">
          {records.map(record => (
            <Card key={record.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <div>
                    <h4 className="font-medium">{new Date(record.date).toLocaleDateString()}</h4>
                    <p className="text-sm text-muted-foreground">{record.studentName} - {record.class}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
