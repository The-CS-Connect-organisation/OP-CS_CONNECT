import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNavBar from './BottomNavBar'

interface ResponsiveShellProps {
  children?: React.ReactNode
}

export default function ResponsiveShell({ children }: ResponsiveShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <div className="lg:flex lg:min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-y-auto px-4 pb-28 pt-4 lg:p-6 lg:pb-4">
          {children || <Outlet />}
        </main>
      </div>
      <BottomNavBar />
    </div>
  )
}
