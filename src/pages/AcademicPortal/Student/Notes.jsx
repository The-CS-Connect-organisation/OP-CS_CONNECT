import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Search, Download, FileText, Calendar, MessageSquare, Lock, Terminal, Activity, Hash, Zap, ShieldCheck, ChevronRight, Share, Globe, RefreshCw } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { ChatModal } from '../../../components/messaging/ChatModal';
import { CallModal } from '../../../components/messaging/CallModal';
import { useSound } from '../../../hooks/useSound';
import { request } from '../../../utils/apiClient';

export const Notes = ({ user, addToast }) => {
  const { data: localNotes, update: updateNote } = useStore(KEYS.NOTES, []);
  const { data: noteRequests, add: addNoteRequest } = useStore(KEYS.NOTE_REQUESTS, []);
  const { playClick, playBlip, playSwitch } = useSound();

  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [apiNotes, setApiNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestNote, setRequestNote] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  const [chatOpen, setChatOpen] = useState(false);
  const [chatTeacher, setChatTeacher] = useState(null);

  const [callOpen, setCallOpen] = useState(false);
  const [callTeacher, setCallTeacher] = useState(null);
  const [callPreferVideo, setCallPreferVideo] = useState(false);
  const [callInitiator, setCallInitiator] = useState(true);

  useEffect(() => {
    setLoading(true);
    request('/school/notes').then(data => {
      if (data?.success && Array.isArray(data.notes)) {
        setApiNotes(data.notes);
      }
    }).catch(err => {
      console.error('Failed to load notes from API', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const myNotes = useMemo(() => {
    const all = apiNotes.length > 0 ? apiNotes : localNotes;
    return all.filter(n => n.class === user.class);
  }, [apiNotes, localNotes, user.class]);
  const subjects = [...new Set(myNotes.map(n => n.subject))];

  const filtered = myNotes.filter(n => {
    const matchesSubject = selectedSubject === 'all' || n.subject === selectedSubject;
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const studentRequests = useMemo(() => {
    return noteRequests.filter(r => r.studentId === user.id);
  }, [noteRequests, user.id]);

  const requestByNoteId = useMemo(() => {
    const map = new Map();
    for (const r of studentRequests) {
      map.set(r.noteId, r);
    }
    return map;
  }, [studentRequests]);

  const getRequestStatus = (note) => requestByNoteId.get(note.id)?.status || 'none';
  const canDownloadNote = (note) => getRequestStatus(note) === 'fulfilled';

  const handleRequestAccess = (note) => {
    const status = getRequestStatus(note);
    if (status === 'pending') {
      addToast?.('Protocol error: Request already in buffer.', 'info');
      return;
    }
    if (status === 'fulfilled') {
      addToast?.('Access established: Vector already reachable.', 'success');
      return;
    }
    playBlip();
    setRequestNote(note);
    setRequestMessage(`Auth_Request_Vector: ${note.title}`);
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = () => {
    if (!requestNote) return;
    playBlip();
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

    addToast?.('Request Transmitted to Auth_Socket.', 'success');
    setRequestModalOpen(false);
    setRequestNote(null);
    setRequestMessage('');
  };

  const handleDownload = (note) => {
    playSwitch();
    addToast?.('ByteStream_Initialized. Resource unlocked.', 'success');
  };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-sm text-[10px] font-semibold font-mono">
               Knowledge_Buffer
             </span>
             <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
             <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
               <Globe size={10} className="animate-pulse" /> Global_Repository_Sync
             </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
             <BookMarked className="text-[var(--text-muted)]" size={48} />
             Resources
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-muted)] transition-colors" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="SEARCH_BUFFER..."
              className="input-field pl-12 pr-6 py-3 font-mono uppercase text-xs w-full min-w-[240px]"
            />
          </div>

          <div className="flex p-1 bg-nova-base border border-[var(--border-default)] rounded-xl overflow-x-auto scrollbar-nothing">
            <button
              onClick={() => { playClick(); setSelectedSubject('all'); }}
              className={`px-5 py-2 rounded-lg text-[10px] font-mono font-semibold transition-all whitespace-nowrap ${
                selectedSubject === 'all' ? 'bg-white text-[var(--text-primary)] shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              All_Domains
            </button>
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => { playClick(); setSelectedSubject(s); }}
                className={`px-5 py-2 rounded-lg text-[10px] font-mono font-semibold transition-all whitespace-nowrap ${
                  selectedSubject === s ? 'bg-white text-[var(--text-primary)] shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={20} className="animate-spin text-[var(--text-muted)]" />
          <span className="ml-3 text-sm text-[var(--text-muted)] font-mono">Syncing_Buffer...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && myNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText size={48} className="text-[var(--text-muted)] opacity-20 mb-4" />
          <p className="text-sm font-mono text-[var(--text-muted)] uppercase tracking-widest">No resources available for your class</p>
        </div>
      )}

      {/* Resources Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        <AnimatePresence mode="popLayout">
          {filtered.map((note, idx) => {
            const status = getRequestStatus(note);
            const locked = status !== 'fulfilled';
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  className="group h-full flex flex-col border-[var(--border-default)] bg-nova-base/30 hover:border-white/20 transition-all duration-500 overflow-hidden relative cursor-crosshair"
                  onMouseEnter={playClick}
                >
                  {/* Subject Badge & Glow */}
                  <div className="p-1 bg-[var(--bg-elevated)] flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
                    <span className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">{note.subject}</span>
                    <Hash size={12} className="text-zinc-800" />
                  </div>

                  {/* Icon Area */}
                  <div className="h-32 flex items-center justify-center relative overflow-hidden bg-nova-base">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/50" />
                    <FileText size={48} className={`transition-all duration-700 ${locked ? 'text-zinc-800' : 'text-[var(--text-muted)] group-hover:scale-110'}`} />
                    {locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-nova-base/40 backdrop-blur-[2px]">
                         <Lock size={20} className="text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight mb-2 group-hover:text-[var(--text-muted)] transition-colors">
                      {note.title}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-3 mb-6 font-mono leading-relaxed uppercase opacity-60">
                      {note.description}
                    </p>

                    <div className="mt-auto space-y-6">
                      <div className="flex items-center justify-between text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar size={10} className="text-[var(--text-muted)]" /> {note.createdAt}</span>
                        <span>{note.fileSize}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={locked ? "secondary" : "primary"}
                          size="sm"
                          icon={Download}
                          onClick={() => handleDownload(note)}
                          disabled={locked}
                          className={`flex-1 font-mono text-[9px] tracking-widest uppercase py-2.5 ${!locked && 'shadow-[0_0_15px_rgba(255,255,255,0.2)]'}`}
                        >
                          Unlock_Byte
                        </Button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            playClick();
                            setChatTeacher({ id: note.teacherId, name: note.teacherName, role: 'teacher' });
                            setChatOpen(true);
                          }}
                          className="p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-white/15 transition-all shadow-xl"
                          title="Proxy_Comm"
                        >
                          <MessageSquare size={16} />
                        </motion.button>
                      </div>

                      <button
                        onClick={() => handleRequestAccess(note)}
                        disabled={status === 'pending' || status === 'fulfilled'}
                        className={`w-full py-3 rounded-lg text-[9px] font-mono font-bold uppercase tracking-[0.2em] transition-all border ${
                          status === 'pending' || status === 'fulfilled'
                            ? 'bg-nova-base border-[var(--border-default)] text-[var(--text-muted)] cursor-not-allowed'
                            : 'bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-white/12 group-hover:bg-black/05'
                        }`}
                      >
                        {status === 'pending' ? 'Auth_Pending' : status === 'fulfilled' ? 'Logic_Established' : 'Initialize_Auth_Request'}
                      </button>
                    </div>
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
        onClose={() => { playBlip(); setRequestModalOpen(false); }}
        title="AUTH_ACCESS_INITIALIZATION"
        size="md"
      >
        <div className="space-y-6">
          {requestNote && (
            <>
              <div className="p-5 bg-nova-base border border-[var(--border-default)] rounded-xl">
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Resource_Target</p>
                <p className="font-bold text-xl text-[var(--text-primary)] uppercase tracking-tight">{requestNote.title}</p>
                <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1 uppercase tracking-widest">{requestNote.subject} • AUTH_{requestNote.teacherName}</p>
              </div>
              
              <div className="group">
                <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">
                  Protocol_Message
                </label>
                <textarea
                  className="input-field min-h-[120px] font-mono text-xs uppercase resize-none"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-[var(--border-default)]">
                <Button variant="secondary" onClick={() => { playBlip(); setRequestModalOpen(false); }} className="flex-1 opacity-60">Abort</Button>
                <Button variant="primary" onClick={handleSubmitRequest} className="flex-1 shadow-[0_0_20px_rgba(255,255,255,0.2)]">Transmit</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Chat Modal System */}
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

