import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  BookOpen, Search, Users, Calendar, Bookmark, CheckCircle2,
  XCircle, Loader2, Clock, Hash, Star, User, Plus
} from 'lucide-react';

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

interface HoldRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  status: string;
  placedAt: string;
  position?: number;
}

interface Student {
  id: string;
  name: string;
  class?: string;
  admissionNo?: string;
}

export default function LibrarianReserveBooks() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'catalogue' | 'holds'>('catalogue');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Catalogue
  const [catalogue, setCatalogue] = useState<CatalogueBook[]>([]);
  const [search, setSearch] = useState('');

  // Holds
  const [holds, setHolds] = useState<HoldRecord[]>([]);

  // Reservation form
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedBook, setSelectedBook] = useState<CatalogueBook | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [showReserveForm, setShowReserveForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cat, h, stu] = await Promise.all([
        api.getLibraryCatalogue().catch(() => []),
        api.getHolds().catch(() => []),
        api.getStudents().catch(() => []),
      ]);
      setCatalogue(Array.isArray(cat) ? cat : []);
      setHolds(Array.isArray(h) ? h : []);
      setStudents(Array.isArray(stu) ? stu : []);
    } catch (err) {
      console.error('[ReserveBooks] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshHolds = async () => {
    try {
      const h = await api.getHolds();
      setHolds(Array.isArray(h) ? h : []);
    } catch { /* ignore */ }
  };

  const filteredCatalogue = catalogue.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.admissionNo || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

  const activeHolds = holds.filter(h => h.status === 'active' || h.status === 'pending');
  const fulfilledHolds = holds.filter(h => h.status === 'fulfilled');

  const handleReserve = async () => {
    if (!selectedBook || !selectedStudent) return;
    setSubmitting(true);
    try {
      await api.createHold({
        bookId: selectedBook.id,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        bookTitle: selectedBook.title,
      });
      setShowReserveForm(false);
      setSelectedBook(null);
      setSelectedStudent(null);
      setStudentSearch('');
      await Promise.all([loadData(), refreshHolds()]);
    } catch (err: any) {
      alert(err?.message || 'Failed to place hold');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFulfill = async (hold: HoldRecord) => {
    try {
      // Use the fulfill hold endpoint to convert hold to borrow
      await api.fulfillHold(hold.id);
      await refreshHolds();
    } catch (err: any) {
      alert(err?.message || 'Failed to fulfill hold');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reserve Books</h1>
          <p className="text-muted-foreground">Browse catalogue and place holds for students</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{catalogue.length}</p>
              <p className="text-sm text-muted-foreground">Total Books</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{activeHolds.length}</p>
              <p className="text-sm text-muted-foreground">Active Holds</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{fulfilledHolds.length}</p>
              <p className="text-sm text-muted-foreground">Fulfilled</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {(['catalogue', 'holds'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${
              tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'catalogue' && <BookOpen className="w-4 h-4 inline mr-1.5" />}
            {t === 'holds' && <Bookmark className="w-4 h-4 inline mr-1.5" />}
            {t}
          </button>
        ))}
      </div>

      {/* Catalogue Tab */}
      {tab === 'catalogue' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}</div>
          ) : filteredCatalogue.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No books found</p>
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCatalogue.map(book => (
                <Card key={book.id} className="group hover:shadow-lg transition-all">
                  <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-[10px]">{book.category}</Badge>
                          <span className={`text-xs font-medium ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {book.availableCopies}/{book.totalCopies} avail.
                          </span>
                          {book.shelf && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Hash className="w-3 h-3" />{book.shelf}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => { setSelectedBook(book); setShowReserveForm(true); }}
                          disabled={book.availableCopies <= 0}
                        >
                          <Bookmark className="w-3 h-3 mr-1" />
                          {book.availableCopies > 0 ? 'Reserve for Student' : 'Unavailable'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Holds Tab */}
      {tab === 'holds' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}</div>
          ) : holds.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hold requests</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {/* Active Holds */}
              {activeHolds.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Active Holds ({activeHolds.length})
                  </h3>
                  {activeHolds.map(hold => (
                    <Card key={hold.id} className="p-4 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <Bookmark className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold truncate">{hold.bookTitle}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><User className="w-3 h-3" />{hold.studentName}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{hold.placedAt ? new Date(hold.placedAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            Position #{hold.position || '-'}
                          </Badge>
                          <Button size="sm" onClick={() => handleFulfill(hold)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />Fulfill
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
              )}

              {/* Fulfilled Holds */}
              {fulfilledHolds.length > 0 && (
                <>
                  <div className="pt-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Fulfilled ({fulfilledHolds.length})
                    </h3>
                  </div>
                  {fulfilledHolds.map(hold => (
                    <Card key={hold.id} className="p-4 opacity-75">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold truncate">{hold.bookTitle}</h4>
                          <p className="text-xs text-muted-foreground">{hold.studentName} — Fulfilled</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reserve Modal */}
      {showReserveForm && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Reserve Book</h2>
              <button onClick={() => { setShowReserveForm(false); setSelectedStudent(null); setStudentSearch(''); }}
                className="p-1 rounded-lg hover:bg-accent"><XCircle className="w-5 h-5" /></button>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">{selectedBook.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedBook.author} — {selectedBook.availableCopies} copies available</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium block">Select Student</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-10" placeholder="Search by name or admission no..."
                  value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                {filteredStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No students found</p>
                ) : (
                  filteredStudents.map(s => (
                    <button key={s.id} type="button"
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
                        <p className="text-xs text-muted-foreground">{s.class || 'N/A'} {s.admissionNo ? `• ${s.admissionNo}` : ''}</p>
                      </div>
                      {selectedStudent?.id === s.id && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => { setShowReserveForm(false); setSelectedStudent(null); setStudentSearch(''); }}>
                Cancel
              </Button>
              <Button onClick={handleReserve} disabled={!selectedStudent || submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Bookmark className="w-4 h-4 mr-1" />}
                Place Hold
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
