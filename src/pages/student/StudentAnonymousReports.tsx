import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { AlertTriangle, Send, Calendar, User, Plus } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

export default function StudentAnonymousReports() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'bullying' | 'safety' | 'maintenance' | 'other'>('other');
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    try {
      const data = await api.getAnonymousReports();
      setReports(Array.isArray(data) ? data.filter((r: any) => r.reportedBy === user?.id) : []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await api.createAnonymousReport({
        title,
        description,
        category,
        anonymous,
        reportedBy: user?.id || 'Unknown',
        date: new Date().toISOString(),
        status: 'pending',
      });
      setTitle('');
      setDescription('');
      setCategory('other');
      setShowForm(false);
      refresh();
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'bullying': return 'bg-red-100 text-red-700';
      case 'safety': return 'bg-orange-100 text-orange-700';
      case 'maintenance': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="p-6"><Card className="p-8 animate-pulse h-48" /></div>;

  const formContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Brief title of the issue"
          className="w-full px-3 py-2 rounded-lg border bg-background text-gray-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the issue in detail..."
          rows={4}
          className="w-full px-3 py-2 rounded-lg border bg-background text-gray-900 resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900">Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as any)}
          className="w-full px-3 py-2 rounded-lg border bg-background text-gray-900"
        >
          <option value="bullying">Bullying / Harassment</option>
          <option value="safety">Safety Concern</option>
          <option value="maintenance">Maintenance Issue</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={anonymous}
          onChange={e => setAnonymous(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="anonymous" className="text-sm text-gray-900">Keep my identity anonymous</label>
      </div>
      <Button onClick={handleSubmit} disabled={submitting || !title.trim() || !description.trim()}>
        <Send className="w-4 h-4 mr-2" />
        {submitting ? 'Submitting...' : 'Submit Report'}
      </Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Anonymous Reports</h1>
          <p className="text-gray-900">Report issues confidentially</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </Button>
      </div>

      <BottomSheet isOpen={showForm} onClose={() => setShowForm(false)} title="New Report">
        {formContent}
      </BottomSheet>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
            <p className="text-muted-foreground">Click "New Report" to submit an anonymous report.</p>
          </Card>
        ) : (
          reports.map(report => (
            <Card key={report.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-lg">{report.title}</h3>
                    <Badge className={getCategoryColor(report.category)}>{report.category}</Badge>
                    {report.anonymous && <Badge variant="outline">Anonymous</Badge>}
                  </div>
                  <p className="text-muted-foreground mb-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-4 h-4" />{report.anonymous ? 'Anonymous' : report.reportedBy}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(report.date).toLocaleDateString()}</span>
                    <Badge className={report.status === 'pending' ? 'bg-orange-100 text-orange-700' : report.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>{report.status}</Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
