import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  BarChart3, UserCheck, Bus,
  Building2, Users, TrendingUp
} from 'lucide-react'

interface GenericPageProps {
  title: string
  description: string
  icon: string
  category: string
  role: string
  userId?: string
}

const iconMap: Record<string, React.ElementType> = {
  BarChart3, Building2, Users, TrendingUp, Bus,
  UserCheck, LayoutDashboard: BarChart3,
}

export default function GenericPage({ title, description, icon, category }: GenericPageProps) {
  const Icon = iconMap[icon] || BarChart3

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon className="w-6 h-6 text-orange-500" />
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">{category}</Badge>
        </div>
      </div>

      {/* Empty state */}
      <Card>
        <CardContent className="p-12 text-center">
          <Icon className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">Data is being loaded. Please check back later.</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
