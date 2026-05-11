import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Search, Download, FileText, Calendar, MessageSquare, Lock, Terminal, Activity, Hash, Zap, ShieldCheck, ChevronRight, Share, Globe } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useSound } from '../../../hooks/useSound';
import { request } from '../../../utils/apiClient';

export const Notes = ({ user, addToast }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { playClick, playBlip, playSwitch } = useSound();

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    setLoading(true);
    setError(null);
    request('/school/notes')
      .then(res => {
        if (alive) setNotes(res?.notes || res?.items || res?.data?.notes || []);
      })
      .catch(e => {
        if (alive) {
          console.error('Failed to load notes:', e);
          setError(e.message || 'Failed to load notes');
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [user?.id]);

  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestNote, setRequestNote] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [noteRequests, setNoteRequests] = useState([]);

  const myNotes = useMemo(() =>
    notes.filter(n => !n.class || n.class === user.class),
    [notes, user.class]
  );
  const subjects = useMemo(() =>
    [...new Set(myNotes.map(n => n.subject).filter(Boolean))],
    [myNotes]
  );

  const filtered = useMemo(() =>
    myNotes.filter(n => {
      const matchesSubject = selectedSubject === 'all' || n.subject === selectedSubject;
      const matchesSearch = (n.title || '').toLowerCase().includes(search.toLowerCase());
      return matchesSubject && matchesSearch;
    }),
    [myNotes, selectedSubject, search]
  );

  const studentRequests = useMemo(() =>
    noteRequests.filter(r => r.studentId === user.id),
    [noteRequests, user.id]
  );

  const requestByNoteId = useMemo(() => {
    const map = new Map();
    for (const r of studentRequests) { map.set(r.noteId, r); }
    return map;
  }, [studentRequests]);

  const getRequestStatus = (note) => requestByNoteId.get(note.id)?.status || 'none';
  const canDownloadNote = (note) => getRequestStatus(note) === 'fulfilled';

  const handleRequestAccess = (note) => {
    const status = getRequestStatus(note);
    if (status === 'pending' || status === 'fulfilled') return;
    playBlip();
    setRequestNote(note);
    setRequestMessage(`Requesting access to: ${note.title}`);
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = () => {
    if (!requestNote) return;
    playBlip();
    const newReq = {
      id: `req-${Date.now()}`,
      noteId: requestNote.id,
      noteTitle: requestNote.title,
      teacherId: requestNote.teacherId,
      teacherName: requestNote.teacherName,
      studentId: user.id,
      studentName: user.name,
      class: requestNote.class,
      subject: requestNote.subject,
      message: requestMessage.trim(),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      fulfilledAt: null,
      fulfilledBy: null,
    };
    setNoteRequests(prev => [newReq, ...prev]);
    addToast?.('Access request sent to teacher.', 'success');
    setRequestModalOpen(false);
    setRequestNote(null);
    setRequestMessage('');
  };

  const handleDownload = (note) => {
    if (!canDownloadNote(note)) {
      addToast?.('Auth_Failure: Component Locked.', 'warning');
      return;
    }
    playSwitch();
    addToast?.('ByteStream_Initialized (Simulated).', 'success');
  };

  const getSubjectColor = (subject) => {
    const colors = {
      Mathematics: 'from-pink-500/10 to-pink-500/5 border-pink-200 text-pink-600',
      Physics: 'from-purple-500/10 to-purple-500/5 border-purple-200 text-purple-600',
      Chemistry: 'from-blue-500/10 to-blue-500/5 border-blue-200 text-blue-600',
      Biology: 'from-emerald-500/10 to-emerald-500/5 border-emerald-200 text-emerald-600',
      English: 'from-amber-500/10 to-amber-500/5 border-amber-200 text-amber-600',
      'Computer Science': 'from-fuchsia-500/10 to-fuchsia-500/5 border-fuchsia-200 text-fuchsia-600',
      History: 'from-rose-500/10 to-rose-500/5 border-rose-200 text-rose-600',
      Geography: 'from-green-500/10 to-green-500/5 border-green-200 text-green-600',
    };
    return colors[subject] || 'from-gray-500/10 to-gray-500/5 border-gray-200 text-gray-600';
  };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-200 rounded-sm text-[10px] font-semibold">
              Knowledge_Buffer
            </span>
            <div className="h-[1px] w-8 bg-gray-200" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Globe size={10} className="animate-pulse" /> Global_Repository_Sync
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-4">
            <BookMarked className="text-orange-500" size={36} />
            Resources
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="input-field pl-12 pr-6 py-3 text-sm w-full min-w-[200px]"
            />
          </div>
        </div>
      </motion.div>

      {/* Subject filter pills */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedSubject === 'all'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            All
          </button>
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedSubject === s
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Activity size={32} className="text-orange-400" />
          </motion.div>
          <p className="text-sm text-gray-500 font-medium">Loading knowledge buffer...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
        >
          <Terminal size={32} className="mx-auto mb-3 text-red-400" />
          <h3 className="text-lg font-bold text-red-700 mb-1">Sync Failed</h3>
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center"
        >
          <BookMarked size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-700 mb-1">No Resources Available</h3>
          <p className="text-sm text-gray-500">Resources uploaded by your teachers will appear here.</p>
        </motion.div>
      )}

      {/* Resources grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          <AnimatePresence mode="popLayout">
            {filtered.map((note, idx) => {
              const status = getRequestStatus(note);
              const locked = status !== 'fulfilled';
              const subjectClass = getSubjectColor(note.subject);
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className="group h-full flex flex-col border overflow-hidden relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    style={{ borderColor: locked ? 'var(--border-color)' : 'var(--primary-light, #fed7aa)' }}
                    onMouseEnter={playClick}
                  >
                    {/* Subject header */}
                    <div className="px-4 py-3 border-b flex items-center justify-between"
                      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500">{note.subject || 'General'}</span>
                      <Hash size={12} className="text-gray-400" />
                    </div>

                    {/* Icon Area */}
                    <div className="h-28 flex items-center justify-center relative overflow-hidden"
                      style={{ background: locked ? 'rgba(0,0,0,0.03)' : 'var(--bg-elevated)' }}>
                      {locked && (
                        <div className="absolute inset-0 bg-orange-50/50" />
                      )}
                      <div className={`absolute inset-0 opacity-20`} style={{ background: locked ? 'transparent' : 'radial-gradient(circle at center, rgba(249,115,22,0.2) 0%, transparent 70%)' }} />
                      <FileText size={40} className={`relative z-10 transition-all duration-500 ${locked ? 'text-gray-300' : 'text-orange-300 group-hover:text-orange-500 group-hover:scale-110'}`} />
                      {locked && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <Lock size={18} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="text-base font-bold text-gray-900 leading-tight mb-2 group-hover:text-orange-600 transition-colors">
                        {note.title || 'Untitled Resource'}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {note.description || note.content || 'No description available.'}
                      </p>

                      <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={10} />
                            {note.created_at ? new Date(note.created_at).toLocaleDateString() : '—'}
                          </span>
                          {note.downloads && <span>{note.downloads} downloads</span>}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant={locked ? "secondary" : "primary"}
                            size="sm"
                            icon={Download}
                            onClick={() => handleDownload(note)}
                            disabled={locked}
                            className="flex-1"
                          >
                            {locked ? 'Locked' : 'Download'}
                          </Button>
                          <button
                            onClick={() => handleRequestAccess(note)}
                            disabled={status === 'pending' || status === 'fulfilled'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              status === 'pending'
                                ? 'bg-amber-50 border-amber-200 text-amber-600 cursor-not-allowed'
                                : status === 'fulfilled'
                                ? 'bg-green-50 border-green-200 text-green-600 cursor-not-allowed'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
                            }`}
                          >
                            {status === 'pending' ? 'Pending...' : status === 'fulfilled' ? 'Granted' : 'Request Access'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Request Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Request Resource Access"
        size="md"
      >
        <div className="space-y-5">
          {requestNote && (
            <>
              <div className="p-4 rounded-xl border bg-orange-50/30"
                style={{ borderColor: 'var(--primary-light, #fed7aa)' }}>
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">Resource</p>
                <p className="font-bold text-lg text-gray-900">{requestNote.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {requestNote.subject} • {requestNote.teacherName || 'Teacher'}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                  Your Message
                </label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  value={requestMessage}
                  onChange={e => setRequestMessage(e.target.value)}
                  placeholder="Write a brief message to your teacher explaining why you need this resource..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setRequestModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmitRequest} className="flex-1">
                  Send Request
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
