import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { Plus, Search, Filter, Trash2, Edit, Share2, BookOpen, Tag, Calendar, Eye, Download } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isShared: boolean;
  sharedWith?: string[];
}

export default function StudentNotes() {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: '', content: '', subject: 'Math', tags: '' });

  const subjects = ['all', 'Math', 'Science', 'English', 'History', 'Geography', 'Art', 'Physical Education'];

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await api.getNotes();
      setNotes(Array.isArray(data) ? data.filter((n: any) => n.studentId === user?.id || !n.studentId) : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    try {
      if (editingNote) {
        await api.updateNote(editingNote.id, { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
        setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) } : n));
      } else {
        const newNote = await api.createNote({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), studentId: user?.id });
        setNotes(prev => [...prev, newNote]);
      }
      resetForm();
    } catch {
      // error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch {
      // error
    }
  };

  const resetForm = () => {
    setForm({ title: '', content: '', subject: 'Math', tags: '' });
    setShowForm(false);
    setEditingNote(null);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Notes</h1>
          <p className="text-muted-foreground">Organize your study materials</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          {subjects.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">{editingNote ? 'Edit Note' : 'Create Note'}</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            />
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            >
              {subjects.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <textarea
              placeholder="Note content..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-background min-h-[150px]"
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave}>{editingNote ? 'Update' : 'Save'}</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <Card key={note.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{note.title}</h3>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingNote(note); setForm({ title: note.title, content: note.content, subject: note.subject, tags: note.tags.join(', ') }); setShowForm(true); }} className="p-1 hover:bg-accent rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="p-1 hover:bg-red-100 rounded text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{note.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="secondary">{note.subject}</Badge>
                  {note.isShared && <Badge variant="outline"><Share2 className="w-3 h-3 mr-1" />Shared</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
              {note.tags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {note.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {filteredNotes.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
          <p className="text-muted-foreground">Create your first note to get started</p>
        </div>
      )}
    </div>
  );
}
