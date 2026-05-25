import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { PieChart, TrendingUp, BarChart3, Download, Filter } from 'lucide-react';

export default function TeacherPerformanceReports() {
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedTerm, setSelectedTerm] = useState('term1');
  const [report, setReport] = useState({
    classAverage: 0,
    highestScore: 0,
    lowestScore: 0,
    passRate: 0,
    subjectComparison: [] as { subject: string; term1: number; term2: number }[],
    performanceTrend: [] as { month: string; avg: number }[],
  });

  useEffect(() => {
    loadReport();
  }, [selectedClass, selectedTerm]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await api.getPerformanceReport(selectedClass, selectedTerm);
      if (data) setReport(data);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Reports</h1>
          <p className="text-muted-foreground">Detailed performance analysis</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
            {['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
            <option value="term1">Term 1</option>
            <option value="term2">Term 2</option>
            <option value="term3">Term 3</option>
          </select>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{report.classAverage}%</p>
                  <p className="text-sm text-muted-foreground">Class Average</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{report.highestScore}%</p>
                  <p className="text-sm text-muted-foreground">Highest Score</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <PieChart className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{report.lowestScore}%</p>
                  <p className="text-sm text-muted-foreground">Lowest Score</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Filter className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{report.passRate}%</p>
                  <p className="text-sm text-muted-foreground">Pass Rate</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Subject Comparison</h3>
              <div className="space-y-3">
                {report.subjectComparison.map(subject => (
                  <div key={subject.subject} className="p-3 bg-accent rounded-lg">
                    <p className="font-medium mb-2">{subject.subject}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Term 1</span>
                          <span>{subject.term1}%</span>
                        </div>
                        <div className="w-full h-2 bg-background rounded-full">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${subject.term1}%` }} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Term 2</span>
                          <span>{subject.term2}%</span>
                        </div>
                        <div className="w-full h-2 bg-background rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${subject.term2}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Performance Trend</h3>
              <div className="space-y-3">
                {report.performanceTrend.map((month, idx) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-sm">{month.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-accent rounded-full">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${month.avg}%` }} />
                      </div>
                      <span className="text-sm font-medium">{month.avg}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
