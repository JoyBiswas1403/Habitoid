import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Flame,
  Trophy,
  Clock,
  Target,
  Plus,
  CheckCircle2,
  Trash2,
  Zap,
  Star
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import HabitCard from "@/components/HabitCard";
import AddHabitModal from "@/components/AddHabitModal";
import { SlashCharacter } from "@/components/SlashCharacter";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { shouldShowHabitToday } from "@/lib/frequencyUtils";
import { getXPMultiplier, getWeeklyChallenge, getSlashEvolution, getNextEvolution } from "@/lib/gamification";

// Motivational quotes for Slash - from app.jsx
const SLASH_QUOTES = [
  "Zap! Let's get moving!",
  "Consistency is key, friend!",
  "I'm charged up! Are you?",
  "One more habit? You got this!",
  "Bzzzt! Focus mode: ON!"
];

// Exact DashboardPage from app.jsx
export default function Dashboard() {
  const { user } = useAuth();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [slashQuote, setSlashQuote] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: habits = [], isLoading: isLoadingHabits } = useQuery({
    queryKey: ["/api/habits"],
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ["/api/habit-logs/today"],
  });

  const { data: todayPomodoros = [] } = useQuery({
    queryKey: ["/api/pomodoro/today"],
  });

  // Filter habits based on frequency (only show habits scheduled for today)
  const todaysHabits = (habits as any[]).filter((habit: any) => shouldShowHabitToday(habit));

  // Stats calculation - based on today's habits only
  const completedToday = (todayLogs as any[]).filter((log: any) => log.completed).length;
  const completionRate = todaysHabits.length > 0
    ? Math.round((completedToday / todaysHabits.length) * 100)
    : 0;
  const focusTimeToday = (todayPomodoros as any[])
    .filter((session: any) => session.completed && session.sessionType === 'focus')
    .reduce((total: number, session: any) => total + session.duration, 0);

  const handleSlashClick = () => {
    const quote = SLASH_QUOTES[Math.floor(Math.random() * SLASH_QUOTES.length)];
    setSlashQuote(quote);
    setTimeout(() => setSlashQuote(null), 3000);
  };

  const userStats = {
    streak: (user as any)?.currentStreak || 0,
    points: (user as any)?.totalPoints || 0,
    focusTime: focusTimeToday
  };

  return (
    <div className="space-y-6 animate-in fade-in" style={{ animationDuration: '500ms' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black">Dashboard</h1>
          <p className="font-medium" style={{ color: 'var(--muted)' }}>Let's make today productive!</p>
        </div>
        <div className="flex gap-3">
          <button
            className="text-xs h-9 px-4 py-2 rounded-lg font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            onClick={() => setShowAddHabit(true)}
          >
            <Plus size={14} /> Add Habit
          </button>
        </div>
      </div>

      {/* Stats - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Streak with XP Multiplier */}
        <div
          className="flex items-center gap-4 p-6 rounded-2xl shadow-sm border-l-4 relative"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            borderLeftColor: 'var(--primary)'
          }}
        >
          <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}>
            <Flame size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase" style={{ color: 'var(--muted)' }}>Streak</p>
            <p className="text-2xl font-black">{userStats.streak} Days</p>
          </div>
          {/* XP Multiplier Badge */}
          {getXPMultiplier(userStats.streak).multiplier > 1 && (
            <div
              className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-black"
              style={{ backgroundColor: '#f97316', color: 'white' }}
            >
              {getXPMultiplier(userStats.streak).multiplier}x XP
            </div>
          )}
        </div>

        {/* Points */}
        <div
          className="flex items-center gap-4 p-6 rounded-2xl shadow-sm border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase" style={{ color: 'var(--muted)' }}>Points</p>
            <p className="text-2xl font-black">{userStats.points}</p>
          </div>
        </div>

        {/* Focus Time */}
        <div
          className="flex items-center gap-4 p-6 rounded-2xl shadow-sm border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase" style={{ color: 'var(--muted)' }}>Focus Time</p>
            <p className="text-2xl font-black">{Math.floor(userStats.focusTime / 60)}h {userStats.focusTime % 60}m</p>
          </div>
        </div>

        {/* Completion */}
        <div
          className="flex items-center gap-4 p-6 rounded-2xl shadow-sm border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase" style={{ color: 'var(--muted)' }}>Completion</p>
            <p className="text-2xl font-black">{completionRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habit List - 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Today's Habits</h2>
            <div className="text-sm font-bold" style={{ color: 'var(--muted)' }}>
              {completedToday}/{todaysHabits.length} Completed
            </div>
          </div>

          <div className="space-y-3">
            {todaysHabits.length === 0 && (
              <div
                className="text-center py-10 border-2 border-dashed rounded-xl"
                style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
              >
                {(habits as any[]).length === 0
                  ? "No habits yet. Click 'Add Habit' to start!"
                  : "No habits scheduled for today. Enjoy your rest! 🎉"
                }
              </div>
            )}
            {todaysHabits.map((habit: any) => {
              const habitLog = (todayLogs as any[]).find((log: any) => log.habitId === habit.id);
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={habitLog?.completed || false}
                />
              );
            })}
          </div>
        </div>

        {/* Right Column - Slash Companion */}
        <div className="space-y-6">
          {/* Companion Card */}
          <div
            className="rounded-2xl p-6 text-white relative overflow-hidden group"
            style={{ backgroundColor: 'var(--sidebar)' }}
          >
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Your Companion</h3>
                <span
                  className="text-xs px-2 py-0.5 rounded font-bold"
                  style={{ backgroundColor: 'var(--primary)', color: 'black' }}
                >
                  Lvl {(user as any)?.level || 1}
                </span>
              </div>

              <div className="flex flex-col items-center py-4 relative">
                {/* Speech bubble */}
                {slashQuote && (
                  <div
                    className="absolute -top-4 text-xs font-bold px-3 py-2 rounded-xl rounded-bl-none shadow-lg border-2 z-20 animate-in zoom-in-95"
                    style={{
                      backgroundColor: 'white',
                      color: 'black',
                      borderColor: 'var(--primary)'
                    }}
                  >
                    {slashQuote}
                  </div>
                )}

                <SlashCharacter
                  expression="happy"
                  className="w-32 h-32 drop-shadow-2xl hover:brightness-110 transition-all active:scale-95"
                  onClick={handleSlashClick}
                />
                <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Click Slash for motivation!
                </p>
              </div>
            </div>

            {/* Background glow */}
            <div
              className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"
              style={{ backgroundColor: 'var(--primary)' }}
            />
          </div>

          {/* Daily Tip */}
          <div
            className="rounded-2xl p-5 border-none"
            style={{ backgroundColor: 'var(--accent-light)' }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
                <Zap size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--primary)' }}>Daily Tip</h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Small progress is still progress. Try to just do 5 minutes of your hardest task today.
                </p>
              </div>
            </div>
          </div>

          {/* Weekly Challenge */}
          {(() => {
            const challenge = getWeeklyChallenge();
            return (
              <div
                className="rounded-2xl p-5 text-white"
                style={{ backgroundColor: '#1e293b' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target size={18} style={{ color: '#f59e0b' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: '#f59e0b' }}>Weekly Challenge</span>
                </div>
                <h4 className="font-black text-lg mb-1">{challenge.name}</h4>
                <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{challenge.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={14} style={{ color: '#f59e0b' }} />
                    <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>+{challenge.reward} XP</span>
                  </div>
                  <div
                    className="text-xs px-2 py-1 rounded-lg font-bold"
                    style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}
                  >
                    In Progress
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Slash Evolution */}
          {(() => {
            const evolution = getSlashEvolution(userStats.points);
            const { next, progress } = getNextEvolution(userStats.points);
            return (
              <div
                className="rounded-2xl p-4 border"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{evolution.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm">{evolution.name}</h4>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{evolution.description}</p>
                  </div>
                </div>
                {next && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--muted)' }}>Next: {next.name}</span>
                      <span className="font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: 'var(--primary)' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      <AddHabitModal open={showAddHabit} onClose={() => setShowAddHabit(false)} />
    </div>
  );
}
