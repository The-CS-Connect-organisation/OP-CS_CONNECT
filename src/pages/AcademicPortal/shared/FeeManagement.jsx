import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle, Download, Plus, Trash2, Edit, Search } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { getFromStorage, KEYS } from '../../../data/schema';
import { hasPermission, PERMISSIONS } from '../../../utils/permissions';
import { request } from '../../../utils/apiClient';
import { isMongoId } from '../../../utils/socketClient';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { playPaymentSuccessSound } from '../../../utils/sound';

export const FeeManagement = ({ user, addToast }) => {
  const [fees, setFees] = useState([]);
  const [loadingFees, setLoadingFees] = useState(true);
  const [apiStudents, setApiStudents] = useState(null);
  
  const [showPayModal, setShowPayModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmFee, setConfirmFee] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [animatedAmount, setAnimatedAmount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newFeeStudentId, setNewFeeStudentId] = useState('');
  const [newFeeTerm, setNewFeeTerm] = useState('Custom Fee');
  const [newFeeAmount, setNewFeeAmount] = useState(10000);
  const [newFeeDueDate, setNewFeeDueDate] = useState(new Date().toISOString().split('T')[0]);

  const canManageFees = hasPermission(user, PERMISSIONS.FEES_MANAGE);

  const useApiStudents =
    canManageFees && !!getFromStorage(KEYS.AUTH_TOKEN) && isMongoId(user?.id);

  useEffect(() => {
    if (!useApiStudents) {
      setApiStudents(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await request('/school/students?limit=500');
        if (cancelled) return;
        const rows = (res.items || []).map((p) => {
          const uid = p.userId?._id != null ? String(p.userId._id) : String(p.userId);
          return {
            id: uid,
            name: p.userId?.name || 'Student',
            class: `Grade ${p.grade} · Sec ${p.section}`,
            rollNo: p.rollNumber,
            role: 'student',
          };
        });
        setApiStudents(rows);
      } catch {
        if (!cancelled) setApiStudents([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useApiStudents]);

  // Fetch fees from API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await request('/fees');
        if (cancelled) return;
        const feeData = res?.fees || res?.items || res || [];
        setFees(feeData);
      } catch (err) {
        console.error('Failed to load fees:', err);
        setFees([]);
      } finally {
        if (!cancelled) setLoadingFees(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const studentOptions = useMemo(() => {
    if (apiStudents && apiStudents.length > 0) return apiStudents;
    return [];
  }, [apiStudents]);

  const resolveStudent = (studentId) =>
    studentOptions.find((s) => s.id === studentId);

  // Admin edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFeeId, setEditFeeId] = useState(null);
  const [editFeeStudentId, setEditFeeStudentId] = useState('');
  const [editFeeTerm, setEditFeeTerm] = useState('');
  const [editFeeAmount, setEditFeeAmount] = useState(0);
  const [editFeeDueDate, setEditFeeDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [editFeeStatus, setEditFeeStatus] = useState('pending');
  const [editFeePaidAt, setEditFeePaidAt] = useState(new Date().toISOString().split('T')[0]);
  const [editFeeTransactionId, setEditFeeTransactionId] = useState('');
  const [editFeePaymentMethod, setEditFeePaymentMethod] = useState('Manual');

  const todayStr = new Date().toISOString().split('T')[0];

  const getIsOverdue = (fee) => {
    if (!fee || fee.status !== 'pending') return false;
    if (!fee.dueDate) return false;
    const due = new Date(`${fee.dueDate}T00:00:00`);
    const today = new Date(`${todayStr}T00:00:00`);
    return due < today;
  };

  // Filter fees based on user role
  const myFees = useMemo(() => {
    let filtered = fees;
    
    if (user.role === 'student') {
      filtered = fees.filter(f => f.studentId === user.id);
    } else if (user.role === 'admin') {
      // Admin sees all, but can filter
      if (search) {
        filtered = filtered.filter(f => 
          f.studentName.toLowerCase().includes(search.toLowerCase()) ||
          f.term.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (statusFilter !== 'all') {
        filtered = filtered.filter(f => f.status === statusFilter);
      }
    }
    
    return filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [fees, user, search, statusFilter]);

  const totalDue = myFees.reduce((sum, f) => sum + (f.status === 'pending' ? f.amount : 0), 0);
  const totalPaid = myFees.reduce((sum, f) => sum + (f.status === 'paid' ? f.amount : 0), 0);

  // Loading state
  if (loadingFees) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  useEffect(() => {
    // Auto-pick a student when opening the add modal (for smoother UX).
    if (showAddModal && studentOptions.length > 0) {
      const stillValid = studentOptions.some((s) => s.id === newFeeStudentId);
      if (!newFeeStudentId || !stillValid) {
        setNewFeeStudentId(studentOptions[0].id);
      }
    }
  }, [showAddModal, newFeeStudentId, studentOptions]);

  // Admin: Add new fee via API
  const handleAddFee = async () => {
    if (!canManageFees) return;
    if (studentOptions.length === 0) {
      addToast('Add at least one student in Manage Users before allocating fees.', 'error');
      return;
    }
    const student = resolveStudent(newFeeStudentId);
    if (!student) {
      addToast('Select a student to allocate this fee.', 'error');
      return;
    }

    const amountNum = Number(newFeeAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      addToast('Enter a valid fee amount greater than zero.', 'error');
      return;
    }
    if (!newFeeDueDate) {
      addToast('Choose a due date for this fee.', 'error');
      return;
    }

    try {
      const res = await request('/fees', {
        method: 'POST',
        body: JSON.stringify({
          studentId: student.id,
          term: (newFeeTerm || 'Custom Fee').trim(),
          amount: amountNum,
          dueDate: newFeeDueDate,
        }),
      });
      // Refresh fees after adding
      const feesRes = await request('/fees');
      setFees(feesRes?.fees || feesRes?.items || feesRes || []);
      setNewFeeTerm('Custom Fee');
      setNewFeeAmount(10000);
      setNewFeeDueDate(new Date().toISOString().split('T')[0]);
      setShowAddModal(false);
      addToast('Fee structure added! ✏️', 'success');
    } catch (err) {
      addToast('Failed to add fee: ' + err.message, 'error');
    }
  };

  // Admin: Mark as paid manually via API
  const handleMarkPaid = async (fee) => {
    if (!canManageFees) return;
    try {
      await request(`/fees/${fee.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'paid',
          paidAt: new Date().toISOString().split('T')[0],
          transactionId: `ADMIN-${Date.now()}`,
          paymentMethod: 'Manual'
        }),
      });
      // Refresh fees
      const feesRes = await request('/fees');
      setFees(feesRes?.fees || feesRes?.items || feesRes || []);
      addToast(`Fee marked as paid for ${fee.studentName}! ✅`, 'success');
    } catch (err) {
      addToast('Failed to update fee: ' + err.message, 'error');
    }
  };

  const handleMarkPending = async (fee) => {
    if (!canManageFees) return;
    try {
      await request(`/fees/${fee.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'pending',
          paidAt: null,
          transactionId: null,
          paymentMethod: null,
        }),
      });
      // Refresh fees
      const feesRes = await request('/fees');
      setFees(feesRes?.fees || feesRes?.items || feesRes || []);
      addToast(`Fee set back to pending for ${fee.studentName}.`, 'info');
    } catch (err) {
      addToast('Failed to update fee: ' + err.message, 'error');
    }
  };

  const downloadFeeReceiptPDF = (fee) => {
    if (!fee || fee.status !== 'paid') return;

    const student = resolveStudent(fee.studentId);
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('SchoolSync Fee Receipt', 105, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Receipt ID: ${fee.transactionId || 'N/A'}`, 14, 34);

    // Student details
    doc.setFontSize(12);
    doc.text('Student Details', 14, 52);
    doc.setFontSize(10);
    doc.text(`Name: ${fee.studentName}`, 14, 60);
    doc.text(`Class: ${fee.class}`, 14, 68);
    doc.text(`Roll No: ${student?.rollNo || 'N/A'}`, 14, 76);

    // Fee details + payment details table
    const tableBody = [
      ['Term', fee.term],
      ['Amount', `₹${fee.amount?.toLocaleString?.('en-IN') || fee.amount}`],
      ['Due Date', fee.dueDate],
      ['Status', 'PAID'],
      ['Paid At', fee.paidAt || 'N/A'],
      ['Payment Method', fee.paymentMethod || 'N/A'],
      ['Transaction ID', fee.transactionId || 'N/A'],
    ];

    autoTable(doc, {
      startY: 88,
      head: [['Field', 'Value']],
      body: tableBody,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [14, 165, 233] }
    });

    const finalY = doc.lastAutoTable?.finalY || 140;
    doc.setFontSize(9);
    doc.text('This is a computer-generated receipt.', 105, finalY + 18, { align: 'center' });
    doc.text('Generated by SchoolSync.', 105, finalY + 28, { align: 'center' });

    const safeStudentName = (fee.studentName || 'Student').replace(/[^a-z0-9]/gi, '_');
    const safeTerm = (fee.term || 'Fee').replace(/[^a-z0-9]/gi, '_');
    doc.save(`FeeReceipt_${safeStudentName}_${safeTerm}.pdf`);
  };

  // Student: Pay via UPI (simulated)
  const handlePay = () => {
    if (!selectedFee || !upiId) return;
    if (isPaying) return;

    setIsPaying(true);
    setPaymentSuccess(false);

    // Simulate payment delay
    setTimeout(() => {
      update(selectedFee.id, {
        status: 'paid',
        paidAt: new Date().toISOString().split('T')[0],
        transactionId: `UPI-${Date.now()}`,
        paymentMethod: 'UPI',
      });

      setPaymentSuccess(true);
      setIsPaying(false);
      setAnimatedAmount(0);
      // Sound feedback for success.
      try { playPaymentSuccessSound(); } catch {}

      // Close modal after the success animation
      setTimeout(() => {
        setShowPayModal(false);
        setUpiId('');
        setPaymentSuccess(false);
      }, 3000);

      addToast('Payment successful via UPI! ✅ Receipt generated.', 'success');
    }, 1200);
  };

  useEffect(() => {
    if (!paymentSuccess || !selectedFee) return;
    const target = Number(selectedFee.amount || 0);
    let current = 0;
    const step = Math.max(1, Math.round(target / 28));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setAnimatedAmount(current);
    }, 40);
    return () => clearInterval(interval);
  }, [paymentSuccess, selectedFee]);

  // Admin: Delete fee
  const handleDelete = (fee) => {
    if (!canManageFees) return;
    setConfirmFee(fee);
    setConfirmOpen(true);
  };

  const openEditFee = (fee) => {
    if (!canManageFees) return;
    setEditFeeId(fee.id);
    setEditFeeStudentId(fee.studentId);
    setEditFeeTerm(fee.term);
    setEditFeeAmount(fee.amount);
    setEditFeeDueDate(fee.dueDate);
    setEditFeeStatus(fee.status);
    setEditFeePaidAt(fee.paidAt || todayStr);
    setEditFeeTransactionId(fee.transactionId || `ADMIN-${Date.now()}`);
    setEditFeePaymentMethod(fee.paymentMethod || 'Manual');
    setShowEditModal(true);
  };

  const handleSaveEditFee = () => {
    if (!canManageFees) return;
    if (!editFeeId) return;

    const student = resolveStudent(editFeeStudentId);
    if (!student) {
      addToast('Select a valid student for this fee record.', 'error');
      return;
    }

    const amountNum = Number(editFeeAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      addToast('Amount must be a valid positive number.', 'error');
      return;
    }

    const updateObj = {
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      term: editFeeTerm || 'Custom Fee',
      amount: amountNum,
      dueDate: editFeeDueDate,
      status: editFeeStatus,
    };

    if (editFeeStatus === 'paid') {
      updateObj.paidAt = editFeePaidAt || todayStr;
      updateObj.transactionId = editFeeTransactionId || `ADMIN-${Date.now()}`;
      updateObj.paymentMethod = editFeePaymentMethod || 'Manual';
    } else {
      updateObj.paidAt = null;
      updateObj.transactionId = null;
      updateObj.paymentMethod = null;
    }

    update(editFeeId, updateObj);
    setShowEditModal(false);
    setEditFeeId(null);
    addToast('Fee record updated successfully! ✅', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[var(--text-primary)] flex items-center gap-3">
            <CreditCard className="text-primary-500" /> Fee Management
          </h1>
          <p className="text-gray-500 mt-1">
            {user.role === 'admin'
              ? 'Allocate fees, track collections, and reconcile student billing in one place.'
              : `Total Due: ₹${totalDue.toLocaleString('en-IN')}`}
          </p>
        </motion.div>
        
        {user.role === 'admin' && (
          <div className="flex gap-3">
            <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
              Allocate fee
            </Button>
          </div>
        )}
      </div>

      {user.role === 'admin' && (
        <Card className="border border-primary-200/60 dark:border-primary-900/40 bg-gradient-to-r from-primary-50/80 to-purple-50/50 dark:from-primary-950/40 dark:to-purple-950/20">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            <span className="font-semibold text-primary-600 dark:text-primary-400">Tip:</span>{' '}
            Use <strong>Allocate fee</strong> to assign a charge to a student (term name, amount, due date). Students see pending items under their Fees page; you can mark paid or edit records anytime.
          </p>
        </Card>
      )}

      {/* Admin Filters */}
      {user.role === 'admin' && (
        <Card className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search student or term..." 
              className="input-field pl-9 pr-4 py-2.5 text-sm" 
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'paid'].map(status => (
              <button 
                key={status} 
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
                  statusFilter === status 
                    ? 'bg-primary-500 text-[var(--text-primary)]' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Stats Cards (Admin) */}
      {user.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500">Pending Collection</p>
            <p className="text-2xl font-bold text-orange-600">₹{totalDue.toLocaleString('en-IN')}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-2xl font-bold text-primary-600">{myFees.length}</p>
          </Card>
        </div>
      )}

      {/* Fee List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {myFees.length === 0 ? (
            <Card className="text-center py-12">
              <CreditCard size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500">No fee records found</p>
            </Card>
          ) : (
            myFees.map((fee, idx) => (
              <motion.div 
                key={fee.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="flex flex-col md:flex-row md:items-center gap-6 p-6 hover:shadow-xl transition-shadow">
                  {/* Left: Fee Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-lg">{fee.term}</h3>
                      <Badge
                        color={
                          fee.status === 'paid'
                            ? 'emerald'
                            : getIsOverdue(fee)
                              ? 'rose'
                              : 'amber'
                        }
                      >
                        {fee.status === 'paid' ? 'Paid' : getIsOverdue(fee) ? 'Overdue' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-gray-500 mt-1">
                      {fee.studentName} • Class {fee.class} • Due: {fee.dueDate}
                    </p>
                    {fee.status === 'paid' && fee.paidAt && (
                      <p className="text-xs text-emerald-600 mt-1">
                        Paid on {fee.paidAt} via {fee.paymentMethod}
                      </p>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹{fee.amount.toLocaleString('en-IN')}</p>
                    
                    {user.role === 'student' && fee.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => { setSelectedFee(fee); setShowPayModal(true); }}
                        className="mt-3"
                      >
                        Pay Now
                      </Button>
                    )}
                    
                    {user.role === 'student' && fee.status === 'paid' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Download}
                        className="mt-3"
                        onClick={() => downloadFeeReceiptPDF(fee)}
                      >
                        Download Receipt
                      </Button>
                    )}
                    
                    {user.role === 'admin' && canManageFees && (
                      <div className="flex gap-2 justify-end mt-3">
                        {fee.status === 'pending' ? (
                          <Button variant="secondary" size="sm" icon={CheckCircle} onClick={() => handleMarkPaid(fee)}>
                            Mark Paid
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => handleMarkPending(fee)}>
                            Mark Pending
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => openEditFee(fee)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Trash2} 
                          className="text-red-500"
                          onClick={() => handleDelete(fee)}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Student Pay Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="Pay Fee via UPI"
      >
        {selectedFee && (
          <div className="space-y-6">
            {!paymentSuccess ? (
              <>
                <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Amount to Pay</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    ₹{selectedFee.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
                    {selectedFee.term} • {selectedFee.studentName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="input-field"
                    disabled={isPaying}
                  />
                  <p className="text-xs text-gray-500 mt-2">Example: navaneeth@oksbi</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      if (!isPaying) setShowPayModal(false);
                    }}
                    disabled={isPaying}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handlePay}
                    disabled={!upiId || isPaying}
                  >
                    {isPaying ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                        Processing...
                      </span>
                    ) : (
                      `Pay ₹${selectedFee.amount.toLocaleString('en-IN')}`
                    )}
                  </Button>
                </div>

                <p className="text-center text-xs text-gray-400">🔒 Secure UPI Payment Simulation</p>
              </>
            ) : (
              <div className="relative flex flex-col items-center text-center gap-4 pt-2 overflow-hidden">
                {/* Orange confetti burst */}
                <div className="pointer-events-none absolute inset-0">
                  {Array.from({ length: 18 }).map((_, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.2, 1, 0.6],
                        x: Math.cos((idx / 18) * Math.PI * 2) * 120,
                        y: Math.sin((idx / 18) * Math.PI * 2) * 120,
                      }}
                      transition={{ duration: 1.1, ease: 'easeOut' }}
                      className={`absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-sm ${idx % 2 ? 'bg-orange-500' : 'bg-white'}`}
                    />
                  ))}
                </div>

                {/* Drawn checkmark */}
                <motion.svg width="96" height="96" viewBox="0 0 96 96" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <circle cx="48" cy="48" r="36" stroke="#ff8c00" strokeWidth="6" fill="transparent" />
                  <motion.path
                    d="M30 50 L43 62 L67 36"
                    stroke="#ffffff"
                    strokeWidth="7"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </motion.svg>

                <motion.h2
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-2xl font-extrabold text-orange-400 animate-glow-pulse"
                >
                  Payment Successful
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 16 }}
                  className="w-full max-w-sm rounded-2xl border p-4"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Amount Paid</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>₹{animatedAmount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-emerald-500 mt-2">Receipt card auto-dismisses in 3s</p>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Admin Add Fee Modal */}
      {user.role === 'admin' && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Fee Structure"
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 Standard fee is ₹1,50,000 split into 3 terms (₹50,000 each). 
                Use this to add custom fees or adjustments.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Student</label>
              <select
                className="input-field"
                value={newFeeStudentId}
                onChange={(e) => setNewFeeStudentId(e.target.value)}
                disabled={studentOptions.length === 0}
              >
                {studentOptions.length === 0 ? (
                  <option value="">No students — add users first</option>
                ) : (
                  studentOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.class || '—'})
                    </option>
                  ))
                )}
              </select>
              {studentOptions.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Go to <strong>Manage Users</strong> and create at least one student account, then return here.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Term Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={newFeeTerm}
                  onChange={(e) => setNewFeeTerm(e.target.value)}
                  placeholder="e.g., Extra Activity Fee"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={newFeeAmount}
                  onChange={(e) => setNewFeeAmount(e.target.value)}
                  placeholder="10000"
                  min={0}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                className="input-field"
                value={newFeeDueDate}
                onChange={(e) => setNewFeeDueDate(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddFee} disabled={studentOptions.length === 0}>
                Allocate fee
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Edit Fee Modal */}
      {user.role === 'admin' && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Fee Record"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select
                  className="input-field"
                  value={editFeeStudentId}
                  onChange={(e) => setEditFeeStudentId(e.target.value)}
                >
                  {studentOptions.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="input-field"
                  value={editFeeStatus}
                  onChange={(e) => setEditFeeStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Term Name</label>
              <input
                type="text"
                className="input-field"
                value={editFeeTerm}
                onChange={(e) => setEditFeeTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={editFeeAmount}
                  onChange={(e) => setEditFeeAmount(e.target.value)}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={editFeeDueDate}
                  onChange={(e) => setEditFeeDueDate(e.target.value)}
                />
              </div>
            </div>

            {editFeeStatus === 'paid' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Paid At</label>
                    <input
                      type="date"
                      className="input-field"
                      value={editFeePaidAt}
                      onChange={(e) => setEditFeePaidAt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Method</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editFeePaymentMethod}
                      onChange={(e) => setEditFeePaymentMethod(e.target.value)}
                      placeholder="Manual / UPI / Card"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transaction ID</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editFeeTransactionId}
                    onChange={(e) => setEditFeeTransactionId(e.target.value)}
                    placeholder="UPI-..."
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEditFee}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmFee(null);
        }}
        title="Delete Fee"
        danger
        confirmText="Delete"
        description={confirmFee ? `Delete fee record for ${confirmFee.studentName}?` : 'Delete this fee record?'}
        onConfirm={() => {
          if (!confirmFee) return;
          remove(confirmFee.id);
          addToast('Fee record deleted', 'info');
          setConfirmOpen(false);
          setConfirmFee(null);
        }}
      />
    </div>
  );
};
