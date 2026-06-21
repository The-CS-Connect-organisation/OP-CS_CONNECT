import React, { useState } from 'react'
import { MessageSquare, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const SocialClub = React.lazy(() => import('./SocialClub'))

const tabs = [
  { id: 'clubs', label: 'Clubs', icon: Globe },
]

export default function CommunityPage() {
  const [activeTab] = useState<'clubs'>('clubs')

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <React.Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading...</div>}>
          <SocialClub />
        </React.Suspense>
      </div>
    </div>
  )
}