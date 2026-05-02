import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  User,
  Users,
  Mail,
  Phone,
  Calendar,
  MapPin,
  BookOpen,
  Award,
  TrendingUp,
  Activity,
  ShieldCheck,
  Zap,
  Hash,
  Terminal,
  Printer,
  RefreshCw,
  AlertCircle,
  Loader,
  Droplet,
  FileText,
  Home,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';
import { studentApi } from '../../../services/apiDataLayer';
import { getDataMode, DATA_MODES } from '../../../config/dataMode';

const Badge = ({ children, color = 'zinc', className = '' }) => (
  <span
    className={`px-2 py-1 rounded border font-mono text-[10px] font-semibold ${
      color === 'rose'
        ? 'bg-rose-950/30 border-rose-900 text-[var(--text-muted)]'
        : 'bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-muted)]'
    } ${className}`}
  >
    {children}
  </span>
);

const BloodGroupBadge = ({ bloodGroup }) => {
  const colors = {
    'O+': 'bg-red-950/30 border-red-900',
    'O-': 'bg-red-900/30 border-red-800',
    'A+': 'bg-blue-950/30 border-blue-900',
    'A-': 'bg-blue-900/30 border-blue-800',
    'B+': 'bg-yellow-950/30 border-yellow-900',
    'B-': 'bg-yellow-900/30 border-yellow-800',
    'AB+': 'bg-purple-950/30 border-purple-900',
    'AB-': 'bg-purple-900/30 border-purple-800',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded border font-mono text-[10px] font-semibold text-[var(--text-muted)] ${
        colors[bloodGroup] || 'bg-[var(--bg-elevated)] border-[var(--border-default)]'
      }`}
    >
      <Droplet size={12} />
      {bloodGroup || 'Not provided'}
    </div>
  );
};

const ProfilePhoto = ({ photo, name, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--border-default)] flex items-center justify-center overflow-hidden shadow-lg`}
    >
      {photo ? (
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      ) : (
        <User size={size === 'sm' ? 32 : size === 'md' ? 48 : 64} className="text-[var(--text-muted)]" />
      )}
    </div>
  );
};

const InfoField = ({ icon: Icon, label, value, onClick }) => (
  <div
    className="group flex items-start gap-4 p-4 rounded-lg border border-transparent hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all duration-300 cursor-pointer"
    onClick={onClick}
  >
    <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
      <Icon size={18} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-[var(--text-primary)] break-words">{value || 'Not provided'}</p>
    </div>
  </div>
);

const ParentCard = ({ parent, type }) => {
  const handlePhoneClick = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 border-[var(--border-default)] bg-nova-base/40 backdrop-blur-md">
        <div className="flex flex-col items-center text-center mb-6">
          <ProfilePhoto photo={parent?.photo} name={parent?.fullName} size="sm" />
          <h3 className="text-sm font-bold text-[var(--text-primary)] mt-4 capitalize">{type}</h3>
        </div>

        <div className="space-y-4">
          <InfoField
            icon={User}
            label="Full Name"
            value={parent?.fullName || 'Not provided'}
          />

          <div
            className="group flex items-start gap-4 p-4 rounded-lg border border-transparent hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all duration-300 cursor-pointer"
            onClick={() => handlePhoneClick(parent?.phone)}
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
              <Phone size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
                Phone Number
              </p>
              {parent?.phone ? (
                <a
                  href={`tel:${parent.phone}`}
                  className="text-sm font-semibold text-blue-500 hover:text-blue-600 break-words"
                >
                  {parent.phone}
                </a>
              ) : (
                <p className="text-sm font-semibold text-[var(--text-primary)]">Not provided</p>
              )}
            </div>
          </div>

          <InfoField icon={Home} label="House Name" value={parent?.houseName} />

          <div className="group flex items-start gap-4 p-4 rounded-lg border border-transparent hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
              <MapPin size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
                Address
              </p>
              <p className="text-sm font-semibold text-[var(--text-primary)] whitespace-pre-wrap break-words">
                {parent?.address || 'Not provided'}
              </p>
            </div>
          </div>

          {parent?.houseLocation && (
            <InfoField icon={MapPin} label="House Location" value={parent.houseLocation} />
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export const StudentProfile = ({ user, addToast }) => {
  const { data: marks } = useStore(KEYS.MARKS, []);
  const { data: attendance } = useStore(KEYS.ATTENDANCE, []);
  const { playClick, playBlip } = useSound();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfileData = async () => {
    try {
      setError(null);
      if (getDataMode() === DATA_MODES.REMOTE_API) {
        try {
          const res = await studentApi.getExpandedProfile(user?.id);
          if (res?.profile) {
            setProfileData(res.profile);
          }
        } catch (apiError) {
          // If expanded profile endpoint fails, use basic user data
          console.warn('Expanded profile not available, using basic user data:', apiError);
          setProfileData(null); // Will use user data as fallback
        }
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
    addToast?.('Profile refreshed successfully', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const maskAadhar = (aadhar) => {
    if (!aadhar) return 'Not provided';
    const cleaned = aadhar.replace(/\D/g, '');
    if (cleaned.length < 4) return aadhar;
    return `XXXX-XXXX-${cleaned.slice(-4)}`;
  };

  const data = profileData || user;
  const age = calculateAge(data?.dateOfBirth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto w-full pt-4 pb-12 px-4 print:px-0">
      {/* Header with Actions */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">Student Profile</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Complete personal and family information</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all disabled:opacity-50"
            title="Refresh profile"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all"
            title="Print profile"
          >
            <Printer size={20} />
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border border-red-900/30 bg-red-950/20 flex items-start gap-3"
        >
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-500">{error}</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Please try refreshing the page</p>
          </div>
        </motion.div>
      )}

      {/* Student Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-8 md:p-12 border-[var(--border-default)] bg-nova-base/40 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <ProfilePhoto photo={data?.photo} name={data?.name} size="lg" />

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">{data?.name || 'Student Name'}</h2>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                <Badge color="zinc">Admission: {data?.admissionNumber || 'N/A'}</Badge>
                <Badge color="zinc">Roll: {data?.rollNumber || 'N/A'}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">Class</p>
                  <p className="font-semibold text-[var(--text-primary)]">{data?.class || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">Section</p>
                  <p className="font-semibold text-[var(--text-primary)]">{data?.section || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">Blood Group</p>
                  <BloodGroupBadge bloodGroup={data?.bloodGroup} />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1">Nationality</p>
                  <p className="font-semibold text-[var(--text-primary)]">{data?.nationality || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Personal Information Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <User size={20} />
            Personal Information
          </h3>
        </div>
        <Card className="p-6 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField icon={Mail} label="Email" value={data?.email} />
            <InfoField icon={Phone} label="Phone" value={data?.phone} />
            <div className="group flex items-start gap-4 p-4 rounded-lg border border-transparent hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
                <Calendar size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  Date of Birth
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {formatDate(data?.dateOfBirth)}
                  {age && ` (Age: ${age})`}
                </p>
              </div>
            </div>
            <InfoField icon={FileText} label="Religion" value={data?.religion} />
          </div>
        </Card>
      </motion.div>

      {/* Identification Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <ShieldCheck size={20} />
            Identification
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Aadhar number is masked for privacy</p>
        </div>
        <Card className="p-6 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField icon={Hash} label="Aadhar (Masked)" value={maskAadhar(data?.aadharNumber)} />
            <InfoField icon={FileText} label="PEN" value={data?.pen} />
            <InfoField icon={FileText} label="Apaar ID" value={data?.apaarId} />
          </div>
        </Card>
      </motion.div>

      {/* Parents Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Users size={20} />
            Parents / Guardians
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data?.mother ? (
            <ParentCard parent={data.mother} type="Mother" />
          ) : (
            <Card className="p-6 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-sm flex items-center justify-center min-h-[300px]">
              <p className="text-[var(--text-muted)]">Mother information not provided</p>
            </Card>
          )}
          {data?.father ? (
            <ParentCard parent={data.father} type="Father" />
          ) : (
            <Card className="p-6 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-sm flex items-center justify-center min-h-[300px]">
              <p className="text-[var(--text-muted)]">Father information not provided</p>
            </Card>
          )}
        </div>
      </motion.div>

      {/* Last Updated */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <p className="text-[10px] text-[var(--text-muted)] text-center">
          Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </motion.div>
    </div>
  );
};

export default StudentProfile;
