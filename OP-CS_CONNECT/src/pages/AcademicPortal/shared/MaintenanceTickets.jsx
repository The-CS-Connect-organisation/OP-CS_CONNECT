import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar, 
  Search, 
  Plus, 
  Filter,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-amber-100 text-amber-800', icon: Clock },
    in_progress: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon size={12} />
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    low: { color: 'bg-green-100 text-green-800' },
    medium: { color: 'bg-amber-100 text-amber-800' },
    high: { color: 'bg-red-100 text-red-800' },
    urgent: { color: 'bg-red-200 text-red-900' }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[priority]?.color || priorityConfig.medium.color}`}>
      {priority.toUpperCase()}
    </span>
  );
};

export const MaintenanceTickets = ({ user }) => {
  const { data: tickets, create: createTicket, update: updateTicket } = useStore(KEYS.MAINTENANCE_TICKETS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [showCreate, setShowCreate] = useState(false);

  const filteredTickets = tickets
    .filter(ticket => {
      const matchesStatus = filter === 'all' || ticket.status === filter;
      const matchesSearch = search === '' || 
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(search.toLowerCase()) ||
        ticket.location.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const ticket = {
      id: Date.now().toString(),
      title: formData.get('title'),
      description: formData.get('description'),
      location: formData.get('location'),
      priority: formData.get('priority'),
      category: formData.get('category'),
      status: 'pending',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      assignedTo: null,
      updatedAt: new Date().toISOString()
    };

    await createTicket(ticket);
    setShowCreate(false);
    e.target.reset();
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    await updateTicket(ticketId, { status: newStatus, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Wrench size={28} className="text-gray-600" />
            Maintenance & Facility Tickets
          </h1>
          <p className="text-sm text-gray-600 mt-1">Report and track facility issues</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Report Issue
          </button>
        </div>
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="nova-card p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'pending', 'in_progress', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </motion.div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="nova-card p-8 text-center">
            <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No tickets found</h3>
            <p className="text-gray-500">Create a new ticket to get started</p>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const creator = users.find(u => u.id === ticket.createdBy);
            const assignee = ticket.assignedTo ? users.find(u => u.id === ticket.assignedTo) : null;

            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="nova-card p-6"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                          <PriorityBadge priority={ticket.priority} />
                        </div>
                        
                        <p className="text-gray-600 mb-3">{ticket.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="badge badge-default">{ticket.category}</span>
                          <span className="badge badge-indigo">{ticket.location}</span>
                          <span className="text-sm text-gray-500">Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User size={16} />
                            <span>{creator?.name || 'Unknown'}</span>
                          </div>
                          {assignee && (
                            <div className="flex items-center gap-2">
                              <User size={16} />
                              <span>Assigned to: {assignee.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <StatusBadge status={ticket.status} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {user.role === 'admin' && (
                      <>
                        <select
                          value={ticket.status}
                          onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                          className="input-field"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        
                        <div className="flex gap-2">
                          <button className="btn-secondary flex-1">
                            <MessageSquare size={16} />
                            Comments
                          </button>
                          <button className="btn-ghost">
                            <FileText size={16} />
                          </button>
                        </div>
                      </>
                    )}
                    
                    {user.role !== 'admin' && (
                      <div className="text-sm text-gray-500">
                        Status: {ticket.status.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreate(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="nova-card p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Report New Issue</h2>
            
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  name="title"
                  required
                  className="input-field"
                  placeholder="Describe the issue..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Provide details about the issue..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    name="location"
                    required
                    className="input-field"
                    placeholder="Building/Room"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" required className="input-field">
                    <option value="">Select category</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Furniture">Furniture</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Security">Security</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select name="priority" required className="input-field">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Submit Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};