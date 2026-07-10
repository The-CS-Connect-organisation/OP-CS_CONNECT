import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { BarChart3, TrendingUp, Calendar, BookOpen, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface GradeRecord {
  id: string;
  subject: string;
  assignment: string;
  marks: number;
  totalMarks: number;
  date: string;
  grade: string;
  teacher: string;
}

interface ChildInfo {
  id: string;
  name: string;
  class: string;
}

interface ChildWithGrades {
  child: ChildInfo;
  grades: GradeRecord[];
  loading: boolean;
  error?: string;
}

export default function ParentGrades() {
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [childrenWithGrades, setChildrenWithGrades] = useState<ChildWithGrades[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAllChildrenGrades();
  }, []);

  const loadAllChildrenGrades = async () => {
    try {
      setLoading(true);
      // First get all children
      const childrenRes = await api.getChildren();
      const childrenList: ChildInfo[] = childrenRes?.success ? (childrenRes.children || []) : [];
      setChildren(childrenList);

      if (childrenList.length === 0) {
        setChildrenWithGrades([]);
        setLoading(false);
        return;
      }

      // Expand all children by default
      setExpandedChildren(new Set(childrenList.map(c => c.id)));

      // Initialize loading state for each child
      setChildrenWithGrades(childrenList.map(child => ({
        child,
        grades: [],
        loading: true,
      })));

      // Load grades for ALL children in parallel
      const results = await Promise.allSettled(
        childrenList.map(child =>
          api.getChildGrades(child.id).then(data => ({
            childId: child.id,
            grades: data?.recentGrades || (Array.isArray(data) ? data : []),
          }))
        )
      );

      // Update with actual grades data
      setChildrenWithGrades(prev =>
        prev.map(item => {
          const result = results.find(
            r => r.status === 'fulfilled' && r.value.childId === item.child.id
          );
          if (result && result.status === 'fulfilled') {
            return { ...item, grades: result.value.grades, loading: false };
          }
          return { ...item, loading: false, error: 'Failed to load grades' };
        })
      );
    } catch (err) {
      console.error('[ParentGrades] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleChild = (childId: string) => {
    setExpandedChildren(prev => {
      const next = new Set(prev);
      if (next.has(childId)) next.delete(childId);
      else next.add(childId);
      return next;
    });
  };

  // Calculate overall stats across all children
  const allGrades = childrenWithGrades.flatMap(cwg => cwg.grades);
  const totalGrades = allGrades.length;
  const avgGrade = allGrades.length > 0
    ? Math.round(allGrades.reduce((sum, g) => sum + (g.marks / g.totalMarks) * 100, 0) / allGrades.length)
    : 0;
  const totalSubjects = new Set(allGrades.map(g => g.subject)).size;

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (percentage >= 75) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  const getChildAvg = (grades: GradeRecord[]) => {
    if (grades.length === 0) return 0;
    return Math.round(grades.reduce((sum, g) => sum + (g.marks / g.totalMarks) * 100, 0) / grades.length);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Children's Grades</h1>
        <p className="text-muted-foreground">Academic performance overview</p>
      </div>

      {/* Overall Stats - All Children */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{children.length}</p>
              <p className="text-sm text-muted-foreground">Children</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{avgGrade}%</p>
              <p className="text-sm text-muted-foreground">Overall Avg</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{totalGrades}</p>
              <p className="text-sm text-muted-foreground">Total Grades</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{totalSubjects}</p>
              <p className="text-sm text-muted-foreground">Subjects</p>
            </div>
          </div>
        </Card>
      </div>

      {loading && children.length === 0 ? (
        <div className="space-y-4">{ [1, 2, 3].map(i => <Skeleton key={i} className="h-20" />) }</div>
      ) : children.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Children Linked</h3>
          <p className="text-muted-foreground">Go to "My Children" to link your children first.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {childrenWithGrades.map(({ child, grades, loading: childLoading, error }) => {
            const isExpanded = expandedChildren.has(child.id);
            const childAvg = getChildAvg(grades);

            return (
              <Card key={child.id} className="overflow-hidden">
                {/* Child Header */}
                <button
                  onClick={() => toggleChild(child.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                      {child.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">Class {child.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!childLoading && grades.length > 0 && (
                      <div className="text-right">
                        <p className="text-lg font-bold">{childAvg}%</p>
                        <p className="text-xs text-muted-foreground">Avg</p>
                      </div>
                    )}
                    {childLoading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </button>

                {/* Child Grades */}
                {isExpanded && (
                  <div className="border-t px-4 pb-4">
                    {childLoading ? (
                      <div className="space-y-3 pt-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                      </div>
                    ) : error ? (
                      <div className="p-4 mt-4 text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg">
                        Failed to load grades for {child.name}
                      </div>
                    ) : grades.length === 0 ? (
                      <div className="p-4 mt-4 text-center text-muted-foreground text-sm bg-accent/50 rounded-lg">
                        No grades recorded yet for {child.name}
                      </div>
                    ) : (
                      <div className="space-y-2 pt-4">
                        {grades.map((grade, idx) => {
                          const percentage = Math.round((grade.marks / grade.totalMarks) * 100);
                          return (
                            <div key={grade.id || idx} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{grade.assignment || grade.subject}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  <span>{grade.subject}</span>
                                  {grade.teacher && <><span>•</span><span>{grade.teacher}</span></>}
                                  {grade.date && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(grade.date).toLocaleDateString()}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 ml-4 shrink-0">
                                <div className="text-right">
                                  <p className="font-semibold text-sm">{grade.marks}/{grade.totalMarks}</p>
                                  {/* Mini progress bar */}
                                  <div className="w-16 h-1.5 bg-accent rounded-full mt-0.5">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                                      style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                  </div>
                                </div>
                                <Badge className={getGradeColor(percentage)}>
                                  {percentage}%
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
