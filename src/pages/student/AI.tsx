import React from 'react'
import { MatrixText } from '@/components/ui/matrix-text'
import AIChatPanel from '@/components/ai/AIChatPanel'

export default function AIPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-center py-4 border-b border-border/50">
        <MatrixText text="CSAI AI Lab" className="!min-h-0 !h-12" initialDelay={500} letterAnimationDuration={400} letterInterval={80} />
      </div>
      <div className="flex-1">
        <AIChatPanel />
      </div>
    </div>
  )
}
