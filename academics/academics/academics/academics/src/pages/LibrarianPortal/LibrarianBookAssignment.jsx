import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Filter, Calendar, User, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiCall } from '../../services/apiDataLayer';

/**
 * @component LibrarianBookAssignment
 * @description Librarian page to assign books to students/parents in real-time
 * @param {Object} user - Current user object
 * @param {Function} addToast - Toast notification function
 */
export const LibrarianBookAssignment = ({ user, addToast }) => {
  const [books, setBooks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [formData, setFormData] = useState({
    bookTitle: '',
    author: '',
    bookId: '',
    assignedTo: '',
    assignedToName: '',
    assignedToRole: 'student',
    issuedDate: new Date().toISOString().split('T')[0],
    returnDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load book assignments from local storage or API
      const storedAssignments = localStorage.getItem('bookAssignments');
      if (storedAssignments) {
        setAssignments(JSON.parse(storedAssignments));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      addToast?.('Failed to load book assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBook = async () => {
    if (!formData.bookTitle || !formData.author || !formData.assignedTo || !formData.returnDate) {
      addToast?.('Please fill in all fields', 'error');
      return;
    }

    try {
      const newAssignment = {
        id: `book-${Date.now()}`,
        bookTitle: formData.bookTitle,
        author: formData.author,
        bookId: formData.bookId || `BOOK-${Date.now()}`,
        assignedTo: formData.assignedTo,
        assignedToName: formData.assignedToName,
        assignedToRole: formData.assignedToRole,
        issuedDate: formData.issuedDate,
        returnDate: formData.returnDate,
        status: 'issued',
        assignedBy: user.name,
        assignedByEmail: user.email,
        createdAt: new Date().toISOString(),
      };

      const updatedAssignments = [...assignments, newAssignment];
      setAssignments(updatedAssignments);
      localStorage.setItem('bookAssignments', JSON.stringify(updatedAssignments));

      addToast?.(`Book "${formData.bookTitle}" assigned successfully`, 'success');
      setFormData({
        bookTitle: '',
        author: '',
        bookId: '',
        assignedTo: '',
        assignedToName: '',
        assignedToRole: 'student',
        issuedDate: new Date().toISOString().split('T')[0],
        returnDate: '',
      });
      setShowAssignForm(false);
    } catch (err) {
      addToast?.(err?.message || 'Failed to assign book', 'error');
    }
  };

  const handleReturnBook = (assignmentId) => {
    const updatedAssignments = assignments.map(a =>
      a.id === assignmentId ? { ...a, status: 'returned', returnedAt: new Date().toISOString() } : a
    );
    setAssignments(updatedAssignments);
    localStorage.setItem('bookAssignments', JSON.stringify(updatedAssignments));
    addToast?.('Book marked as returned', 'success');
  };

  const handleDeleteAssignment = (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    const updatedAssignments = assignments.filter(a => a.id !== assignmentId);
    setAssignments(updatedAssignments);
    localStorage.setItem('bookAssignments', JSON.stringify(updatedAssignments));
    addToast?.('Assignment deleted', 'success');
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.assignedToName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const isOverdue = (returnDate) => {
    return new Date(returnDate) < new Date() && new Date(returnDate).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BookOpen className="animate-pulse mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-sm text-gray-500 font-mono">Loading book assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="nova-card p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-purple-100 to-transparent blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3 mb-2">
              <BookOpen size={32} className="text-purple-600" />
              Book Assignment
            </h1>
            <p className="text-gray-600">Manage book issuance and returns in real-time</p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="rounded-xl bg-purple-600 hover:bg-purple-700"
          >
            Assign Book
          </Button>
        </div>
      </motion.div>

      {/* Assignment Form */}
      {showAssignForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="nova-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign New Book</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                Book Title *
              </label>
              <input
                type="text"
                placeholder="Enter book title"
                value={formData.bookTitle}
                onChange={e => setFormData({ ...formData, bookTitle: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                Author *
              </label>
              <input
                type="text"
                placeholder="Enter author name"
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                Book ID (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter book ID"
                value={formData.bookId}
                onChange={e => setFormData({ ...formData, bookId: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                Assign To Role *
              </label>
              <select
                value={formData.assignedToRole}
                onChange={e => setFormData({ ...formData, assignedToRole: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
              >
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                Assign To (Email/ID) *
              </label>
              <input
                type="text"
                placeholder="Enter student/parent email or ID"
                value={formData.assignedTo}
                onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                Recipient Name *
              </label>
              <input
                type="text"
                placeholder="Enter recipient name"
                value={formData.assignedToName}
                onChange={e => setFormData({ ...formData, assignedToName: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                Issued Date *
              </label>
              <input
                type="date"
                value={formData.issuedDate}
                onChange={e => setFormData({ ...formData, issuedDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                Return Date *
              </label>
              <input
                type="date"
                value={formData.returnDate}
                onChange={e => setFormData({ ...formData, returnDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowAssignForm(false)}
              className="rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignBook}
              className="rounded-xl px-6 bg-purple-600 hover:bg-purple-700"
            >
              Assign Book
            </Button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by book title, author, or recipient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border text-sm"
            style={{ borderColor: 'var(--border-color)' }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border text-sm"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <option value="all">All Status</option>
          <option value="issued">Issued</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {/* Assignments Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Book Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Author</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Assigned To</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Issued Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Return Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No book assignments found
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {assignment.bookTitle}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {assignment.author}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div>
                        <p className="font-medium">{assignment.assignedToName}</p>
                        <p className="text-xs">{assignment.assignedToRole}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(assignment.issuedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(assignment.returnDate).toLocaleDateString()}
                        {assignment.status === 'issued' && isOverdue(assignment.returnDate) && (
                          <Badge variant="default" className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                            OVERDUE
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="default"
                        className={`text-[10px] ${
                          assignment.status === 'issued'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-green-100 text-green-700 border-green-200'
                        }`}
                      >
                        {assignment.status === 'issued' ? 'ISSUED' : 'RETURNED'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {assignment.status === 'issued' && (
                          <button
                            onClick={() => handleReturnBook(assignment.id)}
                            className="p-1 rounded-lg hover:bg-green-100 transition-colors"
                            title="Mark as returned"
                          >
                            <CheckCircle size={16} className="text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="p-1 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete assignment"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <BookOpen className="text-blue-600" size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Issued</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {assignments.filter(a => a.status === 'issued').length}
          </span>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Returned</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {assignments.filter(a => a.status === 'returned').length}
          </span>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Clock className="text-red-600" size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Overdue</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {assignments.filter(a => a.status === 'issued' && isOverdue(a.returnDate)).length}
          </span>
        </Card>
      </div>
    </div>
  );
};
