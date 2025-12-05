import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, X, MessageSquare } from "lucide-react";

// Exact CalendarPage from app.jsx with Notes Modal
export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ date: string; logs: any[] } | null>(null);

  const { data: habits = [] } = useQuery({
    queryKey: ["/api/habits"],
  });

  // Get calendar bounds
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay() + 1);

  const endOfCalendar = new Date(endOfMonth);
  const daysToAdd = 7 - endOfCalendar.getDay();
  if (daysToAdd < 7) endOfCalendar.setDate(endOfCalendar.getDate() + daysToAdd);

  const { data: habitLogs = [] } = useQuery({
    queryKey: ["/api/habit-logs/contribution", {
      startDate: startOfCalendar.toISOString().split('T')[0],
      endDate: endOfCalendar.toISOString().split('T')[0]
    }],
  });

  // Group logs by date
  const logsByDate = (habitLogs as any[]).reduce((acc: any, log: any) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {});

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate calendar days
  const calendarDays: Date[] = [];
  const current = new Date(startOfCalendar);
  while (current <= endOfCalendar) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Handle day click
  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const logs = logsByDate[dateStr] || [];
    if (logs.length > 0) {
      setSelectedDay({ date: dateStr, logs });
    }
  };

  // Get habit name by ID
  const getHabitName = (habitId: string) => {
    const habit = (habits as any[]).find(h => h.id === habitId);
    return habit?.name || 'Unknown Habit';
  };

  const getHabitIcon = (habitId: string) => {
    const habit = (habits as any[]).find(h => h.id === habitId);
    return habit?.icon || '📌';
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black">Calendar</h1>
        <div className="flex gap-2">
          <button
            className="p-2 rounded-lg border-2 transition-all active:scale-95"
            style={{ borderColor: 'var(--border)' }}
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft size={16} />
          </button>
          <div className="font-bold text-lg px-4 flex items-center min-w-[180px] justify-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <button
            className="p-2 rounded-lg border-2 transition-all active:scale-95"
            style={{ borderColor: 'var(--border)' }}
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Legend */}
        <div className="lg:col-span-1 space-y-4">
          <div
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <h3 className="font-bold mb-4">Your Habits</h3>
            <div className="space-y-3">
              {(habits as any[]).length > 0 ? (habits as any[]).map((h: any) => (
                <div key={h.id} className="flex items-center gap-2">
                  <span className="text-lg">{h.icon || '📌'}</span>
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--muted)' }}>{h.name}</span>
                </div>
              )) : <div className="text-sm" style={{ color: 'var(--muted)' }}>No habits added yet.</div>}
            </div>
          </div>

          <div
            className="rounded-2xl p-6 text-white"
            style={{ backgroundColor: 'var(--sidebar)' }}
          >
            <h3 className="font-bold mb-2" style={{ color: 'var(--primary)' }}>Quick Tip</h3>
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              Click on any day with activity to see your completion details and notes!
            </p>
          </div>
        </div>

        {/* Calendar Grid */}
        <div
          className="lg:col-span-3 rounded-2xl p-6 border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-4 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-sm font-bold uppercase" style={{ color: 'var(--muted)' }}>{d}</div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, i) => {
              const dateStr = date.toISOString().split('T')[0];
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.getTime() === today.getTime();
              const dayLogs = logsByDate[dateStr] || [];
              const completedLogs = dayLogs.filter((log: any) => log.completed);
              const logsWithNotes = dayLogs.filter((log: any) => log.notes);
              const hasNotes = logsWithNotes.length > 0;

              return (
                <div
                  key={i}
                  onClick={() => handleDayClick(date)}
                  className={`
                    h-20 md:h-24 rounded-xl p-2 flex flex-col justify-between transition-all border
                    ${completedLogs.length > 0 ? 'cursor-pointer hover:scale-[1.02]' : ''}
                  `}
                  style={{
                    backgroundColor: isToday ? 'var(--accent-light)' : 'transparent',
                    borderColor: isToday ? 'var(--primary)' : 'var(--border)',
                    opacity: isCurrentMonth ? 1 : 0.3
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className="text-sm font-bold"
                      style={{ color: isToday ? 'var(--primary)' : 'var(--muted)' }}
                    >
                      {date.getDate()}
                    </span>
                    {hasNotes && (
                      <MessageSquare size={12} style={{ color: 'var(--primary)' }} />
                    )}
                  </div>

                  {/* Activity Dots */}
                  <div className="flex gap-1 flex-wrap content-end">
                    {completedLogs.slice(0, 4).map((_: any, j: number) => (
                      <div key={j} className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                    ))}
                    {completedLogs.length > 4 && (
                      <span className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>
                        +{completedLogs.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-xl"
            style={{ backgroundColor: 'var(--card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black">
                {new Date(selectedDay.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Completed Habits */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedDay.logs.filter((log: any) => log.completed).map((log: any, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{getHabitIcon(log.habitId)}</span>
                    <span className="font-bold">{getHabitName(log.habitId)}</span>
                    <span
                      className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                      ✓ Done
                    </span>
                  </div>

                  {/* Note if exists */}
                  {log.notes && (
                    <div
                      className="mt-2 p-3 rounded-lg text-sm"
                      style={{ backgroundColor: 'var(--accent-light)' }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={12} style={{ color: 'var(--primary)' }} />
                        <span className="font-bold text-xs" style={{ color: 'var(--primary)' }}>Note</span>
                      </div>
                      <p style={{ color: 'var(--text)' }}>{log.notes}</p>
                    </div>
                  )}
                </div>
              ))}

              {selectedDay.logs.filter((log: any) => log.completed).length === 0 && (
                <p className="text-center py-4" style={{ color: 'var(--muted)' }}>
                  No completed habits on this day.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
