import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Upload, MessageSquare, CheckCircle, Calendar, Terminal, Activity, Hash, Zap, ChevronRight, Share, Download, Globe } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { ChatModal } from '../../../components/messaging/ChatModal';
import { CallModal } from '../../../components/messaging/CallModal';
import { useSound } from '../../../hooks/useSound';

export const UploadNotes = ({ user, addToast }) => {
  const { data: notes, add } = useStore(KEYS.NOTES, []);
  const { data: noteRequests, update: updateNoteRequest } = useStore(KEYS.NOTE_REQUESTS, []);
  const { playClick, playBlip, playSwitch } = useSound();

  const myNotes = useMemo(() => notes.filter(n => n.teacherId === user.id), [notes, user.id]);
  const pendingRequests = useMemo(
    () => noteRequests.filter(r => r.teacherId === user.id && r.status === 'pending'),
    [noteRequests, user.id]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    class: '10-A',
    description: '',
    type: 'PDF',
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.subject) {
      addToast?.('Protocol error: Title and Subject required.', 'error');
      return;
    }
    playBlip();

    const newNote = {
      id: `note-${Date.now()}`,
      ...formData,
      teacherId: user.id,
      teacherName: user.name,
      createdAt: new Date().toISOString().split('T')[0],
      fileSize: '2.4 MB',
      downloads: 0,
    };

    add(newNote);
    setIsOpen(false);
    setFormData({ title: '', subject: '', class: '10-A', description: '', type: 'PDF' });
    addToast?.('Resource Transmitted to Buffer.', 'success');
  };

  const handleFulfillRequest = (req) => {
    playSwitch();
    updateNoteRequest(req.id, {
      status: 'fulfilled',
      fulfilledAt: new Date().toISOString().split('T')[0],
      fulfilledBy: user.name,
    });
    addToast?.(`Auth Granted: ${req.noteTitle}`, 'success');
  };

  // Chat + Call
  const [chatOpen, setChatOpen] = useState(false);
  const [chatStudent, setChatStudent] = useState(null);
  const [callOpen, setCallOpen] = useState(false);
  const [callStudent, setCallStudent] = useState(null);
  const [callPreferVideo, setCallPreferVideo] = useState(false);
  const [callInitiator, setCallInitiator] = useState(true);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-sm text-[10px] font-semibold font-mono">
               Knowledge_Buffer
             </span>
             <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
             <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Sector_Broadcasting_Active</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
             <FileUp className="text-[var(--text-muted)]" size={48} />
             Resources
          </h1>
        </div>
        
        <Button 
          variant="primary" 
          icon={Upload} 
          onClick={() => { playBlip(); setIsOpen(true); }}
          className="shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          Initialize_Upload
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Requests Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 border-[var(--border-default)] bg-nova-base/40 divide-y divide-zinc-900">
            <div className="pb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Incoming Requests</h3>
                <Badge variant={pendingRequests.length > 0 ? 'rose' : 'default'}>
                  {pendingRequests.length}
                </Badge>
              </div>
              <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Requires_Teacher_Auth</p>
            </div>

            <div className="pt-6 space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-nothing">
              <AnimatePresence mode="popLayout">
                {pendingRequests.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 border border-dashed border-[var(--border-default)] rounded-xl">
                    <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">No_Pending_Vectors</p>
                  </motion.div>
                ) : (
                  pendingRequests.map((req, idx) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-slate-600/30 transition-all group"
                      onMouseEnter={playClick}
                    >
                      <div className="flex items-center gap-2 mb-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                         <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-bold tracking-widest">{req.subject}</span>
                      </div>
                      <p className="font-bold text-[var(--text-primary)] uppercase tracking-wide mb-1 flex items-center justify-between">
                         {req.noteTitle}
                         <span className="text-[10px] font-mono text-[var(--text-muted)] font-normal">ID_{req.id.slice(-4)}</span>
                      </p>
                      <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-4">Requestor: {req.studentName}</p>

                      <div className="p-3 bg-nova-base/40 border border-[var(--border-default)] rounded-lg mb-6">
                         <p className="text-[11px] text-[var(--text-muted)] leading-relaxed italic">
                           "{req.message}"
                         </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => handleFulfillRequest(req)}
                          className="flex-1 text-[10px] py-2"
                        >
                          Unlock
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={MessageSquare}
                          onClick={() => {
                            playClick();
                            setChatStudent({ id: req.studentId, name: req.studentName, role: 'student' });
                            setChatOpen(true);
                          }}
                          className="px-3"
                        />
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        {/* Notes Grid Column */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 border-[var(--border-default)] bg-nova-base/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Uploaded Resources</h3>
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase mt-1 tracking-widest">Global_Reachable: {myNotes.length} Entities</p>
              </div>
              <Globe className="text-zinc-800" size={32} />
            </div>

            {myNotes.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed border-[var(--border-default)] rounded-2xl">
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-[0.4em]">Zero_Broadcast_Units_Detected</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {myNotes.map((note, idx) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Card 
                        className="group p-5 bg-[var(--bg-elevated)] border-[var(--border-default)] hover:border-white/12 hover:bg-[var(--bg-elevated)] transition-all duration-500 cursor-pointer overflow-hidden relative"
                        onMouseEnter={playClick}
                      >
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/[0.03] blur-[40px] rounded-full pointer-events-none group-hover:bg-black/05 transition-colors" />
                        
                        <div className="flex items-start justify-between gap-4 relative z-10">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-3">
                               <span className="px-2 py-0.5 bg-white/[0.06] text-[var(--text-muted)] border border-white/10 rounded-sm text-[9px] font-semibold font-mono">
                                 {note.class}
                               </span>
                               <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{note.subject}</span>
                            </div>
                            <p className="font-bold text-lg text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--text-muted)] transition-colors truncate">{note.title}</p>
                            
                            <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--text-muted)] mt-6 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><Calendar size={10} /> {note.createdAt}</span>
                              <span className="h-1 w-1 bg-[var(--bg-floating)] rounded-full" />
                              <span className="flex items-center gap-1.5"><Terminal size={10} /> {note.fileSize}</span>
                            </div>
                          </div>
                          
                          <div className="w-14 h-14 rounded-2xl bg-nova-base border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] shadow-xl group-hover:border-white/12 group-hover:text-[var(--text-muted)] transition-all duration-500">
                            <Hash size={24} />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={() => { playBlip(); setIsOpen(false); }} 
        title="INITIALIZE_RESOURCE_UPLOADER"
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-lg flex items-center gap-3">
             <Terminal size={16} className="text-[var(--text-muted)]" />
             <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-relaxed">
               Module: Knowledge_Distributor. All resources undergo sector validation prior to student accessibility.
             </p>
          </div>
          
          <div className="space-y-4">
            <div className="group">
              <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Resource_Title</label>
              <input
                placeholder="E.G. QUANTUM_MECHANICS_CORE_ALPHA"
                className="input-field"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Sector_ID</label>
                <select
                  className="input-field font-mono"
                  value={formData.class}
                  onChange={e => setFormData({ ...formData, class: e.target.value })}
                >
                  <option value="10-A" className="bg-nova-base">10-A</option>
                  <option value="10-B" className="bg-nova-base">10-B</option>
                </select>
              </div>

              <div className="group">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Knowledge_Domain</label>
                <select
                  className="input-field font-mono"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="" className="bg-nova-base">SELECT_DOMAIN</option>
                  <option value="Mathematics" className="bg-nova-base">MATHEMATICS</option>
                  <option value="Physics" className="bg-nova-base">PHYSICS</option>
                  <option value="Chemistry" className="bg-nova-base">CHEMISTRY</option>
                </select>
              </div>
            </div>

            <div className="group">
              <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Resource_Parameters</label>
              <textarea
                placeholder="Operational instructions / Syllabus coverage..."
                className="input-field min-h-[100px] resize-none"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="p-8 border-2 border-dashed border-[var(--border-default)] rounded-2xl text-center bg-nova-base/50 hover:border-white/15 transition-colors group cursor-pointer">
              <Upload size={32} className="mx-auto mb-4 text-[var(--text-muted)] group-hover:text-[var(--text-muted)] group-hover:scale-110 transition-all duration-500" />
              <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Transmit_Data_Package (Simulated)</p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-[var(--border-default)]">
            <Button variant="secondary" onClick={() => { playBlip(); setIsOpen(false); }}>Abort_Action</Button>
            <Button variant="primary" onClick={handleSubmit} className="shadow-[0_0_20px_rgba(255,255,255,0.3)]">Deploy_Resource</Button>
          </div>
        </div>
      </Modal>

      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        currentUser={user}
        otherUser={chatStudent}
        onStartCall={({ otherUser: ou, preferVideo: pv }) => {
          setCallStudent(ou);
          setCallPreferVideo(!!pv);
          setCallInitiator(true);
          setChatOpen(false);
          setCallOpen(true);
        }}
      />

      <CallModal
        isOpen={callOpen}
        onClose={() => setCallOpen(false)}
        currentUser={user}
        otherUser={callStudent}
        preferVideo={callPreferVideo}
        initiator={callInitiator}
      />
    </div>
  );
};

