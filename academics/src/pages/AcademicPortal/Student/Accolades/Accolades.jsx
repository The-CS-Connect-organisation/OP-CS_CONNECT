import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Flame, Target, Award, Clock, Image as ImageIcon,
  Send, CheckCircle, Upload, X, ChevronDown, Bookmark, Sparkles,
  Zap, Medal, Crown, ExternalLink, FileText
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { cloudinaryService } from '../../../../services/cloudinaryService';
import { studentApi, apiUtils } from '../../../../services/apiDataLayer';
import { useSound } from '../../../../hooks/useSound';

const STORAGE_KEY = 'sms_accolades';
const CATEGORIES = [
  { id: 'Academic', label: 'Academic', color: '#3b82f6', icon: Star },
  { id: 'Sports', label: 'Sports', color: '#22c55e', icon: Trophy },
  { id: 'Cultural', label: 'Cultural', color: '#a855f7', icon: Sparkles },
  { id: 'Leadership', label: 'Leadership', color: '#f59e0b', icon: Crown },
  { id: 'Other', label: 'Other', color: '#6b7280', icon: Medal },
];

const STATUS_COLORS = {
  pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
  approved: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
  rejected: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
};

const AvatarCircle = ({ name, avatar, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const initial = (name || '?')[0]?.toUpperCase();
  const colors = ['#ea580c', '#f97316', '#fb923c', '#7c3aed', '#3b82f6'];
  const colorIndex = (name || '').charCodeAt(0) % colors.length;
  return avatar ? (
    <img src={avatar} alt={name} className={`${sizeClass} rounded-full object-cover`} />
  ) : (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold`}
      style={{ background: colors[colorIndex] + '33', color: colors[colorIndex], border: `1px solid ${colors[colorIndex]}55` }}>
      {initial}
    </div>
  );
};

const CategoryBadge = ({ category }) => {
  const cat = CATEGORIES.find(c => c.id === category) || CATEGORIES[4];
  const Icon = cat.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{
        background: cat.color + '22',
        color: cat.color,
        border: `1px solid ${cat.color}44`,
      }}
    >
      <Icon size={11} />
      {cat.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold capitalize"
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
    >
      {status === 'pending' && <Clock size={10} />}
      {status === 'approved' && <CheckCircle size={10} />}
      {status === 'rejected' && <X size={10} />}
      {status}
    </span>
  );
};

export const Accolades = ({ user }) => {
  const { playClick, playBlip } = useSound();
  const [showForm, setShowForm] = useState(false);
  const [accolades, setAccolades] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Academic',
    dateAchieved: new Date().toISOString().split('T')[0],
    photoUrl: '',
    attachmentLink: '',
  });

  // Load accolades from backend
  const loadAccolades = useCallback(async () => {
    try {
      const res = await studentApi.getAchievements();
      if (res?.success && Array.isArray(res.data)) {
        const backendAccolades = [...res.data];
        // Sort by date
        backendAccolades.sort((a, b) => new Date(b.dateAchieved || b.createdAt) - new Date(a.dateAchieved || a.createdAt));
        setAccolades(backendAccolades);
      }
    } catch (e) {
      console.error('[Accolades] Failed to fetch accolades:', e);
      setAccolades([]);
    }
  }, []);

  useEffect(() => {
    loadAccolades();
  }, [loadAccolades]);

  // Filter to only show current user's accolades
  const myAccolades = accolades.filter(a => a.studentId === user?.id || a.authorId === user?.id);

  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!cloudinaryService.isValidImage(file)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    setUploading(true);
    try {
      const url = await cloudinaryService.uploadImage(file, 'sms_accolades');
      setForm(prev => ({ ...prev, photoUrl: url }));
    } catch (err) {
      // Fallback: use data URL
      const reader = new FileReader();
      reader.onload = () => {
        setForm(prev => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter an achievement title');
      return;
    }

    playBlip();

    const newAccolade = {
      id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      studentId: user?.id,
      authorId: user?.id,
      studentName: user?.name || 'Unknown',
      studentAvatar: user?.avatar || null,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      dateAchieved: form.dateAchieved,
      photoUrl: form.photoUrl || '',
      attachmentLink: form.attachmentLink || '',
      status: 'pending', // Admin approval required
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Try backend
    try {
      const res = await studentApi.createAchievement(newAccolade);
      if (!res?.success) throw new Error('Backend failed');
    } catch (e) {
      console.error('[Accolades] Failed to save accolade:', e);
      alert('Failed to save achievement. Please try again.');
      return;
    }

    // Reset form
    setForm({
      title: '',
      description: '',
      category: 'Academic',
      dateAchieved: new Date().toISOString().split('T')[0],
      photoUrl: '',
      attachmentLink: '',
    });
    setShowForm(false);
    loadAccolades();

    alert('Achievement submitted! It will appear on the wall after admin approval.');
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{
        background: 'linear-gradient(135deg, #09090b 0%, #111113 50%, #0c0c10 100%)',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap');
        .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,215,0,0.15);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,215,0,0.05);
        }
        .gold-glow {
          box-shadow: 0 0 24px rgba(234,179,8,0.3), 0 0 48px rgba(234,179,8,0.1);
        }
        @keyframes gold-pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(234,179,8,0.4); }
          50% { box-shadow: 0 0 28px rgba(234,179,8,0.7); }
        }
        .pulse-gold { animation: gold-pulse 2.5s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #d97706; border-radius: 3px; }
      `}</style>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                boxShadow: '0 0 24px rgba(217,119,6,0.5)',
              }}
            >
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#fafafa' }}>My Accolades</h1>
              <p className="text-sm mt-0.5" style={{ color: '#78716c' }}>Share your achievements with the school</p>
            </div>
          </div>
          <Button
            onClick={() => { playBlip(); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{
              background: showForm ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg, #d97706, #f59e0b)',
              color: showForm ? '#ef4444' : '#fff',
              border: showForm ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,215,0,0.3)',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {showForm ? <><X size={16} /> Cancel</> : <><Sparkles size={16} /> Post Achievement</>}
          </Button>
        </motion.div>

        {/* Post Achievement Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: '#fbbf24' }}>
                    <Award size={20} />
                    Post New Achievement
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>
                        Achievement Title *
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Won 1st place in State Math Olympiad"
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(234,179,8,0.2)',
                          color: '#fafafa',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(234,179,8,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(234,179,8,0.2)'}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>
                        Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Describe your achievement in detail..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(234,179,8,0.2)',
                          color: '#fafafa',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(234,179,8,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(234,179,8,0.2)'}
                      />
                    </div>

                    {/* Category + Date Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>
                          Category
                        </label>
                        <div className="relative">
                          <select
                            value={form.category}
                            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                            style={{
                              background: 'rgba(0,0,0,0.4)',
                              border: '1px solid rgba(234,179,8,0.2)',
                              color: '#fafafa',
                            }}
                          >
                            {CATEGORIES.map(c => (
                              <option key={c.id} value={c.id} style={{ background: '#1c1917' }}>{c.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#78716c' }} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>
                          Date Achieved
                        </label>
                        <input
                          type="date"
                          value={form.dateAchieved}
                          onChange={e => setForm(p => ({ ...p, dateAchieved: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={{
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid rgba(234,179,8,0.2)',
                            color: '#fafafa',
                          }}
                        />
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>
                        Photo Upload
                      </label>
                      <div
                        className="relative rounded-xl overflow-hidden flex items-center justify-center cursor-pointer transition-all"
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px dashed rgba(234,179,8,0.3)',
                          minHeight: '100px',
                        }}
                      >
                        {form.photoUrl ? (
                          <div className="relative w-full">
                            <img src={form.photoUrl} alt="Preview" className="w-full h-40 object-cover" />
                            <button
                              type="button"
                              onClick={() => setForm(p => ({ ...p, photoUrl: '' }))}
                              className="absolute top-2 right-2 p-1.5 rounded-full"
                              style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center gap-2 py-6 cursor-pointer w-full">
                            {uploading ? (
                              <>
                                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs" style={{ color: '#78716c' }}>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={20} style={{ color: '#d97706' }} />
                                <span className="text-xs font-medium" style={{ color: '#a8a29e' }}>
                                  Click to upload photo
                                </span>
                                <span className="text-[10px]" style={{ color: '#525252' }}>JPEG, PNG, GIF, WebP</span>
                              </>
                            )}
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Attachment Link */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#a8a29e' }}>
                        Attachment Link (Optional)
                      </label>
                      <div className="relative">
                        <ExternalLink size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#78716c' }} />
                        <input
                          type="url"
                          value={form.attachmentLink}
                          onChange={e => setForm(p => ({ ...p, attachmentLink: e.target.value }))}
                          placeholder="https://..."
                          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                          style={{
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid rgba(234,179,8,0.2)',
                            color: '#fafafa',
                          }}
                          onFocus={e => e.target.style.borderColor = 'rgba(234,179,8,0.5)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(234,179,8,0.2)'}
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
                        style={{
                          background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                          color: '#fff',
                          border: '1px solid rgba(255,215,0,0.3)',
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={uploading}
                      >
                        <Send size={15} />
                        Submit for Review
                      </Button>
                      <span className="text-xs" style={{ color: '#525252' }}>
                        Will appear on the wall after admin approval
                      </span>
                    </div>
                  </form>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Accolades List */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Medal size={18} style={{ color: '#d97706' }} />
            <h2 className="text-lg font-bold" style={{ color: '#fafafa' }}>My Achievements</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(234,179,8,0.15)', color: '#d97706' }}>
              {myAccolades.length}
            </span>
          </div>

          {myAccolades.length === 0 ? (
            <Card className="glass-card p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <Trophy size={28} style={{ color: '#d97706' }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: '#fafafa' }}>No Accolades Yet</h3>
              <p className="text-sm mb-4" style={{ color: '#525252' }}>Share your first achievement with the school community!</p>
              <Button
                onClick={() => { playBlip(); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                  color: '#fff',
                }}
              >
                <Sparkles size={14} />
                Post First Achievement
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {myAccolades.map((acc, i) => (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="glass-card p-5 transition-all" style={{}}>
                    <div className="flex items-start gap-4">
                      {acc.photoUrl && (
                        <img
                          src={acc.photoUrl}
                          alt={acc.title}
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base mb-1" style={{ color: '#fafafa' }}>{acc.title}</h4>
                            {acc.description && (
                              <p className="text-sm mb-2" style={{ color: '#71717a' }}>{acc.description}</p>
                            )}
                          </div>
                          <StatusBadge status={acc.status} />
                        </div>
                        <div className="flex items-center gap-3 flex-wrap mt-2">
                          <CategoryBadge category={acc.category} />
                          <span className="text-xs flex items-center gap-1" style={{ color: '#525252' }}>
                            <Clock size={10} />
                            {new Date(acc.dateAchieved || acc.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                          {acc.attachmentLink && (
                            <a
                              href={acc.attachmentLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1 hover:underline"
                              style={{ color: '#d97706' }}
                            >
                              <ExternalLink size={10} />
                              View Attachment
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Accolades;