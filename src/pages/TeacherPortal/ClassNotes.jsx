import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Search, Star, Trash2, Share2, Loader2 } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

/**
 * @component ClassNotes
 * @description Class notes organization with real backend CRUD operations
 * @param {Object} user - Current user object
 * @param {string} classId - Selected class ID
 * @param {Function} addToast - Toast notification function
 */

const CATEGORIES = [
  { id: 'all', label: 'All Notes' },
  { id: 'lesson-plans', label: 'Lesson Plans' },
  { id: 'handouts', label: 'Handouts' },
  { id: 'assessments', label: 'Assessments' },
  { id: 'reference', label: 'Reference Materials' },
];

const CLASSES = ['10-A', '10-B', '11-A', '11-B'];

const NoteCard = ({ note, onShare, onDelete, onToggleFavorite }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="nova-card p-4 hover:shadow-md transition-all"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900">{note.title}</h4>
        <p className="text-xs text-gray-500 mt-1">{note.category}</p>
      </div>
      <button
        onClick={() => onToggleFavorite(note._id ?? note.id)}
        className={`p-1.5 rounded-lg transition-all ${note.favorite ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}
      >
        <Star size={16} fill={note.favorite ? 'currentColor' : 'none'} />
      </button>
    </div>

    {note.tags?.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-3">
        {note.tags.map(tag => (
          <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-600">#{tag}</span>
        ))}
      </div>
    )}

    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{note.content}</p>

    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-3">
      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
      {note.template && <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-600 font-semibold">Template</span>}
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => onShare(note._id ?? note.id)}
        className="flex-1 px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-all flex items-center justify-center gap-1"
      >
        <Share2 size={12} /> Share
      </button>
      <button
        onClick={() => onDelete(note._id ?? note.id)}
        className="flex-1 px-2 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-all flex items-center justify-center gap-1"
      >
        <Trash2 size={12} /> Delete
      </button>
    </div>
  </motion.div>
);

export const ClassNotes = ({ user, classId: propClassId, addToast }) => {
  const [classId, setClassId] = useState(propClassId || '10-A');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'lesson-plans', tags: [], template: false });

  const loadNotes = async (cid) => {
    try {
      setLoading(true);
      const res = await teacherApi.getNotes(cid);
      const d = res?.data?.data ?? res?.data ?? [];
      setNotes(Array.isArray(d) ? d : d.notes ?? []);
    } catch (err) {
      addToast?.('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes(classId);
  }, [classId]);

  const filteredNotes = useMemo(() => {
    let list = notes;
    if (selectedCategory !== 'all') list = list.filter(n => n.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [notes, selectedCategory, searchQuery]);

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    try {
      setCreating(true);
      const res = await teacherApi.createNote(classId, newNote);
      const created = res?.data?.data ?? res?.data ?? {};
      setNotes(prev => [{ ...newNote, _id: created._id ?? `note-${Date.now()}`, createdAt: new Date().toISOString(), favorite: false, ...created }, ...prev]);
      setNewNote({ title: '', content: '', category: 'lesson-plans', tags: [], template: false });
      setShowCreateModal(false);
      addToast?.('Note created successfully', 'success');
    } catch (err) {
      addToast?.(err?.message || 'Failed to create note', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await teacherApi.deleteNote(noteId);
      setNotes(prev => prev.filter(n => (n._id ?? n.id) !== noteId));
      addToast?.('Note deleted', 'success');
    } catch (err) {
      addToast?.('Failed to delete note', 'error');
    }
  };

  const handleToggleFavorite = async (noteId) => {
    const note = notes.find(n => (n._id ?? n.id) === noteId);
    if (!note) return;
    try {
      await teacherApi.updateNote(noteId, { favorite: !note.favorite });
      setNotes(prev => prev.map(n => (n._id ?? n.id) === noteId ? { ...n, favorite: !n.favorite } : n));
    } catch {
      // silently fail
    }
  };

  const handleShare = (noteId) => {
    const link = `${window.location.origin}/share/note/${noteId}`;
    navigator.clipboard.writeText(link);
    addToast?.('Share link copied to clipboard', 'success');
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen size={32} className="text-indigo-500" />
            Class Notes
          </h1>
          <p className="text-sm text-gray-500 mt-1">Organize and manage teaching materials</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)} className="rounded-xl">New Note</Button>
      </motion.div>

      {/* Class Selector */}
      {!propClassId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="nova-card p-4 flex items-center gap-3">
          <BookOpen size={18} className="text-gray-400" />
          <select value={classId} onChange={e => setClassId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500">
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </motion.div>
      )}

      {/* Search and Filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notes by title, content, or tags..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notes Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600">
          {selectedCategory === 'all' ? 'All Notes' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
          <span className="text-gray-400 ml-2">({filteredNotes.length})</span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="py-12 text-center border border-dashed rounded-xl border-gray-200">
            <BookOpen size={40} className="mx-auto mb-4 text-gray-200" />
            <p className="text-sm text-gray-500">No notes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredNotes.map(note => (
                <NoteCard key={note._id ?? note.id} note={note} onShare={handleShare} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Create Note Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Note" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Title</label>
            <input type="text" value={newNote.title} onChange={e => setNewNote(p => ({ ...p, title: e.target.value }))} placeholder="Note title..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Category</label>
            <select value={newNote.category} onChange={e => setNewNote(p => ({ ...p, category: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
              {CATEGORIES.slice(1).map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Content</label>
            <textarea value={newNote.content} onChange={e => setNewNote(p => ({ ...p, content: e.target.value }))} placeholder="Note content..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" rows="6" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Tags (comma-separated)</label>
            <input type="text" value={newNote.tags.join(', ')} onChange={e => setNewNote(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} placeholder="e.g., algebra, chapter-5, important" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newNote.template} onChange={e => setNewNote(p => ({ ...p, template: e.target.checked }))} className="w-4 h-4 rounded border-gray-300" />
            <span className="text-sm text-gray-600">Mark as template for reuse</span>
          </label>
          <div className="flex gap-2 pt-4">
            <Button variant="primary" onClick={handleCreateNote} disabled={creating} className="flex-1 rounded-lg">
              {creating ? 'Creating...' : 'Create Note'}
            </Button>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-lg">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
