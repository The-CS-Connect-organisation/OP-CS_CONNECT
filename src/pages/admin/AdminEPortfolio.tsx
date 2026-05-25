import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FolderOpen, Plus, Search, Calendar, User, FileText, ExternalLink } from 'lucide-react';

interface Portfolio {
  id: string;
  studentName: string;
  class: string;
  projects: number;
  achievements: number;
  lastUpdated: string;
  status: 'active' | 'archived';
}

const mockPortfolios: Portfolio[] = [
  { id: '1', studentName: 'Alice Johnson', class: '10-A', projects: 12, achievements: 5, lastUpdated: '2026-05-15', status: 'active' },
  { id: '2', studentName: 'Bob Williams', class: '11-B', projects: 8, achievements: 3, lastUpdated: '2026-05-14', status: 'active' },
  { id: '3', studentName: 'Carol Davis', class: '9-A', projects: 15, achievements: 7, lastUpdated: '2026-05-13', status: 'archived' },
];

export default function AdminEPortfolio() {
  const [portfolios] = useState<Portfolio[]>(mockPortfolios);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPortfolios = portfolios.filter(p => p.studentName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">E-Portfolio</h1>
          <p className="text-muted-foreground">Digital portfolio management</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Create Portfolio</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPortfolios.map(portfolio => (
          <Card key={portfolio.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="font-semibold">{portfolio.studentName}</h3>
                  <p className="text-sm text-muted-foreground">Class: {portfolio.class}</p>
                </div>
              </div>
              <Badge variant="secondary">{portfolio.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2 bg-accent rounded-lg text-center">
                <p className="text-xl font-bold text-orange-500">{portfolio.projects}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
              <div className="p-2 bg-accent rounded-lg text-center">
                <p className="text-xl font-bold text-orange-500">{portfolio.achievements}</p>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(portfolio.lastUpdated).toLocaleDateString()}</span>
              <Button size="sm" variant="outline"><ExternalLink className="w-4 h-4 mr-1" />View</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
