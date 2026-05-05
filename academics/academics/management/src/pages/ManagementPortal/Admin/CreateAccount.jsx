import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Key, Check, X, Copy, Download, Eye, EyeOff, ArrowLeft, Save, UserPlus, GraduationCap, Users, Shield, Car, BookOpen } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { request } from '../../../utils/apiClient';

const CreateAccount = ({ user, addToast, onCancel }) => {
  const [userType, setUserType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
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
    
    // Librarian Specific
    employeeId: '',
    librarySection: '',
    qualification: '',
    experience: '',
    
    // Admin Specific
    accessLevel: '',
    department: '',
  });

  const userTypes = [
    { id: 'student', label: 'Student', icon: User, color: 'blue' },
    { id: 'teacher', label: 'Teacher', icon: GraduationCap, color: 'green' },
    { id: 'parent', label: 'Parent', icon: Users, color: 'purple' },
    { id: 'driver', label: 'Driver', icon: Car, color: 'orange' },
    { id: 'librarian', label: 'Librarian', icon: BookOpen, color: 'indigo' },
    { id: 'admin', label: 'Admin', icon: Shield, color: 'red' },
  ];

  // Sample data for auto-generation
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Rohan', 'Priya', 'Ananya', 'Diya', 'Neha', 'Pooja', 'Rajesh', 'Amit', 'Suresh', 'Vikram', 'Deepak'];
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Rao', 'Nair', 'Iyer', 'Desai', 'Joshi', 'Mishra', 'Pandey', 'Reddy', 'Bhat'];
  const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  const streets = ['Main Street', 'Park Road', 'Market Lane', 'School Road', 'Temple Street', 'Garden Avenue', 'Riverside Road', 'Central Avenue'];
  const occupations = ['Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Government Service', 'Accountant', 'Lawyer', 'Homemaker', 'Farmer', 'Technician'];
  const designations = ['Teacher', 'Senior Teacher', 'HOD', 'Vice Principal', 'Principal'];
  const departments = ['Science', 'Mathematics', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physical Education', 'Arts'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 'Geography', 'Computer Science'];
  const librarySections = ['Main Library', 'Reference Section', 'Digital Library', 'Junior Library', 'Periodicals'];
  const accessLevels = ['Super Admin', 'Department Admin', 'System Admin'];

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const generateIndianPhone = () => {
    const prefix = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90'];
    return '+91 ' + getRandomItem(prefix) + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  };

  const generateAadhaar = () => {
    return Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
  };

  const generateEmail = (fullName, userType) => {
    const namePart = fullName.toLowerCase().replace(/\s+/g, '.');
    const domains = ['schoolsync.edu', 'school.edu', 'academy.edu'];
    const domain = getRandomItem(domains);
    const random = Math.floor(Math.random() * 1000);
    return `${namePart}${random}@${domain}`;
  };

  const generateTestData = () => {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    const fullName = `${firstName} ${lastName}`;
    const email = generateEmail(fullName, userType);
    const password = generatePassword();
    const phone = generateIndianPhone();
    const city = getRandomItem(cities);
    const street = getRandomItem(streets);

    const baseData = {
      fullName,
      email,
      password,
      phone,
      dateOfBirth: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 30) + 1990}`,
      gender: getRandomItem(['Male', 'Female', 'Other']),
      bloodGroup: getRandomItem(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
      nationality: 'Indian',
      religion: getRandomItem(['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain']),
      caste: getRandomItem(['General', 'OBC', 'SC', 'ST']),
      motherTongue: getRandomItem(['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam']),
      aadhaarNumber: generateAadhaar(),
      houseNumber: Math.floor(Math.random() * 500) + 1,
      street: street,
      area: 'Area ' + String.fromCharCode(65 + Math.floor(Math.random() * 26)),
      landmark: 'Near ' + getRandomItem(['Park', 'Temple', 'School', 'Hospital', 'Market']),
      city: city,
      district: city + ' District',
      state: getRandomItem(['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Gujarat', 'Rajasthan']),
      pinCode: Math.floor(Math.random() * 900000) + 100000,
    };

    if (userType === 'student') {
      return {
        ...baseData,
        admissionNumber: `ADM${new Date().getFullYear()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        rollNumber: Math.floor(Math.random() * 50) + 1,
        class: Math.floor(Math.random() * 12) + 1,
        section: getRandomItem(['A', 'B', 'C', 'D', 'E']),
        stream: getRandomItem(['Science', 'Commerce', 'Humanities', 'Vocational']),
        medium: getRandomItem(['English', 'Hindi', 'Regional']),
        fatherName: `${getRandomItem(firstNames)} ${lastName}`,
        fatherPhone: generateIndianPhone(),
        fatherEmail: generateEmail(`${getRandomItem(firstNames)} ${lastName}`, 'parent'),
        fatherOccupation: getRandomItem(occupations),
        fatherAadhaar: generateAadhaar(),
        motherName: `${getRandomItem(firstNames)} ${lastName}`,
        motherPhone: generateIndianPhone(),
        motherEmail: generateEmail(`${getRandomItem(firstNames)} ${lastName}`, 'parent'),
        motherOccupation: getRandomItem(occupations),
        motherAadhaar: generateAadhaar(),
        emergencyContactPerson: `${getRandomItem(firstNames)} ${lastName}`,
        emergencyContact: generateIndianPhone(),
        previousSchool: 'Previous School Name',
        transferCertificateNumber: `TC${Math.floor(Math.random() * 100000)}`,
      };
    } else if (userType === 'teacher') {
      return {
        ...baseData,
        employeeId: `TCH${new Date().getFullYear()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        designation: getRandomItem(designations),
        department: getRandomItem(departments),
        subjects: getRandomItem(subjects) + ', ' + getRandomItem(subjects),
        qualification: getRandomItem(['B.Sc, B.Ed', 'M.Sc, B.Ed', 'B.A, B.Ed', 'M.A, B.Ed', 'B.Tech, B.Ed']),
        experience: Math.floor(Math.random() * 20) + 1,
        joiningDate: new Date(new Date().setFullYear(new Date().getFullYear() - Math.floor(Math.random() * 10))).toISOString().split('T')[0],
      };
    } else if (userType === 'parent') {
      return {
        ...baseData,
        guardianName: fullName,
        guardianRelation: getRandomItem(['Father', 'Mother', 'Guardian']),
        guardianPhone: phone,
        children: `${getRandomItem(firstNames)} ${lastName}, ${getRandomItem(firstNames)} ${lastName}`,
      };
    } else if (userType === 'driver') {
      return {
        ...baseData,
        licenseNumber: `DL${Math.floor(Math.random() * 1000000000)}`,
        vehicleNumber: `MH${Math.floor(Math.random() * 99) + 1}AB${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        routeNumber: `Route ${Math.floor(Math.random() * 20) + 1}`,
      };
    } else if (userType === 'librarian') {
      return {
        ...baseData,
        employeeId: `LIB${new Date().getFullYear()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        librarySection: getRandomItem(librarySections),
        qualification: getRandomItem(['M.Lib.Sc', 'B.Lib.Sc', 'M.Lib.Sc, B.Ed']),
        experience: Math.floor(Math.random() * 15) + 1,
      };
    } else if (userType === 'admin') {
      return {
        ...baseData,
        accessLevel: getRandomItem(accessLevels),
        department: getRandomItem(['Administration', 'Academics', 'Finance', 'Operations', 'IT']),
      };
    }

    return baseData;
  };

  const handleAutoGenerate = () => {
    const generatedData = generateTestData();
    setFormData(prev => ({
      ...prev,
      ...generatedData,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      // Validate required fields
      if (!formData.fullName || !formData.fullName.trim()) {
        throw new Error('Full name is required');
      }
      if (!formData.email || !formData.email.trim()) {
        throw new Error('Email is required');
      }
      
      // Generate password if not provided
      const finalPassword = formData.password || generatePassword();
      
      // Validate password length
      if (finalPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      
      // Create user account via API
      const response = await request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: finalPassword,
          role: userType,
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
    } catch (error) {
      console.error('Account creation error:', error);
      addToast?.(error.message || 'Failed to create account', 'error');
    } finally {
      setIsCreating(false);
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
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Stream</label>
          <select
            value={formData.stream}
            onChange={(e) => setFormData({...formData, stream: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Stream</option>
            <option value="Science">Science</option>
            <option value="Commerce">Commerce</option>
            <option value="Humanities">Humanities</option>
            <option value="Vocational">Vocational</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Medium</label>
          <select
            value={formData.medium}
            onChange={(e) => setFormData({...formData, medium: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Medium</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Regional">Regional</option>
          </select>
        </div>
      </div>

      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2 mt-8">Father's Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Father's Name *</label>
          <input
            type="text"
            value={formData.fatherName}
            onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="As per Aadhaar"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Father's Phone *</label>
          <input
            type="tel"
            value={formData.fatherPhone}
            onChange={(e) => setFormData({...formData, fatherPhone: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Father's Email</label>
          <input
            type="email"
            value={formData.fatherEmail}
            onChange={(e) => setFormData({...formData, fatherEmail: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="father@email.com"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Father's Occupation</label>
          <input
            type="text"
            value={formData.fatherOccupation}
            onChange={(e) => setFormData({...formData, fatherOccupation: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Government Service"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Father's Aadhaar</label>
          <input
            type="text"
            value={formData.fatherAadhaar}
            onChange={(e) => setFormData({...formData, fatherAadhaar: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="12-digit Aadhaar Number"
            maxLength={12}
          />
        </div>
      </div>

      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2 mt-8">Mother's Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mother's Name *</label>
          <input
            type="text"
            value={formData.motherName}
            onChange={(e) => setFormData({...formData, motherName: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="As per Aadhaar"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mother's Phone *</label>
          <input
            type="tel"
            value={formData.motherPhone}
            onChange={(e) => setFormData({...formData, motherPhone: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mother's Email</label>
          <input
            type="email"
            value={formData.motherEmail}
            onChange={(e) => setFormData({...formData, motherEmail: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="mother@email.com"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mother's Occupation</label>
          <input
            type="text"
            value={formData.motherOccupation}
            onChange={(e) => setFormData({...formData, motherOccupation: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Homemaker"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mother's Aadhaar</label>
          <input
            type="text"
            value={formData.motherAadhaar}
            onChange={(e) => setFormData({...formData, motherAadhaar: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="12-digit Aadhaar Number"
            maxLength={12}
          />
        </div>
      </div>

      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2 mt-8">Emergency Contact</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Emergency Contact Person</label>
          <input
            type="text"
            value={formData.emergencyContactPerson}
            onChange={(e) => setFormData({...formData, emergencyContactPerson: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Relative/Neighbor"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Emergency Contact Number</label>
          <input
            type="tel"
            value={formData.emergencyContact}
            onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+91 XXXXX XXXXX"
          />
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
            <option value="Vice Principal">Vice Principal</option>
            <option value="Principal">Principal</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Department *</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select Department</option>
            <option value="Science">Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Social Studies">Social Studies</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Physical Education">Physical Education</option>
            <option value="Arts">Arts</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subjects Taught</label>
          <input
            type="text"
            value={formData.subjects}
            onChange={(e) => setFormData({...formData, subjects: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., Mathematics, Physics"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Qualification</label>
          <input
            type="text"
            value={formData.qualification}
            onChange={(e) => setFormData({...formData, qualification: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., M.Sc, B.Ed"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Experience (Years)</label>
          <input
            type="number"
            value={formData.experience}
            onChange={(e) => setFormData({...formData, experience: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., 5"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Joining Date</label>
          <input
            type="date"
            value={formData.joiningDate}
            onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderParentFields = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2">Guardian Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Guardian Name *</label>
          <input
            type="text"
            value={formData.guardianName}
            onChange={(e) => setFormData({...formData, guardianName: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Full Name"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Relationship to Student *</label>
          <select
            value={formData.guardianRelation}
            onChange={(e) => setFormData({...formData, guardianRelation: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select Relationship</option>
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Guardian">Legal Guardian</option>
            <option value="Grandparent">Grandparent</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Children's Names (comma separated)</label>
          <input
            type="text"
            value={formData.children}
            onChange={(e) => setFormData({...formData, children: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., John Doe, Jane Doe"
          />
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
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bus Route Number *</label>
          <input
            type="text"
            value={formData.routeNumber}
            onChange={(e) => setFormData({...formData, routeNumber: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., Route 5"
          />
        </div>
      </div>
    </div>
  );

  const renderLibrarianFields = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2">Library Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Employee ID *</label>
          <input
            type="text"
            value={formData.employeeId}
            onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g., LIB2024001"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Library Section *</label>
          <select
            value={formData.librarySection}
            onChange={(e) => setFormData({...formData, librarySection: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select Section</option>
            <option value="Main Library">Main Library</option>
            <option value="Reference Section">Reference Section</option>
            <option value="Digital Library">Digital Library</option>
            <option value="Junior Library">Junior Library</option>
            <option value="Periodicals">Periodicals</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Qualification</label>
          <input
            type="text"
            value={formData.qualification}
            onChange={(e) => setFormData({...formData, qualification: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g., M.Lib.Sc, B.Lib.Sc"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Experience (Years)</label>
          <input
            type="number"
            value={formData.experience}
            onChange={(e) => setFormData({...formData, experience: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g., 5"
          />
        </div>
      </div>
    </div>
  );

  const renderAdminFields = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b pb-2">Admin Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Access Level *</label>
          <select
            value={formData.accessLevel}
            onChange={(e) => setFormData({...formData, accessLevel: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select Access Level</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Department Admin">Department Admin</option>
            <option value="System Admin">System Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Department *</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select Department</option>
            <option value="Administration">Administration</option>
            <option value="Academics">Academics</option>
            <option value="Finance">Finance</option>
            <option value="HR">Human Resources</option>
            <option value="IT">IT Support</option>
          </select>
        </div>
      </div>
    </div>
  );

  if (generatedCredentials) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="p-8 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
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
                  vehicleNumber: '', routeNumber: '', librarySection: '',
                  accessLevel: '',
                });
              }}
              className="px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors"
            >
              <UserPlus size={18} /> Create Another
            </button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-6">
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Account</h1>
          <p className="text-slate-500 text-sm">Create accounts for students, teachers, parents, drivers, and admins</p>
        </div>
      </div>

      {/* User Type Selection */}
      <Card className="p-6 mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Select User Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {userTypes.map((type) => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUserType(type.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                userType === type.id
                  ? `border-${type.color}-500 bg-${type.color}-50`
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <type.icon size={24} className={`mx-auto mb-2 ${
                userType === type.id ? `text-${type.color}-600` : 'text-slate-400'
              }`} />
              <span className={`text-xs font-bold uppercase ${
                userType === type.id ? `text-${type.color}-700` : 'text-slate-600'
              }`}>{type.label}</span>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Account Creation Form */}
      <Card className="p-8">
        <form onSubmit={handleSubmit}>
          {/* Login Credentials */}
          <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Key size={16} /> Login Credentials
            </h3>
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={handleAutoGenerate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Key size={16} /> Auto-Generate
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="user@school.edu"
                    required
                  />
                  <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Password will be auto-generated"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information - Only for students */}
          {userType === 'student' && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="As per Aadhaar"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email *</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="email@example.com"
                      required
                    />
                    <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                    <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Aadhaar Number</label>
                  <input
                    type="text"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12-digit Aadhaar Number"
                    maxLength={12}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Religion</label>
                  <select
                    value={formData.religion}
                    onChange={(e) => setFormData({...formData, religion: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Religion</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Jain">Jain</option>
                    <option value="Other">Other</option>
                    <option value="None">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Caste/Category</label>
                  <select
                    value={formData.caste}
                    onChange={(e) => setFormData({...formData, caste: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mother Tongue</label>
                  <select
                    value={formData.motherTongue}
                    onChange={(e) => setFormData({...formData, motherTongue: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Mother Tongue</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information for non-student profiles */}
          {userType !== 'student' && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                    <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Address Information - Only for students */}
          {userType === 'student' && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b pb-2">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">House/Flat Number *</label>
                  <input
                    type="text"
                    value={formData.houseNumber}
                    onChange={(e) => setFormData({...formData, houseNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="House/Flat/Door Number"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Street/Lane/Colony *</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street/Lane/Colony"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Area/Locality</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Area/Locality"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Landmark</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Landmark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">District *</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="District"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">State *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select State</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">PIN Code *</label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({...formData, pinCode: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="6-digit PIN Code"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Role-specific Fields */}
          {userType === 'student' && renderStudentFields()}
          {userType === 'teacher' && renderTeacherFields()}
          {userType === 'parent' && renderParentFields()}
          {userType === 'driver' && renderDriverFields()}
          {userType === 'librarian' && renderLibrarianFields()}
          {userType === 'admin' && renderAdminFields()}

          {/* Submit Button */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} /> Create Account
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default CreateAccount;
