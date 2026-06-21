import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { useAuthStore, useDataStore } from '@/lib/store'
import { BookOpen, Clock, User, ChevronRight } from 'lucide-react'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

const subjectIcons: Record<string, string> = { 'Mathematics': '📐', 'Physics': '⚡', 'Chemistry': '🧪', 'English': '📖', 'Computer Science': '💻', 'Biology': '🧬' }
const subjectColors: Record<string, string> = { 'Mathematics': '#8b5cf6', 'Physics': '#3b82f6', 'Chemistry': '#10b981', 'English': '#f59e0b', 'Computer Science': '#6366f1', 'Biology': '#ec4899' }

export default function CoursesPage() {
  const { user } = useAuthStore()
  const { subjects, grades, isLoading } = useDataStore()

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">Your enrolled subjects and progress</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : subjects.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No courses found. Contact your administrator.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.filter((s: any) => s.classes?.includes(user?.class || '')).map((subject: any) => {
              const grade = grades.find((g: any) => g.subject === subject.name || g.subject === subject.code)
              const progress = grade?.overall || 0
              return (
                <motion.div key={subject.id} variants={itemVariants}>
                  <Card glow className="hover:border-primary/30 transition-colors cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: (subjectColors[subject.name] || '#6366f1') + '20' }}>
                          {subjectIcons[subject.name] || '📚'}
                        </div>
                        <Badge variant={progress >= 80 ? 'success' : progress >= 60 ? 'warning' : 'destructive'}>
                          {progress}%
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-3">{subject.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{subject.code}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{subject.teacher}</span>
                      </div>
                      <Progress value={progress} size="md" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <ChevronRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
  )
}