import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import {
  BookOpen, Search, Plus, Edit3, Trash2, Users, DollarSign,
  Bookmark, ClipboardList, Star, Globe, Calendar, CheckCircle2,
  XCircle, Clock, Library, UserCheck, BookCopy, FileText,
  ChevronDown, Hash, Layers
} from 'lucide-react';

export default function LibrarianManagement() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catalogue');

  // Catalogue
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [catSearch, setCatSearch] = useState('');
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [catForm, setCatForm] = useState({ title: '', author: '', isbn: '', category: '', copies: 1, shelf: '' });

  // Holds
  const [holds, setHolds] = useState<any[]>([]);
  const [showHoldForm, setShowHoldForm] = useState(false);
  const [holdForm, setHoldForm] = useState({ studentId: '', bookId: '' });

  // Fines
  const [fines, setFines] = useState<any[]>([]);
  const [showFineForm, setShowFineForm] = useState(false);
  const [fineForm, setFineForm] = useState({ studentId: '', amount: 0, reason: '' });

  // Class Sets
  const [classSets, setClassSets] = useState<any[]>([]);
  const [showClassSetForm, setShowClassSetForm] = useState(false);
  const [classSetForm, setClassSetForm] = useState({ bookId: '', className: '', totalQuantity: 1 });

  // Reading Logs
  const [readingLogs, setReadingLogs] = useState<any[]>([]);
  const [logStudentId, setLogStudentId] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ studentId: '', bookId: '', pagesRead: 0, notes: '' });

  // Programmes
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [showProgForm, setShowProgForm] = useState(false);
  const [progForm, setProgForm] = useState({ name: '', duration: '', description: '' });

  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewBookId, setReviewBookId] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ bookId: '', studentId: '', rating: 5, comment: '' });

  // ILL
  const [ills, setIlls] = useState<any[]>([]);
  const [showIllForm, setShowIllForm] = useState(false);
  const [illForm, setIllForm] = useState({ requestingLibrary: '', bookTitle: '', borrowDate: '', returnDate: '' });

  const [students, setStudents] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Mathematics', 'Literature', 'Reference', 'Technology', 'Arts', 'Biography'];

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cat, h, f, cs, prog, ill, stu, bk] = await Promise.all([
        api.getLibraryCatalogue().catch(() => []),
        api.getHolds().catch(() => []),
        api.getFines().catch(() => []),
        api.getClassSets().catch(() => []),
        api.getReadingProgrammes().catch(() => []),
        api.getInterlibraryLoans().catch(() => []),
        api.getStudents().catch(() => []),
        api.getLibraryCatalogue().catch(() => []),
      ]);
      setCatalogue(Array.isArray(cat) ? cat : []);
      setHolds(Array.isArray(h) ? h : []);
      setFines(Array.isArray(f) ? f : []);
      setClassSets(Array.isArray(cs) ? cs : []);
      setProgrammes(Array.isArray(prog) ? prog : []);
      setIlls(Array.isArray(ill) ? ill : []);
      setStudents(Array.isArray(stu) ? stu : []);
      setBooks(Array.isArray(bk) ? bk : []);
    } catch (err) { console.error('[LibrarianManagement] Failed to load data:', err); } finally { setLoading(false); }
  };

  const reloadTab = async (tab: string) => {
    try {
      switch (tab) {
        case 'catalogue': { const d = await api.getLibraryCatalogue(); setCatalogue(Array.isArray(d) ? d : []); break; }
        case 'holds': { const d = await api.getHolds(); setHolds(Array.isArray(d) ? d : []); break; }
        case 'fines': { const d = await api.getFines(); setFines(Array.isArray(d) ? d : []); break; }
        case 'class-sets': { const d = await api.getClassSets(); setClassSets(Array.isArray(d) ? d : []); break; }
        case 'programmes': { const d = await api.getReadingProgrammes(); setProgrammes(Array.isArray(d) ? d : []); break; }
        case 'ills': { const d = await api.getInterlibraryLoans(); setIlls(Array.isArray(d) ? d : []); break; }
      }
    } catch (err) { console.error('[LibrarianManagement] Failed to reload tab:', err); }
  };

  // Catalogue
  const handleCatSave = async () => {
    setSubmitting(true);
    try {
      if (editingCat) {
        await api.updateLibraryItem(editingCat.id, catForm);
      } else {
        await api.createLibraryItem(catForm);
      }
      setShowCatForm(false); setEditingCat(null);
      setCatForm({ title: '', author: '', isbn: '', category: '', copies: 1, shelf: '' });
      await reloadTab('catalogue');
    } catch (err) { console.error('[LibrarianManagement] Failed to save catalogue:', err); } finally { setSubmitting(false); }
  };

  const handleCatDelete = async (id: string) => {
    try { await api.deleteLibraryItem(id); await reloadTab('catalogue'); } catch (err) { console.error('[LibrarianManagement] Failed to delete item:', err); }
  };

  const openCatEdit = (item: any) => {
    setEditingCat(item);
    setCatForm({ title: item.title || '', author: item.author || '', isbn: item.isbn || '', category: item.category || '', copies: item.copies || item.totalCopies || 1, shelf: item.shelf || '' });
    setShowCatForm(true);
  };

  // Holds
  const handleHoldCreate = async () => {
    setSubmitting(true);
    try {
      await api.createHold(holdForm);
      setShowHoldForm(false); setHoldForm({ studentId: '', bookId: '' });
      await reloadTab('holds');
    } catch (err) { console.error('[LibrarianManagement] Failed to create hold:', err); } finally { setSubmitting(false); }
  };

  const handleHoldFulfill = async (id: string) => {
    try { await api.fulfillHold(id); await reloadTab('holds'); } catch (err) { console.error('[LibrarianManagement] Failed to fulfill hold:', err); }
  };

  // Fines
  const handleFineCreate = async () => {
    setSubmitting(true);
    try {
      await api.createFine(fineForm);
      setShowFineForm(false); setFineForm({ studentId: '', amount: 0, reason: '' });
      await reloadTab('fines');
    } catch (err) { console.error('[LibrarianManagement] Failed to create fine:', err); } finally { setSubmitting(false); }
  };

  const handleFinePay = async (id: string) => {
    try { await api.payFine(id); await reloadTab('fines'); } catch (err) { console.error('[LibrarianManagement] Failed to pay fine:', err); }
  };

  // Class Sets
  const handleClassSetCreate = async () => {
    setSubmitting(true);
    try {
      await api.createClassSet(classSetForm);
      setShowClassSetForm(false); setClassSetForm({ bookId: '', className: '', totalQuantity: 1 });
      await reloadTab('class-sets');
    } catch (err) { console.error('[LibrarianManagement] Failed to create class set:', err); } finally { setSubmitting(false); }
  };

  // Reading Logs
  const loadReadingLogs = async (sid: string) => {
    if (!sid) { setReadingLogs([]); return; }
    try { const d = await api.getReadingLogs(sid); setReadingLogs(Array.isArray(d) ? d : []); } catch { setReadingLogs([]); }
  };

  useEffect(() => { if (logStudentId) loadReadingLogs(logStudentId); }, [logStudentId]);

  const handleLogCreate = async () => {
    setSubmitting(true);
    try {
      await api.createReadingLog(logForm);
      setShowLogForm(false);
      setLogForm({ studentId: logForm.studentId, bookId: '', pagesRead: 0, notes: '' });
      await loadReadingLogs(logForm.studentId);
    } catch (err) { console.error('[LibrarianManagement] Failed to create reading log:', err); } finally { setSubmitting(false); }
  };

  // Programmes
  const handleProgCreate = async () => {
    setSubmitting(true);
    try {
      await api.createReadingProgramme(progForm);
      setShowProgForm(false); setProgForm({ name: '', duration: '', description: '' });
      await reloadTab('programmes');
    } catch (err) { console.error('[LibrarianManagement] Failed to create programme:', err); } finally { setSubmitting(false); }
  };

  // Reviews
  const loadReviews = async (bid: string) => {
    if (!bid) { setReviews([]); return; }
    try { const d = await api.getBookReviews(bid); setReviews(Array.isArray(d) ? d : []); } catch (err) { console.error('[LibrarianManagement] Failed to load reviews:', err); setReviews([]); }
  };

  useEffect(() => { if (reviewBookId) loadReviews(reviewBookId); }, [reviewBookId]);

  const handleReviewCreate = async () => {
    setSubmitting(true);
    try {
      await api.createBookReview(reviewForm);
      setShowReviewForm(false);
      setReviewForm({ bookId: reviewForm.bookId, studentId: '', rating: 5, comment: '' });
      await loadReviews(reviewForm.bookId);
    } catch (err) { console.error('[LibrarianManagement] Failed to create review:', err); } finally { setSubmitting(false); }
  };

  // ILL
  const handleIllCreate = async () => {
    setSubmitting(true);
    try {
      await api.createInterlibraryLoan(illForm);
      setShowIllForm(false); setIllForm({ requestingLibrary: '', bookTitle: '', borrowDate: '', returnDate: '' });
      await reloadTab('ills');
    } catch (err) { console.error('[LibrarianManagement] Failed to create ILL:', err); } finally { setSubmitting(false); }
  };

  const filteredCatalogue = catalogue.filter((b: any) =>
    (b.title || '').toLowerCase().includes(catSearch.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(catSearch.toLowerCase())
  );

  const renderSkeleton = (count = 5) => (
    <div className="space-y-3">{Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
  );

  const TabButton = ({ label, icon: Icon, value }: { label: string; icon: any; value: string }) => (
    <TabsTrigger value={value} className="flex items-center gap-2 px-4 py-2">
      <Icon className="w-4 h-4" /><span className="hidden sm:inline">{label}</span>
    </TabsTrigger>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Library Management</h1>
        <p className="text-muted-foreground">Comprehensive library system management</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-6">
          <TabButton label="Catalogue" icon={BookOpen} value="catalogue" />
          <TabButton label="Holds" icon={Bookmark} value="holds" />
          <TabButton label="Fines" icon={DollarSign} value="fines" />
          <TabButton label="Class Sets" icon={Layers} value="class-sets" />
          <TabButton label="Reading Logs" icon={ClipboardList} value="reading-logs" />
          <TabButton label="Programmes" icon={Calendar} value="programmes" />
          <TabButton label="Reviews" icon={Star} value="reviews" />
          <TabButton label="Interlibrary Loans" icon={Globe} value="ills" />
        </TabsList>

        {/* Catalogue */}
        <TabsContent value="catalogue">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search by title or author..." value={catSearch} onChange={e => setCatSearch(e.target.value)} />
            </div>
            <Button onClick={() => { setEditingCat(null); setCatForm({ title: '', author: '', isbn: '', category: '', copies: 1, shelf: '' }); setShowCatForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Book
            </Button>
          </div>
          {showCatForm && (
            <Card className="mb-6 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">{editingCat ? 'Edit Book' : 'New Book'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
                  <Input placeholder="Title" value={catForm.title} onChange={e => setCatForm({ ...catForm, title: e.target.value })} />
                  <Input placeholder="Author" value={catForm.author} onChange={e => setCatForm({ ...catForm, author: e.target.value })} />
                  <Input placeholder="ISBN" value={catForm.isbn} onChange={e => setCatForm({ ...catForm, isbn: e.target.value })} />
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={catForm.category} onChange={e => setCatForm({ ...catForm, category: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Input type="number" placeholder="Copies" value={catForm.copies} onChange={e => setCatForm({ ...catForm, copies: Number(e.target.value) })} />
                  <Input placeholder="Shelf location" value={catForm.shelf} onChange={e => setCatForm({ ...catForm, shelf: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCatSave} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
                  <Button variant="outline" onClick={() => { setShowCatForm(false); setEditingCat(null); }}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {loading ? renderSkeleton() : filteredCatalogue.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No books found</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {filteredCatalogue.map((book: any) => (
                <Card key={book.id} className="p-4 hover:border-primary/20 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary shrink-0" />
                        <h4 className="font-semibold truncate">{book.title}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <span>{book.author}</span>
                        <span className="text-xs">ISBN: {book.isbn}</span>
                        <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                        <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{book.shelf || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-medium">{book.availableCopies ?? book.copies}/{book.totalCopies ?? book.copies}</p>
                        <p className="text-xs text-muted-foreground">available</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => openCatEdit(book)}><Edit3 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleCatDelete(book.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Holds */}
        <TabsContent value="holds">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Hold Requests</h2>
            <Button onClick={() => setShowHoldForm(true)}><Plus className="w-4 h-4 mr-2" />Create Hold</Button>
          </div>
          {showHoldForm && (
            <Card className="mb-6 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">New Hold Request</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={holdForm.studentId} onChange={e => setHoldForm({ ...holdForm, studentId: e.target.value })}>
                    <option value="">Select student</option>
                    {students.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={holdForm.bookId} onChange={e => setHoldForm({ ...holdForm, bookId: e.target.value })}>
                    <option value="">Select book</option>
                    {catalogue.map((b: any) => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleHoldCreate} disabled={submitting}>Create</Button>
                  <Button variant="outline" onClick={() => setShowHoldForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {loading ? renderSkeleton() : holds.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No hold requests</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {holds.map((h: any) => (
                <Card key={h.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold">{h.bookTitle || h.book?.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{h.studentName || h.student?.name}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{h.requestDate || h.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={h.status === 'fulfilled' ? 'success' : h.status === 'pending' ? 'warning' : 'secondary'}>{h.status}</Badge>
                      {h.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => handleHoldFulfill(h.id)}>
                          <CheckCircle2 className="w-4 h-4 mr-1" />Fulfill
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Fines */}
        <TabsContent value="fines">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Library Fines</h2>
            <Button onClick={() => setShowFineForm(true)}><Plus className="w-4 h-4 mr-2" />Create Fine</Button>
          </div>
          {showFineForm && (
            <Card className="mb-6 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">New Fine</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={fineForm.studentId} onChange={e => setFineForm({ ...fineForm, studentId: e.target.value })}>
                    <option value="">Select student</option>
                    {students.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <Input type="number" placeholder="Amount" value={fineForm.amount} onChange={e => setFineForm({ ...fineForm, amount: Number(e.target.value) })} />
                  <Input placeholder="Reason" value={fineForm.reason} onChange={e => setFineForm({ ...fineForm, reason: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleFineCreate} disabled={submitting}>Create</Button>
                  <Button variant="outline" onClick={() => setShowFineForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {loading ? renderSkeleton() : fines.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No fines recorded</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {fines.map((f: any) => (
                <Card key={f.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-destructive" />
                        <h4 className="font-semibold">{f.studentName || f.student?.name}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>Amount: ${f.amount}</span>
                        <span>Reason: {f.reason}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{f.date || f.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={f.status === 'paid' ? 'success' : 'destructive'}>{f.status || 'unpaid'}</Badge>
                      {f.status !== 'paid' && (
                        <Button size="sm" variant="outline" onClick={() => handleFinePay(f.id)}>
                          <DollarSign className="w-4 h-4 mr-1" />Pay
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Class Sets */}
        <TabsContent value="class-sets">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Class Textbook Sets</h2>
            <Button onClick={() => setShowClassSetForm(true)}><Plus className="w-4 h-4 mr-2" />Create Set</Button>
          </div>
          {showClassSetForm && (
            <Card className="mb-6 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">New Class Set</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={classSetForm.bookId} onChange={e => setClassSetForm({ ...classSetForm, bookId: e.target.value })}>
                    <option value="">Select book</option>
                    {catalogue.map((b: any) => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                  <Input placeholder="Class name (e.g. 10A)" value={classSetForm.className} onChange={e => setClassSetForm({ ...classSetForm, className: e.target.value })} />
                  <Input type="number" placeholder="Total quantity" value={classSetForm.totalQuantity} onChange={e => setClassSetForm({ ...classSetForm, totalQuantity: Number(e.target.value) })} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleClassSetCreate} disabled={submitting}>Create</Button>
                  <Button variant="outline" onClick={() => setShowClassSetForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {loading ? renderSkeleton() : classSets.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Layers className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No class sets</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {classSets.map((cs: any) => (
                <Card key={cs.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">{cs.bookTitle || cs.book?.title}</h4>
                        <p className="text-sm text-muted-foreground">Class: {cs.className}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{cs.issuedCount || 0}/{cs.totalQuantity} issued</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reading Logs */}
        <TabsContent value="reading-logs">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={logStudentId} onChange={e => { setLogStudentId(e.target.value); setLogForm(prev => ({ ...prev, studentId: e.target.value })); }}>
                <option value="">Select student to view logs</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {logStudentId && (
              <Button onClick={() => setShowLogForm(true)}><Plus className="w-4 h-4 mr-2" />Add Entry</Button>
            )}
          </div>
          {showLogForm && (
            <Card className="mb-6 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">New Reading Log Entry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={logForm.bookId} onChange={e => setLogForm({ ...logForm, bookId: e.target.value })}>
                    <option value="">Select book</option>
                    {catalogue.map((b: any) => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                  <Input type="number" placeholder="Pages read" value={logForm.pagesRead} onChange={e => setLogForm({ ...logForm, pagesRead: Number(e.target.value) })} />
                  <Input placeholder="Notes" value={logForm.notes} onChange={e => setLogForm({ ...logForm, notes: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleLogCreate} disabled={submitting}>Save</Button>
                  <Button variant="outline" onClick={() => setShowLogForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {!logStudentId ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Select a student to view reading logs</p></CardContent></Card>
          ) : readingLogs.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No reading logs for this student</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {readingLogs.map((log: any) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold">{log.bookTitle || log.book?.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>Pages: {log.pagesRead}</span>
                        {log.notes && <span>Notes: {log.notes}</span>}
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{log.date || log.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Programmes */}
        <TabsContent value="programmes">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Reading Programmes</h2>
            <Button onClick={() => setShowProgForm(true)}><Plus className="w-4 h-4 mr-2" />Create Programme</Button>
          </div>
          {showProgForm && (
            <Card className="mb-6 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">New Reading Programme</h3>
                <div className="space-y-3">
                  <Input placeholder="Programme name" value={progForm.name} onChange={e => setProgForm({ ...progForm, name: e.target.value })} />
                  <Input placeholder="Duration (e.g. 6 weeks)" value={progForm.duration} onChange={e => setProgForm({ ...progForm, duration: e.target.value })} />
                  <Textarea placeholder="Description" value={progForm.description} onChange={e => setProgForm({ ...progForm, description: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleProgCreate} disabled={submitting}>Create</Button>
                  <Button variant="outline" onClick={() => setShowProgForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {loading ? renderSkeleton() : programmes.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No reading programmes</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {programmes.map((p: any) => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">{p.name}</h4>
                        <p className="text-sm text-muted-foreground">{p.duration}{p.description ? ` - ${p.description}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{p.participantCount || 0} participants</span>
                      <Badge variant={p.status === 'active' ? 'success' : p.status === 'completed' ? 'secondary' : 'warning'}>{p.status || 'draft'}</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={reviewBookId} onChange={e => { setReviewBookId(e.target.value); setReviewForm(prev => ({ ...prev, bookId: e.target.value })); }}>
                <option value="">Select a book to see reviews</option>
                {catalogue.map((b: any) => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
            {reviewBookId && (
              <Button onClick={() => setShowReviewForm(true)}><Plus className="w-4 h-4 mr-2" />Add Review</Button>
            )}
          </div>
          {showReviewForm && (
            <Card className="mb-6 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">New Review</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={reviewForm.studentId} onChange={e => setReviewForm({ ...reviewForm, studentId: e.target.value })}>
                    <option value="">Select student</option>
                    {students.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(r => (
                      <button key={r} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: r })} className={`p-1 rounded transition-colors ${r <= reviewForm.rating ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">{reviewForm.rating}/5</span>
                  </div>
                </div>
                <Textarea placeholder="Review comment" value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} />
                <div className="flex gap-2">
                  <Button onClick={handleReviewCreate} disabled={submitting}>Submit</Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {!reviewBookId ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Star className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Select a book to view reviews</p></CardContent></Card>
          ) : reviews.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Star className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No reviews for this book</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {reviews.map((r: any) => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (r.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{r.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">— {r.reviewerName || r.student?.name || 'Anonymous'}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Interlibrary Loans */}
        <TabsContent value="ills">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Interlibrary Loans</h2>
            <Button onClick={() => setShowIllForm(true)}><Plus className="w-4 h-4 mr-2" />New Loan</Button>
          </div>
          {showIllForm && (
            <Card className="mb-6 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">New Interlibrary Loan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Requesting library" value={illForm.requestingLibrary} onChange={e => setIllForm({ ...illForm, requestingLibrary: e.target.value })} />
                  <Input placeholder="Book title" value={illForm.bookTitle} onChange={e => setIllForm({ ...illForm, bookTitle: e.target.value })} />
                  <Input type="date" placeholder="Borrow date" value={illForm.borrowDate} onChange={e => setIllForm({ ...illForm, borrowDate: e.target.value })} />
                  <Input type="date" placeholder="Return date" value={illForm.returnDate} onChange={e => setIllForm({ ...illForm, returnDate: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleIllCreate} disabled={submitting}>Create</Button>
                  <Button variant="outline" onClick={() => setShowIllForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {loading ? renderSkeleton() : ills.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Globe className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No interlibrary loans</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {ills.map((ill: any) => (
                <Card key={ill.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold">{ill.bookTitle}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Library className="w-3 h-3" />{ill.requestingLibrary}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Borrow: {ill.borrowDate}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Return: {ill.returnDate}</span>
                      </div>
                    </div>
                    <Badge variant={ill.status === 'returned' ? 'success' : ill.status === 'active' ? 'info' : 'warning'}>{ill.status || 'pending'}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

