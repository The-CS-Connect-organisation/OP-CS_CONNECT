import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, RefreshCw, User, Mail, Phone, Book, MapPin, Award } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function StudentProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [studentData, gradesData, attendanceData] = await Promise.all([
        api.getStudent(user!.id),
        api.getStudentGrades(user!.id),
        api.getStudentAttendance(user!.id),
      ]);
      setProfile(studentData);
      setGrades(gradesData);
      setAttendance(attendanceData);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="nova-card p-10 space-y-8">
            <div className="flex gap-8 pb-8 border-b border-[var(--border-default)]">
              <div className="w-32 h-32 rounded-full bg-[var(--bg-elevated)] animate-pulse" />
              <div className="flex-1 space-y-4">
                <div className="h-8 w-48 rounded bg-[var(--bg-elevated)] animate-pulse" />
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded bg-[var(--bg-elevated)] animate-pulse" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const presentCount = attendance.filter((a: any) => a.status === 'present').length;
  const attendancePercent = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <div className="min-h-screen p-4 md:p-8 obsidian-mesh">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[var(--text-primary)]">Student Profile</h1>
            <p className="text-[var(--text-muted)] mt-2">Complete Student Information</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <button onClick={handleRefresh} disabled={refreshing} className="p-3 nova-card border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all disabled:opacity-50" title="Refresh">
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button onClick={handlePrint} className="p-3 nova-card border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all" title="Print">
              <Printer size={20} />
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="nova-card bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-10 border-b-2 border-[var(--border-default)]">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center overflow-hidden border-4 border-[var(--accent-pink)]">
                    <span className="text-4xl font-bold text-[var(--accent-pink)]">{user?.name?.split(' ').map((n: string) => n[0]).join('') || 'S'}</span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{user?.name || 'Student'}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--text-muted)] font-semibold">Email</p>
                      <p className="text-[var(--text-primary)] font-bold">{user?.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)] font-semibold">Class</p>
                      <p className="text-[var(--text-primary)] font-bold">{profile?.class || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-muted)] font-semibold">GPA</p>
                      <p className="text-[var(--text-primary)] font-bold">{profile?.gpa?.toFixed(2) || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 pb-3 border-b-2 border-[var(--accent-pink)]">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Full Name</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">{user?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Email</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2"><Mail size={14} className="text-[var(--text-dim)]" />{user?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Subjects</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2"><Book size={14} className="text-[var(--text-dim)]" />{profile?.subjects?.join(', ') || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Attendance</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">{attendancePercent}%</p>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 pb-3 border-b-2 border-[var(--accent-purple)]">Academic Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {grades.map((g: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]">
                      <p className="text-xs text-[var(--text-muted)] font-semibold uppercase">{g.subject}</p>
                      <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{g.marks}%</p>
                      <span className="badge badge-purple mt-2">{g.grade}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-6 border-t border-[var(--border-default)]">
                <p className="text-xs text-[var(--text-muted)]">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
