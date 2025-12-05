import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { HabitoidLogo } from "@/components/HabitoidLogo";
import {
  LayoutDashboard,
  Timer,
  Calendar,
  Brain,
  BarChart3,
  Users,
  Medal,
  Target,
  LogOut,
  Moon,
  Sun,
  X
} from "lucide-react";

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: "/" },
  { id: 'timer', label: 'Focus Timer', icon: Timer, href: "/timer" },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: "/calendar" },
  { id: 'insights', label: 'AI Insights', icon: Brain, href: "/insights" },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: "/analytics" },
  { id: 'goals', label: 'Goals', icon: Target, href: "/goals" },
  { id: 'achievements', label: 'Achievements', icon: Medal, href: "/achievements" },
  { id: 'community', label: 'Community', icon: Users, href: "/community" },
];

// Exact Sidebar from app.jsx
export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0"
      style={{ backgroundColor: 'var(--sidebar)' }}
    >
      {/* Logo */}
      <div
        className="p-6 flex items-center gap-3 font-black text-xl tracking-tighter border-b"
        style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
      >
        <HabitoidLogo size={32} />
        Habitoid
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
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
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }
              }}
              data-testid={`nav-${item.id}`}
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
          className="w-full flex items-center gap-2 text-sm px-2 py-2 transition-colors"
          style={{ color: '#9ca3af' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
