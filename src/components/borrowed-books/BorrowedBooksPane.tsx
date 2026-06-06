import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { BookOpen, Calendar, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BorrowedBook {
  id: string
  bookTitle: string
  isbn: string
  studentId: string
  studentName: string
  borrowedDate: string
  dueDate: string
  status: 'borrowed' | 'returned' | 'overdue'
}

interface BorrowedBooksPaneProps {
  compact?: boolean
}

export default function BorrowedBooksPane({ compact = false }: BorrowedBooksPaneProps) {
  const { user } = useAuthStore()
  const [books, setBooks] = useState<BorrowedBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadBooks() }, [])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const data = user?.role === 'librarian'
        ? await api.getBorrowedBooks()
        : await api.getBorrowedBooksByStudent(user?.id || '')
      setBooks(Array.isArray(data) ? data : [])
    } catch { /* error */ } finally { setLoading(false) }
  }

  const handleReturn = async (id: string) => {
    try {
      await api.returnBook(id)
      setBooks(prev => prev.map(b => b.id === id ? { ...b, status: 'returned' as const } : b))
    } catch { /* error */ }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'borrowed': return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><Clock className="w-3 h-3 mr-1" />Borrowed</Badge>
      case 'overdue': return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>
      case 'returned': return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Returned</Badge>
      default: return null
    }
  }

  const activeBooks = books.filter(b => b.status !== 'returned')
  const overdueBooks = books.filter(b => b.status === 'overdue')

  if (loading) return <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-500" />
            Borrowed Books
            {activeBooks.length > 0 && <Badge variant="secondary" className="ml-auto">{activeBooks.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeBooks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No borrowed books</p>
          ) : (
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {activeBooks.map(book => (
                  <div key={book.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{book.bookTitle}</p>
                      <p className="text-xs text-muted-foreground">Due: {new Date(book.dueDate).toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(book.status)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-orange-500" />Library Books</h1>
          <p className="text-sm text-muted-foreground">{activeBooks.length} active, {overdueBooks.length} overdue</p>
        </div>
      </div>

      {overdueBooks.length > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">{overdueBooks.length} overdue book{overdueBooks.length > 1 ? 's' : ''} - Please return immediately</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {books.map(book => (
          <Card key={book.id} className={cn("transition-all hover:shadow-md", book.status === 'overdue' && "border-red-200 dark:border-red-800")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", book.status === 'overdue' ? "bg-red-100 dark:bg-red-900/30" : "bg-orange-100 dark:bg-orange-900/30")}>
                    <BookOpen className={cn("w-5 h-5", book.status === 'overdue' ? "text-red-500" : "text-orange-500")} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{book.bookTitle}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Borrowed: {new Date(book.borrowedDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {new Date(book.dueDate).toLocaleDateString()}</span>
                      {user?.role === 'librarian' && <span className="flex items-center gap-1"><User className="w-3 h-3" />{book.studentName}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(book.status)}
                  {book.status !== 'returned' && user?.role === 'librarian' && (
                    <Button size="sm" onClick={() => handleReturn(book.id)}>Mark Returned</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No borrowed books</h3>
          <p className="text-muted-foreground">Visit the library to borrow books</p>
        </div>
      )}
    </div>
  )
}
