# Requirements Document: OP-CS_CONNECT Massive School Features

## Introduction

This document specifies 15 major features for the OP-CS_CONNECT school management system. These features extend the existing backend infrastructure (Supabase, Express API, Socket.io, Stream Chat) to provide comprehensive academic management, parent engagement, student development, and administrative automation capabilities. The features are prioritized by impact and dependencies, leveraging existing authentication, real-time communication, and file upload infrastructure.

## Glossary

- **System**: OP-CS_CONNECT school management platform
- **Student**: User with student role accessing academic features
- **Teacher**: User with teacher role managing classes and assessments
- **Parent**: User with parent role monitoring student progress
- **Admin**: User with admin role managing system configuration
- **Learning_Path**: Personalized sequence of study materials and assessments based on student performance
- **Engagement_Score**: Numeric metric (0-100) measuring student participation and interaction
- **At_Risk_Student**: Student identified by predictive analytics as likely to underperform
- **Progress_Report**: Automated document containing student performance analysis and AI-generated comments
- **Rubric**: Scoring framework defining criteria and point values for assignments
- **Plagiarism_Detection**: System analyzing assignment submissions for content similarity
- **Peer_Review**: Process where students evaluate and provide feedback on peer submissions
- **Question_Bank**: Repository of assessment questions organized by subject and difficulty
- **Auto_Grading**: Automated scoring system for objective questions (MCQ, true/false, fill-in-blank)
- **Proctoring**: Monitoring system ensuring exam integrity during online assessments
- **Scholarship_Eligibility**: Criteria-based determination of student qualification for financial aid
- **Financial_Aid_Recommendation**: System-generated suggestion for aid amount and type
- **Behavioral_Incident**: Documented record of student conduct violation or achievement
- **Discipline_Escalation**: Automatic progression of incident severity and notification
- **Library_Catalog**: Searchable database of available books and resources
- **Reading_Recommendation**: AI-generated suggestion for books based on student interests and level
- **Co_Curricular_Activity**: Non-academic program (sports, clubs, competitions)
- **Achievement_Certificate**: Digital credential documenting activity participation and awards
- **Portfolio**: Collection of student achievements, certificates, and activity records
- **Notification_Channel**: Delivery method for alerts (SMS, Email, Push, In-App)
- **Customizable_Alert**: User-configurable notification rule based on events and preferences
- **Complaint_Ticket**: Formal record of grievance with tracking and resolution workflow
- **Escalation_Workflow**: Automatic progression of complaint severity and assignment

---

## Requirements

### Requirement 1: AI-Powered Personalized Learning Paths

**User Story:** As a student, I want to receive personalized learning paths based on my performance, so that I can focus on areas where I need improvement and progress at my own pace.

#### Acceptance Criteria

1. WHEN a student completes an assessment, THE System SHALL analyze performance data and identify knowledge gaps
2. WHEN knowledge gaps are identified, THE System SHALL generate a personalized Learning_Path with recommended study materials and practice exercises
3. WHEN a student follows a Learning_Path, THE System SHALL track progress and adjust recommendations based on performance
4. WHEN a student's performance indicates at-risk status, THE System SHALL flag the At_Risk_Student and notify the teacher
5. WHEN a teacher views a student's Learning_Path, THE System SHALL display progress metrics, completion percentage, and recommended interventions
6. THE System SHALL predict student performance trends using historical assessment data and engagement patterns
7. WHEN a Learning_Path is generated, THE System SHALL ensure recommendations align with curriculum standards and learning objectives
8. THE System SHALL store Learning_Path data in Supabase with references to student_profiles, assignments, and marks tables

---

### Requirement 2: Parent-Teacher Collaboration Hub

**User Story:** As a parent, I want to communicate with teachers in real-time, view my child's progress, and request meetings, so that I can stay informed and involved in my child's education.

**User Story:** As a teacher, I want to share progress updates with parents, receive feedback, and schedule meetings efficiently, so that I can maintain strong parent engagement.

#### Acceptance Criteria

1. WHEN a parent initiates a message to a teacher, THE System SHALL deliver the message via Stream Chat in real-time
2. WHEN a teacher sends a progress update, THE System SHALL notify the parent via selected Notification_Channels (Email, SMS, Push, In-App)
3. WHEN a parent requests a meeting, THE System SHALL create a meeting request with proposed times and allow teacher to accept/decline
4. WHEN a meeting is scheduled, THE System SHALL send calendar invitations to both parent and teacher
5. WHEN a parent views the collaboration hub, THE System SHALL display shared progress dashboard showing student's grades, attendance, and recent achievements
6. WHEN a teacher provides feedback, THE System SHALL store feedback in Supabase and make it visible to parent with timestamp
7. WHEN a parent sends two-way feedback, THE System SHALL allow teacher to respond and maintain conversation thread
8. THE System SHALL enforce role-based access control ensuring parents only see their child's data
9. WHEN a message is sent, THE System SHALL use Socket.io to deliver real-time notifications to connected users
10. THE System SHALL integrate with Stream Chat for message persistence and history

---

### Requirement 3: Smart Attendance & Engagement Tracking

**User Story:** As a teacher, I want to track student attendance and engagement automatically, receive alerts for patterns, and identify at-risk students, so that I can intervene early and improve outcomes.

**User Story:** As an admin, I want to view school-wide attendance analytics and engagement trends, so that I can identify systemic issues and allocate resources effectively.

#### Acceptance Criteria

1. WHEN attendance is marked for a class, THE System SHALL record the attendance record in Supabase attendance table
2. WHEN a student's attendance falls below a configurable threshold, THE System SHALL auto-alert the teacher and parent
3. WHEN engagement data is collected (participation, assignment submission, quiz performance), THE System SHALL calculate an Engagement_Score (0-100) for each student
4. WHEN Engagement_Score drops below a threshold, THE System SHALL flag the student and notify teacher
5. WHEN attendance and engagement patterns are analyzed, THE System SHALL identify predictive indicators of poor performance
6. WHEN patterns are identified, THE System SHALL generate pattern analysis report showing trends over time
7. WHEN an admin views analytics dashboard, THE System SHALL display school-wide attendance rates, engagement distribution, and at-risk student count
8. WHEN a teacher views class analytics, THE System SHALL display per-student attendance history, engagement trends, and comparative metrics
9. THE System SHALL store engagement metrics in Supabase with references to student_profiles and attendance tables
10. WHEN engagement data changes, THE System SHALL broadcast updates via Socket.io to connected dashboards

---

### Requirement 4: Automated Report Card & Progress Reports

**User Story:** As a teacher, I want to generate progress reports automatically with AI-generated comments, comparative analytics, and trend analysis, so that I can save time and provide meaningful feedback.

**User Story:** As a parent, I want to receive comprehensive progress reports showing my child's performance trends and areas for improvement, so that I can support their learning at home.

#### Acceptance Criteria

1. WHEN a grading period ends, THE System SHALL aggregate student marks from Supabase marks table
2. WHEN marks are aggregated, THE System SHALL calculate subject-wise performance, overall GPA, and grade distribution
3. WHEN performance data is analyzed, THE System SHALL generate AI-powered comments describing strengths, weaknesses, and recommendations
4. WHEN a Progress_Report is generated, THE System SHALL include comparative analytics showing student's performance relative to class average and previous periods
5. WHEN trend analysis is performed, THE System SHALL identify performance trajectories (improving, declining, stable) and highlight significant changes
6. WHEN a Progress_Report is complete, THE System SHALL format it as a downloadable PDF document
7. WHEN a parent requests a report, THE System SHALL deliver the report via selected Notification_Channels
8. WHEN a teacher customizes report template, THE System SHALL allow selection of sections, metrics, and comment style
9. THE System SHALL store Progress_Report data in Supabase with references to marks and student_profiles tables
10. WHEN a report is generated, THE System SHALL ensure data accuracy by validating marks against source records

---

### Requirement 5: Assignment & Homework Management

**User Story:** As a teacher, I want to create assignments with rubrics, auto-grade objective questions, detect plagiarism, and enable peer review, so that I can manage large classes efficiently and provide fair assessment.

**User Story:** As a student, I want to submit assignments, receive plagiarism feedback, and review peer work, so that I can learn from feedback and improve my work.

#### Acceptance Criteria

1. WHEN a teacher creates an assignment, THE System SHALL allow definition of title, description, due date, and submission format
2. WHEN a teacher defines a Rubric, THE System SHALL allow specification of criteria, point values, and performance levels
3. WHEN a student submits an assignment, THE System SHALL store submission in Supabase with timestamp and file reference
4. WHEN an assignment contains MCQ or objective questions, THE System SHALL auto-grade responses and calculate score
5. WHEN auto-grading is complete, THE System SHALL provide instant feedback to student showing correct answers and explanations
6. WHEN a student submits written work, THE System SHALL perform Plagiarism_Detection by comparing against previous submissions and external sources
7. WHEN plagiarism is detected, THE System SHALL generate a plagiarism report showing similarity percentage and flagged sections
8. WHEN plagiarism report is generated, THE System SHALL notify teacher and student with detailed findings
9. WHEN Peer_Review is enabled, THE System SHALL assign peer reviewers and provide review rubric
10. WHEN a peer review is submitted, THE System SHALL notify the original author and store feedback in Supabase
11. WHEN a teacher grades using Rubric, THE System SHALL calculate score based on criteria and provide structured feedback
12. THE System SHALL store assignment data in Supabase assignments table with references to submissions and grades
13. WHEN file upload occurs, THE System SHALL use Multer to handle up to 10MB files with virus scanning

---

### Requirement 6: Exam & Assessment Management

**User Story:** As a teacher, I want to create exams from a question bank, auto-generate papers with varied difficulty, enable online proctoring, and analyze results instantly, so that I can conduct fair assessments at scale.

**User Story:** As a student, I want to take online exams with proctoring, receive instant results, and understand my performance, so that I can identify learning gaps.

#### Acceptance Criteria

1. WHEN a teacher accesses the Question_Bank, THE System SHALL display questions organized by subject, topic, and difficulty level
2. WHEN a teacher creates an exam, THE System SHALL allow selection of questions from Question_Bank with specified quantity and difficulty distribution
3. WHEN an exam is created, THE System SHALL auto-generate unique question papers for each student with randomized question order
4. WHEN a student starts an exam, THE System SHALL enable Proctoring by capturing webcam feed and monitoring for suspicious activity
5. WHEN suspicious activity is detected during proctoring, THE System SHALL flag the exam and notify teacher
6. WHEN a student submits an exam, THE System SHALL auto-grade objective questions and calculate total score
7. WHEN exam grading is complete, THE System SHALL provide instant result analysis showing score, percentile, and performance by topic
8. WHEN results are analyzed, THE System SHALL identify weak topics and recommend review materials
9. WHEN a teacher views exam analytics, THE System SHALL display class-wide statistics, question difficulty analysis, and discrimination index
10. THE System SHALL store exam data in Supabase with references to Question_Bank, student responses, and marks
11. WHEN exam questions are added to Question_Bank, THE System SHALL allow categorization by subject, topic, difficulty (1-5), and learning objective
12. WHEN an exam is conducted, THE System SHALL enforce time limits and prevent submission after deadline

---

### Requirement 7: Scholarship & Financial Aid Tracking

**User Story:** As an admin, I want to identify students eligible for scholarships, track applications, and recommend financial aid, so that I can ensure deserving students receive support.

**User Story:** As a student, I want to discover scholarship opportunities and track my application status, so that I can access financial support for my education.

#### Acceptance Criteria

1. WHEN scholarship criteria are defined, THE System SHALL specify eligibility requirements (GPA, attendance, income level, achievements)
2. WHEN a student's profile is updated, THE System SHALL evaluate Scholarship_Eligibility based on defined criteria
3. WHEN a student becomes eligible for a scholarship, THE System SHALL notify the student and add to eligible list
4. WHEN a student applies for a scholarship, THE System SHALL create application record in Supabase with status tracking
5. WHEN an admin reviews applications, THE System SHALL display applicant profiles, eligibility status, and supporting documents
6. WHEN an admin approves an application, THE System SHALL update status and trigger notification to student
7. WHEN Financial_Aid_Recommendation is generated, THE System SHALL calculate recommended aid amount based on financial need and eligibility
8. WHEN aid is recommended, THE System SHALL provide breakdown showing scholarship amount, grant amount, and loan eligibility
9. WHEN a student's performance changes, THE System SHALL re-evaluate eligibility and notify if status changes
10. WHEN scholarship data is tracked, THE System SHALL maintain audit trail of all decisions and communications
11. THE System SHALL store scholarship data in Supabase with references to student_profiles and financial records
12. WHEN aid is disbursed, THE System SHALL update student account and send confirmation notification

---

### Requirement 8: Parent Portal Analytics

**User Story:** As a parent, I want to view a visual dashboard showing my child's performance, compare with class averages, receive alerts, and get improvement recommendations, so that I can support my child's learning effectively.

#### Acceptance Criteria

1. WHEN a parent logs into the portal, THE System SHALL display personalized dashboard with child's key metrics
2. WHEN dashboard loads, THE System SHALL display visual charts showing grades by subject, attendance trend, and engagement score
3. WHEN a parent views performance comparison, THE System SHALL show child's performance relative to class average and grade distribution
4. WHEN performance falls below target, THE System SHALL display alert with specific areas needing improvement
5. WHEN improvement recommendations are generated, THE System SHALL suggest specific actions (additional practice, tutoring, study groups)
6. WHEN a parent views alerts, THE System SHALL display chronological list of recent alerts with severity levels
7. WHEN a parent customizes dashboard, THE System SHALL allow selection of metrics to display and alert preferences
8. WHEN dashboard data updates, THE System SHALL refresh in real-time via Socket.io without requiring page reload
9. THE System SHALL store dashboard preferences in Supabase with references to parent and student profiles
10. WHEN a parent exports data, THE System SHALL generate downloadable report in PDF format with selected metrics

---

### Requirement 9: Teacher Workload Automation

**User Story:** As a teacher, I want to auto-generate reports, perform bulk grade entry, auto-calculate final grades, and generate performance reports, so that I can reduce administrative burden and focus on teaching.

#### Acceptance Criteria

1. WHEN a teacher accesses grade management, THE System SHALL provide bulk grade entry interface for multiple students
2. WHEN grades are entered in bulk, THE System SHALL validate entries and store in Supabase marks table
3. WHEN grades are stored, THE System SHALL auto-calculate subject totals, weighted averages, and final grades
4. WHEN final grades are calculated, THE System SHALL apply configured grading scale and generate letter grades
5. WHEN a teacher requests a report, THE System SHALL auto-generate class performance report with statistics and analysis
6. WHEN performance report is generated, THE System SHALL include class average, grade distribution, and trend analysis
7. WHEN a teacher generates attendance report, THE System SHALL aggregate attendance data and calculate attendance percentage
8. WHEN reports are generated, THE System SHALL format as downloadable PDF with school branding
9. WHEN a teacher schedules report generation, THE System SHALL auto-generate reports at specified intervals (weekly, monthly)
10. THE System SHALL store report templates in Supabase allowing customization of sections and metrics
11. WHEN grade calculation rules change, THE System SHALL allow teacher to update formula and re-calculate all grades
12. WHEN bulk operations complete, THE System SHALL send notification with summary of changes

---

### Requirement 10: Student Career Guidance & College Readiness

**User Story:** As a student, I want to take career aptitude assessments, receive college recommendations, find scholarships, and track application timelines, so that I can make informed decisions about my future.

**User Story:** As a counselor, I want to guide students through career planning with data-driven recommendations, so that I can help them achieve their goals.

#### Acceptance Criteria

1. WHEN a student takes a career aptitude assessment, THE System SHALL evaluate responses and identify suitable career paths
2. WHEN career paths are identified, THE System SHALL provide detailed descriptions, required skills, and educational pathways
3. WHEN a student views college recommendations, THE System SHALL suggest colleges based on academic profile, interests, and career goals
4. WHEN college recommendations are displayed, THE System SHALL show admission requirements, average GPA, and acceptance rates
5. WHEN a student searches for scholarships, THE System SHALL filter opportunities by eligibility criteria and match with student profile
6. WHEN scholarship matches are found, THE System SHALL display application deadlines and requirements
7. WHEN a student creates an application timeline, THE System SHALL track important dates and send reminders
8. WHEN a reminder is triggered, THE System SHALL notify student via selected Notification_Channels
9. WHEN a student completes career planning steps, THE System SHALL generate career readiness report
10. THE System SHALL store career data in Supabase with references to student_profiles and assessment results
11. WHEN a counselor reviews student career plan, THE System SHALL display assessment results and recommendations
12. WHEN a student updates career goals, THE System SHALL re-evaluate recommendations and notify counselor

---

### Requirement 11: Behavioral & Discipline Management

**User Story:** As a teacher, I want to record behavioral incidents, track discipline actions, and monitor improvement plans, so that I can maintain classroom discipline and support student growth.

**User Story:** As an admin, I want to view discipline trends, manage escalation workflows, and ensure consistent enforcement, so that I can maintain school discipline standards.

#### Acceptance Criteria

1. WHEN a teacher records a Behavioral_Incident, THE System SHALL capture incident type, date, time, description, and involved students
2. WHEN an incident is recorded, THE System SHALL store in Supabase with references to student_profiles and teacher
3. WHEN an incident severity is assessed, THE System SHALL determine initial action (warning, detention, suspension)
4. WHEN an incident meets escalation criteria, THE System SHALL auto-escalate through Discipline_Escalation workflow
5. WHEN escalation occurs, THE System SHALL notify relevant stakeholders (teacher, parent, admin) based on severity
6. WHEN a detention is assigned, THE System SHALL track attendance and notify student and parent
7. WHEN an improvement plan is created, THE System SHALL define behavioral goals, monitoring period, and success criteria
8. WHEN improvement plan progress is tracked, THE System SHALL record observations and update status
9. WHEN an admin views discipline dashboard, THE System SHALL display incident trends, repeat offenders, and escalation patterns
10. WHEN discipline data is analyzed, THE System SHALL identify students needing intervention and recommend support
11. WHEN a student completes improvement plan, THE System SHALL generate completion report and notify stakeholders
12. THE System SHALL maintain audit trail of all discipline actions with timestamps and responsible personnel

---

### Requirement 12: Library Management Integration

**User Story:** As a student, I want to search the library catalog, reserve books, receive due date reminders, track fines, and get reading recommendations, so that I can access resources and manage my borrowing.

**User Story:** As a librarian, I want to manage the book catalog, track reservations, monitor due dates, and manage fines, so that I can maintain library operations efficiently.

#### Acceptance Criteria

1. WHEN a student searches the Library_Catalog, THE System SHALL display available books with title, author, ISBN, and availability status
2. WHEN a student reserves a book, THE System SHALL create reservation record in Supabase and notify when available
3. WHEN a book is borrowed, THE System SHALL record checkout date, due date, and borrower information
4. WHEN due date approaches, THE System SHALL send reminder notification to student
5. WHEN due date passes, THE System SHALL calculate fine based on configured rate and notify student
6. WHEN a student returns a book, THE System SHALL update status, calculate final fine if applicable, and close checkout record
7. WHEN a Reading_Recommendation is generated, THE System SHALL suggest books based on student's reading history and interests
8. WHEN a student views recommendations, THE System SHALL display book details and allow one-click reservation
9. WHEN a librarian manages catalog, THE System SHALL allow add/edit/delete operations for books
10. WHEN a librarian views dashboard, THE System SHALL display circulation statistics, popular books, and overdue items
11. THE System SHALL store library data in Supabase with book catalog, checkout history, and reservation records
12. WHEN fine is paid, THE System SHALL update student account and provide receipt

---

### Requirement 13: Co-Curricular Activity Tracking

**User Story:** As a student, I want to join clubs and sports, track my participation, earn achievement certificates, and build a portfolio, so that I can develop skills beyond academics.

**User Story:** As an activity coordinator, I want to manage activities, track participation, award certificates, and generate reports, so that I can recognize student achievements.

#### Acceptance Criteria

1. WHEN a student views available Co_Curricular_Activities, THE System SHALL display clubs, sports, competitions, and events
2. WHEN a student joins an activity, THE System SHALL create participation record in Supabase
3. WHEN a student attends an activity event, THE System SHALL record attendance and participation level
4. WHEN a student achieves a milestone in an activity, THE System SHALL generate Achievement_Certificate
5. WHEN a certificate is generated, THE System SHALL include activity name, achievement description, date, and digital signature
6. WHEN a student views their Portfolio, THE System SHALL display all certificates, participation records, and achievements
7. WHEN a student shares portfolio, THE System SHALL generate shareable link with selected achievements
8. WHEN an activity coordinator records participation, THE System SHALL allow bulk entry for multiple students
9. WHEN an activity coordinator awards certificates, THE System SHALL customize certificate template and generate for multiple recipients
10. WHEN a coordinator views activity dashboard, THE System SHALL display participation statistics, attendance trends, and top performers
11. THE System SHALL store activity data in Supabase with participation records, certificates, and portfolio data
12. WHEN portfolio is exported, THE System SHALL generate PDF document with all achievements and certificates

---

### Requirement 14: Smart Notifications & Reminders

**User Story:** As a user, I want to receive customizable alerts via my preferred channels (SMS, Email, Push, In-App), so that I can stay informed about important events without being overwhelmed.

**User Story:** As an admin, I want to configure system-wide notification rules and manage notification templates, so that I can ensure consistent and timely communication.

#### Acceptance Criteria

1. WHEN a user configures notification preferences, THE System SHALL allow selection of Notification_Channels (SMS, Email, Push, In-App)
2. WHEN a user creates a Customizable_Alert, THE System SHALL define trigger event, conditions, and notification content
3. WHEN a trigger event occurs, THE System SHALL evaluate conditions and send notification via selected channels
4. WHEN a notification is sent, THE System SHALL log delivery status in Supabase
5. WHEN a user receives a notification, THE System SHALL display in-app notification immediately if user is online
6. WHEN a user is offline, THE System SHALL queue notification and deliver when user comes online
7. WHEN a notification is delivered via Email, THE System SHALL use configured email service with branded template
8. WHEN a notification is delivered via SMS, THE System SHALL use configured SMS service with concise message
9. WHEN a notification is delivered via Push, THE System SHALL use configured push service with rich notification format
10. WHEN a user integrates calendar, THE System SHALL sync important dates and send calendar reminders
11. WHEN an admin configures notification templates, THE System SHALL allow customization of message content and formatting
12. WHEN notification rules are updated, THE System SHALL apply changes to all future notifications
13. THE System SHALL store notification preferences and history in Supabase with audit trail

---

### Requirement 15: Complaint & Grievance System

**User Story:** As a student or parent, I want to file anonymous or identified complaints, track resolution status, and receive feedback, so that I can address concerns through proper channels.

**User Story:** As an admin, I want to manage complaints, track escalation, assign to responsible personnel, and close with resolution, so that I can ensure fair and timely resolution.

#### Acceptance Criteria

1. WHEN a user files a complaint, THE System SHALL allow selection of complaint type (academic, behavioral, administrative, other)
2. WHEN a complaint is filed, THE System SHALL allow option for anonymous submission or identified submission
3. WHEN a complaint is submitted, THE System SHALL create Complaint_Ticket in Supabase with unique tracking number
4. WHEN a ticket is created, THE System SHALL assign initial status (open) and send confirmation to filer
5. WHEN a ticket is assigned to personnel, THE System SHALL notify assignee and set target resolution date
6. WHEN ticket status changes, THE System SHALL notify filer with update
7. WHEN a complaint meets escalation criteria, THE System SHALL auto-escalate through Escalation_Workflow
8. WHEN escalation occurs, THE System SHALL notify higher-level personnel and update priority
9. WHEN personnel provides update, THE System SHALL record in ticket history and notify filer
10. WHEN a resolution is proposed, THE System SHALL notify filer and request feedback
11. WHEN filer provides feedback, THE System SHALL record and allow ticket closure or re-opening
12. WHEN a ticket is closed, THE System SHALL generate resolution report and archive
13. WHEN an admin views complaint dashboard, THE System SHALL display open tickets, escalated items, and resolution metrics
14. THE System SHALL maintain audit trail of all complaint actions with timestamps and personnel involved
15. WHEN complaint data is analyzed, THE System SHALL identify trends and recommend systemic improvements

---

## Cross-Feature Requirements

### Data Integration & Consistency

1. WHEN data is updated across features, THE System SHALL maintain referential integrity in Supabase
2. WHEN student profile changes, THE System SHALL propagate updates to all dependent features (Learning_Paths, Progress_Reports, Recommendations)
3. WHEN marks are updated, THE System SHALL trigger recalculation of GPA, grades, and eligibility criteria

### Real-Time Communication

1. WHEN events occur in any feature, THE System SHALL broadcast updates via Socket.io to connected clients
2. WHEN multiple users access shared data, THE System SHALL ensure consistency and prevent conflicts

### Authentication & Authorization

1. WHEN a user accesses any feature, THE System SHALL verify JWT token and validate role-based permissions
2. WHEN a user lacks permission, THE System SHALL return 403 Forbidden and log access attempt

### Rate Limiting

1. WHEN API requests exceed limits (300 req/15min general, 20 req/15min auth), THE System SHALL return 429 Too Many Requests
2. WHEN rate limit is approached, THE System SHALL log warning for monitoring

### File Handling

1. WHEN files are uploaded, THE System SHALL use Multer to enforce 10MB size limit
2. WHEN files are stored, THE System SHALL scan for malware and store in secure location
3. WHEN files are accessed, THE System SHALL verify user authorization before serving

---

## Implementation Constraints

- All features MUST use existing Supabase database schema with appropriate table references
- All features MUST integrate with existing JWT authentication and role-based access control
- All features MUST use Socket.io for real-time updates where applicable
- All features MUST respect existing rate limiting configuration
- All features MUST use Multer for file uploads with 10MB limit
- All features MUST follow existing API route patterns (/api/auth, /api/school, /api/ai, /api/chat)
- All features MUST store data in Supabase with proper indexing for performance
- All features MUST implement proper error handling and logging
- All features MUST validate all inputs and sanitize outputs
- All features MUST be implementable without external APIs initially (can be added later)

