import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/lib/store";
import { api, apiFetch } from "@/lib/api";
import {
  MessageSquare, Send, Search, User, Loader2,
  Phone, Video, MoreVertical, Check, CheckCheck,
  ArrowLeft, Circle
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  online?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: number;
}

export default function QuickMessenger() {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/users");
        const data = Array.isArray(res.data) ? res.data : [];
        const contactList = data
          .filter((u: any) => u.id !== user?.id)
          .map((u: any) => ({
            id: u.id,
            name: u.name,
            role: u.role,
            avatar: u.avatar,
            online: Math.random() > 0.5,
            lastMessage: "",
            lastMessageTime: "",
            unread: 0,
          }));
        setContacts(contactList);
      } catch {
        setContacts([
          { id: "u1", name: "Aarav Sharma", role: "student", avatar: "AS", online: true, lastMessage: "Thank you sir!", lastMessageTime: "2m ago", unread: 1 },
          { id: "u2", name: "Priya Patel", role: "student", avatar: "PP", online: true, lastMessage: "Can I submit tomorrow?", lastMessageTime: "15m ago", unread: 0 },
          { id: "u3", name: "Rohan Kumar", role: "student", avatar: "RK", online: false, lastMessage: "Noted", lastMessageTime: "1h ago", unread: 0 },
          { id: "u5", name: "Dr. Rajesh Gupta", role: "teacher", avatar: "RG", online: true, lastMessage: "See you in class", lastMessageTime: "3h ago", unread: 0 },
          { id: "u7", name: "Principal Meera", role: "admin", avatar: "PM", online: false, lastMessage: "Approved", lastMessageTime: "1d ago", unread: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedContact) return;
    (async () => {
      try {
        const res = await apiFetch(`/messages/${user?.id}`);
        const data = Array.isArray(res.data) ? res.data : [];
        const filtered = data.filter((m: any) => m.from === selectedContact || m.to === selectedContact);
        setMessages(filtered);
      } catch {
        setMessages([
          { id: "dm1", from: selectedContact, to: user?.id, content: "Hello! How are you?", timestamp: new Date(Date.now() - 7200000).toISOString(), read: true },
          { id: "dm2", from: user?.id, to: selectedContact, content: "I am good, thanks!", timestamp: new Date(Date.now() - 7000000).toISOString(), read: true },
          { id: "dm3", from: selectedContact, to: user?.id, content: "Did you complete the assignment?", timestamp: new Date(Date.now() - 3600000).toISOString(), read: true },
          { id: "dm4", from: user?.id, to: selectedContact, content: "Yes, submitted it yesterday!", timestamp: new Date(Date.now() - 3500000).toISOString(), read: true },
        ]);
      }
    })();
  }, [selectedContact, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedContact) return;
    try {
      setSendingMsg(true);
      await api.sendMessage(user!.id, selectedContact, newMessage);
      setMessages((prev) => [...prev, {
        id: `dm${Date.now()}`,
        from: user?.id,
        to: selectedContact,
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false,
      }]);
      setNewMessage("");
    } catch {
      setMessages((prev) => [...prev, {
        id: `dm${Date.now()}`,
        from: user?.id,
        to: selectedContact,
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false,
      }]);
      setNewMessage("");
    } finally {
      setSendingMsg(false);
    }
  };

  const currentContact = contacts.find((c) => c.id === selectedContact);
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const roleColors: Record<string, string> = {
    student: "bg-orange-100 text-blue-700",
    teacher: "bg-orange-100 text-purple-700",
    admin: "bg-amber-100 text-amber-700",
    parent: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-0 rounded-2xl overflow-hidden border border-border bg-background">
      {/* Contact List */}
      <div className={`w-80 flex-shrink-0 border-r border-border flex flex-col bg-background ${selectedContact ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            Messages
          </h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-accent/50 border-0 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-all border-b border-border/30 ${
                selectedContact === contact.id ? "bg-orange-50 border-l-2 border-l-orange-500" : ""
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                  {contact.avatar || contact.name.charAt(0)}
                </div>
                {contact.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{contact.name}</p>
                  <span className="text-[10px] text-muted-foreground">{contact.lastMessageTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate">{contact.lastMessage || contact.role}</p>
                  {contact.unread ? (
                    <span className="w-5 h-5 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">{contact.unread}</span>
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedContact ? "hidden md:flex" : "flex"}`}>
        {!selectedContact ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-muted-foreground">Select a conversation</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedContact(null)} className="md:hidden p-1 hover:bg-accent rounded-lg">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                    {currentContact?.avatar || currentContact?.name.charAt(0)}
                  </div>
                  {currentContact?.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{currentContact?.name}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {currentContact?.online ? (
                      <span className="text-emerald-600">Online</span>
                    ) : (
                      "Offline"
                    )}
                    {" "}&middot; {currentContact?.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-accent rounded-lg transition-all"><Phone className="w-4 h-4 text-muted-foreground" /></button>
                <button className="p-2 hover:bg-accent rounded-lg transition-all"><Video className="w-4 h-4 text-muted-foreground" /></button>
                <button className="p-2 hover:bg-accent rounded-lg transition-all"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.map((msg) => {
                const isOwn = msg.from === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] ${isOwn ? "order-2" : ""}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isOwn
                          ? "bg-orange-500 text-white rounded-br-md"
                          : "bg-accent rounded-bl-md"
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : ""}`}>
                        <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
                        {isOwn && (
                          msg.read
                            ? <CheckCheck className="w-3 h-3 text-orange-500" />
                            : <Check className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="flex-1 bg-accent/50 border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sendingMsg}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4"
                >
                  {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
