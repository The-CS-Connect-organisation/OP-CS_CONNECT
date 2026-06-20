import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Plus, MapPin, Clock, Users } from 'lucide-react';
import { api } from '../../lib/api';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: string;
}

export default function ManagerEvents() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.getEvents();
        setEvents(data);
      } catch (err) {
        console.error('[ManagerEvents] Failed to load:', err);
      }
    }
    loadEvents();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">School events</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />New Event</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 gap-4">
        {events.map(event => (
          <Card key={event.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <Badge variant="secondary">{event.type}</Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" />{new Date(event.date).toLocaleDateString()}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" />{event.time}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" />{event.location}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4" />{event.attendees} attendees</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

