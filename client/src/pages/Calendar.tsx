import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get current month bounds
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Get calendar display bounds (including partial weeks)
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());
  
  const endOfCalendar = new Date(endOfMonth);
  endOfCalendar.setDate(endOfCalendar.getDate() + (6 - endOfCalendar.getDay()));

  const { data: habits = [] } = useQuery({
    queryKey: ["/api/habits"],
  });

  const { data: habitLogs = [] } = useQuery({
    queryKey: ["/api/habit-logs/contribution", {
      startDate: startOfCalendar.toISOString().split('T')[0],
      endDate: endOfCalendar.toISOString().split('T')[0]
    }],
  });

  // Group logs by date
  const logsByDate = habitLogs.reduce((acc: any, log: any) => {
    if (!acc[log.date]) {
      acc[log.date] = [];
    }
    acc[log.date].push(log);
    return acc;
  }, {});

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const generateCalendarDays = () => {
    const days = [];
    const current = new Date(startOfCalendar);
    
    while (current <= endOfCalendar) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getDayHabits = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return logsByDate[dateStr] || [];
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const calendarDays = generateCalendarDays();
  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground">
              View your habits across time
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    {monthYear}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      data-testid="button-prev-month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                      data-testid="button-today"
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      data-testid="button-next-month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    const dayHabits = getDayHabits(date);
                    const completedHabits = dayHabits.filter((log: any) => log.completed);
                    const completionRate = dayHabits.length > 0 ? completedHabits.length / dayHabits.length : 0;
                    
                    return (
                      <div
                        key={index}
                        className={cn(
                          "min-h-[100px] p-2 border border-border rounded-lg transition-colors hover:bg-muted/50",
                          !isCurrentMonth(date) && "opacity-40",
                          isToday(date) && "ring-2 ring-primary"
                        )}
                        data-testid={`calendar-day-${date.toISOString().split('T')[0]}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "text-sm font-medium",
                            isToday(date) ? "text-primary" : "text-foreground"
                          )}>
                            {date.getDate()}
                          </span>
                          {dayHabits.length > 0 && (
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              completionRate >= 0.8 ? "bg-success" :
                              completionRate >= 0.5 ? "bg-warning" :
                              completionRate > 0 ? "bg-chart-3" : "bg-muted-foreground"
                            )} />
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          {dayHabits.slice(0, 3).map((log: any, logIndex: number) => {
                            const habit = habits.find((h: any) => h.id === log.habitId);
                            if (!habit) return null;
                            
                            return (
                              <div
                                key={logIndex}
                                className={cn(
                                  "text-xs px-1 py-0.5 rounded truncate",
                                  log.completed 
                                    ? "bg-primary/20 text-primary" 
                                    : "bg-muted text-muted-foreground"
                                )}
                                title={habit.name}
                              >
                                {habit.name}
                              </div>
                            );
                          })}
                          {dayHabits.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayHabits.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Month Stats */}
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Habits</span>
                  <span className="font-semibold" data-testid="stat-active-habits">
                    {habits.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-semibold" data-testid="stat-completed-habits">
                    {habitLogs.filter((log: any) => log.completed).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Days Tracked</span>
                  <span className="font-semibold" data-testid="stat-days-tracked">
                    {new Set(habitLogs.map((log: any) => log.date)).size}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Habit Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Your Habits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {habits.map((habit: any) => (
                    <div key={habit.id} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm text-foreground truncate">
                        {habit.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {habit.category}
                      </Badge>
                    </div>
                  ))}
                  {habits.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No habits yet. Create some habits to see them here.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span>80%+ completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span>50-79% completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-chart-3" />
                    <span>1-49% completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span>No habits</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
