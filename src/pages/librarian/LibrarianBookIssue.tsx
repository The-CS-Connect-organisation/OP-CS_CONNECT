import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
  BookOpen, Search, User, Calendar, CheckCircle2, XCircle,
  AlertTriangle, Clock, ArrowRight, Library, Users, Hash, Plus
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  class?: string;
  admissionNo?: string;
}

interface CatalogueBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelf?: string;
}

interface BorrowRecord {
  id: string;
  bookTitle: string;
  isbn: string;
  studentId: string;
  studentName: string;
  borrowedDate: string;
  dueDate: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

export default function LibrarianBookIssue() {
  const [activeTab, setActiveTab] = useState('issue');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Issue state
  const [students, setStudents] = useState<Student[]>([]);
  const [catalogue, setCatalogue] = useState<CatalogueBook[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedBook, setSelectedBook] = useState<CatalogueBook | null>(null);
  const [issueError, setIssueError] = useState('');

  // Borrowed books state
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowRecord[]>([]);
  const [returnSearch, setReturnSearch] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [stu, cat, borrowed] = await Promise.all([
        api.getStudents().catch(() => []),
        api.getLibraryCatalogue().catch(() => []),
        api.getBorrowedBooks().catch(() => []),
      ]);
      setStudents(Array.isArray(stu) ? stu : []);
      setCatalogue(Array.isArray(cat) ? cat : []);
      setBorrowedBooks(Array.isArray(borrowed) ? borrowed : []);
    } catch (err) {
      console.error('[LibrarianBookIssue] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshBorrowed = useCallback(async () => {
    try {
      const d = await api.getBorrowedBooks();
      setBorrowedBooks(Array.isArray(d) ? d : []);
    } catch { /* ignore */ }
  }, []);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.admissionNo || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredBooks = catalogue.filter(b =>
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.isbn.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const handleIssue = async () => {
    if (!selectedStudent || !selectedBook) return;
    setIssueError('');
    setSubmitting(true);
    try {
      await api.borrowBook({
        studentId: selectedStudent.id,
        bookId: selectedBook.id,
        borrowedDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setSelectedStudent(null);
      setSelectedBook(null);
      setStudentSearch('');
      setBookSearch('');
      await Promise.all([
        loadInitialData(),
        refreshBorrowed(),
      ]);
    } catch (err: any) {
      setIssueError(err?.message || 'Failed to issue book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (id: string) => {
    try {
      await api.returnBook(id);
      await refreshBorrowed();
    } catch (err: any) {
      console.error('[LibrarianBookIssue] Failed to return:', err);
    }
  };

  const filteredBorrowed = borrowedBooks.filter(b =>
    b.bookTitle.toLowerCase().includes(returnSearch.toLowerCase()) ||
    b.studentName.toLowerCase().includes(returnSearch.toLowerCase())
  );

  const activeBorrowed = filteredBorrowed.filter(b => b.status !== 'returned');
  const overdueBorrowed = filteredBorrowed.filter(b => b.status === 'overdue');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'borrowed': return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><Clock className="w-3 h-3 mr-1" />Borrowed</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case 'returned': return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Returned</Badge>;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Book Issue & Returns</h1>
        <p className="text-muted-foreground">Issue books to students and manage returns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{borrowedBooks.filter(b => b.status === 'borrowed').length}</p>
              <p className="text-sm text-muted-foreground">Active Issues</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{overdueBorrowed.length}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{borrowedBooks.filter(b => b.status === 'returned').length}</p>
              <p className="text-sm text-muted-foreground">Returned This Period</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex gap-1 mb-6">
          <TabsTrigger value="issue" className="flex items-center gap-2 px-4 py-2">
            <Plus className="w-4 h-4" /><span>Issue Book</span>
          </TabsTrigger>
          <TabsTrigger value="returns" className="flex items-center gap-2 px-4 py-2">
            <ArrowRight className="w-4 h-4" /><span>Returns / Tracking</span>
          </TabsTrigger>
        </TabsList>

        {/* ISSUE BOOK TAB */}
        <TabsContent value="issue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Select Student */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">1. Select Student</h3>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Search by name or admission no..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                  {loading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading students...</p>
                  ) : filteredStudents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No students found</p>
                  ) : (
                    filteredStudents.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setSelectedStudent(s); setStudentSearch(s.name); }}
                        className={`w-full text-left p-2 rounded-lg transition-colors flex items-center gap-3 ${
                          selectedStudent?.id === s.id
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted border border-transparent'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.class || 'N/A'} {s.admissionNo ? `• ${s.admissionNo}` : ''}
                          </p>
                        </div>
                        {selectedStudent?.id === s.id && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Select Book */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Library className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">2. Select Book</h3>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Search by title, author, or ISBN..."
                    value={bookSearch}
                    onChange={e => setBookSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                  {loading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading books...</p>
                  ) : filteredBooks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No books found</p>
                  ) : (
                    filteredBooks.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => { setSelectedBook(b); setBookSearch(b.title); }}
                        disabled={b.availableCopies <= 0}
                        className={`w-full text-left p-2 rounded-lg transition-colors ${
                          selectedBook?.id === b.id
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted border border-transparent'
                        } ${b.availableCopies <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary shrink-0" />
                              <p className="text-sm font-medium truncate">{b.title}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{b.author}</span>
                              <span>•</span>
                              <span>ISBN: {b.isbn}</span>
                              {b.shelf && <><span>•</span><span className="flex items-center gap-1"><Hash className="w-3 h-3" />{b.shelf}</span></>}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="text-sm font-medium">{b.availableCopies}/{b.totalCopies}</p>
                            <Badge variant={b.availableCopies > 0 ? 'secondary' : 'destructive'} className="text-xs">
                              {b.availableCopies > 0 ? 'Available' : 'Out'}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issue Action */}
          <Card className="mt-6 border-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">3. Confirm Issue</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent && selectedBook
                      ? `Issue "${selectedBook.title}" to ${selectedStudent.name} (due in 14 days)`
                      : 'Select both a student and a book above'}
                  </p>
                  {issueError && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />{issueError}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleIssue}
                  disabled={!selectedStudent || !selectedBook || submitting}
                  className="shrink-0"
                >
                  {submitting ? 'Issuing...' : <><Plus className="w-4 h-4 mr-2" />Issue Book</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RETURNS / TRACKING TAB */}
        <TabsContent value="returns">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by book title or student name..."
                value={returnSearch}
                onChange={e => setReturnSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={refreshBorrowed}>
              <ArrowRight className="w-4 h-4 mr-2" />Refresh
            </Button>
          </div>

          {/* Overdue Alert */}
          {overdueBorrowed.length > 0 && (
            <Card className="mb-4 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
              <CardContent className="p-4 flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">{overdueBorrowed.length} overdue book{overdueBorrowed.length > 1 ? 's' : ''} - Action required</span>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}</div>
          ) : filteredBorrowed.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No borrowing records found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeBorrowed.map(book => (
                <Card key={book.id} className={`p-4 transition-all hover:shadow-md ${
                  book.status === 'overdue' ? 'border-red-200 dark:border-red-800' : ''
                }`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        book.status === 'overdue'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        <BookOpen className={`w-5 h-5 ${
                          book.status === 'overdue' ? 'text-red-500' : 'text-orange-500'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold truncate">{book.bookTitle}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{book.studentName}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Borrowed: {new Date(book.borrowedDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {new Date(book.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {getStatusBadge(book.status)}
                      {book.status !== 'returned' && (
                        <Button size="sm" variant="outline" onClick={() => handleReturn(book.id)}>
                          <CheckCircle2 className="w-4 h-4 mr-1" />Mark Returned
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Returned books section */}
              {filteredBorrowed.filter(b => b.status === 'returned').length > 0 && (
                <>
                  <div className="pt-4 pb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Returned Books ({filteredBorrowed.filter(b => b.status === 'returned').length})
                    </h3>
                  </div>
                  {filteredBorrowed.filter(b => b.status === 'returned').map(book => (
                    <Card key={book.id} className="p-4 opacity-75">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold truncate">{book.bookTitle}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><User className="w-3 h-3" />{book.studentName}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Returned</span>
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(book.status)}
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}