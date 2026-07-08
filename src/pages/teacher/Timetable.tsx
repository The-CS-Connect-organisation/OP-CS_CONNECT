import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ShieldAlert, ShieldCheck, User, Users } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { TimetableView } from '../../components/timetable';
import type { TimetableEntry, DropdownOption, SubjectTeacherMap } from '../../components/timetable';
import { DEFAULT_PERIODS } from '../../components/timetable/types';

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://op-csconnect-backend-production.up.railway.app/api');

async function localApiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('eduvault-token');
  const userId = localStorage.getItem('eduvault-user-id');
  const res = await fetch(`${API_BASE}/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': userId } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

const extractArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

type ViewMode = 'my-schedule' | 'class-timetable';

export default function TeacherTimetable() {
  const { user } = useAuthStore();
  const location = useLocation();
  const isMyScheduleRoute = location.pathname.endsWith('/my-schedule');
  const [viewMode, setViewMode] = useState<ViewMode>(isMyScheduleRoute ? 'my-schedule' : 'class-timetable');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [allClassEntries, setAllClassEntries] = useState<Map<string, TimetableEntry[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [classList, setClassList] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<DropdownOption[]>([]);
  const [courses, setCourses] = useState<DropdownOption[]>([]);
  const [rooms, setRooms] = useState<DropdownOption[]>([]);
  const [teacherClassMap, setTeacherClassMap] = useState<Record<string, boolean>>({});
  const [subjectTeacherMap, setSubjectTeacherMap] = useState<SubjectTeacherMap>({});

  const teacherId = user?.id || '';
  const teacherName = user?.name || '';
  const isAnyClassTeacher = classes.some(c => c.classTeacherId === teacherId || c.isClassTeacher);

  const myScheduleEntries = useMemo(() => {
    const result: TimetableEntry[] = [];
    allClassEntries.forEach((classEntries, className) => {
      classEntries.forEach(e => {
        if (e.teacher === teacherName) {
          result.push({ ...e, class: className });
        }
      });
    });
    return result;
  }, [allClassEntries, teacherName]);

  useEffect(() => {
    loadTeacherClasses();
  }, [teacherId]);

  useEffect(() => {
    if (viewMode === 'class-timetable' && selectedClassName) loadTimetableForClass(selectedClassName);
  }, [selectedClassName, viewMode]);

  useEffect(() => {
    if (viewMode === 'my-schedule' && classes.length > 0) loadAllClassTimetables();
  }, [viewMode, classes]);

  const loadTeacherClasses = async () => {
    setLoading(true);
    try {
      const [classData, refData] = await Promise.all([
        api.getTeacherAssignedClasses(teacherId).catch(() => []),
        Promise.allSettled([
          api.getUsers({ role: 'teacher' }),
          api.getCourses(),
          api.getRooms?.() ?? Promise.resolve([]),
        ]),
      ]);

      const [usersResult, coursesResult, roomsResult] = refData;

      let teachersList: any[] = [];
      if (usersResult.status === 'fulfilled') {
        const data = usersResult.value;
        teachersList = Array.isArray(data) ? data : data?.data ?? data?.users ?? [];
      }
      if (teachersList.length === 0) {
        teachersList = [
          { id: 't1', name: 'Mr. Smith' },
          { id: 't2', name: 'Ms. Johnson' },
        ];
      }
      setTeachers(teachersList.map((t: any) => ({ id: t.id, name: t.name })));

      let coursesList: any[] = [];
      if (coursesResult.status === 'fulfilled') {
        const data = coursesResult.value;
        coursesList = Array.isArray(data) ? data : data?.data ?? [];
      }
      if (coursesList.length === 0) {
        coursesList = [
          { id: 'c1', name: 'Mathematics 101' },
          { id: 'c2', name: 'Physics 201' },
          { id: 'c3', name: 'Chemistry Lab' },
        ];
      }
      setCourses(coursesList.map((c: any) => ({ id: c.id, name: c.name })));

      let roomsList: any[] = [];
      if (roomsResult.status === 'fulfilled') {
        const data = roomsResult.value;
        roomsList = Array.isArray(data) ? data : data?.data ?? [];
      }
      setRooms(roomsList.map((r: any) => ({ id: r.id, name: r.name })));

      const assignedClasses = extractArray(classData);
      setClasses(assignedClasses);

      if (assignedClasses.length > 0) {
        const first = assignedClasses[0];
        setSelectedClassId(first.id);
        setSelectedClassName(first.name || first.className);
        setIsClassTeacher(first.classTeacherId === teacherId || first.isClassTeacher);
      }

      const map: Record<string, boolean> = {};
      assignedClasses.forEach((c: any) => {
        const name = c.name || c.className;
        if (name) map[name] = c.classTeacherId === teacherId || c.isClassTeacher;
      });
      setTeacherClassMap(map);

      const names = assignedClasses.map((c: any) => c.name || c.className).filter(Boolean);
      setClassList(names);

      // Build subject→teacher map from class data
      loadSubjectTeacherMap(assignedClasses, teachersList);

    } catch {
      setClassList([]);
    } finally {
      if (viewMode === 'class-timetable') setLoading(false);
    }
  };

  const loadSubjectTeacherMap = async (assignedClasses: any[], teacherList: any[]) => {
    try {
      const classNames = assignedClasses.map((c: any) => c.name || c.className).filter(Boolean);
      if (classNames.length === 0) return;
      const detailed = await localApiFetch('/classes/detailed');
      const subjectTeacher: SubjectTeacherMap = {};
      (Array.isArray(detailed) ? detailed : []).forEach((cls: any) => {
        (cls.subjects || []).forEach((subj: any) => {
          if (subj.teacherId && subj.name) {
            const found = (teacherList || []).find((t: any) => t.id === subj.teacherId);
            if (found) subjectTeacher[subj.name] = found.name;
          }
        });
      });
      setSubjectTeacherMap(subjectTeacher);
    } catch {}
  };

  const loadTimetableForClass = async (className?: string) => {
    const name = className || selectedClassName;
    if (!name) return;
    setLoading(true);
    try {
      const data = extractArray(await api.getTimetable(name));
      setEntries(data as TimetableEntry[]);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllClassTimetables = async () => {
    if (classList.length === 0) return;
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        classList.map(name => api.getTimetable(name))
      );
      const map = new Map<string, TimetableEntry[]>();
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const data = extractArray(result.value) as TimetableEntry[];
          map.set(classList[i], data);
        }
      });
      setAllClassEntries(map);
    } catch {
      // partial data is fine
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (className: string) => {
    const cls = classes.find((c: any) => (c.name || c.className) === className);
    if (cls) {
      setSelectedClassId(cls.id);
      setSelectedClassName(className);
      setIsClassTeacher(teacherClassMap[className] || cls.classTeacherId === teacherId || cls.isClassTeacher);
    }
  };

  const handleAssignSlot = async (day: string, time: string, data: { teacher: string; subject: string; room: string }) => {
    if (!isClassTeacher) return;
    try {
      const newEntry = await api.createTimetableEntry({ ...data, day, time, class: selectedClassName });
      setEntries(prev => [...prev, newEntry]);
      setAllClassEntries(prev => {
        const next = new Map(prev);
        const existing = next.get(selectedClassName) || [];
        next.set(selectedClassName, [...existing, newEntry]);
        return next;
      });
    } catch (err) {
      console.error('[TeacherTimetable] Failed to assign slot:', err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!isClassTeacher) return;
    try {
      await api.deleteTimetableEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      setAllClassEntries(prev => {
        const next = new Map(prev);
        const existing = next.get(selectedClassName) || [];
        next.set(selectedClassName, existing.filter(e => e.id !== id));
        return next;
      });
    } catch (err) {
      console.error('[TeacherTimetable] Failed to delete entry:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Timetable</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {viewMode === 'my-schedule'
                ? 'Your personal teaching schedule across all classes'
                : isClassTeacher
                  ? 'You are the class teacher — you can edit this timetable'
                  : 'View-only timetable for your assigned classes'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isClassTeacher && viewMode === 'class-timetable' ? (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs px-3 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 inline" />
              Edit Access
            </Badge>
          ) : viewMode === 'class-timetable' && classes.length > 0 ? (
            <Badge variant="outline" className="text-xs px-3 py-1.5">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5 inline" />
              View Only
            </Badge>
          ) : null}
        </div>
      </div>

      {/* View mode toggle */}
      {classes.length > 0 && (
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border w-fit">
          <button
            onClick={() => { setViewMode('my-schedule'); loadAllClassTimetables(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'my-schedule'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            My Schedule
          </button>
          {isAnyClassTeacher && (
            <button
              onClick={() => { setViewMode('class-timetable'); if (selectedClassName) loadTimetableForClass(selectedClassName); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'class-timetable'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4" />
              Class Timetable
            </button>
          )}
        </div>
      )}

      {!loading && classes.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <Calendar className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground text-lg font-medium">No classes assigned</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              You haven't been assigned as a class teacher or subject teacher to any class yet.
            </p>
          </div>
        </Card>
      ) : viewMode === 'my-schedule' ? (
        <TimetableView
          entries={myScheduleEntries}
          loading={loading}
          title="My Schedule"
          subtitle={`Teaching periods for ${teacherName}`}
          showViewSwitcher={true}
          timeSlots={DEFAULT_PERIODS}
        />
      ) : (
        <TimetableView
          entries={entries}
          loading={loading}
          classList={classList}
          selectedClass={selectedClassName}
          onClassChange={handleClassChange}
          title="Class Timetable"
          subtitle={isClassTeacher ? 'Click empty slots to assign or hover to delete' : 'Viewing timetable'}
          crud={
            isClassTeacher
              ? { onDeleteEntry: handleDeleteEntry, onAssignSlot: handleAssignSlot }
              : undefined
          }
          teachers={teachers}
          courses={courses}
          rooms={rooms}
          subjectTeacherMap={subjectTeacherMap}
        />
      )}
    </motion.div>
  );
}
