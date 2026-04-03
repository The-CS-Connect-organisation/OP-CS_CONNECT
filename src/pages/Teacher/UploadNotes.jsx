import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, Upload, MessageSquare, CheckCircle, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { ChatModal } from '../../components/messaging/ChatModal';
import { CallModal } from '../../components/messaging/CallModal';

export const UploadNotes = ({ user, addToast }) => {
  const { data: notes, add } = useStore(KEYS.NOTES, []);
  const { data: noteRequests, update: updateNoteRequest } = useStore(KEYS.NOTE_REQUESTS, []);

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
      addToast?.('Please add title and subject for the note.', 'error');
      return;
    }

    const newNote = {
      id: `note-${Date.now()}`,
      ...formData,
      teacherId: user.id,
      teacherName: user.name,
      createdAt: new Date().toISOString().split('T')[0],
      fileSize: '2.4 MB', // Simulated
      downloads: 0,
    };

    add(newNote);
    setIsOpen(false);
    setFormData({ title: '', subject: '', class: '10-A', description: '', type: 'PDF' });
    addToast?.('Note uploaded successfully.', 'success');
  };

  const handleFulfillRequest = (req) => {
    updateNoteRequest(req.id, {
      status: 'fulfilled',
      fulfilledAt: new Date().toISOString().split('T')[0],
      fulfilledBy: user.name,
    });
    addToast?.(`Access granted: ${req.noteTitle}`, 'success');
  };

  // Chat + Call
  const [chatOpen, setChatOpen] = useState(false);
  const [chatStudent, setChatStudent] = useState(null);
  const [callOpen, setCallOpen] = useState(false);
  const [callStudent, setCallStudent] = useState(null);
  const [callPreferVideo, setCallPreferVideo] = useState(false);
  const [callInitiator, setCallInitiator] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FileUp className="text-primary-500" /> Upload Resources
          </h1>
          <p className="text-gray-500 mt-1">Students request access; fulfill requests and connect instantly.</p>
        </div>

        <Button variant="primary" icon={Upload} onClick={() => setIsOpen(true)}>
          Upload New
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Pending Requests</h3>
              <Badge color={pendingRequests.length > 0 ? 'orange' : 'gray'}>
                {pendingRequests.length}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mb-4">Approve to unlock downloads for students.</p>

            <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
              {pendingRequests.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-10">
                  No pending requests 🎉
                </div>
              ) : (
                pendingRequests.map(req => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{req.noteTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">Student: {req.studentName}</p>
                    <p className="text-xs text-gray-500 mt-1">Subject: {req.subject}</p>

                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 line-clamp-3">
                      {req.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleFulfillRequest(req)}
                      >
                        Fulfill
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={MessageSquare}
                        onClick={() => {
                          setChatStudent({ id: req.studentId, name: req.studentName, role: 'student' });
                          setChatOpen(true);
                        }}
                      >
                        Chat
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Your Uploaded Notes</h3>
                <p className="text-sm text-gray-500 mt-1">{myNotes.length} total</p>
              </div>
            </div>

            {myNotes.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-500">
                Upload resources to start receiving requests.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myNotes.map((note, idx) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card className="p-4 h-full hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Badge className="mb-2">{note.subject}</Badge>
                          <p className="font-medium text-gray-900 dark:text-white">{note.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                            <Calendar size={12} />
                            <span>{note.createdAt}</span>
                            <span>•</span>
                            <span>{note.fileSize}</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <FileUp size={18} className="text-primary-500" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Upload Study Material">
        <div className="space-y-4">
          <input
            placeholder="Title (e.g., Chapter 5 Summary)"
            className="input-field"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              className="input-field"
              value={formData.class}
              onChange={e => setFormData({ ...formData, class: e.target.value })}
            >
              <option value="10-A">10-A</option>
              <option value="10-B">10-B</option>
            </select>

            <select
              className="input-field"
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
            >
              <option value="">Select Subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
            </select>
          </div>

          <textarea
            placeholder="Description..."
            className="input-field"
            rows={3}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500">Drag file here or click to browse (simulated)</p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>Upload</Button>
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
