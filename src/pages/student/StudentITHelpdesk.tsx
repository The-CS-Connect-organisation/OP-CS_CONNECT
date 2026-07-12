import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { NavSheet } from '../../components/ui/NavSheet';
import { Headphones, Plus, Calendar, User } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

export default function StudentITHelpdesk() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'hardware' | 'software' | 'network' | 'account' | 'other'>('software');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    try {
      const data = await api.getHelpdeskTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await api.createHelpdeskTicket({
        title,
        description,
        category,
        priority,
        submittedBy: user?.name || 'Unknown',
        date: new Date().toISOString(),
        status: 'open',
      });
      setTitle('');
      setDescription('');
      setCategory('software');
      setPriority('medium');
      setShowForm(false);
      refresh();
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const filteredTickets = tickets.filter(t => filter === 'all' || t.status === filter);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-orange-100 text-orange-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="p-6"><Card className="p-8 animate-pulse h-48" /></div>;

  const formContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900">Issue Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Brief description of the issue"
          className="w-full px-3 py-2 rounded-lg border bg-background text-gray-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Detailed description of the problem..."
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
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
          <option value="network">Network</option>
          <option value="account">Account</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900">Priority</label>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as any)}
          className="w-full px-3 py-2 rounded-lg border bg-background text-gray-900"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <Button onClick={handleSubmit} disabled={submitting || !title.trim() || !description.trim()}>
        <Plus className="w-4 h-4 mr-2" />
        {submitting ? 'Submitting...' : 'Submit Ticket'}
      </Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">IT Helpdesk</h1>
          <p className="text-gray-900">Get technical support</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <NavSheet isOpen={showForm} onClose={() => setShowForm(false)} title="New Ticket">
        {formContent}
      </NavSheet>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {['all', 'open', 'in-progress', 'resolved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-accent hover:bg-accent/80'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <Card className="p-8 text-center">
            <Headphones className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tickets</h3>
            <p className="text-muted-foreground">Click "New Ticket" to submit a support request.</p>
          </Card>
        ) : (
          filteredTickets.map(ticket => (
            <Card key={ticket.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{ticket.title}</h4>
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                    <span className="text-xs text-muted-foreground">{ticket.category}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><User className="w-4 h-4" />{ticket.submittedBy}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(ticket.date).toLocaleDateString()}</span>
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
