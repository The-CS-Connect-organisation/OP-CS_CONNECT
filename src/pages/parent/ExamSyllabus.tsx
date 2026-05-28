import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { FileText, Calendar, Clock, MapPin, Link } from 'lucide-react'

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
}

export default function ParentExamSyllabus() {
  const { user } = useAuthStore()
  const [syllabi, setSyllabi] = useState<ExamSyllabusItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSyllabi()
  }, [user?.id])

  const loadSyllabi = async () => {
    setLoading(true)
    try {
      const data = await api.getExams()
      setSyllabi(Array.isArray(data) ? data as ExamSyllabusItem[] : [])
    } catch {
      setSyllabi([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exam Syllabus</h1>
        <p className="text-muted-foreground">Review the syllabus details your child’s teacher has shared for upcoming exams.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((index) => <Skeleton key={index} className="h-40" />)}
        </div>
      ) : syllabi.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No syllabus entries are available for your child’s class yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {syllabi.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2 items-center mb-3">
                    <Badge className="bg-orange-100 text-orange-700">{item.class}</Badge>
                    <Badge className="bg-sky-100 text-sky-700">{item.subject}</Badge>
                    <Badge className="bg-emerald-100 text-emerald-700">{item.type}</Badge>
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{item.syllabus}</p>
                  {item.resourceUrl && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                      <Link className="w-4 h-4" />
                      <a className="underline" href={item.resourceUrl} target="_blank" rel="noreferrer">View resource</a>
                    </div>
                  )}
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{item.date ? new Date(item.date).toLocaleDateString() : 'Date not set'}</div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{item.duration} mins</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{item.totalMarks} marks</div>
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4" />{item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Upcoming'}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
