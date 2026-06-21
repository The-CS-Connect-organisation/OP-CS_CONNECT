import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
  BookOpen, Plus, Search, Edit, Trash2, Check, X, Star,
  Bookmark, DollarSign, BookCopy, Library, ScrollText, MessageSquare, Globe
} from 'lucide-react';

interface CatalogueItem {
  id: string; title: string; author: string; isbn: string;
  category: string; copies: number; available: number; shelf: string;
}
interface Hold {
  id: string; bookId: string; bookTitle: string;
  studentId: string; studentName: string; date: string; status: string;
}
interface Fine {
  id: string; studentId: string; studentName: string;
  amount: number; reason: string; status: string; date: string;
}
interface ClassSet {
  id: string; bookId: string; bookTitle: string;
  className: string; quantity: number;
}
interface ReadingLog {
  id: string; studentId: string; studentName: string;
  bookId: string; bookTitle: string; pagesRead: number; date: string;
}
interface Programme {
  id: string; name: string; description: string;
  startDate: string; endDate: string; status: string;
}
interface Review {
  id: string; bookId: string; bookTitle: string;
  studentId: string; studentName: string;
  rating: number; comment: string; date: string;
}
interface ILL {
  id: string; bookTitle: string; author: string;
  requesterName: string; library: string; status: string; date: string;
}

export default function ManagerLibrary() {
  const [tab, setTab] = useState('catalogue');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [catalogue, setCatalogue] = useState<CatalogueItem[]>([]);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [classSets, setClassSets] = useState<ClassSet[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ills, setIlls] = useState<ILL[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [c, h, f, cs, rl, p, r, i] = await Promise.all([
        api.getLibraryCatalogue(), api.getHolds(), api.getFines(),
        api.getClassSets(), api.getReadingLogs(''), api.getReadingProgrammes(),
        api.getBookReviews(''), api.getInterlibraryLoans(),
      ]);
      setCatalogue(Array.isArray(c) ? c : []);
      setHolds(Array.isArray(h) ? h : []);
      setFines(Array.isArray(f) ? f : []);
      setClassSets(Array.isArray(cs) ? cs : []);
      setReadingLogs(Array.isArray(rl) ? rl : []);
      setProgrammes(Array.isArray(p) ? p : []);
      setReviews(Array.isArray(r) ? r : []);
      setIlls(Array.isArray(i) ? i : []);
    } catch { /* error */ } finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (tab === 'catalogue') {
        if (editing) {
          await api.updateLibraryItem(editing.id, form);
          setCatalogue(prev => prev.map(x => x.id === editing.id ? { ...x, ...form } : x));
        } else {
          const res = await api.createLibraryItem(form);
          setCatalogue(prev => [...prev, res]);
        }
      } else if (tab === 'holds') {
        await api.createHold(form);
        const data = await api.getHolds();
        setHolds(Array.isArray(data) ? data : []);
      } else if (tab === 'fines') {
        await api.createFine(form);
        const data = await api.getFines();
        setFines(Array.isArray(data) ? data : []);
      } else if (tab === 'class-sets') {
        await api.createClassSet(form);
        const data = await api.getClassSets();
        setClassSets(Array.isArray(data) ? data : []);
      } else if (tab === 'reading-logs') {
        await api.createReadingLog(form);
        const data = await api.getReadingLogs('');
        setReadingLogs(Array.isArray(data) ? data : []);
      } else if (tab === 'programmes') {
        await api.createReadingProgramme(form);
        const data = await api.getReadingProgrammes();
        setProgrammes(Array.isArray(data) ? data : []);
      } else if (tab === 'reviews') {
        await api.createBookReview(form);
        const data = await api.getBookReviews('');
        setReviews(Array.isArray(data) ? data : []);
      } else if (tab === 'ills') {
        await api.createInterlibraryLoan(form);
        const data = await api.getInterlibraryLoans();
        setIlls(Array.isArray(data) ? data : []);
      }
      setShowForm(false);
      setEditing(null);
      setForm({});
    } catch { /* error */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteLibraryItem(id);
      setCatalogue(prev => prev.filter(x => x.id !== id));
    } catch { /* error */ }
  };

  const handleFulfillHold = async (id: string) => {
    try {
      await api.fulfillHold(id);
      setHolds(prev => prev.map(h => h.id === id ? { ...h, status: 'fulfilled' } : h));
    } catch { /* error */ }
  };

  const handlePayFine = async (id: string) => {
    try {
      await api.payFine(id);
      setFines(prev => prev.map(f => f.id === id ? { ...f, status: 'paid' } : f));
    } catch { /* error */ }
  };

  const getCatalogueForm = () => (
    <div className="space-y-3">
      <Input placeholder="Title" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} />
      <Input placeholder="Author" value={form.author || ''} onChange={e => setForm({...form, author: e.target.value})} />
      <Input placeholder="ISBN" value={form.isbn || ''} onChange={e => setForm({...form, isbn: e.target.value})} />
      <Input placeholder="Category" value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} />
      <Input placeholder="Copies" type="number" value={form.copies || ''} onChange={e => setForm({...form, copies: parseInt(e.target.value) || 0})} />
      <Input placeholder="Shelf" value={form.shelf || ''} onChange={e => setForm({...form, shelf: e.target.value})} />
    </div>
  );

  const getSimpleForm = (fields: { key: string; label: string; type?: string }[]) => (
    <div className="space-y-3">
      {fields.map(f => (
        <Input key={f.key} type={f.type || 'text'} placeholder={f.label} value={form[f.key] || ''} onChange={e => setForm({...form, [f.key]: e.target.value})} />
      ))}
    </div>
  );

  const renderForm = () => {
    if (!showForm) return null;
    let title = '';
    let fields: { key: string; label: string; type?: string }[] = [];
    switch (tab) {
      case 'catalogue': title = editing ? 'Edit Book' : 'Add Book'; break;
      case 'holds': title = 'New Hold Request'; fields = [{ key: 'bookId', label: 'Book ID' }, { key: 'studentId', label: 'Student ID' }]; break;
      case 'fines': title = 'New Fine'; fields = [{ key: 'studentId', label: 'Student ID' }, { key: 'amount', label: 'Amount', type: 'number' }, { key: 'reason', label: 'Reason' }]; break;
      case 'class-sets': title = 'New Class Set'; fields = [{ key: 'bookId', label: 'Book ID' }, { key: 'className', label: 'Class Name' }, { key: 'quantity', label: 'Quantity', type: 'number' }]; break;
      case 'reading-logs': title = 'New Reading Log'; fields = [{ key: 'studentId', label: 'Student ID' }, { key: 'bookId', label: 'Book ID' }, { key: 'pagesRead', label: 'Pages Read', type: 'number' }]; break;
      case 'programmes': title = 'New Reading Programme'; fields = [{ key: 'name', label: 'Name' }, { key: 'description', label: 'Description' }]; break;
      case 'reviews': title = 'New Review'; fields = [{ key: 'bookId', label: 'Book ID' }, { key: 'studentId', label: 'Student ID' }, { key: 'rating', label: 'Rating (1-5)', type: 'number' }, { key: 'comment', label: 'Comment' }]; break;
      case 'ills': title = 'New ILL Request'; fields = [{ key: 'bookTitle', label: 'Book Title' }, { key: 'author', label: 'Author' }, { key: 'library', label: 'Library' }]; break;
    }
    return (
      <Card className="p-4 mb-4">
        <h3 className="font-semibold mb-4">{title}</h3>
        {tab === 'catalogue' ? getCatalogueForm() : getSimpleForm(fields)}
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); setForm({}); }}>Cancel</Button>
        </div>
      </Card>
    );
  };

  const filteredCatalogue = catalogue.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Library Management</h1><p className="text-muted-foreground">Manage library resources</p></div>
      <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Library Management</h1>
          <p className="text-muted-foreground">Manage library resources</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({}); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add {tab === 'catalogue' ? 'Book' : 'Entry'}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="catalogue"><BookOpen className="w-4 h-4 mr-1" />Catalogue</TabsTrigger>
          <TabsTrigger value="holds"><Bookmark className="w-4 h-4 mr-1" />Holds</TabsTrigger>
          <TabsTrigger value="fines"><DollarSign className="w-4 h-4 mr-1" />Fines</TabsTrigger>
          <TabsTrigger value="class-sets"><BookCopy className="w-4 h-4 mr-1" />Class Sets</TabsTrigger>
          <TabsTrigger value="reading-logs"><ScrollText className="w-4 h-4 mr-1" />Reading Logs</TabsTrigger>
          <TabsTrigger value="programmes"><Library className="w-4 h-4 mr-1" />Programmes</TabsTrigger>
          <TabsTrigger value="reviews"><MessageSquare className="w-4 h-4 mr-1" />Reviews</TabsTrigger>
          <TabsTrigger value="ills"><Globe className="w-4 h-4 mr-1" />ILL</TabsTrigger>
        </TabsList>

        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {renderForm()}

        <TabsContent value="catalogue" className="space-y-3">
          {filteredCatalogue.map(book => (
            <Card key={book.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{book.title}</h4>
                    <Badge variant="secondary">{book.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{book.author} · {book.isbn}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span>Copies: <strong>{book.copies}</strong></span>
                    <span>Available: <strong className="text-green-600">{book.available}</strong></span>
                    <span>Shelf: <strong>{book.shelf}</strong></span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(book); setForm(book); setShowForm(true); }} className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(book.id)} className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
          {filteredCatalogue.length === 0 && <p className="text-center text-muted-foreground py-8">No books found</p>}
        </TabsContent>

        <TabsContent value="holds" className="space-y-3">
          {holds.map(h => (
            <Card key={h.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{h.bookTitle}</h4>
                  <p className="text-sm text-muted-foreground">{h.studentName} · {new Date(h.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={h.status === 'fulfilled' ? 'success' : 'warning'}>{h.status}</Badge>
                  {h.status !== 'fulfilled' && (
                    <Button size="sm" onClick={() => handleFulfillHold(h.id)}><Check className="w-4 h-4 mr-1" />Fulfill</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {holds.length === 0 && <p className="text-center text-muted-foreground py-8">No holds</p>}
        </TabsContent>

        <TabsContent value="fines" className="space-y-3">
          {fines.map(f => (
            <Card key={f.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{f.studentName}</h4>
                  <p className="text-sm text-muted-foreground">{f.reason} · ${f.amount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={f.status === 'paid' ? 'success' : 'destructive'}>{f.status}</Badge>
                  {f.status !== 'paid' && (
                    <Button size="sm" variant="outline" onClick={() => handlePayFine(f.id)}><DollarSign className="w-4 h-4 mr-1" />Pay</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {fines.length === 0 && <p className="text-center text-muted-foreground py-8">No fines</p>}
        </TabsContent>

        <TabsContent value="class-sets" className="space-y-3">
          {classSets.map(cs => (
            <Card key={cs.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{cs.bookTitle}</h4>
                  <p className="text-sm text-muted-foreground">Class: {cs.className} · Qty: {cs.quantity}</p>
                </div>
              </div>
            </Card>
          ))}
          {classSets.length === 0 && <p className="text-center text-muted-foreground py-8">No class sets</p>}
        </TabsContent>

        <TabsContent value="reading-logs" className="space-y-3">
          {readingLogs.map(rl => (
            <Card key={rl.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{rl.bookTitle}</h4>
                  <p className="text-sm text-muted-foreground">{rl.studentName} · {rl.pagesRead} pages</p>
                </div>
                <span className="text-sm text-muted-foreground">{new Date(rl.date).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
          {readingLogs.length === 0 && <p className="text-center text-muted-foreground py-8">No reading logs</p>}
        </TabsContent>

        <TabsContent value="programmes" className="space-y-3">
          {programmes.map(p => (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{p.name}</h4>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={p.status === 'active' ? 'success' : 'secondary'}>{p.status}</Badge>
              </div>
            </Card>
          ))}
          {programmes.length === 0 && <p className="text-center text-muted-foreground py-8">No programmes</p>}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-3">
          {reviews.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{r.bookTitle}</h4>
                    <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />)}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">by {r.studentName}</p>
                  {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
                </div>
                <span className="text-sm text-muted-foreground">{new Date(r.date).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
          {reviews.length === 0 && <p className="text-center text-muted-foreground py-8">No reviews</p>}
        </TabsContent>

        <TabsContent value="ills" className="space-y-3">
          {ills.map(i => (
            <Card key={i.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{i.bookTitle}</h4>
                  <p className="text-sm text-muted-foreground">{i.author} · {i.library} · {i.requesterName}</p>
                </div>
                <Badge variant={i.status === 'approved' ? 'success' : i.status === 'rejected' ? 'destructive' : 'warning'}>{i.status}</Badge>
              </div>
            </Card>
          ))}
          {ills.length === 0 && <p className="text-center text-muted-foreground py-8">No ILL requests</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
