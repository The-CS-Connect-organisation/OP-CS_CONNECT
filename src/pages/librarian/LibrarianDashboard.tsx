import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Library, BookOpen, Users, Search, Plus, Calendar } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  status: 'available' | 'borrowed' | 'reserved';
}

export default function LibrarianDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await api.getBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalBooks = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableBooks = books.reduce((sum, b) => sum + b.availableCopies, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Library Management</h1>
        <p className="text-muted-foreground">Manage library resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <Library className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold stat-value">{totalBooks}</p>
              <p className="text-sm text-muted-foreground">Total Books</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold stat-value">{availableBooks}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 card-hover">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold stat-value">{totalBooks - availableBooks}</p>
              <p className="text-sm text-muted-foreground">Borrowed</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search books..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Add Book</Button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {filteredBooks.map(book => (
            <Card key={book.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{book.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{book.author}</span>
                    <span>•</span>
                    <span>{book.isbn}</span>
                    <span>•</span>
                    <span>{book.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{book.availableCopies}/{book.totalCopies} available</p>
                  <Badge className={book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {book.availableCopies > 0 ? 'Available' : 'All Borrowed'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
