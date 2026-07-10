import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Check, X, Loader2, Search, ShieldCheck, Lock, Eye, EyeOff, Sparkles, Phone } from 'lucide-react';

interface ChildInfo {
  id: string; name: string; class: string; email: string; rollNo?: string;
  fatherId?: string | null; motherId?: string | null;
}

interface AvailableStudent {
  id: string; name: string; email: string; class: string; rollNo?: string;
  fatherId: string | null; motherId: string | null; alreadyLinked: boolean;
}

export default function ParentMyChildren() {
  const { user, updateUser } = useAuthStore();
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [parentType, setParentType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [students, setStudents] = useState<AvailableStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AvailableStudent | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [detectedStudents, setDetectedStudents] = useState<any[]>([]);
  const [showDetectModal, setShowDetectModal] = useState(false);
  const [autoPhone, setAutoPhone] = useState(user?.phone || '');
  const [detectError, setDetectError] = useState('');
  const [linkingStudent, setLinkingStudent] = useState<any | null>(null);
  const [linkPass, setLinkPass] = useState('');
  const [showLinkPass, setShowLinkPass] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkMsg, setLinkMsg] = useState('');

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const res = await api.getChildren();
      if (res?.success) {
        setChildren(res.children || []);
        setParentType(res.parentType || null);
      }
    } catch (err) {
      console.error('[MyChildren] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = async () => {
    setShowAddModal(true);
    setSelectedStudent(null);
    setPassword('');
    setLinkError('');
    setLinkSuccess('');
    setSearchQuery('');
    setStudentsLoading(true);
    try {
      const res = await api.getAvailableStudents();
      if (res?.success) setStudents(res.students || []);
    } catch (err) {
      console.error('[MyChildren] Failed to load students:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedStudent || !password) return;
    setLinking(true);
    setLinkError('');
    setLinkSuccess('');
    try {
      const res = await api.linkChild(selectedStudent.email, password);
      if (res?.success) {
        setLinkSuccess(`Successfully connected to ${selectedStudent.name}!`);
        setPassword('');
        setSelectedStudent(null);
        loadChildren();
        setTimeout(() => {
          setShowAddModal(false);
          setLinkSuccess('');
        }, 2000);
      }
    } catch (err: any) {
      setLinkError(err?.message || 'Failed to link child');
    } finally {
      setLinking(false);
    }
  };

  const slotStatus = (s: AvailableStudent) => {
    const myId = user?.id;
    const fatherFilled = !!s.fatherId;
    const motherFilled = !!s.motherId;
    const isFather = s.fatherId === myId;
    const isMother = s.motherId === myId;

    if (parentType === 'father') {
      if (isFather) return { available: false, reason: 'Already your child', color: 'text-emerald-500' };
      if (fatherFilled) return { available: false, reason: 'Father slot taken', color: 'text-red-400' };
      if (motherFilled && s.motherId !== myId && !s.alreadyLinked) return { available: true, reason: '' };
    }
    if (parentType === 'mother') {
      if (isMother) return { available: false, reason: 'Already your child', color: 'text-emerald-500' };
      if (motherFilled) return { available: false, reason: 'Mother slot taken', color: 'text-red-400' };
      if (fatherFilled && s.fatherId !== myId && !s.alreadyLinked) return { available: true, reason: '' };
    }
    if (fatherFilled && motherFilled) return { available: false, reason: 'Both parents connected', color: 'text-gray-400' };
    if (s.alreadyLinked) return { available: false, reason: 'Already your child', color: 'text-emerald-500' };
    return { available: true, reason: '' };
  };

  const filteredStudents = students.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Children</h1>
          <p className="text-muted-foreground text-sm">Manage your connected children</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="tel" value={autoPhone} onChange={e => setAutoPhone(e.target.value)}
              placeholder="Your phone number"
              className="w-44 pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
          <button onClick={async () => {
            const phone = autoPhone?.trim()
            if (!phone) { alert('Enter your phone number first'); return }
            setAutoDetecting(true)
            setDetectError('')
            try {
              const all = await api.getUsers({ role: 'student' })
              const students = Array.isArray(all) ? all : []
              const parentPhoneField = parentType === 'father' ? 'fatherPhone' : 'motherPhone'
              const myChildrenIds = new Set(children.map(c => c.id))
              const matched = students.filter((s: any) =>
                s[parentPhoneField] && s[parentPhoneField].trim().toLowerCase() === phone.toLowerCase()
              ).map((s: any) => ({
                ...s,
                _alreadyLinked: myChildrenIds.has(s.id),
                _slotTaken: parentType === 'father' ? !!s.fatherId : !!s.motherId,
              }))
              setDetectedStudents(matched)
              setShowDetectModal(true)
            } catch (e: any) {
              setDetectError(e?.message || 'Auto-detect failed')
            } finally {
              setAutoDetecting(false)
            }
          }} disabled={autoDetecting} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50">
            {autoDetecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Auto Detect
          </button>
          <button onClick={openAddModal} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:shadow-xl active:scale-95 transition-all">
            <UserPlus className="w-4 h-4" />
            Add Child
          </button>
        </div>
      </div>

      {parentType && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-sm">
          <ShieldCheck className="w-4 h-4 text-orange-500" />
          <span>You are connected as: <strong className="capitalize">{parentType}</strong></span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <Card key={i} className="p-4"><div className="h-20 bg-muted animate-pulse rounded-lg" /></Card>)}
        </div>
      ) : children.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No Children Connected</h3>
          <p className="text-muted-foreground text-sm mb-6">Click "Add Child" to connect your child's account</p>
          <button onClick={openAddModal} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:shadow-xl active:scale-95 transition-all">
            <UserPlus className="w-4 h-4" />
            Add Child
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map(child => (
            <Card key={child.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                    {child.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{child.name}</h3>
                    <p className="text-xs text-muted-foreground">Class {child.class} • Roll No: {child.rollNo || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{child.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {child.fatherId === user?.id ? (
                  <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                    {child.name.split(' ')[0]}'s Father
                  </Badge>
                ) : (
                  <Badge className={child.fatherId ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}>
                    Father: {child.fatherId ? 'Connected' : 'Open'}
                  </Badge>
                )}
                {child.motherId === user?.id ? (
                  <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                    {child.name.split(' ')[0]}'s Mother
                  </Badge>
                ) : (
                  <Badge className={child.motherId ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}>
                    Mother: {child.motherId ? 'Connected' : 'Open'}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Child Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-2xl max-h-[85vh] rounded-2xl border bg-card shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-lg font-bold">Connect a Child</h2>
                  <p className="text-xs text-muted-foreground">Search for a student and verify with their password</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-accent transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 rounded-xl bg-accent/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">No students found</div>
                ) : filteredStudents.map(s => {
                  const status = slotStatus(s);
                  const isSelected = selectedStudent?.id === s.id;
                  const canSelect = status.available && !s.alreadyLinked;

                  return (
                    <div key={s.id} className={`p-3 rounded-xl border transition-all ${isSelected ? 'border-orange-500/50 bg-orange-500/5' : status.reason && !canSelect ? 'border-gray-200 dark:border-gray-800 opacity-60' : 'border-border hover:border-orange-500/30 cursor-pointer'}`}
                      onClick={() => canSelect && setSelectedStudent(s)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${canSelect ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          {s.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.email} • Class {s.class}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {s.alreadyLinked || isSelected ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                              <Check className="w-3 h-3 mr-1" /> Already connected
                            </Badge>
                          ) : status.reason ? (
                            <Badge className={status.reason.includes('taken') ? 'bg-red-500/10 text-red-500 border-red-500/20 text-[10px]' : 'bg-gray-500/10 text-gray-500 border-gray-500/20 text-[10px]'}>
                              {status.reason}
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px]">Available</Badge>
                          )}
                        </div>
                      </div>

                      {/* Connection slot indicators */}
                      <div className="flex gap-2 mt-2 ml-12">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.fatherId ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}`}>
                          Father {s.fatherId ? '✓' : '○'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.motherId ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}`}>
                          Mother {s.motherId ? '✓' : '○'}
                        </span>
                      </div>

                      {/* Password input for selected student */}
                      {isSelected && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 ml-12 pt-3 border-t space-y-3">
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={`Enter ${s.name}'s password to verify`} className="w-full pl-10 pr-10 py-2 rounded-xl bg-accent/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" onKeyDown={e => e.key === 'Enter' && handleLink()} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {linkError && <p className="text-xs text-red-500">{linkError}</p>}
                          {linkSuccess && <p className="text-xs text-emerald-500">{linkSuccess}</p>}
                          <button onClick={handleLink} disabled={!password || linking} className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                            {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            {linking ? 'Connecting...' : 'Connect as ' + (parentType || '')}
                          </button>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto Detect Result Modal */}
      <AnimatePresence>
        {showDetectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg max-h-[85vh] rounded-2xl border bg-card shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-lg font-bold">Matching Profiles</h2>
                  <p className="text-xs text-muted-foreground">Students with the same phone number on record</p>
                </div>
                <button onClick={() => { setShowDetectModal(false); setDetectError('') }} className="p-1 rounded-lg hover:bg-accent"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {detectError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 text-sm">{detectError}</div>
                )}
                {detectedStudents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No matching profiles</p>
                    <p className="text-xs mt-1">No students have this {parentType === 'father' ? "father's" : "mother's"} phone number on record</p>
                  </div>
                ) : (
                  detectedStudents.map(s => {
                    const alreadyLinked = s._alreadyLinked
                    const slotTaken = s._slotTaken && !alreadyLinked
                    return (
                      <div key={s.id} className="p-4 rounded-xl border border-border/50 bg-card">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {s.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                              <p className="text-xs text-muted-foreground">Class {s.class || 'N/A'} • {s.email}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {parentType === 'father' ? 'Father' : 'Mother'}: {s.fatherName || s.motherName || 'N/A'} ({s.fatherPhone || s.motherPhone || autoPhone})
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {alreadyLinked ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                <Check className="w-3 h-3 mr-1" /> Connected
                              </Badge>
                            ) : slotTaken ? (
                              <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Slot Taken</Badge>
                            ) : (
                              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                                onClick={async () => {
                                  setLinkLoading(true)
                                  try {
                                    const res = await api.autoLinkParent(user!.id, autoPhone, parentType!, s.id)
                                    if (res?.success) {
                                      loadChildren()
                                      setDetectedStudents((prev: any[]) => prev.map(p => p.id === s.id ? { ...p, _alreadyLinked: true } : p))
                                    }
                                  } catch (err: any) {
                                    alert(err?.message || 'Failed to connect')
                                  } finally {
                                    setLinkLoading(false)
                                  }
                                }}
                                disabled={linkLoading}
                              >
                                {linkLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <UserPlus className="w-3 h-3 mr-1" />}
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              {detectedStudents.length > 0 && (
                <div className="p-4 border-t text-center">
                  <Button variant="outline" onClick={() => { setShowDetectModal(false); setDetectError('') }}>Close</Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}