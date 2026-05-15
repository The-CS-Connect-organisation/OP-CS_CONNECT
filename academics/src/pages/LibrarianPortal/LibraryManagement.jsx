import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Clock, CheckCircle, AlertCircle, Search, Plus, Edit, Trash2, Calendar, Filter, RefreshCw, Upload } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { libraryApi, teacherApi } from '../../services/apiDataLayer';

const LibraryManagement = ({ user, addToast }) => {
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [booksRes, txRes, studentsRes] = await Promise.allSettled([
        libraryApi.getLibraryBooks(),
        libraryApi.getLibraryTransactions(),
        teacherApi.listStudents(),
      ]);

      if (studentsRes.status === 'fulfilled') {
        setStudents(studentsRes.value?.students || studentsRes.value?.items || []);
      }

      if (booksRes.status === 'fulfilled') {
        const bookList = booksRes.value?.books || booksRes.value || [];
        setBooks(bookList);
      }

      if (txRes.status === 'fulfilled') {
        const txList = txRes.value?.transactions || txRes.value || [];
        setBorrowedBooks(txList.filter(t => t.status === 'issued' || t.status === 'active'));
      }
    } catch (err) {
      console.error('Failed to load library data:', err);
      addToast?.('Failed to load library data. Using cached data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bookData = {
      title: formData.get('title'),
      author: formData.get('author'),
      isbn: formData.get('isbn'),
      publicationYear: formData.get('publicationYear'),
      category: formData.get('category'),
      description: formData.get('description'),
      totalCopies: parseInt(formData.get('totalCopies')) || 1,
      status: 'available',
    };

    try {
      setSaving(true);
      await libraryApi.addBook(bookData);
      addToast?.('Book added successfully!', 'success');
      setShowAddBookModal(false);
      e.target.reset();
      loadData();
    } catch (err) {
      addToast?.('Failed to add book: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    if (!editingBook) return;
    const formData = new FormData(e.target);
    const updates = {
      title: formData.get('title'),
      author: formData.get('author'),
      isbn: formData.get('isbn'),
      publicationYear: formData.get('publicationYear'),
      category: formData.get('category'),
      description: formData.get('description'),
    };

    try {
      setSaving(true);
      await libraryApi.updateBook(editingBook.id, updates);
      addToast?.('Book updated successfully!', 'success');
      setShowEditBookModal(false);
      setEditingBook(null);
      loadData();
    } catch (err) {
      addToast?.('Failed to update book: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await libraryApi.deleteBook(bookId);
      addToast?.('Book deleted successfully!', 'success');
      loadData();
    } catch (err) {
      addToast?.('Failed to delete book: ' + err.message, 'error');
    }
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setShowEditBookModal(true);
  };

  const handleBorrowBook = async (book, student) => {
    if (!book.available) {
      addToast?.('This book is currently not available', 'error');
      return;
    }

    const txData = {
      bookId: book.id,
      bookTitle: book.title,
      studentId: student.id,
      studentName: student.name,
      studentClass: student.class,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'issued',
    };

    try {
      setSaving(true);
      await libraryApi.issueBook(txData);
      addToast?.(`Book "${book.title}" borrowed by ${student.name}`, 'success');
      setShowBorrowModal(false);
      setSelectedBook(null);
      setSelectedStudent(null);
      loadData();
    } catch (err) {
      addToast?.('Failed to process borrow: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReturnBook = async (borrowRecord) => {
    const txId = borrowRecord.id || borrowRecord._id;
    try {
      setSaving(true);
      await libraryApi.returnBook(txId);
      addToast?.(`Book "${borrowRecord.bookTitle}" returned by ${borrowRecord.studentName}`, 'success');
      loadData();
    } catch (err) {
      addToast?.('Failed to process return: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.isbn && book.isbn.includes(searchTerm))
  );

  const filteredBorrowedBooks = borrowedBooks.filter(record =>
    record.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableStudents = students.filter(s => s.role === 'student');

  if (loading && books.length === 0) {
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
            <button
              onClick={loadData}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={18} /> Refresh
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
          <p className="text-3xl font-bold text-gray-900">{borrowedBooks.filter(b => b.status === 'issued' || b.status === 'active').length}</p>
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
          <p className="text-3xl font-bold text-gray-900">{books.filter(b => b.status !== 'available').length}</p>
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
                      <td className="py-3 px-4 text-sm font-medium">{book.title}</td>
                      <td className="py-3 px-4 text-sm">{book.author}</td>
                      <td className="py-3 px-4 text-sm">{book.isbn}</td>
                      <td className="py-3 px-4 text-sm">{book.category}</td>
                      <td className="py-3 px-4 text-sm text-center">{book.borrowedCopies || 0}/{book.totalCopies || 1}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          book.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {book.status === 'available' ? 'Available' : 'Unavailable'}
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
                          <button
                            onClick={() => openEditModal(book)}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="Edit Book"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Book"
                          >
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Class</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Borrow Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBorrowedBooks.map(record => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{record.bookTitle}</td>
                      <td className="py-3 px-4 text-sm">{record.studentName}</td>
                      <td className="py-3 px-4 text-sm">{record.studentClass}</td>
                      <td className="py-3 px-4 text-sm">{new Date(record.issueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm">{new Date(record.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'issued' || record.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {record.status === 'issued' || record.status === 'active' ? 'Active' :
                           record.status === 'overdue' ? 'Overdue' : 'Returned'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {(record.status === 'issued' || record.status === 'active') && (
                          <button
                            onClick={() => handleReturnBook(record)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Return Book"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
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
                      <p className="text-sm text-gray-500">{new Date(record.issueDate).toLocaleDateString()}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'issued' || record.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status === 'issued' || record.status === 'active' ? 'Active' : 'Overdue'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Categories</h3>
              <div className="space-y-3">
                {[...new Set(books.map(b => b.category).filter(Boolean))].map(category => {
                  const categoryBooks = books.filter(b => b.category === category);
                  return (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{category}</p>
                        <p className="text-sm text-gray-500">{categoryBooks.length} books</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {categoryBooks.filter(b => b.status === 'available').length} available
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

      {/* Add Book Modal */}
      {showAddBookModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddBookModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Book</h3>
            <form onSubmit={handleAddBook} className="space-y-4">
              <Input label="Title" name="title" required placeholder="Book title" />
              <Input label="Author" name="author" required placeholder="Author name" />
              <Input label="ISBN" name="isbn" required placeholder="ISBN number" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input label="Publication Year" name="publicationYear" type="number" required placeholder="2023" />
                </div>
                <div>
                  <Input label="Total Copies" name="totalCopies" type="number" defaultValue={1} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" required className="input-field w-full">
                  <option value="">Select category</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="History">History</option>
                  <option value="Literature">Literature</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Geography">Geography</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows={3} className="input-field resize-none w-full" placeholder="Book description" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" loading={saving}>
                  {saving ? 'Adding...' : 'Add Book'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowAddBookModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Book Modal */}
      {showEditBookModal && editingBook && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditBookModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Book</h3>
            <form onSubmit={handleEditBook} className="space-y-4">
              <Input label="Title" name="title" defaultValue={editingBook.title} required />
              <Input label="Author" name="author" defaultValue={editingBook.author} required />
              <Input label="ISBN" name="isbn" defaultValue={editingBook.isbn} />
              <Input label="Publication Year" name="publicationYear" defaultValue={editingBook.publicationYear} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" defaultValue={editingBook.category} className="input-field w-full">
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="History">History</option>
                  <option value="Literature">Literature</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Geography">Geography</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows={3} defaultValue={editingBook.description} className="input-field resize-none w-full" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" loading={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowEditBookModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Borrow: {selectedBook.title}</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {availableStudents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No students found</p>
              ) : (
                availableStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleBorrowBook(selectedBook, student)}
                    className="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">
                          Class {student.class || student.grade}-{student.section} | Roll {student.roll_number || student.rollNo}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <Button type="button" variant="secondary" onClick={() => setShowBorrowModal(false)} className="w-full">
              Cancel
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LibraryManagement;