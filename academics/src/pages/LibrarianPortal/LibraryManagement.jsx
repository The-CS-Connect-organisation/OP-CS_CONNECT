import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Clock, CheckCircle, AlertCircle, Search, Plus, Edit, Trash2, Calendar, Filter } from 'lucide-react';
import { Card } from '../../components/ui/Card';

const LibraryManagement = ({ addToast }) => {
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockBooks = [
        { id: 1, title: 'Mathematics for Class 10', author: 'R.D. Sharma', isbn: '978-93-5141-234-5', category: 'Mathematics', available: true, totalCopies: 5, borrowedCopies: 2 },
        { id: 2, title: 'Science Physics', author: 'H.C. Verma', isbn: '978-81-7709-187-5', category: 'Physics', available: true, totalCopies: 3, borrowedCopies: 1 },
        { id: 3, title: 'History of India', author: 'Romila Thapar', isbn: '978-06-7100-789-2', category: 'History', available: false, totalCopies: 2, borrowedCopies: 2 },
        { id: 4, title: 'English Grammar', author: 'Wren & Martin', isbn: '978-81-7319-049-8', category: 'English', available: true, totalCopies: 10, borrowedCopies: 3 },
        { id: 5, title: 'Chemistry Organic', author: 'O.P. Tandon', isbn: '978-93-5026-543-1', category: 'Chemistry', available: true, totalCopies: 4, borrowedCopies: 2 },
      ];

      const mockBorrowedBooks = [
        { id: 1, bookId: 1, studentId: 101, studentName: 'Rahul Kumar', borrowDate: '2024-01-15', dueDate: '2024-02-15', status: 'active', bookTitle: 'Mathematics for Class 10' },
        { id: 2, bookId: 2, studentId: 102, studentName: 'Priya Sharma', borrowDate: '2024-01-20', dueDate: '2024-02-20', status: 'active', bookTitle: 'Science Physics' },
        { id: 3, bookId: 3, studentId: 103, studentName: 'Amit Patel', borrowDate: '2024-01-10', dueDate: '2024-02-10', status: 'overdue', bookTitle: 'History of India' },
        { id: 4, bookId: 4, studentId: 104, studentName: 'Sneha Reddy', borrowDate: '2024-01-25', dueDate: '2024-02-25', status: 'active', bookTitle: 'English Grammar' },
      ];

      const mockStudents = [
        { id: 101, name: 'Rahul Kumar', class: '10', section: 'A', rollNumber: '001' },
        { id: 102, name: 'Priya Sharma', class: '10', section: 'B', rollNumber: '002' },
        { id: 103, name: 'Amit Patel', class: '11', section: 'A', rollNumber: '001' },
        { id: 104, name: 'Sneha Reddy', class: '9', section: 'C', rollNumber: '003' },
      ];

      setBooks(mockBooks);
      setBorrowedBooks(mockBorrowedBooks);
      setStudents(mockStudents);
    } catch (err) {
      console.error(err);
      addToast?.('Failed to load library data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = (book, student) => {
    if (!book.available) {
      addToast?.('This book is currently not available', 'error');
      return;
    }

    const newBorrow = {
      id: borrowedBooks.length + 1,
      bookId: book.id,
      studentId: student.id,
      studentName: student.name,
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      bookTitle: book.title
    };

    setBorrowedBooks([...borrowedBooks, newBorrow]);
    setBooks(books.map(b => 
      b.id === book.id 
        ? { ...b, borrowedCopies: b.borrowedCopies + 1, available: b.borrowedCopies + 1 < b.totalCopies }
        : b
    ));

    addToast?.(`Book "${book.title}" borrowed by ${student.name}`, 'success');
    setShowBorrowModal(false);
    setSelectedBook(null);
    setSelectedStudent(null);
  };

  const handleReturnBook = (borrowRecord) => {
    setBorrowedBooks(borrowedBooks.filter(b => b.id !== borrowRecord.id));
    setBooks(books.map(b => 
      b.id === borrowRecord.bookId 
        ? { ...b, borrowedCopies: b.borrowedCopies - 1, available: true }
        : b
    ));

    addToast?.(`Book "${borrowRecord.bookTitle}" returned by ${borrowRecord.studentName}`, 'success');
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm)
  );

  const filteredBorrowedBooks = borrowedBooks.filter(record => 
    record.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading library data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pt-2 pb-12 px-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Library Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage books and track student borrowing</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddBookModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} /> Add Book
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <BookOpen size={20} className="text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Total Books</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{books.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Active Borrowers</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{borrowedBooks.filter(b => b.status === 'active').length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Overdue</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{borrowedBooks.filter(b => b.status === 'overdue').length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Unavailable</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{books.filter(b => !b.available).length}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['overview', 'books', 'borrowed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab === 'books' ? 'books' : 'borrowed records'}...`}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </motion.div>

      {/* Content based on active tab */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === 'books' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Books Inventory</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Author</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ISBN</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Copies</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map(book => (
                    <tr key={book.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{book.title}</td>
                      <td className="py-3 px-4 text-sm">{book.author}</td>
                      <td className="py-3 px-4 text-sm">{book.isbn}</td>
                      <td className="py-3 px-4 text-sm">{book.category}</td>
                      <td className="py-3 px-4 text-sm text-center">{book.borrowedCopies}/{book.totalCopies}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          book.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {book.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => { setSelectedBook(book); setShowBorrowModal(true); }}
                            disabled={!book.available}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Borrow Book"
                          >
                            <Plus size={16} />
                          </button>
                          <button className="p-1 text-gray-600 hover:bg-gray-50 rounded" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'borrowed' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Borrowed Books</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Book Title</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Borrow Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBorrowedBooks.map(record => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{record.bookTitle}</td>
                      <td className="py-3 px-4 text-sm">{record.studentName}</td>
                      <td className="py-3 px-4 text-sm">{new Date(record.borrowDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm">{new Date(record.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                          record.status === 'overdue' ? 'bg-red-100 text-red-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {record.status === 'active' ? 'Active' : 
                           record.status === 'overdue' ? 'Overdue' : 'Returned'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleReturnBook(record)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Return Book"
                        >
                          <CheckCircle size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Borrow Activity</h3>
              <div className="space-y-3">
                {borrowedBooks.slice(0, 5).map(record => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{record.bookTitle}</p>
                      <p className="text-sm text-gray-500">{record.studentName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{new Date(record.borrowDate).toLocaleDateString()}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Categories</h3>
              <div className="space-y-3">
                {['Mathematics', 'Physics', 'Chemistry', 'English', 'History'].map(category => {
                  const categoryBooks = books.filter(b => b.category === category);
                  return (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{category}</p>
                        <p className="text-sm text-gray-500">{categoryBooks.length} books</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {categoryBooks.filter(b => b.available).length} available
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Borrow Book Modal */}
      {showBorrowModal && selectedBook && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowBorrowModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Borrow Book: {selectedBook.title}</h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {students.map(student => (
                <button
                  key={student.id}
                  onClick={() => handleBorrowBook(selectedBook, student)}
                  className="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">Class {student.class}-{student.section} | Roll {student.rollNumber}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowBorrowModal(false)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LibraryManagement;

