import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, IndianRupee, Plus, UserCog, ShieldAlert, History, UserCheck, Terminal } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';

export const PayrollHR = ({ addToast }) => {
  const { data: users, update } = useStore(KEYS.USERS, []);
  const { data: payroll, add } = useStore(KEYS.PAYROLL, []);
  const { data: hrRecords, add: addHrRecord } = useStore(KEYS.HR_RECORDS, []);
  const { playClick, playBlip } = useSound();

  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [amount, setAmount] = useState(45000);
  const [note, setNote] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const teachers = useMemo(() => users.filter((u) => u.role === 'teacher'), [users]);

  const handleRunPayroll = () => {
    if (!selectedTeacher) return addToast('Select a teacher first', 'error');
    playBlip();
    const teacher = teachers.find((t) => t.id === selectedTeacher);
    if (!teacher) return;
    add({
      id: `pay-${Date.now()}`,
      userId: teacher.id,
      teacherName: teacher.name,
      amount: Number(amount),
      status: 'paid',
      paidAt: new Date().toISOString(),
      month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    });
    addToast('Payroll entry added! 💸', 'success');
  };

  const handleResetPassword = () => {
    if (!selectedTeacher || !newPassword.trim()) return;
    playBlip();
    update(selectedTeacher, { password: newPassword.trim() });
    addHrRecord({
      id: `hr-${Date.now()}`,
      action: 'password_reset',
      userId: selectedTeacher,
      note: `Password reset by system administrator`,
      createdAt: new Date().toISOString(),
    });
    setNewPassword('');
    addToast('Teacher access reset.', 'info');
  };

  const toggleTeacherActive = () => {
    if (!selectedTeacher) return;
    playBlip();
    const teacher = teachers.find((t) => t.id === selectedTeacher);
    if (!teacher) return;
    const nextState = !(teacher.isActive ?? true);
    update(selectedTeacher, { isActive: nextState });
    addHrRecord({
      id: `hr-${Date.now()}`,
      action: nextState ? 'reactivate' : 'deactivate',
      userId: selectedTeacher,
      note: `Entity ${nextState ? 'reactivated' : 'deactivated'} via core override`,
      createdAt: new Date().toISOString(),
    });
    addToast(`Status: ${nextState ? 'ACTIVE' : 'INACTIVE'}`, 'info');
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none" 
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)', filter: 'blur(100px)' }} />
        
      {/* Dynamic Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="nova-card p-10 relative overflow-hidden group"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(99,102,241,0.02)] to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] text-indigo-400 rounded-sm text-[10px] font-semibold font-mono shadow-glow">
              Auth_Level_4
            </span>
            <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={12}/> Root_Access_Granted
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-4 flex items-center gap-4">
             <span className="w-1.5 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #6366f1, #22d3ee)' }} />
             Staff Terminal
          </h1>
          <p className="text-[var(--text-muted)] font-mono text-sm max-w-2xl uppercase tracking-widest leading-relaxed">
            Execute fiscal transactions, reset security credentials, and manage entity activation states across the cluster.
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        {/* Main Controls Panel */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="nova-card p-8 border space-y-8 relative overflow-hidden" 
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: 'rgba(99,102,241,0.02)' }} />
            <div className="flex items-center gap-3 border-b pb-6 relative z-10" style={{ borderColor: 'var(--border-subtle)' }}>
               <UserCheck className="text-indigo-400" size={20} />
               <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-wide">Entry Configuration</h2>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="group">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-indigo-400 transition-colors">Target_Entity</label>
                <select 
                  className="input-field appearance-none cursor-pointer" 
                  value={selectedTeacher} 
                  onChange={(e) => { playClick(); setSelectedTeacher(e.target.value); }}
                >
                  <option value="" className="bg-[#0c0c14]">Select system entity...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id} className="bg-[#0c0c14]">{teacher.name} [{teacher.employeeId || 'NO_ID'}]</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-cyan-400 transition-colors">Transaction_Value (₹)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="input-field font-mono text-lg" 
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-indigo-400 transition-colors">Reference_Note</label>
                  <input 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)} 
                    className="input-field" 
                    placeholder="E.g. Performance_Incentive" 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-6 border-t relative z-10" style={{ borderColor: 'var(--border-subtle)' }}>
              <Button variant="primary" icon={IndianRupee} onClick={handleRunPayroll} className="shadow-glow">Execute_Payroll</Button>
              <Button variant="secondary" icon={UserCog} onClick={toggleTeacherActive}>Override_State</Button>
            </div>
          </Card>

          <Card className="nova-card p-8 border space-y-6 relative overflow-hidden" 
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-3 relative z-10">
               <ShieldAlert className="text-rose-400 animate-pulse" size={20} />
               <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-wide">Credential_Reset</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-4 relative z-10">
              <input 
                className="input-field flex-1 font-mono" 
                type="password"
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Enter new record..." 
              />
              <Button variant="danger" icon={Plus} onClick={handleResetPassword} disabled={!selectedTeacher}>Reset_Access</Button>
            </div>
            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest relative z-10">Caution: Password overrides are immediate and logged in the audit trail.</p>
          </Card>
        </div>

        {/* Sidebar History Logs */}
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="nova-card p-6 border max-h-[400px] flex flex-col relative overflow-hidden" 
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] font-mono flex items-center gap-2">
                  <History size={14} className="text-cyan-400" /> Transaction_Ledger
                </h3>
                <span className="text-[9px] font-mono text-indigo-400 uppercase bg-[rgba(99,102,241,0.1)] px-2 py-0.5 rounded-sm">{payroll.length} Records</span>
              </div>
              <div className="space-y-3 overflow-y-auto no-scrollbar pr-1 flex-1 relative z-10">
                {payroll.length === 0 ? (
                  <p className="text-[10px] font-mono text-[var(--text-muted)] text-center py-10 uppercase italic">Empty_Stream</p>
                ) : (
                  payroll.slice().reverse().map((entry) => (
                    <div key={entry.id} className="p-4 rounded-xl transition-colors group hover:bg-[rgba(99,102,241,0.02)]" 
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">{entry.teacherName}</span>
                        <span className="text-[10px] font-mono text-cyan-400">₹{Number(entry.amount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                        <span>{entry.month}</span>
                        <span className="px-1.5 py-0.5 bg-[rgba(99,102,241,0.1)] text-indigo-400 rounded border border-indigo-500/20">{entry.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="nova-card p-6 border max-h-[400px] flex flex-col relative overflow-hidden"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] font-mono flex items-center gap-2">
                  <Terminal size={14} className="text-indigo-400" /> Audit_Trail
                </h3>
                <span className="text-[9px] font-mono text-cyan-400 uppercase bg-[rgba(34,211,238,0.1)] px-2 py-0.5 rounded-sm">{hrRecords.length} Events</span>
              </div>
              <div className="space-y-3 overflow-y-auto no-scrollbar pr-1 flex-1 relative z-10">
                {hrRecords.length === 0 ? (
                   <p className="text-[10px] font-mono text-[var(--text-muted)] text-center py-10 uppercase italic">Stable_System</p>
                ) : (
                  hrRecords.slice().reverse().map((entry) => (
                    <div key={entry.id} className="p-4 rounded-xl border hover:border-indigo-500/30 transition-colors bg-[rgba(99,102,241,0.01)]"
                      style={{ borderColor: 'var(--border-subtle)' }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-bold font-mono uppercase ${entry.action.includes('password') ? 'text-rose-400' : 'text-indigo-400'}`}>{entry.action}</span>
                        <span className="text-[9px] font-mono text-[var(--text-muted)]">{new Date(entry.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] italic leading-snug">"{entry.note}"</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

