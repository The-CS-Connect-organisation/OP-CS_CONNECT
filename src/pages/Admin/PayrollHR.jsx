import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, IndianRupee, Plus, UserCog } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const PayrollHR = ({ addToast }) => {
  const { data: users, update } = useStore(KEYS.USERS, []);
  const { data: payroll, add, update: updatePayroll } = useStore(KEYS.PAYROLL, []);
  const { data: hrRecords, add: addHrRecord } = useStore(KEYS.HR_RECORDS, []);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [amount, setAmount] = useState(45000);
  const [note, setNote] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const teachers = useMemo(() => users.filter((u) => u.role === 'teacher'), [users]);

  const handleRunPayroll = () => {
    if (!selectedTeacher) return addToast('Select a teacher first', 'error');
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
    addToast('Payroll entry added', 'success');
  };

  const handleResetPassword = () => {
    if (!selectedTeacher || !newPassword.trim()) return;
    update(selectedTeacher, { password: newPassword.trim() });
    addHrRecord({
      id: `hr-${Date.now()}`,
      action: 'password_reset',
      userId: selectedTeacher,
      note: `Password reset by admin`,
      createdAt: new Date().toISOString(),
    });
    setNewPassword('');
    addToast('Teacher password reset', 'success');
  };

  const toggleTeacherActive = () => {
    if (!selectedTeacher) return;
    const teacher = teachers.find((t) => t.id === selectedTeacher);
    if (!teacher) return;
    update(selectedTeacher, { isActive: !(teacher.isActive ?? true) });
    addHrRecord({
      id: `hr-${Date.now()}`,
      action: (teacher.isActive ?? true) ? 'deactivate' : 'reactivate',
      userId: selectedTeacher,
      note: `Account ${(teacher.isActive ?? true) ? 'deactivated' : 'reactivated'} by admin`,
      createdAt: new Date().toISOString(),
    });
    addToast('Account status updated', 'info');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 border border-orange-500/30 app-shell-gradient">
        <h1 className="text-3xl font-extrabold gradient-text">Payroll and HR Control</h1>
        <p className="text-zinc-300 mt-1">Run salary entries, reset passwords, and control staff activation.</p>
      </motion.div>

      <Card className="bg-[#111] border border-orange-500/30 space-y-4">
        <label className="text-sm text-zinc-300">Teacher</label>
        <select className="input-field" value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}>
          <option value="">Select teacher</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
          ))}
        </select>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-zinc-300">Payroll Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm text-zinc-300">HR Note</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} className="input-field" placeholder="Performance note or memo" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" icon={IndianRupee} onClick={handleRunPayroll}>Run Payroll</Button>
          <Button variant="secondary" icon={UserCog} onClick={toggleTeacherActive}>Toggle Active</Button>
        </div>
      </Card>

      <Card className="bg-[#111] border border-orange-500/30 space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Briefcase size={17} className="text-orange-400" />Reset Teacher Password</h2>
        <input className="input-field" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New temporary password" />
        <Button variant="primary" icon={Plus} onClick={handleResetPassword}>Reset Password</Button>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#111] border border-orange-500/20">
          <h3 className="font-semibold text-white mb-3">Payroll Ledger</h3>
          <div className="space-y-2 text-sm">
            {payroll.slice().reverse().map((entry) => (
              <div key={entry.id} className="p-3 rounded-xl bg-[#1a1a1a] border border-orange-500/20">
                {entry.teacherName} · ₹{Number(entry.amount).toLocaleString('en-IN')} · {entry.month}
              </div>
            ))}
          </div>
        </Card>
        <Card className="bg-[#111] border border-orange-500/20">
          <h3 className="font-semibold text-white mb-3">HR Audit Trail</h3>
          <div className="space-y-2 text-sm">
            {hrRecords.slice().reverse().map((entry) => (
              <div key={entry.id} className="p-3 rounded-xl bg-[#1a1a1a] border border-orange-500/20">
                {entry.action} · {new Date(entry.createdAt).toLocaleString()} · {entry.note}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
