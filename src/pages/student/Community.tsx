import React, { useState } from 'react'
import { MessageSquare, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const MessagesPage = React.lazy(() => import('./Messages'))
const SocialClub = React.lazy(() => import('./SocialClub'))

const tabs = [
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'clubs', label: 'Clubs', icon: Globe },
]

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'messages' | 'clubs'>('messages')

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-1 py-2 border-b border-border/50 bg-card/50 rounded-t-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'messages' | 'clubs')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <React.Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading...</div>}>
          {activeTab === 'messages' ? <MessagesPage /> : <SocialClub />}
        </React.Suspense>
      </div>
    </div>
  )
}