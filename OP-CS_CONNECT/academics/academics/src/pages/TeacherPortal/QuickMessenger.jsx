import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, History, Loader2 } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

/**
 * @component QuickMessenger
 * @description Quick messaging interface with real backend templates and delivery status
 * @param {Object} user - Current user object
 * @param {Function} addToast - Toast notification function
 */

const MessageTemplate = ({ template, onSelect }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    onClick={() => onSelect(template)}
    className="nova-card p-3 text-left hover:shadow-md transition-all w-full"
  >
    <p className="text-sm font-semibold text-gray-900">{template.name ?? template.title}</p>
    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.content ?? template.body}</p>
  </motion.button>
);

const CLASSES = ['10-A', '10-B', '11-A', '11-B'];

export const QuickMessenger = ({ user, addToast }) => {
  const [activeTab, setActiveTab] = useState('compose');
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [sentMessages, setSentMessages] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [sending, setSending] = useState(false);
  const [notifyParents, setNotifyParents] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingTemplates(true);
        const res = await teacherApi.getMessageTemplates();
        if (!alive) return;
        const d = res?.data?.data ?? res?.data ?? [];
        setTemplates(Array.isArray(d) ? d : []);
      } catch {
        // silently fall back to empty
      } finally {
        if (alive) setLoadingTemplates(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleSelectTemplate = (template) => {
    setMessageContent(template.content ?? template.body ?? '');
    setSubject(template.name ?? template.title ?? '');
    setSelectedTemplateId(template._id ?? template.id ?? '');
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      addToast?.('Please enter a message', 'warning');
      return;
    }
    try {
      setSending(true);
      const res = await teacherApi.sendMessage(
        recipientId || null,
        selectedClass || null,
        messageContent,
        selectedTemplateId || null
      );
      const msgData = res?.data?.data ?? res?.data ?? {};
      setSentMessages(prev => [{
        id: msgData._id ?? msgData.id ?? `msg-${Date.now()}`,
        subject: subject || 'Message',
        content: messageContent,
        class: selectedClass,
        status: 'sent',
        sentAt: new Date().toISOString(),
      }, ...prev]);
      setMessageContent('');
      setSubject('');
      setSelectedTemplateId('');
      addToast?.('Message sent successfully', 'success');
    } catch (err) {
      addToast?.(err?.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare size={32} className="text-pink-500" />
            Quick Messenger
          </h1>
          <p className="text-sm text-gray-500 mt-1">Send messages to students and parents</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-2 border-b border-gray-200">
        {['compose', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === tab ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            {tab === 'compose' ? 'Compose' : 'History'}
          </button>
        ))}
      </motion.div>

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600">Message Templates</h3>
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-pink-400" />
              </div>
            ) : templates.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">No templates available</p>
            ) : (
              <div className="space-y-2">
                {templates.map((t, idx) => (
                  <MessageTemplate key={t._id ?? t.id ?? idx} template={t} onSelect={handleSelectTemplate} />
                ))}
              </div>
            )}
          </motion.div>

          {/* Compose Area */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-4">
            <div className="nova-card p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Class (Optional)</label>
                  <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500">
                    <option value="">All / No class</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Recipient ID (Optional)</label>
                  <input type="text" value={recipientId} onChange={e => setRecipientId(e.target.value)} placeholder="Student/parent ID..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Message</label>
                <textarea value={messageContent} onChange={e => setMessageContent(e.target.value)} placeholder="Type your message..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" rows="6" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={notifyParents} onChange={e => setNotifyParents(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                <span className="text-sm text-gray-600">Notify parents</span>
              </label>

              <Button variant="primary" icon={Send} onClick={handleSendMessage} disabled={sending} className="w-full rounded-lg">
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-600">Sent Messages</h3>
          {sentMessages.length === 0 ? (
            <div className="py-12 text-center border border-dashed rounded-xl border-gray-200">
              <History size={40} className="mx-auto mb-4 text-gray-200" />
              <p className="text-sm text-gray-500">No messages sent yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {sentMessages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="nova-card p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{msg.subject}</p>
                      {msg.class && <p className="text-xs text-gray-500 mt-1">Class: {msg.class}</p>}
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">{msg.status}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{msg.content}</p>
                  <p className="text-[10px] text-gray-400">{new Date(msg.sentAt).toLocaleString()}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </div>
  );
};
