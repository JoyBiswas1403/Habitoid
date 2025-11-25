import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import {
  Home,
  Target,
  Clock,
  Calendar,
  Brain,
  Trophy,
  Settings,
  Moon,
  Sun,
  LogOut,
  ChartLine
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "My Habits", href: "/habits", icon: Target },
  { name: "Pomodoro Timer", href: "/timer", icon: Clock },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "AI Insights", href: "/insights", icon: Brain },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 p-4">
      <div className="flex flex-col flex-grow bg-card rounded-[2rem] shadow-soft overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 pt-8 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-md">
              <ChartLine className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">HabitFlow</h1>
          </div>
        </div>

        <div className="mt-6 flex-grow flex flex-col px-4">
          <nav className="flex-1 space-y-2" data-testid="sidebar-nav">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className={cn("mr-3 h-5 w-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex-shrink-0 pb-6 mt-auto">
            {user && (


              <div className="bg-secondary/50 rounded-2xl p-5 space-y-3 mb-4 mx-2">
                <div className="flex items-center space-x-3 mb-2">
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user.firstName || user.username}</p>
                    <p className="text-xs text-muted-foreground">Level {user.level || 1}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">XP Progress</span>
                  <span className="font-bold text-primary">{user.totalPoints || 0} XP</span>
                </div>
                <div className="w-full bg-background rounded-full h-2.5 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2.5 rounded-full transition-all shadow-sm"
                    style={{ width: `${Math.min(((user.totalPoints || 0) % 1000) / 10, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center font-medium">
                  {1000 - ((user.totalPoints || 0) % 1000)} XP to next level
                </p>
              </div>
            )}

            <div className="space-y-2 px-2">
              <button
                className="w-full text-muted-foreground hover:bg-secondary hover:text-foreground group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all"
                data-testid="button-settings"
              >
                <Settings className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform" />
                Settings
              </button>

              <button
                onClick={toggleTheme}
                className="w-full text-muted-foreground hover:bg-secondary hover:text-foreground group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all"
                data-testid="button-theme-toggle"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="mr-3 h-5 w-5" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="mr-3 h-5 w-5" />
                    Dark Mode
                  </>
                )}
              </button>

              <button
                onClick={() => logoutMutation.mutate()}
                className="w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all"
                data-testid="button-logout"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
