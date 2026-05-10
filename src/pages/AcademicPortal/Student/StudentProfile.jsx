import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, RefreshCw, User, MapPin, Phone, Mail, Book, Heart } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { apiRequest } from '../../../services/apiClient';

export const StudentProfile = ({ user, addToast }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/school/students/${user.id}/profile`);
      setProfile(res);
    } catch (err) {
      console.error('Failed to load student profile:', err);
      addToast?.('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
    addToast?.('Profile refreshed', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const data = profile || {};
  // Backend returns: { success, profile: { ... } } with camelCase fields
  const sp = {
    admission_no: data.admissionNumber,
    roll_number: data.rollNumber,
    date_of_birth: data.dateOfBirth,
    blood_group: data.bloodGroup,
    religion: data.religion,
    nationality: data.nationality,
    admission_no: data.admissionNumber,
    pen: data.pen,
    apaar_id: data.apaarId,
    grade: data.class,
    section: data.section,
    subjects: data.subjects,
    attendance_percent: data.attendancePercent,
    xp: data.xp,
    badges: data.badges,
    updated_at: data.updatedAt,
  };
  // Also check raw response
  const spRaw = data.student_profile || data;
  const mother = data.mother || spRaw.mother || spRaw.mother_data || {};
  const father = data.father || spRaw.father || spRaw.father_data || {};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="h-12 w-64 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-10 w-24 rounded-lg bg-gray-200 animate-pulse" />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-10 space-y-8">
            <div className="flex gap-8 pb-8 border-b">
              <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-4">
                <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 rounded bg-gray-200 animate-pulse" />)}
                </div>
              </div>
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-40 rounded bg-gray-200 animate-pulse" />
                <div className="grid grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(j => <div key={j} className="h-16 rounded bg-gray-100 animate-pulse" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Student Profile</h1>
            <p className="text-slate-600 mt-2">Complete Student Information</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handlePrint}
              className="p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
              title="Print"
            >
              <Printer size={20} />
            </button>
          </div>
        </motion.div>

        {/* Main Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-8 md:p-10">
              {/* Student Header with Photo */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-10 border-b-2 border-slate-200">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-blue-500">
                    <User size={64} className="text-slate-400" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{user?.name || 'Student'}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 font-semibold">Admission</p>
                      <p className="text-slate-900 font-bold">{sp.admission_no || sp.pen || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-semibold">Roll No</p>
                      <p className="text-slate-900 font-bold">{sp.roll_number || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-semibold">Class</p>
                      <p className="text-slate-900 font-bold">{sp.grade || '—'}{sp.section ? `-${sp.section}` : ''}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-blue-500">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Full Name</p>
                    <p className="text-lg font-semibold text-slate-900">{user?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email</p>
                    <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      {user?.email || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Phone</p>
                    <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      {user?.phone || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Date of Birth</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {sp.date_of_birth ? new Date(sp.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Blood Group</p>
                    {sp.blood_group ? (
                      <div className="inline-block px-4 py-2 bg-red-100 border-2 border-red-500 rounded-lg font-bold text-red-700 text-lg">
                        {sp.blood_group}
                      </div>
                    ) : <p className="text-lg font-semibold text-slate-900">—</p>}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Religion</p>
                    <p className="text-lg font-semibold text-slate-900">{sp.religion || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Nationality</p>
                    <p className="text-lg font-semibold text-slate-900">{sp.nationality || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-green-500">
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Admission No</p>
                    <p className="text-lg font-semibold text-slate-900 font-mono">{sp.admission_no || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Roll Number</p>
                    <p className="text-lg font-semibold text-slate-900">{sp.roll_number || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Class & Section</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {sp.grade || '—'}{sp.section ? ` - Section ${sp.section}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Subjects</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {sp.subjects?.join(', ') || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Attendance</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {sp.attendance_percent ? `${sp.attendance_percent}%` : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Identification Section */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-purple-500">
                  Identification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Aadhar (Masked)</p>
                    <p className="text-lg font-semibold text-slate-900 font-mono">{sp.aadhar_number || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">PEN</p>
                    <p className="text-lg font-semibold text-slate-900 font-mono">{sp.pen || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Apaar ID</p>
                    <p className="text-lg font-semibold text-slate-900 font-mono">{sp.apaar_id || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Parent Information Section */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-orange-500">
                  Parent Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Mother Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-lg border-2 border-orange-300">
                    <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-orange-300 flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      Mother
                    </h4>
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Full Name</p>
                        <p className="text-base font-semibold text-slate-900">{mother.full_name || '—'}</p>
                      </div>
                      {mother.phone && (
                        <div>
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Phone</p>
                          <a href={`tel:${mother.phone}`} className="text-base font-semibold text-blue-600 hover:text-blue-800 underline">
                            {mother.phone}
                          </a>
                        </div>
                      )}
                      {mother.email && (
                        <div>
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email</p>
                          <p className="text-base font-semibold text-slate-900">{mother.email}</p>
                        </div>
                      )}
                      {mother.house_name && (
                        <div>
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">House Name</p>
                          <p className="text-base font-semibold text-slate-900">{mother.house_name}</p>
                        </div>
                      )}
                      {mother.address && (
                        <div>
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Address</p>
                          <p className="text-base font-semibold text-slate-900">{mother.address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Father Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg border-2 border-blue-300">
                    <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      Father
                    </h4>
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Full Name</p>
                        <p className="text-base font-semibold text-slate-900">{father.full_name || '—'}</p>
                      </div>
                      {father.phone && (
                        <div>
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Phone</p>
                          <a href={`tel:${father.phone}`} className="text-base font-semibold text-blue-600 hover:text-blue-800 underline">
                            {father.phone}
                          </a>
                        </div>
                      )}
                      {father.email && (
                        <div>
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email</p>
                          <p className="text-base font-semibold text-slate-900">{father.email}</p>
                        </div>
                      )}
                      {father.house_name && (
                        <div>
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">House Name</p>
                          <p className="text-base font-semibold text-slate-900">{father.house_name}</p>
                        </div>
                      )}
                      {father.address && (
                        <div>
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Address</p>
                          <p className="text-base font-semibold text-slate-900">{father.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              {sp.badges?.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-yellow-500">
                    Achievements & Badges
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {sp.badges.map((badge, i) => (
                      <span key={i} className="px-4 py-2 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 font-semibold text-sm">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Updated */}
              <div className="text-center pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  Last updated: {sp.updated_at ? new Date(sp.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentProfile;