import { useState, useEffect, useCallback } from 'react';
import { request } from '../utils/apiClient';

/**
 * Fetches the current student/teacher profile from the backend.
 * Since login now enriches the user object with profile data,
 * this hook just returns the user object itself as the profile.
 */
export const useProfile = (user) => {
  // Profile data is now embedded in the user object at login time.
  // We return it directly — no extra API call needed.
  const profile = user ? {
    ...user,
    classroom_id: user.classroomId,
    class_id: user.classroomId,
    attendance_percent: user.attendancePercent ?? 0,
  } : null;
  return { profile, loading: !user, refetch: () => {} };
};

/**
 * Fetches assignments for a given classId.
 */
export const useAssignments = (classId) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await request(`/school/assignments?classId=${classId}&limit=50`);
      setAssignments(res?.items || []);
    } catch (e) {
      console.error('Assignments fetch failed', e);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { assignments, loading, refetch: fetch };
};

/**
 * Fetches attendance report for a student.
 */
export const useAttendance = (studentId) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      // Fetch last 3 months of records
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const month = threeMonthsAgo.getMonth() + 1;
      const year = threeMonthsAgo.getFullYear();
      const res = await request(`/school/attendance/${studentId}/report?month=${month}&year=${year}`);
      setRecords(res?.records || []);
    } catch (e) {
      console.error('Attendance fetch failed', e);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { records, loading, refetch: fetch };
};

/**
 * Fetches marks/report card for a student.
 */
export const useMarks = (studentId) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await request(`/school/report-cards/${studentId}`);
      setReport(res?.report || null);
    } catch (e) {
      console.error('Marks fetch failed', e);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { report, loading, refetch: fetch };
};

/**
 * Fetches announcements.
 */
export const useAnnouncements = (classId) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const url = classId
        ? `/school/announcements?scope=school&limit=20`
        : `/school/announcements?scope=school&limit=20`;
      const res = await request(url);
      setAnnouncements(res?.items || []);
    } catch (e) {
      console.error('Announcements fetch failed', e);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { announcements, loading, refetch: fetch };
};
