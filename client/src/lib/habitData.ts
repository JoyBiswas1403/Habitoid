// Habit Categories with colors and icons
export const HABIT_CATEGORIES = [
    { id: 'health', label: 'Health & Fitness', icon: '🏃', color: '#10b981' },
    { id: 'work', label: 'Work & Career', icon: '💼', color: '#6366f1' },
    { id: 'learning', label: 'Learning & Growth', icon: '📚', color: '#f59e0b' },
    { id: 'mindfulness', label: 'Mindfulness', icon: '🧘', color: '#8b5cf6' },
    { id: 'social', label: 'Social & Relationships', icon: '👥', color: '#ec4899' },
    { id: 'finance', label: 'Finance', icon: '💰', color: '#22c55e' },
    { id: 'creativity', label: 'Creativity', icon: '🎨', color: '#f43f5e' },
    { id: 'other', label: 'Other', icon: '📌', color: '#50A65C' },
] as const;

// Frequency options
export const FREQUENCY_OPTIONS = [
    { id: 'daily', label: 'Every Day', description: 'Complete daily' },
    { id: 'weekdays', label: 'Weekdays', description: 'Mon-Fri only' },
    { id: 'weekends', label: 'Weekends', description: 'Sat-Sun only' },
    { id: 'weekly', label: 'Weekly', description: 'Once per week' },
    { id: '3x_week', label: '3x per Week', description: 'Three times weekly' },
    { id: 'custom', label: 'Custom', description: 'Pick specific days' },
] as const;

// Pre-built habit templates
export const HABIT_TEMPLATES = {
    'morning-routine': {
        name: '🌅 Morning Routine Pack',
        description: 'Start your day right with these essential habits',
        habits: [
            { name: 'Wake up early', icon: '⏰', category: 'health', frequency: 'daily' },
            { name: 'Drink water', icon: '💧', category: 'health', frequency: 'daily' },
            { name: 'Meditate 10 min', icon: '🧘', category: 'mindfulness', frequency: 'daily' },
            { name: 'Exercise', icon: '🏃', category: 'health', frequency: 'daily' },
            { name: 'Healthy breakfast', icon: '🥗', category: 'health', frequency: 'daily' },
        ]
    },
    'fitness-starter': {
        name: '💪 Fitness Starter Pack',
        description: 'Build a consistent workout routine',
        habits: [
            { name: '10,000 steps', icon: '🚶', category: 'health', frequency: 'daily' },
            { name: 'Workout 30 min', icon: '🏋️', category: 'health', frequency: '3x_week' },
            { name: 'Stretch/Yoga', icon: '🧘', category: 'health', frequency: 'daily' },
            { name: 'No junk food', icon: '🍎', category: 'health', frequency: 'daily' },
            { name: 'Sleep 8 hours', icon: '😴', category: 'health', frequency: 'daily' },
        ]
    },
    'productivity-pro': {
        name: '📈 Productivity Pro Pack',
        description: 'Boost your work and focus',
        habits: [
            { name: 'Plan the day', icon: '📋', category: 'work', frequency: 'weekdays' },
            { name: 'Deep work 2 hours', icon: '🎯', category: 'work', frequency: 'weekdays' },
            { name: 'Inbox zero', icon: '📧', category: 'work', frequency: 'daily' },
            { name: 'Review goals', icon: '🎪', category: 'work', frequency: 'weekly' },
            { name: 'Learn something new', icon: '📚', category: 'learning', frequency: 'daily' },
        ]
    },
    'mindful-living': {
        name: '🧘 Mindful Living Pack',
        description: 'Cultivate peace and presence',
        habits: [
            { name: 'Morning meditation', icon: '🧘', category: 'mindfulness', frequency: 'daily' },
            { name: 'Gratitude journal', icon: '📝', category: 'mindfulness', frequency: 'daily' },
            { name: 'Digital detox 1 hour', icon: '📵', category: 'mindfulness', frequency: 'daily' },
            { name: 'Evening reflection', icon: '🌙', category: 'mindfulness', frequency: 'daily' },
            { name: 'Nature walk', icon: '🌳', category: 'mindfulness', frequency: '3x_week' },
        ]
    },
    'learning-machine': {
        name: '📚 Learning Machine Pack',
        description: 'Commit to continuous learning',
        habits: [
            { name: 'Read 30 min', icon: '📖', category: 'learning', frequency: 'daily' },
            { name: 'Online course 1 lesson', icon: '💻', category: 'learning', frequency: 'daily' },
            { name: 'Practice a skill', icon: '🎯', category: 'learning', frequency: 'daily' },
            { name: 'Write/Notes', icon: '✍️', category: 'learning', frequency: 'daily' },
            { name: 'Teach someone', icon: '👨‍🏫', category: 'learning', frequency: 'weekly' },
        ]
    },
    'social-butterfly': {
        name: '👥 Social Connection Pack',
        description: 'Strengthen your relationships',
        habits: [
            { name: 'Text a friend', icon: '💬', category: 'social', frequency: 'daily' },
            { name: 'Call family', icon: '📞', category: 'social', frequency: 'weekly' },
            { name: 'Random act of kindness', icon: '💝', category: 'social', frequency: 'daily' },
            { name: 'Quality time with loved ones', icon: '❤️', category: 'social', frequency: '3x_week' },
            { name: 'Meet someone new', icon: '🤝', category: 'social', frequency: 'weekly' },
        ]
    }
};

export type HabitCategory = typeof HABIT_CATEGORIES[number];
export type FrequencyOption = typeof FREQUENCY_OPTIONS[number];
export type HabitTemplate = keyof typeof HABIT_TEMPLATES;
