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
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-card border-r border-border overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <ChartLine className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">HabitFlow</h1>
          </div>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1" data-testid="sidebar-nav">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex-shrink-0 px-2 pb-4">
            {user && (
              <div className="bg-muted rounded-lg p-4 space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Level {user.level || 1}
                  </span>
                  <span className="text-sm font-bold text-accent">
                    {user.totalPoints || 0} XP
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all" 
                    style={{ width: `${Math.min(((user.totalPoints || 0) % 1000) / 10, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {1000 - ((user.totalPoints || 0) % 1000)} XP to next level
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <button 
                className="w-full text-muted-foreground hover:bg-muted hover:text-foreground group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                data-testid="button-settings"
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </button>
              
              <button 
                onClick={toggleTheme}
                className="w-full text-muted-foreground hover:bg-muted hover:text-foreground group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
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
                onClick={() => window.location.href = "/api/logout"}
                className="w-full text-muted-foreground hover:bg-muted hover:text-foreground group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                data-testid="button-logout"
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
