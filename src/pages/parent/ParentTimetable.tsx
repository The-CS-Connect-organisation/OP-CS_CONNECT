import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { TimetableView } from '../../components/timetable';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Users, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import type { TimetableEntry } from '../../components/timetable';

const extractArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

interface ChildInfo {
  id: string;
  name: string;
  class: string;
}

interface ChildWithTimetable {
  child: ChildInfo;
  entries: TimetableEntry[];
  loading: boolean;
  error?: string;
}

export default function ParentTimetable() {
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [childrenWithSchedule, setChildrenWithSchedule] = useState<ChildWithTimetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAllChildrenTimetables();
  }, []);

  const loadAllChildrenTimetables = async () => {
    try {
      setLoading(true);
      const childrenRes = await api.getChildren();
      const childrenList: ChildInfo[] = childrenRes?.success ? (childrenRes.children || []) : [];
      setChildren(childrenList);

      if (childrenList.length === 0) {
        setChildrenWithSchedule([]);
        setLoading(false);
        return;
      }

      setExpandedChildren(new Set(childrenList.map(c => c.id)));

      setChildrenWithSchedule(childrenList.map(child => ({
        child,
        entries: [],
        loading: true,
      })));

      const results = await Promise.allSettled(
        childrenList.map(child =>
          api.getChildTimetable(child.id).then(data => ({
            childId: child.id,
            entries: extractArray(data) as TimetableEntry[],
          }))
        )
      );

      setChildrenWithSchedule(prev =>
        prev.map(item => {
          const result = results.find(
            r => r.status === 'fulfilled' && r.value.childId === item.child.id
          );
          if (result && result.status === 'fulfilled') {
            return { ...item, entries: result.value.entries, loading: false };
          }
          return { ...item, loading: false, error: 'Failed to load' };
        })
      );
    } catch (err) {
      console.error('[ParentTimetable] Failed to load:', err);
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Children's Timetables</h1>
        <p className="text-muted-foreground">Class schedules for all your children</p>
      </div>

      {loading && children.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : children.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Children Linked</h3>
          <p className="text-muted-foreground">Go to "My Children" to link your children first.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {childrenWithSchedule.map(({ child, entries, loading: childLoading, error }) => {
            const isExpanded = expandedChildren.has(child.id);

            return (
              <Card key={child.id} className="overflow-hidden">
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
                    {!childLoading && entries.length > 0 && (
                      <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full">
                        {entries.length} periods
                      </span>
                    )}
                    {childLoading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-4 pb-4">
                    {childLoading ? (
                      <div className="pt-4 space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : error ? (
                      <div className="p-4 mt-4 text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg">
                        Failed to load timetable for {child.name}
                      </div>
                    ) : entries.length === 0 ? (
                      <div className="p-4 mt-4 text-center text-muted-foreground text-sm bg-accent/50 rounded-lg">
                        No timetable available for {child.name}
                      </div>
                    ) : (
                      <div className="pt-4">
                        <TimetableView
                          entries={entries}
                          loading={false}
                          title={`${child.name}'s Schedule`}
                          subtitle={`Class ${child.class}`}
                          showViewSwitcher
                        />
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
