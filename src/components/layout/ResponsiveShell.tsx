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
    <div className="h-screen bg-background text-foreground overflow-hidden">
      <TopBar />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 pb-24 pt-4 lg:p-6 lg:pb-4">
          {children || <Outlet />}
        </main>
      </div>
      <BottomNavBar />
    </div>
  )
}
