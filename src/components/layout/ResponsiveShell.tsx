import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileNav from '@/components/ui/MobileNav'
import Loader from '../ui/loader'

interface ResponsiveShellProps {
  children?: React.ReactNode
}

export default function ResponsiveShell({ children }: ResponsiveShellProps) {
  return (
    <div className="h-screen bg-background text-foreground overflow-hidden">
      <TopBar />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 pb-24 pt-4 lg:p-6 lg:pb-4">
          <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader variant="dots" size="lg" /></div>}>
            {children || <Outlet />}
          </Suspense>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
