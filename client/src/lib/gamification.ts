// Gamification data: Badges, XP calculations, Challenges, Slash Evolution

// ============== BADGES ==============
export const BADGES = [
    // Streak badges
    { id: 'streak_3', name: 'Getting Started', description: 'Maintain a 3-day streak', icon: '🔥', type: 'streak', requirement: 3, points: 50 },
    { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡', type: 'streak', requirement: 7, points: 100 },
    { id: 'streak_14', name: 'Fortnight Fighter', description: 'Maintain a 14-day streak', icon: '💪', type: 'streak', requirement: 14, points: 200 },
    { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🏆', type: 'streak', requirement: 30, points: 500 },
    { id: 'streak_100', name: 'Century Legend', description: 'Maintain a 100-day streak', icon: '👑', type: 'streak', requirement: 100, points: 1000 },

    // Habit count badges
    { id: 'habits_1', name: 'First Step', description: 'Create your first habit', icon: '🌱', type: 'habit_count', requirement: 1, points: 25 },
    { id: 'habits_5', name: 'Habit Builder', description: 'Create 5 habits', icon: '🏗️', type: 'habit_count', requirement: 5, points: 75 },
    { id: 'habits_10', name: 'Habit Collector', description: 'Create 10 habits', icon: '📚', type: 'habit_count', requirement: 10, points: 150 },

    // Completion badges
    { id: 'completions_10', name: 'Warmed Up', description: 'Complete 10 habits total', icon: '✅', type: 'completions', requirement: 10, points: 50 },
    { id: 'completions_50', name: 'Getting Consistent', description: 'Complete 50 habits total', icon: '🎯', type: 'completions', requirement: 50, points: 150 },
    { id: 'completions_100', name: 'Century Club', description: 'Complete 100 habits total', icon: '💯', type: 'completions', requirement: 100, points: 300 },
    { id: 'completions_500', name: 'Half Millennium', description: 'Complete 500 habits total', icon: '🌟', type: 'completions', requirement: 500, points: 750 },
    { id: 'completions_1000', name: 'Habit Master', description: 'Complete 1000 habits total', icon: '🏅', type: 'completions', requirement: 1000, points: 1500 },

    // Focus badges
    { id: 'focus_60', name: 'Focused Mind', description: 'Complete 60 minutes of focus time', icon: '🧠', type: 'focus', requirement: 60, points: 75 },
    { id: 'focus_300', name: 'Deep Worker', description: 'Complete 5 hours of focus time', icon: '⏰', type: 'focus', requirement: 300, points: 200 },
    { id: 'focus_1000', name: 'Focus Champion', description: 'Complete 16+ hours of focus time', icon: '🎖️', type: 'focus', requirement: 1000, points: 500 },

    // Points badges
    { id: 'points_100', name: 'Point Starter', description: 'Earn 100 points', icon: '💎', type: 'points', requirement: 100, points: 25 },
    { id: 'points_500', name: 'Rising Star', description: 'Earn 500 points', icon: '⭐', type: 'points', requirement: 500, points: 50 },
    { id: 'points_1000', name: 'Achiever', description: 'Earn 1000 points', icon: '🌠', type: 'points', requirement: 1000, points: 100 },
    { id: 'points_5000', name: 'Elite Status', description: 'Earn 5000 points', icon: '🎊', type: 'points', requirement: 5000, points: 250 },

    // Special badges
    { id: 'early_bird', name: 'Early Bird', description: 'Complete a habit before 7 AM', icon: '🌅', type: 'special', requirement: 1, points: 50 },
    { id: 'night_owl', name: 'Night Owl', description: 'Complete a habit after 11 PM', icon: '🦉', type: 'special', requirement: 1, points: 50 },
    { id: 'perfect_week', name: 'Perfect Week', description: 'Complete all habits for 7 days straight', icon: '💫', type: 'special', requirement: 7, points: 200 },
    { id: 'template_user', name: 'Pack Adopter', description: 'Add a habit template pack', icon: '📦', type: 'special', requirement: 1, points: 25 },
];

// ============== XP MULTIPLIERS ==============
export function getXPMultiplier(streak: number): { multiplier: number; label: string } {
    if (streak >= 30) return { multiplier: 2.0, label: '2x XP (30+ streak)' };
    if (streak >= 14) return { multiplier: 1.75, label: '1.75x XP (14+ streak)' };
    if (streak >= 7) return { multiplier: 1.5, label: '1.5x XP (7+ streak)' };
    if (streak >= 3) return { multiplier: 1.25, label: '1.25x XP (3+ streak)' };
    return { multiplier: 1.0, label: '' };
}

export function calculateXP(basePoints: number, streak: number): number {
    const { multiplier } = getXPMultiplier(streak);
    return Math.round(basePoints * multiplier);
}

// ============== WEEKLY CHALLENGES ==============
export const WEEKLY_CHALLENGES = [
    { id: 'daily_5', name: 'Consistent Champion', description: 'Complete at least 5 habits daily for 5 days', target: 5, type: 'daily_minimum', reward: 150 },
    { id: 'focus_3', name: 'Focus Master', description: 'Complete 3 focus sessions this week', target: 3, type: 'focus_sessions', reward: 100 },
    { id: 'streak_builder', name: 'Streak Builder', description: 'Increase your streak by 7 days', target: 7, type: 'streak_increase', reward: 200 },
    { id: 'perfect_day_3', name: 'Triple Perfection', description: 'Have 3 perfect days (100% completion)', target: 3, type: 'perfect_days', reward: 175 },
    { id: 'morning_routine', name: 'Early Riser', description: 'Complete 5 habits before 9 AM', target: 5, type: 'early_completions', reward: 125 },
    { id: 'variety', name: 'Category Explorer', description: 'Complete habits from 4 different categories', target: 4, type: 'category_variety', reward: 100 },
    { id: 'focus_marathon', name: 'Focus Marathon', description: 'Accumulate 2 hours of focus time', target: 120, type: 'focus_minutes', reward: 150 },
    { id: 'new_habit', name: 'Fresh Start', description: 'Create and complete a new habit', target: 1, type: 'new_habit_complete', reward: 75 },
];

export function getWeeklyChallenge(): typeof WEEKLY_CHALLENGES[number] {
    // Get a deterministic challenge based on the week number
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return WEEKLY_CHALLENGES[weekNumber % WEEKLY_CHALLENGES.length];
}

// ============== SLASH EVOLUTION ==============
export const SLASH_EVOLUTIONS = [
    { level: 1, name: 'Baby Slash', minPoints: 0, icon: '⚡', description: 'A tiny spark of potential' },
    { level: 2, name: 'Spark Slash', minPoints: 500, icon: '✨', description: 'Growing brighter every day' },
    { level: 3, name: 'Bolt Slash', minPoints: 2000, icon: '🌟', description: 'A force to be reckoned with' },
    { level: 4, name: 'Storm Slash', minPoints: 5000, icon: '⭐', description: 'Radiating unstoppable energy' },
    { level: 5, name: 'Thunder Slash', minPoints: 10000, icon: '👑', description: 'The ultimate habit master' },
];

export function getSlashEvolution(totalPoints: number): typeof SLASH_EVOLUTIONS[number] {
    // Find the highest evolution the user qualifies for
    for (let i = SLASH_EVOLUTIONS.length - 1; i >= 0; i--) {
        if (totalPoints >= SLASH_EVOLUTIONS[i].minPoints) {
            return SLASH_EVOLUTIONS[i];
        }
    }
    return SLASH_EVOLUTIONS[0];
}

export function getNextEvolution(totalPoints: number): { next: typeof SLASH_EVOLUTIONS[number] | null; progress: number } {
    const current = getSlashEvolution(totalPoints);
    const nextIndex = SLASH_EVOLUTIONS.findIndex(e => e.level === current.level) + 1;

    if (nextIndex >= SLASH_EVOLUTIONS.length) {
        return { next: null, progress: 100 };
    }

    const next = SLASH_EVOLUTIONS[nextIndex];
    const progress = Math.round(((totalPoints - current.minPoints) / (next.minPoints - current.minPoints)) * 100);

    return { next, progress: Math.min(progress, 100) };
}

// ============== LEVEL CALCULATION ==============
export function calculateLevel(totalPoints: number): number {
    // Every 100 points = 1 level, with increasing requirements
    // Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450, etc.
    let level = 1;
    let pointsNeeded = 0;
    let increment = 100;

    while (pointsNeeded <= totalPoints) {
        pointsNeeded += increment;
        if (pointsNeeded <= totalPoints) {
            level++;
            increment = Math.floor(increment * 1.1); // 10% more each level
        }
    }

    return level;
}

export function getPointsForNextLevel(totalPoints: number): { current: number; needed: number; progress: number } {
    let level = 1;
    let pointsNeeded = 0;
    let previousPoints = 0;
    let increment = 100;

    while (pointsNeeded <= totalPoints) {
        previousPoints = pointsNeeded;
        pointsNeeded += increment;
        if (pointsNeeded <= totalPoints) {
            level++;
            increment = Math.floor(increment * 1.1);
        }
    }

    const progressInLevel = totalPoints - previousPoints;
    const levelSize = pointsNeeded - previousPoints;
    const progress = Math.round((progressInLevel / levelSize) * 100);

    return { current: progressInLevel, needed: levelSize, progress };
}
