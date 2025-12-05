import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Target,
    Trophy,
    Flame,
    Link,
    Plus,
    Check,
    Star,
    TrendingUp,
    Calendar,
    Sparkles,
    ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SlashCharacter } from "@/components/SlashCharacter";
import { useToast } from "@/hooks/use-toast";

// Default goals
const DEFAULT_GOALS = {
    dailyHabits: 5,
    weeklyPoints: 500,
    weeklyFocusMinutes: 120,
};

// Milestone definitions
const MILESTONES = [
    { id: 'first_habit', name: 'First Habit', description: 'Create your first habit', icon: '🌱', target: 1, type: 'habits_created' },
    { id: 'week_streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', target: 7, type: 'streak' },
    { id: 'month_streak', name: 'Month Master', description: 'Maintain a 30-day streak', icon: '💪', target: 30, type: 'streak' },
    { id: 'hundred_points', name: 'Century Club', description: 'Earn 100 total points', icon: '💯', target: 100, type: 'points' },
    { id: 'thousand_points', name: 'Point Prodigy', description: 'Earn 1,000 total points', icon: '🏆', target: 1000, type: 'points' },
    { id: 'five_habits', name: 'Habit Builder', description: 'Create 5 habits', icon: '📋', target: 5, type: 'habits_created' },
    { id: 'ten_habits', name: 'Habit Architect', description: 'Create 10 habits', icon: '🏗️', target: 10, type: 'habits_created' },
    { id: 'focus_hour', name: 'Focus Hour', description: 'Complete 60 minutes of focus', icon: '⏱️', target: 60, type: 'focus_minutes' },
    { id: 'focus_master', name: 'Focus Master', description: 'Complete 500 minutes of focus', icon: '🧘', target: 500, type: 'focus_minutes' },
];

// Example habit stacks
const EXAMPLE_STACKS = [
    { trigger: 'After I wake up', habit: 'Drink a glass of water', icon: '💧' },
    { trigger: 'After I brush teeth', habit: 'Do 5 min stretching', icon: '🧘' },
    { trigger: 'After I eat lunch', habit: 'Take a 10 min walk', icon: '🚶' },
    { trigger: 'After I finish work', habit: 'Journal for 5 minutes', icon: '📔' },
];

export default function Goals() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [showStackModal, setShowStackModal] = useState(false);
    const [newStack, setNewStack] = useState({ trigger: '', habit: '' });

    // Get goals from localStorage or use defaults
    const [goals, setGoals] = useState(() => {
        const stored = localStorage.getItem('habitoid-goals');
        return stored ? JSON.parse(stored) : DEFAULT_GOALS;
    });

    // Get habit stacks from localStorage
    const [stacks, setStacks] = useState<typeof EXAMPLE_STACKS>(() => {
        const stored = localStorage.getItem('habitoid-stacks');
        return stored ? JSON.parse(stored) : [];
    });

    const { data: habits = [] } = useQuery({
        queryKey: ["/api/habits"],
    });

    const { data: allLogs = [] } = useQuery({
        queryKey: ["/api/habit-logs/contribution"],
    });

    const userPoints = (user as any)?.totalPoints || 0;
    const userStreak = (user as any)?.currentStreak || 0;

    // Calculate today's progress
    const todayProgress = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = (allLogs as any[]).filter(log => log.date === today && log.completed);
        return todayLogs.length;
    }, [allLogs]);

    // Calculate this week's points (estimated from logs)
    const weeklyProgress = useMemo(() => {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];

        const weekLogs = (allLogs as any[]).filter(log => log.date >= weekStartStr && log.completed);
        return weekLogs.length * 10; // Estimate 10 points per completion
    }, [allLogs]);

    // Calculate milestone progress
    const getMilestoneProgress = (milestone: typeof MILESTONES[0]) => {
        switch (milestone.type) {
            case 'streak': return Math.min(userStreak, milestone.target);
            case 'points': return Math.min(userPoints, milestone.target);
            case 'habits_created': return Math.min((habits as any[]).length, milestone.target);
            case 'focus_minutes': return 0; // Would need to track this
            default: return 0;
        }
    };

    const updateGoal = (key: keyof typeof goals, value: number) => {
        const updated = { ...goals, [key]: value };
        setGoals(updated);
        localStorage.setItem('habitoid-goals', JSON.stringify(updated));
        toast({ title: 'Goal updated!' });
    };

    const addStack = () => {
        if (!newStack.trigger || !newStack.habit) return;
        const updated = [...stacks, { ...newStack, icon: '✨' }];
        setStacks(updated);
        localStorage.setItem('habitoid-stacks', JSON.stringify(updated));
        setNewStack({ trigger: '', habit: '' });
        setShowStackModal(false);
        toast({ title: 'Habit stack added!' });
    };

    const removeStack = (index: number) => {
        const updated = stacks.filter((_, i) => i !== index);
        setStacks(updated);
        localStorage.setItem('habitoid-stacks', JSON.stringify(updated));
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Goals & Stacking</h1>
                    <p className="font-medium" style={{ color: 'var(--muted)' }}>Set targets and build habit chains</p>
                </div>
            </div>

            {/* Daily & Weekly Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Goal */}
                <div
                    className="rounded-2xl p-6 border relative overflow-hidden"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Target size={20} style={{ color: 'var(--primary)' }} />
                        <h3 className="font-bold">Daily Goal</h3>
                    </div>

                    <div className="flex items-end gap-4 mb-4">
                        <div>
                            <p className="text-4xl font-black" style={{ color: 'var(--primary)' }}>{todayProgress}</p>
                            <p className="text-sm" style={{ color: 'var(--muted)' }}>of {goals.dailyHabits} habits</p>
                        </div>
                        <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${Math.min((todayProgress / goals.dailyHabits) * 100, 100)}%`,
                                    backgroundColor: todayProgress >= goals.dailyHabits ? '#22c55e' : 'var(--primary)'
                                }}
                            />
                        </div>
                    </div>

                    {todayProgress >= goals.dailyHabits && (
                        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#22c55e' }}>
                            <Check size={16} /> Daily goal achieved!
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Adjust goal:</p>
                        <div className="flex gap-2">
                            {[3, 5, 7, 10].map(n => (
                                <button
                                    key={n}
                                    onClick={() => updateGoal('dailyHabits', n)}
                                    className="px-3 py-1 rounded-lg text-sm font-bold transition-all"
                                    style={{
                                        backgroundColor: goals.dailyHabits === n ? 'var(--primary)' : 'var(--accent-light)',
                                        color: goals.dailyHabits === n ? 'white' : 'inherit'
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Weekly Points Goal */}
                <div
                    className="rounded-2xl p-6 border relative overflow-hidden"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Star size={20} style={{ color: '#f59e0b' }} />
                        <h3 className="font-bold">Weekly Points Goal</h3>
                    </div>

                    <div className="flex items-end gap-4 mb-4">
                        <div>
                            <p className="text-4xl font-black" style={{ color: '#f59e0b' }}>{weeklyProgress}</p>
                            <p className="text-sm" style={{ color: 'var(--muted)' }}>of {goals.weeklyPoints} XP</p>
                        </div>
                        <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${Math.min((weeklyProgress / goals.weeklyPoints) * 100, 100)}%`,
                                    backgroundColor: weeklyProgress >= goals.weeklyPoints ? '#22c55e' : '#f59e0b'
                                }}
                            />
                        </div>
                    </div>

                    {weeklyProgress >= goals.weeklyPoints && (
                        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#22c55e' }}>
                            <Trophy size={16} /> Weekly goal achieved!
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Adjust goal:</p>
                        <div className="flex gap-2">
                            {[250, 500, 750, 1000].map(n => (
                                <button
                                    key={n}
                                    onClick={() => updateGoal('weeklyPoints', n)}
                                    className="px-3 py-1 rounded-lg text-sm font-bold transition-all"
                                    style={{
                                        backgroundColor: goals.weeklyPoints === n ? '#f59e0b' : 'var(--accent-light)',
                                        color: goals.weeklyPoints === n ? 'white' : 'inherit'
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Habit Stacking */}
            <div
                className="rounded-2xl p-6 border"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Link size={20} style={{ color: 'var(--primary)' }} />
                        <h3 className="font-bold">Habit Stacking</h3>
                    </div>
                    <button
                        onClick={() => setShowStackModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm"
                        style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                        <Plus size={16} /> Add Stack
                    </button>
                </div>

                <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                    Link habits together: "After I do X, I will do Y"
                </p>

                {stacks.length === 0 ? (
                    <div className="text-center py-8">
                        <Link size={48} className="mx-auto mb-4" style={{ color: 'var(--muted)' }} />
                        <p className="font-bold mb-2">No habit stacks yet</p>
                        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                            Create chains to build automatic habits
                        </p>

                        {/* Example stacks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                            {EXAMPLE_STACKS.map((stack, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        const updated = [...stacks, stack];
                                        setStacks(updated);
                                        localStorage.setItem('habitoid-stacks', JSON.stringify(updated));
                                        toast({ title: 'Stack added!' });
                                    }}
                                    className="p-4 rounded-xl text-left border-2 border-dashed transition-all hover:border-solid"
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{stack.icon}</span>
                                        <div>
                                            <p className="text-xs" style={{ color: 'var(--muted)' }}>{stack.trigger}</p>
                                            <p className="font-medium text-sm">{stack.habit}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {stacks.map((stack, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 rounded-xl"
                                style={{ backgroundColor: 'var(--accent-light)' }}
                            >
                                <span className="text-2xl">{stack.icon}</span>
                                <div className="flex-1">
                                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{stack.trigger}</p>
                                    <div className="flex items-center gap-2">
                                        <ChevronRight size={14} style={{ color: 'var(--primary)' }} />
                                        <p className="font-bold">{stack.habit}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeStack(i)}
                                    className="text-xs px-2 py-1 rounded"
                                    style={{ color: 'var(--muted)' }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Milestones */}
            <div
                className="rounded-2xl p-6 border"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
                <div className="flex items-center gap-2 mb-6">
                    <Trophy size={20} style={{ color: '#f59e0b' }} />
                    <h3 className="font-bold">Milestones</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MILESTONES.map((milestone) => {
                        const progress = getMilestoneProgress(milestone);
                        const isComplete = progress >= milestone.target;

                        return (
                            <div
                                key={milestone.id}
                                className="p-4 rounded-xl transition-all"
                                style={{
                                    backgroundColor: isComplete ? 'rgba(34, 197, 94, 0.1)' : 'var(--accent-light)',
                                    border: isComplete ? '2px solid #22c55e' : '2px solid transparent'
                                }}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-2xl">{milestone.icon}</span>
                                    {isComplete && <Check size={18} style={{ color: '#22c55e' }} />}
                                </div>
                                <p className="font-bold text-sm mb-1">{milestone.name}</p>
                                <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{milestone.description}</p>

                                <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${Math.min((progress / milestone.target) * 100, 100)}%`,
                                            backgroundColor: isComplete ? '#22c55e' : 'var(--primary)'
                                        }}
                                    />
                                </div>
                                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                                    {progress} / {milestone.target}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Stack Modal */}
            {showStackModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setShowStackModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl p-6 shadow-xl"
                        style={{ backgroundColor: 'var(--card)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-black mb-6">Create Habit Stack</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold block mb-2">After I...</label>
                                <input
                                    type="text"
                                    placeholder="e.g., finish my morning coffee"
                                    value={newStack.trigger}
                                    onChange={(e) => setNewStack(s => ({ ...s, trigger: `After I ${e.target.value}` }))}
                                    className="w-full p-3 rounded-lg border"
                                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent-light)' }}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold block mb-2">I will...</label>
                                <input
                                    type="text"
                                    placeholder="e.g., do 5 push-ups"
                                    value={newStack.habit}
                                    onChange={(e) => setNewStack(s => ({ ...s, habit: e.target.value }))}
                                    className="w-full p-3 rounded-lg border"
                                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent-light)' }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowStackModal(false)}
                                className="flex-1 py-3 rounded-lg font-bold border"
                                style={{ borderColor: 'var(--border)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addStack}
                                className="flex-1 py-3 rounded-lg font-bold"
                                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                            >
                                Add Stack
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
