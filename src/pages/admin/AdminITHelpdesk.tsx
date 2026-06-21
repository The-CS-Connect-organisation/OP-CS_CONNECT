import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Headphones, Plus, Search, Calendar, User, AlertCircle, Check, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface Ticket {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  category: 'hardware' | 'software' | 'network' | 'account' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  date: string;
}

export default function AdminITHelpdesk() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getHelpdeskTickets();
        if (Array.isArray(data)) setTickets(data);
      } catch (err) { console.error('[AdminITHelpdesk] Failed to load:', err); }
    })();
  }, []);

  const handleStart = async (id: string) => {
    const prev = tickets;
    try {
      await api.updateHelpdeskTicket(id, { status: 'in-progress' });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'in-progress' as const } : t));
    } catch (err) {
      console.error('[AdminITHelpdesk] Failed to update ticket:', err);
      setTickets(prev);
    }
  };

  const filteredTickets = tickets.filter(t => filter === 'all' || t.status === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-orange-100 text-orange-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">IT Helpdesk</h1>
          <p className="text-muted-foreground">Technical support tickets</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />New Ticket</Button>
      </div>

      <div className="flex gap-2">
        {['all', 'open', 'in-progress', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-accent hover:bg-accent/80'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTickets.map(ticket => (
          <Card key={ticket.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-orange-500" />
                </div>
                <div>
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
              {ticket.status === 'open' && (
                <Button size="sm" onClick={() => handleStart(ticket.id)}><Check className="w-4 h-4 mr-1" />Start</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
