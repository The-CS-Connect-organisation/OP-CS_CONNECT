import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Video, MessageSquare } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { Modal } from '../ui/Modal';

const getChatRoomId = (teacherId, studentId) => `chat:${teacherId}:${studentId}`;

export const ChatModal = ({
  isOpen,
  onClose,
  currentUser,
  otherUser,
  initiatorRole = 'teacher',
  onStartCall,
}) => {
  const { data: allMessages, add } = useStore(KEYS.CHAT_MESSAGES, []);
  const roomId = useMemo(() => {
    if (!currentUser || !otherUser) return '';
    // We store rooms as teacher<->student; handle both directions.
    const teacherId = currentUser.role === 'teacher' ? currentUser.id : otherUser.id;
    const studentId = currentUser.role === 'student' ? currentUser.id : otherUser.id;
    return getChatRoomId(teacherId, studentId);
  }, [currentUser, otherUser]);

  const messages = useMemo(() => {
    if (!roomId) return [];
    return allMessages
      .filter(m => m.roomId === roomId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [allMessages, roomId]);

  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    // scroll to bottom
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    });
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (!isOpen) setText('');
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !currentUser || !otherUser) return;

    add({
      id: `msg-${Date.now()}`,
      roomId,
      fromUserId: currentUser.id,
      fromName: currentUser.name,
      toUserId: otherUser.id,
      content: trimmed,
      createdAt: new Date().toISOString(),
    });
    setText('');
  };

  if (!currentUser || !otherUser) return null;

  const HeaderIcon = currentUser.role === 'teacher' ? MessageSquare : MessageSquare;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chat">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeaderIcon size={18} className="text-primary-500" />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {otherUser.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {otherUser.role === 'teacher' ? 'Teacher' : 'Student'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStartCall?.({ currentUser, otherUser, roomId })}
              className="p-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Start call"
            >
              <Phone size={18} className="text-gray-700 dark:text-gray-200" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStartCall?.({ currentUser, otherUser, roomId, preferVideo: true })}
              className="p-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Start video call"
            >
              <Video size={18} className="text-gray-700 dark:text-gray-200" />
            </motion.button>
          </div>
        </div>

        <div
          ref={listRef}
          className="h-72 overflow-y-auto pr-2"
        >
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              No messages yet.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map(m => {
                const isMe = m.fromUserId === currentUser.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        isMe
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <p className="break-words">{m.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Type a message..."
            className="input-field flex-1"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            className="p-3 rounded-xl glass bg-primary-500 text-white hover:opacity-95 transition-colors"
            title="Send"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

