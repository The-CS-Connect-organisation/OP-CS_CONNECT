import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit, Trash2, Search, UserPlus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const ManageUsers = ({ addToast }) => {
  const { data: users, add, update, remove, setData } = useStore(KEYS.USERS, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', phone: '', department: '', class: '' });

  const filtered = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleSubmit = () => {
    if (editing) {
      update(editing.id, formData);
      addToast('User updated successfully! ✏️', 'success');
    } else {
      const newUser = {
        ...formData,
        id: `${formData.role}-${Date.now()}`,
        avatar: formData.role === 'student' ? '👦' : formData.role === 'teacher' ? '👨‍🏫' : '👩‍💼',
        joined: new Date().toISOString().split('T')[0],
      };
      add(newUser);
      addToast('User added successfully! 🎉', 'success');
    }
    setModalOpen(false);
    setEditing(null);
    setFormData({ name: '', email: '', password: '', role: 'student', phone: '', department: '', class: '' });
  };

  const roleColors = { student: 'blue', teacher: 'purple', admin: 'orange' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Users className="text-primary-500" /> Manage Users
          </h1>
          <p className="text-gray-500 mt-1">{users.length} total users</p>
        </motion.div>
        <Button variant="primary" icon={UserPlus} onClick={() => { setEditing(null); setFormData({ name: '', email: '', password: '', role: 'student', phone: '', department: '', class: '' }); setModalOpen(true); }}>
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-9 pr-4 py-2.5 text-sm" />
        </div>
        <div className="flex gap-2">
          {['all', 'student', 'teacher', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${roleFilter === r ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
              {r}
            </button>
          ))}
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Joined</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((u, idx) => (
                  <motion.tr key={u.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{u.avatar}</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{u.email}</td>
                    <td className="py-3 px-4"><Badge color={roleColors[u.role]}>{u.role}</Badge></td>
                    <td className="py-3 px-4 text-sm text-gray-500">{u.joined}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" icon={Edit} onClick={() => { setEditing(u); setFormData(u); setModalOpen(true); }} />
                        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => { remove(u.id); addToast('User removed', 'info'); }} className="text-red-500" />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData(d => ({ ...d, email: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input type="password" value={formData.password} onChange={e => setFormData(d => ({ ...d, password: e.target.value }))} className="input-field" placeholder="Leave blank to keep" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select value={formData.role} onChange={e => setFormData(d => ({ ...d, role: e.target.value }))} className="input-field">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input value={formData.phone} onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>{editing ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
