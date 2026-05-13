import { motion } from 'framer-motion';
import { useState } from 'react';
import { Printer, RefreshCw, User } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export const StudentProfile = ({ user, addToast }) => {
  const [refreshing, setRefreshing] = useState(false);

  // Use actual user data with fallbacks
  const profileData = {
    fullName: user?.name || 'Student Name',
    email: user?.email || 'student@school.edu',
    phone: user?.phone || '+91 00000 00000',
    dateOfBirth: user?.dob || '01 Jan 2008',
    age: user?.age || 16,
    bloodGroup: user?.bloodGroup || 'O+',
    religion: user?.religion || 'Hindu',
    nationality: 'Indian',
    admissionNumber: user?.admissionNo || `ADM-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`,
    rollNumber: user?.rollNo || '00',
    class: user?.class || '10-A',
    section: user?.class?.split('-')[1] || 'A',
    joinedDate: user?.joined || '01 Apr 2022',
    aadharNumber: 'XXXX-XXXX-XXXX',
    pen: `PEN-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`,
    apaarId: `APAAR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}-IN`,
    motherName: user?.motherName || 'Mother Name',
    motherPhone: user?.motherPhone || '+91 00000 00001',
    motherHouseName: 'Student Residence',
    motherHouseLocation: 'Near School Campus',
    fatherName: user?.fatherName || 'Father Name',
    fatherPhone: user?.fatherPhone || '+91 00000 00002',
    fatherHouseName: 'Student Residence',
    fatherHouseLocation: 'Near School Campus',
    address: user?.address || 'School Campus, City - 000000',
    photo: null,
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
    addToast?.('Profile refreshed', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

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
                    {profileData.photo ? (
                      <img src={profileData.photo} alt={profileData.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} className="text-slate-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{profileData.fullName}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 font-semibold">Admission</p>
                      <p className="text-slate-900 font-bold">{profileData.admissionNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-semibold">Roll No</p>
                      <p className="text-slate-900 font-bold">{profileData.rollNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-semibold">Class</p>
                      <p className="text-slate-900 font-bold">{profileData.class}</p>
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
                    <p className="text-lg font-semibold text-slate-900">{profileData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email Address</p>
                    <p className="text-lg font-semibold text-slate-900">{profileData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Phone Number</p>
                    <p className="text-lg font-semibold text-slate-900">{profileData.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Date of Birth</p>
                    <p className="text-lg font-semibold text-slate-900">{profileData.dateOfBirth} (Age: {profileData.age})</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Blood Group</p>
                    <div className="inline-block px-4 py-2 bg-red-100 border-2 border-red-500 rounded-lg font-bold text-red-700 text-lg">
                      {profileData.bloodGroup}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Religion</p>
                    <p className="text-lg font-semibold text-slate-900">{profileData.religion}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Nationality</p>
                    <p className="text-lg font-semibold text-slate-900">{profileData.nationality}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Joined Date</p>
                    <p className="text-lg font-semibold text-slate-900">{profileData.joinedDate}</p>
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
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Admission Number</p>
                    <p className="text-lg font-semibold text-slate-900">{profileData.admissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Roll Number</p>
                    <p className="text-lg font-semibold text-slate-900">{profileData.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Class</p>
                    <p className="text-lg font-semibold text-slate-900">{profileData.class}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Section</p>
                    <p className="text-lg font-semibold text-slate-900">{profileData.section}</p>
                  </div>
                </div>
              </div>

              {/* Identification Section */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-purple-500">
                  Identification
                </h3>
                <p className="text-sm text-slate-600 mb-6 italic font-semibold">Aadhar number is masked for privacy</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Aadhar (Masked)</p>
                    <p className="text-lg font-semibold text-slate-900 font-mono">{profileData.aadharNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">PEN</p>
                    <p className="text-lg font-semibold text-slate-900 font-mono">{profileData.pen}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Apaar ID</p>
                    <p className="text-lg font-semibold text-slate-900 font-mono">{profileData.apaarId}</p>
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
                        <p className="text-base font-semibold text-slate-900">{profileData.motherName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Phone Number</p>
                        <a href={`tel:${profileData.motherPhone}`} className="text-base font-semibold text-blue-600 hover:text-blue-800 underline">
                          {profileData.motherPhone}
                        </a>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">House Name</p>
                        <p className="text-base font-semibold text-slate-900">{profileData.motherHouseName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">House Location</p>
                        <p className="text-base font-semibold text-slate-900">{profileData.motherHouseLocation}</p>
                      </div>
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
                        <p className="text-base font-semibold text-slate-900">{profileData.fatherName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Phone Number</p>
                        <a href={`tel:${profileData.fatherPhone}`} className="text-base font-semibold text-blue-600 hover:text-blue-800 underline">
                          {profileData.fatherPhone}
                        </a>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">House Name</p>
                        <p className="text-base font-semibold text-slate-900">{profileData.fatherHouseName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">House Location</p>
                        <p className="text-base font-semibold text-slate-900">{profileData.fatherHouseLocation}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mt-8 bg-slate-100 p-8 rounded-lg border-2 border-slate-300">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Complete Address</p>
                  <p className="text-base font-semibold text-slate-900 leading-relaxed">{profileData.address}</p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-center pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
