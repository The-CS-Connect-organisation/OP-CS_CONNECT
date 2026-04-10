import { useState, useEffect, useCallback } from 'react';
import { request } from '../utils/apiClient';

/**
 * Fetches the current student/teacher profile from the backend.
 * Returns classId, grade, section, attendancePercent, xp, etc.
 */
export const useProfile = (user) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      if (user.role === 'student') {
        const res = await request(`/school/students?limit=200`);
        const found = (res?.items || []).find(s => s.user_id === user.id);
        setProfile(found || null);
      } else if (user.role === 'teacher') {
        const res = await request(`/school/teachers?limit=200`);
        const found = (res?.items || []).find(t => t.user_id === user.id);
        setProfile(found || null);
      }
    } catch (e) {
      console.error('Profile fetch failed', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => { fetch(); }, [fetch]);
  return { profile, loading, refetch: fetch };
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
      const res = await request(`/school/attendance/${studentId}/report`);
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
