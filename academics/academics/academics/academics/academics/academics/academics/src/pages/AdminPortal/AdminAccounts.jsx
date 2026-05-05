import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Filter, Search, Plus, Edit2, Trash2, Eye, Download, FileText, Calendar, CheckCircle, XCircle, AlertCircle, Clock, Users, Building, PiggyBank, Receipt } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const AdminAccounts = ({ user, addToast }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Wallet },
    { id: 'fee-accounts', label: 'Fee Accounts', icon: DollarSign },
    { id: 'salary-accounts', label: 'Salary Accounts', icon: CreditCard },
    { id: 'expense-accounts', label: 'Expense Accounts', icon: Receipt },
    { id: 'transactions', label: 'Transactions', icon: TrendingUp },
  ];

  const stats = [
    { label: 'Total Revenue', value: '₹45,23,450', change: '+12.5%', trend: 'up', icon: TrendingUp, color: 'green' },
    { label: 'Total Expenses', value: '₹28,15,230', change: '+8.2%', trend: 'up', icon: TrendingDown, color: 'red' },
    { label: 'Net Balance', value: '₹17,08,220', change: '+18.3%', trend: 'up', icon: Wallet, color: 'blue' },
    { label: 'Pending Fees', value: '₹5,42,100', change: '-5.1%', trend: 'down', icon: Clock, color: 'orange' },
  ];

  const recentTransactions = [
    { id: 1, type: 'fee', description: 'Tuition Fee - Class 10-A', amount: 25000, date: '2024-05-01', status: 'completed', student: 'Rahul Sharma' },
    { id: 2, type: 'salary', description: 'Teacher Salary - May 2024', amount: 85000, date: '2024-05-01', status: 'completed', recipient: 'Sarah Wilson' },
    { id: 3, type: 'expense', description: 'Office Supplies', amount: 12500, date: '2024-04-30', status: 'completed', vendor: 'Stationery World' },
    { id: 4, type: 'fee', description: 'Tuition Fee - Class 9-B', amount: 25000, date: '2024-04-30', status: 'pending', student: 'Priya Patel' },
    { id: 5, type: 'expense', description: 'Electricity Bill', amount: 45000, date: '2024-04-29', status: 'completed', vendor: 'MSEB' },
    { id: 6, type: 'salary', description: 'Driver Salary - May 2024', amount: 25000, date: '2024-05-01', status: 'completed', recipient: 'Ramesh Kumar' },
  ];

  const feeAccounts = [
    { id: 1, name: 'Tuition Fees', balance: 1250000, collected: 850000, pending: 400000, academicYear: '2024-25' },
    { id: 2, name: 'Transport Fees', balance: 450000, collected: 380000, pending: 70000, academicYear: '2024-25' },
    { id: 3, name: 'Lab Fees', balance: 250000, collected: 200000, pending: 50000, academicYear: '2024-25' },
    { id: 4, name: 'Library Fees', balance: 150000, collected: 140000, pending: 10000, academicYear: '2024-25' },
    { id: 5, name: 'Sports Fees', balance: 200000, collected: 180000, pending: 20000, academicYear: '2024-25' },
  ];

  const salaryAccounts = [
    { id: 1, name: 'Teaching Staff', budget: 2500000, paid: 2100000, pending: 400000, month: 'May 2024' },
    { id: 2, name: 'Non-Teaching Staff', budget: 800000, paid: 750000, pending: 50000, month: 'May 2024' },
    { id: 3, name: 'Driver Staff', budget: 300000, paid: 280000, pending: 20000, month: 'May 2024' },
    { id: 4, name: 'Security Staff', budget: 200000, paid: 190000, pending: 10000, month: 'May 2024' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'red' ? 'bg-red-100' :
                  stat.color === 'blue' ? 'bg-blue-100' :
                  'bg-orange-100'
                }`}>
                  <stat.icon size={24} className={`${
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    stat.color === 'blue' ? 'text-blue-600' :
                    'text-orange-600'
                  }`} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card className="p-6 bg-white border border-slate-200 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {recentTransactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  transaction.type === 'fee' ? 'bg-green-100' :
                  transaction.type === 'salary' ? 'bg-blue-100' :
                  'bg-red-100'
                }`}>
                  {transaction.type === 'fee' && <DollarSign size={20} className="text-green-600" />}
                  {transaction.type === 'salary' && <CreditCard size={20} className="text-blue-600" />}
                  {transaction.type === 'expense' && <Receipt size={20} className="text-red-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{transaction.description}</p>
                  <p className="text-xs text-slate-500">
                    {transaction.student && `Student: ${transaction.student}`}
                    {transaction.recipient && `Recipient: ${transaction.recipient}`}
                    {transaction.vendor && `Vendor: ${transaction.vendor}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${
                  transaction.type === 'fee' ? 'text-green-600' :
                  transaction.type === 'salary' ? 'text-blue-600' :
                  'text-red-600'
                }`}>
                  {transaction.type === 'fee' ? '+' : transaction.type === 'expense' ? '-' : ''}₹{transaction.amount.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  {transaction.status === 'completed' && <CheckCircle size={12} className="text-green-500" />}
                  {transaction.status === 'pending' && <Clock size={12} className="text-orange-500" />}
                  {transaction.status === 'failed' && <XCircle size={12} className="text-red-500" />}
                  <span className="text-xs text-slate-500">{transaction.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderFeeAccounts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Fee Accounts</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Add Fee Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feeAccounts.map((account) => (
          <Card key={account.id} className="p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <PiggyBank size={24} className="text-green-600" />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                {account.academicYear}
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-4">{account.name}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Budget</span>
                <span className="font-semibold text-slate-900">₹{account.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Collected</span>
                <span className="font-semibold text-green-600">₹{account.collected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pending</span>
                <span className="font-semibold text-orange-600">₹{account.pending.toLocaleString()}</span>
              </div>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(account.collected / account.balance) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 text-right mt-1">
                {Math.round((account.collected / account.balance) * 100)}% collected
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSalaryAccounts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Salary Accounts</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Add Salary Account
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Staff Category</th>
              <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Budget</th>
              <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Paid</th>
              <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Pending</th>
              <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Progress</th>
              <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Month</th>
            </tr>
          </thead>
          <tbody>
            {salaryAccounts.map((account) => (
              <tr key={account.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Users size={20} className="text-blue-600" />
                    </div>
                    <span className="font-semibold text-slate-900">{account.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right font-semibold text-slate-900">₹{account.budget.toLocaleString()}</td>
                <td className="py-4 px-6 text-right font-semibold text-green-600">₹{account.paid.toLocaleString()}</td>
                <td className="py-4 px-6 text-right font-semibold text-orange-600">₹{account.pending.toLocaleString()}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(account.paid / account.budget) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      {Math.round((account.paid / account.budget) * 100)}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {account.month}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExpenseAccounts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Expense Accounts</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      <Card className="p-6 bg-white border border-slate-200 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <Building size={20} className="text-red-600" />
              <span className="text-sm font-semibold text-red-900">Infrastructure</span>
            </div>
            <p className="text-2xl font-bold text-red-900">₹8,45,000</p>
            <p className="text-xs text-red-600 mt-1">This Month</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={20} className="text-orange-600" />
              <span className="text-sm font-semibold text-orange-900">Administrative</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">₹3,25,000</p>
            <p className="text-xs text-orange-600 mt-1">This Month</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={20} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">Miscellaneous</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">₹1,85,000</p>
            <p className="text-xs text-purple-600 mt-1">This Month</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-900">All Transactions</h3>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-200 transition-colors">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Transaction</th>
              <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
              <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Party</th>
              <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
              <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
              <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <p className="font-semibold text-slate-900">{transaction.description}</p>
                </td>
                <td className="py-4 px-6">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    transaction.type === 'fee' ? 'bg-green-100 text-green-700' :
                    transaction.type === 'salary' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">
                  {transaction.student || transaction.recipient || transaction.vendor || '-'}
                </td>
                <td className="py-4 px-6 text-right font-semibold">
                  <span className={`${
                    transaction.type === 'fee' ? 'text-green-600' :
                    transaction.type === 'salary' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {transaction.type === 'fee' ? '+' : transaction.type === 'expense' ? '-' : ''}₹{transaction.amount.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 justify-center ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                    transaction.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {transaction.status === 'completed' && <CheckCircle size={12} />}
                    {transaction.status === 'pending' && <Clock size={12} />}
                    {transaction.status === 'failed' && <XCircle size={12} />}
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-6 text-center text-sm text-slate-600">
                  {transaction.date}
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex gap-2 justify-center">
                    <button className="p-1 rounded-lg hover:bg-slate-100" onClick={() => addToast?.('View transaction details', 'info')}>
                      <Eye size={16} className="text-slate-400" />
                    </button>
                    <button className="p-1 rounded-lg hover:bg-slate-100" onClick={() => addToast?.('Edit transaction', 'info')}>
                      <Edit2 size={16} className="text-slate-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
          <p className="text-slate-500 text-sm">Manage fee accounts, salary accounts, and transactions</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-200 transition-colors">
            <Download size={16} /> Export Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={16} /> New Transaction
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'fee-accounts' && renderFeeAccounts()}
      {activeTab === 'salary-accounts' && renderSalaryAccounts()}
      {activeTab === 'expense-accounts' && renderExpenseAccounts()}
      {activeTab === 'transactions' && renderTransactions()}
    </div>
  );
};

export default AdminAccounts;
