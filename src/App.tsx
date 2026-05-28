
import { useState, useCallback, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useThemeStore } from './lib/store'
import SplashScreen from './components/ui/SplashScreen'
import Login from './pages/auth/LoginAnimated'
import Landing from './pages/Landing'
import Photos from './pages/Photos'
import StudentDashboard from './pages/student/Dashboard'
import StudentAssignments from './pages/student/Assignments'
import StudentTimetable from './pages/student/Timetable'
import StudentGrades from './pages/student/Grades'
import StudentAttendance from './pages/student/Attendance'
import StudentFees from './pages/student/Fees'
import StudentMessages from './pages/student/Messages'
import StudentAI from './pages/student/AI'
import TeacherDashboard from './pages/teacher/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import CoordinatorDashboard from './pages/coordinator/Dashboard'
import DriverDashboard from './pages/driver/Dashboard'
import DashboardLayout from './components/layout/DashboardLayout'
import { NotFoundPage } from './components/ui/404-page-not-found'
import StarWarsToggle from './components/ui/star-wars-toggle-switch'
import GenericPage from './components/ui/GenericPage'
import TeacherMarkAttendance from './pages/teacher/MarkAttendance'
import TeacherGrading from './pages/teacher/Grading'
import TeacherUploadNotes from './pages/teacher/UploadNotes'
import CommunicationHub from './pages/shared/CommunicationHub'
import QuickMessenger from './pages/shared/QuickMessenger'
import AILab from './pages/shared/AILab'
import ReportCards from './pages/teacher/ReportCards'
import NotificationCenter from './pages/shared/NotificationCenter'
import Circulars from './pages/shared/Circulars'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import StudentNotes from './pages/student/Notes'
import SharedNotes from './pages/student/SharedNotes'
import StudentAnnouncements from './pages/student/Announcements'
import StudyPlanner from './pages/student/StudyPlanner'
import CSCalendar from './pages/student/CSCalendar'
import FocusMode from './pages/student/FocusMode'
import StudentExams from './pages/student/Exams'
import StudentExamSyllabus from './pages/student/ExamSyllabus'
import StudentBusTracking from './pages/student/BusTracking'
import SocialClub from './pages/student/SocialClub'
import Achievements from './pages/student/Achievements'
import Accolades from './pages/student/Accolades'
import StudentProfile from './pages/student/Profile'
import TeacherManageAssignments from './pages/teacher/ManageAssignments'
import TeacherManageExams from './pages/teacher/ManageExams'
import TeacherExamSyllabus from './pages/teacher/ExamSyllabus'
import TeacherClassAnalytics from './pages/teacher/ClassAnalytics'
import TeacherStudentProgress from './pages/teacher/StudentProgress'
import TeacherPerformanceReports from './pages/teacher/PerformanceReports'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAccounts from './pages/admin/AdminAccounts'
import AdminTimetable from './pages/admin/AdminTimetable'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminPayroll from './pages/admin/AdminPayroll'
import AdminExams from './pages/admin/AdminExams'
import AdminFees from './pages/admin/AdminFees'
import AdminBusAssignment from './pages/admin/AdminBusAssignment'
import AdminLostFound from './pages/admin/AdminLostFound'
import AdminAnonymousReports from './pages/admin/AdminAnonymousReports'
import AdminClinic from './pages/admin/AdminClinic'
import AdminEPortfolio from './pages/admin/AdminEPortfolio'
import AdminITHelpdesk from './pages/admin/AdminITHelpdesk'
import AdminSkipBus from './pages/admin/AdminSkipBus'
import AdminFeeInstallments from './pages/admin/AdminFeeInstallments'
import ParentDashboard from './pages/parent/ParentDashboard'
import ParentAttendance from './pages/parent/ParentAttendance'
import ParentGrades from './pages/parent/ParentGrades'
import ParentTimetable from './pages/parent/ParentTimetable'
import ParentFees from './pages/parent/ParentFees'
import ParentBusTracking from './pages/parent/ParentBusTracking'
import ParentExamSyllabus from './pages/parent/ExamSyllabus'
import ParentProfile from './pages/parent/ParentProfile'
import DriverProfile from './pages/driver/DriverProfile'
import LibrarianDashboard from './pages/librarian/LibrarianDashboard'
import ManagerUsers from './pages/manager/ManagerUsers'
import ManagerAcademics from './pages/manager/ManagerAcademics'
import ManagerFinance from './pages/manager/ManagerFinance'
import ManagerTransport from './pages/manager/ManagerTransport'
import ManagerAnalytics from './pages/manager/ManagerAnalytics'
import ManagerAnnouncements from './pages/manager/ManagerAnnouncements'
import ManagerEvents from './pages/manager/ManagerEvents'
import ManagerExams from './pages/manager/ManagerExams'
import ManagerTimetable from './pages/manager/ManagerTimetable'
import ManagerPayroll from './pages/manager/ManagerPayroll'
import ManagerSecurity from './pages/manager/ManagerSecurity'
import ManagerSettings from './pages/manager/ManagerSettings'
import ManagerAuditLog from './pages/manager/ManagerAuditLog'
import ManagerFees from './pages/manager/ManagerFees'
import ManagerBusAssignment from './pages/manager/ManagerBusAssignment'
import StudentDailyBriefing from './pages/student/DailyBriefing'
import LibrarianProfile from './pages/librarian/LibrarianProfile'
import CSLibrary from './pages/shared/CSLibrary'

const GP = (title: string, description: string, icon: string, category: string, role: string) => (
  <GenericPage title={title} description={description} icon={icon as any} category={category} role={role as any} />
)

function App() {
  const { isAuthenticated, user } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('eduvault-splash-shown')
  })

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('eduvault-splash-shown', 'true')
    setShowSplash(false)
  }, [])

  const getDashboardRoute = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'student': return '/student'
      case 'teacher': return '/teacher'
      case 'admin': return '/admin'
      case 'coordinator': return '/coordinator'
      case 'driver': return '/driver'
      case 'parent': return '/parent'
      case 'librarian': return '/librarian'
      case 'manager': return '/manager'
      default: return '/login'
    }
  }

  const roleGuard = (allowedRoles: string[]) => {
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />
    if (!allowedRoles.includes(user.role)) return <Navigate to={getDashboardRoute()} replace />
    return <DashboardLayout />
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {!showSplash && (
        <>
        <div className="fixed top-4 right-4 z-[9999] scale-[0.4] origin-top-right">
          <StarWarsToggle checked={isDark} onChange={() => toggleTheme()} />
        </div>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Login />
          } />

          {/* STUDENT */}
          <Route path="/student" element={roleGuard(['student'])}>
            <Route index element={<StudentDashboard />} />
            <Route path="daily-briefing" element={<StudentDailyBriefing />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="notes" element={<StudentNotes />} />
            <Route path="shared-notes" element={<SharedNotes />} />
            <Route path="announcements" element={<StudentAnnouncements />} />
            <Route path="study-planner" element={<StudyPlanner />} />
            <Route path="cs-calendar" element={<CSCalendar />} />
            <Route path="focus-mode" element={<FocusMode />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="exam-syllabus" element={<StudentExamSyllabus />} />
            <Route path="bus-tracking" element={<StudentBusTracking />} />
            <Route path="ai" element={<AILab />} />
            <Route path="messages" element={<StudentMessages />} />
            <Route path="social-club" element={<SocialClub />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="accolades" element={<Accolades />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* TEACHER */}
          <Route path="/teacher" element={roleGuard(['teacher'])}>
            <Route index element={<TeacherDashboard />} />
            <Route path="assignments" element={<TeacherManageAssignments />} />
            <Route path="attendance" element={<TeacherMarkAttendance />} />
            <Route path="grading" element={<TeacherGrading />} />
            <Route path="notes" element={<TeacherUploadNotes />} />
            <Route path="exams" element={<TeacherManageExams />} />
            <Route path="exam-syllabus" element={<TeacherExamSyllabus />} />
            <Route path="report-cards" element={<ReportCards />} />
            <Route path="class-analytics" element={<TeacherClassAnalytics />} />
            <Route path="student-progress" element={<TeacherStudentProgress />} />
            <Route path="performance-reports" element={<TeacherPerformanceReports />} />
            <Route path="messages" element={<QuickMessenger />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="comms-hub" element={<CommunicationHub />} />
            <Route path="ai" element={<AILab />} />
          </Route>

          {/* ADMIN */}
          <Route path="/admin" element={roleGuard(['admin'])}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="timetable" element={<AdminTimetable />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="payroll" element={<AdminPayroll />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="fees" element={<AdminFees />} />
            <Route path="ai" element={<AILab />} />
            <Route path="comms-hub" element={<CommunicationHub />} />
            <Route path="circulars" element={<Circulars />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="bus-assignment" element={<AdminBusAssignment />} />
            <Route path="lost-found" element={<AdminLostFound />} />
            <Route path="anonymous-report" element={<AdminAnonymousReports />} />
            <Route path="clinic" element={<AdminClinic />} />
            <Route path="e-portfolio" element={<AdminEPortfolio />} />
            <Route path="it-helpdesk" element={<AdminITHelpdesk />} />
            <Route path="skip-bus" element={<AdminSkipBus />} />
            <Route path="fee-installments" element={<AdminFeeInstallments />} />
          </Route>

          {/* PARENT */}
          <Route path="/parent" element={roleGuard(['parent'])}>
            <Route index element={<ParentDashboard />} />
            <Route path="attendance" element={<ParentAttendance />} />
            <Route path="grades" element={<ParentGrades />} />
            <Route path="timetable" element={<ParentTimetable />} />
            <Route path="fees" element={<ParentFees />} />
            <Route path="bus-tracking" element={<ParentBusTracking />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="exam-syllabus" element={<ParentExamSyllabus />} />
            <Route path="messages" element={<QuickMessenger />} />
            <Route path="profile" element={<ParentProfile />} />
          </Route>

          {/* DRIVER */}
          <Route path="/driver" element={roleGuard(['driver'])}>
            <Route index element={<DriverDashboard />} />
            <Route path="profile" element={<DriverProfile />} />
          </Route>

          {/* LIBRARIAN */}
          <Route path="/librarian" element={roleGuard(['librarian'])}>
            <Route index element={<LibrarianDashboard />} />
            <Route path="profile" element={<LibrarianProfile />} />
          </Route>

          {/* COORDINATOR */}
          <Route path="/coordinator" element={roleGuard(['coordinator'])}>
            <Route index element={<CoordinatorDashboard />} />
          </Route>

          {/* MANAGER */}
          <Route path="/manager" element={roleGuard(['manager'])}>
            <Route index element={<ManagerDashboard />} />
            <Route path="users" element={<ManagerUsers />} />
            <Route path="academics" element={<ManagerAcademics />} />
            <Route path="finance" element={<ManagerFinance />} />
            <Route path="transport" element={<ManagerTransport />} />
            <Route path="analytics" element={<ManagerAnalytics />} />
            <Route path="circulars" element={<Circulars />} />
            <Route path="announcements" element={<ManagerAnnouncements />} />
            <Route path="events" element={<ManagerEvents />} />
            <Route path="exams" element={<ManagerExams />} />
            <Route path="timetable" element={<ManagerTimetable />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="comms-hub" element={<CommunicationHub />} />
            <Route path="ai" element={<AILab />} />
            <Route path="payroll" element={<ManagerPayroll />} />
            <Route path="security" element={<ManagerSecurity />} />
            <Route path="reports" element={<ReportCards />} />
            <Route path="settings" element={<ManagerSettings />} />
            <Route path="audit-log" element={<ManagerAuditLog />} />
            <Route path="messages" element={<QuickMessenger />} />
            <Route path="attendance" element={<TeacherMarkAttendance />} />
            <Route path="grading" element={<TeacherGrading />} />
            <Route path="notes" element={<TeacherUploadNotes />} />
            <Route path="fees" element={<ManagerFees />} />
            <Route path="bus-assignment" element={<ManagerBusAssignment />} />
          </Route>

          <Route path="/cs-library" element={
            isAuthenticated ? <CSLibrary /> : <Navigate to="/login" replace />
          } />

          <Route path="/404page" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404page" replace />} />
        </Routes>
        </>)}
    </>
  )
}

export default App
