import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, ExternalLink, Search, Filter, Loader } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

/**
 * @component NCERTBooks
 * @description Free NCERT books viewer - streams from official NCERT sources
 * @param {Object} user - Current user object
 */
export const NCERTBooks = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('10');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // NCERT Books Database - Official URLs
  const ncertBooksDatabase = {
    '6': {
      'English': { title: 'English - Honeysuckle', url: 'https://ncert.nic.in/textbook/pdf/ieen101.pdf', subject: 'English' },
      'Hindi': { title: 'Hindi - Vasant', url: 'https://ncert.nic.in/textbook/pdf/iehe101.pdf', subject: 'Hindi' },
      'Mathematics': { title: 'Mathematics', url: 'https://ncert.nic.in/textbook/pdf/iema101.pdf', subject: 'Mathematics' },
      'Science': { title: 'Science', url: 'https://ncert.nic.in/textbook/pdf/iesc101.pdf', subject: 'Science' },
      'Social Science': { title: 'Social Science', url: 'https://ncert.nic.in/textbook/pdf/iess101.pdf', subject: 'Social Science' },
    },
    '7': {
      'English': { title: 'English - Honeycomb', url: 'https://ncert.nic.in/textbook/pdf/ieen201.pdf', subject: 'English' },
      'Hindi': { title: 'Hindi - Vasant', url: 'https://ncert.nic.in/textbook/pdf/iehe201.pdf', subject: 'Hindi' },
      'Mathematics': { title: 'Mathematics', url: 'https://ncert.nic.in/textbook/pdf/iema201.pdf', subject: 'Mathematics' },
      'Science': { title: 'Science', url: 'https://ncert.nic.in/textbook/pdf/iesc201.pdf', subject: 'Science' },
      'Social Science': { title: 'Social Science', url: 'https://ncert.nic.in/textbook/pdf/iess201.pdf', subject: 'Social Science' },
    },
    '8': {
      'English': { title: 'English - Honeydew', url: 'https://ncert.nic.in/textbook/pdf/ieen301.pdf', subject: 'English' },
      'Hindi': { title: 'Hindi - Vasant', url: 'https://ncert.nic.in/textbook/pdf/iehe301.pdf', subject: 'Hindi' },
      'Mathematics': { title: 'Mathematics', url: 'https://ncert.nic.in/textbook/pdf/iema301.pdf', subject: 'Mathematics' },
      'Science': { title: 'Science', url: 'https://ncert.nic.in/textbook/pdf/iesc301.pdf', subject: 'Science' },
      'Social Science': { title: 'Social Science', url: 'https://ncert.nic.in/textbook/pdf/iess301.pdf', subject: 'Social Science' },
    },
    '9': {
      'English': { title: 'English - Beehive', url: 'https://ncert.nic.in/textbook/pdf/ieen401.pdf', subject: 'English' },
      'Hindi': { title: 'Hindi - Kshitij', url: 'https://ncert.nic.in/textbook/pdf/iehe401.pdf', subject: 'Hindi' },
      'Mathematics': { title: 'Mathematics', url: 'https://ncert.nic.in/textbook/pdf/iema401.pdf', subject: 'Mathematics' },
      'Science': { title: 'Science', url: 'https://ncert.nic.in/textbook/pdf/iesc401.pdf', subject: 'Science' },
      'Social Science': { title: 'Social Science', url: 'https://ncert.nic.in/textbook/pdf/iess401.pdf', subject: 'Social Science' },
    },
    '10': {
      'English': { title: 'English - First Flight', url: 'https://ncert.nic.in/textbook/pdf/ieen501.pdf', subject: 'English' },
      'Hindi': { title: 'Hindi - Kshitij', url: 'https://ncert.nic.in/textbook/pdf/iehe501.pdf', subject: 'Hindi' },
      'Mathematics': { title: 'Mathematics', url: 'https://ncert.nic.in/textbook/pdf/iema501.pdf', subject: 'Mathematics' },
      'Science': { title: 'Science', url: 'https://ncert.nic.in/textbook/pdf/iesc501.pdf', subject: 'Science' },
      'Social Science': { title: 'Social Science', url: 'https://ncert.nic.in/textbook/pdf/iess501.pdf', subject: 'Social Science' },
    },
    '11': {
      'English': { title: 'English - Hornbill', url: 'https://ncert.nic.in/textbook/pdf/ieen601.pdf', subject: 'English' },
      'Physics': { title: 'Physics', url: 'https://ncert.nic.in/textbook/pdf/ieph601.pdf', subject: 'Physics' },
      'Chemistry': { title: 'Chemistry', url: 'https://ncert.nic.in/textbook/pdf/iech601.pdf', subject: 'Chemistry' },
      'Biology': { title: 'Biology', url: 'https://ncert.nic.in/textbook/pdf/iebio601.pdf', subject: 'Biology' },
      'Mathematics': { title: 'Mathematics', url: 'https://ncert.nic.in/textbook/pdf/iema601.pdf', subject: 'Mathematics' },
    },
    '12': {
      'English': { title: 'English - Flamingo', url: 'https://ncert.nic.in/textbook/pdf/ieen701.pdf', subject: 'English' },
      'Physics': { title: 'Physics', url: 'https://ncert.nic.in/textbook/pdf/ieph701.pdf', subject: 'Physics' },
      'Chemistry': { title: 'Chemistry', url: 'https://ncert.nic.in/textbook/pdf/iech701.pdf', subject: 'Chemistry' },
      'Biology': { title: 'Biology', url: 'https://ncert.nic.in/textbook/pdf/iebio701.pdf', subject: 'Biology' },
      'Mathematics': { title: 'Mathematics', url: 'https://ncert.nic.in/textbook/pdf/iema701.pdf', subject: 'Mathematics' },
    },
  };

  useEffect(() => {
    loadBooks();
  }, [selectedClass, selectedSubject, searchTerm]);

  const loadBooks = () => {
    setLoading(true);
    setError(null);
    try {
      const classBooks = ncertBooksDatabase[selectedClass] || {};
      let booksList = Object.values(classBooks);

      if (selectedSubject !== 'all') {
        booksList = booksList.filter(book => book.subject === selectedSubject);
      }

      if (searchTerm) {
        booksList = booksList.filter(book =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setBooks(booksList);
    } catch (err) {
      console.error('Error loading books:', err);
      setError('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectsForClass = () => {
    const classBooks = ncertBooksDatabase[selectedClass] || {};
    return ['all', ...new Set(Object.values(classBooks).map(b => b.subject))];
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading && books.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-sm text-gray-500 font-mono">Loading NCERT books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-sm text-red-600 font-mono">{error}</p>
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
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-blue-100 to-transparent blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3 mb-2">
            <BookOpen size={32} className="text-blue-600" />
            Free NCERT Books
          </h1>
          <p className="text-gray-600">Access all official NCERT textbooks online - Always updated with latest versions</p>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
              ✓ Official NCERT
            </Badge>
            <Badge variant="default" className="bg-blue-100 text-blue-700 border-blue-200">
              ✓ Always Updated
            </Badge>
            <Badge variant="default" className="bg-purple-100 text-purple-700 border-purple-200">
              ✓ Free Access
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border text-sm"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {Object.keys(ncertBooksDatabase).map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border text-sm"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {getSubjectsForClass().map(subject => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-xl border text-sm"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium">No books found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{book.title}</h3>
                    <Badge variant="default" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                      {book.subject}
                    </Badge>
                  </div>
                  <BookOpen size={24} className="text-blue-600 flex-shrink-0" />
                </div>

                <p className="text-sm text-gray-600 mb-4 flex-1">
                  Official NCERT textbook - Always updated with latest content
                </p>

                <div className="flex gap-2">
                  <a
                    href={book.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <ExternalLink size={16} />
                    View Online
                  </a>
                  <a
                    href={book.url}
                    download
                    className="px-4 py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors hover:bg-gray-50"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <Download size={16} />
                  </a>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex gap-4">
          <BookOpen size={24} className="text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">About NCERT Books</h4>
            <p className="text-sm text-gray-700 mb-2">
              These are official NCERT (National Council of Educational Research and Training) textbooks. They are:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>✓ Freely available from official NCERT sources</li>
              <li>✓ Automatically updated when NCERT releases new versions</li>
              <li>✓ No storage required - streamed directly from NCERT servers</li>
              <li>✓ Accessible to all students and parents</li>
              <li>✓ Can be viewed online or downloaded for offline reading</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NCERTBooks;
