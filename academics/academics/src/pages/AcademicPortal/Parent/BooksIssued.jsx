import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, AlertCircle, CheckCircle, Clock, User } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export const BooksIssued = ({ user }) => {
  const [childrenBooks, setChildrenBooks] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch issued books for all children
    const fetchChildrenBooks = async () => {
      try {
        // Load book assignments from localStorage (assigned by librarian)
        const storedAssignments = localStorage.getItem('bookAssignments');
        let childrenBooksData = {};
        
        if (storedAssignments) {
          const allAssignments = JSON.parse(storedAssignments);
          
          // Get all students and find those linked to this parent
          const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
          const childStudents = allUsers.filter(u => 
            u.role === 'student' && u.parentEmail === user?.email
          );
          
          // For each child student, get their assigned books
          childStudents.forEach(student => {
            const studentBooks = allAssignments
              .filter(a => (a.assignedTo === student.email || a.assignedTo === student.id) && a.status === 'issued')
              .map(a => ({
                id: a.id,
                title: a.bookTitle,
                author: a.author,
                isbn: a.bookId || 'N/A',
                issueDate: a.issuedDate,
                dueDate: a.returnDate,
                status: 'active',
              }));
            
            if (studentBooks.length > 0) {
              childrenBooksData[student.id] = {
                name: student.name,
                class: student.class || 'N/A',
                books: studentBooks,
              };
            }
          });
        }

        // No fallback mock data - only show books assigned by librarian
        setChildrenBooks(childrenBooksData);
        setSelectedChild(Object.keys(childrenBooksData)[0] || null);
      } catch (error) {
        console.error('Error fetching children books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenBooks();
  }, [user?.id, user?.email]);

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status, daysRemaining) => {
    if (status === 'overdue') return 'bg-red-50 border-red-200';
    if (daysRemaining <= 3) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getStatusIcon = (status, daysRemaining) => {
    if (status === 'overdue') return <AlertCircle className="text-red-600" size={20} />;
    if (daysRemaining <= 3) return <Clock className="text-yellow-600" size={20} />;
    return <CheckCircle className="text-green-600" size={20} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentChild = selectedChild ? childrenBooks[selectedChild] : null;
  const books = currentChild?.books || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen size={32} className="text-blue-600" />
            Children's Books
          </h1>
          <p className="text-slate-600 mt-1">View and manage your children's issued books</p>
        </div>
      </div>

      {/* Child Selection */}
      {Object.keys(childrenBooks).length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium">No books assigned yet</p>
          <p className="text-gray-500 text-sm mt-2">Books assigned by the librarian will appear here</p>
        </Card>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Object.entries(childrenBooks).map(([childId, childData]) => (
            <motion.button
              key={childId}
              onClick={() => setSelectedChild(childId)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedChild === childId
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{childData.name}</span>
                <span className="text-xs opacity-75">({childData.class})</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {currentChild && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Issued</p>
                  <p className="text-2xl font-bold text-blue-900">{books.length}</p>
                </div>
                <BookOpen size={32} className="text-blue-300" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-900">
                    {books.filter(b => b.status === 'active').length}
                  </p>
                </div>
                <CheckCircle size={32} className="text-green-300" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Overdue</p>
                  <p className="text-2xl font-bold text-red-900">
                    {books.filter(b => b.status === 'overdue').length}
                  </p>
                </div>
                <AlertCircle size={32} className="text-red-300" />
              </div>
            </Card>
          </div>

          {/* Books List */}
          <div className="space-y-4">
            {books.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No books issued yet</p>
              </Card>
            ) : (
              books.map((book) => {
                const daysRemaining = getDaysRemaining(book.dueDate);
                const isOverdue = daysRemaining < 0;

                return (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card
                      className={`p-6 border-2 transition-all hover:shadow-lg ${getStatusColor(
                        isOverdue ? 'overdue' : 'active',
                        daysRemaining
                      )}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{book.title}</h3>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white">
                              {getStatusIcon(isOverdue ? 'overdue' : 'active', daysRemaining)}
                              <span className="text-xs font-medium text-slate-700">
                                {isOverdue
                                  ? `${Math.abs(daysRemaining)} days overdue`
                                  : `${daysRemaining} days left`}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-slate-600 mb-4">by {book.author}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">ISBN</p>
                              <p className="text-sm font-medium text-slate-900">{book.isbn}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">Issue Date</p>
                              <p className="text-sm font-medium text-slate-900">
                                {new Date(book.issueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">Due Date</p>
                              <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                                {new Date(book.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">Days Remaining</p>
                              <p
                                className={`text-sm font-bold ${
                                  isOverdue
                                    ? 'text-red-600'
                                    : daysRemaining <= 3
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                                }`}
                              >
                                {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isOverdue && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
                          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">
                            This book is overdue. Please return it to the library as soon as possible to avoid fines.
                          </p>
                        </div>
                      )}

                      {daysRemaining <= 3 && daysRemaining >= 0 && (
                        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg flex items-start gap-2">
                          <Clock size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-700">
                            This book is due soon. Please plan to return it by the due date.
                          </p>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default BooksIssued;
