import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, MessagesSquare } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChatModal } from '../../components/messaging/ChatModal';
import { CallModal } from '../../components/messaging/CallModal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const CommunicationHub = ({ user }) => {
  const { data: users } = useStore(KEYS.USERS, []);
  const [chatUser, setChatUser] = useState(null);
  const [callState, setCallState] = useState({ isOpen: false, otherUser: null, preferVideo: true });
  const contacts = useMemo(
    () => users.filter((u) => u.id !== user.id && (u.role === 'teacher' || u.role === 'student' || u.role === 'parent')),
    [users, user]
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 border border-orange-500/30 app-shell-gradient">
        <h1 className="text-3xl font-extrabold gradient-text">Communication Hub</h1>
        <p className="text-zinc-300 mt-1">Direct messaging + voice/video calls in one cinematic console.</p>
      </motion.div>

      <div className="grid gap-3">
        {contacts.map((contact) => (
          <Card key={contact.id} className="bg-[#111] border border-orange-500/25 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">{contact.name}</p>
              <p className="text-xs text-zinc-400">{contact.role}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={MessagesSquare} onClick={() => setChatUser(contact)}>Chat</Button>
              <Button variant="primary" icon={PhoneCall} onClick={() => setCallState({ isOpen: true, otherUser: contact, preferVideo: true })}>Call</Button>
            </div>
          </Card>
        ))}
      </div>

      <ChatModal
        isOpen={!!chatUser}
        onClose={() => setChatUser(null)}
        currentUser={user}
        otherUser={chatUser}
        onStartCall={({ otherUser, preferVideo }) => setCallState({ isOpen: true, otherUser, preferVideo: preferVideo ?? true })}
      />
      <CallModal
        isOpen={callState.isOpen}
        onClose={() => setCallState({ isOpen: false, otherUser: null, preferVideo: true })}
        currentUser={user}
        otherUser={callState.otherUser}
        preferVideo={callState.preferVideo}
      />
    </div>
  );
};
