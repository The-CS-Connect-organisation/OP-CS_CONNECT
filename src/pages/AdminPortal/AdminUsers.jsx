import { useState, useEffect } from 'react';
import { Users, Search, Filter, Plus, Edit2, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { CreateAccount } from './CreateAccount';
import { apiRequest } from '../../services/apiClient';

const PAGE_SIZE = 10;

const AdminUsers = ({ user, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/school/users');
      const userList = res?.items ?? res?.users ?? [];
      setUsers(userList);
      setTotal(userList.length);
      setTotalPages(Math.ceil(userList.length / PAGE_SIZE));
      setPage(1);
    } catch (err) {
      console.error('Failed to load users:', err);
      addToast?.('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
    addToast?.('Users refreshed', 'success');
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (u.name || '').toLowerCase().includes(term) ||
                          (u.email || '').toLowerCase().includes(term) ||
                          (u.role || '').toLowerCase().includes(term);
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (showCreateAccount) {
    return (
      <div className="p-6">
        <CreateAccount
          user={user}
          addToast={addToast}
          onCancel={() => setShowCreateAccount(false)}
          onCreated={() => {
            setShowCreateAccount(false);
            fetchUsers();
            addToast?.('Account created successfully', 'success');
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>User Management</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading...' : `${total} total users`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border text-sm hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'var(--border-color)' }}
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreateAccount(true)}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: 'var(--primary)' }}>
            <Plus size={16} /> Create Account
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm"
            style={{ borderColor: 'var(--border-color)' }}
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => { setSelectedRole(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border text-sm"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="parent">Parents</option>
          <option value="admin">Admin</option>
          <option value="driver">Driver</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-14 rounded-xl bg-gray-50 animate-pulse" />
            ))}
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="py-16 flex flex-col items-center">
            <Users size={40} style={{ color: 'var(--text-muted)' }} className="mb-3 opacity-40" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {searchTerm || selectedRole !== 'all' ? 'No users match your filters' : 'No users found'}
            </p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50/50 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{u.email || '—'}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{u.phone || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        u.role === 'student' ? 'bg-blue-100 text-blue-700' :
                        u.role === 'teacher' ? 'bg-green-100 text-green-700' :
                        u.role === 'parent' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'admin' ? 'bg-red-100 text-red-700' :
                        u.role === 'driver' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => addToast?.('Edit user — coming soon', 'info')}>
                          <Edit2 size={15} style={{ color: 'var(--text-muted)' }} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => addToast?.('Delete user — coming soon', 'warning')}>
                          <Trash2 size={15} style={{ color: 'var(--text-muted)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-orange-500 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;