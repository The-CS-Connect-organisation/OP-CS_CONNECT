import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { useAuthStore } from '../../lib/store';
import {
  BookOpen, CheckCircle2, Clock, ArrowRight, Send,
  FileQuestion, ClipboardList, ListChecks, Star
} from 'lucide-react';

export default function Exercises() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await api.getExercises();
      const list = Array.isArray(data) ? data : [];
      setExercises(list);

      const allSubmissions: any[] = [];
      for (const ex of list) {
        const sub = ex.submissions || [];
        const userSub = Array.isArray(sub) ? sub.find((s: any) => s.studentId === user?.id) : null;
        if (userSub) allSubmissions.push({ ...ex, submission: userSub });
      }
      setSubmissions(allSubmissions);
    } catch {
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExercise = (ex: any) => {
    setSelectedExercise(ex);
    setAnswers(ex.questions ? ex.questions.map(() => '') : []);
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!selectedExercise || !user) return;
    setSubmitting(true);
    try {
      await api.submitExercise(selectedExercise.id, {
        studentId: user.id,
        answers: selectedExercise.questions.map((q: any, i: number) => ({
          questionId: q.id || i,
          answer: answers[i] || '',
        })),
      });
      setSubmitted(true);
      await loadExercises();
    } catch { } finally {
      setSubmitting(false);
    }
  };

  const renderSkeleton = (count = 4) => (
    <div className="space-y-4">{Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exercises</h1>
        <p className="text-muted-foreground">Practice and test your knowledge</p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />Available
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />My Submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {selectedExercise ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedExercise.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedExercise.subject} — {selectedExercise.class}
                  </p>
                </div>
                <Button variant="outline" onClick={() => { setSelectedExercise(null); setSubmitted(false); }}>
                  Back to list
                </Button>
              </div>

              {submitted ? (
                <Card className="border-emerald-500/30">
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Exercise Submitted!</h3>
                    <p className="text-muted-foreground">Your answers have been recorded.</p>
                    <Button className="mt-6" onClick={() => { setSelectedExercise(null); setSubmitted(false); }}>
                      Back to exercises
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {(selectedExercise.questions || []).map((q: any, qi: number) => (
                    <Card key={qi} className="p-5">
                      <div className="flex gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                          {qi + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <p className="font-medium">{q.question || q.text}</p>
                          {q.options && Array.isArray(q.options) ? (
                            <div className="space-y-2">
                              {q.options.map((opt: string, oi: number) => (
                                <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[qi] === opt ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/30'}`}>
                                  <input type="radio" name={`q-${qi}`} value={opt} checked={answers[qi] === opt} onChange={() => { const a = [...answers]; a[qi] = opt; setAnswers(a); }} className="text-primary" />
                                  <span className="text-sm">{opt}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <Textarea
                              placeholder="Type your answer here..."
                              value={answers[qi] || ''}
                              onChange={e => { const a = [...answers]; a[qi] = e.target.value; setAnswers(a); }}
                              rows={3}
                            />
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}

                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSubmit} disabled={submitting || answers.some(a => !a)} size="lg">
                      {submitting ? 'Submitting...' : 'Submit Exercise'}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {loading ? renderSkeleton() : exercises.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">
                  <FileQuestion className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No exercises available</p>
                </CardContent></Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exercises.map((ex: any) => {
                    const isSubmitted = submissions.some(s => s.id === ex.id);
                    return (
                      <Card key={ex.id} className={`p-5 hover:border-primary/20 transition-colors ${isSubmitted ? 'border-emerald-500/20' : ''}`}>
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                            <BookOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold truncate">{ex.title}</h3>
                              {isSubmitted && <Badge variant="success">Done</Badge>}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                              <span>{ex.subject}</span>
                              <span>Class: {ex.class}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" />{(ex.questions || []).length} questions</span>
                              {ex.maxScore && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />Max: {ex.maxScore}</span>}
                            </div>
                            <Button size="sm" className="mt-3" onClick={() => handleStartExercise(ex)}>
                              {isSubmitted ? 'View Again' : 'Start'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="submissions">
          {loading ? renderSkeleton() : submissions.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>You haven't submitted any exercises yet</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-4">
              {submissions.map((ex: any) => {
                const sub = ex.submission || {};
                return (
                  <Card key={ex.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold">{ex.title}</h3>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{ex.subject}</span>
                          <span>Class: {ex.class}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant={sub.status === 'graded' ? 'success' : 'info'}>{sub.status || 'submitted'}</Badge>
                          {sub.score !== undefined && (
                            <span className="text-sm font-medium text-emerald-500">
                              Score: {sub.score}/{ex.maxScore || 'N/A'}
                            </span>
                          )}
                        </div>
                        {sub.feedback && (
                          <p className="mt-2 text-sm bg-accent rounded-lg p-3 text-foreground">{sub.feedback}</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {sub.submittedAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{sub.submittedAt}</span>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
