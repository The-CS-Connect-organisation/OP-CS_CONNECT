import { motion } from 'framer-motion';
import { BookOpen, Users, BarChart3, Clock, AlertCircle, Terminal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const LibrarianDashboard = ({ user }) => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="nova-card p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-purple-100 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-100 to-transparent blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-200">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              Librarian Portal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              <BookOpen size={10} />
              Main Library
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 mb-3 text-gray-900">
            <span className="w-1 h-10 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
              Library Section: Main Library
            </span>
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <BookOpen className="text-purple-600" size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Books in Library</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">2,450</span>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Members</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">1,240</span>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <BarChart3 className="text-green-600" size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Books Issued Today</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">34</span>
        </Card>
      </div>

      {/* Library Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={16} className="text-purple-600" />
              Recent Checkouts
            </h3>
            <Badge variant="default" className="bg-purple-100 text-purple-700 border-purple-200 text-[10px]">
              Today
            </Badge>
          </div>
          <div className="space-y-3">
            {[
              { title: 'The Great Gatsby', member: 'Priya Sharma', time: '2 hours ago' },
              { title: 'Python Programming', member: 'Arjun Singh', time: '4 hours ago' },
              { title: 'History of India', member: 'Neha Patel', time: '6 hours ago' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.member}</p>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle size={16} className="text-orange-600" />
              Overdue Books
            </h3>
            <Badge variant="default" className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">
              5 Items
            </Badge>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Biology Textbook', member: 'Vikram Kumar', daysOverdue: 3 },
              { title: 'English Literature', member: 'Anjali Singh', daysOverdue: 5 },
              { title: 'Mathematics Guide', member: 'Rohan Patel', daysOverdue: 2 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.member}</p>
                </div>
                <span className="text-xs font-semibold text-orange-600">{item.daysOverdue}d overdue</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Library Status */}
      <Card className="p-0 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={16} className="text-[var(--text-muted)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Library Status</h3>
          </div>
          <Badge variant="rose" className="font-mono text-[9px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse" /> OPERATIONAL
          </Badge>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Books', value: '2,450', color: 'purple' },
            { label: 'Available', value: '1,890', color: 'green' },
            { label: 'Issued', value: '560', color: 'blue' },
            { label: 'Pending Returns', value: '5', color: 'orange' },
          ].map((stat, idx) => (
            <div key={idx} className={`p-4 rounded-lg bg-${stat.color}-50 border border-${stat.color}-100`}>
              <p className={`text-xs font-semibold uppercase tracking-wider text-${stat.color}-600 mb-1`}>{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
