"use client"

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Edit, Save, X, Camera,
  Shield, Calendar, Globe, Hash
} from 'lucide-react'

export default function AdminProfile() {
  const { user, updateUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
    employeeId: user?.employeeId || '',
    bloodGroup: user?.bloodGroup || '',
    nationality: user?.nationality || '',
    aadharNo: user?.aadharNo || '',
  })

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth || '',
      employeeId: user?.employeeId || '',
      bloodGroup: user?.bloodGroup || '',
      nationality: user?.nationality || '',
      aadharNo: user?.aadharNo || '',
    })
  }, [user])

  const handleSave = async () => {
    updateUser(form)
    if (user?.id) {
      try { await api.updateUserProfile(user.id, form) } catch { console.error('[AdminProfile] Failed to save') }
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
      employeeId: user?.employeeId || '',
      bloodGroup: user?.bloodGroup || '',
      nationality: user?.nationality || '',
      aadharNo: user?.aadharNo || '',
    })
    setEditing(false)
  }

  const handleAvatarSave = async (newAvatarUrl: string) => {
    if (!newAvatarUrl || !user?.id) return
    try {
      await api.updateUser(user.id, { avatar: newAvatarUrl })
      updateUser({ avatar: newAvatarUrl })
      setShowAvatarDialog(false)
    } catch { console.error('[AdminProfile] Failed to update avatar') }
  }

  const handleAvatarUpload = () => {
    const url = prompt('Enter image URL for avatar:')
    if (url) handleAvatarSave(url)
  }

  const field = (label: string, key: string, icon: React.ReactNode, editable = true) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </Label>
      {editing && editable ? (
        <Input
          value={(form as any)[key] || ''}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="h-9"
        />
      ) : (
        <p className="text-sm font-medium">
          {(user as any)?.[key] || <span className="text-muted-foreground/50 italic">Not set</span>}
        </p>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save</Button>
            <Button variant="outline" onClick={handleCancel}><X className="w-4 h-4 mr-2" />Cancel</Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative group">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarUpload}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success" className="capitalize">{user?.role}</Badge>
                {user?.employeeId && <Badge variant="outline">ID: {user.employeeId}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {field('Full Name', 'name', <User className="w-3.5 h-3.5" />)}
            {field('Email Address', 'email', <Mail className="w-3.5 h-3.5" />)}
            {field('Phone Number', 'phone', <Phone className="w-3.5 h-3.5" />)}
            {field('Date of Birth', 'dateOfBirth', <Calendar className="w-3.5 h-3.5" />)}
            {field('Blood Group', 'bloodGroup', <Shield className="w-3.5 h-3.5" />)}
            {field('Nationality', 'nationality', <Globe className="w-3.5 h-3.5" />)}
            {field('Aadhar Number', 'aadharNo', <Hash className="w-3.5 h-3.5" />)}
            {field('Address', 'address', <MapPin className="w-3.5 h-3.5" />)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
