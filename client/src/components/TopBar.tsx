import { Menu, Bell, Home, Target, Clock, Calendar, Brain, Trophy, LogOut, Settings, Sun, Moon, ChartLine } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "My Habits", href: "/habits", icon: Target },
  { name: "Pomodoro Timer", href: "/timer", icon: Clock },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "AI Insights", href: "/insights", icon: Brain },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

export default function TopBar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-card border-b border-border shadow-sm">
      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex flex-col h-full bg-card">
                <div className="flex items-center px-6 pt-8 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-md">
                      <ChartLine className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">HabitFlow</h1>
                  </div>
                </div>

                <div className="mt-6 flex-grow flex flex-col px-4">
                  <nav className="flex-1 space-y-2">
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
                        >
                          <item.icon className={cn("mr-3 h-5 w-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="flex-shrink-0 pb-6 mt-auto space-y-2">
                    <button
                      onClick={toggleTheme}
                      className="w-full text-muted-foreground hover:bg-secondary hover:text-foreground group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all"
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
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <h2 className="ml-2 text-lg font-semibold text-foreground">Dashboard</h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3 bg-muted rounded-lg px-3 py-1">
            <span className="text-sm text-muted-foreground">Current Streak:</span>
            <span className="text-lg font-bold text-primary" data-testid="text-current-streak">
              {user?.currentStreak || 0} days
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent"></span>
          </Button>

          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                Level {user?.level || 1} Achiever
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground" data-testid="text-user-avatar">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
