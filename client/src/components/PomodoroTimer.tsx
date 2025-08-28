import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Square } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PomodoroTimer() {
  const [sessionType, setSessionType] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const durations = {
    focus: 25,
    short_break: 5,
    long_break: 15,
  };

  const { timeLeft, isRunning, start, pause, reset } = useTimer(durations[sessionType] * 60);

  const { data: todayPomodoros = [] } = useQuery({
    queryKey: ["/api/pomodoro/today"],
  });

  const completePomodoroMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/pomodoro", {
        duration: durations[sessionType],
        completed: true,
        sessionType,
        date: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pomodoro/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Session completed!",
        description: `Great job! You earned ${durations[sessionType]} points.`,
      });
    },
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    start(() => {
      // Timer completed
      completePomodoroMutation.mutate();
      
      // Auto-switch to appropriate break
      if (sessionType === 'focus') {
        const completedFocusSessions = todayPomodoros.filter(
          (s: any) => s.completed && s.sessionType === 'focus'
        ).length;
        setSessionType(completedFocusSessions % 4 === 3 ? 'long_break' : 'short_break');
      } else {
        setSessionType('focus');
      }
    });
  };

  const progress = ((durations[sessionType] * 60 - timeLeft) / (durations[sessionType] * 60)) * 100;
  const circumference = 2 * Math.PI * 56; // radius = 56
  const offset = circumference - (progress / 100) * circumference;

  const completedToday = todayPomodoros.filter((s: any) => s.completed).length;
  const focusTimeToday = todayPomodoros
    .filter((s: any) => s.completed && s.sessionType === 'focus')
    .reduce((total: number, s: any) => total + s.duration, 0);

  return (
    <div className="text-center space-y-6">
      {/* Timer Display */}
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle 
            cx="64" 
            cy="64" 
            r="56" 
            stroke="hsl(var(--border))" 
            strokeWidth="8" 
            fill="none" 
          />
          <circle 
            cx="64" 
            cy="64" 
            r="56" 
            stroke="hsl(var(--primary))" 
            strokeWidth="8" 
            fill="none"
            strokeLinecap="round" 
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div 
              className={`text-3xl font-bold timer-display text-foreground ${isRunning ? 'timer-active' : ''}`}
              data-testid="timer-display"
            >
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {sessionType.replace('_', ' ')} Session
            </div>
          </div>
        </div>
      </div>
      
      {/* Session Type Selector */}
      <div className="flex justify-center space-x-2 mb-4">
        {Object.entries(durations).map(([type, duration]) => (
          <Button
            key={type}
            variant={sessionType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSessionType(type as any)}
            disabled={isRunning}
            data-testid={`button-session-${type}`}
          >
            {type.replace('_', ' ')} ({duration}m)
          </Button>
        ))}
      </div>
      
      {/* Controls */}
      <div className="space-y-3">
        <Button
          className="w-full"
          onClick={isRunning ? pause : handleStart}
          data-testid="button-timer-control"
        >
          {isRunning ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause Session
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start {sessionType.replace('_', ' ')} Session
            </>
          )}
        </Button>
        
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={reset}
            data-testid="button-timer-reset"
          >
            <Square className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
      
      {/* Today's Stats */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-sm text-muted-foreground mb-1">Today's Focus</div>
          <div className="text-lg font-semibold text-foreground" data-testid="text-today-focus">
            {completedToday} sessions • {Math.floor(focusTimeToday / 60)}h {focusTimeToday % 60}m
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
