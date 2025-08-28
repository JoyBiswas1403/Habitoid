import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PomodoroTimer from "@/components/PomodoroTimer";
import { useQuery } from "@tanstack/react-query";
import { Clock, BarChart3, TrendingUp } from "lucide-react";

export default function Timer() {
  const { data: todayPomodoros = [] } = useQuery({
    queryKey: ["/api/pomodoro/today"],
  });

  const completedSessions = todayPomodoros.filter((s: any) => s.completed);
  const focusSessions = completedSessions.filter((s: any) => s.sessionType === 'focus');
  const totalFocusTime = focusSessions.reduce((total: number, s: any) => total + s.duration, 0);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Pomodoro Timer</h1>
          <p className="text-muted-foreground">
            Focus better with the Pomodoro Technique
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Focus Timer</CardTitle>
                <CardDescription>
                  Use the Pomodoro Technique to boost your productivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PomodoroTimer />
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sessions</span>
                  <span className="font-semibold" data-testid="stat-sessions-today">
                    {completedSessions.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Focus Time</span>
                  <span className="font-semibold" data-testid="stat-focus-time-today">
                    {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Focus Sessions</span>
                  <span className="font-semibold" data-testid="stat-focus-sessions">
                    {focusSessions.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Technique Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Pomodoro Technique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Focus</span>
                    <span className="font-medium">25 minutes</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Short Break</span>
                    <span className="font-medium">5 minutes</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Long Break</span>
                    <span className="font-medium">15 minutes</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  After 4 focus sessions, take a long break to recharge
                </p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Productivity Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm space-y-2">
                  <p className="text-muted-foreground">
                    • Choose one task per session
                  </p>
                  <p className="text-muted-foreground">
                    • Eliminate distractions
                  </p>
                  <p className="text-muted-foreground">
                    • Take breaks seriously
                  </p>
                  <p className="text-muted-foreground">
                    • Track your progress
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
