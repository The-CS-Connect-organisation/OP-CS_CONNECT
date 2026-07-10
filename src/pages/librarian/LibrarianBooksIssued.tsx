import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  BookOpen, Search, User, Calendar, CheckCircle2,
  AlertTriangle, Clock, ArrowRight, Loader2, Users
} from 'lucide-react';

interface BorrowRecord {
  id: string;
  bookId?: string;
  bookTitle: string;
  isbn?: string;
  studentId: string;
  studentName: string;
  borrowedDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

export default function LibrarianBooksIssued() {
  const [loading, setLoading] = useState(true);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'overdue' | 'returned'>('all');

  useEffect(() => { loadBorrowed(); }, []);

  const loadBorrowed = async () => {
    setLoading(true);
    try {
      const d = await api.getBorrowedBooks();
      setBorrowedBooks(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error('[BooksIssued] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id: string) => {
    try {
      await api.returnBook(id);
      await loadBorrowed();
    } catch (err: any) {
      alert(err?.message || 'Failed to return book');
    }
  };

  const filtered = borrowedBooks.filter(b => {
    const q = search.toLowerCase();
    const matchesSearch = b.bookTitle.toLowerCase().includes(q) || b.studentName.toLowerCase().includes(q);
    const matchesStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? b.status === 'borrowed' :
      filterStatus === 'overdue' ? b.status === 'overdue' :
      b.status === 'returned';
    return matchesSearch && matchesStatus;
  });

  const activeCount = borrowedBooks.filter(b => b.status === 'borrowed').length;
  const overdueCount = borrowedBooks.filter(b => b.status === 'overdue').length;
  const returnedCount = borrowedBooks.filter(b => b.status === 'returned').length;

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
        <h1 className="text-2xl font-bold">Books Issued</h1>
        <p className="text-muted-foreground">Track issued books and manage returns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{borrowedBooks.length}</p>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active Issues</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{overdueCount}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{returnedCount}</p>
              <p className="text-sm text-muted-foreground">Returned</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search by book title or student name..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'overdue', 'returned'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                filterStatus === s
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >{s}</button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={loadBorrowed}>
          <ArrowRight className="w-4 h-4 mr-1" />Refresh
        </Button>
      </div>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">{overdueCount} overdue book{overdueCount > 1 ? 's' : ''} — Action required</span>
          </CardContent>
        </Card>
      )}

      {/* Records */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No borrowing records found</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(book => (
            <Card key={book.id} className={`p-4 transition-all hover:shadow-md ${
              book.status === 'overdue' ? 'border-red-200 dark:border-red-800' : ''
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    book.status === 'overdue'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : book.status === 'returned'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    <BookOpen className={`w-5 h-5 ${
                      book.status === 'overdue' ? 'text-red-500' :
                      book.status === 'returned' ? 'text-green-500' :
                      'text-orange-500'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold truncate">{book.bookTitle}</h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{book.studentName}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Issued: {new Date(book.borrowedDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {new Date(book.dueDate).toLocaleDateString()}</span>
                      {book.returnDate && (
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Returned: {new Date(book.returnDate).toLocaleDateString()}</span>
                      )}
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
        </div>
      )}
    </div>
  );
}
