import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import {
  FileText, Plus, Search, Filter, Download, Eye, Trash2,
  Edit, Send, Loader2, CheckCircle2, X, AlertTriangle,
  ChevronDown, Megaphone
} from "lucide-react";

interface Circular {
  id: string;
  title: string;
  content: string;
  type: "circular" | "notice" | "memo" | "policy" | "emergency";
  priority: "low" | "medium" | "high" | "urgent";
  audience: string[];
  category: string;
  status: "draft" | "published" | "archived";
  referenceNo?: string;
  createdAt: string;
  expiresAt?: string;
  readCount?: number;
  totalRecipients?: number;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  circular: { icon: FileText, color: "text-orange-600", bg: "bg-orange-50 border-orange-200", label: "Circular" },
  notice: { icon: Megaphone, color: "text-orange-600", bg: "bg-orange-50 border-orange-200", label: "Notice" },
  memo: { icon: FileText, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Memo" },
  policy: { icon: Filter, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "Policy" },
  emergency: { icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50 border-rose-200", label: "Emergency" },
};

const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
  low: { color: "text-emerald-600", bg: "bg-emerald-100", label: "Low" },
  medium: { color: "text-orange-600", bg: "bg-orange-100", label: "Medium" },
  high: { color: "text-amber-600", bg: "bg-amber-100", label: "High" },
  urgent: { color: "text-rose-600", bg: "bg-rose-100", label: "Urgent" },
};

const AUDIENCE_OPTIONS = ["all", "students", "teachers", "parents", "staff"];

export default function Circulars() {
  const { user } = useAuthStore();
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCircular, setSelectedCircular] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", content: "", type: "circular" as Circular["type"],
    priority: "medium" as Circular["priority"], audience: ["all"],
    category: "", expiresAt: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getCirculars();
        setCirculars(data || []);
      } catch (e) {
        console.error("Failed to load circulars:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      const circular: Circular = {
        id: `cir${Date.now()}`, title: form.title, content: form.content,
        type: form.type, priority: form.priority, audience: form.audience,
        category: form.category, status: "published", createdAt: new Date().toISOString(),
        expiresAt: form.expiresAt || undefined, referenceNo: `REF-${Date.now()}`,
        readCount: 0, totalRecipients: 100,
      };
      await api.createCircular(circular);
      setCirculars((prev) => [circular, ...prev]);
      setSubmitted(true);
      setShowForm(false);
      resetForm();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      console.error("Failed to publish:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    const draft: Circular = {
      id: `cir${Date.now()}`, title: form.title || "Untitled Draft", content: form.content,
      type: form.type, priority: form.priority, audience: form.audience,
      category: form.category, status: "draft", createdAt: new Date().toISOString(),
    };
    setCirculars((prev) => [draft, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const handleArchive = (id: string) => {
    setCirculars((prev) => prev.map((c) => c.id === id ? { ...c, status: "archived" as const } : c));
  };

  const handleDelete = (id: string) => {
    setCirculars((prev) => prev.filter((c) => c.id !== id));
  };

  const resetForm = () => {
    setForm({ title: "", content: "", type: "circular", priority: "medium", audience: ["all"], category: "", expiresAt: "" });
  };

  const toggleAudience = (aud: string) => {
    if (aud === "all") {
      setForm((p) => ({ ...p, audience: p.audience.includes("all") ? [] : ["all"] }));
    } else {
      setForm((p) => {
        const filtered = p.audience.filter((a) => a !== "all");
        return { ...p, audience: filtered.includes(aud) ? filtered.filter((a) => a !== aud) : [...filtered, aud] };
      });
    }
  };

  const filteredCirculars = circulars.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    const matchesSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = {
    total: circulars.length,
    published: circulars.filter((c) => c.status === "published").length,
    drafts: circulars.filter((c) => c.status === "draft").length,
    urgent: circulars.filter((c) => c.priority === "urgent" || c.priority === "high").length,
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200 inline-block mb-2">Management</div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FileText className="text-orange-500" size={32} />
          Circulars & Notices
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Create, manage, and publish school circulars</p>
      </motion.div>

      {submitted && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            <CheckCircle2 className="w-4 h-4" /><span className="text-sm font-medium">Circular published successfully!</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", count: stats.total, icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Published", count: stats.published, icon: Send, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Drafts", count: stats.drafts, icon: Edit, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Urgent", count: stats.urgent, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={"w-10 h-10 rounded-xl " + stat.bg + " flex items-center justify-center"}>
                <stat.icon className={"w-5 h-5 " + stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search circulars..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft", "archived"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={"px-3 py-1.5 rounded-lg text-xs font-bold border transition-all " + (statusFilter === s ? "bg-orange-500 text-white border-orange-500" : "bg-background border-border text-muted-foreground hover:border-orange-300")}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all">
          {showForm ? "Cancel" : "New Circular"}
        </button>
      </Card>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="p-6 border-2 border-orange-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus className="text-orange-500" /> Create Circular</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Title *</label>
                  <input type="text" placeholder="Circular title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="input-field mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</label>
                  <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as Circular["type"] }))}
                    className="input-field mt-1">
                    <option value="circular">Circular</option>
                    <option value="notice">Notice</option>
                    <option value="memo">Memo</option>
                    <option value="policy">Policy</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as Circular["priority"] }))}
                    className="input-field mt-1">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                  <input type="text" placeholder="e.g. Academic, Transport" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="input-field mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expires On</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                    className="input-field mt-1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Audience</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {AUDIENCE_OPTIONS.map((aud) => (
                      <button key={aud} onClick={() => toggleAudience(aud)}
                        className={"px-3 py-1.5 rounded-lg text-xs font-bold border transition-all " + (form.audience.includes(aud) ? "bg-orange-500 text-white border-orange-500" : "bg-background border-border text-muted-foreground hover:border-orange-300")}>
                        {aud.charAt(0).toUpperCase() + aud.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Content *</label>
                  <textarea placeholder="Write the circular content..." value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    rows={6} className="input-field mt-1 resize-none" />
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button className="btn-secondary" onClick={handleSaveDraft}><Edit className="w-4 h-4 mr-2 inline" /> Save Draft</button>
                <button onClick={handlePublish} disabled={submitting || !form.title || !form.content}
                  className="btn-primary">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2 inline" />}
                  Publish
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : filteredCirculars.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-muted-foreground">No circulars found</h3>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCirculars.map((circular) => {
            const config = typeConfig[circular.type] || typeConfig.circular;
            const prioConfig = priorityConfig[circular.priority] || priorityConfig.medium;
            const isExpanded = selectedCircular === circular.id;
            const Icon = config.icon;
            return (
              <Card key={circular.id} className={"overflow-hidden transition-all " + (circular.priority === "urgent" ? "border-rose-200" : "")}>
                <div className="p-4 cursor-pointer" onClick={() => setSelectedCircular(isExpanded ? null : circular.id)}>
                  <div className="flex items-start gap-4">
                    <div className={"w-10 h-10 rounded-xl " + config.bg + " border flex items-center justify-center"}>
                      <Icon className={"w-5 h-5 " + config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm">{circular.title}</h4>
                        <span className={"text-[9px] font-bold px-1.5 py-0.5 rounded-full " + prioConfig.bg + " " + prioConfig.color}>{prioConfig.label}</span>
                        <span className={"text-[9px] font-bold px-1.5 py-0.5 rounded-full " + config.bg + " " + config.color + " border"}>{config.label}</span>
                        {circular.status === "draft" && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">Draft</span>}
                        {circular.status === "archived" && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">Archived</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground">{circular.referenceNo}</span>
                        <span className="text-[10px] text-muted-foreground">&middot; {new Date(circular.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] text-muted-foreground">&middot; To: {circular.audience.join(", ")}</span>
                      </div>
                      {circular.readCount !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">{circular.readCount}/{circular.totalRecipients} read</span>
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${(circular.readCount / (circular.totalRecipients || 1)) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <ChevronDown className={"w-4 h-4 text-muted-foreground transition-transform " + (isExpanded ? "rotate-180" : "")} />
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border">
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{circular.content}</p>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                          {circular.status === "draft" && (
                            <button className="btn-primary text-xs"><Send className="w-3 h-3 mr-1 inline" /> Publish</button>
                          )}
                          {circular.status === "published" && (
                            <button className="btn-secondary text-xs" onClick={() => handleArchive(circular.id)}><Eye className="w-3 h-3 mr-1 inline" /> Archive</button>
                          )}
                          <button className="btn-ghost text-xs text-rose-500" onClick={() => handleDelete(circular.id)}><Trash2 className="w-3 h-3 mr-1 inline" /> Delete</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
