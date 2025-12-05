import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Clock,
    PieChart,
    Download,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useState } from "react";
import { HABIT_CATEGORIES } from "@/lib/habitData";

// Days of week labels
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Analytics() {
    const { user } = useAuth();
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

    const { data: habits = [] } = useQuery({
        queryKey: ["/api/habits"],
    });

    const { data: allLogs = [] } = useQuery({
        queryKey: ["/api/habit-logs/contribution"],
    });

    // Calculate weekly data (last 7 days)
    const getWeeklyData = () => {
        const data = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLogs = (allLogs as any[]).filter(log => log.date === dateStr && log.completed);
            data.push({
                day: DAYS[date.getDay()],
                date: dateStr,
                count: dayLogs.length,
                total: (habits as any[]).length
            });
        }
        return data;
    };

    // Calculate best day of week
    const getBestDay = () => {
        const dayStats = new Array(7).fill(0).map(() => ({ completed: 0, total: 0 }));
        (allLogs as any[]).forEach(log => {
            const date = new Date(log.date);
            const day = date.getDay();
            dayStats[day].total++;
            if (log.completed) dayStats[day].completed++;
        });
        const rates = dayStats.map((s, i) => ({
            day: DAYS[i],
            rate: s.total > 0 ? (s.completed / s.total) * 100 : 0
        }));
        return rates.reduce((best, current) => current.rate > best.rate ? current : best, rates[0]);
    };

    // Calculate category stats
    const getCategoryStats = () => {
        const stats: Record<string, { completed: number; total: number }> = {};

        (habits as any[]).forEach(habit => {
            const cat = habit.category || 'other';
            if (!stats[cat]) stats[cat] = { completed: 0, total: 0 };
        });

        (allLogs as any[]).forEach(log => {
            const habit = (habits as any[]).find(h => h.id === log.habitId);
            if (habit) {
                const cat = habit.category || 'other';
                if (!stats[cat]) stats[cat] = { completed: 0, total: 0 };
                stats[cat].total++;
                if (log.completed) stats[cat].completed++;
            }
        });

        return Object.entries(stats).map(([category, data]) => ({
            category,
            label: HABIT_CATEGORIES.find(c => c.id === category)?.label || category,
            color: HABIT_CATEGORIES.find(c => c.id === category)?.color || '#50A65C',
            icon: HABIT_CATEGORIES.find(c => c.id === category)?.icon || '📌',
            rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
            completed: data.completed,
            total: data.total
        })).sort((a, b) => b.rate - a.rate);
    };

    // Calculate monthly data (last 30 days)
    const getMonthlyData = () => {
        const data = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLogs = (allLogs as any[]).filter(log => log.date === dateStr && log.completed);
            data.push({
                date: date.getDate(),
                count: dayLogs.length
            });
        }
        return data;
    };

    const weeklyData = getWeeklyData();
    const bestDay = getBestDay();
    const categoryStats = getCategoryStats();
    const monthlyData = getMonthlyData();
    const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count), 1);
    const maxMonthlyCount = Math.max(...monthlyData.map(d => d.count), 1);

    // Overall stats
    const totalCompletions = (allLogs as any[]).filter(l => l.completed).length;
    const overallRate = (allLogs as any[]).length > 0
        ? Math.round((totalCompletions / (allLogs as any[]).length) * 100)
        : 0;

    // Handle CSV Export
    const handleExportCSV = () => {
        const headers = ['Date', 'Habit', 'Category', 'Completed', 'Notes'];
        const rows = (allLogs as any[]).map(log => {
            const habit = (habits as any[]).find(h => h.id === log.habitId);
            return [
                log.date,
                habit?.name || 'Unknown',
                habit?.category || 'other',
                log.completed ? 'Yes' : 'No',
                log.notes || ''
            ];
        });

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `habitoid-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Analytics</h1>
                    <p className="font-medium" style={{ color: 'var(--muted)' }}>Track your habit performance</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all active:scale-95 border"
                    style={{ borderColor: 'var(--border)' }}
                >
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                    className="p-4 rounded-2xl border"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--muted)' }}>Total Completions</p>
                    <p className="text-2xl font-black">{totalCompletions}</p>
                </div>
                <div
                    className="p-4 rounded-2xl border"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--muted)' }}>Overall Rate</p>
                    <p className="text-2xl font-black">{overallRate}%</p>
                </div>
                <div
                    className="p-4 rounded-2xl border"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--muted)' }}>Best Day</p>
                    <p className="text-2xl font-black">{bestDay.day}</p>
                </div>
                <div
                    className="p-4 rounded-2xl border"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--muted)' }}>Active Habits</p>
                    <p className="text-2xl font-black">{(habits as any[]).length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Chart */}
                <div
                    className="rounded-2xl p-6 border"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 size={20} style={{ color: 'var(--primary)' }} />
                        <h2 className="font-bold">Weekly Activity</h2>
                    </div>

                    <div className="flex items-end justify-between h-40 gap-2">
                        {weeklyData.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex flex-col items-center">
                                    <span className="text-xs font-bold mb-1">{day.count}</span>
                                    <div
                                        className="w-full rounded-t-lg transition-all"
                                        style={{
                                            height: `${(day.count / maxWeeklyCount) * 100}px`,
                                            minHeight: day.count > 0 ? '20px' : '4px',
                                            backgroundColor: day.count > 0 ? 'var(--primary)' : 'var(--border)'
                                        }}
                                    />
                                </div>
                                <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Trend */}
                <div
                    className="rounded-2xl p-6 border"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
                        <h2 className="font-bold">Last 30 Days</h2>
                    </div>

                    <div className="h-40 flex items-end gap-0.5">
                        {monthlyData.map((day, i) => (
                            <div
                                key={i}
                                className="flex-1 rounded-t transition-all"
                                style={{
                                    height: `${(day.count / maxMonthlyCount) * 100}%`,
                                    minHeight: day.count > 0 ? '4px' : '2px',
                                    backgroundColor: day.count > 0 ? 'var(--primary)' : 'var(--border)',
                                    opacity: 0.5 + (day.count / maxMonthlyCount) * 0.5
                                }}
                                title={`Day ${day.date}: ${day.count} habits`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>30 days ago</span>
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>Today</span>
                    </div>
                </div>

                {/* Category Performance */}
                <div
                    className="rounded-2xl p-6 border lg:col-span-2"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <PieChart size={20} style={{ color: 'var(--primary)' }} />
                        <h2 className="font-bold">Performance by Category</h2>
                    </div>

                    {categoryStats.length > 0 ? (
                        <div className="space-y-4">
                            {categoryStats.map((cat, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-2xl w-8">{cat.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium text-sm">{cat.label}</span>
                                            <span className="font-bold text-sm">{cat.rate}%</span>
                                        </div>
                                        <div className="h-3 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${cat.rate}%`,
                                                    backgroundColor: cat.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-8" style={{ color: 'var(--muted)' }}>
                            No data yet. Complete some habits to see your stats!
                        </p>
                    )}
                </div>

                {/* Day of Week Analysis */}
                <div
                    className="rounded-2xl p-6 border lg:col-span-2"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Clock size={20} style={{ color: 'var(--primary)' }} />
                        <h2 className="font-bold">Best Performing Days</h2>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {DAYS.map((day, i) => {
                            const dayLogs = (allLogs as any[]).filter(log => {
                                const d = new Date(log.date);
                                return d.getDay() === i;
                            });
                            const completed = dayLogs.filter(l => l.completed).length;
                            const rate = dayLogs.length > 0 ? Math.round((completed / dayLogs.length) * 100) : 0;
                            const isBest = day === bestDay.day;

                            return (
                                <div
                                    key={i}
                                    className="text-center p-4 rounded-xl border transition-all"
                                    style={{
                                        borderColor: isBest ? 'var(--primary)' : 'var(--border)',
                                        backgroundColor: isBest ? 'var(--accent-light)' : 'transparent'
                                    }}
                                >
                                    <p className="font-bold text-lg mb-1">{day}</p>
                                    <p
                                        className="text-2xl font-black"
                                        style={{ color: isBest ? 'var(--primary)' : 'var(--text)' }}
                                    >
                                        {rate}%
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{completed} done</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
