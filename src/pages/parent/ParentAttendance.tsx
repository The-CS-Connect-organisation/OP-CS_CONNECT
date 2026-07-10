import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { UserCheck, Calendar, TrendingUp, AlertCircle, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  studentName: string;
  class: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

interface ChildInfo {
  id: string;
  name: string;
  class: string;
}

interface ChildWithAttendance {
  child: ChildInfo;
  records: AttendanceRecord[];
  loading: boolean;
  error?: string;
}

export default function ParentAttendance() {
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [childrenWithData, setChildrenWithData] = useState<ChildWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAllChildrenAttendance();
  }, [selectedMonth]);

  const loadAllChildrenAttendance = async () => {
    try {
      setLoading(true);
      const childrenRes = await api.getChildren();
      const childrenList: ChildInfo[] = childrenRes?.success ? (childrenRes.children || []) : [];
      setChildren(childrenList);

      if (childrenList.length === 0) {
        setChildrenWithData([]);
        setLoading(false);
        return;
      }

      setExpandedChildren(new Set(childrenList.map(c => c.id)));

      setChildrenWithData(childrenList.map(child => ({
        child,
        records: [],
        loading: true,
      })));

      const results = await Promise.allSettled(
        childrenList.map(child =>
          api.getChildAttendance(child.id, selectedMonth).then(data => ({
            childId: child.id,
            records: data?.attendanceRecords || (Array.isArray(data) ? data : []),
          }))
        )
      );

      setChildrenWithData(prev =>
        prev.map(item => {
          const result = results.find(
            r => r.status === 'fulfilled' && r.value.childId === item.child.id
          );
          if (result && result.status === 'fulfilled') {
            return { ...item, records: result.value.records, loading: false };
          }
          return { ...item, loading: false, error: 'Failed to load' };
        })
      );
    } catch (err) {
      console.error('[ParentAttendance] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleChild = (childId: string) => {
    setExpandedChildren(prev => {
      const next = new Set(prev);
      if (next.has(childId)) next.delete(childId);
      else next.add(childId);
      return next;
    });
  };

  const getAllRecords = () => childrenWithData.flatMap(c => c.records);
  const allRecords = getAllRecords();
  const totalPresent = allRecords.filter(r => r.status === 'present').length;
  const totalAbsent = allRecords.filter(r => r.status === 'absent').length;
  const totalLate = allRecords.filter(r => r.status === 'late').length;
  const overallRate = allRecords.length > 0 ? Math.round((totalPresent / allRecords.length) * 100) : 0;

  const getChildStats = (records: AttendanceRecord[]) => {
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const rate = records.length > 0 ? Math.round((present / records.length) * 100) : 0;
    return { present, absent, late, rate, total: records.length };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'absent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'late': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'excused': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Children's Attendance</h1>
          <p className="text-muted-foreground">Attendance records for all your children</p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background text-sm"
        />
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{children.length}</p>
              <p className="text-sm text-muted-foreground">Children</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{overallRate}%</p>
              <p className="text-sm text-muted-foreground">Overall Rate</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{totalPresent}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{totalAbsent}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{totalLate}</p>
              <p className="text-sm text-muted-foreground">Late</p>
            </div>
          </div>
        </Card>
      </div>

      {loading && children.length === 0 ? (
        <div className="space-y-4">{ [1, 2, 3].map(i => <Skeleton key={i} className="h-16" />) }</div>
      ) : children.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Children Linked</h3>
          <p className="text-muted-foreground">Go to "My Children" to link your children first.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {childrenWithData.map(({ child, records, loading: childLoading, error }) => {
            const isExpanded = expandedChildren.has(child.id);
            const stats = getChildStats(records);

            return (
              <Card key={child.id} className="overflow-hidden">
                <button
                  onClick={() => toggleChild(child.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                      {child.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">Class {child.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!childLoading && records.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${stats.rate >= 75 ? 'text-green-600' : stats.rate >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                          {stats.rate}%
                        </span>
                        <div className="w-16 h-1.5 bg-accent rounded-full">
                          <div
                            className={`h-full rounded-full ${stats.rate >= 75 ? 'bg-green-500' : stats.rate >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(stats.rate, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {childLoading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-4 pb-4">
                    {/* Per-child mini stats */}
                    {!childLoading && records.length > 0 && (
                      <div className="flex gap-4 pt-4 pb-3 text-xs">
                        <span className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500" /> Present: {stats.present}</span>
                        <span className="flex items-center gap-1 text-red-600"><span className="w-2 h-2 rounded-full bg-red-500" /> Absent: {stats.absent}</span>
                        <span className="flex items-center gap-1 text-orange-600"><span className="w-2 h-2 rounded-full bg-orange-500" /> Late: {stats.late}</span>
                      </div>
                    )}

                    {childLoading ? (
                      <div className="space-y-3 pt-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}
                      </div>
                    ) : error ? (
                      <div className="p-4 mt-4 text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg">
                        Failed to load attendance for {child.name}
                      </div>
                    ) : records.length === 0 ? (
                      <div className="p-4 mt-4 text-center text-muted-foreground text-sm bg-accent/50 rounded-lg">
                        No attendance records for {child.name} in this month
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-4">
                        {records.map(record => (
                          <div key={record.id} className="flex items-center justify-between p-2.5 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                record.status === 'present' ? 'bg-green-500' :
                                record.status === 'absent' ? 'bg-red-500' :
                                record.status === 'late' ? 'bg-orange-500' : 'bg-blue-500'
                              }`} />
                              <div>
                                <p className="text-sm font-medium">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                <p className="text-xs text-muted-foreground">{record.studentName} - {record.class}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
