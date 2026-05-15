import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Send, Plus, Calendar, FileText, Download, CheckCircle, Clock, AlertCircle, Trash2, X } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';

export function FeeInstallments({ user, addToast }) {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInstallmentPlan, setShowInstallmentPlan] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [installmentData, setInstallmentData] = useState({ feeId: '', installments: 3, startDate: '', amountPerInstallment: 0 });
  const [paymentRecords, setPaymentRecords] = useState([]);

  useEffect(() => { loadFees(); }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getFees();
      if (res?.success) {
        setFees(res.data || []);
        // Auto-generate installment plans for pending fees
        const withInstallments = (res.data || []).map(f => ({
          ...f,
          installmentPlan: f.amount > 1000 && f.status === 'pending' ? generateInstallments(f.amount, 3, f.dueDate) : null,
        }));
        setFees(withInstallments);
      }
    } catch (e) { addToast?.('Failed to load fees', 'error'); }
    finally { setLoading(false); }
  };

  const generateInstallments = (totalAmount, numInstallments, dueDate) => {
    const amount = Math.round((totalAmount / numInstallments) * 100) / 100;
    const installments = [];
    const due = new Date(dueDate);
    for (let i = 0; i < numInstallments; i++) {
      const dueDateInst = new Date(due);
      dueDateInst.setDate(due.getDate() + (i * 30));
      installments.push({
        id: `inst-${Date.now()}-${i}`,
        number: i + 1,
        amount: i === numInstallments - 1 ? totalAmount - (amount * (numInstallments - 1)) : amount,
        dueDate: dueDateInst.toISOString().split('T')[0],
        status: 'pending',
        paidAt: null,
      });
    }
    return installments;
  };

  const handlePayment = async (feeId, installmentId = null) => {
    try {
      await teacherApi.updateFee(feeId, { status: 'paid' });
      addToast?.('Payment recorded successfully', 'success');
      loadFees();
    } catch (e) { addToast?.('Failed to record payment', 'error'); }
  };

  const handleRequestPlan = (fee) => {
    setSelectedFee(fee);
    const amount = Math.round((fee.amount / 3) * 100) / 100;
    setInstallmentData({ feeId: fee.id, installments: 3, startDate: new Date().toISOString().split('T')[0], amountPerInstallment: amount });
    setShowInstallmentPlan(true);
  };

  const handleCreatePlan = async () => {
    if (!selectedFee) return;
    try {
      // Mark fee as installment plan
      await teacherApi.updateFee(selectedFee.id, {
        status: 'partial',
        installmentPlan: installmentData,
      });
      addToast?.('Installment plan created', 'success');
      setShowInstallmentPlan(false);
      setSelectedFee(null);
      loadFees();
    } catch (e) { addToast?.('Failed to create plan', 'error'); }
  };

  const totalPending = fees.filter(f => f.status === 'pending' || f.status === 'partial').reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const overdueFees = fees.filter(f => f.status === 'overdue' || (f.status === 'pending' && new Date(f.dueDate) < new Date()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Fee Installment & Auto-Receipt Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">Manage fees, installment plans, and auto-generated receipts</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatPill icon={CreditCard} label="Total Pending" value={`₹${totalPending.toLocaleString()}`} gradient="from-amber-500 to-orange-500" glow="shadow-amber-500/10" />
        <StatPill icon={CheckCircle} label="Total Paid" value={`₹${totalPaid.toLocaleString()}`} gradient="from-emerald-500 to-teal-500" glow="shadow-emerald-500/10" />
        <StatPill icon={AlertCircle} label="Overdue" value={overdueFees.length} gradient="from-rose-500 to-red-500" glow="shadow-rose-500/10" />
        <StatPill icon={FileText} label="Total Records" value={fees.length} gradient="from-blue-500 to-sky-500" glow="shadow-blue-500/10" />
      </div>

      {/* Fee List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Fee Records</h3>
          <span className="text-[10px] text-slate-500">{fees.length} records</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading fees...</div>
        ) : fees.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
            <p>No fee records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-700/30">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Term</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {fees.map((fee) => {
                    const isOverdue = fee.status === 'pending' && new Date(fee.dueDate) < new Date();
                    const statusColor = fee.status === 'paid' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                      fee.status === 'overdue' || isOverdue ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' :
                        fee.status === 'partial' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                          'text-slate-400 border-slate-700/30 bg-white/5';

                    const statusLabel = fee.status === 'paid' ? 'Paid' :
                      fee.status === 'overdue' || isOverdue ? 'Overdue' :
                        fee.status === 'partial' ? 'Installment' : 'Pending';

                    return (
                      <motion.tr key={fee.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="border-b border-slate-700/15">
                        <td className="py-3 px-4">
                          <p className="text-sm font-bold text-white">{fee.studentName || fee.student_id}</p>
                          <p className="text-[10px] text-slate-500">{fee.grade} - {fee.section}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-300">{fee.term}</td>
                        <td className="py-3 px-4 text-sm font-bold text-white">₹{fee.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-full border capitalize ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-400">{fee.due_date || fee.dueDate}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {fee.status === 'pending' && !isOverdue && (
                              <button onClick={() => handleRequestPlan(fee)} className="p-1.5 rounded-lg hover:bg-white/5 text-blue-400 hover:text-blue-300 transition-colors" title="Installment Plan">
                                <CreditCard size={14} />
                              </button>
                            )}
                            {(fee.status === 'pending' || fee.status === 'overdue' || isOverdue) && (
                              <button onClick={() => handlePayment(fee.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-emerald-400 hover:text-emerald-300 transition-colors" title="Mark as Paid">
                                <CheckCircle size={14} />
                              </button>
                            )}
                            {fee.installmentPlan && (
                              <button className="p-1.5 rounded-lg hover:bg-white/5 text-amber-400 hover:text-amber-300 transition-colors" title="View Installments">
                                <Calendar size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Installment Plan Section */}
      {selectedFee && installmentData && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Installment Plan for {selectedFee.studentName || selectedFee.student_id}</h3>
            <button onClick={() => { setShowInstallmentPlan(false); setSelectedFee(null); }} className="text-slate-400 hover:text-white"><X size={18} /></button>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Total: <span className="font-bold text-white">₹{selectedFee.amount.toLocaleString()}</span> · Split into{' '}
            <span className="font-bold text-white">{installmentData.installments} installments</span> of{' '}
            <span className="font-bold text-amber-400">₹{installmentData.amountPerInstallment.toLocaleString()}</span> each
          </p>
          <div className="space-y-3">
            {installmentData.startDate && Array.from({ length: installmentData.installments }, (_, i) => {
              const dueDate = new Date(installmentData.startDate);
              dueDate.setDate(dueDate.getDate() + (i * 30));
              const isPast = dueDate < new Date();
              return (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border ${
                  i === 0 ? 'bg-amber-500/5 border-amber-500/30' : 'bg-white/5 border-slate-700/30'
                }`}>
                  <span className="text-sm font-bold text-slate-400 w-6">#{i + 1}</span>
                  <span className="text-sm text-white flex-1">Due: {dueDate.toLocaleDateString()}</span>
                  <span className={`text-sm font-bold ${isPast && i > 0 ? 'text-rose-400' : 'text-amber-400'}`}>₹{installmentData.amountPerInstallment.toLocaleString()}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isPast && i > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {i === 0 ? 'Next' : isPast ? 'Overdue' : 'Upcoming'}
                  </span>
                </div>
              );
            })}
            <button onClick={handleCreatePlan} className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2">
              <Send size={16} /> Activate Installment Plan
            </button>
          </div>
        </Card>
      )}

      {/* Auto-Receipt Section */}
      <Card>
        <h3 className="text-sm font-bold text-slate-300 mb-4">Auto-Generated Receipts</h3>
        <p className="text-xs text-slate-500 mb-4">Receipts are automatically generated upon payment confirmation and sent to parent email.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-4 border border-slate-700/30">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">📧 Email Delivery</p>
            <p className="text-sm text-slate-300">PDF receipts auto-sent to parent/guardian email upon payment confirmation.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-slate-700/30">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">📄 PDF Export</p>
            <p className="text-sm text-slate-300">Download individual or bulk receipt PDFs for record keeping.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-slate-700/30">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">🔄 Auto-Reminders</p>
            <p className="text-sm text-slate-300">Overdue fees trigger automated reminder emails to parents every 7 days.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-slate-700/30">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">📊 Payment Tracking</p>
            <p className="text-sm text-slate-300">Real-time payment status dashboard with filtering and export options.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, gradient, glow }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`relative overflow-hidden rounded-2xl p-4 ${gradient} border ${glow} shadow-lg`}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/5 -mr-3 -mt-3" />
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-sm">
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
          <p className="text-[10px] font-semibold text-white/70 uppercase tracking-widest">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}