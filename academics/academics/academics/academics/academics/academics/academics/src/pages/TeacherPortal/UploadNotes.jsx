import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Upload, MessageSquare, CheckCircle, Calendar, BookOpen, Clock, Hash, Zap, ChevronRight, Download, Globe, Info, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { ChatModal } from '../../components/messaging/ChatModal';
import { CallModal } from '../../components/messaging/CallModal';
import { useSound } from '../../hooks/useSound';

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
      addToast?.('Please provide both title and subject.', 'error');
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
    addToast?.('Learning resource published.', 'success');
  };

  const handleFulfillRequest = (req) => {
    playSwitch();
    updateNoteRequest(req.id, {
      status: 'fulfilled',
      fulfilledAt: new Date().toISOString().split('T')[0],
      fulfilledBy: user.name,
    });
    addToast?.(`Request fulfilled: ${req.noteTitle}`, 'success');
  };

  // Chat + Call
  const [chatOpen, setChatOpen] = useState(false);
  const [chatStudent, setChatStudent] = useState(null);
  const [callOpen, setCallOpen] = useState(false);
  const [callStudent, setCallStudent] = useState(null);
  const [callPreferVideo, setCallPreferVideo] = useState(false);
  const [callInitiator, setCallInitiator] = useState(true);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12 font-sans">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
             <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200">
               Learning Resources
             </div>
             <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-2">Active Broadcasts: {myNotes.length}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-4">
             <BookOpen className="text-slate-300" size={40} />
             Resources
          </h1>
        </div>
        
        <Button 
          variant="primary" 
          icon={Upload} 
          onClick={() => { playBlip(); setIsOpen(true); }}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 shadow-xl shadow-slate-900/10 px-8"
        >
          Publish Resource
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Help Requests */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Resource Requests</h3>
               <Badge variant={pendingRequests.length > 0 ? 'rose' : 'default'} className="px-3 py-1 text-[10px] font-bold">
                 {pendingRequests.length} Pending
               </Badge>
             </div>

             <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
               <AnimatePresence mode="popLayout">
                 {pendingRequests.length === 0 ? (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <CheckCircle size={24} />
                     </div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No pending student requests</p>
                   </motion.div>
                 ) : (
                   pendingRequests.map((req, idx) => (
                     <motion.div
                       key={req.id}
                       initial={{ opacity: 0, scale: 0.98 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: idx * 0.05 }}
                       className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group"
                       onMouseEnter={playClick}
                     >
                       <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{req.subject}</span>
                       </div>
                       <h4 className="font-bold text-slate-900 uppercase tracking-tight mb-1">{req.noteTitle}</h4>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">From: {req.studentName}</p>

                       <div className="p-4 bg-white border border-slate-100 rounded-xl mb-6">
                          <p className="text-xs text-slate-600 leading-relaxed italic">
                            "{req.message}"
                          </p>
                       </div>

                       <div className="grid grid-cols-2 gap-2">
                         <Button
                           variant="primary"
                           size="sm"
                           icon={CheckCircle}
                           onClick={() => handleFulfillRequest(req)}
                           className="bg-slate-900 text-white rounded-xl py-2.5 text-[10px] font-bold uppercase"
                         >
                           Fulfill
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
                           className="rounded-xl border-slate-200 text-slate-400 hover:text-indigo-600"
                         />
                       </div>
                     </motion.div>
                   ))
                 )}
               </AnimatePresence>
             </div>
          </Card>
        </div>

        {/* Global Resources Grid */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[500px]">
             <div className="flex items-center justify-between mb-10">
               <div>
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Published Content</h3>
                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.15em]">Accessible by {myNotes.length} Student Groups</p>
               </div>
               <Globe className="text-slate-100" size={48} />
             </div>

             {myNotes.length === 0 ? (
               <div className="text-center py-32 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center gap-4">
                 <FileUp size={48} className="text-slate-100" />
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No published resources detected</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <AnimatePresence mode="popLayout">
                   {myNotes.map((n, idx) => (
                     <motion.div
                       key={n.id}
                       initial={{ opacity: 0, scale: 0.98 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: idx * 0.04 }}
                     >
                       <Card 
                         className="group p-6 bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 rounded-2xl cursor-pointer relative"
                         onMouseEnter={playClick}
                       >
                         <div className="flex flex-col h-full relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                               <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-600 uppercase tracking-widest shadow-sm">
                                 {n.class}
                               </span>
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{n.subject}</span>
                            </div>
                            
                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight mb-8 truncate">{n.title}</h4>
                            
                            <div className="flex items-center justify-between mt-auto">
                               <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                 <span className="flex items-center gap-1.5"><Calendar size={10} /> {n.createdAt}</span>
                                 <span className="flex items-center gap-1.5"><Hash size={10} /> {n.fileSize}</span>
                               </div>
                               <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-500">
                                 <Download size={18} />
                               </div>
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
        title="Publish Resource"
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                <Info size={18} />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 leading-relaxed">
               Distribute learning material to student groups. Published items undergo automated formatting validation.
             </p>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Title *</label>
              <input
                placeholder="E.G. QUANTUM_MECHANICS_101"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Class / Sector</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                  value={formData.class}
                  onChange={e => setFormData({ ...formData, class: e.target.value })}
                >
                  <option value="10-A">10-A</option>
                  <option value="10-B">10-B</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Subject Domain</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="">Select Domain</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Description</label>
              <textarea
                placeholder="Instructions for students regarding this material..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-5 text-sm font-medium min-h-[120px] resize-none focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-200 transition-all group cursor-pointer">
              <Upload size={32} className="mx-auto mb-4 text-slate-300 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">Click or drag files to upload</p>
              <p className="text-[9px] font-bold text-slate-300 uppercase mt-2 tracking-widest">Supports PDF, DOCX, ZIP (Max 50MB)</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
            <Button variant="secondary" onClick={() => { playBlip(); setIsOpen(false); }} className="px-6 h-12 rounded-2xl font-bold uppercase text-[10px]">Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} className="bg-slate-900 text-white shadow-xl shadow-slate-900/10 rounded-2xl px-10 h-12 font-bold uppercase text-[10px]">Publish Content</Button>
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
