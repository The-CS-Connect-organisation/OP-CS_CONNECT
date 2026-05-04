import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

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
// (Login/Signup removed - using SplashScreen only)

// Pages - Portals (Dashboards)
import { AdminDashboard } from './pages/ManagementPortal/Dashboard/AdminDashboard';

// Academic Portal - Shared Features
import { SettingsPanel } from './pages/AcademicPortal/shared/Settings';
import { FeeManagement } from './pages/AcademicPortal/shared/FeeManagement';
import { AILab } from './pages/AcademicPortal/shared/AILab';
import { CommunicationHub } from './pages/AcademicPortal/shared/CommunicationHub';
import { ExamCenter } from './pages/AcademicPortal/shared/ExamCenter';

// Management Portal - Admin Pages
import { Profile as AdminProfile } from './pages/ManagementPortal/Admin/Profile';
import AdminDashboard from './pages/ManagementPortal/Admin/AdminDashboard';
import AdminAnalytics from './pages/ManagementPortal/Admin/AdminAnalytics';
import AdminUsers from './pages/ManagementPortal/Admin/AdminUsers';
import AdminTimetable from './pages/ManagementPortal/Admin/AdminTimetable';
import AdminAnnouncements from './pages/ManagementPortal/Admin/AdminAnnouncements';
import AdminPayroll from './pages/ManagementPortal/Admin/AdminPayroll';
import { CreateAccount } from './pages/ManagementPortal/Admin/CreateAccount';
import AdminBusAssignment from './pages/ManagementPortal/Admin/BusAssignment';

// Loading screen (shown during auth check)
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center font-nova" style={{ background: '#ffffff' }}>
    <div className="text-center">
      <div className="mx-auto mb-5">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: '#111111', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          <span className="text-white font-bold text-xl">C</span>
        </div>
      </div>
      <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Synchronizing Management Portal...</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Cornerstone SchoolSync</p>
    </div>
  </div>
);

// Allowed roles for this portal
const ALLOWED_ROLES = ['admin'];

// Protected Route Component
const ProtectedRoute = ({ user, children, requiredRole, portalLogout, ...props }) => {
  if (!user) return <Navigate to="/login" replace />;
  
  // If user role is not allowed in this portal at all, auto-logout and bounce
  if (!ALLOWED_ROLES.includes(user.role)) {
    portalLogout();
    return <Navigate to="/login" replace />;
  }

  // If user role is valid for portal but doesn't match specific route
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
    // Only show splash if not already logged in
    return !user;
  });
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);
  
  const { data: notifications, update: updateNotification } = useStore(KEYS.NOTIFICATIONS, []);
  
  const userNotifications = useMemo(() => {
    if (!user) return [];
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
      addToast?.('Unauthorized Portal Access (Management). Logging out...', 'error');
      logout();
    }
  }, [user, logout, addToast]);

  // Hide splash screen once user is logged in
  useEffect(() => {
    if (user && showSplash) {
      setShowSplash(false);
    }
  }, [user, showSplash]);

  // Auto-login from URL hash when landing on dashboard
  useEffect(() => {
    // Check URL hash for auto-login credentials
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split('?')[1]);
    const autologin = params.get('autologin');
    const pass = params.get('pass');
    
    if (autologin && pass && !user) {
      console.log('Auto-login from URL:', { email: autologin });
      login(decodeURIComponent(autologin), decodeURIComponent(pass)).then((result) => {
        console.log('Auto-login result:', result);
        if (result?.success) {
          // Clean URL by removing credentials
          window.location.hash = window.location.hash.split('?')[0];
        }
      }).catch(() => {
        // Auto-login failed, show splash screen
      });
    }
  }, [user, login]);

  // Show loading screen while auth is being checked
  if (authLoading) return <LoadingScreen />;
  
  // Show splash screen only if not logged in
  if (showSplash && !user) return <SplashScreen onComplete={handleSplashComplete} onLogin={login} />;

  const layoutProps = {
    theme,
    toggleTheme,
    onLogout: logout,
    notifications: userNotifications,
    onMarkRead: markNotificationRead,
    portalLogout: logout,
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <AnimatePresence mode="wait">
        <Routes>
          {/* 🔐 Auth Gates - Splash Screen is the only login entry point */}
          <Route path="/login" element={
            user && ALLOWED_ROLES.includes(user.role) 
              ? <Navigate to={`/${user.role}/dashboard`} replace /> 
              : <SplashScreen onComplete={() => {}} onLogin={login} />
          } />
          <Route path="/signup" element={
            user && ALLOWED_ROLES.includes(user.role)
              ? <Navigate to={`/${user.role}/dashboard`} replace /> 
              : <SplashScreen onComplete={() => {}} onLogin={login} />
          } />

          {/* 🏢 Management Portal - Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <AdminDashboard user={user} />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <AdminUsers user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/admin/announcements" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <AdminAnnouncements user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <AdminAnalytics user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/admin/timetable" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <AdminTimetable user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <AdminProfile user={user} />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <SettingsPanel user={user} />
            </ProtectedRoute>
          } />
          <Route path="/admin/exams" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <ExamCenter user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/admin/fees" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <FeeManagement user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/admin/ai-lab" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <AILab user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/admin/comms" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <CommunicationHub user={user} />
            </ProtectedRoute>
          } />
          <Route path="/admin/payroll-hr" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <AdminPayroll user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/admin/create-account" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <CreateAccount user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/admin/bus-assignments" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <AdminBusAssignment user={user} addToast={addToast} />
            </ProtectedRoute>
          } />

          {/* 🏁 Terminal Entry/Exit */}
          <Route path="/" element={
            user && ALLOWED_ROLES.includes(user.role) 
              ? <Navigate to={`/${user.role}/dashboard`} replace /> 
              : <SplashScreen onComplete={() => {}} onLogin={login} />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;