
import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore, useDataStore } from '@/lib/store';
import { cn, formatCurrency, normalizeAcademicPercentage, formatPercentage } from '@/lib/utils';
import {
  BookOpen, ClipboardList, Calendar, BarChart3, UserCheck,
  CreditCard, Trophy, Sparkles, TrendingUp, TrendingDown,
  Clock, AlertCircle, CheckCircle2, ArrowUpRight, Brain,
  Target, Zap, GraduationCap, Star, Loader2
} from 'lucide-react';

// Lazy-loaded components
const PerformanceChart = lazy(() => import('@/components/student/PerformanceChart'));
const AttendancePieChart = lazy(() => import('@/components/student/AttendancePieChart'));
const SubjectRadarChart = lazy(() => import('@/components/student/SubjectRadarChart'));
const AIChatPanel = lazy(() => import('@/components/ai/AIChatPanel'));

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Memoized child components to prevent unnecessary re-renders
const MemoizedCard = React.memo(Card);

const ChartLoader = () => (
    <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
);

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { grades, attendance, assignments, subjects, fees, clubs, timetable, events, isLoading, fetchStudentData } = useDataStore();
  const [showAI, setShowAI] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) fetchStudentData(user.id);
  }, [user?.id, fetchStudentData]);

  // Memoize expensive calculations
  const { totalFees, paidFees, dueFees, currentGPA, currentPercentage, attendancePercent, upcomingAssignments } = useMemo(() => {
    const totalFees = fees.reduce((a: number, f: any) => a + (f.amount || 0), 0);
    const paidFees = fees.reduce((a: number, f: any) => a + (f.paid || 0), 0);
    const dueFees = fees.reduce((a: number, f: any) => a + (f.due || 0), 0);
    const currentGPA = grades.length > 0 ? grades.reduce((a: number, g: any) => a + (g.overall || 0), 0) / grades.length : (user?.gpa || 0);
    const currentPercentage = normalizeAcademicPercentage(currentGPA);
    const attendancePercent = attendance.length > 0 && attendance[0]?.percentage ? attendance[0].percentage : (user?.attendance || 0);
    const upcomingAssignments = assignments.filter((a: any) => a.studentStatus === 'pending' || a.studentStatus === 'active' || a.status === 'active' || a.status === 'pending').slice(0, 3);
    return { totalFees, paidFees, dueFees, currentGPA, currentPercentage, attendancePercent, upcomingAssignments };
  }, [fees, grades, user, attendance, assignments]);

  return (
    <>
      <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="space-y-6 bento-grid">
        {/* ... Rest of the component ... */}
      </motion.div>

      <Suspense fallback={null}>
        {showAI && <AIChatPanel isOpen={showAI} onClose={() => setShowAI(false)} context="Student dashboard - viewing grades, assignments, and schedule" />}
      </Suspense>
    </>
  );
}
