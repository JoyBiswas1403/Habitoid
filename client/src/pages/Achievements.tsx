import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { BADGES, getSlashEvolution, getNextEvolution, getXPMultiplier, getWeeklyChallenge } from "@/lib/gamification";
import { SlashCharacter } from "@/components/SlashCharacter";
import { Trophy, Lock, Zap, Target, Flame, Star } from "lucide-react";

export default function Achievements() {
    const { user } = useAuth();

    const { data: userAchievements = [] } = useQuery({
        queryKey: ["/api/user-achievements"],
    });

    const { data: habits = [] } = useQuery({
        queryKey: ["/api/habits"],
    });

    const { data: allLogs = [] } = useQuery({
        queryKey: ["/api/habit-logs/contribution"],
    });

    // User stats for badge progress
    const userStats = {
        streak: (user as any)?.currentStreak || 0,
        points: (user as any)?.totalPoints || 0,
        habitCount: (habits as any[]).length,
        completions: (allLogs as any[]).filter((l: any) => l.completed).length,
        focusMinutes: 0, // Calculate from pomodoro sessions
    };

    // Get unlocked badge IDs
    const unlockedIds = new Set((userAchievements as any[]).map((ua: any) => ua.achievementId));

    // Get Slash evolution
    const evolution = getSlashEvolution(userStats.points);
    const { next, progress } = getNextEvolution(userStats.points);

    // Get XP multiplier
    const xpMultiplier = getXPMultiplier(userStats.streak);

    // Get weekly challenge
    const weeklyChallenge = getWeeklyChallenge();

    // Calculate badge progress
    const getBadgeProgress = (badge: typeof BADGES[number]) => {
        let current = 0;
        switch (badge.type) {
            case 'streak': current = userStats.streak; break;
            case 'habit_count': current = userStats.habitCount; break;
            case 'completions': current = userStats.completions; break;
            case 'focus': current = userStats.focusMinutes; break;
            case 'points': current = userStats.points; break;
            default: current = 0;
        }
        return Math.min((current / badge.requirement) * 100, 100);
    };

    // Group badges by type
    const badgesByType = BADGES.reduce((acc, badge) => {
        if (!acc[badge.type]) acc[badge.type] = [];
        acc[badge.type].push(badge);
        return acc;
    }, {} as Record<string, typeof BADGES>);

    const typeLabels: Record<string, string> = {
        streak: '🔥 Streak Badges',
        habit_count: '🏗️ Habit Builder',
        completions: '✅ Completion Badges',
        focus: '🧠 Focus Badges',
        points: '💎 Points Badges',
        special: '⭐ Special Badges',
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Achievements</h1>
                    <p className="font-medium" style={{ color: 'var(--muted)' }}>
                        {(userAchievements as any[]).length} of {BADGES.length} badges unlocked
                    </p>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Slash Evolution Card */}
                <div
                    className="rounded-2xl p-6 border flex items-center gap-4"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <div className="w-16 h-16">
                        <SlashCharacter expression="happy" size={64} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{evolution.icon}</span>
                            <span className="font-black">{evolution.name}</span>
                        </div>
                        <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>{evolution.description}</p>
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
                </div>

                {/* XP Multiplier Card */}
                <div
                    className="rounded-2xl p-6 border"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
                            <Flame size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase" style={{ color: 'var(--muted)' }}>Current Streak</p>
                            <p className="text-2xl font-black">{userStats.streak} days</p>
                        </div>
                    </div>
                    {xpMultiplier.multiplier > 1 && (
                        <div
                            className="px-3 py-2 rounded-lg text-center font-bold text-sm"
                            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
                        >
                            {xpMultiplier.label}
                        </div>
                    )}
                </div>

                {/* Weekly Challenge Card */}
                <div
                    className="rounded-2xl p-6 text-white"
                    style={{ backgroundColor: 'var(--sidebar)' }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={20} style={{ color: 'var(--primary)' }} />
                        <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>Weekly Challenge</span>
                    </div>
                    <h3 className="font-black text-lg mb-1">{weeklyChallenge.name}</h3>
                    <p className="text-sm mb-3" style={{ color: '#9ca3af' }}>{weeklyChallenge.description}</p>
                    <div className="flex items-center gap-2">
                        <Star size={16} style={{ color: '#f59e0b' }} />
                        <span className="font-bold text-sm" style={{ color: '#f59e0b' }}>+{weeklyChallenge.reward} XP</span>
                    </div>
                </div>
            </div>

            {/* Badges Grid by Category */}
            <div className="space-y-6">
                {Object.entries(badgesByType).map(([type, badges]) => (
                    <div key={type}>
                        <h2 className="text-lg font-bold mb-4">{typeLabels[type] || type}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {badges.map((badge) => {
                                const isUnlocked = getBadgeProgress(badge) >= 100;
                                const progress = getBadgeProgress(badge);

                                return (
                                    <div
                                        key={badge.id}
                                        className="rounded-2xl p-4 border transition-all relative overflow-hidden"
                                        style={{
                                            backgroundColor: 'var(--card)',
                                            borderColor: isUnlocked ? 'var(--primary)' : 'var(--border)',
                                            opacity: isUnlocked ? 1 : 0.7
                                        }}
                                    >
                                        {/* Progress bar background */}
                                        {!isUnlocked && (
                                            <div
                                                className="absolute bottom-0 left-0 h-1 transition-all"
                                                style={{ width: `${progress}%`, backgroundColor: 'var(--primary)' }}
                                            />
                                        )}

                                        <div className="flex flex-col items-center text-center">
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2"
                                                style={{
                                                    backgroundColor: isUnlocked ? 'var(--accent-light)' : 'var(--bg)',
                                                }}
                                            >
                                                {isUnlocked ? badge.icon : <Lock size={20} style={{ color: 'var(--muted)' }} />}
                                            </div>
                                            <h3 className="font-bold text-sm">{badge.name}</h3>
                                            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                                                {badge.description}
                                            </p>
                                            <div
                                                className="mt-2 text-xs font-bold px-2 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: isUnlocked ? 'var(--primary)' : 'var(--bg)',
                                                    color: isUnlocked ? 'white' : 'var(--muted)'
                                                }}
                                            >
                                                +{badge.points} XP
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
