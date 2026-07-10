import { useState } from 'react'
import { useAuthStore } from '../../lib/store'
import { BookOpen, Book, Search, Clock, CheckCircle2, AlertCircle, ChevronRight, Star, Filter, X, Loader2, RefreshCw, Library } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface BookItem {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  cover?: string
  available: number
  total: number
}

interface BorrowedBook {
  id: string
  title: string
  author: string
  borrowedDate: string
  dueDate: string
  status: 'active' | 'overdue' | 'returned'
}

interface Activity {
  id: string
  type: 'borrowed' | 'returned' | 'reserved'
  book: string
  user: string
  date: string
}

const MOCK_BOOKS: BookItem[] = [
  { id: '1', title: 'Introduction to Algorithms', author: 'CLRS', isbn: '9780262033848', category: 'Computer Science', available: 3, total: 5 },
  { id: '2', title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', category: 'Computer Science', available: 2, total: 4 },
  { id: '3', title: 'The Pragmatic Programmer', author: 'David Thomas', isbn: '9780135957059', category: 'Computer Science', available: 4, total: 4 },
  { id: '4', title: 'Design Patterns', author: 'Gang of Four', isbn: '9780201633610', category: 'Computer Science', available: 1, total: 3 },
  { id: '5', title: 'Physics for Scientists and Engineers', author: 'Serway', isbn: '9781337553298', category: 'Physics', available: 2, total: 6 },
  { id: '6', title: 'Organic Chemistry', author: 'Morrison & Boyd', isbn: '9780134042282', category: 'Chemistry', available: 0, total: 3 },
  { id: '7', title: 'Principles of Economics', author: 'N. Gregory Mankiw', isbn: '9780357133804', category: 'Economics', available: 3, total: 5 },
  { id: '8', title: 'Calculus: Early Transcendentals', author: 'James Stewart', isbn: '9781337613927', category: 'Mathematics', available: 5, total: 8 },
]

const MOCK_BORROWED: BorrowedBook[] = [
  { id: '1', title: 'Introduction to Algorithms', author: 'CLRS', borrowedDate: '2026-06-15', dueDate: '2026-07-15', status: 'active' },
  { id: '2', title: 'Clean Code', author: 'Robert C. Martin', borrowedDate: '2026-05-20', dueDate: '2026-06-20', status: 'overdue' },
  { id: '3', title: 'Design Patterns', author: 'Gang of Four', borrowedDate: '2026-07-01', dueDate: '2026-08-01', status: 'active' },
]

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', type: 'borrowed', book: 'Introduction to Algorithms', user: 'Aarav S.', date: '2026-07-10' },
  { id: '2', type: 'returned', book: 'Physics for Scientists', user: 'Priya P.', date: '2026-07-09' },
  { id: '3', type: 'reserved', book: 'Clean Code', user: 'Rohan K.', date: '2026-07-08' },
  { id: '4', type: 'borrowed', book: 'Design Patterns', user: 'Ananya S.', date: '2026-07-07' },
  { id: '5', type: 'returned', book: 'Organic Chemistry', user: 'Vikram J.', date: '2026-07-06' },
]

export default function CSLibrary() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<'catalogue' | 'borrowed' | 'activities'>('catalogue')
  const [search, setSearch] = useState('')
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null)

  const filteredBooks = MOCK_BOOKS.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-50/30 dark:to-orange-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">CS Library</h1>
              <p className="text-sm text-muted-foreground">Browse, borrow, and manage books</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit">
          {(['catalogue', 'borrowed', 'activities'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all capitalize",
                tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t === 'catalogue' && <BookOpen className="w-4 h-4 inline mr-1.5" />}
              {t === 'borrowed' && <Clock className="w-4 h-4 inline mr-1.5" />}
              {t === 'activities' && <RefreshCw className="w-4 h-4 inline mr-1.5" />}
              {t}
            </button>
          ))}
        </div>

        {/* Catalogue Tab */}
        {tab === 'catalogue' && (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, author, or category..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBooks.map(book => (
                <button key={book.id} onClick={() => setSelectedBook(book)}
                  className="group text-left p-4 rounded-xl border border-border/50 bg-card hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center shrink-0">
                      <Book className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">{book.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                      <Badge variant="secondary" className="mt-2 text-[10px]">{book.category}</Badge>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className={book.available > 0 ? 'text-emerald-600' : 'text-red-500'}>
                          {book.available}/{book.total} available
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {filteredBooks.length === 0 && (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No books found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Borrowed Tab */}
        {tab === 'borrowed' && (
          <div className="space-y-3">
            {MOCK_BORROWED.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No borrowed books</p>
              </div>
            ) : (
              MOCK_BORROWED.map(book => (
                <div key={book.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center shrink-0">
                      <Book className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Borrowed: {book.borrowedDate}</span>
                        <span>Due: {book.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={cn(
                    'text-xs capitalize',
                    book.status === 'active' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    book.status === 'overdue' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    book.status === 'returned' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                  )}>
                    {book.status === 'active' && <Clock className="w-3 h-3 mr-1" />}
                    {book.status === 'overdue' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {book.status === 'returned' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {book.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        )}

        {/* Activities Tab */}
        {tab === 'activities' && (
          <div className="space-y-2">
            {MOCK_ACTIVITIES.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              MOCK_ACTIVITIES.map(act => (
                <div key={act.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card">
                  <div className={cn(
                    'p-2 rounded-lg',
                    act.type === 'borrowed' && 'bg-green-100 dark:bg-green-900/30 text-green-600',
                    act.type === 'returned' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
                    act.type === 'reserved' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
                  )}>
                    {act.type === 'borrowed' && <BookOpen className="w-4 h-4" />}
                    {act.type === 'returned' && <CheckCircle2 className="w-4 h-4" />}
                    {act.type === 'reserved' && <Star className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium capitalize">{act.type}</span>
                      {' '}— <span className="font-medium">{act.book}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{act.user} · {act.date}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Book Detail Dialog */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBook(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center shrink-0">
                <Book className="w-7 h-7 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold">{selectedBook.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedBook.author}</p>
                <p className="text-xs text-muted-foreground mt-1">ISBN: {selectedBook.isbn}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-[10px]">{selectedBook.category}</Badge>
                  <span className={cn('text-xs font-medium', selectedBook.available > 0 ? 'text-emerald-600' : 'text-red-500')}>
                    {selectedBook.available}/{selectedBook.total} available
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedBook(null)} className="p-1 rounded-md hover:bg-accent">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
