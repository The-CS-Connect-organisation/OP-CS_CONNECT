import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { normalizeAcademicPercentage, formatPercentage } from '@/lib/utils'
import { getAvatarUrl } from '@/lib/avatar'
// import { PeepAvatarMaker } from '@/components/ui/peep-avatar-maker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import {
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera,
  GraduationCap, UserCheck, BookOpen, Award, TrendingUp,
  Home, CreditCard, ClipboardList, Hash, Globe, Flag
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
    admissionNo: user?.admissionNo || '',
    rollNo: user?.rollNo || '',
    bloodGroup: user?.bloodGroup || '',
    aadharNo: user?.aadharNo || '',
    penNo: user?.penNo || '',
    apaarId: user?.apaarId || '',
    religion: user?.religion || '',
    nationality: user?.nationality || '',
    schoolHouse: user?.schoolHouse || '',
    houseLocation: user?.houseLocation || '',
    fatherName: user?.fatherName || '',
    fatherPhone: user?.fatherPhone || '',
    motherName: user?.motherName || '',
    motherPhone: user?.motherPhone || '',
  })

  // Calculate academic percentage and attendance from actual data
  const gpa = normalizeAcademicPercentage(user?.gpa || 0)
  const attendance = user?.attendance || 0

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth || '',
      admissionNo: user?.admissionNo || '',
      rollNo: user?.rollNo || '',
      bloodGroup: user?.bloodGroup || '',
      aadharNo: user?.aadharNo || '',
      penNo: user?.penNo || '',
      apaarId: user?.apaarId || '',
      religion: user?.religion || '',
      nationality: user?.nationality || '',
      schoolHouse: user?.schoolHouse || '',
      houseLocation: user?.houseLocation || '',
      fatherName: user?.fatherName || '',
      fatherPhone: user?.fatherPhone || '',
      motherName: user?.motherName || '',
      motherPhone: user?.motherPhone || '',
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
      admissionNo: user?.admissionNo || '',
      rollNo: user?.rollNo || '',
      bloodGroup: user?.bloodGroup || '',
      aadharNo: user?.aadharNo || '',
      penNo: user?.penNo || '',
      apaarId: user?.apaarId || '',
      religion: user?.religion || '',
      nationality: user?.nationality || '',
      schoolHouse: user?.schoolHouse || '',
      houseLocation: user?.houseLocation || '',
      fatherName: user?.fatherName || '',
      fatherPhone: user?.fatherPhone || '',
      motherName: user?.motherName || '',
      motherPhone: user?.motherPhone || '',
    })
    setEditing(false)
  }

  const handleAvatarSave = async (newAvatarUrl: string) => {
    if (!newAvatarUrl || !user?.id) return
    try {
      await api.updateUser(user.id, { avatar: newAvatarUrl })
      updateUser({ avatar: newAvatarUrl })
      setShowAvatarDialog(false)
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
                <AvatarImage src={getAvatarUrl(user || {})} alt={user?.name} />
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
        <Card><CardContent className="p-4 text-center"><GraduationCap className="w-8 h-8 mx-auto text-orange-500 mb-2" /><p className="text-2xl font-bold">{formatPercentage(gpa)}</p><p className="text-xs text-muted-foreground">Academic %</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><UserCheck className="w-8 h-8 mx-auto text-green-500 mb-2" /><p className="text-2xl font-bold">{attendance}%</p><p className="text-xs text-muted-foreground">Attendance</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><BookOpen className="w-8 h-8 mx-auto text-blue-500 mb-2" /><p className="text-2xl font-bold">{user?.subjects?.length || 0}</p><p className="text-xs text-muted-foreground">Subjects</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Award className="w-8 h-8 mx-auto text-purple-500 mb-2" /><p className="text-2xl font-bold">{user?.feesPaid ? 'Paid' : 'Due'}</p><p className="text-xs text-muted-foreground">Fee Status</p></CardContent></Card>
      </div>

      {/* Personal Info */}
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2"><User className="w-4 h-4 text-orange-500" />Full Name</Label>
                {editing ? <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admissionNo" className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-orange-500" />Admission No</Label>
                {editing ? <Input id="admissionNo" value={form.admissionNo} onChange={e => setForm({ ...form, admissionNo: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.admissionNo || 'Not set'}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNo" className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-orange-500" />Roll No</Label>
                {editing ? <Input id="rollNo" value={form.rollNo} onChange={e => setForm({ ...form, rollNo: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.rollNo || 'Not set'}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500" />Date of Birth</Label>
                {editing ? <Input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address" className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" />Address</Label>
                {editing ? <Input id="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.address || 'Not set'}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="houseLocation" className="flex items-center gap-2"><Home className="w-4 h-4 text-orange-500" />House Location</Label>
                {editing ? <Input id="houseLocation" value={form.houseLocation} onChange={e => setForm({ ...form, houseLocation: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.houseLocation || 'Not set'}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="schoolHouse" className="flex items-center gap-2"><Home className="w-4 h-4 text-orange-500" />School House</Label>
                {editing ? <Input id="schoolHouse" value={form.schoolHouse} onChange={e => setForm({ ...form, schoolHouse: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.schoolHouse || 'Not set'}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup" className="flex items-center gap-2"><Award className="w-4 h-4 text-orange-500" />Blood Group</Label>
                  {editing ? <Input id="bloodGroup" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.bloodGroup || 'Not set'}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadharNo" className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-orange-500" />Aadhar No</Label>
                  {editing ? <Input id="aadharNo" value={form.aadharNo} onChange={e => setForm({ ...form, aadharNo: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.aadharNo || 'Not set'}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-orange-500" />PEN</Label>
                  {editing ? <Input value={form.penNo} onChange={e => setForm({ ...form, penNo: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.penNo || 'Not set'}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apaarId" className="flex items-center gap-2"><Hash className="w-4 h-4 text-orange-500" />Apaar ID</Label>
                  {editing ? <Input id="apaarId" value={form.apaarId} onChange={e => setForm({ ...form, apaarId: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.apaarId || 'Not set'}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="religion" className="flex items-center gap-2"><Globe className="w-4 h-4 text-orange-500" />Religion</Label>
                  {editing ? <Input id="religion" value={form.religion} onChange={e => setForm({ ...form, religion: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.religion || 'Not set'}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality" className="flex items-center gap-2"><Flag className="w-4 h-4 text-orange-500" />Nationality</Label>
                  {editing ? <Input id="nationality" value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.nationality || 'Not set'}</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-background p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Parent / Guardian Info</h3>
                  <Badge variant="secondary">Updated</Badge>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fatherName" className="flex items-center gap-2"><User className="w-4 h-4 text-orange-500" />Father's Name</Label>
                    {editing ? <Input id="fatherName" value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.fatherName || 'Not set'}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherPhone" className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-500" />Father's Phone</Label>
                    {editing ? <Input id="fatherPhone" value={form.fatherPhone} onChange={e => setForm({ ...form, fatherPhone: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.fatherPhone || 'Not set'}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherName" className="flex items-center gap-2"><User className="w-4 h-4 text-orange-500" />Mother's Name</Label>
                    {editing ? <Input id="motherName" value={form.motherName} onChange={e => setForm({ ...form, motherName: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.motherName || 'Not set'}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherPhone" className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-500" />Mother's Phone</Label>
                    {editing ? <Input id="motherPhone" value={form.motherPhone} onChange={e => setForm({ ...form, motherPhone: e.target.value })} /> : <p className="text-sm text-muted-foreground">{user?.motherPhone || 'Not set'}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avatar Dialog */}
      {/* <PeepAvatarMaker
        open={showAvatarDialog}
        onOpenChange={setShowAvatarDialog}
        onSave={handleAvatarSave}
        initialAvatar={user?.avatar}
      /> */}
    </div>
  )
}