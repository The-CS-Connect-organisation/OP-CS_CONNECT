import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { NavSheet, NavSheetItem } from '../../components/ui/NavSheet';
import { BookOpen, Search, Plus, Edit, Trash2, CheckCircle, DollarSign, Users, Calendar, Star, Library, FileText, ChevronDown } from 'lucide-react';

interface CatalogueBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  copies: number;
  available: number;
  shelfLocation: string;
}

interface HoldRequest {
  id: string;
  bookTitle: string;
  studentName: string;
  requestDate: string;
  status: string;
}

interface Fine {
  id: string;
  studentName: string;
  amount: number;
  reason: string;
  date: string;
  status: 'paid' | 'pending';
}

interface ClassSet {
  id: string;
  bookTitle: string;
  className: string;
  total: number;
  issued: number;
}

interface ReadingLog {
  id: string;
  studentName: string;
  bookTitle: string;
  pages: number;
  date: string;
}

interface ReadingProgramme {
  id: string;
  name: string;
  duration: string;
  participants: number;
}

interface BookReview {
  id: string;
  rating: number;
  comment: string;
  reviewer: string;
}

interface InterlibraryLoan {
  id: string;
  requestingLibrary: string;
  bookTitle: string;
  status: string;
}

type SubSection = 'catalogue' | 'holds' | 'fines' | 'class-sets' | 'reading-logs' | 'programmes' | 'reviews' | 'ill';

export default function AdminLibrary() {
  const [catalogue, setCatalogue] = useState<CatalogueBook[]>([]);
  const [holds, setHolds] = useState<HoldRequest[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [classSets, setClassSets] = useState<ClassSet[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [programmes, setProgrammes] = useState<ReadingProgramme[]>([]);
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [ills, setIlls] = useState<InterlibraryLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subSection, setSubSection] = useState<SubSection>('catalogue');
  const [showSubNavSheet, setShowSubNavSheet] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [cat, h, f, cs, rl, prog, rev, ill] = await Promise.all([
        api.getLibraryCatalogue(),
        api.getHolds(),
        api.getFines(),
        api.getClassSets(),
        api.getReadingLogs('all'),
        api.getReadingProgrammes(),
        api.getBookReviews('all'),
        api.getInterlibraryLoans(),
      ]);
      setCatalogue(Array.isArray(cat) ? cat : []);
      setHolds(Array.isArray(h) ? h : []);
      setFines(Array.isArray(f) ? f : []);
      setClassSets(Array.isArray(cs) ? cs : []);
      setReadingLogs(Array.isArray(rl) ? rl : []);
      setProgrammes(Array.isArray(prog) ? prog : []);
      setReviews(Array.isArray(rev) ? rev : []);
      setIlls(Array.isArray(ill) ? ill : []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const filteredCatalogue = catalogue.filter(b =>
    (b.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (b.author ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  const subNavItems: { key: SubSection; label: string; icon: React.ReactNode }[] = [
    { key: 'catalogue', label: 'Catalogue', icon: <BookOpen className="w-4 h-4 shrink-0" /> },
    { key: 'holds', label: 'Holds', icon: <Library className="w-4 h-4 shrink-0" /> },
    { key: 'fines', label: 'Fines', icon: <DollarSign className="w-4 h-4 shrink-0" /> },
    { key: 'class-sets', label: 'Class Sets', icon: <Users className="w-4 h-4 shrink-0" /> },
    { key: 'reading-logs', label: 'Reading Logs', icon: <FileText className="w-4 h-4 shrink-0" /> },
    { key: 'programmes', label: 'Programmes', icon: <Calendar className="w-4 h-4 shrink-0" /> },
    { key: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4 shrink-0" /> },
    { key: 'ill', label: 'ILL', icon: <Library className="w-4 h-4 shrink-0" /> },
  ];

  const currentSubNav = subNavItems.find((i) => i.key === subSection);

  return (
    <div className="min-w-0 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold">Library Management</h1>
        <p className="text-sm text-muted-foreground">Manage catalogue, holds, fines & more</p>
      </div>

      {/* secondary navigation buttons (desktop) */}
      <div className="hidden sm:flex items-center gap-1 overflow-x-auto flex-nowrap scrollbar-thin pb-px">
        {subNavItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setSubSection(item.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              subSection === item.key
                ? 'bg-orange-500/10 text-orange-600'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* mobile secondary nav — fans out from bottom nav bar */}
      <div className="sm:hidden">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setShowSubNavSheet(true)}
        >
          <span className="flex items-center gap-2">
            {currentSubNav?.icon}
            {currentSubNav?.label}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
        <NavSheet
          isOpen={showSubNavSheet}
          onClose={() => setShowSubNavSheet(false)}
          title="Select Section"
        >
          {subNavItems.map((item, i) => (
            <NavSheetItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={subSection === item.key}
              index={i}
              onClick={() => { setSubSection(item.key); setShowSubNavSheet(false); }}
            />
          ))}
        </NavSheet>
      </div>

      {subSection === 'catalogue' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search by title or author..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
            </div>
            <Button><Plus className="w-4 h-4 mr-2" />Add Book</Button>
          </div>
          <div className="space-y-3">
            {filteredCatalogue.map(book => (
              <Card key={book.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{book.title}</h4>
                    <p className="text-sm text-muted-foreground">{book.author} • {book.isbn}</p>
                    <p className="text-sm text-muted-foreground">{book.category} • Shelf: {book.shelfLocation}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm">Copies: {book.copies}</p>
                      <p className="text-sm text-muted-foreground">Available: {book.available}</p>
                    </div>
                    <Badge variant={book.available > 0 ? 'success' : 'destructive'}>{book.available > 0 ? 'In Stock' : 'Out'}</Badge>
                    <button className="p-2 hover:bg-accent rounded"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {subSection === 'holds' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button><Plus className="w-4 h-4 mr-2" />New Hold</Button>
          </div>
          <div className="space-y-3">
            {holds.map(h => (
              <Card key={h.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{h.bookTitle}</h4>
                    <p className="text-sm text-muted-foreground">Student: {h.studentName}</p>
                    <p className="text-sm text-muted-foreground">Requested: {new Date(h.requestDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={h.status === 'fulfilled' ? 'success' : 'warning'}>{h.status}</Badge>
                    {h.status !== 'fulfilled' && <Button size="sm" onClick={() => api.fulfillHold(h.id).then(loadAll)}><CheckCircle className="w-4 h-4 mr-1" />Fulfill</Button>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {subSection === 'fines' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button><Plus className="w-4 h-4 mr-2" />New Fine</Button>
          </div>
          <div className="space-y-3">
            {fines.map(f => (
              <Card key={f.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{f.studentName}</h4>
                    <p className="text-sm text-muted-foreground">{f.reason}</p>
                    <p className="text-sm text-muted-foreground">{new Date(f.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">${f.amount}</p>
                    <Badge variant={f.status === 'paid' ? 'success' : 'warning'}>{f.status}</Badge>
                    {f.status !== 'paid' && <Button size="sm" onClick={() => api.payFine(f.id).then(loadAll)}><DollarSign className="w-4 h-4 mr-1" />Pay</Button>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {subSection === 'class-sets' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button><Plus className="w-4 h-4 mr-2" />New Class Set</Button>
          </div>
          <div className="space-y-3">
            {classSets.map(cs => (
              <Card key={cs.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{cs.bookTitle}</h4>
                    <p className="text-sm text-muted-foreground">Class: {cs.className}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Total: {cs.total}</p>
                    <p className="text-sm text-muted-foreground">Issued: {cs.issued}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {subSection === 'reading-logs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button><Plus className="w-4 h-4 mr-2" />New Log</Button>
          </div>
          <div className="space-y-3">
            {readingLogs.map(log => (
              <Card key={log.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{log.studentName}</h4>
                    <p className="text-sm text-muted-foreground">{log.bookTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Pages: {log.pages}</p>
                    <p className="text-sm text-muted-foreground">{new Date(log.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {subSection === 'programmes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button><Plus className="w-4 h-4 mr-2" />New Programme</Button>
          </div>
          <div className="space-y-3">
            {programmes.map(p => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{p.name}</h4>
                    <p className="text-sm text-muted-foreground">Duration: {p.duration}</p>
                  </div>
                  <p className="text-sm font-semibold">{p.participants} participants</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {subSection === 'reviews' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button><Plus className="w-4 h-4 mr-2" />New Review</Button>
          </div>
          <div className="space-y-3">
            {reviews.map(r => (
              <Card key={r.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{r.reviewer}</h4>
                      <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />)}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {subSection === 'ill' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button><Plus className="w-4 h-4 mr-2" />New ILL</Button>
          </div>
          <div className="space-y-3">
            {ills.map(ill => (
              <Card key={ill.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{ill.bookTitle}</h4>
                    <p className="text-sm text-muted-foreground">From: {ill.requestingLibrary}</p>
                  </div>
                  <Badge variant={ill.status === 'received' ? 'success' : ill.status === 'pending' ? 'warning' : 'default'}>{ill.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
