import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Flame, Target, Timer } from 'lucide-react';
import {
    isNotificationSupported,
    getNotificationPermission,
    requestNotificationPermission,
    getNotificationSettings,
    saveNotificationSettings,
    sendNotification
} from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';

function NotificationSettings() {
    const { toast } = useToast();
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
    const [settings, setSettings] = useState(getNotificationSettings());

    useEffect(() => {
        setPermission(getNotificationPermission());
    }, []);

    const handleEnableNotifications = async () => {
        const result = await requestNotificationPermission();
        setPermission(result);

        if (result === 'granted') {
            setSettings(prev => {
                const updated = { ...prev, enabled: true };
                saveNotificationSettings(updated);
                return updated;
            });

            // Send a test notification
            sendNotification({
                title: '🎉 Notifications Enabled!',
                body: "You'll now receive reminders and alerts from Habitoid.",
            });

            toast({ title: 'Notifications enabled!' });
        } else if (result === 'denied') {
            toast({
                title: 'Notifications blocked',
                description: 'Please enable notifications in your browser settings',
                variant: 'destructive'
            });
        }
    };

    const updateSetting = (key: keyof typeof settings, value: boolean | string) => {
        setSettings(prev => {
            const updated = { ...prev, [key]: value };
            saveNotificationSettings(updated);
            return updated;
        });
    };

    if (!isNotificationSupported()) {
        return (
            <div className="rounded-xl p-4 border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent-light)' }}>
                <div className="flex items-center gap-3">
                    <BellOff size={20} style={{ color: 'var(--muted)' }} />
                    <div>
                        <p className="font-bold text-sm">Notifications not supported</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>Your browser doesn't support web notifications</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Enable Notifications */}
            {permission !== 'granted' ? (
                <button
                    onClick={handleEnableNotifications}
                    className="w-full flex items-center justify-between p-4 rounded-xl border transition-all"
                    style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--accent-light)' }}
                >
                    <div className="flex items-center gap-3">
                        <Bell size={20} style={{ color: 'var(--primary)' }} />
                        <div className="text-left">
                            <p className="font-bold text-sm">Enable Notifications</p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>Get reminders for your habits</p>
                        </div>
                    </div>
                    <div
                        className="px-3 py-1 rounded-lg text-sm font-bold"
                        style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                        Enable
                    </div>
                </button>
            ) : (
                <>
                    {/* Master Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3">
                            <Bell size={20} style={{ color: settings.enabled ? 'var(--primary)' : 'var(--muted)' }} />
                            <div>
                                <p className="font-bold text-sm">Notifications</p>
                                <p className="text-xs" style={{ color: 'var(--muted)' }}>Master toggle for all notifications</p>
                            </div>
                        </div>
                        <button
                            onClick={() => updateSetting('enabled', !settings.enabled)}
                            className="w-12 h-6 rounded-full transition-all relative"
                            style={{ backgroundColor: settings.enabled ? 'var(--primary)' : 'var(--border)' }}
                        >
                            <div
                                className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                                style={{ left: settings.enabled ? '26px' : '2px' }}
                            />
                        </button>
                    </div>

                    {settings.enabled && (
                        <>
                            {/* Habit Reminders */}
                            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--accent-light)' }}>
                                <div className="flex items-center gap-3">
                                    <Target size={18} style={{ color: 'var(--muted)' }} />
                                    <p className="font-medium text-sm">Habit Reminders</p>
                                </div>
                                <button
                                    onClick={() => updateSetting('habitReminders', !settings.habitReminders)}
                                    className="w-10 h-5 rounded-full transition-all relative"
                                    style={{ backgroundColor: settings.habitReminders ? 'var(--primary)' : 'var(--border)' }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                                        style={{ left: settings.habitReminders ? '22px' : '2px' }}
                                    />
                                </button>
                            </div>

                            {/* Streak Alerts */}
                            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--accent-light)' }}>
                                <div className="flex items-center gap-3">
                                    <Flame size={18} style={{ color: 'var(--muted)' }} />
                                    <p className="font-medium text-sm">Streak Alerts</p>
                                </div>
                                <button
                                    onClick={() => updateSetting('streakAlerts', !settings.streakAlerts)}
                                    className="w-10 h-5 rounded-full transition-all relative"
                                    style={{ backgroundColor: settings.streakAlerts ? 'var(--primary)' : 'var(--border)' }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                                        style={{ left: settings.streakAlerts ? '22px' : '2px' }}
                                    />
                                </button>
                            </div>

                            {/* Focus Alerts */}
                            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--accent-light)' }}>
                                <div className="flex items-center gap-3">
                                    <Timer size={18} style={{ color: 'var(--muted)' }} />
                                    <p className="font-medium text-sm">Focus Session Alerts</p>
                                </div>
                                <button
                                    onClick={() => updateSetting('focusAlerts', !settings.focusAlerts)}
                                    className="w-10 h-5 rounded-full transition-all relative"
                                    style={{ backgroundColor: settings.focusAlerts ? 'var(--primary)' : 'var(--border)' }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                                        style={{ left: settings.focusAlerts ? '22px' : '2px' }}
                                    />
                                </button>
                            </div>

                            {/* Daily Reminder */}
                            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--accent-light)' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Clock size={18} style={{ color: 'var(--muted)' }} />
                                        <p className="font-medium text-sm">Daily Reminder</p>
                                    </div>
                                    <button
                                        onClick={() => updateSetting('dailyReminder', !settings.dailyReminder)}
                                        className="w-10 h-5 rounded-full transition-all relative"
                                        style={{ backgroundColor: settings.dailyReminder ? 'var(--primary)' : 'var(--border)' }}
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                                            style={{ left: settings.dailyReminder ? '22px' : '2px' }}
                                        />
                                    </button>
                                </div>
                                {settings.dailyReminder && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs" style={{ color: 'var(--muted)' }}>Remind at:</span>
                                        <input
                                            type="time"
                                            value={settings.dailyReminderTime}
                                            onChange={(e) => updateSetting('dailyReminderTime', e.target.value)}
                                            className="px-2 py-1 rounded border text-sm"
                                            style={{ borderColor: 'var(--border)' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default NotificationSettings;
