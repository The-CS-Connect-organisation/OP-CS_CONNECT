import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Key, Check, X, Copy, Download, Eye, EyeOff, ArrowLeft, Save, UserPlus, GraduationCap, Users, Shield, Car } from 'lucide-react';
import { request } from '../../../utils/apiClient';

export const CreateAccount = ({ user, addToast, onCancel }) => {
  const [userType, setUserType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Common Fields
    email: '',
    password: '',
    phone: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    nationality: 'Indian',
    religion: '',
    caste: '',
    motherTongue: '',
    aadhaarNumber: '',
    
    // Address
    houseNumber: '',
    street: '',
    area: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    
    // Student Specific
    admissionNumber: '',
    rollNumber: '',
    class: '',
    section: '',
    stream: '',
    medium: '',
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    fatherOccupation: '',
    fatherAadhaar: '',
    motherName: '',
    motherPhone: '',
    motherEmail: '',
    motherOccupation: '',
    motherAadhaar: '',
    emergencyContact: '',
    emergencyContactPerson: '',
    previousSchool: '',
    transferCertificateNumber: '',
    
    // Teacher Specific
    employeeId: '',
    designation: '',
    department: '',
    subjects: '',
    qualification: '',
    experience: '',
    joiningDate: '',
    
    // Parent Specific
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    children: '',
    
    // Driver Specific
    licenseNumber: '',
    vehicleNumber: '',
    routeNumber: '',
    
    // Admin Specific
    accessLevel: '',
    department: '',
  });

  const userTypes = [
    { id: 'student', label: 'Student', icon: User, color: 'blue' },
    { id: 'teacher', label: 'Teacher', icon: GraduationCap, color: 'green' },
    { id: 'parent', label: 'Parent', icon: Users, color: 'purple' },
    { id: 'driver', label: 'Driver', icon: Car, color: 'orange' },
    { id: 'admin', label: 'Admin', icon: Shield, color: 'red' },
  ];

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleAutoGenerate = () => {
    const password = generatePassword();
    setFormData(prev => ({
      ...prev,
      password,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Generate password if not provided
      const finalPassword = formData.password || generatePassword();
      
      // Create user via API
      const response = await request('/school/users', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: finalPassword,
          name: formData.fullName,
          role: userType,
          phone: formData.phone,
          ...formData,
        }),
      });

      const credentials = {
        email: formData.email,
        password: finalPassword,
        userType,
        ...formData,
      };
      
      setGeneratedCredentials(credentials);
      addToast?.('Account created successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast?.('Failed to create account: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    const text = `
Login Credentials for ${userType.toUpperCase()}:
Email: ${generatedCredentials.email}
Password: ${generatedCredentials.password}
Name: ${generatedCredentials.fullName}
Phone: ${generatedCredentials.phone}
    `.trim();
    
    navigator.clipboard.writeText(text);
    addToast?.('Credentials copied to clipboard!', 'success');
  };

  const downloadCredentials = () => {
    const text = `
SCHOOL SYNC - LOGIN CREDENTIALS
================================
User Type: ${userType.toUpperCase()}
Generated on: ${new Date().toLocaleString()}

LOGIN INFORMATION:
Email: ${generatedCredentials.email}
Password: ${generatedCredentials.password}

PERSONAL INFORMATION:
Name: ${generatedCredentials.fullName}
Phone: ${generatedCredentials.phone}
Date of Birth: ${generatedCredentials.dateOfBirth}
Gender: ${generatedCredentials.gender}
Blood Group: ${generatedCredentials.bloodGroup}

ADDRESS:
${generatedCredentials.houseNumber}, ${generatedCredentials.street}
${generatedCredentials.area}, ${generatedCredentials.landmark}
${generatedCredentials.city}, ${generatedCredentials.district}
${generatedCredentials.state} - ${generatedCredentials.pinCode}

${userType === 'student' ? `
PARENT DETAILS:
Father: ${generatedCredentials.fatherName}
Father Phone: ${generatedCredentials.fatherPhone}
Mother: ${generatedCredentials.motherName}
Mother Phone: ${generatedCredentials.motherPhone}

ACADEMIC DETAILS:
Admission No: ${generatedCredentials.admissionNumber}
Roll No: ${generatedCredentials.rollNumber}
Class: ${generatedCredentials.class}
Section: ${generatedCredentials.section}
` : ''}

INSTRUCTIONS:
1. Use these credentials to login at the school portal
2. Change your password after first login
3. Keep your credentials safe and do not share with others
4. Contact admin if you face any login issues

For support, contact: admin@schoolsync.edu
    `.trim();
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedCredentials.email}_credentials.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast?.('Credentials downloaded!', 'success');
  };

  const renderStudentFields = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2">Academic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Admission Number *</label>
          <input
            type="text"
            value={formData.admissionNumber}
            onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., ADM2024001"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Roll Number *</label>
          <input
            type="text"
            value={formData.rollNumber}
            onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 001"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Class *</label>
          <select
            value={formData.class}
            onChange={(e) => setFormData({...formData, class: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Class</option>
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>Class {i+1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Section *</label>
          <select
            value={formData.section}
            onChange={(e) => setFormData({...formData, section: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Section</option>
            {['A', 'B', 'C', 'D', 'E'].map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderTeacherFields = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2">Professional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Employee ID *</label>
          <input
            type="text"
            value={formData.employeeId}
            onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., TCH2024001"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Designation *</label>
          <select
            value={formData.designation}
            onChange={(e) => setFormData({...formData, designation: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select Designation</option>
            <option value="Teacher">Teacher</option>
            <option value="Senior Teacher">Senior Teacher</option>
            <option value="HOD">Head of Department</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderDriverFields = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2">Driver Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Driving License Number *</label>
          <input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="License Number"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vehicle Number *</label>
          <input
            type="text"
            value={formData.vehicleNumber}
            onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., MH 01 AB 1234"
          />
        </div>
      </div>
    </div>
  );

  if (generatedCredentials) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-6"
      >
        <div className="bg-white rounded-2xl p-8 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created Successfully!</h2>
            <p className="text-slate-600">Please share these credentials with the user</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Login Credentials</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Email</span>
                <span className="text-sm font-bold text-slate-900">{generatedCredentials.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Password</span>
                <span className="text-sm font-bold text-slate-900">{generatedCredentials.password}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">User Type</span>
                <span className="text-sm font-bold text-slate-900 uppercase">{generatedCredentials.userType}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyCredentials}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Copy size={18} /> Copy Credentials
            </button>
            <button
              onClick={downloadCredentials}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
            >
              <Download size={18} /> Download
            </button>
            <button
              onClick={() => {
                setGeneratedCredentials(null);
                setFormData({
                  email: '', password: '', phone: '', fullName: '',
                  dateOfBirth: '', gender: '', bloodGroup: '', nationality: 'Indian',
                  religion: '', caste: '', motherTongue: '', aadhaarNumber: '',
                  houseNumber: '', street: '', area: '', landmark: '', city: '',
                  district: '', state: '', pinCode: '', admissionNumber: '',
                  rollNumber: '', class: '', section: '', stream: '', medium: '',
                  fatherName: '', fatherPhone: '', fatherEmail: '', fatherOccupation: '',
                  fatherAadhaar: '', motherName: '', motherPhone: '', motherEmail: '',
                  motherOccupation: '', motherAadhaar: '', emergencyContact: '',
                  emergencyContactPerson: '', previousSchool: '',
                  transferCertificateNumber: '', employeeId: '', designation: '',
                  department: '', subjects: '', qualification: '', experience: '',
                  joiningDate: '', guardianName: '', guardianRelation: '',
                  guardianPhone: '', children: '', licenseNumber: '',
                  vehicleNumber: '', routeNumber: '', accessLevel: '',
                });
              }}
              className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
            >
              Create Another
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Add new users to the system</p>
      </div>

      {/* User Type Selection */}
      <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Select User Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {userTypes.map(type => {
            const Icon = type.icon;
            const isSelected = userType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setUserType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  isSelected 
                    ? `border-${type.color}-500 bg-${type.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon size={24} className="mx-auto mb-2" style={{ color: isSelected ? `var(--${type.color})` : 'var(--text-muted)' }} />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border space-y-6" style={{ borderColor: 'var(--border-color)' }}>
        {/* Common Fields */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="user@school.edu"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
              <div className="flex gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty to auto-generate"
                />
                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific fields */}
        {userType === 'student' && renderStudentFields()}
        {userType === 'teacher' && renderTeacherFields()}
        {userType === 'driver' && renderDriverFields()}

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> {loading ? 'Creating...' : 'Create Account'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 border rounded-xl font-medium hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'var(--border-color)' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateAccount;
