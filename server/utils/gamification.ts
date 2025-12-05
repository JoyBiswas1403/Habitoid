// Server-side gamification utilities

/**
 * Get XP multiplier based on streak
 */
export function getXPMultiplier(streak: number): number {
    if (streak >= 30) return 2.0;
    if (streak >= 14) return 1.75;
    if (streak >= 7) return 1.5;
    if (streak >= 3) return 1.25;
    return 1.0;
}

/**
 * Calculate XP with multiplier
 */
export function calculateXP(basePoints: number, streak: number): number {
    const multiplier = getXPMultiplier(streak);
    return Math.round(basePoints * multiplier);
}

/**
 * Get level from total points
 */
export function calculateLevel(totalPoints: number): number {
    let level = 1;
    let pointsNeeded = 0;
    let increment = 100;

    while (pointsNeeded <= totalPoints) {
        pointsNeeded += increment;
        if (pointsNeeded <= totalPoints) {
            level++;
            increment = Math.floor(increment * 1.1);
        }
    }

    return level;
}
