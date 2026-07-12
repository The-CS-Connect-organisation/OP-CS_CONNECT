import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X, LogIn, LayoutDashboard, LogOut } from "lucide-react"

import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"

const products = [
  { title: "For Students", href: "/student", description: "Track assignments, grades, and schedules." },
  { title: "For Teachers", href: "/teacher", description: "Manage classes, attendance, and reports." },
  { title: "For Parents", href: "/parent", description: "Stay updated on your child's progress." },
  { title: "For Admins", href: "/admin", description: "Full oversight of school operations." },
]

const aboutItems = [
  { title: "Our Story", href: "/about", description: "Learn about Cornerstone's mission." },
  { title: "Team", href: "/about", description: "Meet the people behind SchoolSync." },
  { title: "Careers", href: "/careers", description: "Join us in transforming education." },
]

const resources = [
  { title: "Help Center", href: "/help", description: "Guides, FAQs, and support." },
  { title: "Contact", href: "/contact", description: "Get in touch with our team." },
  { title: "Privacy", href: "/privacy", description: "How we handle your data." },
]

const NavigationMenu4 = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const getDashboardRoute = () => {
    if (!user) return "/login"
    switch (user.role) {
      case "student": return "/student"
      case "teacher": return "/teacher"
      case "admin": return "/admin"
      case "parent": return "/parent"
      case "driver": return "/driver"
      case "librarian": return "/librarian"
      case "coordinator": return "/coordinator"
      case "manager": return "/manager"
      default: return "/login"
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/30 bg-white/70 px-3 py-2 shadow-xl backdrop-blur-2xl md:px-6">
          <Link to="/" className="flex items-center gap-1.5 shrink-0 min-w-0">
            <img
              src={`${import.meta.env.BASE_URL}img/csfeviconbgfreeedition.png`}
              alt="Cornerstone"
              className="w-7 h-7 md:w-9 md:h-9 object-contain shrink-0"
            />
            <span className="font-zentry text-sm md:text-lg font-black uppercase tracking-wider text-gray-900 truncate">
              SchoolSync
            </span>
          </Link>

          <div className="hidden md:contents">
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="rounded-lg text-sm font-medium text-gray-700 bg-white/40 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/60 hover:text-orange-600 data-[state=open]:bg-white/60 data-[state=open]:text-orange-600">
                    Products
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {products.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="rounded-lg text-sm font-medium text-gray-700 bg-white/40 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/60 hover:text-orange-600 data-[state=open]:bg-white/60 data-[state=open]:text-orange-600">
                    About
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {aboutItems.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                      <ListItem
                        title="Blog"
                        href="/blog"
                        className="md:col-span-2"
                      >
                        Latest updates from Cornerstone Schools.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="rounded-lg text-sm font-medium text-gray-700 bg-white/40 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/60 hover:text-orange-600 data-[state=open]:bg-white/60 data-[state=open]:text-orange-600">
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {resources.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-lg bg-white/40 backdrop-blur-md border border-white/20 shadow-sm text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-white/60 transition-all px-4 py-1.5">
                      {user.name}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-56">
                    <DropdownMenuLabel className="flex items-start gap-3 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-base shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-gray-900">{user.name}</span>
                        {user.class && <span className="truncate text-xs text-gray-400">Class {user.class}</span>}
                        <span className="truncate text-xs text-gray-400">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { useAuthStore.getState().logout(); navigate("/") }}>
                      <LogOut className="w-4 h-4 text-gray-400" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="rounded-lg bg-white/40 backdrop-blur-md border border-white/20 shadow-sm text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-white/60 transition-all"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/signup")}
                    className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm hover:from-orange-600 hover:to-orange-700"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-7xl px-3 sm:px-6 lg:px-8 md:hidden">
          <nav className="rounded-2xl border border-orange-200/60 bg-white/90 px-4 py-3 backdrop-blur-xl shadow-sm">
            <div className="space-y-1">
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Products</p>
              {products.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-gray-400">{item.description}</span>
                </Link>
              ))}
            </div>
            <hr className="my-2 border-orange-100" />
            <div className="space-y-1">
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">About</p>
              {aboutItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-gray-400">{item.description}</span>
                </Link>
              ))}
              <Link
                to="/blog"
                onClick={() => setMobileOpen(false)}
                className="flex flex-col rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
              >
                <span className="font-medium">Blog</span>
                <span className="text-xs text-gray-400">Latest updates from Cornerstone Schools.</span>
              </Link>
            </div>
            <hr className="my-2 border-orange-100" />
            <div className="space-y-1">
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Resources</p>
              {resources.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-gray-400">{item.description}</span>
                </Link>
              ))}
            </div>
            <hr className="my-2 border-orange-100" />
            {isAuthenticated && user ? (
              <>
                <button
                  onClick={() => { setMobileOpen(false); navigate(getDashboardRoute()) }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => { useAuthStore.getState().logout(); navigate("/"); setMobileOpen(false) }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => { setMobileOpen(false); navigate("/login") }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-200 px-3 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileOpen(false); navigate("/signup") }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:from-orange-600 hover:to-orange-700"
                >
                  Get Started
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

const ListItem = ({
  className,
  title,
  children,
  href,
  ...props
}: {
  className?: string
  title: string
  children: React.ReactNode
  href: string
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className={cn(
            "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-600 focus:bg-orange-50 focus:text-orange-600",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none text-gray-900 group-hover:text-orange-600">
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-gray-400">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

export default NavigationMenu4
