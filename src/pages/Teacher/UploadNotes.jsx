import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, Upload } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const UploadNotes = ({ user, addToast }) => {
  const { add } = useStore(KEYS.NOTES, []);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', subject: '', class: '10-A', description: '', type: 'PDF'
  });

  const handleSubmit = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      ...formData,
      teacherId: user.id,
      teacherName: user.name,
      createdAt: new Date().toISOString().split('T')[0],
      fileSize: '2.4 MB', // Simulated
      downloads: 0
    };
    add(newNote);
    setIsOpen(false);
    setFormData({ title: '', subject: '', class: '10-A', description: '', type: 'PDF' });
    addToast('Note uploaded successfully! ', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FileUp className="text-primary-500" /> Upload Resources
        </h1>
        <Button variant="primary" icon={Upload} onClick={() => setIsOpen(true)}>Upload New</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* You can map existing notes here similar to Student Notes page */}
        <Card className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setIsOpen(true)}>
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Upload size={24} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-600 dark:text-gray-300">Click to Upload</p>
          <p className="text-xs text-gray-400 mt-1">PDF, DOCX, PPT</p>
        </Card>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Upload Study Material">
        <div className="space-y-4">
          <input 
            placeholder="Title (e.g., Chapter 5 Summary)" 
            className="input-field"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
          <select 
            className="input-field"
            value={formData.subject}
            onChange={e => setFormData({...formData, subject: e.target.value})}
          >
            <option value="">Select Subject</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="English">English</option>
          </select>
          <textarea 
            placeholder="Description..." 
            className="input-field" 
            rows={3}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500">Drag file here or click to browse</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>Upload</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
