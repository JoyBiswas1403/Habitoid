import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Star, Clock, Percent, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ContributionGrid from "@/components/ContributionGrid";
import PomodoroTimer from "@/components/PomodoroTimer";
import HabitCard from "@/components/HabitCard";
import AddHabitModal from "@/components/AddHabitModal";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [showAddHabit, setShowAddHabit] = useState(false);

  // Fetch today's habits
  const { data: habits = [] } = useQuery({
    queryKey: ["/api/habits"],
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ["/api/habit-logs/today"],
  });

  const { data: todayPomodoros = [] } = useQuery({
    queryKey: ["/api/pomodoro/today"],
  });

  // Calculate stats
  const completedToday = todayLogs.filter((log: any) => log.completed).length;
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  const focusTimeToday = todayPomodoros
    .filter((session: any) => session.completed && session.sessionType === 'focus')
    .reduce((total: number, session: any) => total + session.duration, 0);
  
  const focusHours = Math.floor(focusTimeToday / 60);
  const focusMinutes = focusTimeToday % 60;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                    <Flame className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-muted-foreground">Current Streak</div>
                  <div className="text-2xl font-bold text-foreground" data-testid="stat-current-streak">
                    {user?.currentStreak || 0} days
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
                    <Star className="h-5 w-5 text-accent-foreground" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-muted-foreground">Total Points</div>
                  <div className="text-2xl font-bold text-foreground" data-testid="stat-total-points">
                    {user?.totalPoints || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-chart-3 rounded-md flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-muted-foreground">Focus Time Today</div>
                  <div className="text-2xl font-bold text-foreground" data-testid="stat-focus-time">
                    {focusHours}h {focusMinutes}m
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-chart-5 rounded-md flex items-center justify-center">
                    <Percent className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-muted-foreground">Completion Rate</div>
                  <div className="text-2xl font-bold text-foreground" data-testid="stat-completion-rate">
                    {completionRate}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Habit Activity Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Habit Activity</CardTitle>
                  <select className="text-sm bg-input border border-border rounded-md px-3 py-1 text-foreground">
                    <option>Last 12 months</option>
                    <option>Last 6 months</option>
                    <option>Last 3 months</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <ContributionGrid />
              </CardContent>
            </Card>
          </div>

          {/* Pomodoro Timer Card */}
          <Card>
            <CardHeader>
              <CardTitle>Pomodoro Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <PomodoroTimer />
            </CardContent>
          </Card>
        </div>

        {/* Today's Habits Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Habits</CardTitle>
                <Button
                  onClick={() => setShowAddHabit(true)}
                  data-testid="button-add-habit"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Habit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {habits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No habits yet. Create your first habit to get started!</p>
                  <Button
                    onClick={() => setShowAddHabit(true)}
                    data-testid="button-create-first-habit"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Habit
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {habits.map((habit: any) => {
                    const habitLog = todayLogs.find((log: any) => log.habitId === habit.id);
                    return (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        isCompleted={habitLog?.completed || false}
                        streak={habit.currentStreak || 0}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddHabitModal
        open={showAddHabit}
        onClose={() => setShowAddHabit(false)}
      />
    </div>
  );
}
