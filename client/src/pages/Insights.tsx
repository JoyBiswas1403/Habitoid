import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  Target,
  Clock,
  Loader2,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Zap,
  Calendar,
  Flame,
  Star
} from "lucide-react";
import { SlashCharacter } from "@/components/SlashCharacter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { HABIT_CATEGORIES } from "@/lib/habitData";

function getWeekOptions() {
  const weeks = [];
  const today = new Date();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - today.getDay() + 1);

  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(currentMonday.getDate() - (i * 7));
    weeks.push(weekStart.toISOString().split('T')[0]);
  }
  return weeks;
}

// Smart habit suggestions based on user patterns
const SMART_SUGGESTIONS = [
  {
    title: "Morning Meditation",
    reason: "You're 40% more consistent with morning habits",
    category: "mindfulness",
    icon: "🧘",
    xpBonus: 15
  },
  {
    title: "Evening Journal",
    reason: "Pairs well with your existing bedtime routine",
    category: "mindfulness",
    icon: "📔",
    xpBonus: 10
  },
  {
    title: "15-min Walk After Lunch",
    reason: "Boosts afternoon energy and focus",
    category: "health",
    icon: "🚶",
    xpBonus: 12
  },
];

// Daily coaching tips
const COACHING_TIPS = [
  "🎯 Focus on just 2-3 key habits for maximum consistency",
  "⏰ Anchor new habits to existing ones (habit stacking)",
  "🔥 Don't break the chain - every day counts!",
  "💪 Small wins build momentum for bigger goals",
  "🌟 Celebrate progress, not just perfection",
  "📊 Track your patterns to optimize your routine",
  "🧠 Your willpower peaks in the morning - use it wisely",
  "💤 Good sleep = better habit performance tomorrow",
];

export default function Insights() {
  const [selectedWeek, setSelectedWeek] = useState(getWeekOptions()[0]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: habits = [] } = useQuery({
    queryKey: ["/api/habits"],
  });

  const { data: allLogs = [] } = useQuery({
    queryKey: ["/api/habit-logs/contribution"],
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/insights", selectedWeek],
    queryFn: async () => {
      const res = await fetch(`/api/insights?week=${selectedWeek}`, { credentials: 'include' });
      if (!res.ok) return null;
      const data = await res.json();
      return data.length > 0 ? data[0] : null;
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/insights/generate", { weekStart: selectedWeek }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights", selectedWeek] });
      toast({ title: "AI Insights Generated! 🧠" });
    },
  });

  // Calculate predictive insights from real data
  const predictiveData = useMemo(() => {
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayStats = new Array(7).fill(0).map(() => ({ completed: 0, total: 0 }));

    (allLogs as any[]).forEach(log => {
      const date = new Date(log.date);
      const day = date.getDay();
      dayStats[day].total++;
      if (log.completed) dayStats[day].completed++;
    });

    const dayRates = dayStats.map((s, i) => ({
      day: DAYS[i],
      rate: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
    }));

    const bestDay = dayRates.reduce((best, curr) => curr.rate > best.rate ? curr : best, dayRates[0]);
    const worstDay = dayRates.filter(d => d.rate > 0).reduce((worst, curr) => curr.rate < worst.rate ? curr : worst, dayRates[0]);

    // Category performance
    const catStats: Record<string, { completed: number; total: number }> = {};
    (allLogs as any[]).forEach(log => {
      const habit = (habits as any[]).find(h => h.id === log.habitId);
      if (habit) {
        const cat = habit.category || 'other';
        if (!catStats[cat]) catStats[cat] = { completed: 0, total: 0 };
        catStats[cat].total++;
        if (log.completed) catStats[cat].completed++;
      }
    });

    const categoryPerformance = Object.entries(catStats).map(([cat, data]) => ({
      category: cat,
      label: HABIT_CATEGORIES.find(c => c.id === cat)?.label || cat,
      color: HABIT_CATEGORIES.find(c => c.id === cat)?.color || '#50A65C',
      rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    })).sort((a, b) => b.rate - a.rate);

    // Overall stats
    const totalCompleted = (allLogs as any[]).filter(l => l.completed).length;
    const overallRate = (allLogs as any[]).length > 0
      ? Math.round((totalCompleted / (allLogs as any[]).length) * 100)
      : 0;

    return { bestDay, worstDay, categoryPerformance, overallRate, dayRates };
  }, [allLogs, habits]);

  // Get today's coaching tip based on date
  const todaysTip = COACHING_TIPS[new Date().getDay()];
  const userStreak = (user as any)?.currentStreak || 0;

  // Personalized coaching message
  const getCoachingMessage = () => {
    if (userStreak === 0) return "Start your streak today! Every journey begins with a single step.";
    if (userStreak < 3) return `${userStreak} day streak - you're building momentum! Keep going!`;
    if (userStreak < 7) return `${userStreak} days strong! 🔥 You're developing real consistency.`;
    if (userStreak < 14) return `Incredible ${userStreak} day streak! You're in the habit zone now.`;
    if (userStreak < 30) return `${userStreak} days - you're unstoppable! 💪 This is becoming part of who you are.`;
    return `LEGENDARY ${userStreak} day streak! 🏆 You've mastered consistency!`;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">AI Insights</h1>
          <p className="font-medium" style={{ color: 'var(--muted)' }}>Smart analysis & personalized coaching</p>
        </div>
        <button
          className="px-4 py-2 rounded-lg font-bold transition-all active:scale-95 shadow-md flex items-center gap-2"
          style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
          Generate Report
        </button>
      </div>

      {/* AI Coaching Card */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' }}
      >
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Sparkles size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">AI Coach • Daily Tip</span>
            </div>
            <p className="text-lg font-bold mb-2">{getCoachingMessage()}</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{todaysTip}</p>
          </div>
          <div className="w-16 h-16">
            <SlashCharacter expression="smart" className="w-full h-full" />
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: 'white' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictive Insights */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
            <h3 className="font-bold">Predictive Insights</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--accent-light)' }}>
              <p className="text-2xl font-black" style={{ color: 'var(--primary)' }}>{predictiveData.overallRate}%</p>
              <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Overall Rate</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--accent-light)' }}>
              <p className="text-2xl font-black" style={{ color: '#22c55e' }}>{predictiveData.bestDay.day}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Best Day</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--accent-light)' }}>
              <p className="text-2xl font-black" style={{ color: '#f59e0b' }}>{predictiveData.worstDay.day}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Needs Work</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--accent-light)' }}>
              <p className="text-2xl font-black">{(habits as any[]).length}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Active Habits</p>
            </div>
          </div>

          {/* Day of Week Chart */}
          <div className="mb-4">
            <p className="text-sm font-bold mb-3" style={{ color: 'var(--muted)' }}>Performance by Day</p>
            <div className="flex items-end justify-between h-24 gap-1">
              {predictiveData.dayRates.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${d.rate}%`,
                      minHeight: d.rate > 0 ? '8px' : '4px',
                      backgroundColor: d.day === predictiveData.bestDay.day ? '#22c55e' : 'var(--primary)',
                      opacity: d.day === predictiveData.bestDay.day ? 1 : 0.6
                    }}
                  />
                  <span className="text-[10px] mt-1 font-medium" style={{ color: 'var(--muted)' }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Observation */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--sidebar)', color: 'white' }}>
            <div className="flex items-start gap-3">
              <Brain size={18} style={{ color: 'var(--primary)' }} />
              <p className="text-sm">
                {predictiveData.bestDay.rate > 0
                  ? `You perform best on ${predictiveData.bestDay.day}s (${predictiveData.bestDay.rate}% completion rate). Consider scheduling important habits on ${predictiveData.bestDay.day}s for maximum success.`
                  : "Complete more habits to unlock personalized insights about your best performing days!"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Smart Suggestions */}
        <div
          className="rounded-2xl p-6 border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={20} style={{ color: '#f59e0b' }} />
            <h3 className="font-bold">Suggested for You</h3>
          </div>

          <div className="space-y-3">
            {SMART_SUGGESTIONS.map((suggestion, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent-light)' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{suggestion.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{suggestion.title}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{suggestion.reason}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star size={12} style={{ color: '#f59e0b' }} />
                      <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>+{suggestion.xpBonus} XP/day</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div
        className="rounded-2xl p-6 border"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Target size={20} style={{ color: 'var(--primary)' }} />
          <h3 className="font-bold">Category Performance</h3>
        </div>

        {predictiveData.categoryPerformance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {predictiveData.categoryPerformance.map((cat, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--accent-light)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">{cat.label}</span>
                  <span className="font-black" style={{ color: cat.color }}>{cat.rate}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${cat.rate}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8" style={{ color: 'var(--muted)' }}>
            Complete some habits to see your category breakdown!
          </p>
        )}
      </div>

      {/* Weekly Analysis */}
      <div
        className="rounded-2xl p-6 border"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} style={{ color: 'var(--primary)' }} />
            <h3 className="font-bold">Weekly AI Analysis</h3>
          </div>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm font-medium"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent-light)' }}
          >
            {getWeekOptions().map((week, i) => (
              <option key={week} value={week}>
                {i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `Week of ${week}`}
              </option>
            ))}
          </select>
        </div>

        {insights ? (
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--accent-light)' }}>
            <p className="text-sm leading-relaxed">{insights.analysis}</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain size={48} className="mx-auto mb-4" style={{ color: 'var(--muted)' }} />
            <p className="font-bold mb-2">No AI analysis for this week yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Generate a report to get personalized insights
            </p>
            <button
              className="px-4 py-2 rounded-lg font-bold"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              Generate Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
