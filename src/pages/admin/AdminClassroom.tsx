import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
  DoorOpen,
  BookMarked,
  Calendar,
  Users,
} from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  resources: string[];
  building?: string;
  floor?: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  teacher: string;
  credits: number;
}

interface TimetableEntry {
  id: string;
  class: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

export default function AdminClassroom() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classrooms');

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      api.getClassrooms(),
      api.getCourses(),
      api.getTimetable(),
    ]);

    const [classroomsResult, coursesResult, timetableResult] = results;

    if (classroomsResult.status === 'fulfilled') {
      setClassrooms(Array.isArray(classroomsResult.value) ? classroomsResult.value : []);
    }
    if (coursesResult.status === 'fulfilled') {
      setCourses(Array.isArray(coursesResult.value) ? coursesResult.value : []);
    }
    if (timetableResult.status === 'fulfilled') {
      const data = timetableResult.value;
      setTimetable(Array.isArray(data) ? data : []);
    }

    setLoading(false);
  };

  const filteredTimetable = selectedClass
    ? timetable.filter(e => e.class === selectedClass)
    : [];

  const uniqueClasses = [...new Set(timetable.map(e => e.class).filter(Boolean))];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Classroom Management</h1>
        <p className="text-muted-foreground">Manage classrooms, courses & timetables</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
        </TabsList>

        <TabsContent value="classrooms">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{classrooms.length} classroom(s)</p>
          </div>

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : (
            <div className="space-y-3">
              {classrooms.map(c => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <DoorOpen className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">{c.name}</h4>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        <span>Capacity: {c.capacity}</span>
                        {c.building ? <><span>•</span><span>{c.building}</span></> : null}
                        {c.floor !== undefined ? <><span>•</span><span>Floor {c.floor}</span></> : null}
                      </div>
                      {c.resources && c.resources.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {c.resources.map((r, i) => (
                            <Badge key={i} variant="secondary">{r}</Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ))}
              {classrooms.length === 0 && <p className="text-muted-foreground text-center py-8">No classrooms</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{courses.length} course(s)</p>
          </div>

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {courses.map(c => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <BookMarked className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">{c.name}</h4>
                      <p className="text-sm text-muted-foreground">{c.code}{c.teacher ? ` | ${c.teacher}` : ''}{c.credits ? ` | ${c.credits} credits` : ''}</p>
                    </div>
                  </div>
                </Card>
              ))}
              {courses.length === 0 && <p className="text-muted-foreground text-center py-8">No courses</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timetable">
          <div className="flex gap-4 mb-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-background flex-1"
            >
              <option value="">Select a class</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-3">
              {selectedClass ? (
                filteredTimetable.length > 0 ? (
                  filteredTimetable.map(e => (
                    <Card key={e.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <div>
                          <h4 className="font-semibold">{e.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {e.day} at {e.time}{e.teacher ? ` | ${e.teacher}` : ''}{e.room ? ` | Room: ${e.room}` : ''}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No timetable entries for this class</p>
                )
              ) : (
                <p className="text-muted-foreground text-center py-8">Select a class to view its timetable</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
