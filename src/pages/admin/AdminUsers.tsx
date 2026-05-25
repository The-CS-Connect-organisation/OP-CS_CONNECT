import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Users, Search, Plus, User, Mail, Phone, Edit, Trash2 } from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'teacher' | 'admin' | 'parent' | 'driver' | 'librarian' | 'manager';
  class?: string;
  status: 'active' | 'inactive';
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

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

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-700';
      case 'teacher': return 'bg-orange-100 text-orange-700';
      case 'admin': return 'bg-red-100 text-red-700';
      case 'parent': return 'bg-green-100 text-green-700';
      case 'driver': return 'bg-purple-100 text-purple-700';
      case 'librarian': return 'bg-yellow-100 text-yellow-700';
      case 'manager': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all users</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Add User</Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
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
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{user.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{user.email}</span>
                      {user.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{user.phone}</span>}
                      {user.class && <span>• Class: {user.class}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  <Badge variant="secondary">{user.status}</Badge>
                  <button className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                  <button className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
