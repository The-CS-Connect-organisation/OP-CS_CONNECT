import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, LogOut, LayoutDashboard, CircleUserRound, ChevronRight } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useAuthStore } from "@/lib/store";

const navItems = ["About", "Features", "Story"];

const NavBar = () => {
  const navRef = useRef<HTMLDivElement>(null);

  const { y: currentScrollY } = useWindowScroll();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const pastHero = currentScrollY > window.innerHeight;

    if (!pastHero) {
      gsap.set(el, { y: 0, opacity: 1 });
      return;
    }

    gsap.set(el, { y: -80, opacity: 0 });

    const onMouse = (e: MouseEvent) => {
      if (e.clientY < 60) {
        gsap.to(el, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
      } else {
        gsap.to(el, { y: -80, opacity: 0, duration: 0.25, ease: "power2.in" });
      }
    };

    document.addEventListener("mousemove", onMouse);
    return () => document.removeEventListener("mousemove", onMouse);
  }, [currentScrollY]);

  const handleNavClick = (item: string) => {
    if (item === "About") {
      navigate("/about");
    } else {
      document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getDashboardRoute = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "student": return "/student";
      case "teacher": return "/teacher";
      case "admin": return "/admin";
      case "parent": return "/parent";
      case "driver": return "/driver";
      case "librarian": return "/librarian";
      case "coordinator": return "/coordinator";
      case "manager": return "/manager";
      default: return "/login";
    }
  };

  return (
    <div
      ref={navRef}
      className="fixed inset-x-0 top-0 z-50 h-16 bg-white/10 backdrop-blur-md border-b border-transparent"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="flex items-center gap-3">
              <img src={`${import.meta.env.BASE_URL}img/csfeviconbgfreeedition.png`} alt="CS Connect" className="w-7 h-7 md:w-8 md:h-8 object-contain" />
              <span className="font-zentry text-base md:text-lg font-black uppercase tracking-wider text-white">
                CS Connect
              </span>
            </button>
          </div>

          <div className="flex h-full items-center gap-1 md:gap-3">
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(item)}
                  className="relative px-3 py-1.5 font-general text-xs uppercase tracking-wide rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors p-1">
                    <CircleUserRound className="w-6 h-6" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuLabel className="flex items-start gap-3 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-base shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-gray-900">
                        {user.name}
                      </span>
                      {user.class && (
                        <span className="truncate text-xs text-gray-400">
                          Class {user.class}
                        </span>
                      )}
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
                  <DropdownMenuItem onClick={() => { useAuthStore.getState().logout(); navigate("/"); }}>
                    <LogOut className="w-4 h-4 text-gray-400" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 px-3 py-1.5 font-general text-xs uppercase tracking-wide rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;
