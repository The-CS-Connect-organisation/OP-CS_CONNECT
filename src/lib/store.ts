
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';
import { playLoginSound, playSuccessSound } from './sound';
import { normalizeAcademicPercentage } from './utils';

export type UserRole = 'student' | 'teacher' | 'admin' | 'coordinator' | 'driver' | 'parent' | 'librarian' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  schoolId?: string;
  employeeId?: string;
  classIds?: string[];
  routeId?: string;
  class?: string;
  sectionId?: string;
  subjects?: string[];
  gpa?: number;
  attendance?: number;
  feesPaid?: boolean;
  children?: string[];
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  admissionNo?: string;
  rollNo?: string;
  bloodGroup?: string;
  aadharNo?: string;
  penNo?: string;
  apaarId?: string;
  religion?: string;
  nationality?: string;
  schoolHouse?: string;
  houseLocation?: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (data: Partial<User>) => void;
  loginWithCredentials: (email: string, password: string) => Promise<User>;
  signupWithCredentials: (data: any) => Promise<User>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user, token?: string) => {
        localStorage.setItem('eduvault-user-id', user.id);
        if (token) localStorage.setItem('eduvault-token', token);
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('eduvault-user-id');
        localStorage.removeItem('eduvault-token');
        set({ user: null, isAuthenticated: false });
      },
      setLoading: (isLoading) => set({ isLoading }),
      updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
      loginWithCredentials: async (email: string, password: string) => {
        const data = await api.login(email, password);
        localStorage.setItem('eduvault-user-id', data.user.id);
        if (data.token) localStorage.setItem('eduvault-token', data.token);
        set({ user: data.user, isAuthenticated: true });
        playLoginSound();
        return data.user;
      },
      signupWithCredentials: async (data: any) => {
        const result = await api.signup(data);
        localStorage.setItem('eduvault-user-id', result.user.id);
        if (result.token) localStorage.setItem('eduvault-token', result.token);
        set({ user: result.user, isAuthenticated: true });
        playSuccessSound();
        return result.user;
      },
    }),
    { name: 'eduvault-auth' }
  )
);

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true,
      toggleTheme: () =>
        set((state) => {
          const newDark = !state.isDark;
          if (newDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDark: newDark };
        }),
      setTheme: (dark) => {
        if (dark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ isDark: dark });
      },
    }),
    { name: 'eduvault-theme' }
  )
);

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [
    {
      id: '1',
      title: 'AI Study Plan Generated',
      message: 'Your personalized study plan for Mathematics is ready!',
      type: 'success',
      timestamp: new Date(),
      read: false,
    },
    {
      id: '2',
      title: 'Assignment Due Tomorrow',
      message: 'Physics Lab Report submission deadline is approaching',
      type: 'warning',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
    },
    {
      id: '3',
      title: 'New Grade Posted',
      message: 'Chemistry Mid-term results have been published',
      type: 'info',
      timestamp: new Date(Date.now() - 7200000),
      read: true,
    },
  ],
  unreadCount: 2, // Computed from mock data: notifications.filter(n => !n.read).length = 2
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substring(2),
          timestamp: new Date(),
          read: false,
        },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification?.read) return state; // Already read
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

interface AIState {
  isThinking: boolean;
  currentModel: string;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  setThinking: (thinking: boolean) => void;
  setModel: (model: string) => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearHistory: () => void;
}

export const useAIStore = create<AIState>()((set) => ({
  isThinking: false,
  currentModel: 'Gemini 2.5 Flash',
  chatHistory: [],
  setThinking: (isThinking) => set({ isThinking }),
  setModel: (currentModel) => set({ currentModel }),
  addMessage: (role, content) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, { role, content }],
    })),
  clearHistory: () => set({ chatHistory: [] }),
}));

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: true,
  isMobileOpen: false,
  toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
}));

// Data store for caching API responses
interface DataState {
  students: any[];
  teachers: any[];
  subjects: any[];
  assignments: any[];
  grades: any[];
  attendance: any[];
  timetable: any[];
  fees: any[];
  schools: any[];
  routes: any[];
  events: any[];
  clubs: any[];
  messages: any[];
  notifications: any[];
  isLoading: boolean;
  error: string | null;
  fetchStudentData: (studentId: string) => Promise<void>;
  fetchTeacherData: (teacherId: string) => Promise<void>;
  fetchAdminData: () => Promise<void>;
  fetchCoordinatorData: () => Promise<void>;
  fetchDriverData: (driverId: string) => Promise<void>;
  clearData: () => void;
}

export const useDataStore = create<DataState>()((set, get) => ({
  students: [],
  teachers: [],
  subjects: [],
  assignments: [],
  grades: [],
  attendance: [],
  timetable: [],
  fees: [],
  schools: [],
  routes: [],
  events: [],
  clubs: [],
  messages: [],
  notifications: [],
  isLoading: false,
  error: null,

  fetchStudentData: async (studentId: string) => {
    set({ isLoading: true, error: null, students: [] });
    try {
      // Prioritize essential data for the initial view
      const [student, rawGrades, rawAttendance, rawFees] = await Promise.all([
        api.getStudent(studentId),
        api.getStudentGrades(studentId),
        api.getStudentAttendance(studentId),
        api.getStudentFees(studentId),
      ]);

      const toArray = (d: any) => Array.isArray(d) ? d : (d?.message ? [] : []);

      const subjectColors: Record<string, string> = {
        'Math': '#8b5cf6', 'Physics': '#3b82f6', 'Chemistry': '#10b981',
        'English': '#f59e0b', 'CS': '#6366f1', 'Biology': '#ec4899',
        'Computer Science': '#6366f1',
      };

      const grades = toArray(rawGrades).map((g: any) => ({
        subject: g.subject,
        overall: g.overall ?? g.marks ?? 0,
        midTerm: g.midTerm ?? Math.round((g.marks ?? 0) * 0.4),
        final: g.finalTerm ?? Math.round((g.marks ?? 0) * 0.6),
        grade: g.grade,
        trend: g.trend ?? 'stable',
        color: subjectColors[g.subject] || '#6366f1',
      }));

      const rawAttendanceArr = toArray(rawAttendance);
      const presentCount = rawAttendanceArr.filter((a: any) => a.status === 'present').length;
      const totalCount = rawAttendanceArr.length || 1;
      const attendancePercent = Math.round((presentCount / totalCount) * 100);

      const fees = toArray(rawFees).map((f: any) => ({
        ...f,
        due: f.amount - f.paid,
      }));

      set({
        students: [{ ...student, gpa: normalizeAcademicPercentage(student.gpa || (grades.length ? grades.reduce((a: number, g: any) => a + g.overall, 0) / grades.length : 0)), attendance: student.attendance || attendancePercent }],
        grades,
        attendance: [{ percentage: student.attendance || attendancePercent, month: 'Current' }],
        fees,
        isLoading: false,
      });

      // Fetch non-essential data individually (don't let one failure block others)
      const className = student.class || '10-A';
      const sectionId = useAuthStore.getState().user?.sectionId;
      const [subjects, events, rawClubs, rawAssignments, rawTimetable, messages, notifications] = await Promise.all([
        api.getSubjects().catch(() => []),
        api.getEvents().catch(() => []),
        api.getClubs().catch(() => []),
        api.getAssignments({ class: className, studentId, ...(sectionId ? { sectionId } : {}) }).catch(() => []),
        api.getTimetable(className).catch(() => []),
        api.getMessages(studentId).catch(() => []),
        api.getNotifications(studentId).catch(() => []),
      ]);

      const subjectMap: Record<string, string> = {};
      toArray(subjects).forEach((s: any) => { subjectMap[s.id] = s.name; });
      const filteredAssignments = toArray(rawAssignments).filter((a: any) => {
        const ids = a.sectionIds;
        return !ids || ids.length === 0 || (sectionId && ids.includes(sectionId));
      });
      const assignments = filteredAssignments.map((a: any) => ({
        ...a,
        subject: subjectMap[a.subjectId] || a.subjectId,
        dueDate: a.dueDate,
        maxMarks: 50,
      }));

      const dayMap: Record<string, string> = { 'Monday': 'monday', 'Tuesday': 'tuesday', 'Wednesday': 'wednesday', 'Thursday': 'thursday', 'Friday': 'friday' };
      const periodTimes = ['8:00 - 8:45', '8:50 - 9:35', '9:45 - 10:30', '10:30 - 11:15', '11:30 - 12:15'];
      const timetable: any[] = periodTimes.map(time => {
        const slot: any = { time };
        Object.values(dayMap).forEach(d => { slot[d] = null; });
        return slot;
      });
      toArray(rawTimetable).forEach((dayEntry: any) => {
        const dayKey = dayMap[dayEntry.day];
        if (!dayKey) return;
        dayEntry.periods?.forEach((p: any, i: number) => {
          if (timetable[i]) {
            timetable[i][dayKey] = {
              subject: p.subject,
              room: p.subject === 'Math' ? '101' : p.subject === 'Physics' ? 'Lab 1' : p.subject === 'Chemistry' ? 'Lab 2' : p.subject === 'English' ? '201' : p.subject === 'CS' || p.subject === 'Computer Science' ? 'IT Lab' : p.subject === 'Biology' ? 'Lab 3' : 'Room 1',
              color: subjectColors[p.subject] || '#6366f1',
            };
          }
        });
      });

      const clubIcons = ['💻', '🔬', '🎤', '🎨', '⚽', '📚', '🎭', '🎵'];
      const clubColors = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899', '#64748b', '#f97316'];
      const clubs = toArray(rawClubs).map((c: any, i: number) => ({
        id: c.id,
        name: c.name,
        members: c.members?.length || 0,
        icon: clubIcons[i % clubIcons.length],
        color: clubColors[i % clubColors.length],
        lead: c.lead,
      }));

      set({ subjects, assignments, timetable, events, clubs, messages, notifications });

    } catch (error: any) {
      set({ error: typeof error === 'string' ? error : error?.message || 'Unknown error', isLoading: false });
    }
  },

  fetchTeacherData: async (teacherId: string) => {
    set({ isLoading: true, error: null });
    try {
      const [teacher, teacherClasses, subjects, events] = await Promise.all([
        api.getTeacher(teacherId),
        api.getTeacherClasses(teacherId),
        api.getSubjects(),
        api.getEvents(),
      ]);
      const allAssignments: any[] = [];
      for (const cls of teacherClasses.classes) {
        const clsAssignments = await api.getAssignments({ class: cls });
        allAssignments.push(...clsAssignments);
      }
      const [messages, notifications] = await Promise.all([
        api.getMessages(teacherId),
        api.getNotifications(teacherId),
      ]);
      set({
        teachers: [teacher],
        students: teacherClasses.students,
        subjects,
        assignments: allAssignments,
        events,
        messages,
        notifications,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: typeof error === 'string' ? error : error?.message || 'Unknown error', isLoading: false });
    }
  },

  fetchAdminData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [students, teachers, subjects, schools, events, clubs, routes] = await Promise.all([
        api.getStudents(),
        api.getTeachers(),
        api.getSubjects(),
        api.getSchools(),
        api.getEvents(),
        api.getClubs(),
        api.getRoutes(),
      ]);
      set({
        students,
        teachers,
        subjects,
        schools,
        events,
        clubs,
        routes,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: typeof error === 'string' ? error : error?.message || 'Unknown error', isLoading: false });
    }
  },

  fetchCoordinatorData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [students, teachers, schools, events] = await Promise.all([
        api.getStudents(),
        api.getTeachers(),
        api.getSchools(),
        api.getEvents(),
      ]);
      set({
        students,
        teachers,
        schools,
        events,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchDriverData: async (driverId: string) => {
    set({ isLoading: true, error: null });
    try {
      const [driver, routes, events] = await Promise.all([
        api.getUser(driverId),
        api.getRoutes(),
        api.getEvents(),
      ]);
      const driverRoute = routes.length > 0 ? (routes.find((r: any) => r.id === driver.routeId) || routes[0]) : null;
      set({
        students: driverRoute?.students || [],
        routes,
        events,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: typeof error === 'string' ? error : error?.message || 'Unknown error', isLoading: false });
    }
  },

  clearData: () => set({
    students: [], teachers: [], subjects: [], assignments: [],
    grades: [], attendance: [], timetable: [], fees: [],
    schools: [], routes: [], events: [], clubs: [],
    messages: [], notifications: [], error: null,
  }),
}));