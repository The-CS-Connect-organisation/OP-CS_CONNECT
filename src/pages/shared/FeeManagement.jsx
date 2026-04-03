import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { useToast } from '../../hooks/useToast'; // if you have it, else use addToast prop

export const FeeManagement = ({ user, addToast }) => {
  const { data: fees, add, update } = useStore(KEYS.FEES || 'sms_fees', []); // we'll add this key later
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [upiId, setUpiId] = useState('');

  // Seed some fee data if none exists (run once)
  const myFees = useMemo(() => {
    if (user.role === 'student' || user.role === 'parent') {
      return fees.filter(f => f.studentId === user.id);
    }
    return fees; // admin sees all
  }, [fees, user]);

  const totalDue = myFees.reduce((sum, f) => sum + (f.status === 'pending' ? f.amount : 0), 0);

  const handlePay = () => {
    if (!selectedFee || !upiId) return;

    // Simulate payment
    setTimeout(() => {
      update(selectedFee.id, { 
        status: 'paid', 
        paidAt: new Date().toISOString().split('T')[0],
        transactionId: 'UPI' + Date.now()
      });
      
      setShowPayModal(false);
      setUpiId('');
      addToast('Payment successful via UPI! ✅ Receipt generated.', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <CreditCard className="text-primary-500" /> Fee Management
          </h1>
          <p className="text-gray-500">Total Due: ₹{totalDue}</p>
        </div>
        {user.role === 'admin' && (
          <Button variant="primary">Add Fee Structure</Button>
        )}
      </div>

      <div className="grid gap-4">
        {myFees.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">No fee records found</p>
          </Card>
        ) : (
          myFees.map((fee) => (
            <motion.div key={fee.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="flex flex-col md:flex-row md:items-center gap-6 p-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{fee.term} Fee</h3>
                    {fee.status === 'paid' ? (
                      <Badge color="green">Paid</Badge>
                    ) : (
                      <Badge color="red">Pending</Badge>
                    )}
                  </div>
                  <p className="text-gray-500 mt-1">Due Date: {fee.dueDate}</p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold">₹{fee.amount}</p>
                  {fee.status === 'pending' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => { setSelectedFee(fee); setShowPayModal(true); }}
                      className="mt-3"
                    >
                      Pay Now
                    </Button>
                  )}
                  {fee.status === 'paid' && (
                    <Button variant="ghost" size="sm" icon={Download} className="mt-3">
                      Download Receipt
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Pay Modal */}
      <Modal 
        isOpen={showPayModal} 
        onClose={() => setShowPayModal(false)} 
        title="Pay Fee via UPI"
      >
        {selectedFee && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <p className="text-sm text-gray-500">Amount to Pay</p>
              <p className="text-3xl font-bold">₹{selectedFee.amount}</p>
              <p className="text-xs text-gray-400 mt-1">{selectedFee.term} • {selectedFee.studentName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-2">Example: navaneeth@oksbi</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowPayModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="flex-1" 
                onClick={handlePay}
                disabled={!upiId}
              >
                Pay ₹{selectedFee.amount}
              </Button>
            </div>

            <p className="text-center text-xs text-gray-400">🔒 Secure UPI Payment Simulation</p>
          </div>
        )}
      </Modal>
    </div>
  );
};