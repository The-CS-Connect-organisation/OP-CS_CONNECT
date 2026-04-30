import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useMemo, useCallback, useEffect } from 'react';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useStore } from './hooks/useStore';

// Data
import { KEYS } from './data/schema';

// Components
import { Layout } from './components/layout/Layout';
import { Toast } from './components/ui/Toast';
import SplashScreen from './components/SplashScreen';

// Pages - Common
import { Login } from './pages/Common/Login';
import { Signup } from './pages/Common/Signup';

// Pages - Portals (Dashboards)
import { StudentDashboard } from './pages/AcademicPortal/Dashboard/StudentDashboard';
import { ParentDashboard } from './pages/ManagementPortal/Parent/ParentDashboard';
import { DriverDashboard } from './pages/DriverPortal/DriverDashboard';

// Academic Portal - Student Pages
import { Timetable } from './pages/AcademicPortal/Student/Timetable';
import { Assignments } from './pages/AcademicPortal/Student/Assignments';
import { Attendance } from './pages/AcademicPortal/Student/Attendance';
import { Grades } from './pages/AcademicPortal/Student/Grades';
import { Notes } from './pages/AcademicPortal/Student/Notes';
import { Profile } from './pages/AcademicPortal/Student/Profile';
import { StudyPlanner } from './pages/AcademicPortal/Student/StudyPlanner';
import { AssignmentDetails } from './pages/AcademicPortal/Student/AssignmentDetails';
import { BusTracking } from './pages/AcademicPortal/Student/BusTracking';
import { DriverTracking } from './pages/AcademicPortal/Student/DriverTracking';

// Academic Portal - Shared Features
import { SettingsPanel } from './pages/AcademicPortal/shared/Settings';
import { FeeManagement } from './pages/AcademicPortal/shared/FeeManagement';
import { AILab } from './pages/AcademicPortal/shared/AILab';
import { CommunicationHub } from './pages/AcademicPortal/shared/CommunicationHub';
import { ExamCenter } from './pages/AcademicPortal/shared/ExamCenter';
import { NexusHub } from './pages/AcademicPortal/shared/NexusHub';


// Teacher Portal Pages
import { TeacherDashboard } from './pages/TeacherPortal/TeacherDashboard';
import { ManageAssignments } from './pages/TeacherPortal/ManageAssignments';
import { GradeSubmissions } from './pages/TeacherPortal/GradeSubmissions';
import { MarkAttendance } from './pages/TeacherPortal/MarkAttendance';
import { EnterGrades } from './pages/TeacherPortal/EnterGrades';
import { UploadNotes } from './pages/TeacherPortal/UploadNotes';
import { ManageExams } from './pages/TeacherPortal/ManageExams';
import { Profile as TeacherProfile } from './pages/TeacherPortal/Profile';
import { ClassAnalytics } from './pages/TeacherPortal/ClassAnalytics';
import { StudentProgress } from './pages/TeacherPortal/StudentProgress';
import { NotificationCenter } from './pages/TeacherPortal/NotificationCenter';
import { QuickMessenger } from './pages/TeacherPortal/QuickMessenger';
import { PerformanceReports } from './pages/TeacherPortal/PerformanceReports';
import { ClassNotes } from './pages/TeacherPortal/ClassNotes';

// Loading screen (shown during auth check)
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center font-nova" style={{ background: '#ffffff' }}>
    <div className="text-center">
      <div className="mx-auto mb-5">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: '#ff6b9d', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          <span className="text-white font-bold text-xl">A</span>
        </div>
      </div>
      <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Synchronizing Academic Portal...</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Cornerstone SchoolSync</p>
    </div>
  </div>
);

// Allowed roles for this portal
const ALLOWED_ROLES = ['student', 'parent', 'teacher', 'driver'];

// Protected Route Component
const ProtectedRoute = ({ user, children, requiredRole, portalLogout, ...props }) => {
  if (!user) return <Navigate to="/login" replace />;
  
  // If user role is not allowed in this portal at all, auto-logout and bounce
  if (!ALLOWED_ROLES.includes(user.role)) {
    portalLogout();
    return <Navigate to="/login" replace />;
  }

  // If user role is valid for portal but doesn't match specific route (e.g. parent at student/dash)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  
  return (
    <Layout user={user} {...props}>
      {children}
    </Layout>
  );
};

function App() {
  const navigate = useNavigate();
  const { user, loading: authLoading, login, signup, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, removeToast } = useToast();
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash if not already seen in this session
    return !sessionStorage.getItem('hasSeenSplash');
  });
  
  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  }, []);
  
  const { data: notifications, update: updateNotification } = useStore(KEYS.NOTIFICATIONS, []);
  
  const userNotifications = useMemo(() => {
    if (!user || !Array.isArray(notifications)) return [];
    return notifications
      .filter(n => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [notifications, user]);

  const markNotificationRead = (id) => {
    updateNotification(id, { read: true });
  };

  // If a user with an invalid role is somehow still in state, clear them on mount/state change
  useEffect(() => {
    if (user && !ALLOWED_ROLES.includes(user.role)) {
      addToast?.('Unauthorized Portal Access. Logging out...', 'error');
      logout();
    }
  }, [user, logout, addToast]);

  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />;
  // Using custom loading screen for portal sync feel
  if (authLoading) return <LoadingScreen />;

  const layoutProps = {
    theme,
    toggleTheme,
    logout,
    notifications: userNotifications,
    onMarkRead: markNotificationRead,
    portalLogout: logout,
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <Routes>
          {/* 🔐 Auth Gates */}
          <Route path="/login" element={
            user && ALLOWED_ROLES.includes(user.role) 
              ? <Navigate to={`/${user.role}/dashboard`} replace /> 
              : <Login onLogin={login} onSwitch={() => navigate('/signup')} />
          } />
          <Route path="/signup" element={
            user && ALLOWED_ROLES.includes(user.role)
              ? <Navigate to={`/${user.role}/dashboard`} replace /> 
              : <Signup onSignup={signup} onSwitch={() => navigate('/login')} />
          } />

          {/* 🎓 Academic Portal - Student */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <StudentDashboard user={user} />
            </ProtectedRoute>
          } />
          <Route path="/student/timetable" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <Timetable user={user} />
            </ProtectedRoute>
          } />
          <Route path="/student/assignments" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <Assignments user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/student/assignments/:id" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <AssignmentDetails user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/student/attendance" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <Attendance user={user} />
            </ProtectedRoute>
          } />
          <Route path="/student/grades" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <Grades user={user} />
            </ProtectedRoute>
          } />
          <Route path="/student/notes" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <Notes user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/student/fees" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <FeeManagement user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <Profile user={user} />
            </ProtectedRoute>
          } />
          <Route path="/student/planner" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <StudyPlanner user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/student/ai-lab" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <AILab user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/student/nexus" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <NexusHub user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/student/comms" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <CommunicationHub user={user} />
            </ProtectedRoute>
          } />
          <Route path="/student/exams" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <ExamCenter user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/student/settings" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <SettingsPanel user={user} />
            </ProtectedRoute>
          } />
          <Route path="/student/bus-tracking" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <BusTracking user={user} />
            </ProtectedRoute>
          } />
          <Route path="/driver-tracking" element={
            <ProtectedRoute {...layoutProps} user={user}>
              <DriverTracking />
            </ProtectedRoute>
          } />

          {/* 🏢 Management Portal Features for Parents (In Academics) */}
          <Route path="/parent/dashboard" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="parent">
              <ParentDashboard user={user} />
            </ProtectedRoute>
          } />
          <Route path="/parent/attendance" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="parent">
              <Attendance user={user} />
            </ProtectedRoute>
          } />
          <Route path="/parent/grades" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="parent">
              <Grades user={user} />
            </ProtectedRoute>
          } />
          <Route path="/parent/fees" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="parent">
              <FeeManagement user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/parent/settings" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="parent">
              <SettingsPanel user={user} />
            </ProtectedRoute>
          } />
          <Route path="/parent/comms" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="parent">
              <CommunicationHub user={user} />
            </ProtectedRoute>
          } />
          <Route path="/parent/bus-tracking" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="parent">
              <BusTracking user={user} />
            </ProtectedRoute>
          } />

          {/* � Driver Portal */}
          <Route path="/driver/dashboard" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="driver">
              <DriverDashboard user={user} />
            </ProtectedRoute>
          } />

          {/* �👨‍🏫 Teacher Portal */}
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <TeacherDashboard user={user} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/assignments" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <ManageAssignments user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/submissions" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <GradeSubmissions user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/attendance" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <MarkAttendance user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/grades" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <EnterGrades user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/notes" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <UploadNotes user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/exams" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <ManageExams user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/profile" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <TeacherProfile user={user} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/comms" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <CommunicationHub user={user} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/settings" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <SettingsPanel user={user} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/analytics" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <ClassAnalytics user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/progress" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <StudentProgress user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/notifications" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <NotificationCenter user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/messaging" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <QuickMessenger user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/reports" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <PerformanceReports user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/class-notes" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <ClassNotes user={user} addToast={addToast} />
            </ProtectedRoute>
          } />

          {/* 🏁 Terminal Entry/Exit */}
          <Route path="/" element={
            user && ALLOWED_ROLES.includes(user.role) 
              ? <Navigate to={`/${user.role}/dashboard`} replace /> 
              : <Navigate to="/login" replace />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </>
  );
}

export default App;