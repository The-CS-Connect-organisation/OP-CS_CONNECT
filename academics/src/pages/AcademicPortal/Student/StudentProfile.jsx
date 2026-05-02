import { motion } from 'framer-motion';
import { useState } from 'react';
import { Printer, RefreshCw, User } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export const StudentProfile = ({ user, addToast }) => {
  const [refreshing, setRefreshing] = useState(false);

  // Mock data with ALL fields
  const mockData = {
    // Personal Information
    fullName: 'Aarav Menon',
    email: 'aarav.menon@school.edu',
    phone: '+91 98765 43210',
    dateOfBirth: '15 Mar 2008',
    age: 16,
    bloodGroup: 'O+',
    religion: 'Hindu',
    nationality: 'Indian',
    
    // Academic Information
    admissionNumber: 'ADM-2022-001847',
    rollNumber: '12',
    class: '10-A',
    section: 'A',
    joinedDate: '01 Apr 2022',
    
    // Identification Numbers
    aadharNumber: 'XXXX-XXXX-9012',
    pen: 'PEN-2022-847562',
    apaarId: 'APAAR-2022-847562-IN',
    
    // Parent Information - Mother
    motherName: 'Priya Menon',
    motherPhone: '+91 98765 43211',
    motherHouseName: 'Menon Residence',
    motherHouseLocation: 'Near Central Park',
    
    // Parent Information - Father
    fatherName: 'Rajesh Menon',
    fatherPhone: '+91 98765 43212',
    fatherHouseName: 'Menon Residence',
    fatherHouseLocation: 'Near Central Park',
    
    // Address
    address: '42, Maple Street, Green Valley Colony, New Delhi - 110001',
    
    // Photo
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
                    {mockData.photo ? (
                      <img src={mockData.photo} alt={mockData.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} className="text-slate-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{mockData.fullName}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 font-semibold">Admission</p>
                      <p className="text-slate-900 font-bold">{mockData.admissionNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-semibold">Roll No</p>
                      <p className="text-slate-900 font-bold">{mockData.rollNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 font-semibold">Class</p>
                      <p className="text-slate-900 font-bold">{mockData.class}</p>
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
                    <p className="text-lg font-semibold text-slate-900">{mockData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email Address</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Phone Number</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Date of Birth</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.dateOfBirth} (Age: {mockData.age})</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Blood Group</p>
                    <div className="inline-block px-4 py-2 bg-red-100 border-2 border-red-500 rounded-lg font-bold text-red-700 text-lg">
                      {mockData.bloodGroup}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Religion</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.religion}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Nationality</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.nationality}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Joined Date</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.joinedDate}</p>
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
                    <p className="text-lg font-semibold text-slate-900">{mockData.admissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Roll Number</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Class</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.class}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Section</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.section}</p>
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
                    <p className="text-lg font-semibold text-slate-900 font-mono">{mockData.aadharNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">PEN</p>
                    <p className="text-lg font-semibold text-slate-900 font-mono">{mockData.pen}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Apaar ID</p>
                    <p className="text-lg font-semibold text-slate-900 font-mono">{mockData.apaarId}</p>
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
                        <p className="text-base font-semibold text-slate-900">{mockData.motherName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Phone Number</p>
                        <a href={`tel:${mockData.motherPhone}`} className="text-base font-semibold text-blue-600 hover:text-blue-800 underline">
                          {mockData.motherPhone}
                        </a>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">House Name</p>
                        <p className="text-base font-semibold text-slate-900">{mockData.motherHouseName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">House Location</p>
                        <p className="text-base font-semibold text-slate-900">{mockData.motherHouseLocation}</p>
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
                        <p className="text-base font-semibold text-slate-900">{mockData.fatherName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Phone Number</p>
                        <a href={`tel:${mockData.fatherPhone}`} className="text-base font-semibold text-blue-600 hover:text-blue-800 underline">
                          {mockData.fatherPhone}
                        </a>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">House Name</p>
                        <p className="text-base font-semibold text-slate-900">{mockData.fatherHouseName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">House Location</p>
                        <p className="text-base font-semibold text-slate-900">{mockData.fatherHouseLocation}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mt-8 bg-slate-100 p-8 rounded-lg border-2 border-slate-300">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Complete Address</p>
                  <p className="text-base font-semibold text-slate-900 leading-relaxed">{mockData.address}</p>
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
