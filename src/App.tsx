import Loader from "./components/ui/loader"
import ErrorBoundary from './components/ui/ErrorBoundary'
import MobileNav from '@/components/ui/MobileNav'

import { Suspense, useEffect } from 'react'
import { retryLazy } from './lib/retry-lazy'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, useThemeStore } from './lib/store'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import CampusDesk from './pages/CampusDesk'
import CampusPay from './pages/CampusPay'
const Landing = retryLazy(() => import('./pages/Landing'))
const AboutPage = retryLazy(() => import('./pages/AboutPage'))
const Photos = retryLazy(() => import('./pages/Photos'))
const Homework = retryLazy(() => import('./pages/shared/Homework'))
const StudentDashboard = retryLazy(() => import('./pages/student/Dashboard'))
const StudentAssignments = retryLazy(() => import('./pages/student/Assignments'))
const StudentTimetable = retryLazy(() => import('./pages/student/Timetable'))
const StudentGrades = retryLazy(() => import('./pages/student/Grades'))
const StudentAttendance = retryLazy(() => import('./pages/student/Attendance'))
const StudentFees = retryLazy(() => import('./pages/student/Fees'))
const StudentCommunity = retryLazy(() => import('./pages/student/Community'))
const StudentAI = retryLazy(() => import('./pages/student/AI'))
const TeacherDashboard = retryLazy(() => import('./pages/teacher/Dashboard'))
const AdminDashboard = retryLazy(() => import('./pages/admin/Dashboard'))
const CoordinatorDashboard = retryLazy(() => import('./pages/coordinator/Dashboard'))
const DriverDashboard = retryLazy(() => import('./pages/driver/Dashboard'))
import DashboardLayout from './components/layout/DashboardLayout'
import { NotFoundPage } from './components/ui/404-page-not-found'

import GenericPage from './components/ui/GenericPage'
const TeacherMarkAttendance = retryLazy(() => import('./pages/teacher/MarkAttendance'))
const TeacherGrading = retryLazy(() => import('./pages/teacher/Grading'))
const TeacherUploadNotes = retryLazy(() => import('./pages/teacher/UploadNotes'))
const CommunicationHub = retryLazy(() => import('./pages/shared/CommunicationHub'))
const QuickMessenger = retryLazy(() => import('./pages/shared/QuickMessenger'))
const AILab = retryLazy(() => import('./pages/shared/AILab'))
const ReportCards = retryLazy(() => import('./pages/teacher/ReportCards'))
const NotificationCenter = retryLazy(() => import('./pages/shared/NotificationCenter'))
const StudentNotes = retryLazy(() => import('./pages/student/Notes'))
const SharedNotes = retryLazy(() => import('./pages/student/SharedNotes'))
const StudentAnnouncements = retryLazy(() => import('./pages/student/Announcements'))
const StudyPlanner = retryLazy(() => import('./pages/student/StudyPlanner'))
const CSCalendar = retryLazy(() => import('./pages/student/CSCalendar'))
const FocusMode = retryLazy(() => import('./pages/student/FocusMode'))
const StudentExams = retryLazy(() => import('./pages/student/Exams'))
const StudentExamSyllabus = retryLazy(() => import('./pages/student/ExamSyllabus'))
const StudentBusTracking = retryLazy(() => import('./pages/student/BusTracking'))
const SocialClub = retryLazy(() => import('./pages/student/SocialClub'))
const Achievements = retryLazy(() => import('./pages/student/Achievements'))
const Accolades = retryLazy(() => import('./pages/student/Accolades'))
const StudentProfile = retryLazy(() => import('./pages/student/Profile'))
const StudentCounselling = retryLazy(() => import('./pages/student/Counselling'))
const StudentHealth = retryLazy(() => import('./pages/student/Health'))
const TeacherManageAssignments = retryLazy(() => import('./pages/teacher/ManageAssignments'))
const TeacherManageExams = retryLazy(() => import('./pages/teacher/ManageExams'))
const TeacherExamSyllabus = retryLazy(() => import('./pages/teacher/ExamSyllabus'))
const TeacherClassAnalytics = retryLazy(() => import('./pages/teacher/ClassAnalytics'))
const TeacherStudentProgress = retryLazy(() => import('./pages/teacher/StudentProgress'))
const TeacherPerformanceReports = retryLazy(() => import('./pages/teacher/PerformanceReports'))
const AdminAnalytics = retryLazy(() => import('./pages/admin/AdminAnalytics'))
const AdminCalendar = retryLazy(() => import('./pages/admin/AdminCalendar'))
const AdminUsers = retryLazy(() => import('./pages/admin/AdminUsers'))
const AdminTimetable = retryLazy(() => import('./pages/admin/AdminTimetable'))
const AdminAnnouncements = retryLazy(() => import('./pages/admin/AdminAnnouncements'))
const AdminPayroll = retryLazy(() => import('./pages/admin/AdminPayroll'))
const AdminExams = retryLazy(() => import('./pages/admin/AdminExams'))
const AdminFees = retryLazy(() => import('./pages/admin/AdminFees'))
const AdminBusAssignment = retryLazy(() => import('./pages/admin/AdminBusAssignment'))
const AdminLostFound = retryLazy(() => import('./pages/admin/AdminLostFound'))
const AdminAnonymousReports = retryLazy(() => import('./pages/admin/AdminAnonymousReports'))
const AdminClinic = retryLazy(() => import('./pages/admin/AdminClinic'))
const AdminITHelpdesk = retryLazy(() => import('./pages/admin/AdminITHelpdesk'))
const AdminClubs = retryLazy(() => import('./pages/admin/AdminClubs'))
const ParentDashboard = retryLazy(() => import('./pages/parent/ParentDashboard'))
const ParentAttendance = retryLazy(() => import('./pages/parent/ParentAttendance'))
const ParentGrades = retryLazy(() => import('./pages/parent/ParentGrades'))
const ParentTimetable = retryLazy(() => import('./pages/parent/ParentTimetable'))
const ParentFees = retryLazy(() => import('./pages/parent/ParentFees'))
const ParentBusTracking = retryLazy(() => import('./pages/parent/ParentBusTracking'))
const ParentExamSyllabus = retryLazy(() => import('./pages/parent/ExamSyllabus'))
const ParentProfile = retryLazy(() => import('./pages/parent/ParentProfile'))
const ParentCounselling = retryLazy(() => import('./pages/parent/ParentCounselling'))
const ParentHealth = retryLazy(() => import('./pages/parent/ParentHealth'))
const ParentDigitalFridge = retryLazy(() => import('./pages/parent/DigitalFridge'))
const ParentBookHeavyAlerts = retryLazy(() => import('./pages/parent/BookHeavyAlerts'))
const ParentMyChildren = retryLazy(() => import('./pages/parent/MyChildren'))
const DriverProfile = retryLazy(() => import('./pages/driver/DriverProfile'))
const StudentDailyBriefing = retryLazy(() => import('./pages/student/DailyBriefing'))
const LibrarianProfile = retryLazy(() => import('./pages/librarian/LibrarianProfile'))
const CSLibrary = retryLazy(() => import('./pages/shared/CSLibrary'))

// Admin Phase 1+2
const AdminCirculars = retryLazy(() => import('./pages/admin/AdminCirculars'))
const AdminSIS = retryLazy(() => import('./pages/admin/AdminSIS'))
const AdminClassroom = retryLazy(() => import('./pages/admin/AdminClassroom'))
const AdminInvoicing = retryLazy(() => import('./pages/admin/AdminInvoicing'))
const AdminFinanceFull = retryLazy(() => import('./pages/admin/AdminFinanceFull'))
const AdminHR = retryLazy(() => import('./pages/admin/AdminHR'))
const AdminLibrary = retryLazy(() => import('./pages/admin/AdminLibrary'))
const AdminERP = retryLazy(() => import('./pages/admin/AdminERP'))
const AdminComms = retryLazy(() => import('./pages/admin/AdminComms'))
const TeacherClassroom = retryLazy(() => import('./pages/teacher/TeacherClassroom'))
const TeacherExamResults = retryLazy(() => import('./pages/teacher/TeacherExamResults'))
const TeacherMySection = retryLazy(() => import('./pages/teacher/MySection'))
const TeacherTimetable = retryLazy(() => import('./pages/teacher/Timetable'))
const LibrarianReserveBooks = retryLazy(() => import('./pages/librarian/LibrarianReserveBooks'))
const LibrarianBooksIssued = retryLazy(() => import('./pages/librarian/LibrarianBooksIssued'))
const StudentExercises = retryLazy(() => import('./pages/student/Exercises'))
const StudentTalentMarket = retryLazy(() => import('./pages/student/TalentMarket'))
const StudentCourses = retryLazy(() => import('./pages/student/Courses'))
const StudentActivities = retryLazy(() => import('./pages/student/Activities'))
const StudentSupplyAlerts = retryLazy(() => import('./pages/student/SupplyAlerts'))
const StudentAssignmentDetails = retryLazy(() => import('./pages/student/AssignmentDetails'))

const StudentLostAndFound = retryLazy(() => import('./pages/student/StudentLostAndFound'))
const StudentITHelpdesk = retryLazy(() => import('./pages/student/StudentITHelpdesk'))
const StudentClinicVisits = retryLazy(() => import('./pages/student/StudentClinicVisits'))
const StudentAnonymousReports = retryLazy(() => import('./pages/student/StudentAnonymousReports'))
// Admin Phase 3
const AdminCounselling = retryLazy(() => import('./pages/admin/AdminCounselling'))
const AdminHealth = retryLazy(() => import('./pages/admin/AdminHealth'))
const AdminDiscipline = retryLazy(() => import('./pages/admin/AdminDiscipline'))
const AdminActivities = retryLazy(() => import('./pages/admin/AdminActivities'))
const AdminPortfolio = retryLazy(() => import('./pages/admin/AdminPortfolio'))
const AdminEnrolment = retryLazy(() => import('./pages/admin/AdminEnrolment'))
// Admin Phase 4
const AdminFacilities = retryLazy(() => import('./pages/admin/AdminFacilities'))
const AdminAthletics = retryLazy(() => import('./pages/admin/AdminAthletics'))
const AdminAlumni = retryLazy(() => import('./pages/admin/AdminAlumni'))
const AdminPlatform = retryLazy(() => import('./pages/admin/AdminPlatform'))
const AdminProfile = retryLazy(() => import('./pages/admin/AdminProfile'))
const CreateAccount = retryLazy(() => import('./pages/admin/CreateAccount'))

const AdminRoomBooking = retryLazy(() => import('./pages/admin/AdminRoomBooking'))
const AdminAssetTracking = retryLazy(() => import('./pages/admin/AdminAssetTracking'))
const AdminTalentMarket = retryLazy(() => import('./pages/admin/AdminTalentMarket'))

const TeacherRoomBooking = retryLazy(() => import('./pages/teacher/TeacherRoomBooking'))
const TeacherAssetTracking = retryLazy(() => import('./pages/teacher/TeacherAssetTracking'))
const TeacherSalary = retryLazy(() => import('./pages/teacher/TeacherSalary'))
const TeacherEnterGrades = retryLazy(() => import('./pages/teacher/EnterGrades'))
const TeacherGradeSubmissions = retryLazy(() => import('./pages/teacher/GradeSubmissions'))

function RouteMissRedirect() {
  return <Navigate to="/404page" replace />
}

function App() {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]
    const pane = last
      ? last.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : 'Dashboard'
    document.title = `SchoolSync | ${pane}`
  }, [location])

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
        <MobileNav />
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
            <Route path="exam-results" element={<TeacherExamResults />} />
            <Route path="room-booking" element={<TeacherRoomBooking />} />
            <Route path="asset-tracking" element={<TeacherAssetTracking />} />
            <Route path="salary" element={<TeacherSalary />} />
            <Route path="my-section" element={<TeacherMySection />} />
            <Route path="my-schedule" element={<TeacherTimetable />} />
            <Route path="timetable" element={<TeacherTimetable />} />
            <Route path="talent-market" element={<AdminTalentMarket />} />
            <Route path="borrowed-books" element={<Navigate to="/cs-library?tab=borrowed" replace />} />
            <Route path="reserve-books" element={<Navigate to="/cs-library?tab=reserve" replace />} />
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
            <Route path="portfolio" element={<AdminPortfolio />} />
            <Route path="enrolment" element={<AdminEnrolment />} />
            {/* Admin Phase 4 */}
            <Route path="facilities" element={<AdminFacilities />} />
            <Route path="transport" element={<GenericPage title="Transport" description="Transport & bus management" icon="Bus" category="Facilities" role="admin" />} />
                        <Route path="athletics" element={<AdminAthletics />} />
            <Route path="alumni" element={<AdminAlumni />} />
            <Route path="platform" element={<AdminPlatform />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="room-booking" element={<AdminRoomBooking />} />
            <Route path="asset-tracking" element={<AdminAssetTracking />} />
            <Route path="talent-market" element={<AdminTalentMarket />} />
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
            <Route path="my-children" element={<ParentMyChildren />} />
            <Route path="profile" element={<ParentProfile />} />
          </Route>

          {/* DRIVER */}
          <Route path="/driver" element={roleGuard(['driver'])}>
            <Route index element={<DriverDashboard />} />
            <Route path="profile" element={<DriverProfile />} />
          </Route>

          {/* LIBRARIAN */}
          <Route path="/librarian" element={roleGuard(['librarian'])}>
            <Route index element={<Navigate to="reserve-books" replace />} />
            <Route path="profile" element={<LibrarianProfile />} />
            <Route path="reserve-books" element={<LibrarianReserveBooks />} />
            <Route path="books-issued" element={<LibrarianBooksIssued />} />
          </Route>

          {/* COORDINATOR */}
          <Route path="/coordinator" element={roleGuard(['coordinator'])}>
            <Route index element={<CoordinatorDashboard />} />
            <Route path="schools" element={<GenericPage title="Schools" description="Multi-school management" icon="Building2" category="Management" role="coordinator" />} />
            <Route path="staff" element={<GenericPage title="Staff" description="Staff management" icon="Users" category="Management" role="coordinator" />} />
            <Route path="analytics" element={<GenericPage title="Analytics" description="Performance analytics" icon="BarChart3" category="Analytics" role="coordinator" />} />
            <Route path="ai" element={<AILab />} />
          </Route>

          {/* MANAGER (portal removed) */}
          <Route path="/manager" element={roleGuard(['manager'])}>
            <Route index element={<Navigate to="/404page" replace />} />
          </Route>

          <Route path="/campus-desk" element={<CampusDesk />} />
          <Route path="/campus-pay" element={<CampusPay />} />
          <Route path="/cs-library" element={
            isAuthenticated ? <DashboardLayout><CSLibrary /></DashboardLayout> : <Navigate to="/login" replace />
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
