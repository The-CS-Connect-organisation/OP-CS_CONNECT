import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, X, Clock, User, StickyNote, ChevronRight, Tag, Pencil, Upload, Plus, FileText } from 'lucide-react';
import { getFromStorage } from '../../../../data/schema';
import { useSound } from '../../../../hooks/useSound';
import { request } from '../../../../utils/apiClient';

const SharedNotes = ({ user, addToast }) => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [annotationText, setAnnotationText] = useState('');
  const [annotations, setAnnotations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', subject: '', description: '' });
  const { playClick, playBlip } = useSound();

  // Fetch notes from backend
  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const data = await request('/school/notes');
      if (data?.success && Array.isArray(data.notes)) {
        setNotes(data.notes);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setNotes([]);
      addToast?.('Failed to load notes. Showing cached data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    const storedAnnotations = getFromStorage('sms_annotations', {});
    setAnnotations(storedAnnotations);
  }, []);

  // Handle note upload
  const handleUpload = async () => {
    if (!uploadForm.title.trim() || !uploadForm.subject.trim()) {
      addToast?.('Please fill in title and subject.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const payload = {
        title: uploadForm.title.trim(),
        subject: uploadForm.subject.trim(),
        description: uploadForm.description.trim(),
      };

      await request('/school/notes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      addToast?.('Note uploaded successfully!', 'success');
      playBlip();
      setShowUploadModal(false);
      setUploadForm({ title: '', subject: '', description: '' });
      fetchNotes();
    } catch (err) {
      console.error('Failed to upload note:', err);
      addToast?.('Failed to upload note. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const subjects = useMemo(() => {
    const unique = [...new Set(notes.map(n => n.subject).filter(Boolean))];
    return ['All', ...unique];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.teacherName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [notes, searchQuery, selectedSubject]);

  const handleAddAnnotation = () => {
    if (!annotationText.trim() || !selectedNote) return;
    const noteId = selectedNote.id || selectedNote.title;
    const updated = {
      ...annotations,
      [noteId]: [
        ...(annotations[noteId] || []),
        {
          text: annotationText,
          author: user?.name || 'Student',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setAnnotations(updated);
    localStorage.setItem('sms_annotations', JSON.stringify(updated));
    setAnnotationText('');
    addToast?.('Annotation added successfully!', 'success');
    playBlip();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getVersionHistory = (note) => {
    return note.versions || note.createdAt
      ? [{ timestamp: note.updatedAt || note.createdAt || new Date().toISOString(), label: 'Created' }]
      : [];
  };

  // Check if user can upload (student, teacher, or admin)
  const canUpload = user?.userType === 'student' || user?.userType === 'teacher' || user?.userType === 'admin';

  return (
    <div className="min-h-screen p-6" style={{ background: '#fafaf8' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 4px 14px rgba(234,88,12,0.3)' }}>
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: '#1c1917' }}>Shared Notes</h1>
              <p className="text-sm" style={{ color: '#a8a29e' }}>Teacher-posted notes and study materials</p>
            </div>
          </div>

          {/* Upload Button */}
          {canUpload && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { playClick(); setShowUploadModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: '#ea580c', color: 'white', boxShadow: '0 4px 14px rgba(234,88,12,0.3)' }}
            >
              <Plus size={16} />
              Upload Note
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#a8a29e' }} />
          <input
            type="text"
            placeholder="Search notes by title, subject, or teacher..."
            value={searchQuery}
            onChange={(e) => { playClick(); setSearchQuery(e.target.value); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              color: '#1c1917',
            }}
          />
        </div>
        <div className="relative">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#a8a29e' }} />
          <select
            value={selectedSubject}
            onChange={(e) => { playClick(); setSelectedSubject(e.target.value); }}
            className="pl-8 pr-8 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
            style={{
              background: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              color: '#1c1917',
            }}
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(234,88,12,0.08)' }}>
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#ea580c' }} />
          </div>
          <p className="text-base font-semibold" style={{ color: '#57534e' }}>Loading notes...</p>
        </motion.div>
      )}

      {/* Notes Grid */}
      {!isLoading && filteredNotes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(234,88,12,0.08)' }}>
            <BookOpen size={28} style={{ color: '#ea580c' }} />
          </div>
          <p className="text-base font-semibold" style={{ color: '#57534e' }}>No notes found</p>
          <p className="text-sm mt-1" style={{ color: '#a8a29e' }}>Try adjusting your search or filter</p>
        </motion.div>
      ) : !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id || index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              onClick={() => { playBlip(); setSelectedNote(note); }}
              className="cursor-pointer rounded-2xl p-5 transition-all duration-200"
              style={{
                background: '#1c1917',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              }}
              whileHover={{
                boxShadow: '0 8px 32px rgba(234,88,12,0.25), 0 0 0 1px rgba(234,88,12,0.4)',
              }}
            >
              {/* Subject badge */}
              {note.subject && (
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3"
                  style={{ background: 'rgba(234,88,12,0.15)', color: '#f97316' }}
                >
                  {note.subject}
                </span>
              )}

              {/* Title */}
              <h3 className="text-base font-bold text-white mb-2 leading-snug line-clamp-2">
                {note.title || 'Untitled Note'}
              </h3>

              {/* Description preview */}
              <p className="text-xs mb-4 line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {note.description || 'No description available'}
              </p>

              {/* Meta info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: '#ea580c', color: 'white' }}>
                    {note.teacherName?.charAt(0) || 'T'}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {note.teacherName || 'Unknown Teacher'}
                  </span>
                </div>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {formatDate(note.date || note.createdAt)}
                </span>
              </div>

              {/* Annotation count indicator */}
              {(annotations[note.id || note.title] || []).length > 0 && (
                <div className="mt-3 pt-3 flex items-center gap-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <StickyNote size={12} style={{ color: '#f97316' }} />
                  <span className="text-[11px]" style={{ color: '#f97316' }}>
                    {(annotations[note.id || note.title] || []).length} annotation{(annotations[note.id || note.title] || []).length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Note Detail Modal */}
      <AnimatePresence>
        {selectedNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl sm:max-h-[85vh] rounded-3xl overflow-hidden z-50 flex flex-col"
              style={{
                background: '#1c1917',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              }}
            >
              {/* Modal Header */}
              <div className="p-6 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {selectedNote.subject && (
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2"
                        style={{ background: 'rgba(234,88,12,0.15)', color: '#f97316' }}
                      >
                        {selectedNote.subject}
                      </span>
                    )}
                    <h2 className="text-xl font-extrabold text-white mb-1">{selectedNote.title}</h2>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <span className="flex items-center gap-1.5">
                        <User size={13} />
                        {selectedNote.teacherName || 'Unknown Teacher'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {formatDate(selectedNote.date || selectedNote.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => { playClick(); setSelectedNote(null); }}
                    className="p-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 max-h-[calc(100vh-160px)]">
                {/* Description */}
                <div className="mb-6">
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {selectedNote.description || 'No description available for this note.'}
                  </p>
                </div>

                {/* Annotations Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#f97316' }}>
                    <StickyNote size={14} />
                    Your Annotations
                  </h4>
                  {(annotations[selectedNote.id || selectedNote.title] || []).length > 0 ? (
                    <div className="space-y-3">
                      {(annotations[selectedNote.id || selectedNote.title] || []).map((ann, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl"
                          style={{ background: 'rgba(234,88,12,0.08)', border: '1px solid rgba(234,88,12,0.15)' }}
                        >
                          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>{ann.text}</p>
                          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {ann.author} &middot; {formatDate(ann.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No annotations yet. Add one below.</p>
                  )}
                </div>

                {/* Version History */}
                <div>
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <Clock size={14} />
                    Version History
                  </h4>
                  {getVersionHistory(selectedNote).length > 0 ? (
                    <div className="space-y-2">
                      {getVersionHistory(selectedNote).map((v, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ea580c' }} />
                          <span>{v.label || 'Version'}: {formatDate(v.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No version history available.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer - Add Annotation */}
              <div className="p-5 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Pencil size={14} style={{ color: '#f97316' }} />
                  <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Add Annotation</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write your annotation..."
                    value={annotationText}
                    onChange={(e) => setAnnotationText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAnnotation()}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                    }}
                  />
                  <button
                    onClick={() => { playClick(); handleAddAnnotation(); }}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{ background: '#ea580c', color: 'white' }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg rounded-3xl overflow-hidden z-50 flex flex-col"
              style={{
                background: '#1c1917',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              }}
            >
              {/* Modal Header */}
              <div className="p-6 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(234,88,12,0.15)' }}>
                      <Upload size={20} style={{ color: '#f97316' }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-white">Upload Note</h2>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Share study materials with others</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { playClick(); setShowUploadModal(false); }}
                    className="p-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body - Upload Form */}
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                {/* Title Field */}
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Title <span style={{ color: '#ea580c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter note title..."
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                    }}
                  />
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Subject <span style={{ color: '#ea580c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics, Physics, History..."
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                    }}
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Description
                  </label>
                  <textarea
                    placeholder="Add a description for your note..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 pt-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex gap-3">
                  <button
                    onClick={() => { playClick(); setShowUploadModal(false); }}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { playClick(); handleUpload(); }}
                    disabled={isUploading}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                    style={{
                      background: isUploading ? 'rgba(234,88,12,0.5)' : '#ea580c',
                      color: 'white',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload Note
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export { SharedNotes as SharedNotes };
export default SharedNotes;