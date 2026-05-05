import { useState, useEffect } from 'react';
import { Users, Search, Filter, Plus, Edit2, Trash2, X } from 'lucide-react';
import { CreateAccount } from './CreateAccount';
import { apiCall } from '../../services/apiDataLayer';

const AdminUsers = ({ user, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/school/users', 'GET');
      if (response.success) {
        setUsers(response.users || response.data || []);
      }
    } catch (error) {
      addToast?.('Failed to load users', 'error');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiCall(`/api/auth/users/${userId}`, 'DELETE');
      if (response.success) {
        addToast?.(`User ${userName} deleted successfully`, 'success');
        setUsers(users.filter(u => u.id !== userId));
      } else {
        addToast?.('Failed to delete user', 'error');
      }
    } catch (error) {
      addToast?.('Error deleting user', 'error');
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (showCreateAccount) {
    return (
      <div className="p-6">
        <CreateAccount 
          user={user} 
          addToast={addToast} 
          onCancel={() => {
            setShowCreateAccount(false);
            fetchUsers();
          }} 
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p style={{ color: 'var(--text-muted)' }}>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>User Management</h1>
        <button 
          onClick={() => setShowCreateAccount(true)}
          className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: 'var(--primary)' }}>
          <Plus size={16} /> Create Account
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border text-sm"
            style={{ borderColor: 'var(--border-color)' }}
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 rounded-xl border text-sm"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="parent">Parents</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Email</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Role</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Details</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-primary)' }}>{u.name}</td>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    u.role === 'student' ? 'bg-blue-100 text-blue-700' :
                    u.role === 'teacher' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>{u.role}</span>
                </td>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{u.grade || u.subject || u.student || '-'}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{u.status}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="p-1 rounded-lg hover:bg-gray-100" onClick={() => addToast?.('Edit user', 'info')}>
                      <Edit2 size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button 
                      className="p-1 rounded-lg hover:bg-gray-100" 
                      onClick={() => handleDeleteUser(u.id, u.name)}
                    >
                      <Trash2 size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;