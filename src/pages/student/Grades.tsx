import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { DataTable } from '@/components/ui/DataTable'
import { useAuthStore, useDataStore } from '@/lib/store'
import { cn, normalizeAcademicPercentage, formatPercentage } from '@/lib/utils'
import { BarChart3, TrendingUp, TrendingDown, Zap, Award, Target } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function GradesPage() {
  const { user } = useAuthStore()
  const { grades, isLoading } = useDataStore()

  const currentGPA = grades.length > 0 ? grades.reduce((a: number, g: any) => a + (g.overall || 0), 0) / grades.length : 0
  const currentPercentage = normalizeAcademicPercentage(currentGPA)
  const highestSubject = grades.length > 0 ? grades.reduce((best: any, g: any) => (g.overall > (best.overall || 0) ? g : best), grades[0]) : null
  const lowestSubject = grades.length > 0 ? grades.reduce((worst: any, g: any) => (g.overall < (worst.overall || 999) ? g : worst), grades[0]) : null

  const radarData = grades.map((g: any) => ({ subject: g.subject?.slice(0, 4) || '??', score: g.overall || 0, fullMark: 100 }))
  const barData = grades.map((g: any) => ({ subject: g.subject?.slice(0, 4) || '??', midTerm: g.midTerm || 0, final: g.final || 0, overall: g.overall || 0 }))

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> Grades</h1>
          <p className="text-muted-foreground text-sm mt-1">Your academic performance overview</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : grades.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No grades available</CardContent></Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div variants={itemVariants}>
                <Card glow>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center"><Award className="w-6 h-6 text-orange-500" /></div>
                    <div><p className="text-sm text-muted-foreground">Current Percentage</p><p className="text-2xl font-bold">{formatPercentage(currentPercentage)}</p></div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card glow>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-emerald-500" /></div>
                    <div><p className="text-sm text-muted-foreground">Best Subject</p><p className="text-lg font-bold">{highestSubject?.subject} ({highestSubject?.overall})</p></div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card glow>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center"><Target className="w-6 h-6 text-amber-500" /></div>
                    <div><p className="text-sm text-muted-foreground">Needs Work</p><p className="text-lg font-bold">{lowestSubject?.subject} ({lowestSubject?.overall})</p></div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <Card glow>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">Subject Radar</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                          <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card glow>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">Mid Term vs Final</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                          <Bar dataKey="midTerm" fill="#8b5cf6" radius={[4,4,0,0]} name="Mid Term" />
                          <Bar dataKey="final" fill="#3b82f6" radius={[4,4,0,0]} name="Final" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Detailed Table */}
            <motion.div variants={itemVariants}>
              <Card glow>
                <CardHeader className="pb-2"><CardTitle className="text-lg">Detailed Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <DataTable
                    columns={[
                      { key: 'subject', header: 'Subject', className: 'hidden md:table-cell' },
                      { key: 'midTerm', header: 'Mid Term', className: 'hidden md:table-cell' },
                      { key: 'final', header: 'Final', className: 'hidden md:table-cell' },
                      { key: 'overall', header: 'Overall' },
                      { key: 'grade', header: 'Grade' },
                      { key: 'progress', header: 'Progress', className: 'hidden md:table-cell' },
                      { key: 'trend', header: 'Trend' },
                    ]}
                    data={grades}
                    keyExtractor={(g: any) => g.subject}
                    searchable
                    searchKeys={['subject']}
                    pageSize={15}
                    striped
                    renderRow={(grade: any) => (
                      <>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: grade.color || '#6366f1' }} />
                            <span className="text-sm font-medium">{grade.subject}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-center hidden md:table-cell">{grade.midTerm}</td>
                        <td className="py-3 px-2 text-sm text-center hidden md:table-cell">{grade.final}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={cn("text-sm font-semibold", grade.overall >= 90 ? "text-emerald-500" : grade.overall >= 80 ? "text-orange-500" : "text-amber-500")}>{grade.overall}</span>
                        </td>
                        <td className="py-3 px-2 text-center"><Badge variant={grade.grade?.startsWith('A') ? 'success' : 'info'}>{grade.grade}</Badge></td>
                        <td className="py-3 px-2 hidden md:table-cell"><Progress value={grade.overall} size="sm" className="w-20" /></td>
                        <td className="py-3 pl-2 text-center">
                          {grade.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />}
                          {grade.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />}
                          {grade.trend === 'stable' && <Zap className="w-4 h-4 text-amber-500 mx-auto" />}
                        </td>
                      </>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
  )
}
