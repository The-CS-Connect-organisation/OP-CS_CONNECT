import { useState, useEffect, useCallback } from 'react';
import { Megaphone, Plus, X, Globe, EyeOff, Trash2, FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

interface Circular {
  id: string;
  title: string;
  content: string;
  type: string;
  audience: string;
  priority: string;
  isPublished: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  createdBy: string;
  referenceNumber?: string;
  schoolId?: string;
}

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700 border border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border border-orange-200',
  NORMAL: 'bg-blue-100 text-blue-700 border border-blue-200',
  LOW: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const typeColors: Record<string, string> = {
  CIRCULAR: 'bg-indigo-100 text-indigo-700',
  NOTICE: 'bg-yellow-100 text-yellow-700',
  EVENT: 'bg-green-100 text-green-700',
  URGENT: 'bg-red-100 text-red-700',
  GENERAL: 'bg-gray-100 text-gray-700',
};

const audienceLabels: Record<string, string> = {
  ALL: 'Everyone',
  TEACHERS: 'Teachers',
  STUDENTS: 'Students',
  PARENTS: 'Parents',
  SPECIFIC_CLASS: 'Specific Class',
};

const EMPTY_FORM = {
  title: '',
  content: '',
  type: 'CIRCULAR',
  audience: 'ALL',
  priority: 'NORMAL',
  isPublished: false,
  expiresAt: '',
  referenceNumber: '',
  schoolId: '',
};

export default function AdminCirculars() {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [tab, setTab] = useState<'published' | 'draft'>('published');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    if (type === 'success') import('@/lib/sound').then(m => m.playSuccessSound());
    setTimeout(() => setMessage(null), 4000);
  };

  const loadCirculars = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (audienceFilter) params.set('audience', audienceFilter);
      params.set('isPublished', String(tab === 'published'));
      const res = await fetch(`/api/v1/announcements?${params}`, { headers: getHeaders() });
      if (res.ok) {
        const d = await res.json();
        setCirculars(Array.isArray(d) ? d : d.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [typeFilter, audienceFilter, tab]);

  useEffect(() => {
    loadCirculars();
  }, [loadCirculars]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const sid = user.schoolId || '';
    if (!form.schoolId && sid) setForm((f) => ({ ...f, schoolId: sid }));
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      showMsg('Title and content are required', 'error');
      return;
    }
    setActionLoading('create');
    try {
      const body = {
        ...form,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      };
      const res = await fetch('/api/v1/announcements', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showMsg('Circular created successfully', 'success');
        setShowForm(false);
        setForm({ ...EMPTY_FORM, schoolId: form.schoolId || '' });
        loadCirculars();
      } else {
        const d = await res.json();
        showMsg(d.message || 'Failed to create circular', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const togglePublish = async (a: Circular) => {
    setActionLoading(a.id);
    try {
      const endpoint = a.isPublished ? 'unpublish' : 'publish';
      const res = await fetch(`/api/v1/announcements/${a.id}/${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      if (res.ok) {
        showMsg(a.isPublished ? 'Circular unpublished' : 'Circular published', 'success');
        loadCirculars();
      } else {
        showMsg('Action failed', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this circular?')) return;
    setActionLoading(id + '_del');
    try {
      const res = await fetch(`/api/v1/announcements/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        showMsg('Circular deleted', 'success');
        loadCirculars();
      } else {
        showMsg('Failed to delete', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const allTypes = ['CIRCULAR', 'NOTICE', 'EVENT', 'URGENT', 'GENERAL'];
  const allAudiences = ['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'SPECIFIC_CLASS'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Circulars & Announcements</h1>
            <p className="text-sm text-muted-foreground">School-wide circulars, notices, and communications</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Circular
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* New Circular Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Circular</h2>
              <button onClick={() => setShowForm(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Circular title..."
                  className="w-full border rounded-md px-3 py-2 text-sm mt-1 bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reference Number</label>
                <input
                  type="text"
                  value={form.referenceNumber}
                  onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                  placeholder="e.g. CIRC/2026/001"
                  className="w-full border rounded-md px-3 py-2 text-sm mt-1 bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content *</label>
                <textarea
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write the circular content here..."
                  className="w-full border rounded-md px-3 py-2 text-sm mt-1 bg-background resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm mt-1 bg-background"
                  >
                    <option value="CIRCULAR">Circular</option>
                    <option value="NOTICE">Notice</option>
                    <option value="EVENT">Event</option>
                    <option value="URGENT">Urgent</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Audience</label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm mt-1 bg-background"
                  >
                    <option value="ALL">Everyone</option>
                    <option value="TEACHERS">Teachers Only</option>
                    <option value="STUDENTS">Students Only</option>
                    <option value="PARENTS">Parents Only</option>
                    <option value="SPECIFIC_CLASS">Specific Class</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm mt-1 bg-background"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Expires At (optional)</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm mt-1 bg-background"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isPublished" className="text-sm">Publish immediately</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCreate}
                disabled={actionLoading === 'create'}
              >
                {actionLoading === 'create' ? 'Creating...' : 'Create Circular'}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setTab('published')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'published' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setTab('draft')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'draft' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Drafts
          </button>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-background"
        >
          <option value="">All Types</option>
          {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={audienceFilter}
          onChange={(e) => setAudienceFilter(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-background"
        >
          <option value="">All Audiences</option>
          {allAudiences.map(a => <option key={a} value={a}>{audienceLabels[a]}</option>)}
        </select>
      </div>

      {/* Circulars List */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : circulars.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-card border rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          No {tab === 'published' ? 'published' : 'draft'} circulars found. Create your first one!
        </div>
      ) : (
        <div className="space-y-3">
          {circulars.map((a) => (
            <div
              key={a.id}
              className={`bg-card border rounded-lg p-5 space-y-3 ${
                a.priority === 'URGENT' ? 'border-red-300' : a.priority === 'HIGH' ? 'border-orange-300' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[a.priority]}`}>
                      {a.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[a.type] ?? 'bg-gray-100 text-gray-700'}`}>
                      {a.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      For: {audienceLabels[a.audience] ?? a.audience}
                    </span>
                    {a.referenceNumber && (
                      <span className="text-xs font-mono text-muted-foreground">#{a.referenceNumber}</span>
                    )}
                    {a.expiresAt && (
                      <span className="text-xs text-muted-foreground">
                        Expires: {new Date(a.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base">{a.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{a.content}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(a)}
                    disabled={actionLoading === a.id}
                    title={a.isPublished ? 'Unpublish' : 'Publish'}
                    className={`p-1.5 rounded-md text-sm transition-colors ${
                      a.isPublished ? 'text-green-600 hover:bg-green-50' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {a.isPublished ? <Globe className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={actionLoading === a.id + '_del'}
                    title="Delete"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2">
                <span>Created {new Date(a.createdAt).toLocaleDateString()}</span>
                {a.publishedAt && <span>· Published {new Date(a.publishedAt).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
