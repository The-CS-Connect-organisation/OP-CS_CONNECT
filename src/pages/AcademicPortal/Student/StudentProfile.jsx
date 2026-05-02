import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Printer, RefreshCw } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export const StudentProfile = ({ user, addToast }) => {
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - always show for all students
  const mockData = {
    // Personal Information
    fullName: 'Aarav Menon',
    email: 'aarav.menon@school.edu',
    phone: '+91 98765 43210',
    dateOfBirth: '15 Mar 2008',
    bloodGroup: 'O+',
    religion: 'Hindu',
    nationality: 'Indian',
    
    // Academic Information
    admissionNumber: 'ADM-2022-001847',
    rollNumber: '12',
    class: '10-A',
    section: 'A',
    
    // Identification Numbers
    aadharNumber: 'XXXX-XXXX-9012', // Masked for privacy
    pen: 'PEN-2022-847562',
    apaarId: 'APAAR-2022-847562-IN',
    
    // Parent Information
    motherName: 'Priya Menon',
    motherPhone: '+91 98765 43211',
    fatherName: 'Rajesh Menon',
    fatherPhone: '+91 98765 43212',
    address: '42, Maple Street, Green Valley Colony, New Delhi - 110001',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
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
              className="p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
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
              {/* Personal Information Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-blue-500">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Full Name</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Email</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Phone</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Date of Birth</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Blood Group</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Religion</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.religion}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Nationality</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.nationality}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-green-500">
                  Academic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Admission Number</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.admissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Roll Number</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Class</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.class}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Section</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.section}</p>
                  </div>
                </div>
              </div>

              {/* Identification Section */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-purple-500">
                  Identification
                </h2>
                <p className="text-sm text-slate-600 mb-6 italic">Aadhar number is masked for privacy</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Aadhar (Masked)</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.aadharNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">PEN</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.pen}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Apaar ID</p>
                    <p className="text-lg font-semibold text-slate-900">{mockData.apaarId}</p>
                  </div>
                </div>
              </div>

              {/* Parent Information Section */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-orange-500">
                  Parent Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Mother</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">Name</p>
                        <p className="text-base font-semibold text-slate-900">{mockData.motherName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">Phone</p>
                        <a href={`tel:${mockData.motherPhone}`} className="text-base font-semibold text-blue-600 hover:text-blue-800">
                          {mockData.motherPhone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Father</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">Name</p>
                        <p className="text-base font-semibold text-slate-900">{mockData.fatherName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">Phone</p>
                        <a href={`tel:${mockData.fatherPhone}`} className="text-base font-semibold text-blue-600 hover:text-blue-800">
                          {mockData.fatherPhone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mt-8 bg-slate-50 p-6 rounded-lg">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Address</p>
                  <p className="text-base font-semibold text-slate-900">{mockData.address}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-slate-600 text-sm"
        >
          <p>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentProfile;
