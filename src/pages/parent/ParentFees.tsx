import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreditCard, DollarSign, Calendar, TrendingUp, Users, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface FeeRecord {
  id: string;
  description: string;
  amount: number;
  paid: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  type: 'tuition' | 'transport' | 'activity' | 'exam';
}

interface ChildInfo {
  id: string;
  name: string;
  class: string;
}

interface ChildWithFees {
  child: ChildInfo;
  fees: FeeRecord[];
  loading: boolean;
  error?: string;
}

export default function ParentFees() {
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [childrenWithFees, setChildrenWithFees] = useState<ChildWithFees[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAllChildrenFees();
  }, []);

  const loadAllChildrenFees = async () => {
    try {
      setLoading(true);
      const childrenRes = await api.getChildren();
      const childrenList: ChildInfo[] = childrenRes?.success ? (childrenRes.children || []) : [];
      setChildren(childrenList);

      if (childrenList.length === 0) {
        setChildrenWithFees([]);
        setLoading(false);
        return;
      }

      setExpandedChildren(new Set(childrenList.map(c => c.id)));

      setChildrenWithFees(childrenList.map(child => ({
        child,
        fees: [],
        loading: true,
      })));

      const results = await Promise.allSettled(
        childrenList.map(child =>
          api.getChildFees(child.id).then(data => {
            // The parent route returns { success, pendingFees, paidHistory, summary }
            const fees = data?.pendingFees || data?.paidHistory
              ? [...(data.pendingFees || []), ...(data.paidHistory || [])]
              : (Array.isArray(data) ? data : []);
            return { childId: child.id, fees };
          })
        )
      );

      setChildrenWithFees(prev =>
        prev.map(item => {
          const result = results.find(
            r => r.status === 'fulfilled' && r.value.childId === item.child.id
          );
          if (result && result.status === 'fulfilled') {
            return { ...item, fees: result.value.fees, loading: false };
          }
          return { ...item, loading: false, error: 'Failed to load' };
        })
      );
    } catch (err) {
      console.error('[ParentFees] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleChild = (childId: string) => {
    setExpandedChildren(prev => {
      const next = new Set(prev);
      if (next.has(childId)) next.delete(childId);
      else next.add(childId);
      return next;
    });
  };

  // Overall stats across all children
  const allFees = childrenWithFees.flatMap(c => c.fees);
  const totalAmount = allFees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = allFees.reduce((sum, f) => sum + (f.paid || 0), 0);
  const totalPending = totalAmount - totalPaid;

  const getChildFeeStats = (fees: FeeRecord[]) => {
    const total = fees.reduce((sum, f) => sum + f.amount, 0);
    const paid = fees.reduce((sum, f) => sum + (f.paid || 0), 0);
    const pending = total - paid;
    const overdue = fees.filter(f => f.status === 'overdue').length;
    return { total, paid, pending, overdue };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Children's Fees</h1>
        <p className="text-muted-foreground">Fee payments & receipts for all your children</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{children.length}</p>
              <p className="text-sm text-muted-foreground">Children</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Fees</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Paid</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">₹{totalPending.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {loading && children.length === 0 ? (
        <div className="space-y-4">{ [1, 2, 3].map(i => <Skeleton key={i} className="h-20" />) }</div>
      ) : children.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Children Linked</h3>
          <p className="text-muted-foreground">Go to "My Children" to link your children first.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {childrenWithFees.map(({ child, fees, loading: childLoading, error }) => {
            const isExpanded = expandedChildren.has(child.id);
            const stats = getChildFeeStats(fees);

            return (
              <Card key={child.id} className="overflow-hidden">
                <button
                  onClick={() => toggleChild(child.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                      {child.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">Class {child.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!childLoading && fees.length > 0 && (
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${stats.pending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{stats.pending.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Due</p>
                      </div>
                    )}
                    {childLoading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-4 pb-4">
                    {/* Per-child mini stats */}
                    {!childLoading && fees.length > 0 && (
                      <div className="flex gap-4 pt-4 pb-3 text-xs">
                        <span className="flex items-center gap-1 text-green-600">
                          <DollarSign className="w-3 h-3" /> Total: ₹{stats.total.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-orange-600">
                          <TrendingUp className="w-3 h-3" /> Paid: ₹{stats.paid.toLocaleString()}
                        </span>
                        {stats.pending > 0 && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="w-3 h-3" /> Due: ₹{stats.pending.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}

                    {childLoading ? (
                      <div className="space-y-3 pt-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                      </div>
                    ) : error ? (
                      <div className="p-4 mt-4 text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg">
                        Failed to load fees for {child.name}
                      </div>
                    ) : fees.length === 0 ? (
                      <div className="p-4 mt-4 text-center text-muted-foreground text-sm bg-accent/50 rounded-lg">
                        No fee records for {child.name}
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-4">
                        {fees.map(fee => {
                          const paidPercent = fee.amount > 0 ? Math.round(((fee.paid || 0) / fee.amount) * 100) : 0;
                          return (
                            <div key={fee.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{fee.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] px-1.5 py-0">
                                    {fee.type}
                                  </Badge>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Due: {new Date(fee.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                                {/* Payment progress bar */}
                                <div className="w-full h-1.5 bg-accent rounded-full mt-2">
                                  <div
                                    className={`h-full rounded-full ${paidPercent >= 100 ? 'bg-green-500' : paidPercent > 0 ? 'bg-orange-400' : 'bg-red-400'}`}
                                    style={{ width: `${Math.min(paidPercent, 100)}%` }}
                                  />
                                </div>
                              </div>
                              <div className="text-right ml-4 shrink-0">
                                <p className="font-semibold text-sm">₹{fee.amount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Paid: ₹{(fee.paid || 0).toLocaleString()}</p>
                                <Badge className={getStatusColor(fee.status)}>
                                  {fee.status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
