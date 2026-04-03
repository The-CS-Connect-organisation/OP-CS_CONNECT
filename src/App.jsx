import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useStore } from './hooks/useStore';

// Data
import { KEYS } from './data/schema'; // ⚠️ CRITICAL: Added missing KEYS import

// Components
import { Layout } from './components/layout/Layout';
import { Toast } from './components/ui/Toast';

// Pages
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';
import { StudentDashboard } from './pages/Dashboard/StudentDashboard';
import { TeacherDashboard } from './pages/Dashboard/TeacherDashboard';
import { AdminDashboard } from './pages/Dashboard/AdminDashboard';

// Student Pages
import { Timetable } from './pages/Student/Timetable';
import { Assignments } from './pages/Student/Assignments';
import { Attendance } from './pages/Student/Attendance';
import { Grades } from './pages/Student/Grades';
import { Notes } from './pages/Student/Notes';
import { Profile } from './pages/Student/Profile';
import { Profile as TeacherProfile } from './pages/Teacher/Profile';
import { Profile as AdminProfile } from './pages/Admin/Profile';
import { SettingsPanel } from './pages/shared/Settings';
import { FeeManagement } from './pages/shared/FeeManagement'; // ✅ New

// Teacher Pages
import { ManageAssignments } from './pages/Teacher/ManageAssignments';
import { MarkAttendance } from './pages/Teacher/MarkAttendance';
import { GradeSubmissions } from './pages/Teacher/GradeSubmissions';
import { UploadNotes } from './pages/Teacher/UploadNotes';

// Admin Pages
import { ManageUsers } from './pages/Admin/ManageUsers';
import { Announcements } from './pages/Admin/Announcements';
import { Analytics } from './pages/Admin/Analytics';
import { TimetableManager } from './pages/Admin/TimetableManager';
import { ManageExams } from './pages/Teacher/ManageExams';

// Loading screen
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="text-center">
      <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white mx-auto mb-4 animate-pulse">
        <span className="text-2xl font-bold">S</span>
      </div>
      <p className="text-gray-500 animate-pulse">Loading SchoolSync...</p>
    </div>
  </div>
);

// Protected Route
const ProtectedRoute = ({ user, children, requiredRole, theme, toggleTheme, logout, notifications, onMarkRead }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return (
    <Layout
      user={user}
      theme={theme}
      toggleTheme={toggleTheme}
      onLogout={logout}
      notifications={notifications}
      onMarkRead={onMarkRead}
    >
      {children}
    </Layout>
  );
};

function App() {
  const navigate = useNavigate();
  const { user, loading: authLoading, login, signup, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, removeToast } = useToast();
  
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

  if (authLoading) return <LoadingScreen />;

  const layoutProps = {
    theme,
    toggleTheme,
    logout,
    notifications: userNotifications,
    onMarkRead: markNotificationRead,
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={
            user ? <Navigate to={`/${user.role}/dashboard`} replace /> :
            <Login onLogin={login} onSwitch={() => navigate('/signup')} />
          } />
          <Route path="/signup" element={
            user ? <Navigate to={`/${user.role}/dashboard`} replace /> :
            <Signup onSignup={signup} onSwitch={() => navigate('/login')} />
          } />

          {/* Student Routes */}
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
          <Route path="/student/settings" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="student">
              <SettingsPanel user={user} />
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
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
          <Route path="/teacher/attendance" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <MarkAttendance user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/grading" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <GradeSubmissions user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/notes" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <UploadNotes user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/profile" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <TeacherProfile user={user} />
            </ProtectedRoute>
          } />
          <Route path="/teacher/settings" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="teacher">
              <SettingsPanel user={user} />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <AdminDashboard user={user} />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <ManageUsers user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/admin/announcements" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <Announcements user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/timetable" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <TimetableManager />
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
              <ManageExams user={user} addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/admin/fees" element={
            <ProtectedRoute {...layoutProps} user={user} requiredRole="admin">
              <FeeManagement user={user} addToast={addToast} />
            </ProtectedRoute>
          } />

          {/* Default Route */}
          <Route path="/" element={
            user ? <Navigate to={`/${user.role}/dashboard`} replace /> :
            <Navigate to="/login" replace />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;