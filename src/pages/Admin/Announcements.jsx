import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, Send, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const Announcements = ({ user, addToast }) => {
  const { data: announcements, add, remove } = useStore(KEYS.ANNOUNCEMENTS, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'medium' });

  const handleSubmit = () => {
    add({
      id: `ann-${Date.now()}`,
      ...formData,
      author: user.name,
      authorRole: user.role,
      date: new Date().toISOString().split('T')[0],
      readBy: []
    });
    setModalOpen(false);
    setFormData({ title: '', content: '', priority: 'medium' });
    addToast('Announcement published! 📢', 'success');
  };

  const priorityConfig = {
    high: { color: 'red', icon: AlertTriangle },
    medium: { color: 'orange', icon: Bell },
    low: { color: 'blue', icon: Bell },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Bell className="text-primary-500" /> Announcements
          </h1>
          <p className="text-gray-500 mt-1">{announcements.length} announcements</p>
        </motion.div>
        <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>New Announcement</Button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {announcements.map((a, idx) => {
            const config = priorityConfig[a.priority];
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="flex flex-col md:flex-row gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    a.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                    a.priority === 'medium' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                  }`}>
                    <config.icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-gray-800 dark:text-white">{a.title}</h4>
                      <Badge color={config.color}>{a.priority}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{a.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>By {a.author} • {a.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => { remove(a.id); addToast('Announcement deleted', 'info'); }} className="text-red-500 self-start" />
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Announcement">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input value={formData.title} onChange={e => setFormData(d => ({ ...d, title: e.target.value }))} className="input-field" placeholder="Announcement title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
            <textarea value={formData.content} onChange={e => setFormData(d => ({ ...d, content: e.target.value }))} className="input-field" rows={4} placeholder="Announcement content" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select value={formData.priority} onChange={e => setFormData(d => ({ ...d, priority: e.target.value }))} className="input-field">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={Send} onClick={handleSubmit}>Publish</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
