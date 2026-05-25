import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { BookOpen, User, Calendar, ThumbsUp, MessageSquare, Share } from 'lucide-react';

interface SharedNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  authorName: string;
  authorId: string;
  createdAt: string;
  likes: number;
  comments: number;
  tags: string[];
}

export default function SharedNotes() {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const subjects = ['all', 'Math', 'Science', 'English', 'History', 'Geography', 'Art'];

  useEffect(() => {
    loadSharedNotes();
  }, []);

  const loadSharedNotes = async () => {
    try {
      setLoading(true);
      const data = await api.getSharedNotes();
      setNotes(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (noteId: string) => {
    try {
      await api.likeSharedNote(noteId);
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, likes: n.likes + 1 } : n));
    } catch {
      // error
    }
  };

  const handleShare = async (noteId: string) => {
    try {
      await api.shareNote(noteId, user?.id || '');
    } catch {
      // error
    }
  };

  const filteredNotes = notes
    .filter(note => selectedSubject === 'all' || note.subject === selectedSubject)
    .sort((a, b) => sortBy === 'recent' 
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : b.likes - a.likes
    );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shared Notes</h1>
        <p className="text-muted-foreground">Discover notes shared by classmates</p>
      </div>

      <div className="flex gap-4">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          {subjects.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map(note => (
            <Card key={note.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{note.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <User className="w-4 h-4" />
                    <span>{note.authorName}</span>
                    <Calendar className="w-4 h-4 ml-2" />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge variant="secondary">{note.subject}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-4 mb-4">{note.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <button onClick={() => handleLike(note.id)} className="flex items-center gap-1 text-sm hover:text-orange-500">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{note.likes}</span>
                  </button>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span>{note.comments}</span>
                  </div>
                </div>
                <button onClick={() => handleShare(note.id)} className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600">
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
              {note.tags.length > 0 && (
                <div className="flex gap-1 mt-3 flex-wrap">
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
          <h3 className="text-lg font-semibold mb-2">No shared notes</h3>
          <p className="text-muted-foreground">Be the first to share your notes with classmates</p>
        </div>
      )}
    </div>
  );
}
