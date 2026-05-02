-- ============================================================
-- CORNERSTONE SCHOOL MANAGEMENT — SUPABASE SCHEMA
-- Run this ENTIRE script in the Supabase SQL Editor (one shot)
-- ============================================================

-- =========================================
-- 1. USERS
-- =========================================
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'parent')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role_active ON users (role, is_active);

-- =========================================
-- 2. CLASSROOMS
-- =========================================
CREATE TABLE classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  grade text NOT NULL,
  section text NOT NULL,
  privacy_leaderboard_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_classrooms_grade_section ON classrooms (grade, section);

-- =========================================
-- 3. CLASSROOM_STUDENTS (junction table)
-- =========================================
CREATE TABLE classroom_students (
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (classroom_id, student_id)
);

-- =========================================
-- 4. CLASSROOM_TEACHERS (junction table)
-- =========================================
CREATE TABLE classroom_teachers (
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (classroom_id, teacher_id)
);

-- =========================================
-- 5. STUDENT_PROFILES
-- =========================================
CREATE TABLE student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  grade text NOT NULL,
  section text NOT NULL,
  roll_number text NOT NULL UNIQUE,
  subjects text[] NOT NULL DEFAULT '{}',
  attendance_percent numeric(5,2) DEFAULT 100 CHECK (attendance_percent BETWEEN 0 AND 100),
  parent_name text,
  parent_phone text,
  xp integer DEFAULT 0,
  badges text[] DEFAULT '{}',
  attendance_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_sp_grade_section ON student_profiles (grade, section);
CREATE INDEX idx_sp_xp ON student_profiles (xp DESC);
CREATE INDEX idx_sp_user_id ON student_profiles (user_id);

-- =========================================
-- 6. SEMESTER_PERFORMANCE
-- =========================================
CREATE TABLE semester_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id uuid NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  semester text NOT NULL,
  percentage numeric(5,2) NOT NULL CHECK (percentage BETWEEN 0 AND 100),
  grade text NOT NULL
);

-- =========================================
-- 7. TEACHER_PROFILES
-- =========================================
CREATE TABLE teacher_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  subjects text[] NOT NULL DEFAULT '{}',
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_tp_user_id ON teacher_profiles (user_id);

-- =========================================
-- 8. PARENT_PROFILES
-- =========================================
CREATE TABLE parent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  child_ids uuid[] DEFAULT '{}',
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =========================================
-- 9. ASSIGNMENTS
-- =========================================
CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) <= 200),
  description text NOT NULL CHECK (char_length(description) <= 5000),
  subject text NOT NULL,
  class_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  due_date timestamptz NOT NULL,
  max_marks integer NOT NULL CHECK (max_marks BETWEEN 1 AND 1000),
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_assignments_class ON assignments (class_id, subject, due_date DESC);
CREATE INDEX idx_assignments_teacher ON assignments (teacher_id);

-- =========================================
-- 10. SUBMISSIONS
-- =========================================
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submitted_at timestamptz DEFAULT now(),
  content text CHECK (char_length(content) <= 10000),
  attachments jsonb DEFAULT '[]',
  is_late boolean DEFAULT false,
  marks numeric(6,2) CHECK (marks >= 0),
  feedback text CHECK (char_length(feedback) <= 5000),
  graded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (assignment_id, student_id)
);
CREATE INDEX idx_submissions_assignment ON submissions (assignment_id);
CREATE INDEX idx_submissions_student ON submissions (student_id);

-- =========================================
-- 11. ATTENDANCE_RECORDS
-- =========================================
CREATE TABLE attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (class_id, student_id, date)
);
CREATE INDEX idx_attendance_student ON attendance_records (student_id, date);
CREATE INDEX idx_attendance_class_date ON attendance_records (class_id, date);

-- =========================================
-- 12. MARKS
-- =========================================
CREATE TABLE marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  subject text NOT NULL,
  exam_type text NOT NULL CHECK (exam_type IN ('unit_test', 'mid_term', 'final')),
  score numeric(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  term text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_marks_student_subject ON marks (student_id, subject, term);
CREATE INDEX idx_marks_class ON marks (class_id);

-- =========================================
-- 13. ANNOUNCEMENTS
-- =========================================
CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL CHECK (category IN ('exam', 'holiday', 'event', 'emergency')),
  scope text NOT NULL CHECK (scope IN ('school', 'class')),
  class_id uuid REFERENCES classrooms(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_announcements_scope ON announcements (scope, class_id, pinned DESC, created_at DESC);

-- =========================================
-- 14. MESSAGES
-- =========================================
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES users(id) ON DELETE SET NULL,
  class_id uuid REFERENCES classrooms(id) ON DELETE SET NULL,
  content text NOT NULL CHECK (char_length(content) <= 5000),
  read_by uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_messages_dm ON messages (sender_id, recipient_id, created_at DESC);
CREATE INDEX idx_messages_class ON messages (class_id, created_at DESC);

-- =========================================
-- 15. TIMETABLES
-- =========================================
CREATE TABLE timetables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL UNIQUE REFERENCES classrooms(id) ON DELETE CASCADE,
  entries jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =========================================
-- 16. EXAM_SCHEDULES
-- =========================================
CREATE TABLE exam_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  subject text NOT NULL,
  date timestamptz NOT NULL,
  room text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (class_id, date, room)
);

-- =========================================
-- 17. AI_INTERACTIONS
-- =========================================
CREATE TABLE ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature text NOT NULL CHECK (feature IN (
    'doubt_solver', 'study_planner', 'grade_predictor',
    'assignment_feedback', 'summary_generator', 'quiz_generator',
    'attendance_insights'
  )),
  subject text,
  model text NOT NULL,
  prompt text NOT NULL,
  response text NOT NULL,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_ai_user_feature ON ai_interactions (user_id, feature, created_at DESC);

-- =========================================
-- 18. ERROR_LOGS
-- =========================================
CREATE TABLE error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text,
  method text,
  status_code integer,
  message text,
  stack text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_error_logs_time ON error_logs (created_at DESC, status_code);

-- =========================================
-- AUTO-UPDATE updated_at TRIGGER
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_classrooms_updated BEFORE UPDATE ON classrooms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_student_profiles_updated BEFORE UPDATE ON student_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_teacher_profiles_updated BEFORE UPDATE ON teacher_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_parent_profiles_updated BEFORE UPDATE ON parent_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_submissions_updated BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_marks_updated BEFORE UPDATE ON marks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_announcements_updated BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_timetables_updated BEFORE UPDATE ON timetables FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =========================================
-- ROW LEVEL SECURITY
-- =========================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE semester_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Service-role key gets full access (backend uses service key)
CREATE POLICY "service_full_access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON classrooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON classroom_students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON classroom_teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON student_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON semester_performance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON teacher_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON parent_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON attendance_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON marks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON timetables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON exam_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON ai_interactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_full_access" ON error_logs FOR ALL USING (true) WITH CHECK (true);

-- =========================================
-- Schema written by Navaneeth Nalabothu
-- =========================================

-- =========================================
-- 19. FEES
-- =========================================
CREATE TABLE fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  due_date date NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
  payment_method text,
  transaction_id text,
  paid_at timestamptz,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_fees_student ON fees (student_id, status, due_date);
CREATE INDEX idx_fees_status ON fees (status, due_date);

ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_full_access" ON fees FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER trg_fees_updated BEFORE UPDATE ON fees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
