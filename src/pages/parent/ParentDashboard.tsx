import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { normalizeAcademicPercentage, formatPercentage } from '@/lib/utils';
import { LayoutDashboard, Users, BarChart3, Calendar, DollarSign, Bus, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};


export default function ParentDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    children: [] as { id: string; name: string; class: string; gpa: number; attendance: number }[],
    upcomingEvents: [] as { title: string; date: string; type: string }[],
    feeStatus: { total: 0, paid: 0, pending: 0 },
    busStatus: { route: '', eta: '', status: 'on-time' },
    recentGrades: [] as { subject: string; grade: number; date: string }[],
    notifications: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getParentDashboard();
      if (data) setDashboard(data);
    } catch (err) {
      console.error('[ParentDashboard] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Parent Dashboard</h1>
        <p className="text-muted-foreground">Overview of your child's progress</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{dashboard.children.length}</p>
                  <p className="text-sm text-muted-foreground">Children</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{dashboard.children[0]?.gpa !== undefined ? formatPercentage(normalizeAcademicPercentage(dashboard.children[0].gpa)) : 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Avg Academic %</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <DollarSign className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">${dashboard.feeStatus.pending}</p>
                  <p className="text-sm text-muted-foreground">Fees Pending</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{dashboard.notifications}</p>
                  <p className="text-sm text-muted-foreground">Notifications</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Children Overview</h3>
              <div className="space-y-3">
                {dashboard.children.map(child => (
                  <div key={child.id} className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{child.name}</h4>
                      <Badge variant="secondary">{child.class}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Academic %: {child.gpa !== undefined ? formatPercentage(normalizeAcademicPercentage(child.gpa)) : 'N/A'}</span>
                      <span>Attendance: {child.attendance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {dashboard.upcomingEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.type}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Recent Grades</h3>
              <div className="space-y-3">
                {dashboard.recentGrades.map((grade, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm">{grade.subject}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-accent rounded-full">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${grade.grade}%` }} />
                      </div>
                      <span className="text-sm font-medium">{grade.grade}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Bus Status</h3>
              <div className="p-4 bg-accent rounded-lg">
                <div className="flex items-center gap-4 mb-3">
                  <Bus className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="font-medium">{dashboard.busStatus.route}</p>
                    <p className="text-sm text-muted-foreground">ETA: {dashboard.busStatus.eta}</p>
                  </div>
                </div>
                <Badge className={dashboard.busStatus.status === 'on-time' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                  {dashboard.busStatus.status}
                </Badge>
              </div>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  );
}

