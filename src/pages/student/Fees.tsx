import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { useAuthStore, useDataStore } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, CheckCircle2, AlertCircle, Clock, Receipt } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function FeesPage() {
  const { user } = useAuthStore()
  const { fees, isLoading } = useDataStore()

  const totalFees = fees.reduce((a: number, f: any) => a + (f.amount || 0), 0)
  const paidFees = fees.reduce((a: number, f: any) => a + (f.paid || 0), 0)
  const dueFees = totalFees - paidFees
  const paidPercent = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0

  const pieData = [
    { name: 'Paid', value: paidFees, color: '#10b981' },
    { name: 'Due', value: dueFees, color: '#ef4444' },
  ]

  const statusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-6 h-6 text-emerald-500" />
      case 'partial': return <Clock className="w-6 h-6 text-amber-500" />
      case 'unpaid': return <AlertCircle className="w-6 h-6 text-red-500" />
      default: return <Receipt className="w-6 h-6 text-muted-foreground" />
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'partial': return 'warning'
      case 'unpaid': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6 text-primary" /> Fee Status</h1>
          <p className="text-muted-foreground text-sm mt-1">Your fee payment records</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : fees.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No fee records found</CardContent></Card>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div variants={itemVariants}>
                <Card glow>
                  <CardContent className="p-5 text-center">
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value" startAngle={90} endAngle={-270}>
                            {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-2xl font-bold">{paidPercent}%</p>
                    <p className="text-sm text-muted-foreground">Fee Completion</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card glow>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
                    <div><p className="text-sm text-muted-foreground">Total Paid</p><p className="text-2xl font-bold text-emerald-500">{formatCurrency(paidFees)}</p></div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card glow>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-red-500" /></div>
                    <div><p className="text-sm text-muted-foreground">Amount Due</p><p className="text-2xl font-bold text-red-500">{formatCurrency(dueFees)}</p></div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Term Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fees.map((fee: any) => (
                <motion.div key={fee.term} variants={itemVariants}>
                  <Card glow className="hover:border-primary/20 transition-colors">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {statusIcon(fee.status)}
                          <div>
                            <p className="font-semibold">{fee.term}</p>
                            <p className="text-xs text-muted-foreground">{fee.date ? new Date(fee.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
                          </div>
                        </div>
                        <Badge variant={statusColor(fee.status) as any}>{fee.status}</Badge>
                      </div>
                      <Progress value={(fee.paid / fee.amount) * 100} size="md" />
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><p className="text-xs text-muted-foreground">Total</p><p className="text-sm font-semibold">{formatCurrency(fee.amount)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Paid</p><p className="text-sm font-semibold text-emerald-500">{formatCurrency(fee.paid)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Due</p><p className="text-sm font-semibold text-red-500">{formatCurrency(fee.amount - fee.paid)}</p></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
  )
}
