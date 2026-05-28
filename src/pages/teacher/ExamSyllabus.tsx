import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Skeleton } from '@/components/ui/Skeleton'
import { FileText, Plus, Trash2, Calendar, Clock, MapPin, BookOpen, Link } from 'lucide-react'

interface ExamSyllabusItem {
  id: string
  title: string
  subject: string
  class: string
  type: string
  date: string
  duration: number
  totalMarks: number
  syllabus: string
  resourceUrl?: string
  status?: string
  teacherId?: string
}

const DEFAULT_FORM = {
  title: '',
  subject: 'Mathematics',
  class: '10-A',
  type: 'midterm',
  date: '',
  duration: 90,
  totalMarks: 100,
  syllabus: '',
  resourceUrl: '',
}

export default function TeacherExamSyllabus() {
  const { user } = useAuthStore()
  const [syllabi, setSyllabi] = useState<ExamSyllabusItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)

  useEffect(() => {
    loadSyllabi()
  }, [user?.id])

  const loadSyllabi = async () => {
    setLoading(true)
    try {
      const data = await api.getExams()
      const allExams = Array.isArray(data) ? data as ExamSyllabusItem[] : []
      setSyllabi(allExams.filter((item) => item.teacherId === user?.id))
    } catch {
      setSyllabi([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.title.trim() || !form.syllabus.trim()) return
    try {
      const newItem = await api.createExam({
        ...form,
        status: 'upcoming',
        teacherId: user?.id,
        syllabus: form.syllabus,
      })
      setSyllabi((prev) => [newItem, ...prev])
      setForm(DEFAULT_FORM)
      setShowForm(false)
    } catch {
      // ignore error for now
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteExam(id)
      setSyllabi((prev) => prev.filter((item) => item.id !== id))
    } catch {
      // ignore
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exam Syllabus</h1>
          <p className="text-muted-foreground">Upload exam syllabus details for your class and keep students/parents informed.</p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Close Form' : 'Add Syllabus'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold">New Exam Syllabus</h2>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Exam title" />
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" />
              <Input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} placeholder="Class" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-border rounded-xl px-3 py-2 bg-background text-sm">
                <option value="test">Test</option>
                <option value="quiz">Quiz</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} placeholder="Duration (mins)" />
              <Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} placeholder="Total marks" />
            </div>
            <Textarea value={form.syllabus} onChange={(e) => setForm({ ...form, syllabus: e.target.value })} placeholder="Enter the syllabus outline or topics for this exam" rows={4} />
            <Input value={form.resourceUrl} onChange={(e) => setForm({ ...form, resourceUrl: e.target.value })} placeholder="Optional resource link or notes URL" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Publish Syllabus</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((index) => <Skeleton key={index} className="h-40" />)}
        </div>
      ) : syllabi.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No syllabus entries found yet. Add one to share exam topics with students and parents.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {syllabi.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge className="bg-orange-100 text-orange-700">{item.class}</Badge>
                    <Badge className="bg-sky-100 text-sky-700">{item.subject}</Badge>
                    <Badge className="bg-emerald-100 text-emerald-700">{item.type}</Badge>
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.syllabus}</p>
                  {item.resourceUrl && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Link className="w-4 h-4" />
                      <a className="underline" href={item.resourceUrl} target="_blank" rel="noreferrer">Resource link</a>
                    </div>
                  )}
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{item.date ? new Date(item.date).toLocaleDateString() : 'Date not set'}</div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{item.duration} mins</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{item.totalMarks} marks</div>
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4" />Status: {item.status || 'upcoming'}</div>
                  <Button variant="outline" className="w-full md:w-auto" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
