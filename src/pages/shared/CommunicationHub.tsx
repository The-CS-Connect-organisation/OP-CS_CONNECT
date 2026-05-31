import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/lib/store";
import { api, apiFetch } from "@/lib/api";
import {
  MessageSquare, Send, Hash, Plus, Users, Search,
  Loader2, Smile, Paperclip, Phone, Video, Settings,
  ChevronDown, Circle, UserPlus, Lock, Globe
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  type: "class" | "subject" | "general" | "private";
  description?: string;
  members?: string[];
  createdAt?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  type?: "text" | "system";
}

export default function CommunicationHub() {
  const { user } = useAuthStore();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelForm, setChannelForm] = useState({ name: "", type: "general" as const, description: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default channels if none exist
  const defaultChannels: Channel[] = [
    { id: "ch-general", name: "General", type: "general", description: "General discussion for everyone" },
    { id: "ch-10a", name: "Class 10-A", type: "class", description: "Students and teachers of 10-A" },
    { id: "ch-10b", name: "Class 10-B", type: "class", description: "Students and teachers of 10-B" },
    { id: "ch-math", name: "Mathematics", type: "subject", description: "Math discussions and doubt solving" },
    { id: "ch-physics", name: "Physics", type: "subject", description: "Physics lab and theory" },
    { id: "ch-announcements", name: "Announcements", type: "private", description: "Official school announcements" },
  ];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.getChatChannels();
        const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (data.length === 0) {
          setChannels(defaultChannels);
          setSelectedChannel(defaultChannels[0].id);
        } else {
          setChannels(data);
          setSelectedChannel(data[0].id);
        }
      } catch (err) {
        console.error('[CommunicationHub] Failed to load channels:', err);
        setChannels(defaultChannels);
        setSelectedChannel(defaultChannels[0].id);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;
    (async () => {
      try {
        const res = await api.getChannelMessages(selectedChannel);
        const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setMessages(data);
      } catch (err) {
        console.error('[CommunicationHub] Failed to load messages:', err);
      }
    })();
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;
    try {
      setSendingMsg(true);
      const msg: ChatMessage = {
        id: `msg${Date.now()}`,
        senderId: user?.id || "",
        senderName: user?.name || "You",
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: "text",
      };
      await api.sendChannelMessage(selectedChannel, msg);
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch {
      // Add locally anyway
      const msg: ChatMessage = {
        id: `msg${Date.now()}`,
        senderId: user?.id || "",
        senderName: user?.name || "You",
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: "text",
      };
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleCreateChannel = async () => {
    if (!channelForm.name) return;
    try {
      const channel: Channel = {
        id: `ch${Date.now()}`,
        name: channelForm.name,
        type: channelForm.type,
        description: channelForm.description,
      };
      await api.createChatChannel(channel);
      setChannels((prev) => [...prev, channel]);
      setShowCreateChannel(false);
      setChannelForm({ name: "", type: "general", description: "" });
    } catch {
      // Add locally
      const channel: Channel = {
        id: `ch${Date.now()}`,
        name: channelForm.name,
        type: channelForm.type,
        description: channelForm.description,
      };
      setChannels((prev) => [...prev, channel]);
      setShowCreateChannel(false);
      setChannelForm({ name: "", type: "general", description: "" });
    }
  };

  const currentChannel = channels.find((c) => c.id === selectedChannel);
  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "class": return <Users className="w-4 h-4" />;
      case "subject": return <Hash className="w-4 h-4" />;
      case "private": return <Lock className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-0 rounded-2xl overflow-hidden border border-border bg-background">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col bg-background">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            Comms Hub
          </h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-accent/50 border-0 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                selectedChannel === channel.id
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "hover:bg-accent/50 text-foreground"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                selectedChannel === channel.id ? "bg-orange-100 text-orange-600" : "bg-accent text-muted-foreground"
              }`}>
                {getChannelIcon(channel.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{channel.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{channel.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-border">
          <Button
            onClick={() => setShowCreateChannel(true)}
            variant="outline"
            className="w-full rounded-xl text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Channel
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        {currentChannel && (
          <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-background">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                {getChannelIcon(currentChannel.type)}
              </div>
              <div>
                <h3 className="font-bold text-sm">{currentChannel.name}</h3>
                <p className="text-[10px] text-muted-foreground">{currentChannel.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-accent rounded-lg transition-all"><Phone className="w-4 h-4 text-muted-foreground" /></button>
              <button className="p-2 hover:bg-accent rounded-lg transition-all"><Video className="w-4 h-4 text-muted-foreground" /></button>
              <button className="p-2 hover:bg-accent rounded-lg transition-all"><Users className="w-4 h-4 text-muted-foreground" /></button>
              <button className="p-2 hover:bg-accent rounded-lg transition-all"><Settings className="w-4 h-4 text-muted-foreground" /></button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isOwn ? "bg-orange-500 text-white" : "bg-accent text-muted-foreground"
                }`}>
                  {msg.senderName?.charAt(0) || "?"}
                </div>
                <div className={`max-w-[70%] ${isOwn ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {!isOwn && <span className="text-xs font-semibold">{msg.senderName}</span>}
                    <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isOwn
                      ? "bg-orange-500 text-white rounded-br-md"
                      : "bg-accent rounded-bl-md"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-accent rounded-lg transition-all"><Paperclip className="w-4 h-4 text-muted-foreground" /></button>
            <button className="p-2 hover:bg-accent rounded-lg transition-all"><Smile className="w-4 h-4 text-muted-foreground" /></button>
            <input
              type="text"
              placeholder={`Message #${currentChannel?.name || "channel"}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              className="flex-1 bg-accent/50 border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendingMsg}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4"
            >
              {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Create Channel Modal */}
      <AnimatePresence>
        {showCreateChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateChannel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Create Channel</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Channel Name</label>
                  <input
                    type="text"
                    placeholder="e.g. study-group"
                    value={channelForm.name}
                    onChange={(e) => setChannelForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</label>
                  <select
                    value={channelForm.type}
                    onChange={(e) => setChannelForm((p) => ({ ...p, type: e.target.value as any }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 mt-1"
                  >
                    <option value="general">General</option>
                    <option value="class">Class</option>
                    <option value="subject">Subject</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                  <input
                    type="text"
                    placeholder="What is this channel about?"
                    value={channelForm.description}
                    onChange={(e) => setChannelForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <Button variant="outline" onClick={() => setShowCreateChannel(false)}>Cancel</Button>
                <Button onClick={handleCreateChannel} className="bg-orange-500 hover:bg-orange-600 text-white">Create</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
