import Loader from "./components/ui/loader"
import ErrorBoundary from './components/ui/ErrorBoundary'

import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useThemeStore } from './lib/store'
import Login from './pages/auth/LoginAnimated'
import Signup from './pages/auth/Signup'
const Landing = lazy(() => import('./pages/Landing'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const Photos = lazy(() => import('./pages/Photos'))
const Homework = lazy(() => import('./pages/shared/Homework'))
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'))
const StudentAssignments = lazy(() => import('./pages/student/Assignments'))
const StudentTimetable = lazy(() => import('./pages/student/Timetable'))
const StudentGrades = lazy(() => import('./pages/student/Grades'))
const StudentAttendance = lazy(() => import('./pages/student/Attendance'))
const StudentFees = lazy(() => import('./pages/student/Fees'))
const StudentCommunity = lazy(() => import('./pages/student/Community'))
const StudentAI = lazy(() => import('./pages/student/AI'))
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const CoordinatorDashboard = lazy(() => import('./pages/coordinator/Dashboard'))
const DriverDashboard = lazy(() => import('./pages/driver/Dashboard'))
import DashboardLayout from './components/layout/DashboardLayout'
import { NotFoundPage } from './components/ui/404-page-not-found'

import GenericPage from './components/ui/GenericPage'
const TeacherMarkAttendance = lazy(() => import('./pages/teacher/MarkAttendance'))
const TeacherGrading = lazy(() => import('./pages/teacher/Grading'))
const TeacherUploadNotes = lazy(() => import('./pages/teacher/UploadNotes'))
const CommunicationHub = lazy(() => import('./pages/shared/CommunicationHub'))
const QuickMessenger = lazy(() => import('./pages/shared/QuickMessenger'))
const AILab = lazy(() => import('./pages/shared/AILab'))
const ReportCards = lazy(() => import('./pages/teacher/ReportCards'))
const NotificationCenter = lazy(() => import('./pages/shared/NotificationCenter'))
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'))
const StudentNotes = lazy(() => import('./pages/student/Notes'))
const SharedNotes = lazy(() => import('./pages/student/SharedNotes'))
const StudentAnnouncements = lazy(() => import('./pages/student/Announcements'))
const StudyPlanner = lazy(() => import('./pages/student/StudyPlanner'))
const CSCalendar = lazy(() => import('./pages/student/CSCalendar'))
const FocusMode = lazy(() => import('./pages/student/FocusMode'))
const StudentExams = lazy(() => import('./pages/student/Exams'))
const StudentExamSyllabus = lazy(() => import('./pages/student/ExamSyllabus'))
const StudentBusTracking = lazy(() => import('./pages/student/BusTracking'))
const SocialClub = lazy(() => import('./pages/student/SocialClub'))
const Achievements = lazy(() => import('./pages/student/Achievements'))
const Accolades = lazy(() => import('./pages/student/Accolades'))
const StudentProfile = lazy(() => import('./pages/student/Profile'))
const StudentCounselling = lazy(() => import('./pages/student/Counselling'))
const StudentHealth = lazy(() => import('./pages/student/Health'))
const TeacherManageAssignments = lazy(() => import('./pages/teacher/ManageAssignments'))
const TeacherManageExams = lazy(() => import('./pages/teacher/ManageExams'))
const TeacherExamSyllabus = lazy(() => import('./pages/teacher/ExamSyllabus'))
const TeacherClassAnalytics = lazy(() => import('./pages/teacher/ClassAnalytics'))
const TeacherStudentProgress = lazy(() => import('./pages/teacher/StudentProgress'))
const TeacherPerformanceReports = lazy(() => import('./pages/teacher/PerformanceReports'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminCalendar = lazy(() => import('./pages/admin/AdminCalendar'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminTimetable = lazy(() => import('./pages/admin/AdminTimetable'))
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'))
const AdminPayroll = lazy(() => import('./pages/admin/AdminPayroll'))
const AdminExams = lazy(() => import('./pages/admin/AdminExams'))
const AdminFees = lazy(() => import('./pages/admin/AdminFees'))
const AdminBusAssignment = lazy(() => import('./pages/admin/AdminBusAssignment'))
const AdminLostFound = lazy(() => import('./pages/admin/AdminLostFound'))
const AdminAnonymousReports = lazy(() => import('./pages/admin/AdminAnonymousReports'))
const AdminClinic = lazy(() => import('./pages/admin/AdminClinic'))
const AdminITHelpdesk = lazy(() => import('./pages/admin/AdminITHelpdesk'))
const AdminClubs = lazy(() => import('./pages/admin/AdminClubs'))
const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard'))
const ParentAttendance = lazy(() => import('./pages/parent/ParentAttendance'))
const ParentGrades = lazy(() => import('./pages/parent/ParentGrades'))
const ParentTimetable = lazy(() => import('./pages/parent/ParentTimetable'))
const ParentFees = lazy(() => import('./pages/parent/ParentFees'))
const ParentBusTracking = lazy(() => import('./pages/parent/ParentBusTracking'))
const ParentExamSyllabus = lazy(() => import('./pages/parent/ExamSyllabus'))
const ParentProfile = lazy(() => import('./pages/parent/ParentProfile'))
const ParentCounselling = lazy(() => import('./pages/parent/ParentCounselling'))
const ParentHealth = lazy(() => import('./pages/parent/ParentHealth'))
const ParentDigitalFridge = lazy(() => import('./pages/parent/DigitalFridge'))
const ParentBookHeavyAlerts = lazy(() => import('./pages/parent/BookHeavyAlerts'))
const DriverProfile = lazy(() => import('./pages/driver/DriverProfile'))
const LibrarianDashboard = lazy(() => import('./pages/librarian/LibrarianDashboard'))
const ManagerUsers = lazy(() => import('./pages/manager/ManagerUsers'))
const ManagerAcademics = lazy(() => import('./pages/manager/ManagerAcademics'))
const ManagerFinance = lazy(() => import('./pages/manager/ManagerFinance'))
const ManagerAnalytics = lazy(() => import('./pages/manager/ManagerAnalytics'))
const ManagerAnnouncements = lazy(() => import('./pages/manager/ManagerAnnouncements'))
const ManagerEvents = lazy(() => import('./pages/manager/ManagerEvents'))
const ManagerExams = lazy(() => import('./pages/manager/ManagerExams'))
const ManagerTimetable = lazy(() => import('./pages/manager/ManagerTimetable'))
const ManagerPayroll = lazy(() => import('./pages/manager/ManagerPayroll'))
const ManagerSecurity = lazy(() => import('./pages/manager/ManagerSecurity'))
const ManagerSettings = lazy(() => import('./pages/manager/ManagerSettings'))
const ManagerAuditLog = lazy(() => import('./pages/manager/ManagerAuditLog'))
const ManagerFees = lazy(() => import('./pages/manager/ManagerFees'))
const ManagerBusAssignment = lazy(() => import('./pages/manager/ManagerBusAssignment'))
const StudentDailyBriefing = lazy(() => import('./pages/student/DailyBriefing'))
const LibrarianProfile = lazy(() => import('./pages/librarian/LibrarianProfile'))
const CSLibrary = lazy(() => import('./pages/shared/CSLibrary'))
// Manager Phase 1+2
const ManagerScheduling = lazy(() => import('./pages/manager/ManagerScheduling'))
const ManagerSIS = lazy(() => import('./pages/manager/ManagerSIS'))
const ManagerHR = lazy(() => import('./pages/manager/ManagerHR'))
const ManagerInvoicing = lazy(() => import('./pages/manager/ManagerInvoicing'))
const ManagerLibrary = lazy(() => import('./pages/manager/ManagerLibrary'))
const ManagerERP = lazy(() => import('./pages/manager/ManagerERP'))
const ManagerComms = lazy(() => import('./pages/manager/ManagerComms'))
// Admin Phase 1+2
const ManagerTalentMarket = lazy(() => import('./pages/manager/ManagerTalentMarket'))
const AdminCirculars = lazy(() => import('./pages/admin/AdminCirculars'))
const AdminSIS = lazy(() => import('./pages/admin/AdminSIS'))
const AdminClassroom = lazy(() => import('./pages/admin/AdminClassroom'))
const AdminInvoicing = lazy(() => import('./pages/admin/AdminInvoicing'))
const AdminFinanceFull = lazy(() => import('./pages/admin/AdminFinanceFull'))
const AdminHR = lazy(() => import('./pages/admin/AdminHR'))
const AdminLibrary = lazy(() => import('./pages/admin/AdminLibrary'))
const AdminERP = lazy(() => import('./pages/admin/AdminERP'))
const AdminComms = lazy(() => import('./pages/admin/AdminComms'))
const TeacherClassroom = lazy(() => import('./pages/teacher/TeacherClassroom'))
const TeacherExamResults = lazy(() => import('./pages/teacher/TeacherExamResults'))
const TeacherMySection = lazy(() => import('./pages/teacher/MySection'))
const TeacherTimetable = lazy(() => import('./pages/teacher/Timetable'))
const LibrarianManagement = lazy(() => import('./pages/librarian/LibrarianManagement'))
const StudentExercises = lazy(() => import('./pages/student/Exercises'))
const StudentTalentMarket = lazy(() => import('./pages/student/TalentMarket'))
const StudentCourses = lazy(() => import('./pages/student/Courses'))
const StudentActivities = lazy(() => import('./pages/student/Activities'))
const StudentSupplyAlerts = lazy(() => import('./pages/student/SupplyAlerts'))
const StudentAssignmentDetails = lazy(() => import('./pages/student/AssignmentDetails'))
const UniversalInbox = lazy(() => import('./pages/shared/UniversalInbox'))
const StudentLostAndFound = lazy(() => import('./pages/student/StudentLostAndFound'))
const StudentITHelpdesk = lazy(() => import('./pages/student/StudentITHelpdesk'))
const StudentClinicVisits = lazy(() => import('./pages/student/StudentClinicVisits'))
const StudentAnonymousReports = lazy(() => import('./pages/student/StudentAnonymousReports'))
// Admin Phase 3
const AdminCounselling = lazy(() => import('./pages/admin/AdminCounselling'))
const AdminHealth = lazy(() => import('./pages/admin/AdminHealth'))
const AdminDiscipline = lazy(() => import('./pages/admin/AdminDiscipline'))
const AdminActivities = lazy(() => import('./pages/admin/AdminActivities'))
const AdminPortfolio = lazy(() => import('./pages/admin/AdminPortfolio'))
const AdminEnrolment = lazy(() => import('./pages/admin/AdminEnrolment'))
// Admin Phase 4
const AdminFacilities = lazy(() => import('./pages/admin/AdminFacilities'))
const AdminFoodService = lazy(() => import('./pages/admin/AdminFoodService'))
const AdminAthletics = lazy(() => import('./pages/admin/AdminAthletics'))
const AdminAlumni = lazy(() => import('./pages/admin/AdminAlumni'))
const AdminPlatform = lazy(() => import('./pages/admin/AdminPlatform'))
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'))
const CreateAccount = lazy(() => import('./pages/admin/CreateAccount'))
// Manager Phase 3
const ManagerCounselling = lazy(() => import('./pages/manager/ManagerCounselling'))
const ManagerHealth = lazy(() => import('./pages/manager/ManagerHealth'))
const ManagerDiscipline = lazy(() => import('./pages/manager/ManagerDiscipline'))
const ManagerActivities = lazy(() => import('./pages/manager/ManagerActivities'))
const ManagerPortfolio = lazy(() => import('./pages/manager/ManagerPortfolio'))
const ManagerEnrolment = lazy(() => import('./pages/manager/ManagerEnrolment'))
// Manager Phase 4
const ManagerFacilities = lazy(() => import('./pages/manager/ManagerFacilities'))
const ManagerFoodService = lazy(() => import('./pages/manager/ManagerFoodService'))
const ManagerAthletics = lazy(() => import('./pages/manager/ManagerAthletics'))
const ManagerAlumni = lazy(() => import('./pages/manager/ManagerAlumni'))
const ManagerPlatform = lazy(() => import('./pages/manager/ManagerPlatform'))
const AdminRoomBooking = lazy(() => import('./pages/admin/AdminRoomBooking'))
const AdminAssetTracking = lazy(() => import('./pages/admin/AdminAssetTracking'))
const ManagerRoomBooking = lazy(() => import('./pages/manager/ManagerRoomBooking'))
const ManagerAssetTracking = lazy(() => import('./pages/manager/ManagerAssetTracking'))
const TeacherRoomBooking = lazy(() => import('./pages/teacher/TeacherRoomBooking'))
const TeacherAssetTracking = lazy(() => import('./pages/teacher/TeacherAssetTracking'))
const TeacherSalary = lazy(() => import('./pages/teacher/TeacherSalary'))
const TeacherEnterGrades = lazy(() => import('./pages/teacher/EnterGrades'))
const TeacherGradeSubmissions = lazy(() => import('./pages/teacher/GradeSubmissions'))

function RouteMissRedirect() {
  return <Navigate to="/404page" replace />
}

function App() {
  const { isAuthenticated, user } = useAuthStore()

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
    return <ErrorBoundary><DashboardLayout /></ErrorBoundary>
  }

  return (
    <div className="aurora-bg">
      <ErrorBoundary>
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader variant="dots" size="lg" /></div>}>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<AboutPage />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Login />
          } />
          <Route path="/signup" element={
            isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Signup />
          } />

          {/* STUDENT */}
          <Route path="/student" element={roleGuard(['student'])}>
            <Route index element={<StudentDashboard />} />
            <Route path="daily-briefing" element={<StudentDailyBriefing />} />
            <Route path="messages" element={<QuickMessenger />} />
            <Route path="homework" element={<Homework />} />
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
            <Route path="talent-market" element={<StudentTalentMarket />} />
            <Route path="inbox" element={<UniversalInbox />} />
            <Route path="ai" element={<AILab />} />
            <Route path="community" element={<StudentCommunity />} />
            <Route path="comms-hub" element={<CommunicationHub />} />
            <Route path="social-club" element={<SocialClub />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="accolades" element={<Accolades />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="exercises" element={<StudentExercises />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="activities" element={<StudentActivities />} />
            <Route path="supply-alerts" element={<StudentSupplyAlerts />} />
            <Route path="assignment-details" element={<StudentAssignmentDetails />} />
            <Route path="counselling" element={<StudentCounselling />} />
            <Route path="health" element={<StudentHealth />} />
            <Route path="lost-found" element={<StudentLostAndFound />} />
            <Route path="it-helpdesk" element={<StudentITHelpdesk />} />
            <Route path="clinic" element={<StudentClinicVisits />} />
            <Route path="anonymous-report" element={<StudentAnonymousReports />} />
          </Route>

          {/* TEACHER */}
          <Route path="/teacher" element={roleGuard(['teacher'])}>
            <Route index element={<TeacherDashboard />} />
            <Route path="assignments" element={<TeacherManageAssignments />} />
            <Route path="homework" element={<Homework />} />
            <Route path="attendance" element={<TeacherMarkAttendance />} />
            <Route path="grading" element={<TeacherGrading />} />
            <Route path="enter-grades" element={<TeacherEnterGrades />} />
            <Route path="grade-submissions" element={<TeacherGradeSubmissions />} />
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
            <Route path="classroom" element={<TeacherClassroom />} />
            <Route path="talent-market" element={<ManagerTalentMarket />} />

            <Route path="exam-results" element={<TeacherExamResults />} />
            <Route path="room-booking" element={<TeacherRoomBooking />} />
            <Route path="asset-tracking" element={<TeacherAssetTracking />} />
            <Route path="salary" element={<TeacherSalary />} />
            <Route path="my-section" element={<TeacherMySection />} />
            <Route path="timetable" element={<TeacherTimetable />} />
          </Route>

          {/* ADMIN */}
          <Route path="/admin" element={roleGuard(['admin'])}>
            <Route index element={<AdminDashboard />} />
            <Route path="messages" element={<QuickMessenger />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="accounts" element={<Navigate to="/admin/fees" replace />} />
            <Route path="timetable" element={<AdminTimetable />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="payroll" element={<AdminPayroll />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="fees" element={<AdminFees />} />
            <Route path="ai" element={<AILab />} />
            <Route path="comms-hub" element={<CommunicationHub />} />
                        <Route path="notifications" element={<NotificationCenter />} />
            <Route path="bus-assignment" element={<AdminBusAssignment />} />
            <Route path="lost-found" element={<AdminLostFound />} />
            <Route path="anonymous-report" element={<AdminAnonymousReports />} />
            <Route path="clubs" element={<AdminClubs />} />
            <Route path="clinic" element={<AdminClinic />} />
            <Route path="e-portfolio" element={<AdminPortfolio />} />
            <Route path="it-helpdesk" element={<AdminITHelpdesk />} />
            <Route path="fee-installments" element={<Navigate to="/admin/fees" replace />} />
            {/* Admin Phase 1+2 */}
            <Route path="circulars" element={<AdminCirculars />} />
            <Route path="sis" element={<AdminSIS />} />
            <Route path="classroom" element={<AdminClassroom />} />
            <Route path="invoicing" element={<AdminInvoicing />} />
            <Route path="finance-full" element={<AdminFinanceFull />} />
            <Route path="hr" element={<AdminHR />} />
            <Route path="library" element={<AdminLibrary />} />
            <Route path="erp" element={<AdminERP />} />
            <Route path="comms" element={<AdminComms />} />
            {/* Admin Phase 3 */}
            <Route path="counselling" element={<AdminCounselling />} />
            <Route path="health" element={<AdminHealth />} />
            <Route path="discipline" element={<AdminDiscipline />} />
            <Route path="activities" element={<AdminActivities />} />
            <Route path="talent-market" element={<ManagerTalentMarket />} />
            <Route path="portfolio" element={<AdminPortfolio />} />
            <Route path="enrolment" element={<AdminEnrolment />} />
            {/* Admin Phase 4 */}
            <Route path="facilities" element={<AdminFacilities />} />
            <Route path="transport" element={<GenericPage title="Transport" description="Transport & bus management" icon="Bus" category="Facilities" role="admin" />} />
                        <Route path="food-service" element={<AdminFoodService />} />
            <Route path="athletics" element={<AdminAthletics />} />
            <Route path="alumni" element={<AdminAlumni />} />
            <Route path="platform" element={<AdminPlatform />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="room-booking" element={<AdminRoomBooking />} />
            <Route path="asset-tracking" element={<AdminAssetTracking />} />
            <Route path="create-account" element={<CreateAccount />} />
          </Route>

          {/* PARENT */}
          <Route path="/parent" element={roleGuard(['parent'])}>
            <Route index element={<ParentDashboard />} />
            <Route path="messages" element={<QuickMessenger />} />
            <Route path="attendance" element={<ParentAttendance />} />
            <Route path="grades" element={<ParentGrades />} />
            <Route path="timetable" element={<ParentTimetable />} />
            <Route path="fees" element={<ParentFees />} />
            <Route path="bus-tracking" element={<ParentBusTracking />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="exam-syllabus" element={<ParentExamSyllabus />} />
            <Route path="counselling" element={<ParentCounselling />} />
            <Route path="health" element={<ParentHealth />} />
            <Route path="digital-fridge" element={<ParentDigitalFridge />} />
            <Route path="book-heavy-alerts" element={<ParentBookHeavyAlerts />} />
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
            <Route path="management" element={<LibrarianManagement />} />
          </Route>

          {/* COORDINATOR */}
          <Route path="/coordinator" element={roleGuard(['coordinator'])}>
            <Route index element={<CoordinatorDashboard />} />
            <Route path="schools" element={<GenericPage title="Schools" description="Multi-school management" icon="Building2" category="Management" role="coordinator" />} />
            <Route path="staff" element={<GenericPage title="Staff" description="Staff management" icon="Users" category="Management" role="coordinator" />} />
            <Route path="analytics" element={<GenericPage title="Analytics" description="Performance analytics" icon="BarChart3" category="Analytics" role="coordinator" />} />
            <Route path="ai" element={<AILab />} />
          </Route>

          {/* MANAGER */}
          <Route path="/manager" element={roleGuard(['manager'])}>
            <Route index element={<ManagerDashboard />} />
            <Route path="users" element={<ManagerUsers />} />
            <Route path="academics" element={<ManagerAcademics />} />
            <Route path="finance" element={<ManagerFinance />} />
            <Route path="analytics" element={<ManagerAnalytics />} />
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
            {/* Manager Phase 1+2 */}
            <Route path="scheduling" element={<ManagerScheduling />} />
            <Route path="sis" element={<ManagerSIS />} />
            <Route path="hr" element={<ManagerHR />} />
            <Route path="invoicing" element={<ManagerInvoicing />} />
            <Route path="library" element={<ManagerLibrary />} />
            <Route path="erp" element={<ManagerERP />} />
            <Route path="comms" element={<ManagerComms />} />
            {/* Manager Phase 3 */}
            <Route path="counselling" element={<ManagerCounselling />} />
            <Route path="health" element={<ManagerHealth />} />
            <Route path="discipline" element={<ManagerDiscipline />} />
            <Route path="activities" element={<ManagerActivities />} />
            <Route path="talent-market" element={<ManagerTalentMarket />} />
            <Route path="portfolio" element={<ManagerPortfolio />} />
            <Route path="enrolment" element={<ManagerEnrolment />} />
            {/* Manager Phase 4 */}
            <Route path="facilities" element={<ManagerFacilities />} />
            <Route path="transport" element={<GenericPage title="Transport" description="Transport & bus management" icon="Bus" category="Facilities" role="manager" />} />
                        <Route path="food-service" element={<ManagerFoodService />} />
            <Route path="athletics" element={<ManagerAthletics />} />
            <Route path="alumni" element={<ManagerAlumni />} />
            <Route path="platform" element={<ManagerPlatform />} />
            <Route path="room-booking" element={<ManagerRoomBooking />} />
            <Route path="asset-tracking" element={<ManagerAssetTracking />} />
          </Route>

          <Route path="/cs-library" element={
            isAuthenticated ? <CSLibrary /> : <Navigate to="/login" replace />
          } />

          <Route path="/404page" element={<NotFoundPage />} />
          <Route path="*" element={<RouteMissRedirect />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </div>
  )
}

export default App
