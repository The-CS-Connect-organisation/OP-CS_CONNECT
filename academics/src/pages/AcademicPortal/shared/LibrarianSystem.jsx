import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Tag,
  FileText,
  Printer,
  QrCode
} from 'lucide-react';
import { request } from '../../../utils/apiClient';

const BookCard = ({ book, onEdit, onDelete, onIssue }) => {
  const statusConfig = {
    available: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    issued: { color: 'bg-red-100 text-red-600', icon: XCircle },
    reserved: { color: 'bg-yellow-100 text-yellow-800', icon: Tag }
  };

  const config = statusConfig[book.status] || statusConfig.available;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="nova-card p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">{book.title}</h4>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
              <StatusIcon size={12} />
              {book.status.toUpperCase()}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{book.author}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Tag size={14} />
              {book.isbn}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {book.publicationYear}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={14} />
              {book.category}
            </span>
          </div>

          {book.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{book.description}</p>
          )}

          {book.status === 'issued' && book.borrower && (
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-gray-600">Borrowed by: {book.borrower.name}</p>
              <p className="text-xs text-gray-500">Due: {new Date(book.dueDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {book.status === 'available' && (
            <button onClick={() => onIssue(book)} className="btn-primary text-xs">
              Issue Book
            </button>
          )}
          <button onClick={() => onEdit(book)} className="btn-ghost text-xs">
            <Edit size={14} />
          </button>
          <button onClick={() => onDelete(book.id)} className="btn-ghost text-red-600 text-xs">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const IssueForm = ({ book, onSubmit, onCancel, students }) => {
  const [studentId, setStudentId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (studentId && dueDate) {
      onSubmit({
        bookId: book.id,
        studentId,
        dueDate,
        issueDate: new Date().toISOString()
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="nova-card p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Issue Book: {book.title}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            className="input-field"
          >
            <option value="">Select student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} - {student.class}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary flex-1">
            Issue Book
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const ReturnForm = ({ book, onSubmit, onCancel }) => {
  const [fine, setFine] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      bookId: book.id,
      returnDate: new Date().toISOString(),
      fine: parseFloat(fine) || 0
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="nova-card p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Return Book: {book.title}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Borrower: {book.borrower.name}</p>
          <p className="text-sm text-gray-600 mb-2">Due Date: {new Date(book.dueDate).toLocaleDateString()}</p>
          <p className="text-sm text-gray-600">Issue Date: {new Date(book.issueDate).toLocaleDateString()}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fine (if any)</label>
          <input
            type="number"
            value={fine}
            onChange={(e) => setFine(e.target.value)}
            placeholder="0.00"
            className="input-field"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary flex-1">
            Return Book
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export const LibrarianSystem = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      request('/school/library/books'),
      request('/school/users?role=student'),
      request('/school/library/transactions'),
    ]).then(([bRes, sRes, tRes]) => {
      if (bRes.status === 'fulfilled') setBooks(bRes.value?.books || []);
      if (sRes.status === 'fulfilled') setStudents(sRes.value?.items || sRes.value?.users || []);
      if (tRes.status === 'fulfilled') setTransactions(tRes.value?.transactions || []);
    });
  }, []);
  
  const [activeTab, setActiveTab] = useState('books');
  const [search, setSearch] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(null);
  const [showReturnForm, setShowReturnForm] = useState(null);
  const [rfidInput, setRfidInput] = useState('');
  const [rfidResult, setRfidResult] = useState(null);

  const filteredBooks = books.filter(book => 
    search === '' || 
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.author.toLowerCase().includes(search.toLowerCase()) ||
    book.isbn.toLowerCase().includes(search.toLowerCase())
  );

  const issuedBooks = books.filter(book => book.status === 'issued');
  const availableBooks = books.filter(book => book.status === 'available');

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
      status: 'available',
    };
    try {
      const res = await request('/school/library/books', { method: 'POST', body: JSON.stringify(bookData) });
      setBooks(prev => [...prev, res.book || { id: Date.now().toString(), ...bookData, createdAt: new Date().toISOString() }]);
    } catch {}
    setShowAddBook(false);
    e.target.reset();
  };

  const handleIssueBook = async (issueData) => {
    const student = students.find(s => s.id === issueData.studentId);
    const book = books.find(b => b.id === issueData.bookId);

    const updatedBook = {
      status: 'issued',
      borrower: { id: student.id, name: student.name, class: student.class },
      issueDate: issueData.issueDate,
      dueDate: issueData.dueDate,
    };
    try { await request(`/school/library/books/${issueData.bookId}`, { method: 'PATCH', body: JSON.stringify(updatedBook) }); } catch {}
    setBooks(prev => prev.map(b => b.id === issueData.bookId ? { ...b, ...updatedBook } : b));

    const tx = {
      bookId: issueData.bookId,
      bookTitle: book.title,
      studentId: issueData.studentId,
      studentName: student.name,
      studentClass: student.class,
      issueDate: issueData.issueDate,
      dueDate: issueData.dueDate,
      status: 'issued',
    };
    try { await request('/school/library/transactions', { method: 'POST', body: JSON.stringify(tx) }); } catch {}
    setTransactions(prev => [...prev, { id: Date.now().toString(), ...tx }]);
    setShowIssueForm(null);
  };

  const handleReturnBook = async (returnData) => {
    try { await request(`/school/library/books/${returnData.bookId}`, { method: 'PATCH', body: JSON.stringify({ status: 'available', borrower: null, issueDate: null, dueDate: null }) }); } catch {}
    setBooks(prev => prev.map(b => b.id === returnData.bookId ? { ...b, status: 'available', borrower: null, issueDate: null, dueDate: null } : b));

    const existingTx = transactions.find(t => t.bookId === returnData.bookId && t.status === 'issued');
    if (existingTx) {
      const returnTx = { ...existingTx, id: Date.now().toString(), returnDate: returnData.returnDate, fine: returnData.fine, status: 'returned' };
      try { await request('/school/library/transactions', { method: 'POST', body: JSON.stringify(returnTx) }); } catch {}
      setTransactions(prev => [...prev, returnTx]);
    }
    setShowReturnForm(null);
  };

  const handleRFIDScan = (e) => {
    if (e.key === 'Enter') {
      const student = students.find(s => s.id === rfidInput || s.rollNo === rfidInput);
      if (student) {
        setRfidResult({
          type: 'student',
          data: student,
          books: books.filter(b => b.borrower?.id === student.id)
        });
      } else {
        const book = books.find(b => b.id === rfidInput || b.isbn === rfidInput);
        if (book) {
          setRfidResult({
            type: 'book',
            data: book
          });
        } else {
          setRfidResult({
            type: 'not_found',
            message: 'No student or book found with this ID'
          });
        }
      }
    }
  };

  const generatePDF = (data) => {
    // This would integrate with a PDF generation library
    // For now, we'll create a simple text representation
    const content = `
LIBRARY BOOK ISSUE RECEIPT
===========================

Book Title: ${data.bookTitle}
Author: ${data.author}
ISBN: ${data.isbn}
Category: ${data.category}

Borrower: ${data.studentName}
Class: ${data.studentClass}
Roll No: ${data.studentRollNo}

Issue Date: ${new Date(data.issueDate).toLocaleDateString()}
Due Date: ${new Date(data.dueDate).toLocaleDateString()}

Please return the book by the due date to avoid fines.

Thank you for using our library!
    `;
    
    // In a real implementation, this would generate a proper PDF
    alert('PDF Generated:\n\n' + content);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen size={28} className="text-gray-600" />
            Library Management System
          </h1>
          <p className="text-sm text-gray-600 mt-1">Manage books, issues, and returns</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddBook(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Book
          </button>
        </div>
      </div>

      {/* RFID Scanner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="nova-card p-4"
      >
        <h3 className="text-lg font-semibold mb-3">RFID Scanner</h3>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <QrCode size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Scan RFID or enter ID..."
              value={rfidInput}
              onChange={(e) => setRfidInput(e.target.value)}
              onKeyPress={handleRFIDScan}
              className="input-field pl-10 w-full"
            />
          </div>
          <button 
            onClick={() => setRfidInput('')}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>

        {rfidResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-gray-50 rounded-lg"
          >
            {rfidResult.type === 'student' && (
              <div>
                <h4 className="font-semibold mb-2">Student Found: {rfidResult.data.name}</h4>
                <p className="text-sm text-gray-600 mb-2">Class: {rfidResult.data.class}</p>
                <p className="text-sm text-gray-600 mb-3">Roll No: {rfidResult.data.rollNo}</p>
                
                <div className="space-y-2">
                  <h5 className="font-medium">Currently Borrowed Books:</h5>
                  {rfidResult.books.length > 0 ? (
                    rfidResult.books.map(book => (
                      <div key={book.id} className="flex items-center justify-between p-2 bg-white rounded">
                        <span>{book.title}</span>
                        <span className="text-sm text-gray-500">Due: {new Date(book.dueDate).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No books currently borrowed</p>
                  )}
                </div>
              </div>
            )}

            {rfidResult.type === 'book' && (
              <div>
                <h4 className="font-semibold mb-2">Book Found: {rfidResult.data.title}</h4>
                <p className="text-sm text-gray-600 mb-2">Author: {rfidResult.data.author}</p>
                <p className="text-sm text-gray-600 mb-3">Status: {rfidResult.data.status.toUpperCase()}</p>
                
                {rfidResult.data.status === 'issued' && (
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm">Borrowed by: {rfidResult.data.borrower.name}</p>
                    <p className="text-sm text-gray-500">Due Date: {new Date(rfidResult.data.dueDate).toLocaleDateString()}</p>
                    <button 
                      onClick={() => setShowReturnForm(rfidResult.data)}
                      className="btn-primary mt-2 text-sm"
                    >
                      Process Return
                    </button>
                  </div>
                )}
              </div>
            )}

            {rfidResult.type === 'not_found' && (
              <div className="text-red-600">{rfidResult.message}</div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Navigation Tabs */}
      <div className="nova-card p-4">
        <div className="flex flex-wrap gap-2">
          {['books', 'issued', 'available'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={(book) => {
                // Edit functionality
              }}
              onDelete={(id) => {
                request(`/school/library/books/${id}`, { method: 'DELETE' }).catch(() => {});
                setBooks(prev => prev.filter(b => b.id !== id));
              }}
              onIssue={(book) => setShowIssueForm(book)}
            />
          ))}
        </div>
      )}

      {activeTab === 'issued' && (
        <div className="space-y-4">
          {issuedBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={(book) => {
                // Edit functionality
              }}
              onDelete={(id) => {
                request(`/school/library/books/${id}`, { method: 'DELETE' }).catch(() => {});
                setBooks(prev => prev.filter(b => b.id !== id));
              }}
              onIssue={() => setShowReturnForm(book)}
            />
          ))}
        </div>
      )}

      {activeTab === 'available' && (
        <div className="space-y-4">
          {availableBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={(book) => {
                // Edit functionality
              }}
              onDelete={(id) => {
                request(`/school/library/books/${id}`, { method: 'DELETE' }).catch(() => {});
                setBooks(prev => prev.filter(b => b.id !== id));
              }}
              onIssue={(book) => setShowIssueForm(book)}
            />
          ))}
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBook && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddBook(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="nova-card p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Add New Book</h2>
            
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  name="title"
                  required
                  className="input-field"
                  placeholder="Book title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  name="author"
                  required
                  className="input-field"
                  placeholder="Author name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input
                    name="isbn"
                    required
                    className="input-field"
                    placeholder="ISBN number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
                  <input
                    name="publicationYear"
                    type="number"
                    required
                    className="input-field"
                    placeholder="2023"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" required className="input-field">
                  <option value="">Select category</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Science">Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="History">History</option>
                  <option value="Literature">Literature</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Book description"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Add Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBook(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Issue Book Modal */}
      {showIssueForm && (
        <IssueForm
          book={showIssueForm}
          onSubmit={handleIssueBook}
          onCancel={() => setShowIssueForm(null)}
          students={students.filter(s => s.role === 'student')}
        />
      )}

      {/* Return Book Modal */}
      {showReturnForm && (
        <ReturnForm
          book={showReturnForm}
          onSubmit={handleReturnBook}
          onCancel={() => setShowReturnForm(null)}
        />
      )}
    </div>
  );
};