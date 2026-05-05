import { AnimatePresence, motion } from 'framer-motion';
import { ChatView } from './ChatView';

export const ChatModal = ({
  isOpen,
  onClose,
  currentUser,
  otherUser,
  onStartCall,
}) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="w-full max-w-md h-[min(680px,85vh)]"
          onClick={(e) => e.stopPropagation()}
        >
          <ChatView 
            isOpen={isOpen}
            onClose={onClose}
            currentUser={currentUser}
            otherUser={otherUser}
            onStartCall={onStartCall}
            isInline={false}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};