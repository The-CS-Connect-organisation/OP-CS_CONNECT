import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import {
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera,
  GraduationCap, UserCheck, BookOpen, Award, TrendingUp
} from 'lucide-react'

export default function StudentProfile() {
  const { user, updateUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
  })

  // Calculate GPA and attendance from actual data
  const gpa = user?.gpa || 0
  const attendance = user?.attendance || 0

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth || '',
    })
  }, [user])

  const handleSave = async () => {
    updateUser(form)
    if (user?.id) {
      try { await api.updateUserProfile(user.id, form) } catch { /* error */ }
    }
    setEditing(false)
  }

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth || '',
    })
    setEditing(false)
  }

  const handleAvatarSave = async () => {
    if (!avatarUrl.trim() || !user?.id) return
    try {
      await api.updateUserAvatar(user.id, avatarUrl)
      updateUser({ avatar: avatarUrl })
      setShowAvatarDialog(false)
      setAvatarUrl('')
    } catch { /* error */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Your personal information</p>
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

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative group">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.avatar || ''} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button onClick={() => setShowAvatarDialog(true)} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 capitalize">{user?.role}</Badge>
                <Badge variant="secondary">Class {user?.class}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><GraduationCap className="w-8 h-8 mx-auto text-orange-500 mb-2" /><p className="text-2xl font-bold">{gpa.toFixed(1)}</p><p className="text-xs text-muted-foreground">GPA</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><UserCheck className="w-8 h-8 mx-auto text-green-500 mb-2" /><p className="text-2xl font-bold">{attendance}%</p><p className="text-xs text-muted-foreground">Attendance</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><BookOpen className="w-8 h-8 mx-auto text-blue-500 mb-2" /><p className="text-2xl font-bold">{user?.subjects?.length || 0}</p><p className="text-xs text-muted-foreground">Subjects</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Award className="w-8 h-8 mx-auto text-purple-500 mb-2" /><p className="text-2xl font-bold">{user?.feesPaid ? 'Paid' : 'Due'}</p><p className="text-xs text-muted-foreground">Fee Status</p></CardContent></Card>
      </div>

      {/* Personal Info */}
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><User className="w-4 h-4 text-orange-500" />Full Name</Label>
              {editing ? <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.name}</p>}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Mail className="w-4 h-4 text-orange-500" />Email</Label>
              {editing ? <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.email}</p>}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-500" />Phone</Label>
              {editing ? <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.phone || 'Not set'}</p>}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500" />Date of Birth</Label>
              {editing ? <Input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" />Address</Label>
              {editing ? <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.address || 'Not set'}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avatar Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Profile Picture</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl || user?.avatar || ''} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://example.com/photo.jpg" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvatarDialog(false)}>Cancel</Button>
            <Button onClick={handleAvatarSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
