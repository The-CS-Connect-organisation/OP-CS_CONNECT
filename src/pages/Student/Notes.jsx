import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Search, Download, FileText, Calendar, MessageSquare, Lock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { ChatModal } from '../../components/messaging/ChatModal';
import { CallModal } from '../../components/messaging/CallModal';

export const Notes = ({ user, addToast }) => {
  const { data: notes, update: updateNote } = useStore(KEYS.NOTES, []);
  const { data: noteRequests, add: addNoteRequest } = useStore(KEYS.NOTE_REQUESTS, []);

  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestNote, setRequestNote] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  const [chatOpen, setChatOpen] = useState(false);
  const [chatTeacher, setChatTeacher] = useState(null);

  const [callOpen, setCallOpen] = useState(false);
  const [callTeacher, setCallTeacher] = useState(null);
  const [callPreferVideo, setCallPreferVideo] = useState(false);
  const [callInitiator, setCallInitiator] = useState(true);

  const myNotes = notes.filter(n => n.class === user.class);
  const subjects = [...new Set(myNotes.map(n => n.subject))];

  const filtered = myNotes.filter(n => {
    const matchesSubject = selectedSubject === 'all' || n.subject === selectedSubject;
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const subjectColors = {
    Mathematics: 'from-blue-500 to-cyan-500',
    Biology: 'from-emerald-500 to-teal-500',
    'English Literature': 'from-purple-500 to-pink-500',
    Physics: 'from-orange-500 to-red-500',
    Chemistry: 'from-amber-500 to-yellow-500',
  };

  const studentRequests = useMemo(() => {
    return noteRequests.filter(r => r.studentId === user.id);
  }, [noteRequests, user.id]);

  const requestByNoteId = useMemo(() => {
    const map = new Map();
    for (const r of studentRequests) {
      // last request for that note wins for display purposes
      map.set(r.noteId, r);
    }
    return map;
  }, [studentRequests]);

  const getRequestStatus = (note) => requestByNoteId.get(note.id)?.status || 'none';

  const canDownloadNote = (note) => getRequestStatus(note) === 'fulfilled';

  const handleRequestAccess = (note) => {
    const status = getRequestStatus(note);
    if (status === 'pending') {
      addToast?.('Request already pending for this note.', 'info');
      return;
    }
    if (status === 'fulfilled') {
      addToast?.('This note is already available.', 'success');
      return;
    }

    setRequestNote(note);
    setRequestMessage(`Please share access for: ${note.title}`);
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = () => {
    if (!requestNote) return;
    const status = getRequestStatus(requestNote);
    if (status === 'pending') {
      addToast?.('Request already pending for this note.', 'info');
      setRequestModalOpen(false);
      return;
    }

    addNoteRequest({
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
    });

    addToast?.('Note request sent to your teacher.', 'success');
    setRequestModalOpen(false);
    setRequestNote(null);
    setRequestMessage('');
  };

  const handleDownload = (note) => {
    if (!canDownloadNote(note)) {
      addToast?.('Request access first. Teacher will approve it.', 'warning');
      return;
    }
    updateNote(note.id, { downloads: (note.downloads || 0) + 1 });
    addToast?.('Download started (simulated).', 'success');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <BookMarked className="text-primary-500" /> Notes & Resources
        </h1>
        <p className="text-gray-500 mt-1">Request notes access, then download after approval.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="input-field pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${selectedSubject === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          >
            All
          </button>
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${selectedSubject === s ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((note, idx) => {
            const status = getRequestStatus(note);
            const locked = status !== 'fulfilled';
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:shadow-xl transition-shadow group">
                  <div
                    className={`w-full h-32 rounded-xl bg-gradient-to-br ${
                      subjectColors[note.subject] || 'from-gray-500 to-gray-600'
                    } flex items-center justify-center mb-4 group-hover:scale-[1.02] transition-transform`}
                  >
                    <FileText size={40} className="text-white/80" />
                  </div>

                  <Badge className="self-start mb-2">{note.subject}</Badge>
                  <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                    {note.title}
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {note.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {note.createdAt}
                      </span>
                      <span>{note.fileSize}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {locked && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          <Lock size={12} /> {status === 'pending' ? 'Requested' : 'Locked'}
                        </span>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Download}
                        onClick={() => handleDownload(note)}
                        disabled={locked}
                        className="rounded-xl"
                        title={locked ? 'Request access first' : 'Download'}
                      >
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-4">
                    <button
                      onClick={() => handleRequestAccess(note)}
                      disabled={status === 'pending' || status === 'fulfilled'}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        status === 'pending' || status === 'fulfilled'
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                          : 'bg-primary-500 text-white hover:opacity-95'
                      }`}
                    >
                      {status === 'pending' ? 'Requested' : status === 'fulfilled' ? 'Approved' : 'Request access'}
                    </button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setChatTeacher({ id: note.teacherId, name: note.teacherName, role: 'teacher' });
                        setChatOpen(true);
                      }}
                      className="p-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Chat with teacher"
                    >
                      <MessageSquare size={18} className="text-gray-700 dark:text-gray-200" />
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Request Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Request Access"
      >
        <div className="space-y-4">
          {requestNote && (
            <>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-sm text-gray-500">Note</p>
                <p className="font-semibold text-gray-900 dark:text-white">{requestNote.title}</p>
                <p className="text-xs text-gray-500 mt-1">Subject: {requestNote.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message to teacher
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setRequestModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:opacity-95 transition-colors"
                  onClick={handleSubmitRequest}
                >
                  Send request
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        currentUser={user}
        otherUser={chatTeacher}
        onStartCall={({ otherUser: ou, preferVideo: pv }) => {
          setCallTeacher(ou);
          setCallPreferVideo(!!pv);
          setCallInitiator(user.role === 'teacher');
          setChatOpen(false);
          setCallOpen(true);
        }}
      />

      {/* Call Modal */}
      <CallModal
        isOpen={callOpen}
        onClose={() => setCallOpen(false)}
        currentUser={user}
        otherUser={callTeacher}
        preferVideo={callPreferVideo}
        initiator={callInitiator}
      />
    </div>
  );
};
