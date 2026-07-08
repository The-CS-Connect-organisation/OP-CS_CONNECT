import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { TimetableView } from '../../components/timetable';
import type { TimetableEntry, DropdownOption } from '../../components/timetable';

const extractArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

export default function TeacherTimetable() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [classList, setClassList] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<DropdownOption[]>([]);
  const [courses, setCourses] = useState<DropdownOption[]>([]);
  const [rooms, setRooms] = useState<DropdownOption[]>([]);

  const teacherId = user?.id || '';

  useEffect(() => {
    loadTeacherClasses();
  }, [teacherId]);

  useEffect(() => {
    if (selectedClassName) loadTimetable();
  }, [selectedClassName]);

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

      const names = assignedClasses.map((c: any) => c.name || c.className).filter(Boolean);
      setClassList(names);

    } catch {
      setClassList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const data = extractArray(await api.getTimetable(selectedClassName));
      setEntries(data as TimetableEntry[]);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (className: string) => {
    const cls = classes.find((c: any) => (c.name || c.className) === className);
    if (cls) {
      setSelectedClassId(cls.id);
      setSelectedClassName(className);
      setIsClassTeacher(cls.classTeacherId === teacherId || cls.isClassTeacher);
    }
  };

  const handleAssignSlot = async (day: string, time: string, data: { teacher: string; subject: string; room: string }) => {
    if (!isClassTeacher) return;
    try {
      const newEntry = await api.createTimetableEntry({ ...data, day, time, class: selectedClassName });
      setEntries(prev => [...prev, newEntry]);
    } catch (err) {
      console.error('[TeacherTimetable] Failed to assign slot:', err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!isClassTeacher) return;
    try {
      await api.deleteTimetableEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
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
            <h1 className="text-2xl font-bold">My Timetable</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {isClassTeacher
                ? 'You are the class teacher — you can edit this timetable'
                : 'View-only timetable for your assigned classes'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isClassTeacher ? (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs px-3 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 inline" />
              Class Teacher — Edit Access
            </Badge>
          ) : classes.length > 0 ? (
            <Badge variant="outline" className="text-xs px-3 py-1.5">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5 inline" />
              View Only
            </Badge>
          ) : null}
        </div>
      </div>

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
      ) : (
        <TimetableView
          entries={entries}
          loading={loading}
          classList={classList}
          selectedClass={selectedClassName}
          onClassChange={handleClassChange}
          title="Class Timetable"
          subtitle={isClassTeacher ? 'Drag to assign or click to edit slots' : 'Viewing timetable'}
          crud={
            isClassTeacher
              ? { onDeleteEntry: handleDeleteEntry, onAssignSlot: handleAssignSlot }
              : undefined
          }
          teachers={teachers}
          courses={courses}
          rooms={rooms}
        />
      )}
    </motion.div>
  );
}
