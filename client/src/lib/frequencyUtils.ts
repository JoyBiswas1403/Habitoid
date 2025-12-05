// Utility functions for habit frequency checking

/**
 * Check if a habit should be shown today based on its frequency
 */
export function shouldShowHabitToday(habit: {
    frequency?: string;
    frequencyConfig?: string;
}): boolean {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const frequency = habit.frequency || 'daily';

    switch (frequency) {
        case 'daily':
            return true;

        case 'weekdays':
            // Monday (1) to Friday (5)
            return dayOfWeek >= 1 && dayOfWeek <= 5;

        case 'weekends':
            // Saturday (6) and Sunday (0)
            return dayOfWeek === 0 || dayOfWeek === 6;

        case 'weekly':
            // Show on the same day each week (default: Monday)
            if (habit.frequencyConfig) {
                try {
                    const config = JSON.parse(habit.frequencyConfig);
                    return config.dayOfWeek === dayOfWeek;
                } catch {
                    return dayOfWeek === 1; // Default to Monday
                }
            }
            return dayOfWeek === 1;

        case '3x_week':
            // Monday, Wednesday, Friday by default
            if (habit.frequencyConfig) {
                try {
                    const config = JSON.parse(habit.frequencyConfig);
                    return config.days?.includes(dayOfWeek) || false;
                } catch {
                    return [1, 3, 5].includes(dayOfWeek);
                }
            }
            return [1, 3, 5].includes(dayOfWeek);

        case 'custom':
            // Check frequencyConfig for specific days
            if (habit.frequencyConfig) {
                try {
                    const config = JSON.parse(habit.frequencyConfig);
                    return config.days?.includes(dayOfWeek) || false;
                } catch {
                    return true;
                }
            }
            return true;

        default:
            return true;
    }
}

/**
 * Check if a habit should be shown on a specific date
 */
export function shouldShowHabitOnDate(habit: {
    frequency?: string;
    frequencyConfig?: string;
}, date: Date): boolean {
    const dayOfWeek = date.getDay();
    const frequency = habit.frequency || 'daily';

    switch (frequency) {
        case 'daily':
            return true;
        case 'weekdays':
            return dayOfWeek >= 1 && dayOfWeek <= 5;
        case 'weekends':
            return dayOfWeek === 0 || dayOfWeek === 6;
        case 'weekly':
            return dayOfWeek === 1;
        case '3x_week':
            return [1, 3, 5].includes(dayOfWeek);
        case 'custom':
            if (habit.frequencyConfig) {
                try {
                    const config = JSON.parse(habit.frequencyConfig);
                    return config.days?.includes(dayOfWeek) || false;
                } catch {
                    return true;
                }
            }
            return true;
        default:
            return true;
    }
}

/**
 * Get frequency label for display
 */
export function getFrequencyLabel(frequency: string): string {
    const labels: Record<string, string> = {
        daily: 'Daily',
        weekdays: 'Weekdays',
        weekends: 'Weekends',
        weekly: 'Weekly',
        '3x_week': '3x/week',
        custom: 'Custom',
    };
    return labels[frequency] || 'Daily';
}
