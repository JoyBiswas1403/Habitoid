// Browser Notification Utilities for Habitoid
// Uses the Web Notifications API (free, no backend required)

export interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: { action: string; title: string }[];
}

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
    return 'Notification' in window;
};

// Get current permission status
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
    if (!isNotificationSupported()) return 'unsupported';

    const permission = await Notification.requestPermission();
    return permission;
};

// Send a notification
export const sendNotification = (options: NotificationOptions): Notification | null => {
    if (!isNotificationSupported()) return null;
    if (Notification.permission !== 'granted') return null;

    const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
    });

    // Auto-close after 5 seconds unless requireInteraction is true
    if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
    }

    return notification;
};

// Habit reminder notification
export const sendHabitReminder = (habitName: string, habitIcon: string = '📌'): Notification | null => {
    return sendNotification({
        title: `${habitIcon} Time for: ${habitName}`,
        body: "Don't break your streak! Complete this habit now.",
        tag: `habit-reminder-${habitName}`,
    });
};

// Streak alert notification
export const sendStreakAlert = (streak: number, atRisk: boolean = false): Notification | null => {
    if (atRisk) {
        return sendNotification({
            title: '🔥 Your streak is at risk!',
            body: `You have a ${streak} day streak. Complete your habits before midnight!`,
            tag: 'streak-alert',
            requireInteraction: true,
        });
    }
    return null;
};

// Streak milestone celebration
export const sendStreakMilestone = (streak: number): Notification | null => {
    const milestones = [3, 7, 14, 21, 30, 60, 90, 100, 365];
    if (!milestones.includes(streak)) return null;

    const messages: Record<number, string> = {
        3: "3 days strong! You're building momentum! 💪",
        7: "One week streak! You're developing a real habit! 🎯",
        14: "Two weeks! This is becoming part of who you are! ⚡",
        21: "21 days - the magic habit formation number! 🌟",
        30: "One month streak! You're unstoppable! 🏆",
        60: "60 days! You've mastered consistency! 👑",
        90: "90 days - this is a lifestyle now! 🚀",
        100: "LEGENDARY 100-day streak! 🎊",
        365: "ONE YEAR STREAK! You're a habit master! 🏅",
    };

    return sendNotification({
        title: `🎉 ${streak}-Day Streak Milestone!`,
        body: messages[streak] || `Amazing ${streak}-day streak!`,
        tag: 'streak-milestone',
        requireInteraction: true,
    });
};

// Focus session complete notification
export const sendFocusComplete = (duration: number, habitName?: string): Notification | null => {
    return sendNotification({
        title: '⏱️ Focus Session Complete!',
        body: habitName
            ? `Great job! ${duration} minutes focused on ${habitName}. +${duration} XP earned!`
            : `Great job! ${duration} minutes of focused work. +${duration} XP earned!`,
        tag: 'focus-complete',
    });
};

// Daily reminder to check habits
export const sendDailyReminder = (pendingCount: number): Notification | null => {
    if (pendingCount === 0) return null;

    return sendNotification({
        title: '📋 You have habits waiting!',
        body: `${pendingCount} habit${pendingCount > 1 ? 's' : ''} to complete today. Let's go!`,
        tag: 'daily-reminder',
    });
};

// Schedule a notification for a specific time
export const scheduleNotification = (
    options: NotificationOptions,
    time: Date
): number => {
    const now = new Date();
    const delay = time.getTime() - now.getTime();

    if (delay <= 0) return 0;

    return window.setTimeout(() => {
        sendNotification(options);
    }, delay);
};

// Cancel a scheduled notification
export const cancelScheduledNotification = (timeoutId: number): void => {
    window.clearTimeout(timeoutId);
};

// Get notification settings from localStorage
export const getNotificationSettings = (): {
    enabled: boolean;
    habitReminders: boolean;
    streakAlerts: boolean;
    focusAlerts: boolean;
    dailyReminder: boolean;
    dailyReminderTime: string;
} => {
    const defaults = {
        enabled: false,
        habitReminders: true,
        streakAlerts: true,
        focusAlerts: true,
        dailyReminder: true,
        dailyReminderTime: '09:00',
    };

    const stored = localStorage.getItem('habitoid-notifications');
    if (!stored) return defaults;

    try {
        return { ...defaults, ...JSON.parse(stored) };
    } catch {
        return defaults;
    }
};

// Save notification settings to localStorage
export const saveNotificationSettings = (settings: Partial<ReturnType<typeof getNotificationSettings>>): void => {
    const current = getNotificationSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('habitoid-notifications', JSON.stringify(updated));
};
