import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuthStore } from '../../lib/store'
import { Book, Clock, CheckCircle2, AlertCircle, Library, Loader2, Search, BookOpen, Star, BookMarked } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface BorrowedBook {
  id: string
  title: string
  author: string
  borrowedDate: string
  dueDate: string
  status: 'active' | 'overdue' | 'returned'
}

interface CatalogueBook {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  availableCopies: number
  totalCopies: number
}

function toBorrowed(data: any): BorrowedBook[] {
  const arr = Array.isArray(data) ? data : data?.borrowed ?? []
  return arr.map((b: any) => ({
    id: b.id ?? '',
    title: b.title ?? b.bookTitle ?? b.book?.title ?? '',
    author: b.author ?? b.book?.author ?? '',
    borrowedDate: b.borrowedDate ?? b.issuedDate ?? b.date ?? '',
    dueDate: b.dueDate ?? b.due ?? '',
    status: b.status === 'borrowed' ? 'active' : (b.status || 'active'),
  }))
}

function toCatalogue(data: any): CatalogueBook[] {
  const arr = Array.isArray(data) ? data : data?.books ?? data?.catalogue ?? []
  return arr.map((b: any) => ({
    id: b.id ?? b.isbn ?? '',
    title: b.title ?? b.name ?? '',
    author: b.author ?? '',
    isbn: b.isbn ?? '',
    category: b.category ?? b.genre ?? '',
    availableCopies: Number(b.availableCopies ?? b.available ?? b.copies ?? 0),
    totalCopies: Number(b.totalCopies ?? b.total ?? b.copies ?? b.available ?? 0),
  }))
}

export default function CSLibrary() {
  const user = useAuthStore(s => s.user)
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'reserve' ? 'reserve' : 'borrowed'
  const [tab, setTab] = useState<'borrowed' | 'reserve'>(initialTab)
  const [subTab, setSubTab] = useState<'catalogue' | 'my-reserved'>('catalogue')
  const [borrowed, setBorrowed] = useState<BorrowedBook[]>([])
  const [catalogue, setCatalogue] = useState<CatalogueBook[]>([])
  const [myBorrowedIds, setMyBorrowedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState<string | null>(null)

  const loadData = () => {
    Promise.all([
      api.getBorrowedBooks().catch(() => null),
      api.getLibraryCatalogue().catch(() => null),
    ]).then(([b, c]) => {
      if (b) {
        const raw = Array.isArray(b) ? b : b?.borrowed ?? []
        setBorrowed(toBorrowed(b))
        setMyBorrowedIds(new Set(raw.filter((x: any) => (x.status === 'borrowed' || x.status === 'overdue') && x.studentId === user?.id).map((x: any) => x.bookId)))
      }
      if (c) setCatalogue(toCatalogue(c))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [user])

  const filteredCatalogue = catalogue.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  )

  const myReservedBooks = borrowed.filter(b => b.status === 'active' || b.status === 'overdue')
  const myReservedBookIds = new Set(myReservedBooks.map(b => b.id))

  const handleReserve = async (book: CatalogueBook) => {
    setReserving(book.id)
    try {
      const studentId = user?.id
      const studentName = user?.name
      if (!studentId || !studentName) { alert('Please log in first'); return }
      await api.createHold({ bookId: book.id, studentId, studentName })
      await loadData()
      api.getUsers().then(all => {
        ;(Array.isArray(all) ? all : []).filter((u: any) => u.role === 'librarian').forEach((lib: any) => {
          api.createNotification({ userId: lib.id, title: 'Book Reserved', message: `${studentName} reserved "${book.title}"`, type: 'library' }).catch(() => {})
        })
      }).catch(() => {})
    } catch (e) {
      const msg = (e as any)?.message || ''
      if (!msg.includes('Already')) alert('Failed: ' + msg)
    } finally {
      setReserving(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
            <Library className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">CS Library</h1>
            <p className="text-sm text-muted-foreground">Borrowed & Reserve Books</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        <button onClick={() => { setTab('borrowed'); setSearchParams({ tab: 'borrowed' }) }}
          className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all capitalize",
            tab === 'borrowed' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Clock className="w-4 h-4 inline mr-1.5" />Borrowed
        </button>
        <button onClick={() => { setTab('reserve'); setSearchParams({ tab: 'reserve' }) }}
          className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all capitalize",
            tab === 'reserve' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Star className="w-4 h-4 inline mr-1.5" />Reserve Books
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && tab === 'borrowed' && (
        <div className="space-y-3">
          {borrowed.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No borrowed books</p>
            </div>
          ) : (
            borrowed.map(book => (
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

      {!loading && tab === 'reserve' && (
        <div className="space-y-4">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit">
            <button onClick={() => setSubTab('catalogue')}
              className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all capitalize",
                subTab === 'catalogue' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <BookOpen className="w-4 h-4 inline mr-1.5" />Catalogue
            </button>
            <button onClick={() => setSubTab('my-reserved')}
              className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all capitalize",
                subTab === 'my-reserved' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <BookMarked className="w-4 h-4 inline mr-1.5" />Your Reserved Books
            </button>
          </div>

          {subTab === 'catalogue' && (
            <>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by title, author, or category..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCatalogue.map(book => (
                  <div key={book.id}
                    className="group p-4 rounded-xl border border-border/50 bg-card hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                        <Badge variant="secondary" className="mt-2 text-[10px]">{book.category}</Badge>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span className={book.availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'}>
                            {book.availableCopies}/{book.totalCopies} available
                          </span>
                        </div>
                        {myBorrowedIds.has(book.id) ? (
                          <Button size="sm" variant="secondary" className="mt-2 w-full text-xs" disabled>
                            <CheckCircle2 className="w-3 h-3 mr-1" />Already Reserved
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="mt-2 w-full text-xs"
                            disabled={book.availableCopies < 1 || reserving === book.id}
                            onClick={() => handleReserve(book)}
                          >
                            {reserving === book.id ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Star className="w-3 h-3 mr-1" />
                            )}
                            Reserve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredCatalogue.length === 0 && (
                  <div className="col-span-full text-center py-16 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No books found</p>
                  </div>
                )}
              </div>
            </>
          )}

          {subTab === 'my-reserved' && (
            <div className="space-y-3">
              {myReservedBooks.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <BookMarked className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">You haven't reserved any books yet</p>
                </div>
              ) : (
                myReservedBooks.map(book => (
                  <div key={book.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center shrink-0">
                        <Book className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>Reserved: {book.borrowedDate}</span>
                          <span>Due: {book.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={cn(
                      'text-xs capitalize',
                      book.status === 'active' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                      book.status === 'overdue' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    )}>
                      {book.status === 'active' && <Clock className="w-3 h-3 mr-1" />}
                      {book.status === 'overdue' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {book.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
