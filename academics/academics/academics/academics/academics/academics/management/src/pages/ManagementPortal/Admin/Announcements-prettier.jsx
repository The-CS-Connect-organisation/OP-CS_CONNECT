import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Plus,
  Trash2,
  Send,
  AlertTriangle,
  Radio,
  Megaphone,
  Terminal,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useStore } from "../../../hooks/useStore";
import { KEYS } from "../../../data/schema";
import { useSound } from "../../../hooks/useSound";

export const Announcements = ({ user, addToast }) => {
  const { data: announcements, add, remove } = useStore(KEYS.ANNOUNCEMENTS, []);
  const { playClick, playBlip } = useSound();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
  });

  const handleSubmit = () => {
    playBlip();
    add({
      id: `ann-${Date.now()}`,
      ...formData,
      author: user.name,
      authorRole: user.role,
      date: new Date().toISOString().split("T")[0],
      readBy: [],
    });
    setModalOpen(false);
    setFormData({ title: "", content: "", priority: "medium" });
    addToast("Broadcast Live! ????", "success");
  };

  const priorityConfig = {
    high: {
      color: "rose",
      icon: AlertTriangle,
      bg: "bg-[rgba(244,63,94,0.1)]",
      text: "text-rose-400",
      border: "border-[rgba(244,63,94,0.2)]",
    },
    medium: {
      color: "indigo",
      icon: Bell,
      bg: "bg-[rgba(99,102,241,0.1)]",
      text: "text-indigo-400",
      border: "border-[rgba(99,102,241,0.2)]",
    },
    low: {
      color: "default",
      icon: Radio,
      bg: "bg-white/[0.04]",
      text: "text-[var(--text-muted)]",
      border: "border-[var(--border-default)]",
    },
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[rgba(99,102,241,0.1)] text-indigo-400 border border-[rgba(99,102,241,0.2)] rounded-sm text-[10px] font-semibold font-mono shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              Broadcast_Node
            </span>
            <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
              Global_Relay_Active
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
            <Megaphone className="text-indigo-400" size={48} />
            Bulletins
          </h1>
        </motion.div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            playBlip();
            setModalOpen(true);
          }}
          className="shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          Initialize_Broadcast
        </Button>
      </div>

      {/* Main Stream */}
      <div className="grid gap-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {announcements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center nova-card border-dashed"
              style={{ borderColor: "var(--border-default)" }}
            >
              <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                No_Communications_Detected
              </p>
            </motion.div>
          ) : (
            announcements
              .slice()
              .reverse()
              .map((a, idx) => {
                const config =
                  priorityConfig[a.priority] || priorityConfig.medium;
                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      delay: idx * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                  >
                    <Card
                      className={`group flex flex-col md:flex-row gap-6 p-6 transition-all duration-500 ${config.border} border relative overflow-hidden`}
                      style={{
                        background: "var(--bg-elevated)",
                        border: `1px solid ${config.border.includes("var") ? "var(--border-default)" : ""}`,
                      }}
                      onMouseEnter={playClick}
                    >
                      <div
                        className={`absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none`}
                      />

                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-500 ${config.bg} ${config.text} border ${config.border}`}
                      >
                        <config.icon size={28} />
                      </div>

                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--text-muted)] transition-colors">
                            {a.title}
                          </h4>
                          <Badge variant={config.color}>{a.priority}</Badge>
                        </div>
                        <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4 font-normal">
                          {a.content}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wide">
                          <span className="flex items-center gap-1.5">
                            <Terminal size={10} /> Origin: {a.author}
                          </span>
                          <span className="h-1 w-1 bg-[var(--bg-floating)] rounded-full" />
                          <span>Timestamp: {a.date}</span>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col justify-end gap-2 self-start md:self-center relative z-10">
                        <button
                          onClick={() => {
                            playBlip();
                            remove(a.id);
                            addToast("Signal Terminated.", "info");
                          }}
                          className="p-3 text-[var(--text-muted)] hover:text-[var(--text-muted)] hover:bg-black/05 rounded-full transition-all border border-transparent hover:border-white/10"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
          )}
        </AnimatePresence>
      </div>

      {/* Broadcast Initialization Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="INITIALIZE_BROADCAST"
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-lg">
            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-normal flex items-center gap-2">
              <Radio size={12} className="animate-pulse" /> Warning: Broadcasts
              are visible to all authorized entities.
            </p>
          </div>

          <div className="space-y-4">
            <div className="group">
              <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">
                Broadcast_Header
              </label>
              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, title: e.target.value }))
                }
                className="input-field"
                placeholder="SUBJECT_ALPHA"
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">
                Signal_Payload
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, content: e.target.value }))
                }
                className="input-field min-h-[120px] resize-none"
                placeholder="Transmission details go here..."
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">
                Priority_Vector
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, priority: e.target.value }))
                }
                className="input-field appearance-none cursor-pointer"
              >
                <option value="low" className="bg-nova-base">
                  LOW_IMPORTANCE
                </option>
                <option value="medium" className="bg-nova-base">
                  STANDARD_RELAY
                </option>
                <option value="high" className="bg-nova-base text-[var(--text-muted)]">
                  URGENT_OVERRIDE
                </option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t border-[var(--border-default)]">
            <Button
              variant="secondary"
              onClick={() => {
                playBlip();
                setModalOpen(false);
              }}
            >
              Abort_Command
            </Button>
            <Button
              variant="primary"
              icon={Send}
              onClick={handleSubmit}
              className="shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Execute_Relay
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

