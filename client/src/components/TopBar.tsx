import { Menu, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function TopBar() {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-card border-b border-border shadow-sm">
      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
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
