import { useState } from 'react';
import { useAuthStore } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, Mail, Phone, MapPin, Edit, Save, X, Users, Camera } from 'lucide-react';
import { PeepAvatarMaker } from '@/components/ui/peep-avatar-maker';
import { getAvatarUrl } from '@/lib/avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';

export default function ParentProfile() {
  const { user, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSave = () => {
    updateUser(form);
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: user?.address || '' });
    setEditing(false);
  };

  const handleAvatarSave = async (newAvatarUrl: string) => {
    if (!newAvatarUrl || !user?.id) return;
    try {
      updateUser({ avatar: newAvatarUrl });
      setShowAvatarDialog(false);
    } catch { /* error */ }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Your account settings</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)}><Edit className="w-4 h-4 mr-2" />Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save</Button>
            <Button variant="outline" onClick={handleCancel}><X className="w-4 h-4 mr-2" />Cancel</Button>
          </div>
        )}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            <Avatar className="w-20 h-20">
              <AvatarImage src={getAvatarUrl(user || {})} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button onClick={() => setShowAvatarDialog(true)} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <Badge className="bg-orange-100 text-orange-700">{user?.role}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><User className="w-4 h-4 text-orange-500" />Full Name</label>
            {editing ? <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background" /> : <p className="text-muted-foreground">{user?.name}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-orange-500" />Email</label>
            {editing ? <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background" /> : <p className="text-muted-foreground">{user?.email}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-orange-500" />Phone</label>
            {editing ? <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background" /> : <p className="text-muted-foreground">{user?.phone || 'Not set'}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" />Address</label>
            {editing ? <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background" /> : <p className="text-muted-foreground">{user?.address || 'Not set'}</p>}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Children</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-accent rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-orange-500" />
              <div>
                <p className="font-medium">Child 1</p>
                <p className="text-sm text-muted-foreground">Class 10-A</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-accent rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-orange-500" />
              <div>
                <p className="font-medium">Child 2</p>
                <p className="text-sm text-muted-foreground">Class 8-B</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <PeepAvatarMaker
        open={showAvatarDialog}
        onOpenChange={setShowAvatarDialog}
        onSave={handleAvatarSave}
        initialAvatar={user?.avatar}
      />
    </div>
  );
}
