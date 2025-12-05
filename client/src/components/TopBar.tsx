import { Menu, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/ThemeProvider";
import { HabitoidLogo } from "@/components/HabitoidLogo";
import {
  LayoutDashboard,
  Timer,
  Calendar,
  Brain,
  Trophy,
  LogOut
} from "lucide-react";

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: "/" },
  { id: 'timer', label: 'Focus Timer', icon: Timer, href: "/timer" },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: "/calendar" },
  { id: 'insights', label: 'AI Insights', icon: Brain, href: "/insights" },
  { id: 'analytics', label: 'Analytics', icon: Brain, href: "/analytics" },
  { id: 'goals', label: 'Goals', icon: Trophy, href: "/goals" },
  { id: 'achievements', label: 'Achievements', icon: Trophy, href: "/achievements" },
  { id: 'community', label: 'Community', icon: Trophy, href: "/community" },
];

// Exact TopBar from app.jsx
export default function TopBar() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-10 h-16 flex items-center justify-between px-4 lg:px-6 border-b transition-colors"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Left: Mobile Menu + Page Title */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="lg:hidden p-2" data-testid="button-mobile-menu" style={{ color: 'var(--muted)' }}>
              <Menu size={24} />
            </button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-0 border-r-0" style={{ backgroundColor: 'var(--sidebar)' }}>
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-6 flex items-center gap-3 font-black text-xl tracking-tighter border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <HabitoidLogo size={32} />
                Habitoid
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium"
                      style={{
                        backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                        color: isActive ? 'white' : '#9ca3af',
                      }}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom */}
              <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-full flex items-center gap-2 text-sm px-2 py-2"
                  style={{ color: '#9ca3af' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-colors"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User Avatar */}
        {user && (
          <div
            onClick={() => setLocation("/profile")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-all"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {((user as any).firstName?.[0] || (user as any).username?.[0] || "U").toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
