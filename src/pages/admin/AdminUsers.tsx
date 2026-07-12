import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import { playSuccessSound } from '../../lib/sound';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import { Skeleton } from '../../components/ui/Skeleton';
import {
  Users, Search, Plus, Mail, Phone, Edit, Trash2, X,
  UserPlus, CheckCircle2, Loader2, User, Lock, Shield,
  GraduationCap, BookOpen, FileText, Globe
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { getAvatarUrl, getInitials } from '@/lib/avatar';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'teacher' | 'admin' | 'parent' | 'driver' | 'librarian' | 'manager';
  class?: string;
  status: 'active' | 'inactive';
}

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' },
  { value: 'parent', label: 'Parent' },
  { value: 'driver', label: 'Driver' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'librarian', label: 'Librarian' },
  { value: 'manager', label: 'Manager' },
];

const subjectOptions = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Geography', 'Art', 'Physical Education', 'Economics', 'Accounting'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const emptyForm = {
  name: '', email: '', password: '', role: 'student',
  class: '', subjects: [] as string[],
  parentType: '',
  admissionNo: '', phone: '', address: '',
  dateOfBirth: '', bloodGroup: '', aadharNo: '', penNo: '', apaarId: '',
  religion: '', nationality: 'Indian', schoolHouse: '', houseLocation: '',
  fatherName: '', fatherPhone: '', motherName: '', motherPhone: '',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [form, setForm] = useState({ ...emptyForm });
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.email ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const valA = (a[sortColumn as keyof UserRecord] || '').toString().toLowerCase();
    const valB = (b[sortColumn as keyof UserRecord] || '').toString().toLowerCase();
    return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedUsers.map(u => u.id)));
    }
  };

  const getRoleStyle = (role: string) => {
    const map: Record<string, string> = {
      student: 'bg-blue-100/70 text-blue-800',
      teacher: 'bg-orange-100/70 text-orange-800',
      admin: 'bg-red-100/70 text-red-800',
      parent: 'bg-green-100/70 text-green-800',
      driver: 'bg-purple-100/70 text-purple-800',
      librarian: 'bg-yellow-100/70 text-yellow-800',
      manager: 'bg-indigo-100/70 text-indigo-800',
    };
    return map[role] || 'bg-gray-100/70 text-gray-700';
  };

  const openCreateModal = () => {
    setEditingUserId(null);
    setForm({ ...emptyForm });
    setSuccess(false);
    setError('');
    setShowCreateModal(true);
  };

  const openEditModal = (user: any) => {
    setEditingUserId(user.id);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'student',
      class: user.class || '',
      subjects: Array.isArray(user.subjects) ? user.subjects : [],
      parentType: user.parentType || '',
      admissionNo: user.admissionNo || '', phone: user.phone || '', address: user.address || '',
      dateOfBirth: user.dateOfBirth || '', bloodGroup: user.bloodGroup || '',
      aadharNo: user.aadharNo || '', penNo: user.penNo || '', apaarId: user.apaarId || '',
      religion: user.religion || '', nationality: user.nationality || 'Indian',
      schoolHouse: user.schoolHouse || '', houseLocation: user.houseLocation || '',
      fatherName: user.fatherName || '', fatherPhone: user.fatherPhone || '',
      motherName: user.motherName || '', motherPhone: user.motherPhone || '',
    });
    setSuccess(false);
    setError('');
    setShowCreateModal(true);
  };

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError('');
  };

  const toggleSubject = (subject: string) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess(false);

    try {
      const data: Record<string, any> = {
        name: form.name,
        email: form.email,
        role: form.role,
      };
      if (editingUserId) {
        if (form.password) data.password = form.password;
      } else {
        data.password = form.password || 'changeme123';
      }
      if (form.role === 'student') {
        data.class = form.class;
        data.admissionNo = form.admissionNo;
        data.phone = form.phone;
        data.address = form.address;
        data.dateOfBirth = form.dateOfBirth;
        data.bloodGroup = form.bloodGroup;
        data.aadharNo = form.aadharNo;
        data.penNo = form.penNo;
        data.apaarId = form.apaarId;
        data.religion = form.religion;
        data.nationality = form.nationality;
        data.schoolHouse = form.schoolHouse;
        data.houseLocation = form.houseLocation;
        data.fatherName = form.fatherName;
        data.fatherPhone = form.fatherPhone;
        data.motherName = form.motherName;
        data.motherPhone = form.motherPhone;
        if (form.subjects.length > 0) data.subjects = form.subjects;
      }
      if (form.role === 'teacher') {
        data.class = form.class;
        if (form.subjects.length > 0) data.subjects = form.subjects;
      }
      if (form.role === 'parent') {
        data.parentType = form.parentType;
        data.phone = form.phone;
      }

      let savedUser: any;
      if (editingUserId) {
        savedUser = await api.updateUser(editingUserId, data);
        savedUser = savedUser?.user ?? savedUser;
      } else {
        savedUser = await api.createUser(data);
      }

      setSuccess(true);
      playSuccessSound();
      if (savedUser?.id) {
        setUsers(prev => {
          if (editingUserId) {
            return prev.map(u => u.id === savedUser.id ? { ...u, ...savedUser } : u);
          } else {
            return [...prev, savedUser];
          }
        });
      }
      setTimeout(() => {
        setShowCreateModal(false);
        setEditingUserId(null);
        setForm({ ...emptyForm });
        loadUsers();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all users</p>
        </div>
        <Button onClick={openCreateModal}><Plus className="w-4 h-4 mr-2" />Add User</Button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-11 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
          className="px-4 h-11 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
        >
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
          <option value="parent">Parent</option>
          <option value="driver">Driver</option>
          <option value="librarian">Librarian</option>
          <option value="manager">Manager</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : (
        <>
          {/* Desktop: Data Table — lg:block */}
          <div className="hidden lg:block">
            <div className="border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="p-4 text-left w-10">
                        <input
                          type="checkbox"
                          checked={paginatedUsers.length > 0 && selectedIds.size === paginatedUsers.length}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      {[
                        { key: 'name', label: 'Name' },
                        { key: 'email', label: 'Email' },
                        { key: 'phone', label: 'Phone' },
                      ].map(col => (
                        <th
                          key={col.key}
                          onClick={() => toggleSort(col.key)}
                          className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                        >
                          <span className="inline-flex items-center gap-1">
                            {col.label}
                            {sortColumn === col.key && (
                              <span className="text-primary">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </span>
                        </th>
                      ))}
                      <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Class / Role</th>
                      <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user, i) => (
                      <tr
                        key={user.id}
                        className={`border-b last:border-0 transition-colors hover:bg-muted/20 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(user.id)}
                            onChange={() => toggleSelect(user.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 shrink-0">
                              <AvatarImage src={getAvatarUrl(user)} />
                              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{user.name || '—'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{user.email || '—'}</td>
                        <td className="p-4 text-sm text-muted-foreground">{user.phone || '—'}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {user.class ? <span className="text-sm text-muted-foreground">{user.class}</span> : <span className="text-sm text-muted-foreground">—</span>}
                            <span className={`inline-flex items-center justify-center min-w-[72px] px-2.5 py-0.5 rounded-md text-xs font-medium ${getRoleStyle(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              const next = user.status === 'active' ? 'inactive' : 'active';
                              api.updateUser(user.id, { status: next }).then(() => loadUsers()).catch(() => {});
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              user.status === 'active'
                                ? 'bg-orange-500 text-white'
                                : 'border border-gray-300 text-gray-500'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-white' : 'bg-gray-400'}`} />
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 rounded-lg text-muted-foreground hover:bg-gray-200 hover:text-foreground transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, user.name)}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, sortedUsers.length)} of {sortedUsers.length} user{sortedUsers.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border bg-background hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(0, Math.min(page - 3, totalPages - 5));
                  const p = start + i + 1;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border bg-background hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: Card Layout — lg:hidden */}
          <div className="lg:hidden space-y-2 pb-24">
            {paginatedUsers.map(user => (
              <Card key={user.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarImage src={getAvatarUrl(user)} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm truncate">{user.name || '—'}</h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mt-0.5">
                        <span className="inline-flex items-center gap-1 truncate max-w-full"><Mail className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{user.email || '—'}</span></span>
                        {user.phone && <span className="inline-flex items-center gap-1 w-full xs:w-auto"><Phone className="w-3.5 h-3.5 shrink-0" />{user.phone}</span>}
                      </div>
                      {(user.class) && (
                        <p className="text-xs text-muted-foreground mt-1">Class: {user.class}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={`inline-flex items-center justify-center min-w-[72px] px-2.5 py-0.5 rounded-md text-xs font-medium ${getRoleStyle(user.role)}`}>
                    {user.role}
                  </span>
                  <button
                    onClick={() => {
                      const next = user.status === 'active' ? 'inactive' : 'active';
                      api.updateUser(user.id, { status: next }).then(() => loadUsers()).catch(() => {});
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      user.status === 'active'
                        ? 'bg-orange-500 text-white'
                        : 'border border-gray-300 text-gray-500'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-white' : 'bg-gray-400'}`} />
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                  <div className="flex items-center gap-1 ml-auto">
                    <button onClick={() => openEditModal(user)} className="p-2 rounded-lg text-muted-foreground hover:bg-gray-200 hover:text-foreground transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(user.id, user.name)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Create User Modal — unchanged */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 bg-black/50 overflow-y-auto"
            onClick={() => { if (!creating) { setShowCreateModal(false); setEditingUserId(null); setForm({ ...emptyForm }); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-3xl bg-background rounded-xl shadow-2xl border p-6 relative"
            >
              <button
                onClick={() => { setShowCreateModal(false); setEditingUserId(null); setForm({ ...emptyForm }); }}
                className="absolute right-4 top-4 p-1 hover:bg-accent rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-bold">{editingUserId ? 'Edit User' : 'Create Account'}</h2>
                <p className="text-sm text-muted-foreground mt-1">{editingUserId ? 'Update user details' : 'Add a new user to the system'}</p>
              </div>

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-l-4 border-l-emerald-500 mb-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-emerald-700">{editingUserId ? 'User updated successfully' : 'Account created successfully'}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Redirecting...</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-l-4 border-l-red-500 mb-4"
                >
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />Full Name
                    </label>
                    <input type="text" required value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Enter full name" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />Email Address
                    </label>
                    <input type="email" required value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="user@school.edu" className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />Password
                  </label>
                  <input type="password" required={!editingUserId} value={form.password} onChange={e => updateField('password', e.target.value)} placeholder={editingUserId ? 'Leave blank to keep current' : 'Minimum 6 characters'} className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />Role
                  </label>
                  <select value={form.role} onChange={e => updateField('role', e.target.value)} className="input-field">
                    {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                {form.role === 'student' && (
                  <div className="space-y-5">
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><GraduationCap className="w-4 h-4 text-muted-foreground" />Academic Info</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Class / Section</label>
                          <input type="text" value={form.class} onChange={e => updateField('class', e.target.value)} placeholder="e.g. 10-A" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Admission No</label>
                          <input type="text" value={form.admissionNo} onChange={e => updateField('admissionNo', e.target.value)} placeholder="e.g. ADM-2024-001" className="input-field" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium mb-2">Subjects</label>
                        <div className="flex flex-wrap gap-2">
                          {subjectOptions.map(subject => {
                            const selected = form.subjects.includes(subject);
                            return (
                              <button key={subject} type="button" onClick={() => toggleSubject(subject)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selected ? 'bg-purple-100 text-purple-700' : 'bg-accent hover:bg-accent/80'}`}>
                                {subject}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><User className="w-4 h-4 text-muted-foreground" />Personal Info</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
                          <input type="date" value={form.dateOfBirth} onChange={e => updateField('dateOfBirth', e.target.value)} className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Blood Group</label>
                          <select value={form.bloodGroup} onChange={e => updateField('bloodGroup', e.target.value)} className="input-field">
                            <option value="">Select</option>
                            {bloodGroupOptions.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Phone</label>
                          <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+91-9876543210" className="input-field" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium mb-1.5">Address</label>
                        <input type="text" value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="Full address" className="input-field" />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-muted-foreground" />Identity Documents</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Aadhar No</label>
                          <input type="text" value={form.aadharNo} onChange={e => updateField('aadharNo', e.target.value)} placeholder="1234-5678-9012" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">PEN No</label>
                          <input type="text" value={form.penNo} onChange={e => updateField('penNo', e.target.value)} placeholder="PEN-001" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">APAAR ID</label>
                          <input type="text" value={form.apaarId} onChange={e => updateField('apaarId', e.target.value)} placeholder="APAAR-001" className="input-field" />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Globe className="w-4 h-4 text-muted-foreground" />Demographics</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Religion</label>
                          <input type="text" value={form.religion} onChange={e => updateField('religion', e.target.value)} placeholder="e.g. Hindu" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Nationality</label>
                          <input type="text" value={form.nationality} onChange={e => updateField('nationality', e.target.value)} placeholder="Indian" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">School House</label>
                          <input type="text" value={form.schoolHouse} onChange={e => updateField('schoolHouse', e.target.value)} placeholder="e.g. Blue House" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">House Location</label>
                          <input type="text" value={form.houseLocation} onChange={e => updateField('houseLocation', e.target.value)} placeholder="e.g. Delhi NCR" className="input-field" />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-muted-foreground" />Parent / Guardian Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Father's Name</label>
                          <input type="text" value={form.fatherName} onChange={e => updateField('fatherName', e.target.value)} placeholder="Father's full name" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Father's Phone</label>
                          <input type="tel" value={form.fatherPhone} onChange={e => updateField('fatherPhone', e.target.value)} placeholder="+91-9876543211" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Mother's Name</label>
                          <input type="text" value={form.motherName} onChange={e => updateField('motherName', e.target.value)} placeholder="Mother's full name" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Mother's Phone</label>
                          <input type="tel" value={form.motherPhone} onChange={e => updateField('motherPhone', e.target.value)} placeholder="+91-9876543212" className="input-field" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {form.role === 'teacher' && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                        Subjects
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {subjectOptions.map(subject => {
                          const selected = form.subjects.includes(subject);
                          return (
                            <button key={subject} type="button" onClick={() => toggleSubject(subject)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selected ? 'bg-purple-100 text-purple-700' : 'bg-accent hover:bg-accent/80'}`}>
                              {subject}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {form.role === 'parent' && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-muted-foreground" />Parent Type
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">Specify whether this is a father or mother account.</p>
                    <div className="grid grid-cols-2 gap-4 max-w-xs">
                      <button type="button" onClick={() => updateField('parentType', 'father')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.parentType === 'father' ? 'border-orange-500 bg-orange-500/5' : 'border-border hover:border-orange-500/30'}`}>
                        <User className={`w-8 h-8 ${form.parentType === 'father' ? 'text-orange-500' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-medium ${form.parentType === 'father' ? 'text-orange-600' : 'text-muted-foreground'}`}>Father</span>
                      </button>
                      <button type="button" onClick={() => updateField('parentType', 'mother')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.parentType === 'mother' ? 'border-orange-500 bg-orange-500/5' : 'border-border hover:border-orange-500/30'}`}>
                        <User className={`w-8 h-8 ${form.parentType === 'mother' ? 'text-orange-500' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-medium ${form.parentType === 'mother' ? 'text-orange-600' : 'text-muted-foreground'}`}>Mother</span>
                      </button>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-1.5"><Phone className="w-3.5 h-3.5 inline mr-1" />Phone Number</label>
                      <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Enter phone number" className="input-field max-w-xs" />
                    </div>
                  </div>
                )}

                {form.role !== 'student' && form.role !== 'teacher' && form.role !== 'parent' && (
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                          Class / Section (if applicable)
                        </label>
                        <input type="text" value={form.class} onChange={e => updateField('class', e.target.value)} placeholder="Optional" className="input-field" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2 border-t">
                  <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); setEditingUserId(null); setForm({ ...emptyForm }); }} disabled={creating}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : <><UserPlus className="w-4 h-4 mr-2" /> {editingUserId ? 'Save Changes' : 'Create Account'}</>}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
