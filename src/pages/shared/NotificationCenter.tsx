import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/lib/store";
import { api, apiFetch } from "@/lib/api";
import {
  Bell, BellOff, Check, CheckCheck, Trash2, Filter,
  Loader2, AlertCircle, Info, AlertTriangle, Megaphone,
  MessageSquare, Calendar, CreditCard, BookOpen, X, Search,
  Settings, Eye, EyeOff, Volume2, VolumeX
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success" | "announcement" | "message" | "event" | "fee" | "academic";
  timestamp: string;
  read: boolean;
  priority?: "low" | "medium" | "high" | "urgent";
  category?: string;
  actionUrl?: string;
  sender?: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  info: { icon: Info, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  error: { icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  success: { icon: Check, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  announcement: { icon: Megaphone, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  message: { icon: MessageSquare, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
  event: { icon: Calendar, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  fee: { icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  academic: { icon: BookOpen, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-orange-100 text-orange-600",
  high: "bg-amber-100 text-amber-600",
  urgent: "bg-rose-100 text-rose-600",
};

export default function NotificationCenter() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/notifications/${user?.id}`);
        const data = Array.isArray(res.data) ? res.data : [];
        setNotifications(data.map((n: any) => ({ ...n, type: n.type || "info", priority: n.priority || "medium", read: n.read || false, category: n.category || "general" })));
      } catch {
        // Demo notifications
        setNotifications([
          { id: "n1", title: "Assignment Graded", message: "Your Mathematics assignment has been graded. You scored 92/100.", type: "academic", timestamp: new Date(Date.now() - 1800000).toISOString(), read: false, priority: "medium", sender: "Dr. Rajesh Gupta" },
          { id: "n2", title: "Fee Payment Due", message: "Term 2 fee payment of Rs. 25,000 is due by June 15, 2026.", type: "fee", timestamp: new Date(Date.now() - 7200000).toISOString(), read: false, priority: "high", sender: "Accounts Department" },
          { id: "n3", title: "Annual Sports Day", message: "Inter-house athletics competition on June 15. Register before June 10.", type: "event", timestamp: new Date(Date.now() - 86400000).toISOString(), read: false, priority: "medium", sender: "Sports Department" },
          { id: "n4", title: "New Announcement", message: "School will remain closed on May 30 for Parent-Teacher Meeting.", type: "announcement", timestamp: new Date(Date.now() - 172800000).toISOString(), read: true, priority: "high", sender: "Principal Meera" },
          { id: "n5", title: "Bus Route Change", message: "Route A pickup time changed to 7:00 AM starting Monday.", type: "info", timestamp: new Date(Date.now() - 259200000).toISOString(), read: true, priority: "low", sender: "Transport Department" },
          { id: "n6", title: "Science Fair Registration", message: "Last date for Science Fair registration is June 22. Teams of 2-3.", type: "event", timestamp: new Date(Date.now() - 345600000).toISOString(), read: true, priority: "medium", sender: "Academic Coordinator" },
          { id: "n7", title: "Library Book Return", message: "You have 2 overdue books. Please return before semester end.", type: "warning", timestamp: new Date(Date.now() - 432000000).toISOString(), read: false, priority: "high", sender: "Library" },
          { id: "n8", title: "Message from Dr. Gupta", message: "Please meet me during office hours to discuss your project.", type: "message", timestamp: new Date(Date.now() - 518400000).toISOString(), read: true, priority: "medium", sender: "Dr. Rajesh Gupta" },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const handleMarkRead = async (notifId: string) => {
    setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, read: true } : n));
    try { await apiFetch(`/notifications/${user?.id}/${notifId}/read`); } catch {}
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter = filter === "all" || (filter === "unread" && !n.read) || (filter === "read" && n.read);
    const matchesType = typeFilter === "all" || n.type === typeFilter;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesType && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200">Notifications</div>
          {unreadCount > 0 && (
            <Badge className="bg-rose-500 text-white text-[10px] px-2">{unreadCount} unread</Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bell className="text-orange-500" size={32} />
          Notification Center
        </h1>
      </motion.div>

      {/* Controls */}
      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search notifications..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "unread" && unreadCount > 0 && <span className="ml-1.5 bg-white/20 px-1.5 rounded-full text-[10px]">{unreadCount}</span>}
            </Button>
          ))}
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500">
          <option value="all">All Types</option>
          {Object.entries(typeConfig).map(([key]) => <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>)}
        </select>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
          <CheckCheck className="w-3.5 h-3.5 mr-1.5" /> Mark all read
        </Button>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center">
          <BellOff className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-muted-foreground">No notifications</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">You are all caught up!</p>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredNotifications.map((notif) => {
              const config = typeConfig[notif.type] || typeConfig.info;
              const Icon = config.icon;
              const isSelected = selectedNotification === notif.id;
              return (
                <motion.div key={notif.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                  layout>
                  <Card className={`p-4 transition-all cursor-pointer hover:shadow-md ${!notif.read ? "border-l-4 border-l-orange-500 bg-orange-50/20" : ""} ${isSelected ? "ring-2 ring-orange-500/30" : ""}`}
                    onClick={() => { setSelectedNotification(isSelected ? null : notif.id); if (!notif.read) handleMarkRead(notif.id); }}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className={`text-sm font-bold truncate ${!notif.read ? "" : "text-muted-foreground"}`}>{notif.title}</h4>
                          {notif.priority && notif.priority !== "low" && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${priorityColors[notif.priority]}`}>{notif.priority}</span>
                          )}
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {notif.sender && <span className="text-[10px] text-muted-foreground font-medium">From: {notif.sender}</span>}
                          <span className="text-[10px] text-muted-foreground/60">{formatTime(notif.timestamp)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                          className="p-1.5 hover:bg-rose-50 rounded-lg transition-all text-muted-foreground hover:text-rose-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm leading-relaxed">{notif.message}</p>
                        {notif.sender && <p className="text-xs text-muted-foreground mt-2">Sent by: {notif.sender}</p>}
                        <p className="text-xs text-muted-foreground">{new Date(notif.timestamp).toLocaleString()}</p>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
