import ResponsiveShell from './ResponsiveShell'

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <ResponsiveShell>{children}</ResponsiveShell>
}
