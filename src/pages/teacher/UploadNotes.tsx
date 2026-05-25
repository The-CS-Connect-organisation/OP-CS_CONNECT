import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/lib/store";
import { api, apiFetch } from "@/lib/api";
import {
  Upload, FileText, Trash2, Download, Eye, Plus,
  Loader2, CheckCircle2, X, StickyNote, Search,
  File, FileUp, BookOpen
} from "lucide-react";

const SUBJECTS = ["Math", "Physics", "Chemistry", "English", "CS", "Biology"];
const CLASSES = ["10-A", "10-B"];

export default function UploadNotes() {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const [form, setForm] = useState({
    title: "",
    subject: "Math",
    class: "10-A",
    description: "",
    content: "",
    file: null as File | null,
  });

  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/notes");
        setNotes(Array.isArray(res.data) ? res.data : []);
      } catch {
        setNotes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!form.title || !form.subject) return;
    try {
      setUploading(true);
      const noteData = {
        title: form.title,
        subject: form.subject,
        class: form.class,
        description: form.description,
        content: form.content,
        teacherId: user?.id,
        teacherName: user?.name,
        fileName: form.file?.name || null,
        fileSize: form.file?.size || null,
      };
      await api.createNote(noteData);
      setUploaded(true);
      setTimeout(() => setUploaded(false), 3000);
      setShowForm(false);
      setForm({ title: "", subject: "Math", class: "10-A", description: "", content: "", file: null });
      const res = await api.getNotes();
      setNotes(Array.isArray(res) ? res : []);
    } catch {
      // error
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await api.deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      // error
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || n.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200 inline-block mb-2">
          Teaching
        </div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <StickyNote className="text-orange-500" size={32} />
          Upload Notes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Share study materials with your students</p>
      </motion.div>

      {uploaded && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Notes uploaded successfully!</span>
          </div>
        </motion.div>
      )}

      {/* Actions Bar */}
      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
        >
          <option value="all">All Subjects</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20"
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "Upload New"}
        </Button>
      </Card>

      {/* Upload Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="p-6 border-orange-200 border-2">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileUp className="text-orange-500" />
                Upload New Notes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Quadratic Equations - Chapter 5"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject *</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 mt-1"
                    >
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Class</label>
                    <select
                      value={form.class}
                      onChange={(e) => setForm((p) => ({ ...p, class: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 mt-1"
                    >
                      {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description of the notes"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Content / Notes Text</label>
                  <textarea
                    placeholder="Paste or type your notes content here..."
                    value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    rows={5}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 mt-1 resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attach File (PDF, DOC, PPT)</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-all"
                  >
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={handleFileSelect} className="hidden" />
                    {form.file ? (
                      <div className="flex items-center justify-center gap-2">
                        <File className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium">{form.file.name}</span>
                        <span className="text-xs text-muted-foreground">({(form.file.size / 1024).toFixed(1)} KB)</span>
                        <button onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, file: null })); }} className="ml-2 text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">PDF, DOC, PPT up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !form.title}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  {uploading ? "Uploading..." : "Upload Notes"}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-bold text-lg">No notes yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Click "Upload New" to share your first notes with students</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note, idx) => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card className="p-4 hover:shadow-lg transition-all group h-full flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(note.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <h4 className="font-bold text-sm mt-2 line-clamp-2">{note.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px]">{note.subject}</Badge>
                  <Badge variant="outline" className="text-[10px]">{note.class}</Badge>
                </div>
                {note.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{note.description}</p>
                )}
                {note.fileName && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                    <File className="w-3 h-3" />
                    {note.fileName}
                  </div>
                )}
                <div className="mt-auto pt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{note.teacherName || "You"}</span>
                  <span>{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ""}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
